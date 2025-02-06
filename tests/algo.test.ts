import { describe, it, expect } from 'vitest';
import { generatePosition } from '../src/algo';
import { E } from '../src/lang';
import { generateRegexesMatchingAfter, generateRegexesMatchingBefore, IPartitionCache } from '../src/algo/match';



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
    it('should generate position set for a given string and position', () => {
        const str = "ab1d";
        const k = 2;

        const result = generatePosition(str, k);
        expect(result.size).toBeGreaterThan(0);
        expect(result.size).toEqual(12);

        // TODO: Use interpetPosition to check if the generated positions are correct

    });

    // it('should handle empty string', () => {
    //     const str = "";
    //     const k = 0;
    //     const result = generatePosition(str, k);

    //     expect(result).toEqual(new Set([
    //         { type: 'CPos', value: k },
    //         { type: 'CPos', value: -(str.length - k) }
    //     ]));
    // });

    // it('should handle position at the start of the string', () => {
    //     const str = "abcabc";
    //     const k = 0;
    //     const result = generatePosition(str, k);

    //     expect(result).toEqual(new Set([
    //         { type: 'CPos', value: k },
    //         { type: 'CPos', value: -(str.length - k) },
    //         {
    //             type: 'RegExpPositionSet',
    //             regex1: {
    //                 type: 'RegExpSet',
    //                 tokens: [
    //                     { type: 'TokenSet', tokens: new Set([E.CharToken()]) }
    //                 ]
    //             },
    //             regex2: {
    //                 type: 'RegExpSet',
    //                 tokens: [
    //                     { type: 'TokenSet', tokens: new Set([E.CharToken()]) }
    //                 ]
    //             },
    //             count: {
    //                 type: 'IntegerSet',
    //                 values: new Set([E.Int(1), E.Int(2)])
    //             }
    //         }
    //     ]));
    // });

    // it('should handle position at the end of the string', () => {
    //     const str = "abcabc";
    //     const k = str.length - 1;
    //     const result = generatePosition(str, k);

    //     expect(result).toEqual(new Set([
    //         { type: 'CPos', value: k },
    //         { type: 'CPos', value: -(str.length - k) },
    //         {
    //             type: 'RegExpPositionSet',
    //             regex1: {
    //                 type: 'RegExpSet',
    //                 tokens: [
    //                     { type: 'TokenSet', tokens: new Set([E.CharToken()]) }
    //                 ]
    //             },
    //             regex2: {
    //                 type: 'RegExpSet',
    //                 tokens: [
    //                     { type: 'TokenSet', tokens: new Set([E.CharToken()]) }
    //                 ]
    //             },
    //             count: {
    //                 type: 'IntegerSet',
    //                 values: new Set([E.Int(1), E.Int(2)])
    //             }
    //         }
    //     ]));
    // });
});
