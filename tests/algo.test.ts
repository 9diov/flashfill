import { describe, it, expect } from 'vitest';
import { generateRegex, generateRegexesMatchingBefore } from '../src/algo';
import { E } from '../src/lang';


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
    // it('should return empty set for k = 0', () => {
    //     const str = "ab1c2a  Bc";
    //     const k = 0;
    //     const result = generateRegexesMatchingBefore(str, k);

    //     expect(result).toEqual(new Set([E.Regex()]));
    // });

    it('should return correct regexes for given string and position', () => {
        const str = " ab1c2a  Bc";
        const k = 3;
        const result = generateRegexesMatchingBefore(str, k);

        // Expected result depends on the implementation of IPartitionCache and E.Regex
        // This is a placeholder for the expected result
        const expected = new Set([
            E.Regex(E.CharToken(), E.CharToken(), E.CharToken())
        ]);

        expect(result).toEqual(expected);
    });

    // it('should handle positions beyond string length', () => {
    //     const str = "abcabc";
    //     const k = 10;
    //     const result = generateRegexesMatchingBefore(str, k);

    //     // Expected result depends on the implementation of IPartitionCache and E.Regex
    //     // This is a placeholder for the expected result
    //     const expected = new Set();

    //     expect(result).toEqual(expected);
    // });
});