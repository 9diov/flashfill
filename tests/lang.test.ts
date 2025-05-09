import { describe, expect, it } from 'vitest';
import { ConstantPosition, E, Interpreter, Position, StringExpression, SubstringExpression, TraceExpression } from '../src/lang';

describe('Interpreter', () => {
    it('should use utility functions correctly', () => {
        const startPos: Position = {
            type: 'Pos',
            regex1: {
                type: 'TokenSeq',
                tokens: []
            },
            regex2: {
                type: 'TokenSeq',
                tokens: [{ type: 'CharacterClass', characters: 'Numeric' }]
            },
            count: { type: 'Constant', value: 1 }

        };
        const endPos: ConstantPosition = {
            type: 'CPos',
            value: -1
        };
        const subStringExpression: SubstringExpression = {
            type: 'SubStr',
            variable: { type: 'StringVariable', name: 'v1' },
            start: startPos,
            end: endPos
        };
        const traceExpression: TraceExpression = {
            type: 'Concatenate',
            expressions: [subStringExpression]
        };
        const traceExpression2: TraceExpression =
            E.Trace(
                E.SubStr("v1",
                    E.Pos(E.EmptyRegex(), E.Regex(E.NumToken()), 1),
                    E.CPos(-1)
                )
            );
        expect(traceExpression).toEqual(traceExpression2);
    });

    it('should be able to extract quantities from string', () => {
        const interpreter = new Interpreter();
        const traceExpression: TraceExpression = E.Trace(
                E.SubStr("v1",
                    E.Pos(E.EmptyRegex(), E.Regex(E.NumToken()), 1),
                    E.CPos(-1)
                )
            );

        const examples = [
            { input: ["BTR KRNL WK CORN 15Z"], output: "15Z" },
            { input: ["CAMP DRY DBL NDL 3.6 OZ"], output: "3.6 OZ" },
            { input: ["CHORE BOY HD SC SPNG 1 PK"], output: "1 PK" },
            { input: ["FRENCH WORCESTERSHIRE 5 Z"], output: "5 Z" },
            { input: ["O F TOMATO PASTE 6 OZ"], output: "6 OZ" }
        ];

        for (const example of examples) {
            expect(interpreter.interpretTrace(traceExpression, { v1: example.input[0] })).toEqual({ type: 'success', value: example.output });
        }
    });

    it('should be able to extract parent directory path from file path', () => {
        const interpreter = new Interpreter();
        const traceExpression: TraceExpression = E.Trace(
            E.SubStr("v1",
                E.CPos(0),
                E.Pos(E.Regex(E.SlashToken()), E.EmptyRegex(), -1)
            )
        );

        const examples = [
            {
                input: ["Company\\Code\\index.html"],
                output: "Company\\Code\\"
            },
            {
                input: ["Company\\Docs\\Spec\\specs.doc"],
                output: "Company\\Docs\\Spec\\"
            },
            // Additional test cases
            {
                input: ["Project\\Source\\main.cpp"],
                output: "Project\\Source\\"
            },
            {
                input: ["Data\\Reports\\2024\\report.xlsx"],
                output: "Data\\Reports\\2024\\"
            },
            {
                input: ["Test\\Unit\\Core\\tests.js"],
                output: "Test\\Unit\\Core\\"
            }
        ];

        for (const example of examples) {
            expect(interpreter.interpretTrace(traceExpression, { v1: example.input[0] }))
                .toEqual({ type: 'success', value: example.output });
        }
    });

    it('should be able to extract acronyms from text by concatenating uppercase letters', () => {
        const interpreter = new Interpreter();
        const traceExpression: TraceExpression = E.Trace(
            E.Loop(
                "w",
                E.Trace(
                    E.SubStr2("v1", E.Regex(E.UpperToken()), "w")
                )
            )
        );
        // console.dir(traceExpression, { depth: null });

        const examples = [
            {
                input: ["International Business Machines"],
                output: "IBM"
            },
            {
                input: ["Principles Of Programming Languages"],
                output: "POPL"
            },
            {
                input: ["International Conference on Software Engineering"],
                output: "ICSE"
            },
            // Additional test cases
            {
                input: ["Association for Computing Machinery"],
                output: "ACM"
            },
            {
                input: ["World Wide Web Consortium"],
                output: "WWWC"
            }
        ];

        for (const example of examples) {
            expect(interpreter.interpretTrace(traceExpression, { v1: example.input[0] }))
                .toEqual({ type: 'success', value: example.output });
        }
    });

    it('should extract and concatenate odds from parentheses with # separator', () => {
        const interpreter = new Interpreter();
        const traceExpression: TraceExpression = E.Trace(
            E.Loop(
                "w",
                E.Trace(
                    E.SubStr("v1",
                        E.Pos(E.Regex(E.LeftParenToken()), E.Regex(E.NumToken(), E.SlashToken()), "w"),
                        E.Pos(E.Regex(E.SlashToken(), E.NumToken()), E.Regex(E.RightParenToken()), "w")
                    ),
                    E.ConstStr(" # ")
                )
            )
        );

        const examples = [
            {
                input: ["(6/7)(4/5)(14/1)"],
                output: "6/7 # 4/5 # 14/1 # "
            },
            {
                input: ["49(28/11)(14/1)"],
                output: "28/11 # 14/1 # "
            },
            {
                input: ["()(28/11)(14/1)"],
                output: "28/11 # 14/1 # "
            },
            // Additional test cases
            {
                input: ["(3/4)(8/2)"],
                output: "3/4 # 8/2 # "
            },
            {
                input: ["100(7/3)(21/5)(2/9)"],
                output: "7/3 # 21/5 # 2/9 # "
            }
        ];

        for (const example of examples) {
            expect(interpreter.interpretTrace(traceExpression, { v1: example.input[0] }))
                .toEqual({ type: 'success', value: example.output });
        }
    });

    it('should remove excess spaces and normalize whitespace', () => {
        const interpreter = new Interpreter();
        const traceExpression: TraceExpression = E.Trace(
            E.Loop(
                "w",
                E.Trace(
                    E.SubStr("v1",
                        E.Pos(E.EmptyRegex(), E.Regex(E.NonSpaceToken()), "w"),
                        E.Pos(E.Regex(E.NonSpaceToken()), E.Regex(E.SpaceToken(), E.NonSpaceToken()), "w")
                    ),
                    E.ConstStr(" ")
                )
            ),
            E.SubStr2("v1", E.Regex(E.NonSpaceToken()), -1)
        );
        // console.dir(traceExpression, { depth: null });

        const examples = [
            {
                input: ["Oege    de    Moor"],
                output: "Oege de Moor"
            },
            {
                input: ["Kathleen   Fisher    AT&T Labs"],
                output: "Kathleen Fisher AT&T Labs"
            },
            // Additional test cases
            {
                input: ["   Hello     World   "],
                output: "Hello World"
            },
            {
                input: ["First    Second     Third"],
                output: "First Second Third"
            },
            {
                input: ["No  Extra   Spaces  Here"],
                output: "No Extra Spaces Here"
            }
        ];

        for (const example of examples) {
            expect(interpreter.interpretTrace(traceExpression, { v1: example.input[0] }))
                .toEqual({ type: 'success', value: example.output });
        }
    });

    it('should conditionally concatenate names with titles', () => {
        const interpreter = new Interpreter();
        const stringExpression: StringExpression = E.Switch([
                E.And(
                    E.Match("v1", E.Regex(E.CharToken())),
                    E.Match("v2", E.Regex(E.CharToken()))
                ),
                E.Trace(
                    E.Variable("v1"),
                    E.ConstStr("("),
                    E.Variable("v2"),
                    E.ConstStr(")")
                )
            ],
            [
                E.Or(
                    E.NotMatch("v1", E.Regex(E.CharToken())),
                    E.NotMatch("v2", E.Regex(E.CharToken()))
                ),
                E.Trace(E.Empty())
            ]
        );

        const examples = [
            {
                input: ["Alex", "Asst."],
                output: "Alex(Asst.)"
            },
            {
                input: ["Jim", "Manager"],
                output: "Jim(Manager)"
            },
            {
                input: ["Ryan", ""],
                output: ""
            },
            {
                input: ["", "Asst."],
                output: ""
            },
            // Additional test cases
            {
                input: ["Bob", "Director"],
                output: "Bob(Director)"
            }
        ];

        for (const example of examples) {
            expect(interpreter.interpret(stringExpression,
                { v1: example.input[0], v2: example.input[1] })
            ).toEqual({ type: 'success', value: example.output });
        }
     });

    it('should parse dates in multiple formats and extract day', () => {
        const interpreter = new Interpreter();
        const stringExpression: StringExpression = E.Switch(
            [
                E.Bool(E.Match("v1", E.Regex(E.SlashToken()))),
                E.Trace(
                    E.SubStr("v1",
                        E.Pos(E.Regex(E.StartToken()), E.EmptyRegex(), 1),
                        E.Pos(E.EmptyRegex(), E.Regex(E.SlashToken()), 1)
                    )
                )
            ],
            [
                E.Bool(E.Match("v1", E.Regex(E.DotToken()))),
                E.Trace(
                    E.SubStr("v1",
                        E.Pos(E.Regex(E.DotToken()), E.EmptyRegex(), 1),
                        E.Pos(E.EmptyRegex(), E.Regex(E.DotToken()), 2)
                    )
                )
            ],
            [
                E.Bool(E.Match("v1", E.Regex(E.HyphenToken()))),
                E.Trace(
                    E.SubStr("v1",
                        E.Pos(E.Regex(E.HyphenToken()), E.EmptyRegex(), 2),
                        E.Pos(E.Regex(E.EndToken()), E.EmptyRegex(), 1)
                    )
                )
            ]
        );

        const examples = [
            {
                input: ["01/21/2001"],
                output: "01"
            },
            {
                input: ["22.02.2002"],
                output: "02"
            },
            {
                input: ["2003-23-03"],
                output: "03"
            },
            // Additional test cases
            {
                input: ["05/15/2023"],
                output: "05"
            },
            {
                input: ["31.12.2024"],
                output: "12"
            }
        ];

        for (const example of examples) {
            expect(interpreter.interpret(stringExpression, { v1: example.input[0] }))
                .toEqual({ type: 'success', value: example.output });
        }
    });
});