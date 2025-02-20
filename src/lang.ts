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
  matches: number;  // k in Match(vi, r, k)
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
// export type RegularExpression = {
//   type: 'TokenSeq';
//   tokens: Array<Token>;
// };

export class RegularExpression {
    type: string = 'TokenSeq';
    tokens: Array<Token> = [];

    constructor(tokens: Array<Token>) { this.tokens = tokens; }
    append(r: RegularExpression) {
        return new RegularExpression([...this.tokens, ...r.tokens]);
    }

    addToken(token: Token) {
        this.tokens.push(token);
        return this;
    }

    clone() {
        return new RegularExpression([...this.tokens]);
    }
}

// Tokens (T)
export type Token =
  | CharacterClassToken
  | NegativeCharacterClassToken
  | SpecialToken;

export type CharacterClassToken = {
  type: 'CharacterClass';
  characters: 'Numeric' | 'Alphabetic' | 'UpperAlphabet' | 'LowerAlphabet'
    | 'Alphanumeric' | 'Accented' | 'Whitespace' | 'Any';
};

export type NegativeCharacterClassToken = {
  type: 'NegativeCharacterClass';
  characters: 'Numeric' | 'Alphabetic' | 'UpperAlphabet' | 'LowerAlphabet' | 'Alphanumeric' | 'Accented' |'Whitespace';
};

export type SpecialToken = {
  type: 'SpecialToken';
  characters: 'StartTok' | 'EndTok'
    | 'SlashToken' | 'LeftParenToken' | 'RightParenToken' | 'DotToken' | 'HyphenToken';
};

// ********************************
// Interpreting the string expression language
// ********************************

// e.g. {"v1": "Adam", "v2": "Sandler"}
// or {"w": 3} - used during loop iteration
type Bindings = Record<string, string | number>;

// Results of different expression evaluations
export interface EvaluationResult {
  type: 'success' | 'error';
  value?: string;
  error?: string;
}

export interface PositionResult {
  type: 'success' | 'error';
  value?: number;
  error?: string;
}

export class Interpreter {
    constructor() {}

    interpret(exp: StringExpression, inputs: Bindings): EvaluationResult  {
        for (const { condition, result } of exp.cases) {
            if (this.interpretBoolean(condition, inputs)) {
                return this.interpretTrace(result, inputs);
            }
        }
    }

    interpretBoolean(exp: BooleanExpression, inputs: Bindings): boolean {
        for (const conjunct of exp.conjuncts) {
            if (this.interpretConjunct(conjunct, inputs)) {
                return true;
            }
        }
        return false;
    }

    interpretConjunct(conjunct: Conjunct, inputs: Bindings): boolean {
        for (const predicate of conjunct.predicates) {
            if (!this.interpretPredicate(predicate, inputs)) {
                return false;
            }
        }
        return true;
    }

    interpretPredicate(predicate: Predicate, inputs: Bindings): boolean {
        const input = inputs[predicate.variable.name] as string;
        const regex = mapRegex(predicate.regex);
        const match = input.match(regex);
        return predicate.type === 'Match' ? match !== null : match === null;
    }

    interpretTrace(trace: TraceExpression, inputs: Bindings): EvaluationResult {
        const results: string[] = [];

        for (const exp of trace.expressions) {
            let result: EvaluationResult;

            switch (exp.type) {
                case 'SubStr':
                    result = this.interpretSubstring(exp, inputs);
                    break;
                case 'ConstStr':
                    result = this.interpretConstant(exp);
                    break;
                case 'Loop':
                    result = this.interpretLoop(exp, inputs);
                    break;
                default:
                    throw new Error('Unsupported expression type. This should never happen');
            }

            if (result.type === 'error') {
                return result; // Break early on any error
            }

            results.push(result.value!);
        }

        return {
            type: 'success',
            value: results.join('')
        };
    }

    interpretSubstring(sub: SubstringExpression, inputs: Bindings): EvaluationResult {
        if (inputs[sub.variable.name] === undefined) {
            return {
                type: 'error',
                value: 'undefined string variable'
            }
        }
        const inputStr = inputs[sub.variable.name] as string; // input string
        // TODO: Change this to use the actual count variable
        const count = inputs["w"];
        const startPos = count === undefined ? this.interpretPosition(sub.start, inputStr) :
            this.interpretPosition(sub.start, inputStr, count as number);
        const endPos = count === undefined ? this.interpretPosition(sub.end, inputStr) :
            this.interpretPosition(sub.end, inputStr, count as number);
        // console.log("input", inputStr, "start:", startPos, "end:", endPos, "output:", inputStr.slice(startPos.value, endPos.value));
        if (startPos.type === 'error' || endPos.type === 'error') {
            return {
                type: 'error',
                value: 'null substring'
            }
        }
        return {
            type: 'success',
            value: inputStr.slice(startPos.value, endPos.value)
        };
    }

    interpretConstant(constant: ConstantExpression): EvaluationResult {
        return {
            type: 'success',
            value: constant.value
        };
    }

    interpretLoop(loop: LoopExpression, inputs: Bindings): EvaluationResult {
        const loopVar = loop.variable.name;
        let count = 1, output = '';
        while (true) {
            const result = this.interpretTrace(loop.body, { ...inputs, [loopVar]: count });
            if (result.type === "error") break;
            output += result.value;
            count += 1;
        }

        return {
            type: 'success',
            value: output
        };
    }

    interpretPosition(pos: Position, input: string, count?: number): PositionResult {
        if (pos.type === 'CPos') {
            return this.interpretConstantPosition(pos, input);
        } else if (pos.type === 'Pos') {
            return this.interpretRegexPosition(pos, input, count);
        }
        return {
            type: 'error',
            error: 'Invalid position'
        };
    }

    private interpretConstantPosition(pos: ConstantPosition, input: string): PositionResult {
        if (pos.value < -input.length || pos.value >= input.length) {
            return {
                type: 'error',
                error: 'Invalid position'
            };
        } else {
            return {
                type: 'success',
                // negative position is relative to the end of the string
                value: pos.value >= 0 ? pos.value : input.length + pos.value + 1
            };
        }
    }

    private interpretRegexPosition(pos: RegularExpressionPosition, input: string, count?: number): PositionResult {
        if (pos.count.type === 'Constant') {
            return this.interpretConstantCountPosition(pos, input);
        } else if (pos.count.type === 'Linear') {
            if (count === undefined) {
                console.log("integer variable for linear not defined", pos.count);
                return {
                    type: 'error',
                    error: 'integer variable for linear not defined'
                };
            }
            return this.interpretLinearCountPosition(pos, input, count);
        }
        return {
            type: 'error',
            error: 'Invalid position'
        };
    }

    private interpretConstantCountPosition(pos: RegularExpressionPosition, input: string): PositionResult {
        if ((pos.count as ConstantInteger).value > 0) {
            return this.findForwardPosition2(pos, input);
        } else {
            return this.findBackwardPosition2(pos, input);
        }
    }

    private interpretLinearCountPosition(pos: RegularExpressionPosition, input: string, count: number): PositionResult {
        const pos1: RegularExpressionPosition = {...pos,
             count: {
                 type: 'Constant',
                 value: (pos.count as LinearExpression).k1 * count + (pos.count as LinearExpression).k2
            }
        };
        return this.interpretConstantCountPosition(pos1, input);
    }

    private findForwardPosition(pos: RegularExpressionPosition, input: string): PositionResult {
        let count = 0;
        let cursor = 0;

        for (let i = 0; i < input.length; i++) {
            if (input.slice(0, i).match(mapRegex(pos.regex1) + "$") && 
                input.slice(i).match("^" + mapRegex(pos.regex2))) {
                count++;
            }
            if (count === pos.count.value) {
                return {
                    type: 'success',
                    value: i
                };
            }
        }
        return {
            type: 'error',
            error: 'Position not found'
        };
    }

    // Forward matching when pos.count.value > 0
    private findForwardPosition2(pos: RegularExpressionPosition, input: string): PositionResult {
        const regex1 = mapRegex(pos.regex1);
        const regex2 = mapRegex(pos.regex2);
        if (regex1 === '' && regex2 === '') {
            return {
                type: 'error',
                error: 'Both regexes are empty'
            }
        }

        if (regex1 === '') {
            const Regex2 = new RegExp(mapRegex(pos.regex2), 'g');
            let count = 0;
            let result;
            while(result = Regex2.exec(input)) {
                count++;
                if (count === pos.count.value) {
                    return {
                        type: 'success',
                        value: result.index
                    };
                }
            }
        }

        // Going through all the matches of regex1
        // and checking if the prefix of the next part of the string matches regex2
        // if it does, we increment the count
        // return the position when count reaches the desired value
        const Regex1 = new RegExp(regex1, 'g');
        let count = 0;
        let cursor = -1; // for case when no match is found
        let result;
        while (result = Regex1.exec(input)) {
            cursor = Regex1.lastIndex;
            if (input.slice(cursor).match("^" + regex2)) count++;
            if (count === pos.count.value) {
                // console.log("cursor", cursor, "count", count, "result", result);
                return {
                    type: 'success',
                    value: cursor
                };
            }
        }

        return {
            type: 'error',
            error: 'Position not found'
        };
    }

    private findBackwardPosition(pos: RegularExpressionPosition, input: string): PositionResult {
        let count = 0;
        for (let i = input.length; i >= 0; i--) {
            if (input.slice(0, i).match(mapRegex(pos.regex1) + "$") && 
                input.slice(i).match("^" + mapRegex(pos.regex2))) {
                count++;
            }
            if (count === -(pos.count as ConstantInteger).value) {
                return {
                    type: 'success',
                    value: i
                };
            }
        }
        return {
            type: 'error',
            error: 'Position not found'
        };
    }

    // Backward matching when pos.count.value < 0
    private findBackwardPosition2(pos: RegularExpressionPosition, input: string): PositionResult {
        const regex1 = mapRegex(pos.regex1);
        const regex2 = mapRegex(pos.regex2);

        // Exec an empty regex in JS resuts in infinite loop, hence special
        // handling is needed
        if (regex1 === '' && regex2 === '') {
            return {
                type: 'error',
                error: 'Both regexes are empty'
            }
        }

        const indexes = [];
        if (regex1 === '') {
            const Regex2 = new RegExp(mapRegex(pos.regex2), 'g');
            let result;
            while(result = Regex2.exec(input)) {
                indexes.push(result.index);
            }
            if (-pos.count.value > indexes.length) {
                return {
                    type: 'error',
                    error: 'Position not found'
                };
            } else {
                return {
                    type: 'success',
                    value: indexes[indexes.length + pos.count.value]
                };
            }
        }

        // Going through all the matches of regex1
        // and checking if the prefix of the next part of the string matches regex2
        // if it does, we increment the count
        // return the position when count reaches the desired value
        const Regex1 = new RegExp(regex1, 'g');
        let cursor = -1; // for case when no match is found
        while (Regex1.exec(input)) {
            cursor = Regex1.lastIndex;
            if (input.slice(cursor).match("^" + regex2)) {
                indexes.push(cursor);
            }
        }

        if (-pos.count.value > indexes.length) {
            return {
                type: 'error',
                error: 'Position not found'
            };
        } else {
            return {
                type: 'success',
                value: indexes[indexes.length + pos.count.value]
            };
        }
    }
}

// Converts a string processing regex to a JavaScript regex
export function mapRegex(regex: RegularExpression): string {
    function mapToken(token: Token): string {
        if (token.type === 'SpecialToken') {
            switch (token.characters) {
                case 'StartTok': return '^';
                case 'EndTok': return '$';
                case 'SlashToken': return '[\\\\\\/]';
                case 'LeftParenToken': return '\\(';
                case 'RightParenToken': return '\\)';
                case 'DotToken': return '\\.';
                case 'HyphenToken': return '-';
            }
        } else if (token.type === 'CharacterClass') {
            switch (token.characters) {
                case 'Numeric': return '\\d+';
                case 'Alphabetic': return '[a-zA-Z]+';
                case 'UpperAlphabet': return '[A-Z]+';
                case 'LowerAlphabet': return '[a-z]+';
                case 'Alphanumeric': return '\\w+';
                case 'Accented': return '[\\u00C0-\\u017F]+';
                case 'Whitespace': return '\\s+';
                case 'Any': return '.+';
            }
        } else if (token.type === 'NegativeCharacterClass') {
            switch (token.characters) {
                case 'Numeric': return '\\D+';
                case 'Alphabetic': return '[^a-zA-Z]+';
                case 'UpperAlphabet': return '[^A-Z]+';
                case 'LowerAlphabet': return '[^a-z]+';
                case 'Alphanumeric': return '\\W+';
                case 'Accented': return '[^\\u00C0-\\u017F]+';
                case 'Whitespace': return '\\S+';
            }
        }
        else {
            throw new Error('Unsupported token type');
        }
    }

    if (regex.type === 'TokenSeq') {
        return regex.tokens.map(mapToken).join('');
    } else {
        throw new Error('Unsupported regex type');
    }
}

// ********************************
// Utitilies functions to succintly create expressions
// ********************************

export class E {
    static Switch(...cases: Array<[BooleanExpression, TraceExpression]>): StringExpression {
        return {
            type: 'Switch',
            cases: cases.map(([condition, result]) => ({ condition, result }))
        };
    }

    // top level AND, can't be nested with other ands/ors
    static And(...predicates: Array<Predicate>): BooleanExpression {
        return {
            type: 'Disjunction',
            conjuncts: [{ type: 'Conjunction', predicates: predicates }]
        }
    }

    // top level OR, can't be nested with other ands/ors
    static Or(...predicates: Array<Predicate>): BooleanExpression {
        return {
            type: 'Disjunction',
            conjuncts: predicates.map(p => ({ type: 'Conjunction', predicates: [p] }))
        }
    }

    static Bool(pred: Predicate): BooleanExpression {
        return {
            type: 'Disjunction',
            conjuncts: [{ type: 'Conjunction', predicates: [pred] }]
        }
    }

    static Match(vi: string, r: RegularExpression, k: number = 1): Predicate {
        return {
            type: 'Match',
            variable: { type: 'StringVariable', name: vi },
            regex: r,
            matches: k
        };
    }

    static NotMatch(vi: string, r: RegularExpression, k: number = 1): Predicate {
        return {
            type: 'NotMatch',
            variable: { type: 'StringVariable', name: vi },
            regex: r,
            matches: k
        };
    }

    static Variable(name: string): AtomicExpression {
        return {
            type: 'SubStr',
            variable: { type: 'StringVariable', name: name },
            start: { type: 'CPos', value: 0 },
            end: { type: 'CPos', value: -1 }
        };
    }

    static Empty(): AtomicExpression {
        return {
            type: 'ConstStr',
            value: ''
        };
    }

    static Trace(...expressions: Array<AtomicExpression>): TraceExpression {
        return {
            type: 'Concatenate',
            expressions: expressions
        };
    }

    static SubStr(vi, r1, r2): SubstringExpression {
        return {
            type: 'SubStr',
            variable: { type: 'StringVariable', name: vi },
            start: r1,
            end:r2
        };
    }

    static SubStr2(vi: string, r: RegularExpression, c: number | string): SubstringExpression {
        return this.SubStr(vi,
            this.Pos(this.EmptyRegex(), r, c),
            this.Pos(r, this.EmptyRegex(), c)
        );
    }

    static ConstStr(value: string): ConstantExpression {
        return {
            type: 'ConstStr',
            value: value
        };
    }

    static Loop(w: string, e: TraceExpression): LoopExpression {
        return {
            type: 'Loop',
            variable: { type: 'IntegerVariable', name: w },
            body: e
        };
    }

    static Pos(r1: RegularExpression, r2: RegularExpression, c: number | string): RegularExpressionPosition {
        const count: IntegerExpression = typeof c === 'number' ?
            { type: 'Constant', value: c } :
            { type: 'Linear', variable: { type: 'IntegerVariable', name: c}, k1: 1, k2: 0 };
        return {
            type: 'Pos',
            regex1: r1,
            regex2: r2,
            count: count
        };
    }

    static CPos(c: number): ConstantPosition {
        return {
            type: 'CPos',
            value: c
        };
    }

    static Regex(...tokens: Array<Token>): RegularExpression {
        return new RegularExpression(tokens);
    }

    static EmptyRegex(): RegularExpression {
        return new RegularExpression([]);
    }

    static NumToken(): CharacterClassToken {
        return {
            type: 'CharacterClass',
            characters: "Numeric"
        };
    }

    static CharToken(): CharacterClassToken {
        return {
            type: 'CharacterClass',
            characters: "Alphabetic"
        };
    }

    static UpperToken(): CharacterClassToken {
        return {
            type: 'CharacterClass',
            characters: "UpperAlphabet"
        };
    }

    static LowerToken(): CharacterClassToken {
        return {
            type: 'CharacterClass',
            characters: "LowerAlphabet"
        };
    }

    static NumCharToken(): CharacterClassToken {
        return {
            type: 'CharacterClass',
            characters: "Alphanumeric"
        };
    }

    static AccentedToken(): CharacterClassToken {
        return {
            type: 'CharacterClass',
            characters: "Accented"
        };
    }

    static StartToken(): SpecialToken {
        return {
            type: 'SpecialToken',
            characters: "StartTok"
        };
    }

    static EndToken(): SpecialToken {
        return {
            type: 'SpecialToken',
            characters: "EndTok"
        };
    }

    static SlashToken(): SpecialToken {
        return {
            type: 'SpecialToken',
            characters: "SlashToken"
        };
    }

    static LeftParenToken(): SpecialToken {
        return {
            type: 'SpecialToken',
            characters: "LeftParenToken"
        };
    }

    static RightParenToken(): SpecialToken {
        return {
            type: 'SpecialToken',
            characters: "RightParenToken"
        };
    }

    static DotToken(): SpecialToken {
        return {
            type: 'SpecialToken',
            characters: "DotToken"
        };
    }

    static HyphenToken(): SpecialToken {
        return {
            type: 'SpecialToken',
            characters: "HyphenToken"
        };
    }

    static SpaceToken(): CharacterClassToken {
        return {
            type: 'CharacterClass',
            characters: "Whitespace"
        };
    }

    static NonSpaceToken(): NegativeCharacterClassToken {
        return {
            type: 'NegativeCharacterClass',
            characters: "Whitespace"
        };
    }

    static Int(value: number): IntegerExpression {
        return {
            type: 'Constant',
            value: value
        };
    }
}

export const ALL_TOKENS = [
    E.NumToken(),
    E.CharToken(),
    E.UpperToken(),
    E.LowerToken(),
    E.NumCharToken(),
    E.AccentedToken(),
    E.SpaceToken(),
    E.NonSpaceToken(),
    // E.StartToken(),
    // E.EndToken()
];
