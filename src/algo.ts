// Sets of string expressions

import { BooleanExpression, ConstantExpression, ConstantPosition, IntegerExpression, StringVariable, Token } from "./lang"

export type StringExpSet = {
    type: 'SwitchSet',
    cases: Set<{
        condition: BooleanExpression,
        result: TraceExpSet
    }>;
}

export type Edge = { start: number, end: number };

export type TraceExpSet = {
    type: 'TraceSet',
    nodes: Set<number>, // set of nodes that contain start and end nodes
    startNode: number,
    endNode: number,
    edges: Set<Edge>,
    mappings: Map<Edge, AtomicExpSet>
}

export type AtomicExpSet =
    | LoopExpSet
    | SubstringExpSet
    | ConstantExpression;


export type LoopExpSet = {
    type: 'LoopSet',
    loop: AtomicExpSet
}

export type SubstringExpSet = {
    type: 'SubstringSet',
    variable: StringVariable,
    start: PositionSet,
    end: PositionSet,
}

export type PositionSet =
    | ConstantPosition
    | RegExpPositionSet;

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
    tokens: Array<Token>
}
