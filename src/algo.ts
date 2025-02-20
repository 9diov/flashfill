import { unifyTraceExpressions } from "./algo/loop";
import { generateRegexesMatchingAfter, generateRegexesMatchingBefore, getAllMatchedPositions, getIndistinguishableTokens, IPartitionCache } from "./algo/match";
import { computeCompatibilityScore, evaluatePredicate, findBestPredicate, generatePredicates, intersectTraceExpSets } from "./algo/partition";
import { AtomicExpSet, Edge, InputState, Mappings, PositionSet, RegExpSet, StringExpSet, SubstringExpSet, TraceExpSet } from "./algo/types";
import { BooleanExpression, E, Interpreter, RegularExpression } from "./lang";


function generateStringProgram(examples: Array<[InputState, string]>): StringExpSet {
    // T := ∅
    let T: Map<InputState, TraceExpSet> = new Map();

    // foreach (σ,s) ∈ S
    for (const [state, output] of examples) {
        // T := T ∪ ({σ}, GenerateStr(σ,s))
        const trace = generateStr(state, output);
        T.set(state, trace);
    }

    // T := GeneratePartition(T)
    const partitions = generatePartition(T);

    // σ̃′ := {σ | (σ,s) ∈ S}
    const allStates = new Set(examples.map(([state]) => state));

    // Generate boolean classifiers for each partition
    const cases: Set<{ condition: BooleanExpression; result: TraceExpSet }> = new Set();
    for (const [states, trace] of partitions.entries()) {
        // let B[σ̃] := GenerateBoolClassifier(σ̃,σ̃′-σ̃)
        const remainingStates = new Set([...allStates].filter(s => !states.has(s)));
        const condition = generateBoolClassifier(states, remainingStates);

        cases.add({
            condition,
            result: trace
        });
    }

    return {
        type: 'SwitchSet',
        cases
    };
}

function generatePartition(T: Map<InputState, TraceExpSet>): Map<Set<InputState>, TraceExpSet> {
    // Initialize singleton partitions
    let partitions = new Map<Set<InputState>, TraceExpSet>();
    for (const [state, trace] of T.entries()) {
        partitions.set(new Set([state]), trace);
    }

    while (true) {
        // Find most compatible pair of partitions
        let bestScore = -1;
        let bestPair: [Set<InputState>, Set<InputState>] | null = null;
        let bestIntersection: TraceExpSet | null = null;

        for (const [states1, trace1] of partitions.entries()) {
            for (const [states2, trace2] of partitions.entries()) {
                if (states1 === states2) continue;

                const intersection = intersectTraceExpSets(trace1, trace2);
                if (!intersection) continue;

                const score = computeCompatibilityScore(trace1, trace2, partitions);
                if (score > bestScore) {
                    bestScore = score;
                    bestPair = [states1, states2];
                    bestIntersection = intersection;
                }
            }
        }

        if (!bestPair || bestScore <= 0) break;

        // Merge the best pair
        const [states1, states2] = bestPair;
        const mergedStates = new Set([...states1, ...states2]);
        partitions.delete(states1);
        partitions.delete(states2);
        partitions.set(mergedStates, bestIntersection!);
    }

    return partitions;
}

function generateBoolClassifier(
    positiveStates: Set<InputState>,
    negativeStates: Set<InputState>
): BooleanExpression {
    let sigma1 = new Set(positiveStates);
    let disjuncts: BooleanExpression[] = [];

    while (sigma1.size > 0) {
        const oldSigma1 = new Set(sigma1);
        let sigma2 = new Set(negativeStates);
        let sigma1Prime = new Set(sigma1);
        let conjuncts: BooleanExpression[] = [];

        while (sigma2.size > 0) {
            const oldSigma2 = new Set(sigma2);

            // Generate predicates
            const predicates = generatePredicates(sigma1Prime, sigma2);

            // Find best predicate
            const bestPred = findBestPredicate(predicates, sigma1Prime, sigma2);
            if (!bestPred) return E.False(); // FAIL case

            conjuncts.push(bestPred);

            // Update sets based on predicate
            sigma1Prime = new Set([...sigma1Prime].filter(s => evaluatePredicate(bestPred, s)));
            sigma2 = new Set([...sigma2].filter(s => evaluatePredicate(bestPred, s)));

            if (sigma2.size === oldSigma2.size) return E.False(); // FAIL case
        }

        sigma1 = new Set([...sigma1].filter(s => !sigma1Prime.has(s)));
        if (sigma1.size === oldSigma1.size) return E.False(); // FAIL case

        disjuncts.push(E.And(...conjuncts));
    }

    return E.Or(...disjuncts);
}

function generateStr(state: InputState, output: string): TraceExpSet {
    // Create DAG nodes for each position in output string
    const nodes = new Set<number>();
    for (let i = 0; i <= output.length; i++) {
        nodes.add(i);
    }

    // Start and end nodes
    const startNode = 0;
    const endNode = output.length;

    // Create edges between all positions
    const edges = new Set<Edge>();
    const mappings = new Map<string, AtomicExpSet>();

    for (let i = 0; i < output.length; i++) {
        for (let j = i + 1; j <= output.length; j++) {
            edges.add({ start: i, end: j });

            // The substring we're trying to generate
            const substr = output.slice(i, j);

            // Key for the mapping
            const edgeKey = `${i}-${j}`;

            // Generate expressions that could produce this substring
            const atomicExps: AtomicExpSet = new Set([
                // Constant string is always an option
                { type: 'ConstStr', value: substr }
            ]);

            // Add substring expressions
            const substrExps = generateSubstring(state, substr);
            atomicExps.add(substrExps);

            mappings.set(edgeKey, atomicExps);
        }
    }
    const loopMappings = generateLoop(state, output, mappings);

    // Create initial trace set
    const traceSet: TraceExpSet = {
        type: 'TraceSet',
        nodes,
        startNode,
        endNode,
        edges,
        mappings: loopMappings
    };

    // Update with loop expressions
    return traceSet;
}

function generateLoop(state: InputState, output: string, w: Mappings): Mappings {
    const newMappings: Mappings = new Map(w);

    // For each possible substring of output
    for (let k1 = 0; k1 < output.length; k1++) {
        for (let k2 = k1 + 1; k2 < output.length; k2++) {
            for (let k3 = k2 + 1; k3 < output.length; k3++) {
                // Generate expressions for both parts
                const firstPart = output.slice(k1, k2);
                const secondPart = output.slice(k2, k3);

                const e1 = generateStr(state, firstPart);
                const e2 = generateStr(state, secondPart);

                // Try to unify the expressions
                const unified = unifyTraceExpressions(e1, e2);
                if (!unified) continue;

                // Test if loop with unified expression generates valid output
                const loopExp: LoopExpSet = {
                    type: 'LoopSet',
                    loop: unified
                };

                // Test the loop expression
                const generatedOutput = new Interpreter().interpretLoop(loopExp, state);
                if (generatedOutput.error) continue;

                // Find k4 where loop generates output[k1:k4]
                let k4 = k1;
                while (k4 <= output.length) {
                    const target = output.slice(k1, k4);
                    if (generatedOutput.value === target) {
                        // Add loop expression to mappings
                        const edgeKey = `${k1}-${k4}`;
                        const existing = newMappings.get(edgeKey) || new Set();
                        existing.add(loopExp);
                        newMappings.set(edgeKey, existing);
                        break;
                    }
                    k4++;
                }
            }
        }
        return newMappings;
    }
}

function generateSubstring(state: InputState, substr: string): SubstringExpSet {
    const result: SubstringExpSet = new Set();

    // for each case where substr is found in one of the strings in state
    for (const [key, value] of Object.entries(state)) {
        let k = value.indexOf(substr);
        if (k === -1) continue;
        while (k !== -1) {
            const y1 = generatePosition(value, k);
            const y2 = generatePosition(value, k + substr.length);
            result.add({
                type: 'SubstringSet',
                variable: { type: 'StringVariable', name: key },
                start: y1,
                end: y2
            });
            k = value.indexOf(substr, k + 1);
        }
    }

    return result;
}

// Generate all possible PositionExpressions for position k of a given string str
export function generatePosition(str: string, k: number): PositionSet {
    const result: PositionSet = new Set();

    // Add constant positions, one forward, one backward
    result.add({
        type: 'CPos',
        value: k
    });
    result.add({
        type: 'CPos',
        value: -(str.length - k + 1)
    });

    const cache = new IPartitionCache(str);
    // TODO: Add empty regex to r1s and r2s
    const r1s = generateRegexesMatchingBefore(str, k, cache);
    const r2s = generateRegexesMatchingAfter(str, k, cache);

    for (const r1 of r1s) {
        for (const r2 of r2s) {
            const r12 = r1.append(r2);
            const positions = getAllMatchedPositions(str, r12);
            if (positions.length === 0)
                throw new Error('No matches found for regex. This should not happen.');

            // Find cth match for r12 in s
            const c = positions.findIndex(([start, end]) => start <= k && k < end) + 1;
            if (c === -1)
                throw new Error('Position not found in matches. This should not happen.');
            const cprime = positions.length; // total number of matches
            result.add({
                type: 'RegExpPositionSet',
                regex1: generateRegex(r1, str, cache),
                regex2: generateRegex(r2, str, cache),
                count: {
                    type: 'IntegerSet',
                    values: new Set([E.Int(c), E.Int(-(cprime - c + 1))])
                }
            });
        }
    }

    // console.dir(result, { depth: null });
    return result;
}

export function generateRegex(r: RegularExpression, str: string,
    cache: IPartitionCache = new IPartitionCache(str)): RegExpSet {
    return {
        type: 'RegExpSet',
        tokens: r.tokens.map(token => ({
            type: 'TokenSet',
            tokens: getIndistinguishableTokens(token, str, cache)
        }))
    };
}