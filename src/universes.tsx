/** @jsx h */
/** @jsxFrag Fragment */
// deno-lint-ignore-file no-explicit-any
import { h, Fragment, VNode, html_ugly, Raw } from "./tsx.ts";
import { bibliography, Base, Env, Figure, Table, ocaml, m, M, cite, mathpar, petri, tikzcd } from './util.tsx'

export const slides: Slide[] = [
    p => <Base params={p} title>
        <h1>{TITLE}</h1>
        <p>Owen Lynch</p>
        <p>PUDDLE Seminar, May 22, 2025</p>
    </Base>,
    p => <Base params={p}>
        <h2>Overview</h2>
        <ol>
            <li>What are universes for?</li>
            <li>Universes in type theory</li>
            <li>Universes in a model of type theory</li>
            <li>GATs via the theory of signatures</li>
            <li>Presenting models of GATs</li>
        </ol>
    </Base>,
    p => <Base params={p}>
        <h2>What are universes for?</h2>
        <ul>
            <li>What if type theory... in type theory?
                <Figure src="/static/boom-mind-blown.gif" />
            </li>
            <li>Handling size issues</li>
            <li><q>Staged metaprogramming</q> (code that generates code)</li>
            <li>Formalizing type theory itself</li>
        </ul>
    </Base>,
    p => <Base params={p}>
        <h2>A note on metatheory</h2>
        <p>Our metatheory is <em>extensional Martin-Lof type theory</em> with:</p>
        <ul>
            <li>A <q>type of types</q> {m`\Set`} (ignoring levels for now)</li>
            <li>Dependent function types {m`(x \colon A) \to B\,x`}</li>
            <li>Dependent product types {m`(x \colon A) \times B\,x`}</li>
            <li>Unit type, {m`\tm{tt} \colon \top`}</li>
            <li>Implicit arguments {m`\{x \colon A\} \to B\,x`}, and sometimes even the presence of implicit arguments is implicit, as in {m`\tm{map} \colon (A \to B) \to F\,A \to F\,B`}</li>
            <li>Judgmental equality {m`a \equiv b`}</li>
            <li>Definitional equality {m`f\,x \defeq y`}</li>
            <li>Equality types {m`(- = -) \colon \{A \colon \Set\} \to A \to A \to \Set`}</li>
        </ul>
    </Base>,
    p => <Base params={p}>
        <h2>Universes in type theory</h2>
        <Env taxon="definition">
            A universe consists of a type {m`\U \colon \Set`} of <em>codes</em> along with a function {m`\El \colon \U \to \Set`}.
        </Env>
        <Env taxon="example">
            The universe of finite sets has {m`\U \defeq \N`}, {m`\El \, n \defeq \Fin \, n`}, where {m`\Fin`} is inductively defined by
            {M`\begin{align*}
            FZ &\colon \{n \colon \N\} \to \Fin \, (S \, n) \\
            FS &\colon \{n \colon \N\} \to \Fin \, n \to \Fin \, (S \, n).
            \end{align*}`}
            That is, {m`\Fin \, n \equiv \{FZ, FS\,FZ, \ldots,\mathit{FS}^{n-1}\,FZ\} \cong \{0,\ldots,n-1\}`}.
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>A concrete universe with doubles and tuple types</h2>
        <Env taxon="example">
            Let {m`\U`} be inductively defined by {m`D \colon \U`} (<q>double</q>) and {m`T \colon \List\,\U \to \U`} (<q>tuple</q>). Then we can define {m`\El`} recursively by
            {M`\begin{alignat*}{3}
            \El\,&D &&\defeq \tp{Double} \\
            \El\,&(T\,[]) &&\defeq \tp{Unit} \\
            \El\,&(T\,(t :: ts)) &&\defeq \El\,t \times \El\,(T\,ts)
            \end{alignat*}`}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Product types in a universe</h2>
        <Env taxon="definition">
            A universe {m`(\U, \El)`} is said to <strong>have product types</strong> if we have the following
            {M`\begin{align*}
            \tm{prod} &\colon (A \colon \U) \to (B \colon \U) \to \U \\
            (\tm{pair},\tm{proj}) &\colon  \El\,A \times \El\,B \cong \El\, (\tm{prod}\,A\,B) \\
            \end{align*}`}
            This presentation follows {cite(p, ['kovács-2022-type'])}; contrast the more traditional type-theoretic formulation.
            {mathpar(p, String.raw`%
            \inferrule{\Gamma \yields A \jtype \and \Gamma \vdash B \jtype}{\Gamma \vdash A \times B \jtype} \\
            \inferrule{\Gamma \yields a \colon A \and \Gamma \yields b \colon B}{\Gamma \yields (a,b) \colon A \times B} \and
            \inferrule{\Gamma \yields p \colon A \times B}{\Gamma \yields p.1 \colon A \and \Gamma \yields p.2 \colon B} \\
            \inferrule{\Gamma \yields a \colon A \and \Gamma \yields b \colon B}{\Gamma \yields (a,b).1 \equiv a \colon A \and \Gamma \yields (a,b).2 \equiv b \colon B} \and
            \inferrule{\Gamma \yields p \colon A \times B}{\Gamma \yields (p.1, p.2) \equiv p \colon A \times B}
            `)}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Dependent product types in a universe</h2>
        <Env taxon="definition">
            A universe {m`(\U, \El)`} is said to <strong>have dependent product types</strong> if we have the following
            {M`\begin{align*}
            \tm{dprod} &\colon (A \colon \U) \to (B \colon \El\,A \to \U) \to \U \\
            (\tm{dpair}, \tm{dproj}) &\colon (a \colon \El\,A) \times \El\,(B\, a) \cong \El\,(\tm{dprod}\,A\,B)
            \end{align*}`}
            Contrast the more traditional type-theoretic formulation.
            {mathpar(p, String.raw`%
            \inferrule{\Gamma \yields A \jtype \and \Gamma, x \colon A \vdash B \jtype}{\Gamma \vdash (x \colon A) \times B \jtype} \\
            \inferrule{\Gamma \yields a \colon A \and \Gamma \yields b \colon B[x \subst a]}{\Gamma \yields (a,b) \colon (x \colon A) \times B} \and
            \inferrule{\Gamma \yields p \colon A \times B}{\Gamma \yields p.1 \colon A \and \Gamma \yields p.2 \colon B[x \subst p.1]} \\
            \inferrule{\Gamma \yields a \colon A \and \Gamma \yields b \colon B[x\subst a]}{\Gamma \yields (a,b).1 \equiv a \colon A \and \Gamma \yields (a,b).2 \equiv b \colon B[x \subst a]} \and
            \inferrule{\Gamma \yields p \colon (x \colon A) \times B}{\Gamma \yields (p.1, p.2) \equiv p \colon (x \colon A) \times B}
            `)}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Multi-level type theory</h2>
        <Env taxon="definition">
            <strong>Multi-level type theory</strong> is type theory with support for working internally to one or more universes.
        </Env>
        <p>This means we can use {m`(x \colon A) \times B`} as the syntax for dependent products <em>internal to</em> a universe.</p>
        <p>Figuring out which universe a syntax is supposed to refer to can be straightforward or tricky, depending on the situation; in an ideal case this is done with some, but minimal extra annotation by the user.</p>
    </Base>,
    p => <Base params={p}>
        <h2>Application of universes: levels</h2>
        <p>In consistent proof assistants, we have for each <q>level</q> {m`i`}, a universe {m`\Set_i \colon \Set_{i+1}`}, {m`\El_i \colon \Set_i \to \Set_{i+1}`}.</p>
        <p>Typically universes are <q>Russell-style</q> which means that {m`\Set_i \subset \Set_{i+1}`} and {m`\El_i`} is the identity.</p>
        <p>Type formers are natural with respect to {m`\El_i`}.</p>
    </Base>,
    p => <Base params={p}>
        <h2>Application of universes: staged metaprogramming</h2>
        <p>Let {m`\Ty_0 \colon \Set`} and {m`\Tm_0 \colon \Ty_0 \to \Set`} be a universe with products and unit type. Then if {m`\N \colon \Set`} is a meta-level type of natural numbers, we can define</p>
        {M`\begin{align*}
        &\tp{Vec} \colon \N \to \Ty_0 \to \Ty_0 \\
        &\tp{Vec}\,0\,\_ \defeq \top \\
        &\tp{Vec}\,(S n)\,A \defeq \tm{prod}\,A\,(\tp{Vec}\,n\,A) \\\\
        &\tm{map} \colon \{n \colon \N, A\,\,B \colon \Ty_0\} \to (\Tm_0\,A \to \Tm_0\,B) \to \Tm_0\,(\tp{Vec}\,n\,A) \to \Tm_0\,(\tp{Vec}\,n\,B) \\
        &\tm{map}\,\{0\}\,\_\,\_ \defeq \tm{tt} \\
        &\tm{map}\,\{S n\}\,f\,v \defeq \tm{pair}\,(f\,a)\,(\tm{map}\,f\,as) \\
        &\quad \where\,\,(a, as) \defeq \tm{proj}\,v
        \end{align*}`}
        <p><q>Loop unrolling for compile-time-known {m`n`}</q></p>
        <p>Note that {m`\Ty_0`} need not have dependent types or even function types for this to work. See {cite(p, ['kiselyov-2014-design', 'kovács-2022-staged'])}</p>
    </Base>,
    p => <Base params={p}>
        <h2>Application of universes: module systems</h2>
        {ocaml(p,
`module type Group = sig
  type t
  val unit : t
  val mul : t -> t -> t
  val inv : t -> t
end`)}
        {M`\tm{Group} \defeq (t \colon \U) \times (unit \colon \El\,t \to \El\,t) \times (mul \colon \El\,t \to \El\,t \to \El\,t) \times (inv \colon \El\,t \to \El\,t)`}
        <p>One view on {cite(p, ['rossberg-2015-ml'])} is that it does module systems for 1ML via a universe of <q>small types</q></p>
    </Base>,
    p => <Base params={p}>
        <h2>Universes in type theory</h2>
        <ul>
            <li>Up to now, we've been working with universes in our extensional metatheory</li>
            <li>Universes also make sense in weaker type theories</li>
            <li>But what is a type theory?</li>
            <li>We will answer this by talking about models of type theory</li>
        </ul>
    </Base>,
    p => <Base params={p}>
        <h2>Category with Families</h2>
        <Env taxon="definition">
            A <strong>category with families</strong> (cwf) consists of type formers
            {M`\begin{align*}
            \Con &\colon \Set \\
            \Subst &\colon \Con \to \Con \to \Set \\
            \Ty &\colon \Con \to \Set \\
            \Tm &\colon (\Gamma \colon \Con) \to \Ty\,\Gamma \to \Set
            \end{align*}`}
            such that ({m`\Con`}, {m`\Subst`}) forms a category, {m`\Ty`} is a presheaf on ({m`\Con`}, {m`\Subst`}), and {m`\Tm`} is a <em>displayed presheaf</em> over {m`\Ty`}
            {M`\begin{align*}
            -[-] &\colon \{\Delta\;\Gamma \colon \Con\} \to \Subst\,\Delta\,\Gamma \to \Ty\,\Gamma \to \Ty\,\Delta \\
            -[-] &\colon \{\Delta\;\Gamma \colon \Con,\,A \colon \Ty\,\Gamma\} \to (\gamma \colon \Subst\,\Delta\,\Gamma) \to \Tm\,\Gamma\,A \to \Tm \,\Delta\,A[\gamma]
            \end{align*}`}
            with the following <em>comprehension structure</em>.
            {M`\begin{align*}
            (- \tri -) &\colon (\Gamma \colon \Con) \to \Ty\,\Gamma \to \Con \\
            (\pq, (-,-)) &\colon \{\Delta\;\Gamma \colon \Con,\,A \colon \Ty\,\Gamma\} \to \Subst\,\Delta\,(\Gamma \tri A) \cong (\gamma \colon \Subst\,\Delta\,\Gamma) \times (\Tm\,\Delta\,A[\gamma])
            \end{align*}`}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Cwfs as semantics for dependent type theory</h2>
        <Table>
            <thead>
                <th>Syntax</th>
                <th>Semantics</th>
            </thead>
            <tbody>
                <tr>
                    <td>{m`\Gamma \jctx`}</td>
                    <td>{m`\interp{\Gamma} \colon \Con`}</td>
                </tr>
                <tr>
                    <td>{m`\gamma \colon \Delta \To \Gamma`}</td>
                    <td>{m`\interp{\gamma} \colon \Subst\,\interp{\Delta}\,\interp{\Gamma}`}</td>
                </tr>
                <tr>
                    <td>{m`\Gamma \yields A \jtype`}</td>
                    <td>{m`\interp{A} \colon \Ty\,\interp{\Gamma}`}</td>
                </tr>
                <tr>
                    <td>{m`\Gamma \yields a \colon A`}</td>
                    <td>{m`\interp{a} \colon \Tm\,\interp{\Gamma}\,\interp{A}`}</td>
                </tr>
                <tr>
                    <td>{m`\Gamma, x \colon A \jctx`}</td>
                    <td>{m`\interp{\Gamma, x \colon A} \defeq \interp{\Gamma} \tri \interp{A} \colon \Con`}</td>
                </tr>
                <tr>
                    <td>{m`\Gamma, x \colon A \To \Gamma`}</td>
                    <td>{m`\p \defeq (\pq\,\id).1 \colon \Subst\,(\interp{\Gamma} \tri \interp{A})\,\interp{\Gamma}`}</td>
                </tr>
                <tr>
                    <td>{m`\Gamma, x \colon A \yields x \colon A`}</td>
                    <td>{m`\q \defeq (\pq\,\id).2 \colon \Tm\,(\Gamma \tri A)\,A[\p]`}</td>
                </tr>
            </tbody>
        </Table>
        <p>Note: a category with families doesn't necessarily imply <em>any</em> type formers!</p>
    </Base>,
    p => <Base params={p}>
        <h2>Natural models</h2>
        <Env taxon="definition">
            A <strong>natural model</strong> ({cite(p,['awodey-2016-natural'])}) consists of a category {m`\cat{C}`} along with presheaves {m`\Ty, \Tm \colon \cat{C}\op \to \Set`} and a <em>representable</em> natural transformation {m`u \colon \Tm \to \Ty`}. This means that for any {m`\Gamma \in \cat{C}`}, {m`A \in \Ty(\Gamma)`}, there exists a pullback square
            {tikzcd(p, String.raw`
% https://q.uiver.app/#q=WzAsNSxbMSwxLCJcXHlvbmVkYSAoXFxHYW1tYSBcXHRyaSBBKSJdLFsxLDIsIlxceW9uZWRhICBcXEdhbW1hIl0sWzIsMiwiXFxUeSJdLFsyLDEsIlxcVG0iXSxbMCwwLCJcXHlvbmVkYSBcXERlbHRhIl0sWzEsMiwiQSIsMl0sWzMsMiwidSJdLFswLDNdLFswLDFdLFswLDIsIiIsMSx7InN0eWxlIjp7Im5hbWUiOiJjb3JuZXIifX1dLFs0LDMsImEiLDAseyJjdXJ2ZSI6LTF9XSxbNCwxLCJcXGdhbW1hIiwyLHsiY3VydmUiOjF9XSxbNCwwLCIoXFxnYW1tYSwgYSkiLDFdXQ==
\begin{tikzcd}
	{\yoneda \Delta} \\
	& {\yoneda (\Gamma \tri A)} & \Tm \\
	& {\yoneda  \Gamma} & \Ty
	\arrow["{(\gamma, a)}"{description}, from=1-1, to=2-2]
	\arrow["a", curve={height=-6pt}, from=1-1, to=2-3]
	\arrow["\gamma"', curve={height=6pt}, from=1-1, to=3-2]
	\arrow[from=2-2, to=2-3]
	\arrow[from=2-2, to=3-2]
	\arrow["\lrcorner"{anchor=center, pos=0.125}, draw=none, from=2-2, to=3-3]
	\arrow["u", from=2-3, to=3-3]
	\arrow["A"', from=3-2, to=3-3]
\end{tikzcd}
            `)}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Type formers for a cwf</h2>
        <Env taxon="definition">
            A cwf is said to <strong>have dependent products</strong> if we have
            {M`\begin{align*}
            \tm{dprod} &\colon (A \colon \Ty\,\Gamma) \to (B \colon \Ty\,(\Gamma \tri A)) \to \Ty\,\Gamma \\
            (\tm{dpair},\tm{dproj}) &\colon (a \colon \Tm\,\Gamma A) \times \Tm\,\Gamma\,B[(\id,a)] \cong \Tm\,\Gamma\,(\tm{dprod}\,A\,B)
            \end{align*}`}
        </Env>
        <Env taxon="definition">
            A cwf is said to <strong>have dependent functions</strong> if we have
            {M`\begin{align*}
            \tm{fun} &\colon (A \colon \Ty\,\Gamma) \to (B \colon \Ty\,(\Gamma \tri A)) \to \Ty\,\Gamma \\
            (\tm{lam},\tm{app}) &\colon \Tm\,(\Gamma \tri A)\,B \cong \Tm\,\Gamma\,(\tm{fun}\,A\,B)
            \end{align*}`}
        </Env>
        <Env taxon="definition">
            A cwf is said to <strong>have equality types</strong> if we have
            {M`\begin{align*}
            (\tp{equal}) &\colon \{A \colon \Ty\,\Gamma\} \to \Ty\,(\Gamma \tri A \tri A) \\
            (\tm{refl},\tm{reflect}) &\colon \{a\,\,a' \colon \Tm\,\Gamma\,A\} \to (a = a') \cong \Tm\,\Gamma\,(\tp{equal}[(\id,a,a')])
            \end{align*}`}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>A universe in a cwf</h2>
        <Env taxon="definition">
            A universe internal to a cwf ({m`\Con`}, {m`\Subst`}, {m`\Ty`}, {m`\Tm`}) consists of
            {M`\begin{align*}
            \U &\colon \{\Gamma \colon \Con\} \to \Ty\,\Gamma \\
            \El &\colon \{\Gamma \colon \Con\} \to \Tm\,\Gamma\,\U \to \Ty\,\Gamma
            \end{align*}`}
        </Env>
        <Env taxon="definition">
            A universe internal to a cwf is said to <strong>have products</strong> if we have
            {M`\begin{align*}
            \tm{prod} &\colon \Tm\,\Gamma\,\U \to \Tm\,\Gamma\,\U \to \Tm\,\Gamma\,\U \\
            (\tm{pair}, \tm{proj}) &\colon \Tm\,\Gamma\,(\El\,A) \times \Tm\,\Gamma\,(\El\,B) \cong \Tm\,\Gamma\,(\El\,(\tm{prod}\,A\,B))
            \end{align*}`}
        </Env>
        <Env taxon="definition">
            A universe internal to a cwf is sait to <strong>have dependent products</strong> if we have
            {M`\begin{align*}
            \tm{dprod} &\colon (A \colon \Tm\,\Gamma\,\U) \to (B \colon \Tm\,(\Gamma \tri \El\,A)\,\U) \to \Tm\,\Gamma\,\U \\
            (\tm{dpair}, \tm{dproj}) &\colon (a \colon \Tm\,\Gamma\,(\El\,A)) \times \Tm\,\Gamma\,(\El\,B[(\id,a)]) \cong \Tm\,\Gamma\,(\tm{dprod}\,A\,B)
            \end{align*}`}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Multi-level type formers</h2>
        <Env taxon="definition">
            A cwf with a universe {m`\U`} is said to have {m`\U`}-small dependent functions if we have
            {M`\begin{align*}
            \tp{fun} &\colon (A \colon \Tm\,\Gamma\,\U) \to (B \colon \Ty\,(\Gamma \tri \El\,A)) \to \Ty\,\Gamma \\
             (\tm{lam}, \tm{app}) &\colon \Tm\,(\Gamma\tri\El\,A)\,B \cong \Tm\,\Gamma\,(\tm{fun}\,A\,B)
            \end{align*}`}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Theory of Signatures</h2>
        <Env taxon="definition">
            A model of the <strong>theory of signatures</strong> consists of a cwf with a universe {m`\U`}, such that
            <ul>
                <li>The cwf has dependent product types</li>
                <li>The cwf has extensional identity types</li>
                <li>The cwf has {m`\U`}-small dependent functions</li>
            </ul>
        </Env>
        <p>This is just enough to be a <q>module system for a dependently typed language</q>. For instance, working internally and eliding {m`\El`}</p>
        {M`\begin{align*}
        \tp{ReflGraph} \defeq (V \colon \U) \times (E \colon V \to V \to \U) \times (\mathit{refl} \colon (v \colon V) \to E\,v\,v)
        \end{align*}`}
        <Env taxon="proposition">Closed types in the theory of signatures are generalized algebraic theories.</Env>
    </Base>,
    p => <Base params={p}>
        <h2>Models of generalized algebraic theories</h2>
        <p>For any finite limit category {m`\cat{E}`} and GAT {m`T`}, there is a category of models of {m`T`} in {m`\cat{E}`}</p>
        <Env taxon="example">
            Models of {m`\tp{ReflGraph}`} in {m`\Set`} are reflexive graphs
        </Env>
        <p>Under certain conditions (for instance if {m`\cat{E}`} is a topos), the category of models has an initial object, which is called the <strong>term model</strong>. We can use this to build models.</p>
        <Env taxon="example">
            Consider the initial model {m`P`} of
            {M`(G \colon \tp{ReflGraph}) \times (x \colon G.V) \times (y \colon G.V) \times (f \colon G.E\,x\,y) \times (g \colon G.E\,y\,x)`}
            Then {m`P.G`} is the graph
            {tikzcd(p, String.raw`
% https://q.uiver.app/#q=WzAsMixbMCwwLCJ2XzEiXSxbMSwwLCJ2XzIiXSxbMCwxLCJlXzEiLDIseyJjdXJ2ZSI6MX1dLFsxLDAsImVfMiIsMix7ImN1cnZlIjoxfV0sWzAsMCwiXFxtYXRoaXR7cmVmbH1cXCwgdl8xIiwwLHsicmFkaXVzIjoxLCJhbmdsZSI6LTkwfV0sWzEsMSwiXFxtYXRoaXR7cmVmbH1cXCx2XzIiLDAseyJyYWRpdXMiOjEsImFuZ2xlIjo5MH1dXQ==
\begin{tikzcd}
	{x} & {y}
	\arrow["{\mathit{refl}\, x}", from=1-1, to=1-1, loop, in=150, out=210, distance=5mm]
	\arrow["{f}"', curve={height=6pt}, from=1-1, to=1-2]
	\arrow["{g}"', curve={height=6pt}, from=1-2, to=1-1]
	\arrow["{\mathit{refl}\,y}", from=1-2, to=1-2, loop, in=330, out=30, distance=5mm]
\end{tikzcd}`)}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Compositional presentations of models of GATs</h2>
        <p>We now assume that the theory of signatures has {m`\U`}-small dependent products and identity types</p>
        <Env taxon="proposition">
            Let {m`A \colon T \to \U`} be a small type in the context of a model of {m`\U`} and let {m`P`} be the initial model of {m`(M \colon T) \times A(M)`}. Then {m`P.M`} is a model of {m`T`}. There is a classical notion of finite presentation (a finite colimit of representable models) that coincides with the models which can be represented in this way.
        </Env>
        <Env taxon="example">
           {M`\begin{align*}
               \tp{TwoCycle} &\colon \{\mathbf{open}\,\,G \colon \tp{ReflGraph}\} \to \U \\
               \tp{TwoCycle} &\defeq \drec{ x \colon V,\;y \colon V,\;f \colon E\,x\,y,\;g \colon E\,y\,x } \\
               \tp{FigureEight} &\colon \{\mathbf{open}\,\,G \colon \tp{ReflGraph}\} \to \U \\
               \tp{FigureEight} &\defeq \drec{ c_1 \colon \tp{TwoCycle},\; c_2 \colon \tp{TwoCycle},\; e \colon c_1.y = c_2.x}
           \end{align*}`}
           {tikzcd(p, String.raw`
% https://q.uiver.app/#q=WzAsMyxbMCwwLCJjXzEueCJdLFsxLDAsImNfMS55ID0gY18yLngiXSxbMiwwLCJjXzIueSJdLFswLDEsImNfMS5mIiwwLHsiY3VydmUiOi0xfV0sWzEsMCwiY18xLmciLDAseyJjdXJ2ZSI6LTF9XSxbMSwyLCJjXzIuZiIsMCx7ImN1cnZlIjotMX1dLFsyLDEsImNfMi5nIiwwLHsiY3VydmUiOi0xfV1d
\begin{tikzcd}
	{c_1.x} & {c_1.y} & {c_2.y}
	\arrow["{c_1.f}", curve={height=-6pt}, from=1-1, to=1-2]
	\arrow["{c_1.g}", curve={height=-6pt}, from=1-2, to=1-1]
	\arrow["{c_2.f}", curve={height=-6pt}, from=1-2, to=1-3]
	\arrow["{c_2.g}", curve={height=-6pt}, from=1-3, to=1-2]
\end{tikzcd}
                   `)}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Petri nets</h2>
        <p>Add list types to the theory of signatures</p>
        {M`\tp{PetriNet} \defeq (S \colon \U) \times (T \colon \tp{List}\,S \to \tp{List}\,S \to \U)`}
        {M`\begin{align*}
            \tp{SIR} &\colon \{\mathbf{open}\,\,P \colon \tp{PetriNet}\} \to \U \\
            \tp{SIR} &\defeq \drec{ s \colon S,\; i \colon S,\; r \colon S,\; \mathit{inf} \colon T\,[s,i]\,[i,i],\; \mathit{rec} \colon T\,[i]\,[r]}
        \end{align*}`}
        {petri(p, String.raw`
               \node[place] (s) {$s$};
               \node[transition] (inf) [right of=s] {$\mathit{inf}$};
               \node[place] (i) [right of=inf] {$i$};
               \node[transition] (rec) [right of=i] {$\mathit{rec}$};
               \node[place] (r) [right of=rec] {$r$};

               \path (s) edge (inf);
               \path (i) edge (inf);
               \path (inf) edge[bend left] (i);
               \path (inf) edge[bend right] (i);

               \path (i) edge (rec);
               \path (rec) edge (r);
               `)}
    </Base>,
    p => <Base params={p}>
        <h2>Conjunctive queries</h2>
        <p>From {cite(p, ['spivak-2012-functorial'])} we know that we can represent database schema as categories, which are very simple GATs</p>
        {M`\tp{Corp} \defeq (\mathit{department} \colon \U) \times (\mathit{person} \colon \U) \times (\mathit{secretary} \colon \mathit{department} \to \mathit{person})`}
        <p>We can view {m`Q \colon (C \colon \tp{Corp}) \to \U`} as a <em>conjunctive query</em> which returns the type of its results. The initial model of {m`(C \colon \tp{Corp}) \times Q(C)`} is the initial database instance with a result for that conjunctive query.</p>
        <p>If we add sum types, we could (maybe) also model DUC queries (disjoint union of conjunctive queries)</p>
        <Env taxon="example">
            We can symmetrize a graph via DUC queries
            {M`\begin{align*}
            &\tp{Symmetrize} \colon \tp{Graph} \to \tp{Graph} \\
            &\tp{Symmetrize}\,G \defeq \drec{ V \defeq G.V,\; E\,x\,y \defeq G.E\,x\,y + G.E\,y\,x }
            \end{align*}`}
        </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Undirected wiring diagrams</h2>
        <p>We can represent undirected wiring diagrams as higher-order models</p>
        <Figure src="/static/uwd.png" style="width:400px;" />
        {M`\begin{align*}
            &X \colon \U \\
            &\tp{Span}\{x,\ldots\} \defeq \{R \colon \U, x \colon R \to X, \ldots \} \\
            &\tp{UWD} \colon \tp{Span}\{x,y\} \to \tp{Span}\{x,y,z\} \to \tp{Span}\{a,b,c,d\} \to \tp{Span}\{a,b,c,d,e\} \\
            &\tp{UWD}\,A\,B\,C \defeq \drec{ \\
            &\quad R \defeq \drec{ a \colon A.R,\; b \colon B.R,\; c \colon C.R,\; A.x\,a = B.c\,c,\;A.y\,a = C.a\,c,\;B.b\,b = C.b\,c } \\
            &\quad a\,r \defeq C.a\,r.a,\;b\,r \defeq B.z\,r.b,\ldots \\
            &}
        \end{align*}`}
    </Base>,
    p => <Base params={p}>
        <h2>Implementation</h2>
        <p>Problem: type checking for GATs is undecidable</p>
        <p>Solutions:</p>
        <ol>
            <li>Don't work in full generality, write type checkers for {m`\U`}-small types in specific GATs, or subclasses of GATs</li>
            <li>Make GATs use intensional equality types instead</li>
            <li>Egraphs??? <a href="https://github.com/ToposInstitute/emtt">github.com/ToposInstitute/emtt</a></li>
        </ol>
    </Base>,
    p => <Base params={p}>
        <h2>Conversion checking with e-graphs</h2>
        <pre>
{`neg_is_unique : [x: t, y: t, eq: x + y == zero] -> y == neg[x];
neg_is_unique = [x, y, _] ↦ {
  nx = neg[x];
  R.plus.assoc[nx, x, y];
  R.plus.unit[nx];
  R.plus.unit[y];
  R.plus.comm[nx, zero];
  R.plus.comm[y, zero];
  R.plus.isinv[x];
  R.plus.comm[x, nx];
  %dump "neg_is_unique.svg";
  @refl
};`}
        </pre>
        <Figure src="/static/neg_is_unique.svg" />
    </Base>,
    p => <Base params={p}>
        <h2>Future work: extensional propositions</h2>
        <p>In EMTT, we have a <em>monotonically increasing</em> knowledge base about equality that we use for conversion checking.</p>
        <p>Why not a monotonically increasing knowledge base for other things?</p>
        {M`\begin{align*}
        &\tp{Ancestry} \defeq (P \colon \U) \times (\mathit{parent} \colon P \to P \to \Prop) \times (\mathit{ancestor} \colon P \to P \to \Prop) \\
        &\quad \times (\_ \colon (x\,\,y \colon P) \to \mathit{parent}\;x\;y \to \mathit{ancestor}\;x\;y) \\
        &\quad \times (\_ \colon (x\,\,y\,\,z \colon P) \to \mathit{parent}\;x\;y \to \mathit{ancestor}\;y\;z \to \mathit{ancestor}\;x\;z) \\
        &\tp{AncestryDB} \colon \{\mathbf{open}\,\,A \colon \tp{Ancestry}\} \to \U \\
        &\tp{AncestryDB} \defeq \drec{ \mathit{bob} \colon P,\; \mathit{sarah} \colon P,\; \mathit{sam} \colon P,\; \_ \colon \mathit{parent}\;\mathit{bob}\;\mathit{sarah},\; \_ \colon \mathit{parent}\;\mathit{sarah}\;\mathit{sam}}
        \end{align*}`}
    </Base>,
    p => <Base params={p}>
        <h2>Future work: CatColab</h2>
        <p>Collaborative, compositional notebooks for scientific modeling</p>
        <Figure src="/static/catcolab_stock_flow.png" style="height:400px"/>
        <p>Current paradigm is <q>models of double theories</q> which are related to models of GATs</p>
        <p>Will use <q>composition via dependent record types</q> in the future</p>
    </Base>,
    p => <Base params={p}>
        <h2>Conclusion</h2>
        <p>Modern type theory is not just useful for foundations of mathematics</p>
        <p>It's also useful for:</p>
        <ul>
            <li>computer algebra</li>
            <li>databases</li>
            <li>systems programming</li>
            <li>scientific modeling domain specific languages</li>
        </ul>
    </Base>,
    p => <Base params={p}>
        <h2>Bibliography</h2>
        <div class="bibliography">
            <Raw unsafe={bibliography(p)} />
        </div>
    </Base>
]

const TITLE = "Theory and Applications of Type-Theoretic Universes"


const bibtex = `
@article{lynch-2024-gatlab,
	title = {GATlab: Modeling and Programming with Generalized Algebraic Theories},
	volume = {4},
	ISSN = {2969-2431},
	url = {http://dx.doi.org/10.46298/entics.14666},
	DOI = {10.46298/entics.14666},
	journal = {Electronic Notes in Theoretical Informatics and Computer Science},
	author = {Lynch, Owen and Brown, Kris and Fairbanks, James and Patterson, Evan},
	year = {2024},
	month = {dec}
}
@phdthesis{kovács-2022-type,
  title = {Type-Theoretic Signatures for Algebraic Theories and Inductive Types},
  author = {Kovács, András},
  school = {Eötvös Loránd University},
  year = {2022}
}
@article{kovács-2022-staged,
	title = {Staged compilation with two-level type theory},
	volume = {6},
	ISSN = {2475-1421},
	url = {http://dx.doi.org/10.1145/3547641},
	DOI = {10.1145/3547641},
	number = {ICFP},
	journal = {Proceedings of the ACM on Programming Languages},
	publisher = {Association for Computing Machinery (ACM)},
	author = {Kovács, András},
	year = {2022},
	month = {aug},
	pages = {540–569}
}
@inbook{kiselyov-2014-design,
	title = {The Design and Implementation of BER MetaOCaml: System Description},
	ISBN = {9783319071510},
	ISSN = {1611-3349},
	url = {http://dx.doi.org/10.1007/978-3-319-07151-0_6},
	DOI = {10.1007/978-3-319-07151-0_6},
	booktitle = {Functional and Logic Programming},
	publisher = {Springer International Publishing},
	author = {Kiselyov, Oleg},
	year = {2014},
	pages = {86–102}
}
@article{rossberg-2015-ml,
	title = {1ML – core and modules united (F-ing first-class modules)},
	volume = {50},
	ISSN = {1558-1160},
	url = {http://dx.doi.org/10.1145/2858949.2784738},
	DOI = {10.1145/2858949.2784738},
	number = {9},
	journal = {ACM SIGPLAN Notices},
	publisher = {Association for Computing Machinery (ACM)},
	author = {Rossberg, Andreas},
	year = {2015},
	month = {aug},
	pages = {35–47}
}
@article{awodey-2016-natural,
	title = {Natural models of homotopy type theory},
	volume = {28},
	ISSN = {1469-8072},
	url = {http://dx.doi.org/10.1017/S0960129516000268},
	DOI = {10.1017/s0960129516000268},
	number = {2},
	journal = {Mathematical Structures in Computer Science},
	publisher = {Cambridge University Press (CUP)},
	author = {Awodey, Steve},
	year = {2016},
	month = {nov},
	pages = {241–286}
}
@article{spivak-2012-functorial,
	title = {Functorial data migration},
	volume = {217},
	ISSN = {0890-5401},
	url = {http://dx.doi.org/10.1016/j.ic.2012.05.001},
	DOI = {10.1016/j.ic.2012.05.001},
	journal = {Information and Computation},
	publisher = {Elsevier BV},
	author = {Spivak, David I.},
	year = {2012},
	month = {aug},
	pages = {31–51}
}
`

export const presentation: Presentation = {
    bibtex,
    title: TITLE,
    slides
}
