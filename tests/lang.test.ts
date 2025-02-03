import { describe, it, expect } from 'vitest';
import { Interpreter, SubstringExpression, TraceExpression, Position, ConstantPosition, Exp } from '../src/lang';

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
            Exp.Trace(
                Exp.SubStr("v1",
                    Exp.Pos(Exp.EmptyRegex(), Exp.Regex(Exp.NumToken()), 1),
                    Exp.CPos(-1)
                )
            );
        expect(traceExpression).toEqual(traceExpression2);
    });

    it('should interpret substring expression correctly', () => {
        const interpreter = new Interpreter();
        const traceExpression: TraceExpression =
            Exp.Trace(
                Exp.SubStr("v1",
                    Exp.Pos(Exp.EmptyRegex(), Exp.Regex(Exp.NumToken()), 1),
                    Exp.CPos(-1)
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

});