import { describe, it, expect } from 'vitest';
import { generateRegex } from '../src/algo';
import { E } from '../src/lang';


describe('generateRegex', () => {
    it('should generate regex set for a given regular expression and string', () => {
        const r = E.Regex(E.CharToken());
        const str = "abcabc";
        const result = generateRegex(r, str);

        expect(result).toEqual({
            type: 'RegExpSet',
            tokens: [
                { type: 'TokenSet', tokens: new Set([
                    E.CharToken(),
                    E.LowerToken(),
                    E.NumCharToken(),
                    E.NonSpaceToken()])
                },
            ]
        });
    });

    // it('should handle empty string', () => {
    //     const r = E.Regex(E.CharToken());
    //     const str = "";
    //     const result = generateRegex(r, str);

    //     expect(result).toEqual({
    //         type: 'RegExpSet',
    //         tokens: [
    //             { type: 'TokenSet', tokens: [] },
    //             { type: 'TokenSet', tokens: [] },
    //             { type: 'TokenSet', tokens: [] }
    //         ]
    //     });
    // });

    it('should handle empty tokens', () => {
        const r = E.Regex();
        const str = "abcabc";
        const result = generateRegex(r, str);

        expect(result).toEqual({
            type: 'RegExpSet',
            tokens: []
        });
    });

    it('should handle tokens not in string', () => {
        const r = E.Regex(E.NumToken());
        const str = "abcabc";
        const result = generateRegex(r, str);

        // should returns all other tokens that don't match the string
        expect(result).toEqual({
            type: 'RegExpSet',
            tokens: [{
                type: 'TokenSet',
                tokens: new Set([
                    E.NumToken(),
                    E.UpperToken(),
                    E.SpaceToken(),
                    E.AccentedToken()
                ])
            }]
        });
    });
});
