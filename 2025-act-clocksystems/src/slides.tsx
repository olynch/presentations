/** @jsx h */
/** @jsxFrag Fragment */
// deno-lint-ignore-file no-explicit-any
import { h, Fragment, VNode, html_ugly, Raw } from "./tsx.ts";
import { type Slide, type Presentation, bibliography, Base, Env, Proof, Figure, Table, ocaml, m, M, cite, mathpar, petri, tikzcd } from './util.tsx'

export const slides: Slide[] = [
    p => <Base params={p} title={true}>
        <h1>{TITLE}</h1>
        <p><strong>Owen Lynch</strong>, David Jaz Myers, Eigil Fjeldgren Rischel, Sam Staton</p>
        <p>ACT2025</p>
    </Base>,
    p => <Base params={p}>
        <h2>Overview</h2>
        <ol>
            <li>Speedrun the basic concepts</li>
            <li>Where does this fit in larger research project?</li>
            <li>Stochastic clocks</li>
            <li>Non-deterministic clocks</li>
            <li>Future work</li>
        </ol>
    </Base>,
    p => <Base params={p}>
        <h2>Closed, deterministic clock system</h2>
        <Env taxon="definition">
            A <strong>closed, discrete, deterministic dynamical system</strong> is a set {m`X`} along with an update function {m`\varphi \colon X \to X`}.
        </Env>

        <p>For this slide, system = closed discrete deterministic dynamical system</p>

        <Env taxon="definition">
            A <strong>behavior</strong> of a system {m`(X, \varphi)`} is a sequence {m`x_1,x_2,\ldots \colon X`} such that {m`\varphi(x_i) = x_{i+1}`}.
        </Env>

        <Env taxon="definition">
            A <strong>system morphism</strong> from {m`(X,\varphi_X)`} to {m`(Y, \varphi_Y)`} is a function {m`f \colon X \to Y`} such that {m`\varphi_Y(f(x)) = f(\varphi_X(x))`} for all {m`x \colon X`}.
        </Env>

        <Env taxon="definition">
            Let {m`(\N, \suc)`} be the system with {m`\suc(n) = n+1`}.
        </Env>

        <Env taxon="proposition"> {cite(p, ['myers-2021-double'])}.
            For any system {m`(X,\varphi)`}, there is a bijection between behaviors of {m`(X,\varphi)`} and morphisms {m`(\N, \suc) \to (X,\varphi)`}.
        </Env>
    </Base>,
    p => <Base params={p}>
      <h2>Why do we care about clock systems?</h2>

      <p>In systems theory, we typically describe systems <em>intensionally</em>, by giving rules for how they evolve over time.</p>
      <p>There are many paradigms in which such rules can be given.</p>
      <p>How can we relate systems from different rule-paradigms?</p>
      <p>The answer is deriving <em>extensional</em> system descriptions--a system is the totality of ways that the system could behave {cite(p, ['willems-2007-behavioral'])}.</p>
      <p>The mapping from systems to their behaviors should be <em>functorial</em>, and the existence of clock systems makes this functor <em>representable</em> (a behavior of {m`X`} is a morphism from the clock into {m`X`}) and gives us a lot of properties for free {cite(p, ['myers-2021-double', 'myers-2023-categorical'])}.</p>
    </Base>,
    p => <Base params={p}>
        <h2>Directions for generalization</h2>

        <ul>
            <li>Move to different <q>category of spaces</q> ({m`\Top`}, {m`\Meas`}, etc.)</li>
            <li>Change {m`\phi \colon X \to X`} to {m`\phi \colon X \to M(X)`} for some monad {m`M`} (such as probability or powerset)</li>
            <li>Consider systems which transition on input {m`\phi \colon A \times X \to X`} and have an output {m`f \colon X \to B`} (open Moore machines)</li>
        </ul>

        <p>We want clock systems in the most general case: open, nondeterministic systems.</p>
    </Base>,
    p => <Base params={p}>
         <h2>Classical (closed) stochastic systems</h2>

         <Env taxon="definition">
              A closed stochastic system consists of a measurable space {m`X`} along with a stochastic kernel {m`\varphi \colon X \to \Delta(X)`}, where {m`\Delta(X)`} is the measurable space of probability measures on {m`X`}.
         </Env>

         <p>Classically, what we call the update map of a closed stochastic system is often called the <em>law</em> for a Markov process</p>

         <Env taxon="informal definition">
              A <strong>stochastic process</strong> satisfying the law {m`\varphi \colon X \to \Delta(X)`} consists of a sequence {m`x_1,x_2,\ldots`} of {m`X`}-valued random variables such that

              {M`P(-|x_i = x) = \varphi(x)`}
         </Env>

         <p>Properly elaborating the above definition involves some measure theory</p>
    </Base>,
    p => <Base params={p}>
         <h2>Measure theory review: what is a {m`\sigma`}-algebra?</h2>

         <Env taxon="definition">
              A {m`\sigma`}-algebra on a set {m`\Omega`} is a subset {m`\F \subset 2^\Omega`} such that
              <ul>
                <li>{m`\Omega,\emptyset \in \F`}</li>
                <li>{m`U \in \F`} implies {m`\Omega \setminus U \in \F`}</li>
                <li>{m`U,V \in \F`} implies {m`U \cap V \in \F`}</li>
                <li>{m`U_1,U_2,\ldots \in \F`} implies {m`\bigcup_{i \in \N} U_i \in \F`}</li>
              </ul>
         </Env>

         <p>Intution: a {m`\sigma`}-algebra represents a collection of <em>questions</em> that we are allowed to ask of an element of {m`\Omega`}</p>

         <Env taxon="example">
              If {m`\Omega = \R^2`}, then there is a {m`\sigma`}-algebra given by {M`\{\pi_1^{-1}(U) \mid U\,\text{in the Borel $\sigma$-algebra on $\R$}\}`}
              This represents <q>the questions we can ask about a point in {m`\R^2`} given we know its first component</q>
         </Env>
    </Base>,
    p => <Base params={p}>
        <h2>Measure theory review: conditional expectation</h2>

        <Env taxon="definition">
            Let {m`(\Omega, \F_\Omega, P)`} be a probability space, {m`\G`} a sub-{m`\sigma`}-algebra of {m`\F_\Omega`}, and {m`x \colon \Omega \to \R`} a {m`\F_\Omega`}-measurable function. Then {m`y \colon \Omega \to \R`} is said to be a <strong>conditional expectation</strong> with respect to {m`\G`} if {m`y`} is {m`\G`}-measurable and for all {m`U \in \G`},

            {M`\int_U y \dd P = \int_U x \dd P.`}
        </Env>

        <p>Intuition: {m`y`} is a <q>best approximation</q> of {m`x`} given the constraint of being {m`\G`}-measurable.</p>

        <p>It turns out that under some reasonable assumptions, conditional expectations exist and are unique up to {m`P`}-almost sure equality.</p>

        <Env taxon="definition">
          Suppose that {m`x \colon \Omega \to X`} is an {m`X`}-valued random variable. Then for any {m`U \in \F_X`}, we may ask for the conditional expectation of {m`1_U \circ x \colon \Omega \to \R`}. These assemble into {m`P_x(-|\G) \colon \Omega \to \Delta(X)`}, which we call the <strong>conditional probability distribution for {m`x`} given {m`\G`}</strong>.
        </Env>
    </Base>,
    p => <Base params={p}>
         <h2>Stochastic processes, correct definition</h2>

         <Env taxon="definition">
              A <strong>filtration</strong> of a measurable space {m`(\Omega, \F_\Omega)`} is a sequence {m`\F_1 \subseteq \F_2 \subseteq \cdots \subseteq \F_\Omega`} of sub-{m`\sigma`}-algebras.
         </Env>

         <Env taxon="definition">
              A sequence of random variables {m`x_1,x_2,\ldots \colon \Omega \to X`} is <strong>adapted</strong> to a filtration {m`\F_1 \subseteq \F_2 \subseteq \cdots \subseteq \F_\Omega`} if {m`x_i`} is measurable with respect to {m`\F_i`}.
         </Env>

         <p>Intuition: {m`\F_i`} represents <q>the questions we can ask at time {m`i`},</q> and {m`x_i`} must be discernable given answers to these questions.</p>

         <Env taxon="definition">
            A stochastic process {m`x_1,x_2,\ldots \colon \Omega \to X`} adapted to {m`\F_1 \subseteq F_2 \subseteq \cdots \subseteq F_\Omega`} satisfies the law {m`\varphi \colon X \to \Delta(X)`} if for all {m`i \in \N`}, {m`P`}-almost all {m`\omega \in \Omega`},

            {M`P_{x_{i+1}}(-|\F_i)(\omega) = \varphi(x_{i}(\omega)) \colon \Delta(X)`}
         </Env>
    </Base>,
    p => <Base params={p}>
      <h2>A convenient filtration</h2>

      <Env taxon="example">
      Given a measurable space {m`(\Omega, \F_\Omega)`}, we can form the countable product {m`\Omega^\N`} and put a filtration on it via
      {M`\F_i = \pi_{\{1,\ldots,i\}}^{-1}(\F_\Omega^i)`}
      where {m`\pi_{\{1,\ldots,i\}} \colon \Omega^\N \to \Omega^i`} is the projection onto the first {m`i`} components
      </Env>

      <Env taxon="proposition">
        Given a probability measure {m`P`} on {m`\Omega`}, we can turn {m`\Omega^\N`} into a probability space with {m`P^\N`}. Then the conditional probability of {m`x \colon \Omega \to X`} with respect to {m`\F_i`} is given by
        {M`P_x(-|\F_i)(\omega) = \mathbf{do}\,\,\omega'_{n+1,\ldots} \leftarrow \text{sample $P^\N$};\,\, x(\omega_{1,\ldots,n} \mathbin{++} \omega'_{n+1,\ldots})`}
      </Env>
    </Base>,
    p => <Base params={p}>
         <h2>Closed stochastic clock system</h2>

        <Env taxon="definition">
             Given a probability space {m`(\Omega, \F_\Omega, P)`}, with filtration {m`F_1 \subseteq F_2 \subseteq \cdots \subseteq F_\Omega`}, there is a closed stochastic system with state space
             {M`\tilde{\Omega} = \sum_{i \colon \N}(\Omega, \F_i)`}
             and update function given by
             {M`\varphi_{\tilde{\Omega}}((i, \omega)) = P_{1_\Omega}(-|\F_i)(\omega)`}
        </Env>

        <Env taxon="proposition">
             Measurable functions {m`\tilde{\Omega} \to X`} are in bijection with stochastic processes adapted to {m`\{\F_i\}_{i \in \N}.`}
             <Proof>By the universal property of coproduct, a measurable function {m`\tilde{\Omega} \to X`} is equivalent to a collection {m`\{x_i \colon \Omega \to X\}_{i \in \N}`} where {m`x_i`} is measurable with respect to {m`\F_i`}.
             </Proof>
        </Env>
    </Base>,
    p => <Base params={p}>
         <h2>Morphisms of stochastic systems</h2>
         <Env taxon="definition">
              A morphism of closed stochastic systems from {m`(X, \varphi_X)`} to {m`(Y, \varphi_Y)`} consists of a measurable function {m`f \colon X \to Y`} such that
              {tikzcd(p, String.raw`
              \begin{tikzcd}
              X \ar[r, "\varphi_X"] \ar[d, "f"'] & \Delta(X) \ar[d, "\Delta(f)"] \\
              Y \ar[r, "\varphi_Y"'] & \Delta(Y)
              \end{tikzcd}
              `)}
         </Env>
    </Base>,
    p => <Base params={p}>
         <h2>Morphisms out of the clock</h2>
         <Env taxon="theorem">
              The morphisms {m`(\tilde{\Omega}, \varphi_{\tilde{\Omega}}) \to (X, \varphi_X)`} are in bijection with {m`X`}-valued stochastic processes following the law {m`\varphi_X`}.
              <Proof>We must show that the diagram
              {tikzcd(p, String.raw`
              \begin{tikzcd}
              \tilde{\Omega} \ar[r, "\varphi_{\tilde{\Omega}}"] \ar[d, "x"'] & \Delta(\tilde{\Omega}) \ar[d, "\Delta(x)"] \\
              X \ar[r, "\varphi_X"'] & \Delta(X)
              \end{tikzcd}
              `)}
              is equivalent to the stochastic process {m`x_1,x_2,\ldots`} following the law {m`\varphi_X`}, e.g.
              {M`P_{x_{i+1}}(-|\F_i)(\omega) = \varphi(x_{i}(\omega)) \colon \Delta(X).`}
              The RHS of this is the bottom left path in the diagram. The LHS is equal to the top right, because
              {M`P_{x_{i+1}}(-|\F_i)(\omega) = \Delta(x_{i+1}) \circ P_{1_{\Omega}}(-|\F_i)(\omega) = \Delta(x) \circ \varphi_{\tilde{\Omega}}`}
              We are done.
              </Proof>
         </Env>
    </Base>,
    p => <Base params={p}>
      <h2>Stochastic Moore machines (low-brow version)</h2>

      <Env taxon="definition">
        An <strong>interface</strong> for an open stochastic system consists of a pair {m`(A,B)`} of measurable spaces, which we write as {m`A \choose B`}
      </Env>

      <Env taxon="definition">
        An open stochastic system on an interface {m`A \choose B`} consists of a measurable space {m`X`}, an update function {m`\varphi \colon A \times X \to \Delta(X)`}, and an output function {m`r \colon X \to B`}.
      </Env>

      <Env taxon="definition">
        A morphism of open stochastic systems from {m`(A_1,B_1,X_1,\phi_1,r_1)`} to {m`(A_2,B_2,X_2,\phi_2,r_2)`} consists
        {M`\begin{align*}
        x &\colon X_1 \to X_2 \\
        b &\colon B_1 \to B_2 \\
        a &\colon A_1 \times B_1 \to A_2
        \end{align*}`}
      {tikzcd(p, String.raw`
      \begin{tikzcd}
      X_1 \ar[r,"r_1"] \ar[d,"x"'] & B_1 \ar[d,"b"] & & X_1 \times A_1 \ar[r, "\varphi_1"] \ar[d, "x \times a"'] & \Delta(X_1) \ar[d, "\Delta(x)"] \\
      X_2 \ar[r,"r_1"'] & B_2 & & X_2 \times A_2 \ar[r, "\varphi_2"'] & \Delta(X_2)
      \end{tikzcd}
      `)}
      </Env>
    </Base>,
    p => <Base params={p}>
      <h2>Stochastic Moore machines (high-brow version)</h2>

      <Env taxon="definition"> {cite(p, ['myers-2023-categorical'])}.
        An open stochastic system is a <em>stochastic lens</em>
        {tikzcd(p, String.raw`
        \begin{tikzcd}
        {X \choose X} \ar[r, shift right, "r"'] & {A \choose B} \ar[l, shift right, "\varphi"']
        \end{tikzcd}
        `)}
      </Env>

      <Env taxon="definition"> {cite(p, ['myers-2023-categorical'])}.
        A morphism of open stochastic systems is a lens-chart square
        {tikzcd(p, String.raw`
        \begin{tikzcd}
        {X_1 \choose X_1} \ar[r, shift right] \ar[d, shift right] \ar[d, shift left] & {A_1 \choose B_1} \ar[l, shift right] \ar[d, shift right] \ar[d, shift left] \\
        {X_2 \choose X_2} \ar[r, shift right] & {A_2 \choose B_2} \ar[l, shift right]
        \end{tikzcd}
        `)}
      </Env>
    </Base>,
    p => <Base params={p}>
      <h2>The open stochastic clock</h2>

      <Env taxon="definition">
        Let the <strong>open stochastic clock</strong> for a probability space {m`(\Omega, \F_\Omega, P)`} and filtration {m`\{\F_i\}_{i \in \N}`} be the stochastic Moore machine with interface {m`1 \choose \tilde{\Omega}`}, state space {m`\tilde{\Omega}`}, output {m`r \colon \tilde{\Omega} \to \tilde{\Omega}`} given by the identiy, and update {m`\varphi_{\tilde{\Omega}} \colon \tilde{\Omega} \times 1 \to \tilde{\Omega}`} as before.
      </Env>

      <p>A <q>behavior</q> of a open stochastic Moore machine {m`(A,B,X,r,\varphi)`} may now be defined to be a morphism out of this clock, which can be shown to be equivalent to:
      </p>

      <ul>
        <li>a {m`\{F_i\}_{i \in \N}`}-adapted sequence {m`a_1,a_2,\ldots`} of {m`A`}-valued random variables</li>
        <li>a {m`\{F_i\}_{i \in \N}`}-adapted sequence {m`b_1,b_2,\ldots`} of {m`B`}-valued random variables</li>
        <li>a {m`\{F_i\}_{i \in \N}`}-adapted sequence {m`x_1,x_2,\ldots`} of {m`X`}-valued random variables</li>
      </ul>

      <p>such that</p>

      {M`\begin{align*}
      r(x_i(\omega)) &= b_i(\omega) \\
      P_{x_{i+1}}(-|\F_i) &= \varphi(x_i, a_i).
      \end{align*}`}
    </Base>,
    p => <Base params={p}>
      <h2>Non-deterministic clock system</h2>

      <p>Nondeterministic Moore machines are given by replacing all uses of probability distributions in the above with powerset.</p>

      <p>Given a set {m`\Omega`}, we can form a non-deterministic clock system with state space {m`\sum_{i \colon \N}\Omega^\N`}, with update given by <q>non-deterministically</q> resampling the {m`i+1,\ldots`} coordinates as before</p>
    </Base>,
    p => <Base params={p}>
      <h2>Future work</h2>

      <ul class="spaced">
      <li>Investigating the variation of behaviors in the probability space to form a sheaf {cite(p, ['simpson-2017-probability'])}</li>
      <li>Continuous-time stochastic dynamical systems</li>
      <li>Combining non-determinism and stochasticity</li>
      </ul>
    </Base>,
    p => <Base params={p}>
      <h2>Bibliography</h2>
      {bibliography(p)}
    </Base>
]

const backbench = [
    <Env taxon="example">
        Let {m`\Omega = \{-1,1\}^2`}, and {m`\F_\Omega`} be the powerset {m`\sigma`}-algebra. Let {m`P`} be the probability distribution given by flipping a fair coin with result {m`c_1 \colon \{-1, 1\}`}, and then flipping a biased coin {m`c_2 \colon \{-1, 1\}`} with bias {m`0.5 + 0.25c_1`}.
    </Env>
]

const TITLE = "Clock Systems in Stochastic System Theory"

const bibtex = `
@article{myers-2021-double,
	title = {Double Categories of Open Dynamical Systems (Extended Abstract)},
	volume = {333},
	ISSN = {2075-2180},
	url = {http://dx.doi.org/10.4204/EPTCS.333.11},
	DOI = {10.4204/eptcs.333.11},
	journal = {Electronic Proceedings in Theoretical Computer Science},
	publisher = {Open Publishing Association},
	author = {Myers, David Jaz},
	year = {2021},
	month = {feb},
	pages = {154–167}
}

@article{willems-2007-behavioral,
	title = {The Behavioral Approach to Open and Interconnected Systems}
	author = {Willems, Jan}
	volume = {27},
	ISSN = {1941-000X},
	url = {http://dx.doi.org/10.1109/MCS.2007.906923},
	DOI = {10.1109/mcs.2007.906923},
	number = {6},
	journal = {IEEE Control Systems},
	publisher = {Institute of Electrical and Electronics Engineers (IEEE)},
	year = {2007},
	month = {dec},
	pages = {46–99}
}

@misc{myers-2023-categorical,
	url = {http://davidjaz.com/Papers/DynamicalBook.pdf},
	author = {Myers, David Jaz},
	title = {Categorical Systems Theory},
	year = {2023},
}

@inproceedings{simpson-2017-probability,
	doi = {10.4230/LIPICS.CALCO.2017.1},
	url = {https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.CALCO.2017.1},
	author = {Simpson, Alex},
	keywords = {Random variable, conditional independence, category theory, sheaves, Giry monad},
	language = {en},
	title = {Probability Sheaves and the Giry Monad},
	publisher = {Schloss Dagstuhl – Leibniz-Zentrum für Informatik},
	year = {2017},
	copyright = {Creative Commons Attribution 3.0 Unported license}
}
`

export const presentation: Presentation = {
    bibtex,
    title: TITLE,
    slides
}
