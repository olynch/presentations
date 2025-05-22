import { presentation as universePresentation } from "./universes.tsx"
import { renderSlides } from "./util.tsx"
import { serveDir } from "jsr:@std/http/file-server"
import { parseArgs } from "jsr:@std/cli/parse-args";

type Options = {
    target_dir: string,
    static_dir: string,
    bundle: bool
}

async function copyDir(src: string, dest: string) {
  await Deno.mkdir(dest, { recursive: true });
  for await (const entry of Deno.readDir(src)) {
    const srcPath = `${src}/${entry.name}`;
    const destPath = `${dest}/${entry.name}`;
    if (entry.isDirectory) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile) {
      await Deno.copyFile(srcPath, destPath);
    }
  }
}

async function build(options: Options) {
    const out = `${options.target_dir}/universes`
    await Deno.mkdir(out, { recursive: true })
    if (options.bundle) {
        await Deno.remove('_built', { recursive: true })
    }
    await renderSlides(out, universePresentation)
    if (options.bundle) {
        await copyDir(options.static_dir, `${options.target_dir}/static`)
        await copyDir('_built', `${options.target_dir}/built`)
    }
}

async function serve(options: Options) {
    await Deno.serve({ port: 4242 }, (req) => {
        const url = new URL(req.url)
        console.log(url.pathname)
        if (/^\/static\//.test(url.pathname)) {
            return serveDir(req, {
                fsRoot: options.static_dir,
                urlRoot: "static"
            });
        } else if (/^\/built\//.test(url.pathname)) {
            return serveDir(req, {
                fsRoot: "_built",
                urlRoot: "built"
            });
        } else {
            return serveDir(req, {
                fsRoot: options.target_dir,
            });
        }
    }).finished;
}

async function main() {
    const flags = parseArgs(Deno.args, {
      boolean: ["build", "serve", "bundle"],
    });

    const options = {
        static_dir: 'static',
        target_dir: 'out',
        bundle: flags.bundle
    }


    if (flags.build) {
        await build(options)
    }

    if (flags.serve) {
        await serve(options)
    }
}

await main()
