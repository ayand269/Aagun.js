// src/utils/getDirname.ts
import path from 'path';
import { fileURLToPath } from 'url';

export function getCurrentDir(metaOrModule: ImportMeta | NodeModule): string {
    if (typeof metaOrModule === 'object' && 'url' in metaOrModule) {
        // ESM
        return path.dirname(fileURLToPath(metaOrModule.url));
    } else if (typeof metaOrModule === 'object' && 'filename' in metaOrModule) {
        // CJS
        return path.dirname(metaOrModule.filename);
    }
    throw new Error('Unknown module format');
}
