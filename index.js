class NFA {
    constructor(states, alphabet, transitionFunction, startState, acceptStates) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitionFunction = transitionFunction;
        this.startState = startState;
        this.acceptStates = acceptStates;
    }
}

class DFA {
    constructor(states, alphabet, transitionFunction, startState, acceptStates) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitionFunction = transitionFunction;
        this.startState = startState;
        this.acceptStates = acceptStates;
    }
}

function epsilonClosure(nfa, states) {
    let stack = [...states];
    let closure = new Set(states);

    while (stack.length > 0) {
        let state = stack.pop();
        if (nfa.transitionFunction[state] && nfa.transitionFunction[state]['ε']) {
            nfa.transitionFunction[state]['ε'].forEach(nextState => {
                if (!closure.has(nextState)) {
                    closure.add(nextState);
                    stack.push(nextState);
                }
            });
        }
    }

    return [...closure];
}

function move(nfa, states, symbol) {
    let result = new Set();
    states.forEach(state => {
        if (nfa.transitionFunction[state] && nfa.transitionFunction[state][symbol]) {
            nfa.transitionFunction[state][symbol].forEach(nextState => result.add(nextState));
        }
    });
    return [...result];
}

function nfaToDfa(nfa) {
    let dfaStates = [];
    let dfaTransitionFunction = {};
    let startStateClosure = epsilonClosure(nfa, [nfa.startState]);
    let dfaStartState = JSON.stringify(startStateClosure);
    let dfaAcceptStates = new Set();
    let unmarkedStates = [startStateClosure];

    dfaStates.push(startStateClosure);
    dfaTransitionFunction[dfaStartState] = {};

    while (unmarkedStates.length > 0) {
        let currentDfaState = unmarkedStates.pop();
        let currentDfaStateKey = JSON.stringify(currentDfaState);

        nfa.alphabet.forEach(symbol => {
            let moveResult = move(nfa, currentDfaState, symbol);
            let closure = epsilonClosure(nfa, moveResult);
            let closureKey = JSON.stringify(closure);

            if (closure.length > 0) {
                if (!dfaStates.some(state => JSON.stringify(state) === closureKey)) {
                    dfaStates.push(closure);
                    unmarkedStates.push(closure);
                    dfaTransitionFunction[closureKey] = {};
                }

                dfaTransitionFunction[currentDfaStateKey][symbol] = closureKey;

                if (closure.some(state => nfa.acceptStates.includes(state))) {
                    dfaAcceptStates.add(closureKey);
                }
            }
        });
    }

    return new DFA(
        dfaStates.map(state => JSON.stringify(state)),
        nfa.alphabet,
        dfaTransitionFunction,
        dfaStartState,
        [...dfaAcceptStates]
    );
}

// the input should be insert here
let nfa = new NFA(
    ['q0', 'q1', 'q2'],                                         // State
    ['0', '1'],                                                 // Alphabet 
    {
        'q0': { '0': ['q0'], '1': ['q1'] },
        'q1': { '0': ['q2'], '1': ['q2'] },
        'q2': { 'ε': ['q0'] }
    },                                                          // Transition Function
    'q0',                                                          // Start state
    ['q0']                                                          // Accept States
);

let dfa = nfaToDfa(nfa);

console.log('DFA States:', dfa.states);
console.log('DFA Alphabet:', dfa.alphabet);
console.log('DFA Transition Function:', dfa.transitionFunction);
console.log('DFA Start State:', dfa.startState);
console.log('DFA Accept States:', dfa.acceptStates);
