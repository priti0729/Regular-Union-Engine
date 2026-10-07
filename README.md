# Regular Union Engine

## Cross-Product DFA for Union of Two Regular Languages

### Theory of Computation TAE Model

---

## 1. Introduction

Regular languages can be represented using Deterministic Finite Automata (DFA).

This project demonstrates how the union of two regular languages can be constructed using the cross-product method.

Let:

L(M1) be the language accepted by DFA M1.

L(M2) be the language accepted by DFA M2.

The required language is:

L(M1) ∪ L(M2)

A new DFA is constructed by combining every state of M1 with every state of M2.

---

## 2. Problem Statement

Design and implement a Regular Union Engine that computes the cross-product DFA for the union of two distinct regular languages L(M1) and L(M2).

The system should use parallel state transitions, where the same input symbol is processed simultaneously by both DFAs.

The resulting DFA should accept a string if at least one of the two original DFAs accepts the string.

---

## 3. Objective

The main objectives are:

1. To accept two DFA definitions as input.
2. To generate the cross-product state set.
3. To calculate parallel transitions.
4. To determine the final states for the union DFA.
5. To display the resulting DFA transition table.
6. To visualize the generated DFA.
7. To simulate an input string step-by-step.
8. To clearly show whether M1, M2 and the union DFA accept the string.

---

## 4. Mathematical Representation

Let:

M1 = (Q1, Σ, δ1, q01, F1)

M2 = (Q2, Σ, δ2, q02, F2)

The union DFA is:

M = (Q1 × Q2, Σ, δ, (q01,q02), F)

---

## 5. Cross-Product States

The states of the new DFA are obtained using:

Q = Q1 × Q2

If:

Q1 = {q0,q1}

and:

Q2 = {p0,p1}

then:

Q1 × Q2 =

{(q0,p0), (q0,p1), (q1,p0), (q1,p1)}

The total number of product states is:

|Q1| × |Q2|

---

## 6. Parallel State Transition

For every input symbol a:

δ((q,p),a) =
(δ1(q,a), δ2(p,a))

This means that the same input symbol is processed simultaneously by M1 and M2.

For example:

M1:

q0 --1--> q1

M2:

p0 --1--> p1

Therefore:

(q0,p0) --1--> (q1,p1)

---

## 7. Union Final States

For union, a product state becomes final if at least one component state is final.

The rule is:

F = {(q,p) | q ∈ F1 OR p ∈ F2}

Therefore:

If q is final in M1 OR p is final in M2,

then (q,p) is final in the union DFA.

---

## 8. Algorithm

### Step 1

Read DFA M1.

### Step 2

Read DFA M2.

### Step 3

Check that both DFAs use the same alphabet.

### Step 4

Generate all states in Q1 × Q2.

### Step 5

For every product state and every input symbol:

1. Find the transition of M1.
2. Find the transition of M2.
3. Combine the two resulting states.

### Step 6

Determine final product states using the OR condition.

### Step 7

Generate the complete transition table of the union DFA.

### Step 8

Display the generated DFA.

### Step 9

Accept a test string from the user.

### Step 10

Simulate the string step-by-step.

### Step 11

Display the results of M1, M2 and the union DFA.

---

## 9. Example

DFA M1:

States:

{q0,q1}

Alphabet:

{0,1}

Start State:

q0

Final State:

q1

Transitions:

q0,0,q0

q0,1,q1

q1,0,q0

q1,1,q1

---

DFA M2:

States:

{p0,p1}

Alphabet:

{0,1}

Start State:

p0

Final State:

p1

Transitions:

p0,0,p1

p0,1,p0

p1,0,p1

p1,1,p0

---

## 10. Product States

The product states are:

(q0,p0)

(q0,p1)

(q1,p0)

(q1,p1)

---

## 11. Technologies Used

- HTML
- CSS
- JavaScript
- Visual Studio Code
- Online AI tools for model development

---

## 12. Features of the Model

The application provides:

1. DFA M1 input.
2. DFA M2 input.
3. Cross-product state generation.
4. Parallel transition calculation.
5. Union final-state calculation.
6. Union DFA transition table.
7. DFA state diagram.
8. String simulation.
9. Step-by-step execution path.
10. M1, M2 and Union acceptance results.

---

## 13. How to Run

1. Open the project folder in Visual Studio Code.
2. Open index.html.
3. Use the Live Server extension.
4. Click "Load Example" to load sample DFAs.
5. Click "Generate Union DFA".
6. Observe the cross-product states.
7. Observe the parallel transitions.
8. Observe the union final states.
9. Enter a test string.
10. Click "Simulate String".

---

## 14. Conclusion

The Regular Union Engine demonstrates the construction of a DFA for the union of two regular languages using the cross-product construction.

The application clearly illustrates how both DFAs process the same input symbol in parallel and how their states are combined into a single product state.

The final DFA accepts a string when at least one of the original DFAs accepts it.

Thus, the model provides a visual and interactive demonstration of the union operation on regular languages.