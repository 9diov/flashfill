import { generateRegexesMatchingAfter, generateRegexesMatchingBefore, getAllMatchedPositions, getIndistinguishablePartitions, getIndistinguishableTokens, IPartitionCache } from "./algo/match";
import { PositionSet, RegExpSet, SubstringExpSet } from "./algo/types";
import { E, RegularExpression, Token } from "./lang";

function generateSubstring(state: InputState, substr: string): Set<SubstringExpSet> {
    const result = new Set<SubstringExpSet>();

    // For each input variable and position where substr appears
    for (const [varName, value] of Object.entries(state)) {
        let pos = 0;
        while ((pos = value.indexOf(substr, pos)) !== -1) {
            const startPositions = generatePosition(value, pos);
            const endPositions = generatePosition(value, pos + substr.length);

            result.add({
                type: 'SubstringSet',
                variable: varName,
                start: startPositions,
                end: endPositions
            });

            pos += 1;
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
        value: -(str.length - k)
    });

    const cache = new IPartitionCache(str);
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

    console.dir(result, { depth: null });
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