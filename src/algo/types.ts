// Sets of string expressions
// Refer to Figure 3 of Gulwani paper

import { BooleanExpression, ConstantExpression, ConstantPosition, IntegerExpression, Position, RegularExpression, StringVariable, Token } from "../lang"

export type StringExpSet = {
    type: 'SwitchSet',
    cases: Set<{
        condition: BooleanExpression,
        result: TraceExpSet
    }>;
}

export type Edge = { start: number, end: number };
export type Mappings = Map<string, AtomicExpSet>;

export type TraceExpSet = {
    type: 'TraceSet',
    nodes: Set<number>, // set of nodes that contain start and end nodes
    startNode: number,
    endNode: number,
    edges: Set<Edge>,
    mappings: Mappings // e.g. { "1-3": expset1, "4-5": expset2 }
}

export type AtomicExpSet = Set<
    | LoopExpSet
    | SubstringExpSet
    | ConstantExpression>;

export type LoopExpSet = {
    type: 'LoopSet',
    loop: AtomicExpSet
}

export type SubstringExpSet = Set<{
    type: 'SubstringSet',
    variable: StringVariable,
    start: PositionSet,
    end: PositionSet,
}>

export type PositionSet = Set <ConstantPosition | RegExpPositionSet>;

export type RegExpPositionSet = {
    type: 'RegExpPositionSet',
    regex1: RegExpSet,
    regex2: RegExpSet,
    count: IntegerExpSet
}

export type IntegerExpSet = {
    type: 'IntegerSet',
    values: Set<IntegerExpression>
}

export type RegExpSet = {
    type: 'RegExpSet',
    tokens: Array<TokenSet>
}

export type TokenSet = {
    type: 'TokenSet',
    tokens: Set<Token>
}

export type InputState = Record<string, string>; // { "v1": "input 1", "v2": "input 2" }

// generate all RegularExpressions in the regex set
function* allRegexes(regexSet: RegExpSet): Generator<RegularExpression> {
    if (regexSet.tokens.length === 0) {
        return;
    }

    // Start with first token set
    let currentResults: Array<RegularExpression> = [new RegularExpression([])];

    // Process each token set
    for (let i = 0; i < regexSet.tokens.length; i++) {
        const tokenSet = regexSet.tokens[i];
        const newResults: Array<RegularExpression> = [];

        // For each token in current set
        for (const token of tokenSet.tokens) {
            // Add token to each existing regex
            for (const regex of currentResults) {
                newResults.push(regex.clone().addToken(token));
            }
        }

        // If this is the last token set, yield results
        if (i === regexSet.tokens.length - 1) {
            for (const result of newResults) {
                yield result;
            }
        }
        // Otherwise update current results and continue
        else {
            currentResults = newResults;
        }
    }
}

function allCounts(integerSet: IntegerExpSet): Array<IntegerExpression> {
    return Array.from(integerSet.values);
}

// enumerate all positions in the position set
export function* allPositions(positions: PositionSet): Generator<Position> {
    for (const pos of positions) {
        if (pos.type === 'CPos') {
            yield pos;
        } else if (pos.type === 'RegExpPositionSet') {
            for (const regex1 of allRegexes(pos.regex1)) {
                for (const regex2 of allRegexes(pos.regex2)) {
                    for (const count of allCounts(pos.count)) {
                        yield { type: 'Pos', regex1, regex2, count: count };
                    }
                }
            }
        }
    }
}
