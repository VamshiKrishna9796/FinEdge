// In-memory cache service with TTL (Time To Live)
// Used to reduce load on database for frequently accessed data like /summary

const cache = new Map();

/**
 * Get a value from the cache
 * Returns undefined if key doesn't exist or has expired
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined
 */
function get(key) {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
        cache.delete(key);
        return undefined;
    }
    return entry.value;
}

/**
 * Set a value in the cache with optional TTL
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttlMs - Time to live in milliseconds (optional)
 */
function set(key, value, ttlMs = 0) {
    const entry = {
        value,
        expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null
    };
    cache.set(key, entry);
}

/**
 * Delete a key from the cache
 */
function del(key) {
    return cache.delete(key);
}

/**
 * Clear all cache entries
 */
function clear() {
    cache.clear();
}

/**
 * Check if a key exists and is not expired
 */
function has(key) {
    return get(key) !== undefined;
}

/**
 * Get or compute: if key exists, return cached value; otherwise compute, cache, and return
 * @param {string} key - Cache key
 * @param {Function} fn - Async function to compute value if not cached
 * @param {number} ttlMs - TTL in milliseconds
 * @returns {Promise<*>} Cached or computed value
 */
async function getOrSet(key, fn, ttlMs = 60000) {
    const cached = get(key);
    if (cached !== undefined) return cached;
    const value = await fn();
    set(key, value, ttlMs);
    return value;
}

module.exports = {
    get,
    set,
    del,
    clear,
    has,
    getOrSet
};
