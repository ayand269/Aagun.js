import fs from 'fs';
import path from 'path';
import { AagunStructure } from '../types';

export function detectCurrentStructure(): AagunStructure {
    const src = path.resolve(process.cwd(), 'src');
    const hasModules = fs.existsSync(path.join(src, 'modules'));
    const hasTypeFolders =
        fs.existsSync(path.join(src, 'controllers')) && fs.existsSync(path.join(src, 'services'));

    if (hasModules) return 'module-based';
    if (hasTypeFolders) return 'type-based';

    return 'type-based'; // safe default
}
