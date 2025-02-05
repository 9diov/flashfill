import { describe, it, expect } from 'vitest';
import { generatePosition, generateRegex, getIndistinguishablePartitions, getIndistinguishableTokens } from '../../src/algo/algo';
import { PositionSet } from '../../src/algo/types';
import { E } from '../../src/lang';

describe('generateRegex', () => {
    it('should generate regex set for a given string', () => {
        const str = "Hello World";
        const result = generateRegex(E.Regex(E.UpperToken()), str);

        expect(result).toEqual({
            type: 'RegExpSet',
            tokens: [{
                type: 'TokenSet', tokens: new Set([
                    E.CharToken(),
                    E.NumCharToken(),
                    E.UpperToken(),
                    E.NonSpaceToken()
                ])
            }]
        });
    });

    it('should generate regex set for a given string', () => {
        const str = "Hello, 37th World";
        const result = generateRegex(E.Regex(E.NumToken()), str);

        expect(result).toEqual({
            type: 'RegExpSet',
            tokens: [{
                type: 'TokenSet', tokens: new Set([
                    E.NumToken()
                ])
            }]
        });
    });
});

describe('getIndistinguishablePartitions', () => {
    const str = "Hello World";
    const result = getIndistinguishablePartitions(str);
    console.dir(result, { depth: null });
});

// describe('generatePosition', () => {
//     it('should generate positions for a given string and position', () => {
//         const str = "hello world";
//         const pos = 6;
//         const result: PositionSet = generatePosition(str, pos);

//         expect(result).toEqual(new Set([
//             { type: 'CPos', value: 6 },
//             { type: 'CPos', value: -5 },
//             {
//                 type: 'RegExpPositionSet',
//                 regex1: { type: 'RegExpSet', tokens: [{ type: 'TokenSet', tokens: ['h', 'e', 'l', 'l', 'o'] }] },
//                 regex2: { type: 'RegExpSet', tokens: [{ type: 'TokenSet', tokens: [' ', 'w', 'o', 'r', 'l', 'd'] }] },
//                 count: { type: 'IntegerSet', values: new Set([1, -1]) }
//             }
//         ]));
//     });

//     it('should handle empty string', () => {
//         const str = "";
//         const pos = 0;
//         const result: PositionSet = generatePosition(str, pos);

//         expect(result).toEqual(new Set([
//             { type: 'CPos', value: 0 },
//             { type: 'CPos', value: 0 }
//         ]));
//     });

//     it('should handle position at the end of the string', () => {
//         const str = "hello";
//         const pos = 5;
//         const result: PositionSet = generatePosition(str, pos);

//         expect(result).toEqual(new Set([
//             { type: 'CPos', value: 5 },
//             { type: 'CPos', value: 0 },
//             {
//                 type: 'RegExpPositionSet',
//                 regex1: { type: 'RegExpSet', tokens: [{ type: 'TokenSet', tokens: ['h', 'e', 'l', 'l', 'o'] }] },
//                 regex2: { type: 'RegExpSet', tokens: [{ type: 'TokenSet', tokens: [] }] },
//                 count: { type: 'IntegerSet', values: new Set([1, -1]) }
//             }
//         ]));
//     });
// });