/** @jsx h */
/** @jsxFrag Fragment */
// deno-lint-ignore-file no-explicit-any
import { Fragment, h, html_ugly, Raw, VNode } from "./tsx.ts";
import { renderToString } from "./katex.mjs";
import { createHmac } from "node:crypto";
import CSL from "./citeproc.cjs";
import { parse as bibtexParse } from "npm:astrocite-bibtex";
import { DOMParser } from "jsr:@b-fuze/deno-dom";
import { createHighlighter } from "npm:shiki@3.4.2";

export type SlideParams = {
  title: string;
  total: number;
  current: number;
  next?: number;
  prev?: number;
  toBuild: string[];
  citeproc: any;
  highlighter: any;
  cited: string[];
};

export function bibliography(p: SlideParams) {
  p.citeproc.updateItems(p.cited);
  const raw = p.citeproc.makeBibliography()[1].join("");
  return <div class="bibliography">
    <Raw unsafe={raw} />
  </div>
}

function titlecase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function Env(
  { taxon, children }: { taxon: string; children?: VNode[] },
) {
  return (
    <div class="env">
      <span class="taxon">{titlecase(taxon)}.</span>
      {children}
    </div>
  );
}

export function Proof(
  { children }: { children?: VNode[] }
) {
  return (
    <div class="proof">
      <span class="taxon">Proof.</span>
      {children}
      <span class="qed">{m`\blacksquare`}</span>
    </div>
  )
}

export function Figure({ src, ...attrs }: any) {
  return (
    <div class="figure">
      <img src={src} {...attrs} />
    </div>
  );
}

export function Table({ children }: { children?: VNode[] }) {
  return (
    <div class="table">
      <table>
        {children}
      </table>
    </div>
  );
}

export function ocaml(p: SlideParams, s: string) {
  const code = p.highlighter.codeToHtml(s, {
    lang: "ocaml",
    theme: "github-light",
  });
  return <Raw unsafe={code} />;
}

export function nargs(body: string) {
  if (/#1/.test(body)) {
    return "[1]";
  } else {
    return "";
  }
}

function createTexMacros(macros: Record<string, string>) {
  return Object.entries(macros).map((m) =>
    String.raw`\newcommand${m[0]}${nargs(m[1])}{${m[1]}}`
  ).join("\n") + String.raw`
\usepackage[utf8]{inputenc}
\DeclareFontFamily{U}{min}{}
\DeclareFontShape{U}{min}{m}{n}{<-> udmj30}{}
\newcommand\yo{\!\text{\usefont{U}{min}{m}{n}\symbol{'207}}\!}
\DeclareUnicodeCharacter{3088}{\yo}
    `;
}

const MACROS = {
  "\\defeq": ":\\equiv",
  "\\tri": "\\triangleright",
  "\\N": "\\mathbb{N}",
  "\\List": "\\tp{List}",
  "\\Fin": "\\tp{Fin}",
  "\\U": "\\tp{U}",
  "\\Prop": "\\tp{Prop}",
  "\\El": "\\tp{El}",
  "\\tp": "\\mathsf{#1}",
  "\\tm": "\\mathsf{#1}",
  "\\Set": "\\tp{Set}",
  "\\Psh": "\\mathsf{Psh}",
  "\\cat": "\\mathsf{#1}",
  "\\id": "\\mathsf{id}",
  "\\op": "^\\mathrm{op}",
  "\\yields": "\\vdash",
  "\\jtype": "\\,\\,\\mathsf{type}",
  "\\jctx": "\\,\\,\\mathsf{ctx}",
  "\\subst": "\\backslash",
  "\\Con": "\\tp{Con}",
  "\\Subst": "\\tp{Subst}",
  "\\To": "\\Rightarrow",
  "\\Ty": "\\tp{Ty}",
  "\\Tm": "\\tp{Tm}",
  "\\pq": "\\tm{pq}",
  "\\p": "\\tm{p}",
  "\\q": "\\tm{q}",
  "\\yoneda": "よ",
  "\\interp": "\\llbracket #1 \\rrbracket",
  "\\where": "\\mathbf{where}",
  "\\drec": String.raw`\{\hspace{-2pt}|\,#1\,|\hspace{-2pt}\}`,
  "\\suc": "\\mathsf{s}",
  "\\Top": "\\cat{Top}",
  "\\Meas": "\\cat{Meas}",
  "\\F": "\\mathcal{F}",
  "\\G": "\\mathcal{G}",
  "\\dd": "\\,\\mathrm{d}",
  "\\E": "\\mathbb{E}"
};

const TEX_MACROS = createTexMacros(MACROS);

export function m(strings: TemplateStringsArray) {
  const html = renderToString(String.raw(strings), {
    output: "html",
    macros: MACROS,
  });
  return (
    <span class="katex">
      <Raw unsafe={html} />
    </span>
  );
}

export function M(strings: TemplateStringsArray) {
  const html = renderToString(String.raw(strings), {
    output: "html",
    macros: MACROS,
    displayMode: true,
  });
  return (
    <div class="equation">
      <span class="katex">
        <Raw unsafe={html} />
      </span>
    </div>
  );
}

function intersperse(arr, separator) {
  if (arr.length === 0) return [];
  return arr.slice(1).reduce(
    (acc, item) => acc.concat(separator, item),
    [arr[0]],
  );
}

export function cite(p: SlideParams, ids: string[]) {
  p.cited.push(...ids);
  p.citeproc.updateItems(ids);
  return (
    <span class="citation">
      [{intersperse(ids.map((id) => citeSingle(p, id)), ", ")}]
    </span>
  );
}

function citeSingle(p: SlideParams, id: string) {
  const text = p.citeproc.makeCitationCluster([{ id }]).slice(1, -1);
  const citation =
    p.citeproc.makeBibliography({ select: [{ field: "id", value: id }] })[1][0];
  const parser = new DOMParser();
  const citationXml = parser.parseFromString(citation, "text/html");
  const citationText = citationXml.querySelector("div").innerHTML;
  return (
    <span class="tooltip">
      {text}
      <span class="tooltiptext">
        <Raw unsafe={citationText} />
      </span>
    </span>
  );
}

function sha256(s: string): string {
  return createHmac("sha256", s).digest("hex");
}

function tex(p: SlideParams, source: string) {
  const hash = sha256(source);
  p.toBuild.push(source);
  return (
    <div class="figure">
      <img src={`../built/${hash}.svg`} />
    </div>
  );
}

export function mathpar(p: SlideParams, inner: string) {
  const doc = String.raw`
    \documentclass{standalone}
    \usepackage{amsmath}
    \usepackage{mathpartir}
    ${TEX_MACROS}
    \begin{document}
    \begin{mathpar}
    ${inner}
    \end{mathpar}
    \end{document}
    `;
  return tex(p, doc);
}

export function petri(p: SlideParams, inner: string) {
  const doc = String.raw`
    \documentclass{standalone}
    \usepackage{tikz}
    \usetikzlibrary{petri, positioning}
    \begin{document}
    \begin{tikzpicture}[every transition/.style={inner sep=3pt, outer sep=3pt}, node distance=1.5cm,->, every place/.style={outer sep=3pt}]
    ${inner}
    \end{tikzpicture}
    \end{document}
    `;
  return tex(p, doc);
}

export function tikzcd(p: SlideParams, inner: string) {
  const doc = String.raw`
    \documentclass{standalone}
    \usepackage{amsmath}
    \RequirePackage{tikz-cd}
    \RequirePackage{amssymb}
    \usetikzlibrary{calc}
    \usetikzlibrary{decorations.pathmorphing}

    % A TikZ style for curved arrows of a fixed height, due to AndréC.
    \tikzset{curve/.style={settings={#1},to path={(\tikztostart)
        .. controls ($(\tikztostart)!\pv{pos}!(\tikztotarget)!\pv{height}!270:(\tikztotarget)$)
        and ($(\tikztostart)!1-\pv{pos}!(\tikztotarget)!\pv{height}!270:(\tikztotarget)$)
        .. (\tikztotarget)\tikztonodes}},
        settings/.code={\tikzset{quiver/.cd,#1}
            \def\pv##1{\pgfkeysvalueof{/tikz/quiver/##1}}},
        quiver/.cd,pos/.initial=0.35,height/.initial=0}

    % TikZ arrowhead/tail styles.
    \tikzset{tail reversed/.code={\pgfsetarrowsstart{tikzcd to}}}
    \tikzset{2tail/.code={\pgfsetarrowsstart{Implies[reversed]}}}
    \tikzset{2tail reversed/.code={\pgfsetarrowsstart{Implies}}}
    % TikZ arrow styles.
    \tikzset{no body/.style={/tikz/dash pattern=on 0 off 1mm}}
    ${TEX_MACROS}
    \begin{document}
    ${inner}
    \end{document}
    `;
  return tex(p, doc);
}

export function NavLink({ to, title }: { to?: number; title: any }) {
  if (to !== undefined) {
    return <a href={`${to}.html`}>{title}</a>;
  } else {
    return <span style="visibility:hidden">{title}</span>;
  }
}

export function Footer(params: SlideParams) {
  return (
    <footer>
      <span class="prev">
        <NavLink to={params.prev} title="prev" />
      </span>
      <span class="current">
        {`Slide ${params.current} of ${params.total}`}
      </span>
      <span class="next">
        <NavLink to={params.next} title="next" />
      </span>
    </footer>
  );
}

export function Base(
  { children, params, title }: {
    children?: VNode[];
    params: SlideParams;
    title?: boolean;
  },
) {
  return (
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{params.title}</title>
        <link href="../static/slides.css" rel="stylesheet" />
        <link href="../static/katex.css" rel="stylesheet" />
        <script type="text/javascript">
          window.PREV ={" "}
          {params.prev !== undefined ? params.prev : "undefined"}; window.NEXT =
          {" "}
          {params.next !== undefined ? params.next : "undefined"};
        </script>
        <script src="../static/slides.js" type="text/javascript" />
      </head>
      <body>
        <main class={title ? "title" : ""}>
          {children}
        </main>
        <Footer {...params} />
      </body>
    </html>
  );
}

export type Slide = (p: SlideParams) => VNode;

export type Presentation = {
  bibtex: string;
  title: string;
  slides: Slide[];
};

export async function renderSlides(dir: string, pres: Presentation) {
  const toBuild: string[] = [];
  const cited: string[] = [];
  const cslJson = bibtexParse(pres.bibtex);
  const cslJsonLookup = {};
  for (const entry of cslJson) {
    cslJsonLookup[entry.id] = entry;
  }
  const citeproc = new CSL.Engine({
    retrieveLocale: (_tag: string) =>
      Deno.readTextFileSync("resources/en-US.xml"),
    retrieveItem: (id: string) => {
      if (Object.hasOwn(cslJsonLookup, id)) {
        return cslJsonLookup[id];
      } else {
        throw `could not find ${id}`;
      }
    },
  }, Deno.readTextFileSync("resources/acm-siggraph.csl"));
  const ocaml = JSON.parse(await Deno.readTextFile("resources/ocaml.json"));
  const highlighter = await createHighlighter({
    themes: ["github-light"],
    langAlias: {
      ocaml: "OCaml",
    },
    langs: [ocaml],
  });
  for (let i = 0; i < pres.slides.length; i++) {
    const slideNode = pres.slides[i]({
      title: pres.title,
      total: pres.slides.length,
      current: i + 1,
      prev: i > 0 ? i : undefined,
      next: i < pres.slides.length - 1 ? i + 2 : undefined,
      toBuild,
      citeproc,
      highlighter,
      cited,
    });
    await Deno.writeTextFile(`${dir}/${i + 1}.html`, html_ugly(slideNode));
  }
  await buildSvgs(toBuild);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const info = await Deno.stat(path);
    return info.isFile;
  } catch (_) {
    return false;
  }
}

async function buildSvgs(toBuild: string[]) {
  Deno.mkdir("_built", { recursive: true });
  for (const source of toBuild) {
    const hash = sha256(source);
    if (!await fileExists(`_built/${hash}.svg`)) {
      const tmpdir = await Deno.makeTempDir();
      await Deno.writeTextFile(`${tmpdir}/img.tex`, source);
      await (new Deno.Command("latex", {
        args: ["-halt-on-error", "-interaction=nonstopmode", "img.tex"],
        cwd: tmpdir,
      })).spawn().status;
      await (new Deno.Command("dvisvgm", {
        args: [
          "--exact-bbox",
          "--clipjoin",
          "--font-format=woff",
          "--bbox=papersize",
          "--zoom=2.3",
          "img.dvi",
        ],
        cwd: tmpdir,
      })).spawn().status;
      await (new Deno.Command("mv", {
        args: [`${tmpdir}/img.svg`, `_built/${hash}.svg`],
      })).spawn().status;
    }
  }
}
