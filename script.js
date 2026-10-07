/* =====================================================
   REGULAR UNION ENGINE
   MAIN JAVASCRIPT LOGIC
   ===================================================== */


/* =====================================================
   GLOBAL VARIABLES
   ===================================================== */

let dfa1 = null;
let dfa2 = null;
let unionDFA = null;


/* =====================================================
   DOM ELEMENTS
   ===================================================== */

const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const loadExampleBtn = document.getElementById("loadExampleBtn");

const resultSection = document.getElementById("resultSection");
const errorBox = document.getElementById("errorBox");

const productStatesElement =
    document.getElementById("productStates");

const productCalculationElement =
    document.getElementById("productCalculation");

const parallelTable =
    document.getElementById("parallelTable");

const finalStatesElement =
    document.getElementById("finalStates");

const unionTableHead =
    document.getElementById("unionTableHead");

const unionTableBody =
    document.getElementById("unionTableBody");

const dfaDiagram =
    document.getElementById("dfaDiagram");

const simulationResult =
    document.getElementById("simulationResult");

const simulationTable =
    document.getElementById("simulationTable");

const simulationPath =
    document.getElementById("simulationPath");

const m1Result =
    document.getElementById("m1Result");

const m2Result =
    document.getElementById("m2Result");

const unionResult =
    document.getElementById("unionResult");


/* =====================================================
   HELPER FUNCTIONS
   ===================================================== */


/*
    Converts comma-separated input into an array.

    Example:
    "q0,q1,q2"

    becomes:

    ["q0", "q1", "q2"]
*/

function parseList(value) {

    return value
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);

}


/*
    Escape HTML characters.
*/

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*
    Create a unique key for product states.

    Example:

    q0 + p1

    becomes:

    q0||p1
*/

function productKey(q, p) {

    return `${q}||${p}`;

}


/*
    Display an error message.
*/

function showError(message) {

    errorBox.innerHTML = `
        <strong>⚠ Error:</strong> ${escapeHTML(message)}
    `;

    errorBox.classList.remove("hidden");

    window.scrollTo({
        top: errorBox.offsetTop - 30,
        behavior: "smooth"
    });

}


/*
    Hide error.
*/

function hideError() {

    errorBox.classList.add("hidden");

    errorBox.innerHTML = "";

}


/* =====================================================
   PARSE DFA
   ===================================================== */

function readDFA(prefix) {

    const states =
        parseList(document.getElementById(prefix + "States").value);

    const alphabet =
        parseList(document.getElementById(prefix + "Alphabet").value);

    const startState =
        document.getElementById(prefix + "Start").value.trim();

    const finalStates =
        parseList(document.getElementById(prefix + "Final").value);

    const transitionText =
        document.getElementById(prefix + "Transitions").value.trim();


    /* ---------- BASIC VALIDATION ---------- */

    if (states.length === 0) {

        throw new Error(
            `${prefix.toUpperCase()}: Please enter states.`
        );

    }


    if (alphabet.length === 0) {

        throw new Error(
            `${prefix.toUpperCase()}: Please enter alphabet.`
        );

    }


    if (!startState) {

        throw new Error(
            `${prefix.toUpperCase()}: Please enter start state.`
        );

    }


    if (finalStates.length === 0) {

        throw new Error(
            `${prefix.toUpperCase()}: Please enter at least one final state.`
        );

    }


    if (!states.includes(startState)) {

        throw new Error(
            `${prefix.toUpperCase()}: Start state "${startState}" is not present in states.`
        );

    }


    for (const finalState of finalStates) {

        if (!states.includes(finalState)) {

            throw new Error(
                `${prefix.toUpperCase()}: Final state "${finalState}" is not present in states.`
            );

        }

    }


    /* ---------- TRANSITIONS ---------- */

    if (!transitionText) {

        throw new Error(
            `${prefix.toUpperCase()}: Please enter transition rules.`
        );

    }


    const transitions = {};


    const lines =
        transitionText
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);


    for (const line of lines) {

        const parts =
            line.split(",").map(item => item.trim());


        if (parts.length !== 3) {

            throw new Error(
                `${prefix.toUpperCase()}: Invalid transition "${line}". Use: state,symbol,nextState`
            );

        }


        const [currentState, symbol, nextState] = parts;


        if (!states.includes(currentState)) {

            throw new Error(
                `${prefix.toUpperCase()}: Unknown state "${currentState}" in transition.`
            );

        }


        if (!alphabet.includes(symbol)) {

            throw new Error(
                `${prefix.toUpperCase()}: Symbol "${symbol}" is not in the alphabet.`
            );

        }


        if (!states.includes(nextState)) {

            throw new Error(
                `${prefix.toUpperCase()}: Unknown next state "${nextState}".`
            );

        }


        const key =
            `${currentState}||${symbol}`;


        if (transitions[key]) {

            throw new Error(
                `${prefix.toUpperCase()}: Duplicate transition for ${currentState} with ${symbol}.`
            );

        }


        transitions[key] = nextState;

    }


    /* ---------- CHECK COMPLETE DFA ---------- */

    for (const state of states) {

        for (const symbol of alphabet) {

            const key =
                `${state}||${symbol}`;

            if (!transitions[key]) {

                throw new Error(
                    `${prefix.toUpperCase()}: Missing transition for (${state}, ${symbol}).`
                );

            }

        }

    }


    return {
        states,
        alphabet,
        startState,
        finalStates,
        transitions
    };

}


/* =====================================================
   CHECK ALPHABETS
   ===================================================== */

function validateAlphabets() {

    const a1 = [...dfa1.alphabet].sort();
    const a2 = [...dfa2.alphabet].sort();


    if (JSON.stringify(a1) !== JSON.stringify(a2)) {

        throw new Error(
            "Both DFAs must use the same alphabet for the cross-product construction."
        );

    }

}


/* =====================================================
   GENERATE CROSS PRODUCT STATES
   ===================================================== */


/*
    Q = Q1 × Q2

    If:

    Q1 = {q0,q1}

    Q2 = {p0,p1}

    Product:

    (q0,p0)
    (q0,p1)
    (q1,p0)
    (q1,p1)
*/

function generateProductStates() {

    const productStates = [];


    for (const q of dfa1.states) {

        for (const p of dfa2.states) {

            productStates.push({
                q: q,
                p: p,
                key: productKey(q, p)
            });

        }

    }


    return productStates;

}


/* =====================================================
   GENERATE UNION DFA
   ===================================================== */

function generateUnionDFA() {

    const productStates =
        generateProductStates();


    const transitions = {};


    /*
        Parallel transition formula:

        δ((q,p),a)
        =
        (δ1(q,a), δ2(p,a))
    */

    for (const product of productStates) {

        for (const symbol of dfa1.alphabet) {

            const nextQ =
                dfa1.transitions[
                    `${product.q}||${symbol}`
                ];


            const nextP =
                dfa2.transitions[
                    `${product.p}||${symbol}`
                ];


            const nextKey =
                productKey(nextQ, nextP);


            transitions[
                `${product.key}||${symbol}`
            ] = nextKey;

        }

    }


    /*
        Union final-state rule:

        q ∈ F1 OR p ∈ F2
    */

    const finalStates =
        productStates
            .filter(product =>
                dfa1.finalStates.includes(product.q) ||
                dfa2.finalStates.includes(product.p)
            )
            .map(product => product.key);


    const startState =
        productKey(
            dfa1.startState,
            dfa2.startState
        );


    return {

        states: productStates,

        alphabet: [...dfa1.alphabet],

        startState: startState,

        finalStates: finalStates,

        transitions: transitions

    };

}


/* =====================================================
   DISPLAY PRODUCT STATES
   ===================================================== */

function displayProductStates() {

    const states =
        unionDFA.states;


    productStatesElement.innerHTML =
        states.map(state => {

            return `
                <span class="state-chip">
                    (${escapeHTML(state.q)},${escapeHTML(state.p)})
                </span>
            `;

        }).join("");


    productCalculationElement.innerHTML = `
        <strong>
            Q₁ × Q₂ = ${dfa1.states.length} × ${dfa2.states.length}
            = ${states.length} product states
        </strong>
        <br><br>
        Q = {
        ${states.map(
            s => `(${escapeHTML(s.q)},${escapeHTML(s.p)})`
        ).join(", ")}
        }
    `;

}


/* =====================================================
   DISPLAY PARALLEL TRANSITIONS
   ===================================================== */

function displayParallelTransitions() {

    let html = "";


    for (const product of unionDFA.states) {

        for (const symbol of unionDFA.alphabet) {

            const nextQ =
                dfa1.transitions[
                    `${product.q}||${symbol}`
                ];


            const nextP =
                dfa2.transitions[
                    `${product.p}||${symbol}`
                ];


            const combined =
                productKey(nextQ, nextP);


            const isFinal =
                unionDFA.finalStates.includes(combined);


            html += `
                <tr class="${isFinal ? "final-row" : ""}">

                    <td>
                        (${escapeHTML(product.q)},
                        ${escapeHTML(product.p)})
                    </td>

                    <td>
                        <strong>${escapeHTML(symbol)}</strong>
                    </td>

                    <td>
                        ${escapeHTML(product.q)}
                        →
                        ${escapeHTML(nextQ)}
                    </td>

                    <td>
                        ${escapeHTML(product.p)}
                        →
                        ${escapeHTML(nextP)}
                    </td>

                    <td class="product-transition">
                        (${escapeHTML(nextQ)},
                        ${escapeHTML(nextP)})
                    </td>

                </tr>
            `;

        }

    }


    parallelTable.innerHTML = html;

}


/* =====================================================
   DISPLAY FINAL STATES
   ===================================================== */

function displayFinalStates() {

    finalStatesElement.innerHTML =
        unionDFA.finalStates.map(key => {

            const [q, p] =
                key.split("||");


            return `
                <span class="state-chip final-chip">
                    (${escapeHTML(q)},${escapeHTML(p)}) ✓
                </span>
            `;

        }).join("");

}


/* =====================================================
   DISPLAY UNION SUMMARY
   ===================================================== */

function displayUnionSummary() {

    document.getElementById("summaryStates").textContent =
        unionDFA.states.length;


    document.getElementById("summaryAlphabet").textContent =
        `{ ${unionDFA.alphabet.join(", ")} }`;


    document.getElementById("summaryStart").textContent =
        formatProductKey(unionDFA.startState);


    document.getElementById("summaryFinal").textContent =
        unionDFA.finalStates
            .map(formatProductKey)
            .join(", ");

}


/* =====================================================
   DISPLAY UNION TRANSITION TABLE
   ===================================================== */

function displayUnionTable() {

    let head = `
        <tr>
            <th>Product State</th>
    `;


    for (const symbol of unionDFA.alphabet) {

        head += `
            <th>Input ${escapeHTML(symbol)}</th>
        `;

    }


    head += `</tr>`;


    unionTableHead.innerHTML = head;


    let body = "";


    for (const state of unionDFA.states) {

        const final =
            unionDFA.finalStates.includes(state.key);


        body += `
            <tr class="${final ? "final-row" : ""}">

                <td>
                    <strong>
                        ${formatProductKey(state.key)}
                    </strong>

                    ${final ? " ✓" : ""}
                </td>
        `;


        for (const symbol of unionDFA.alphabet) {

            const next =
                unionDFA.transitions[
                    `${state.key}||${symbol}`
                ];


            body += `
                <td>
                    ${formatProductKey(next)}
                </td>
            `;

        }


        body += `</tr>`;

    }


    unionTableBody.innerHTML = body;

}


/* =====================================================
   FORMAT PRODUCT KEY
   ===================================================== */

function formatProductKey(key) {

    const parts =
        key.split("||");


    return `(${escapeHTML(parts[0])},${escapeHTML(parts[1])})`;

}


/* =====================================================
   GENERATE SVG DFA DIAGRAM
   ===================================================== */


/*
    A simple automatically generated visual diagram.

    The diagram uses the product states as nodes.
*/

function generateDFADiagram() {

    const states =
        unionDFA.states;


    const nodeWidth = 150;
    const nodeHeight = 60;

    const horizontalGap = 70;
    const verticalGap = 90;

    const columns = 3;

    const rows =
        Math.ceil(states.length / columns);


    const width =
        columns * (nodeWidth + horizontalGap) + 100;


    const height =
        rows * (nodeHeight + verticalGap) + 120;


    let svg = `
        <svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            xmlns="http://www.w3.org/2000/svg"
        >

            <defs>

                <marker
                    id="arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                >

                    <path
                        d="M0,0 L0,6 L9,3 z"
                        fill="#64748b"
                    />

                </marker>

            </defs>
    `;


    const positions = {};


    /*
        Calculate node positions.
    */

    states.forEach((state, index) => {

        const row =
            Math.floor(index / columns);

        const column =
            index % columns;


        const x =
            50 +
            column * (nodeWidth + horizontalGap);


        const y =
            50 +
            row * (nodeHeight + verticalGap);


        positions[state.key] = {
            x: x,
            y: y,
            centerX: x + nodeWidth / 2,
            centerY: y + nodeHeight / 2
        };

    });


    /*
        Draw transitions first so that
        nodes appear above them.
    */

    const drawnEdges = new Set();


    states.forEach(state => {

        for (const symbol of unionDFA.alphabet) {

            const next =
                unionDFA.transitions[
                    `${state.key}||${symbol}`
                ];


            const edgeKey =
                `${state.key}->${next}`;


            if (drawnEdges.has(edgeKey)) {

                continue;

            }


            drawnEdges.add(edgeKey);


            const from =
                positions[state.key];


            const to =
                positions[next];


            if (!from || !to) {

                continue;

            }


            const x1 = from.centerX;
            const y1 = from.centerY;

            const x2 = to.centerX;
            const y2 = to.centerY;


            const dx = x2 - x1;
            const dy = y2 - y1;


            const distance =
                Math.sqrt(dx * dx + dy * dy);


            const offsetX =
                (dx / distance) * 65;


            const offsetY =
                (dy / distance) * 25;


            const startX =
                x1 + offsetX;


            const startY =
                y1 + offsetY;


            const endX =
                x2 - offsetX;


            const endY =
                y2 - offsetY;


            const middleX =
                (startX + endX) / 2;


            const middleY =
                (startY + endY) / 2;


            const symbols =
                unionDFA.alphabet.filter(s =>
                    unionDFA.transitions[
                        `${state.key}||${s}`
                    ] === next
                );


            svg += `
                <line
                    x1="${startX}"
                    y1="${startY}"
                    x2="${endX}"
                    y2="${endY}"
                    class="diagram-edge"
                    marker-end="url(#arrow)"
                />

                <text
                    x="${middleX}"
                    y="${middleY - 5}"
                    text-anchor="middle"
                    class="diagram-edge-label"
                >
                    ${escapeHTML(symbols.join(", "))}
                </text>
            `;

        }

    });


    /*
        Draw nodes.
    */

    states.forEach(state => {

        const position =
            positions[state.key];


        const isFinal =
            unionDFA.finalStates.includes(state.key);


        svg += `

            <rect
                x="${position.x}"
                y="${position.y}"
                width="${nodeWidth}"
                height="${nodeHeight}"
                rx="12"
                class="diagram-node ${isFinal ? "diagram-final" : ""}"
            />

            <text
                x="${position.centerX}"
                y="${position.centerY + 5}"
                text-anchor="middle"
                class="diagram-label"
            >
                ${formatProductKey(state.key)}
            </text>
        `;


        /*
            Mark start state.
        */

        if (state.key === unionDFA.startState) {

            svg += `

                <text
                    x="${position.x}"
                    y="${position.y - 12}"
                    class="diagram-label"
                >
                    START →
                </text>

            `;

        }


        /*
            Mark final state.
        */

        if (isFinal) {

            svg += `

                <text
                    x="${position.centerX}"
                    y="${position.y + nodeHeight + 18}"
                    text-anchor="middle"
                    class="diagram-label"
                >
                    FINAL
                </text>

            `;

        }

    });


    svg += `</svg>`;


    dfaDiagram.innerHTML = svg;

}


/* =====================================================
   SIMULATE STRING
   ===================================================== */

function simulateString() {

    const input =
        document.getElementById("testString")
            .value
            .trim();


    if (input.length === 0) {

        showError(
            "Please enter a string for simulation."
        );

        return;

    }


    /*
        For this application alphabet symbols
        are treated as single characters.

        Example:

        alphabet = 0,1

        string = 10101
    */

    const symbols =
        [...input];


    /*
        Check whether all characters belong
        to the alphabet.
    */

    for (const symbol of symbols) {

        if (!unionDFA.alphabet.includes(symbol)) {

            showError(
                `Input symbol "${symbol}" is not present in the DFA alphabet.`
            );

            return;

        }

    }


    hideError();


    let q =
        dfa1.startState;


    let p =
        dfa2.startState;


    const rows = [];


    /*
        Initial state.
    */

    rows.push({

        step: 0,

        symbol: "—",

        q: q,

        p: p,

        product: productKey(q, p)

    });


    /*
        Process every input symbol.
    */

    symbols.forEach((symbol, index) => {

        q =
            dfa1.transitions[
                `${q}||${symbol}`
            ];


        p =
            dfa2.transitions[
                `${p}||${symbol}`
            ];


        rows.push({

            step: index + 1,

            symbol: symbol,

            q: q,

            p: p,

            product: productKey(q, p)

        });

    });


    const finalQ =
        q;


    const finalP =
        p;


    const m1Accepted =
        dfa1.finalStates.includes(finalQ);


    const m2Accepted =
        dfa2.finalStates.includes(finalP);


    const unionAccepted =
        m1Accepted || m2Accepted;


    displaySimulationTable(rows);


    displaySimulationPath(rows);


    displaySimulationResults(
        m1Accepted,
        m2Accepted,
        unionAccepted
    );


    simulationResult.classList.remove("hidden");

}


/* =====================================================
   DISPLAY SIMULATION TABLE
   ===================================================== */

function displaySimulationTable(rows) {

    simulationTable.innerHTML =
        rows.map(row => {

            return `

                <tr>

                    <td>
                        ${row.step}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(row.symbol)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(row.q)}
                    </td>

                    <td>
                        ${escapeHTML(row.p)}
                    </td>

                    <td class="product-transition">
                        ${formatProductKey(row.product)}
                    </td>

                </tr>

            `;

        }).join("");

}


/* =====================================================
   DISPLAY SIMULATION PATH
   ===================================================== */

function displaySimulationPath(rows) {

    let html =
        "<strong>Execution Path:</strong><br><br>";


    rows.forEach((row, index) => {

        html += `
            <span class="path-state">
                ${formatProductKey(row.product)}
            </span>
        `;


        if (index < rows.length - 1) {

            html += `
                <span class="path-arrow">
                    ── ${escapeHTML(rows[index + 1].symbol)} ──→
                </span>
            `;

        }

    });


    simulationPath.innerHTML = html;

}


/* =====================================================
   DISPLAY SIMULATION RESULTS
   ===================================================== */

function displaySimulationResults(
    m1Accepted,
    m2Accepted,
    unionAccepted
) {


    m1Result.className =
        `result-box ${
            m1Accepted
                ? "accept-box"
                : "reject-box"
        }`;


    m1Result.innerHTML = `

        <div>DFA M1</div>

        <strong>
            ${m1Accepted ? "✓ ACCEPTED" : "✗ REJECTED"}
        </strong>

    `;


    m2Result.className =
        `result-box ${
            m2Accepted
                ? "accept-box"
                : "reject-box"
        }`;


    m2Result.innerHTML = `

        <div>DFA M2</div>

        <strong>
            ${m2Accepted ? "✓ ACCEPTED" : "✗ REJECTED"}
        </strong>

    `;


    unionResult.className =
        `result-box ${
            unionAccepted
                ? "accept-box"
                : "reject-box"
        }`;


    unionResult.innerHTML = `

        <div>UNION DFA</div>

        <strong>
            ${
                unionAccepted
                    ? "✓ ACCEPTED"
                    : "✗ REJECTED"
            }
        </strong>

        <br>

        <small>
            M1 OR M2
        </small>

    `;

}


/* =====================================================
   MAIN GENERATE FUNCTION
   ===================================================== */

function generate() {

    try {

        hideError();


        /*
            Read DFA M1.
        */

        dfa1 =
            readDFA("m1");


        /*
            Read DFA M2.
        */

        dfa2 =
            readDFA("m2");


        /*
            Both alphabets must match.
        */

        validateAlphabets();


        /*
            Generate cross-product DFA.
        */

        unionDFA =
            generateUnionDFA();


        /*
            Display all steps.
        */

        displayProductStates();

        displayParallelTransitions();

        displayFinalStates();

        displayUnionSummary();

        displayUnionTable();

        generateDFADiagram();


        /*
            Show result section.
        */

        resultSection.classList.remove("hidden");


        /*
            Reset simulator.
        */

        simulationResult.classList.add("hidden");

        document.getElementById("testString").value = "";


        /*
            Scroll to result.
        */

        setTimeout(() => {

            resultSection.scrollIntoView({
                behavior: "smooth"
            });

        }, 100);

    }

    catch (error) {

        resultSection.classList.add("hidden");

        showError(error.message);

    }

}


/* =====================================================
   LOAD EXAMPLE
   ===================================================== */

function loadExample() {

    /*
        DFA M1:
        Accepts strings ending in 1.
    */

    document.getElementById("m1States").value =
        "q0,q1";


    document.getElementById("m1Alphabet").value =
        "0,1";


    document.getElementById("m1Start").value =
        "q0";


    document.getElementById("m1Final").value =
        "q1";


    document.getElementById("m1Transitions").value =

`q0,0,q0
q0,1,q1
q1,0,q0
q1,1,q1`;


    /*
        DFA M2:
        Accepts strings ending in 0.
    */

    document.getElementById("m2States").value =
        "p0,p1";


    document.getElementById("m2Alphabet").value =
        "0,1";


    document.getElementById("m2Start").value =
        "p0";


    document.getElementById("m2Final").value =
        "p1";


    document.getElementById("m2Transitions").value =

`p0,0,p1
p0,1,p0
p1,0,p1
p1,1,p0`;


    hideError();


    resultSection.classList.add("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   RESET APPLICATION
   ===================================================== */

function resetApplication() {

    const inputs =
        document.querySelectorAll(
            "input, textarea"
        );


    inputs.forEach(input => {

        input.value = "";

    });


    dfa1 = null;

    dfa2 = null;

    unionDFA = null;


    resultSection.classList.add("hidden");

    simulationResult.classList.add("hidden");

    hideError();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   EVENT LISTENERS
   ===================================================== */

generateBtn.addEventListener(
    "click",
    generate
);


resetBtn.addEventListener(
    "click",
    resetApplication
);


loadExampleBtn.addEventListener(
    "click",
    loadExample
);


document.getElementById("simulateBtn")
    .addEventListener(
        "click",
        simulateString
    );


/* =====================================================
   INITIAL EXAMPLE
   ===================================================== */

loadExample();