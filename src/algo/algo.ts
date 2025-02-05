import { get } from "http";
import { ALL_TOKENS, getAllMatchedPositions, RegularExpression, Token } from "../lang";
import { PositionSet, RegExpSet, SubstringExpSet, TokenIPartition } from "./types";

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
    const tokenIPartitions = getIndistinguishablePartitions(str);

    // for (let k1 = 0; k1 <= k; k1++) {
    //     const leftStr = str.substring(k1, k);
    //     const leftTokens = tokenize(leftStr);

    //     for (let k2 = k; k2 <= str.length; k2++) {
    //         const rightStr = str.substring(k, k2);
    //         const rightTokens = tokenize(rightStr);

    //         const combinedTokens = [...leftTokens, ...rightTokens];
    //         const c = countMatches(str, combinedTokens, k);
    //         const totalMatches = countMatches(str, combinedTokens);

    //         result.add({
    //             type: 'RegExpPositionSet',
    //             regex1: generateRegex(leftTokens, str),
    //             regex2: generateRegex(rightTokens, str),
    //             count: {
    //                 type: 'IntegerSet',
    //                 values: new Set([c, -(totalMatches - c + 1)])
    //             }
    //         });
    //     }
    // }

    return result;
}

export function generateRegex(r: RegularExpression, str: string): RegExpSet {
    return {
        type: 'RegExpSet',
        tokens: r.tokens.map(token => ({
            type: 'TokenSet',
            tokens: getIndistinguishableTokens(token, str)
        }))
    };
}

export function getIndistinguishablePartitions(str: string): Set<TokenIPartition> {
    const result = new Set<TokenIPartition>();

    const matchedTokenMap = new Map<string, Set<Token>>();
    ALL_TOKENS.forEach(token => {
        const matches = getAllMatchedPositions(str, token);
        if (matches.length === 0) return;
        const matchesStr = matches.toString();
        if (matchedTokenMap.get(matchesStr) === undefined)
            matchedTokenMap.set(matchesStr, new Set([token]));
        else matchedTokenMap.get(matchesStr)!.add(token);
    });

    matchedTokenMap.forEach((tokens, matches) => {
        const repToken = tokens.values().next().value!;
        result.add({ tokens, repToken });
    });

    return result;
}

const permutator = (inputArr: any[]) => {
    let result: any[] = [];

    const permute = (arr: any[], m = []) => {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    }

    permute(inputArr)

    return result;
}

export function generateRegexes(partitions: Set<TokenIPartition>, str: string): Array<RegularExpression> {
    const repTokens = [...partitions].map(partition => partition.repToken);

    // generate all possible regexes by permutations of repTokens
    const result: Array<RegularExpression> = [];


    return result;
}


const areEqual = (a1: number[], a2: number[]) =>
    a1.length === a2.length && a1.every((val, idx) => val === a2[idx]);

// Return all tokens that match same positions in str as given token
export function getIndistinguishableTokens(token: Token, str: string): Set<Token> {
    return new Set(ALL_TOKENS.filter(t =>
        areEqual(
            getAllMatchedPositions(str, token),
            getAllMatchedPositions(str, t)
        )
    ));
}