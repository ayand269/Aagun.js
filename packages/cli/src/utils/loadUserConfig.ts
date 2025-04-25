import path from 'path';

export async function loadUserAagunConfig() {
    try {
        const configPath = path.resolve(process.cwd(), 'aagun.config.js');
        const loaded = await import(configPath);
        return loaded.default;
    } catch (e) {
        console.warn('⚠️  Could not load aagun.config.js. Using fallback config.');
        return {};
    }
}
