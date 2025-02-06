// All functions and data structures related to matching algorithms
// are defined here.

import { ALL_TOKENS, Token, mapRegex } from "../lang";

type Range = [number, number];

const areRangeEqual = (a1: Range, a2: Range) =>
    a1.every((val, idx) => val === a2[idx]);

const areRangeArrayEqual = (a1: Range[], a2: Range[]) =>
    a1.length === a2.length &&
        a1.every((val, idx) => areRangeEqual(val, a2[idx]));

// Indistinguishable Partition
//
// From the paper:
// DEFINITION 1 (Indistinguishability):
// We say that a token T1 is indistinguishable from token T2
// with respect to a string if the set of matches of token T1
// is the same as the set of matches of token T2 in the string.
//
// DEFINITION 2 (Indistinguishable Partition):
// Given a string s and a set of tokens, let IParts_s denote the partition
// of tokens into indistinguishable sets, and let Reps_s denote some set
// of representative tokens, one from each partition. We use the notation
// IParts_s(T) to denote the set in which token T lies.
export type TokenIPartition = {
    tokens: Set<Token>,
    repToken: Token,
    // Additional info not in the original paper.
    // Used for caching purposes.
    matches: Range[]
}

// Used to cache partitions
export class IPartitionCache {
    str: string;
    partitions: Set<TokenIPartition>;
    partitionsArr: TokenIPartition[];

    constructor(str: string) {
        this.str = str;
        this.partitions = getIndistinguishablePartitions(str);
        this.partitionsArr = Array.from(this.partitions); // convert to array for faster access
    }

    findPartitionContains(token: Token): TokenIPartition | undefined {
        return this.partitionsArr.find(partition =>
            partition.tokens.has(token)
        );
    }

    getPartition(repToken: Token): TokenIPartition | undefined {
        return this.partitionsArr.find(partition =>
            partition.repToken === repToken
        );
    }

    findPartitionsFromPos(pos: number): Array<[TokenIPartition, Range]> | undefined {
        const results = this.partitionsArr.map(partition => {
            const match = partition.matches.find(
                ([start, end]) => start <= pos && pos < end);
            if (match) return [partition, match];
            else return undefined;
        }).filter(x => x !== undefined);
        if (results.length === 0) return undefined;
        return results as Array<[TokenIPartition, Range]>;
    }
}

export function getAllMatchedPositions(str: string, token: Token): Array<Range> {
    const regex = mapRegex({ type: 'TokenSeq', tokens: [token] });
    const positions: Array<Range> = [];
    let result;
    const re = new RegExp(regex, 'g');
    while (result = re.exec(str)) {
        positions.push([result.index, re.lastIndex]);
    }
    return positions;
}


// Return all tokens that match same positions in str as given token
// @param analyzer: Optional parameter to cache partitions
export function getIndistinguishableTokens(token: Token, str: string, cache?: IPartitionCache): Set<Token> {
    // if cache is provided, use it to find partition
    if (cache) {
        const partition = cache.findPartitionContains(token);
        if (partition) return partition.tokens;
    }
    return new Set(ALL_TOKENS.filter(t =>
        areRangeArrayEqual(
            getAllMatchedPositions(str, token),
            getAllMatchedPositions(str, t)
        )
    ));
}

export function getIndistinguishablePartitions(str: string): Set<TokenIPartition> {
    const result = new Set<TokenIPartition>();

    const matchedTokenMap = new Map<string, [Set<Token>, Range[]]>();
    ALL_TOKENS.forEach(token => {
        const matches = getAllMatchedPositions(str, token);
        if (matches.length === 0) return;
        const matchesStr = matches.toString();
        if (matchedTokenMap.get(matchesStr) === undefined)
            matchedTokenMap.set(matchesStr, [new Set([token]), matches]);
        else {
            matchedTokenMap.get(matchesStr)![0].add(token);
        }
    });

    matchedTokenMap.forEach(([tokens, matches], _) => {
        const repToken = tokens.values().next().value!;
        result.add({ tokens, repToken, matches });
    });

    return result;
}

// **** Utility functions ****

// Permutate all members of an array
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