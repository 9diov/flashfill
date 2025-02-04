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
  characters: 'Numeric' | 'Alphabetic' | 'UpperAlphabet' | 'LowerAlphabet' | 'Alphanumeric' | 'Accented' | 'Whitespace' | 'Any';
};

export type NegativeCharacterClassToken = {
  type: 'NegativeCharacterClass';
  characters: 'Numeric' | 'Alphabetic' | 'UpperAlphabet' | 'LowerAlphabet' | 'Alphanumeric' | 'Accented' |'Whitespace';
};

export type SpecialToken = {
  type: 'SpecialToken';
  characters: 'StartTok' | 'EndTok' | 'SlashToken';
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
        return {
            type: 'success',
            value: 'hello'
        };
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
        const count = inputs["w"];
        const startPos = count === undefined ? this.interpretPosition(sub.start, inputStr) :
            this.interpretPosition(sub.start, inputStr, count as number);
        const endPos = count === undefined ? this.interpretPosition(sub.end, inputStr) :
            this.interpretPosition(sub.end, inputStr, count as number);
        console.log("input", inputStr, "start:", startPos, "end:", endPos);
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
                value: pos.value >= 0 ? pos.value : input.length + pos.value + 1
            };
        }
    }

    private interpretRegexPosition(pos: RegularExpressionPosition, input: string, count?: number): PositionResult {
        if (pos.count.type === 'Constant') {
            return this.interpretConstantCountPosition(pos, input);
        } else if (pos.count.type === 'Linear') {
            if (count === undefined) {
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
            return this.findForwardPosition(pos, input);
        } else {
            return this.findBackwardPosition(pos, input);
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
        console.log(input, mapRegex(pos.regex1), mapRegex(pos.regex2));
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
}

// Converts a string processing regex to a JavaScript regex
function mapRegex(regex: RegularExpression): string {
    function mapToken(token: Token): string {
        if (token.type === 'SpecialToken') {
            switch (token.characters) {
                case 'StartTok': return '^';
                case 'EndTok': return '$';
                case 'SlashToken': return '\\\\';
            }
        } else if (token.type === 'CharacterClass') {
            switch (token.characters) {
                case 'Numeric': return '\\d';
                case 'Alphabetic': return '[a-zA-Z]';
                case 'UpperAlphabet': return '[A-Z]';
                case 'LowerAlphabet': return '[a-z]';
                case 'Alphanumeric': return '\\w';
                case 'Accented': return '[\\u00C0-\\u017F]';
                case 'Whitespace': return '\\s';
                case 'Any': return '.';
            }
        } else if (token.type === 'NegativeCharacterClass') {
            switch (token.characters) {
                case 'Numeric': return '\\D';
                case 'Alphabetic': return '[^a-zA-Z]';
                case 'UpperAlphabet': return '[^A-Z]';
                case 'LowerAlphabet': return '[^a-z]';
                case 'Alphanumeric': return '\\W';
                case 'Accented': return '[^\\u00C0-\\u017F]';
                case 'Whitespace': return '\\S';
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
        return {
            type: 'TokenSeq',
            tokens: tokens
        };
    }

    static EmptyRegex(): RegularExpression {
        return {
            type: 'TokenSeq',
            tokens: []
        };
    }

    static NumToken(): CharacterClassToken {
        return {
            type: 'CharacterClass',
            characters: "Numeric"
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

    static SlashToken(): SpecialToken {
        return {
            type: 'SpecialToken',
            characters: "SlashToken"
        };
    }

}