import { describe, it, expect } from 'vitest';
import { getIndistinguishablePartitions } from '../../src/algo/match';

describe('getIndistinguishablePartitions', () => {
    it('should return an empty set for an empty string', () => {
        const result = getIndistinguishablePartitions('');
        expect(result.size).toBe(0);
    });

    it('should return correct partitions for a string with one token', () => {
        const str = 'a';
        const result = getIndistinguishablePartitions(str);
        // console.dir(result, { depth: null });
        expect(result.size).toBeGreaterThan(0);
        expect(result.size).toEqual(1);
        result.forEach(partition => {
            expect(partition.tokens.size).toBeGreaterThan(0);
            expect(partition.matches.length).toBeGreaterThan(0);
        });
    });

    it('should return correct partitions for a string with multiple tokens', () => {
        const str = 'abc';
        const result = getIndistinguishablePartitions(str);
        // console.dir(result, { depth: null });
        expect(result.size).toBeGreaterThan(0);
        expect(result.size).toEqual(1);
        result.forEach(partition => {
            expect(partition.tokens.size).toBeGreaterThan(0);
            expect(partition.matches.length).toBeGreaterThan(0);
        });
    });

    it('should return correct partitions for a string with repeated tokens', () => {
        const str = 'aa';
        const result = getIndistinguishablePartitions(str);
        // console.dir(result, { depth: null });
        expect(result.size).toBeGreaterThan(0);
        expect(result.size).toEqual(1);
        result.forEach(partition => {
            expect(partition.tokens.size).toBeGreaterThan(0);
            expect(partition.matches.length).toBeGreaterThan(0);
        });
    });

    it('should return correct partitions for a complex string', () => {
        const str = 'a1b2c3';
        const result = getIndistinguishablePartitions(str);
        // console.dir(result, { depth: null });
        expect(result.size).toBeGreaterThan(0);
        expect(result.size).toEqual(3);
        result.forEach(partition => {
            expect(partition.tokens.size).toBeGreaterThan(0);
            expect(partition.matches.length).toBeGreaterThan(0);
        });
    });
});