import { describe, expect, it } from 'vitest';
import { getIndistinguishablePartitions, IPartitionCache } from '../../src/algo/match';
import { Token } from '../../src/lang';

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
        console.log("str", str);
        console.dir(result, { depth: null });
        expect(result.size).toBeGreaterThan(0);
        expect(result.size).toEqual(3);
        result.forEach(partition => {
            expect(partition.tokens.size).toBeGreaterThan(0);
            expect(partition.matches.length).toBeGreaterThan(0);
        });
    });

    describe('IPartitionCache', () => {
        it('should initialize with correct partitions', () => {
            const str = 'a1b2 c3';
            const cache = new IPartitionCache(str);
            console.dir(cache, { depth: null });
            expect(cache.partitions.size).toBeGreaterThan(0);
            expect(cache.partitionsArr.length).toBeGreaterThan(0);
            console.dir(cache.findPartitionsFromPos(3), { depth: null });
        });

    });


});