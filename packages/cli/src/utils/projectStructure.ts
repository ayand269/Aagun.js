import { AagunConfig } from '../types';

export async function checkProjectStructure(config: AagunConfig, opts?: { verbose?: boolean }) {
    const fs = require('fs');
    const path = require('path');

    const hasModules = fs.existsSync(path.resolve('src/modules'));
    const hasControllers = fs.existsSync(path.resolve('src/controllers'));

    const detected = hasModules ? 'module-based' : hasControllers ? 'type-based' : 'unknown';

    if (config.project?.structure !== detected) {
        if (opts?.verbose) {
            console.warn(`
❗ Project structure mismatch detected:
    - Configured: ${config.project?.structure}
    - Detected:  ${detected}

➡ Suggested fix:
    • Update the "structure" field in aagun.config.js
    • OR run: aagun fix
`);
        }
        return false;
    }

    return true;
}
