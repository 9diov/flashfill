import { describe, it, expect } from 'vitest';
import { generatePosition, interpretPosition } from '../src/algo';
import { E, Interpreter } from '../src/lang';
import { generateRegexesMatchingAfter, generateRegexesMatchingBefore, IPartitionCache } from '../src/algo/match';
import { allPositions, PositionSet } from '../src/algo/types';

// describe('generateRegex', () => {
//     it('should generate regex set for a given regular expression and string', () => {
//         const r = E.Regex(E.CharToken());
//         const str = "abcabc";
//         const result = generateRegex(r, str);

//         expect(result).toEqual({
//             type: 'RegExpSet',
//             tokens: [
//                 { type: 'TokenSet', tokens: new Set([
//                     E.CharToken(),
//                     E.LowerToken(),
//                     E.NumCharToken(),
//                     E.NonSpaceToken()])
//                 },
//             ]
//         });
//     });

//     // it('should handle empty string', () => {
//     //     const r = E.Regex(E.CharToken());
//     //     const str = "";
//     //     const result = generateRegex(r, str);

//     //     expect(result).toEqual({
//     //         type: 'RegExpSet',
//     //         tokens: [
//     //             { type: 'TokenSet', tokens: [] },
//     //             { type: 'TokenSet', tokens: [] },
//     //             { type: 'TokenSet', tokens: [] }
//     //         ]
//     //     });
//     // });

//     it('should handle empty tokens', () => {
//         const r = E.Regex();
//         const str = "abcabc";
//         const result = generateRegex(r, str);

//         expect(result).toEqual({
//             type: 'RegExpSet',
//             tokens: []
//         });
//     });

//     it('should handle tokens not in string', () => {
//         const r = E.Regex(E.NumToken());
//         const str = "abcabc";
//         const result = generateRegex(r, str);

//         // should returns all other tokens that don't match the string
//         expect(result).toEqual({
//             type: 'RegExpSet',
//             tokens: [{
//                 type: 'TokenSet',
//                 tokens: new Set([
//                     E.NumToken(),
//                     E.UpperToken(),
//                     E.SpaceToken(),
//                     E.AccentedToken()
//                 ])
//             }]
//         });
//     });
// });

describe('generatePosition', () => {
    const verifyPosition = (str: string, k: number, result: PositionSet) => {
        const positions = generatePosition(str, k);
        expect(positions.size).toBeGreaterThan(0);

        const interpreter = new Interpreter();
        for (const pos of allPositions(positions)) {
            // console.dir(pos, { depth: null });
            const result = interpreter.interpretPosition(pos, str);
            if (result.type === 'error') {
                console.error("result:", result, "pos:", pos);
                break;
            }
            // console.dir(result, { depth: null });
            expect(result.type).toEqual('success');

            if (result.value !== k) {
                console.error("str:", str, "result:", result, "pos:", pos, "k:", k);
                console.dir(pos, { depth: null });
            }
            expect(result.value).toEqual(k);
        }
    }

    it('should generate position set for a given string and position', () => {
        const str = "a1";
        const k = 1;

        const positions = generatePosition(str, k);
        expect(positions.size).toEqual(6);

        verifyPosition(str, k, positions);
    });

    it('should handle empty string', () => {
        const str = "";
        const k = 0;

        expect(() => { generatePosition(str, 0) }).toThrow();
    });

    it('should handle position at the start of the string', () => {
        const str = "abcabc";
        const k = 0;

        const positions = generatePosition(str, k);
        verifyPosition(str, k, positions);
    });

    it('should handle position at the end of the string', () => {
        const str = "abcabc";
        const k = str.length - 1;

        const positions = generatePosition(str, k);
        verifyPosition(str, k, positions);
    });

    it('should handle position in the middle of the string', () => {
        const str = "abcabc";
        const k = 3;

        const positions = generatePosition(str, k);
        verifyPosition(str, k, positions);
    });

    it('should handle position in the middle of the string with repeated tokens', () => {
        const str = "aa";
        const k = 1;

        const positions = generatePosition(str, k);
        verifyPosition(str, k, positions);
    });
});