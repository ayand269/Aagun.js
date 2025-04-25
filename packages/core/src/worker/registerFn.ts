declare global {
    var __AAGUN_WORKERS__: Record<string, Function>;
}

if (!global.__AAGUN_WORKERS__) {
    global.__AAGUN_WORKERS__ = {};
}

export const registerWorkerFn = (name: string, fn: Function) => {
    if (global.__AAGUN_WORKERS__[name]) {
        throw new Error(`[Aagun] Worker function '${name}' already registered.`);
    }
    global.__AAGUN_WORKERS__[name] = fn;
};
