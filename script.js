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

// ================= DFA PROBLEM TYPE =================

// ================= MIXED DFA PROBLEM TYPES =================

const dfa1ProblemType =
    document.getElementById("dfa1ProblemType");

const dfa2ProblemType =
    document.getElementById("dfa2ProblemType");

const dfa1ProblemInput =
    document.getElementById("dfa1ProblemInput");

const dfa2ProblemInput =
    document.getElementById("dfa2ProblemInput");

const dfa1ProblemHelp =
    document.getElementById("dfa1ProblemHelp");

const dfa2ProblemHelp =
    document.getElementById("dfa2ProblemHelp");


function setupProblemInput(typeSelect, input, help, useDefault = false) {

    const type = typeSelect.value;

    if (type === "") {

        input.value = "";
        input.placeholder = "Select a problem type first";
        help.textContent = "";

        return;
    }

    const defaults = {
        "decimal-divisible": {
            value: "3",
            placeholder: "Example: 3",
            help: "Enter the decimal divisor."
        },
        "binary-divisible": {
            value: "2",
            placeholder: "Example: 2",
            help: "Enter the divisor for binary numbers."
        },
        "starts-with": {
            value: "10",
            placeholder: "Example: 10",
            help: "Enter the starting string."
        },
        "ends-with": {
            value: "01",
            placeholder: "Example: 01",
            help: "Enter the ending string."
        },
        "substring": {
            value: "101",
            placeholder: "Example: 101",
            help: "Enter the substring."
        },
        "even-odd": {
            value: "Even number of 1s",
            placeholder: "Example: Even number of 1s",
            help: "Enter the condition, e.g. Even number of 1s or Odd number of 1s."
        }
    };

    const config = defaults[type];

    if (!config) {
        input.value = "";
        input.placeholder = "Select a problem type first";
        help.textContent = "";
        return;
    }

    if (useDefault || !input.value.trim()) {
        input.value = config.value;
    }

    input.placeholder = config.placeholder;
    help.textContent = config.help;

}


if (dfa1ProblemType) {

    dfa1ProblemType.addEventListener("change", function () {

        setupProblemInput(
            dfa1ProblemType,
            dfa1ProblemInput,
            dfa1ProblemHelp,
            true
        );

    });

}


if (dfa2ProblemType) {

    dfa2ProblemType.addEventListener("change", function () {

        setupProblemInput(
            dfa2ProblemType,
            dfa2ProblemInput,
            dfa2ProblemHelp,
            true
        );

    });

}
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

    if (
        states.length === 0 ||
        alphabet.length === 0 ||
        !startState ||
        finalStates.length === 0 ||
        !transitionText
    ) {
        throw new Error("Please complete all required DFA details.");
    }

    if (!states.includes(startState)) {
        throw new Error("Please complete all required DFA details.");
    }

    for (const finalState of finalStates) {
        if (!states.includes(finalState)) {
            throw new Error("Please complete all required DFA details.");
        }
    }

    const transitions = {};
    const lines =
        transitionText
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);

    for (const line of lines) {
        const parts = line.split(",").map(item => item.trim());

        if (parts.length !== 3) {
            throw new Error("Please provide all required transitions.");
        }

        const [currentState, symbol, nextState] = parts;

        if (
            !states.includes(currentState) ||
            !alphabet.includes(symbol) ||
            !states.includes(nextState)
        ) {
            throw new Error("Please provide all required transitions.");
        }

        const key = `${currentState}||${symbol}`;

        if (transitions[key]) {
            throw new Error("Please provide all required transitions.");
        }

        transitions[key] = nextState;
    }

    return {
        states,
        alphabet,
        startState,
        finalStates,
        transitions
    };

}

function validateCompleteDFA(dfa) {

    for (const state of dfa.states) {
        for (const symbol of dfa.alphabet) {
            const key = `${state}||${symbol}`;
            if (!Object.prototype.hasOwnProperty.call(dfa.transitions, key)) {
                throw new Error("Please provide all required transitions.");
            }
        }
    }

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
            DFA 1 Total States: ${dfa1.states.length}
            &nbsp;|&nbsp;
            DFA 2 Total States: ${dfa2.states.length}
        </strong>
        <br><br>
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

            let offsetX = 0;
            let offsetY = 0;
            let startX = x1;
            let startY = y1;
            let endX = x2;
            let endY = y2;

            if (distance > 0) {
                offsetX = (dx / distance) * 65;
                offsetY = (dy / distance) * 25;

                startX = x1 + offsetX;
                startY = y1 + offsetY;
                endX = x2 - offsetX;
                endY = y2 - offsetY;
            }
            else {
                startX = x1 + 18;
                startY = y1 - 10;
                endX = x2 + 18;
                endY = y2 - 10;
            }

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
// ================= CONVERT GENERATED DFA =================

// ================= CONVERT GENERATED DFA =================

function normalizeGeneratedDFA(dfa, prefix) {

    const stateMap = {};

    dfa.states.forEach(state => {
        stateMap[state] =
    prefix + state.substring(1);
    });

    const renamedStates =
        dfa.states.map(state => stateMap[state]);

    const renamedTransitions = {};

    for (const state of dfa.states) {

        for (const symbol of dfa.alphabet) {

            const nextState =
                dfa.transitions[state][symbol];

            renamedTransitions[
                `${stateMap[state]}||${symbol}`
            ] = stateMap[nextState];
        }
    }

    return {

        states: renamedStates,

        alphabet: dfa.alphabet,

        startState:
            stateMap[dfa.start],

        finalStates:
            dfa.finals.map(state => stateMap[state]),

        transitions:
            renamedTransitions
    };
}
/* =====================================================
   MAIN GENERATE FUNCTION
   ===================================================== */
// ================= AUTOMATIC DFA GENERATION =================

// ================= CREATE SINGLE DFA =================

function createDFAFromSingleProblem(type, value, alphabet) {

    if (!type) {
        throw new Error("Please select a problem type for both DFAs.");
    }

    if (!value) {
        throw new Error("Please enter input for both DFAs.");
    }


    // ---------- DECIMAL DIVISIBILITY ----------

    if (type === "decimal-divisible") {

        if (
            alphabet.length !== 10 ||
            alphabet.join(",") !==
            "0,1,2,3,4,5,6,7,8,9"
        ) {
            throw new Error(
                "Decimal Number Divisible requires alphabet {0,1,2,3,4,5,6,7,8,9}."
            );
        }

        const divisor = parseInt(value);

        return createDivisibilityDFA(10, divisor);
    }


    // ---------- BINARY DIVISIBILITY ----------

    if (type === "binary-divisible") {

        if (
            alphabet.length !== 2 ||
            alphabet.join(",") !== "0,1"
        ) {
            throw new Error(
                "Binary Number Divisible requires alphabet {0,1}."
            );
        }

        const divisor = parseInt(value);

        return createDivisibilityDFA(2, divisor);
    }


    // ---------- STARTING WITH ----------

    if (type === "starts-with") {

        if (
            alphabet.length !== 2 ||
            alphabet.join(",") !== "0,1"
        ) {
            throw new Error(
                "Starting with a String requires alphabet {0,1}."
            );
        }

        return createStartsWithDFA(value);
    }


    // ---------- ENDING WITH ----------

    if (type === "ends-with") {

        if (
            alphabet.length !== 2 ||
            alphabet.join(",") !== "0,1"
        ) {
            throw new Error(
                "Ending with a String requires alphabet {0,1}."
            );
        }

        return createEndsWithDFA(value);
    }


    // ---------- SUBSTRING ----------

    if (type === "substring") {

        if (
            alphabet.length !== 2 ||
            alphabet.join(",") !== "0,1"
        ) {
            throw new Error(
                "Substring Problem requires alphabet {0,1}."
            );
        }

        return createSubstringDFA(value);
    }


    // ---------- EVEN / ODD ----------

    if (type === "even-odd") {

        if (
            alphabet.length !== 2 ||
            alphabet.join(",") !== "0,1"
        ) {
            throw new Error(
                "Even / Odd Problem requires alphabet {0,1}."
            );
        }

        const isEven =
            value.toLowerCase().includes("even");

        const isOdd =
            value.toLowerCase().includes("odd");

        if (!isEven && !isOdd) {
            throw new Error(
                "For Even / Odd Problem, enter 'Even number of 1s' or 'Odd number of 1s'."
            );
        }

        return createEvenOddDFA(isEven);
    }


    throw new Error(
        "Invalid DFA problem type selected."
    );
}

// ================= DIVISIBILITY DFA =================

function createDivisibilityDFA(base, divisor) {

    if (!Number.isInteger(divisor) || divisor <= 0) {
        throw new Error("Divisor must be a positive integer.");
    }

    const alphabet = [];

    for (let i = 0; i < base; i++) {
        alphabet.push(String(i));
    }

    const states = [];

    for (let i = 0; i < divisor; i++) {
        states.push("q" + i);
    }

    const transitions = {};

    states.forEach(state => {

        transitions[state] = {};

        const remainder = parseInt(state.substring(1));

        alphabet.forEach(symbol => {

            const digit = parseInt(symbol);

            const nextRemainder =
                (remainder * base + digit) % divisor;

            transitions[state][symbol] =
                "q" + nextRemainder;
        });
    });

    return {
        states: states,
        alphabet: alphabet,
        start: "q0",
        finals: ["q0"],
        transitions: transitions
    };
}

// ================= STARTING STRING DFA =================

function createStartsWithDFA(pattern) {

    if (!pattern || !/^[01]+$/.test(pattern)) {
        throw new Error("Starting string must contain only 0 and 1.");
    }

    const alphabet = ["0", "1"];
    const states = [];

    for (let i = 0; i <= pattern.length; i++) {
        states.push("q" + i);
    }

    states.push("dead");

    const transitions = {};

    states.forEach(state => {
        transitions[state] = {};
    });

    for (let i = 0; i < pattern.length; i++) {

        transitions["q" + i][pattern[i]] = "q" + (i + 1);

        const otherSymbol = pattern[i] === "0" ? "1" : "0";
        transitions["q" + i][otherSymbol] = "dead";
    }

    transitions["q" + pattern.length]["0"] = "q" + pattern.length;
    transitions["q" + pattern.length]["1"] = "q" + pattern.length;

    transitions["dead"]["0"] = "dead";
    transitions["dead"]["1"] = "dead";

    return {
        states: states,
        alphabet: alphabet,
        start: "q0",
        finals: ["q" + pattern.length],
        transitions: transitions
    };
}


// ================= ENDING STRING DFA =================

function createEndsWithDFA(pattern) {

    if (!pattern || !/^[01]+$/.test(pattern)) {
        throw new Error("Ending string must contain only 0 and 1.");
    }

    const alphabet = ["0", "1"];
    const m = pattern.length;

    const states = [];

    for (let i = 0; i <= m; i++) {
        states.push("q" + i);
    }

    const transitions = {};

    states.forEach(state => {
        transitions[state] = {};
    });

    for (let i = 0; i <= m; i++) {

        alphabet.forEach(symbol => {

            const currentPrefix = pattern.substring(0, i) + symbol;

            let next = Math.min(m, currentPrefix.length);

            while (
                next > 0 &&
                !currentPrefix.endsWith(pattern.substring(0, next))
            ) {
                next--;
            }

            transitions["q" + i][symbol] = "q" + next;
        });
    }

    return {
        states: states,
        alphabet: alphabet,
        start: "q0",
        finals: ["q" + m],
        transitions: transitions
    };
}

// ================= SUBSTRING DFA =================

function createSubstringDFA(pattern) {

    if (!pattern || !/^[01]+$/.test(pattern)) {
        throw new Error("Substring must contain only 0 and 1.");
    }

    const alphabet = ["0", "1"];
    const m = pattern.length;

    const states = [];

    for (let i = 0; i <= m; i++) {
        states.push("q" + i);
    }

    const transitions = {};

    states.forEach(state => {
        transitions[state] = {};
    });

    for (let i = 0; i <= m; i++) {

        alphabet.forEach(symbol => {

            if (i === m) {
                transitions["q" + i][symbol] = "q" + i;
                return;
            }

            const current = pattern.substring(0, i) + symbol;

            let next = Math.min(m, current.length);

            while (
                next > 0 &&
                !current.endsWith(pattern.substring(0, next))
            ) {
                next--;
            }

            transitions["q" + i][symbol] = "q" + next;
        });
    }

    return {
        states: states,
        alphabet: alphabet,
        start: "q0",
        finals: ["q" + m],
        transitions: transitions
    };
}


// ================= EVEN / ODD DFA =================

function createEvenOddDFA(isEven) {

    const states = ["q0", "q1"];
    const alphabet = ["0", "1"];

    const transitions = {
        q0: {
            "0": "q0",
            "1": "q1"
        },

        q1: {
            "0": "q1",
            "1": "q0"
        }
    };

    return {
        states: states,
        alphabet: alphabet,
        start: "q0",
        finals: isEven ? ["q0"] : ["q1"],
        transitions: transitions
    };
}
/* =====================================================
   MAIN GENERATE FUNCTION
   ===================================================== */

function generate() {

    hideError();

    try {

        const type1 = dfa1ProblemType.value;
        const type2 = dfa2ProblemType.value;

        if (!type1) {
            throw new Error("Please select a problem type for DFA 1.");
        }

        if (!type2) {
            throw new Error("Please select a problem type for DFA 2.");
        }

        const dfa1StateCount =
            document.getElementById("dfa1StateCount").value.trim();

        const dfa2StateCount =
            document.getElementById("dfa2StateCount").value.trim();

        if (!dfa1StateCount) {
            throw new Error("Please enter the total number of states for DFA 1.");
        }

        if (!dfa2StateCount) {
            throw new Error("Please enter the total number of states for DFA 2.");
        }

        const stateCount1 = Number(dfa1StateCount);
        const stateCount2 = Number(dfa2StateCount);

        if (
            !/^\d+$/.test(dfa1StateCount) ||
            !/^\d+$/.test(dfa2StateCount) ||
            !Number.isSafeInteger(stateCount1) ||
            !Number.isSafeInteger(stateCount2) ||
            stateCount1 <= 0 ||
            stateCount2 <= 0
        ) {
            throw new Error("Total number of states must be a positive integer.");
        }

        dfa1 = readDFA("m1");
        dfa2 = readDFA("m2");

        if (dfa1.states.length !== stateCount1) {
            throw new Error(
                "Number of states entered for DFA 1 does not match the Total Number of States."
            );
        }

        if (dfa2.states.length !== stateCount2) {
            throw new Error(
                "Number of states entered for DFA 2 does not match the Total Number of States."
            );
        }

        validateAlphabets();
        validateCompleteDFA(dfa1);
        validateCompleteDFA(dfa2);

        unionDFA = generateUnionDFA();

        displayProductStates();
        displayParallelTransitions();
        displayFinalStates();
        displayUnionSummary();
        displayUnionTable();
        generateDFADiagram();

        resultSection.classList.remove("hidden");

        simulationResult.classList.add("hidden");
        document.getElementById("testString").value = "";

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

    dfa1ProblemType.value = "starts-with";
    dfa1ProblemInput.value = "0";
    setupProblemInput(dfa1ProblemType, dfa1ProblemInput, dfa1ProblemHelp);

    document.getElementById("m1States").value = "q0,q1,dead";
    document.getElementById("dfa1StateCount").value = "3";
    document.getElementById("m1Alphabet").value = "0,1";
    document.getElementById("m1Start").value = "q0";
    document.getElementById("m1Final").value = "q1";
    document.getElementById("m1Transitions").value =
        "q0,0,q1\n" +
        "q0,1,dead\n" +
        "q1,0,q1\n" +
        "q1,1,q1\n" +
        "dead,0,dead\n" +
        "dead,1,dead";

    dfa2ProblemType.value = "ends-with";
    dfa2ProblemInput.value = "0";
    setupProblemInput(dfa2ProblemType, dfa2ProblemInput, dfa2ProblemHelp);

    document.getElementById("m2States").value = "p0,p1";
    document.getElementById("dfa2StateCount").value = "2";
    document.getElementById("m2Alphabet").value = "0,1";
    document.getElementById("m2Start").value = "p0";
    document.getElementById("m2Final").value = "p1";
    document.getElementById("m2Transitions").value =
        "p0,0,p1\n" +
        "p0,1,p0\n" +
        "p1,0,p1\n" +
        "p1,1,p0";

    hideError();
    resultSection.classList.add("hidden");
    simulationResult.classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

/* =====================================================
   RESET APPLICATION
   ===================================================== */

function resetApplication() {

    const selects = document.querySelectorAll("select");
    const fields = document.querySelectorAll("input, textarea");

    selects.forEach(select => {
        select.value = "";
    });

    fields.forEach(field => {
        field.value = "";
    });

    dfa1 = null;
    dfa2 = null;
    unionDFA = null;

    dfa1ProblemHelp.textContent = "";
    dfa2ProblemHelp.textContent = "";
    dfa1ProblemInput.placeholder = "Select a problem type first";
    dfa2ProblemInput.placeholder = "Select a problem type first";

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