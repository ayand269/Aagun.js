import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { Command } from 'commander';
import { toPascalCase } from '../utils/toPascalCase';
import { loadUserAagunConfig } from '../utils/loadUserConfig';

export const generateServiceCommand = new Command('service')
    .description('Generate a standalone service file')
    .argument('<name>', 'Service name')
    .action(async (name) => {
        const config = await loadUserAagunConfig();
        const structure = config.project?.structure || 'type-based';

        const pascalName = toPascalCase(path.basename(name));
        const baseDir =
            structure === 'module-based'
                ? path.join(process.cwd(), 'src/modules', ...name.split('/').map(toPascalCase))
                : path.join(process.cwd(), 'src');

        const filePath =
            structure === 'module-based'
                ? path.join(baseDir, `${pascalName}.service.ts`)
                : path.join(baseDir, 'services', `${pascalName}.service.ts`);

        await fs.ensureDir(path.dirname(filePath));

        const content = `
export class ${pascalName}Service {
  constructor() {
    // Initialize ${pascalName}Service
  }

  // Add your service methods here
}
`;

        if (fs.existsSync(filePath)) {
            console.log(chalk.yellow(`⚠️  Skipped (already exists): ${filePath}`));
        } else {
            fs.writeFileSync(filePath, content.trimStart());
            console.log(chalk.green(`✅ Created: ${filePath}`));
        }
    });
