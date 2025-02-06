import { describe, it, expect } from 'vitest';
import { generateRegex, generateRegexesMatchingAfter, generateRegexesMatchingBefore } from '../src/algo';
import { E } from '../src/lang';
import exp from 'constants';


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

describe('generateRegexesMatchingBefore', () => {
    it('should return empty set for k = 0', () => {
        const str = "ab1c2a  Bc";
        const k = 0;
        const result = generateRegexesMatchingBefore(str, k);

        expect(result).toEqual(new Set([E.Regex()]));
    });

    it('should return correct regexes for given string and position', () => {
        const str = " ab1c2a  Bc";
        expect(generateRegexesMatchingBefore(str, 1).size).toEqual(2);
        expect(generateRegexesMatchingBefore(str, 2).size).toEqual(7);
        expect(generateRegexesMatchingBefore(str, 3).size).toEqual(7);
        expect(generateRegexesMatchingBefore(str, 4).size).toEqual(12);
    });

    it('should throw error when position is beyond string length', () => {
        const str = " ab1c2a  Bc";
        expect(() => generateRegexesMatchingBefore(str, -2)).toThrow();
        expect(() => generateRegexesMatchingBefore(str, 100)).toThrow();
    });
});

describe('generateRegexesMatchingAfter', () => {
    it('should return correct regexes for given string and position', () => {
        const str = "a1c\\-3a";
        expect(generateRegexesMatchingAfter(str, 1).size).toEqual(12);
        expect(generateRegexesMatchingAfter(str, 2).size).toEqual(6);
        expect(generateRegexesMatchingAfter(str, 3).size).toEqual(2);
    });
});