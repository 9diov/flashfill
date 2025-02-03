export interface Example {
    input: Array<string>;
    output: string;
}

// ********************************
// String Expression Language types
// ********************************

// Top level string expression
export type StringExpression = {
  type: 'Switch';
  cases: Array<{
    condition: BooleanExpression;
    result: TraceExpression;
  }>;
};

// Boolean expressions (b)
export type BooleanExpression = {
  type: 'Disjunction';  // represents ∨ (OR)
  conjuncts: Array<Conjunct>;
};

// Conjunct expressions (d)
export type Conjunct = {
  type: 'Conjunction';  // represents ∧ (AND)
  predicates: Array<Predicate>;
};

// Predicate expressions (π)
export type Predicate = {
  type: 'Match' | 'NotMatch';
  variable: StringVariable;
  regex: RegularExpression;
  position: number;  // k in Match(vi, r, k)
};

// String variables and constants
export type StringVariable = {
  type: 'StringVariable';
  name: string;
};

// Trace expressions (e)
export type TraceExpression = {
  type: 'Concatenate';
  expressions: Array<AtomicExpression>;
};

// Atomic expressions (f)
export type AtomicExpression = 
  | SubstringExpression 
  | ConstantExpression 
  | LoopExpression;

export type SubstringExpression = {
  type: 'SubStr';
  variable: StringVariable;
  start: Position;
  end: Position;
};

export type ConstantExpression = {
  type: 'ConstStr';
  value: string;
};

export type IntegerVariable = {
  type: 'IntegerVariable';
  name: string;
};

export type LoopExpression = {
  type: 'Loop';
  variable: IntegerVariable;  // bound integer variable w
  body: TraceExpression;
};

// Position expressions (p)
export type Position = 
  | ConstantPosition 
  | RegularExpressionPosition;

export type ConstantPosition = {
  type: 'CPos';
  value: number;  // k
};

export type RegularExpressionPosition = {
  type: 'Pos';
  regex1: RegularExpression;
  regex2: RegularExpression;
  count: IntegerExpression;
};

// Integer expressions (c)
export type IntegerExpression = 
  | ConstantInteger
  | LinearExpression;

export type ConstantInteger = {
  type: 'Constant';
  value: number;  // k
};

export type LinearExpression = {
  type: 'Linear';
  variable: IntegerVariable;  // w
  k1: number;      // k1
  k2: number;        // k2
};

// Regular expressions (r)
export type RegularExpression = {
  type: 'TokenSeq';
  tokens: Array<Token>;
};

// Tokens (T)
export type Token = 
  | CharacterClassToken
  | NegativeCharacterClassToken
  | SpecialToken;

export type CharacterClassToken = {
  type: 'CharacterClass';
  characters: 'Numeric' | 'Alphabetic' | 'Alphanumeric' | 'Accented' | 'Whitespace' | 'Any';
};

export type NegativeCharacterClassToken = {
  type: 'NegativeCharacterClass';
  characters: 'Numeric' | 'Alphabetic' | 'Alphanumeric' | 'Accented' |'Whitespace';
};

export type SpecialToken = {
  type: 'SpecialToken';
  characters: 'StartTok' | 'EndTok';
};
