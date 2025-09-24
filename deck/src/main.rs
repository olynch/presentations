use std::path::PathBuf;
use std::process::{self, exit};
use std::sync::Arc;
use std::sync::mpsc::channel;
use std::time::Duration;
use std::{fs, io, path::Path};

use axum::Router;
use axum::extract::State;
use axum::http::header;
use axum::response::IntoResponse;
use axum::response::sse::{Event, Sse};
use axum::routing::get;
use clap::*;
use futures_util::Stream;
use jotdown::Render;
use jotdown::{self, Container, Event as JotEvent};
use log::{debug, error, info};
use notify::{self, RecursiveMode};
use notify_debouncer_full::{self, new_debouncer};
use serde::Deserialize;
use std::sync::Mutex;
use tera::{Context, Tera};
use tokio::sync::broadcast::{Receiver, Sender};
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::wrappers::errors::BroadcastStreamRecvError;
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;

#[derive(Subcommand)]
enum Command {
    Build,
    Deploy,
    Serve {
        #[arg(short, long, default_value_t = 3000)]
        port: u32,
        #[arg(short, long, default_value_t = true)]
        open: bool,
    },
}

#[derive(Deserialize, Clone)]
struct Config {
    src: PathBuf,
    out: PathBuf,
    template: PathBuf,
    #[serde(rename = "static")]
    static_: PathBuf,
    deploy: String,
}

#[derive(Parser)]
struct Args {
    #[arg(long, default_value = "config.toml")]
    config: PathBuf,
    #[command(subcommand)]
    command: Command,
}

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

fn build(config: &Config) -> io::Result<()> {
    let Config {
        src,
        out: out_dir,
        template,
        static_,
        ..
    } = config;
    copy_dir_all(&static_, &out_dir.join("static"))?;
    {
        let _refresh_js = fs::File::create(out_dir.join("refresh.js"))?;
    }
    let src = fs::read_to_string(src)?;
    let mut event_iter = jotdown::Parser::new(&src).into_iter().peekable();
    let mut slides = Vec::new();
    while let Some(_) = event_iter.peek() {
        let mut slide_events = Vec::new();
        let mut attrs = None;
        while let Some(event) = event_iter.next() {
            match event {
                JotEvent::Start(Container::Section { .. }, section_attrs) => {
                    attrs = Some(section_attrs);
                }
                JotEvent::End(Container::Section { .. }) => {
                    break;
                }
                _ => slide_events.push(event),
            };
        }
        slides.push((attrs, slide_events));
    }
    let renderer = jotdown::html::Renderer::default();
    let mut tera = Tera::default();
    if let Err(e) = tera.add_template_file(template, Some("slide")) {
        return Err(io::Error::new(
            io::ErrorKind::Other,
            format!("could not load template: {e}"),
        ));
    }
    let total = slides.len();
    for (i, slide) in slides.into_iter().enumerate() {
        let out = fs::File::create(out_dir.join(format!("{}.html", i + 1)))?;
        let mut body = String::new();
        if let Err(_) = renderer.push(slide.1.into_iter(), &mut body) {
            return Err(io::Error::new(io::ErrorKind::Other, "formatter error"));
        };
        let mut context = Context::new();
        context.insert("body", &body);
        context.insert("number", &format!("{}", i + 1));
        context.insert("total", &format!("{}", total));
        let mut classes = Vec::new();
        if let Some(attrs) = slide.0 {
            for (kind, value) in attrs {
                match kind {
                    jotdown::AttributeKind::Class => classes.push(value.to_string()),
                    _ => {}
                }
            }
        }
        context.insert("classes", &format!("{}", classes.join(" ")));
        if let Err(e) = tera.render_to("slide", &context, out) {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("rendering error: {e}"),
            ));
        };
    }
    Ok(())
}

#[derive(Clone)]
pub struct ServerState {
    rx: Arc<Mutex<Receiver<Event>>>,
}

#[axum::debug_handler]
async fn sse_handler(
    State(state): State<ServerState>,
) -> Sse<impl Stream<Item = Result<Event, BroadcastStreamRecvError>>> {
    info!("new client connected");
    let rx: Receiver<Event> = state.rx.lock().unwrap().resubscribe();
    let stream = BroadcastStream::new(rx);
    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(1))
            .text("keep-alive-text"),
    )
}

async fn refresh_js_handler() -> impl IntoResponse {
    ([(header::CONTENT_TYPE, "text/javascript")], REFRESH_SRC)
}

const REFRESH_SRC: &str = include_str!("../resources/refresh.js");

async fn serve(dir: PathBuf, port: u32, open: bool, rx: Receiver<Event>) -> io::Result<()> {
    let host = format!("127.0.0.1:{port}");
    let static_files = ServeDir::new(&dir);

    let state = ServerState {
        rx: Arc::new(Mutex::new(rx)),
    };
    // Build our application with a route for static files
    let app = Router::new()
        .route("/refresh", get(sse_handler))
        .route("/refresh.js", get(refresh_js_handler))
        .fallback_service(static_files)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    // Run the server
    let listener = tokio::net::TcpListener::bind(&host).await?;

    tokio::spawn(async move {
        tokio::time::sleep(Duration::from_millis(100)).await;

        info!("serving {dir:?} at http://{host}");
        if open {
            let _ = webbrowser::open(&format!("http://{host}/1.html"));
        }
    });

    axum::serve(listener, app.into_make_service()).await?;
    Ok(())
}

fn watch(config: Config, refresh: Sender<Event>) -> io::Result<()> {
    let (tx, rx) = channel();

    let mut watcher = match new_debouncer(Duration::from_millis(20), None, tx) {
        Ok(w) => w,
        Err(e) => {
            error!("could not create watcher: {}", e);
            return Ok(());
        }
    };

    if let Err(e) = watcher.watch(&config.src, RecursiveMode::NonRecursive) {
        error!("could not watch {:?}: {}", &config.src, e)
    }

    if let Err(e) = watcher.watch(&config.template, RecursiveMode::NonRecursive) {
        error!("could not watch {:?}: {}", &config.template, e)
    }

    if let Err(e) = watcher.watch(&config.static_, RecursiveMode::Recursive) {
        error!("could not watch {:?}: {}", &config.template, e)
    }

    for res in rx {
        match res {
            Ok(es) => {
                let modified = es
                    .iter()
                    .any(|e| matches!(e.kind, notify::EventKind::Modify(_)));
                if modified {
                    build(&config)?;
                    match refresh.send(Event::default().data("refresh")) {
                        Ok(r) => {
                            debug!("sent to {:?} subscribers", r);
                            info!("Refreshing");
                        }
                        Err(e) => {
                            error!("Error sending message: {}", e);
                        }
                    };
                }
            }
            Err(e) => {
                error!("watch error: {:?}", e)
            }
        }
    }

    Ok(())
}

fn deploy(dir: &Path, dest: &str) -> io::Result<()> {
    let status = process::Command::new("rsync")
        .args(["-rutv", &format!("{}/", dir.to_string_lossy()), dest])
        .status()?;
    if !status.success() {
        match status.code() {
            Some(code) => {
                error!("rsync failed with code {}", code)
            }
            None => {
                error!("rsync killed by signal")
            }
        }
    }
    Ok(())
}

#[tokio::main]
async fn main() -> io::Result<()> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();
    let args = Args::parse();
    let config: Config = match toml::from_str(&fs::read_to_string(&args.config)?) {
        Ok(config) => config,
        Err(e) => {
            return Err(io::Error::new(
                io::ErrorKind::Other,
                format!("could not read config: {e}"),
            ));
        }
    };

    match args.command {
        Command::Build => {
            build(&config)?;
        }
        Command::Serve { port, open } => {
            build(&config)?;
            let (tx, rx) = tokio::sync::broadcast::channel(10);

            let watcher = {
                let config = config.clone();
                tokio::task::spawn_blocking(move || watch(config, tx))
            };

            let backend = tokio::spawn(serve(config.out.clone(), port, open, rx));

            tokio::select! {
                _ = backend => {}
                _ = watcher => {}
            }

            if tokio::signal::ctrl_c().await.is_ok() {
                exit(0)
            }
        }
        Command::Deploy => {
            build(&config)?;
            deploy(&config.out, &config.deploy)?;
        }
    }

    Ok(())
}
