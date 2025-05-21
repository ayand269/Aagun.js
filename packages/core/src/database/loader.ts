import { pathToFileURL } from 'url';
import fs from 'node:fs';
import path from 'node:path';
import { AagunConfig } from '../types';

export async function loadAllModels(config: AagunConfig) {
    const structure = config.project?.structure || 'type-based';
    const modelPaths: string[] = [];

    if (structure === 'type-based') {
        const modelDir = path.resolve(process.cwd(), 'src/models');
        if (fs.existsSync(modelDir)) {
            loadFiles(modelDir, modelPaths);
        } else {
            console.warn('⚠️  Controllers folder not found at:', modelDir);
        }
    }

    if (structure === 'module-based') {
        const modulesDir = path.resolve(process.cwd(), 'src/Modules');
        if (fs.existsSync(modulesDir)) {
            loadFiles(modulesDir, modelPaths);
        } else {
            console.warn('⚠️  Modules folder not found at:', modulesDir);
        }
    }

    for (const modelPath of modelPaths) {
        try {
            await import(pathToFileURL(modelPath).href);
            console.log(`[Aagun.js] 🧠 Loaded model: ${modelPath}`);
        } catch (err) {
            console.error(`[Aagun.js] ❌ Failed to load model at ${modelPath}`, err);
        }
    }
}

async function loadFiles(dir: string, collected: string[]) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            loadFiles(fullPath, collected);
        } else if (file.endsWith('.model.ts') || file.endsWith('.model.js')) {
            collected.push(fullPath);
        }
    }
}
