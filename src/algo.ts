import { getIndistinguishablePartitions, getIndistinguishableTokens, IPartitionCache } from "./algo/match";
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

export function generateRegexesMatchingBefore(str: string, k: number,
     cache: IPartitionCache = new IPartitionCache(str)): Set<RegularExpression> {
    // console.log("orginal str:", str, "len:", str.length, "k:", k, "str considered:", str.slice(0, k));
    // console.dir(cache.partitions, { depth: null });
    if (k < 0 || k >= str.length) { throw new Error("k must be non-negative and < string length"); }
    if (k === 0) { return new Set([E.Regex()]); }

    // Keep track of all token sequences that match str.slice(0, k)
    let tokenSeqSet: Set<Token[]> = new Set();

    // helper function to add token sequences to tokenSeqSet
    const addTokenSeq = (index: number, cache: IPartitionCache,
         tokenSeqSet: Set<Token[]>, currTokenSeq: Token[] = []) => {

        if (index < 0) {
            tokenSeqSet.add(currTokenSeq);
            return;
        }

        const partitionRangePairs = cache.findPartitionsFromPos(index);
        if (partitionRangePairs) {
            for(const pair of partitionRangePairs) {
                const currTokenSeqCloned = currTokenSeq.slice();
                currTokenSeqCloned.unshift(pair[0].repToken);
                addTokenSeq(pair[1][0] - 1, cache, tokenSeqSet, currTokenSeqCloned);
            }
        }
    };

    addTokenSeq(k - 1, cache, tokenSeqSet);
    // console.dir(tokenSeqSet, { depth: null });

    // Results are just a set of all suffixes of all tokenSeq in tokenSeqSet
    const result = new Set<RegularExpression>();
    for (const tokenSeq of tokenSeqSet) {
        for (let i = 0; i < tokenSeq.length; i++) {
            const tokens = tokenSeq.slice(i);
            result.add(E.Regex(...tokens));
        }
    }

    // console.dir(result, { depth: null });

    result.add(E.Regex()); // adding empty regex

    return result;
}

export function generateRegexesMatchingAfter(str: string, k: number,
     cache: IPartitionCache = new IPartitionCache(str)): Set<RegularExpression> {
    // console.log("orginal str:", str, "k:", k, "str considered:", str.slice(k));
    // console.dir(cache.partitions, { depth: null });

    if (k < 0 || k >= str.length) { throw new Error("k must be non-negative and < string length"); }

    // Keep track of all token sequences that match str.slice(k)
    let tokenSeqSet: Set<Token[]> = new Set();

    // helper function to add token sequences to tokenSeqSet
    const addTokenSeq = (index: number, cache: IPartitionCache,
         tokenSeqSet: Set<Token[]>, currTokenSeq: Token[] = []) => {

        if (index === str.length) {
            tokenSeqSet.add(currTokenSeq);
            return;
        }

        const partitionRangePairs = cache.findPartitionsFromPos(index);
        if (partitionRangePairs) {
            for(const pair of partitionRangePairs) {
                const currTokenSeqCloned = currTokenSeq.slice(); // clone to avoid mutation
                currTokenSeqCloned.push(pair[0].repToken);
                addTokenSeq(pair[1][1], cache, tokenSeqSet, currTokenSeqCloned);
            }
        }
    };

    addTokenSeq(k, cache, tokenSeqSet);
    // console.dir(tokenSeqSet, { depth: null });

    // Results are just a set of all prefixes of all tokenSeq in tokenSeqSet
    const result = new Set<RegularExpression>();
    for (const tokenSeq of tokenSeqSet) {
        for (let i = 1; i <= tokenSeq.length; i++) {
            const tokens = tokenSeq.slice(0, i);
            result.add(E.Regex(...tokens));
        }
    }

    // console.dir(result, { depth: null });

    result.add(E.Regex()); // adding empty regex

    return result;
}

