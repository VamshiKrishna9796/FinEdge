// Unit tests for Cache Service — TTL behavior and getOrSet
const cacheService = require('../src/services/cacheService');

beforeEach(() => {
    cacheService.clear();
});

describe('cacheService basic operations', () => {
    test('should set and get a value', () => {
        cacheService.set('key1', { data: 123 });
        expect(cacheService.get('key1')).toEqual({ data: 123 });
    });

    test('should return undefined for non-existent key', () => {
        expect(cacheService.get('nonexistent')).toBeUndefined();
    });

    test('should delete a key', () => {
        cacheService.set('key1', 'value');
        expect(cacheService.has('key1')).toBe(true);
        cacheService.del('key1');
        expect(cacheService.get('key1')).toBeUndefined();
        expect(cacheService.has('key1')).toBe(false);
    });

    test('should clear all entries', () => {
        cacheService.set('key1', 'v1');
        cacheService.set('key2', 'v2');
        cacheService.clear();
        expect(cacheService.get('key1')).toBeUndefined();
        expect(cacheService.get('key2')).toBeUndefined();
    });
});

describe('cacheService TTL behavior', () => {
    test('should return value before TTL expires', () => {
        cacheService.set('ttl-key', 'value', 5000);
        expect(cacheService.get('ttl-key')).toBe('value');
    });

    test('should return undefined after TTL expires', async () => {
        cacheService.set('ttl-key', 'value', 50); // 50ms TTL
        expect(cacheService.get('ttl-key')).toBe('value');
        await new Promise((r) => setTimeout(r, 60));
        expect(cacheService.get('ttl-key')).toBeUndefined();
    });

    test('should not expire when TTL is 0', () => {
        cacheService.set('no-ttl', 'value', 0);
        expect(cacheService.get('no-ttl')).toBe('value');
    });
});

describe('cacheService getOrSet', () => {
    test('should compute and cache value when key does not exist', async () => {
        const fn = jest.fn().mockResolvedValue('computed');
        const result = await cacheService.getOrSet('compute-key', fn, 60000);
        expect(result).toBe('computed');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should return cached value on second call without recomputing', async () => {
        const fn = jest.fn().mockResolvedValue('computed');
        const r1 = await cacheService.getOrSet('key', fn, 60000);
        const r2 = await cacheService.getOrSet('key', fn, 60000);
        expect(r1).toBe('computed');
        expect(r2).toBe('computed');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should recompute after TTL expires', async () => {
        const fn = jest.fn().mockResolvedValue('computed');
        await cacheService.getOrSet('ttl-key', fn, 50);
        expect(fn).toHaveBeenCalledTimes(1);
        await new Promise((r) => setTimeout(r, 60));
        await cacheService.getOrSet('ttl-key', fn, 60000);
        expect(fn).toHaveBeenCalledTimes(2);
    });
});
