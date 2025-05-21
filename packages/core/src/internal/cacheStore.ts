type CacheEntry = { value: any; expiry: number };

const store = new Map<string, CacheEntry>();

export const cacheStore = {
    get(key: string) {
        const entry = store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            store.delete(key);
            return null;
        }
        return entry.value;
    },

    set(key: string, value: any, ttl: number) {
        store.set(key, {
            value,
            expiry: Date.now() + ttl * 1000
        });
    },

    clear() {
        store.clear();
    },

    status() {
        return store;
    }
};
