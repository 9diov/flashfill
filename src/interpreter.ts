import type {
  StringExpression,
  StringVariable,
  BooleanExpression,
  Predicate,
  TraceExpression,
  Position,
  RegularExpression,
  Token,
  SubstringExpression,
  ConstantExpression,
  LoopExpression
} from "./types"

type StringBindings = Record<string, string>; // e.g. {"v1": "Adam", "v2": "Sandler"}
type IntegerBindings = Record<string, number>; // e.g. {"w": 3} - used during loop iteration

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

    interpret(exp: StringExpression, inputs: StringBindings): EvaluationResult  {
        return {
            type: 'success',
            value: 'hello'
        };
    }

    interpretTrace(trace: TraceExpression, inputs: StringBindings): EvaluationResult {
        return {
            type: 'success',
            value: 'hello'
        };

    }

    interpretSubstring(sub: SubstringExpression, inputs: StringBindings): EvaluationResult {
        return {
            type: 'success',
            value: 'hello'
        };

    }


    interpretConstant(constant: ConstantExpression): EvaluationResult {
        return {
            type: 'success',
            value: 'hello'
        };
    }

    interpretLoop(loop: LoopExpression, inputs: StringBindings, integers: IntegerBindings): EvaluationResult {
        return {
            type: 'success',
            value: 'hello'
        };
    }

    interpretPosition(pos: Position, input: string): PositionResult {
        if (pos.type === 'CPos') {
            if (pos.value < 0 || pos.value >= input.length) {
                return {
                    type: 'error',
                    error: 'Invalid position'
                };
            } else {
                return {
                    type: 'success',
                    value: pos.value
                };
            }
        } else if (pos.type === 'Pos') {
            if (pos.count.type === 'Constant') {
                if (pos.count.value > 0) {
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
                } else {
                    let count = 0;
                    for (let i = input.length; i >= 0; i--) {
                        if (input.slice(0, i).match(mapRegex(pos.regex1) + "$") && 
                        input.slice(i).match("^" + mapRegex(pos.regex2))) {
                            count++;
                        }
                        if (count === -pos.count.value) {
                            return {
                                type: 'success',
                                value: i
                            };
                        }
                    }
                }
            } else if (pos.count.type === 'Linear') {
                return {
                    type: 'error',
                    error: 'Unsupported count type'
                };
            }
        }
        return {
            type: 'error',
            error: 'Invalid position'
        }
    }
}


function mapRegex(regex: RegularExpression): string {
    function mapToken(token: Token): string {
        if (token.type === 'SpecialToken') {
            switch (token.characters) {
                case 'StartTok': return '^';
                case 'EndTok': return '$';
            }
        } else if (token.type === 'CharacterClass') {
            switch (token.characters) {
                case 'Numeric': return '\\d';
                case 'Alphabetic': return '[a-zA-Z]';
                case 'Alphanumeric': return '\\w';
                case 'Accented': return '[\\u00C0-\\u017F]';
                case 'Whitespace': return '\\s';
                case 'Any': return '.';
            }
        } else if (token.type === 'NegativeCharacterClass') {
            switch (token.characters) {
                case 'Numeric': return '\\D';
                case 'Alphabetic': return '[^a-zA-Z]';
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