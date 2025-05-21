import path from 'path';

export async function loadBackgroundTasks() {
    try {
        await import(path.resolve(process.cwd(), 'src/worker/registry'));
        console.log('[Worker] Loaded task registry ✅');
    } catch {
        console.warn('[Worker] No task registry found, skipping...');
    }
}
