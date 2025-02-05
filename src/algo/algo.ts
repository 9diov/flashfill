import { ALL_TOKENS, getAllMatchedPositions, RegularExpression, Token } from "../lang";
import { PositionSet, RegExpSet, SubstringExpSet } from "./types";

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

    // Find regex-based positions
    for (let k1 = 0; k1 <= k; k1++) {
        const leftStr = str.substring(k1, k);
        const leftTokens = tokenize(leftStr);

        for (let k2 = k; k2 <= str.length; k2++) {
            const rightStr = str.substring(k, k2);
            const rightTokens = tokenize(rightStr);

            const combinedTokens = [...leftTokens, ...rightTokens];
            const c = countMatches(str, combinedTokens, k);
            const totalMatches = countMatches(str, combinedTokens);

            result.add({
                type: 'RegExpPositionSet',
                regex1: generateRegex(leftTokens, str),
                regex2: generateRegex(rightTokens, str),
                count: {
                    type: 'IntegerSet',
                    values: new Set([c, -(totalMatches - c + 1)])
                }
            });
        }
    }

    return result;
}

// Generate set of all equivalent regular expressions for a given string
export function generateRegex(r: RegularExpression, str: string): RegExpSet {
    return {
        type: 'RegExpSet',
        tokens: r.tokens.map(token => ({
            type: 'TokenSet',
            tokens: getIndistinguishableTokens(token, str)
        }))
    };
}

const areEqual = (a1: number[], a2: number[]) =>
    a1.length === a2.length && a1.every((val, idx) => val === a2[idx]);

function getIndistinguishableTokens(token: Token, str: string): Set<Token> {
    // Return all tokens that match same positions in str as given token
    return new Set(ALL_TOKENS.filter(t =>
        areEqual(
            getAllMatchedPositions(str, token),
            getAllMatchedPositions(str, t)
        )
    ));
}