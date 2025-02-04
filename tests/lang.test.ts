import { describe, expect, it } from 'vitest';
import { ConstantPosition, E, Interpreter, Position, SubstringExpression, TraceExpression } from '../src/lang';

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
        console.dir(traceExpression, { depth: null });

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


});