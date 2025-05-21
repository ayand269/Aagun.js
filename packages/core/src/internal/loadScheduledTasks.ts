import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export async function loadScheduledTasks() {
    const dir = path.join(process.cwd(), 'src/schedules');

    if (!fs.existsSync(dir)) return;

    const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.schedule.ts') || f.endsWith('.schedule.js'));

    for (const file of files) {
        const fullPath = path.join(dir, file);
        await import(pathToFileURL(fullPath).href);
    }
}
