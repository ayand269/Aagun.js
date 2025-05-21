const modelRegistry = new Map<string, any>();

export function registerModel(name: string, model: any) {
    modelRegistry.set(name, model);
}

export function getModel<T = any>(name: string): T {
    return modelRegistry.get(name);
}
