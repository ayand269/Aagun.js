import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { Command } from 'commander';
import { loadUserAagunConfig } from '../utils/loadUserConfig';
import { toPascalCase } from '../utils/toPascalCase';

export const generateControllerCommand = new Command('controller')
    .description('Generate a controller file with optional service, model, and CRUD')
    .argument('<name>', 'Controller name')
    .option('-s, --service', 'Generate related service')
    .option('-m, --model', 'Generate related model')
    .option('-c, --crud', 'Generate CRUD methods in controller')
    .option('-r, --route <path>', 'Custom route path for the controller')
    .action(async (name, options) => {
        const config = await loadUserAagunConfig();
        const structure = config.project?.structure || 'type-based';

        const pascalName = toPascalCase(path.basename(name));
        const baseDir =
            structure === 'module-based'
                ? path.join(process.cwd(), 'src/modules', ...name.split('/').map(toPascalCase))
                : path.join(process.cwd(), 'src');

        const controllerPath =
            structure === 'module-based'
                ? path.join(baseDir, `${pascalName}.controller.ts`)
                : path.join(baseDir, 'controllers', `${pascalName}.controller.ts`);

        const servicePath =
            structure === 'module-based'
                ? path.join(baseDir, `${pascalName}.service.ts`)
                : path.join(baseDir, 'services', `${pascalName}.service.ts`);

        const modelPath =
            structure === 'module-based'
                ? path.join(baseDir, `${pascalName}.model.ts`)
                : path.join(baseDir, 'models', `${pascalName}.model.ts`);

        await fs.ensureDir(path.dirname(controllerPath));
        if (options.service) await fs.ensureDir(path.dirname(servicePath));
        if (options.model) await fs.ensureDir(path.dirname(modelPath));

        const controllerClass = `${pascalName}Controller`;
        const serviceClass = `${pascalName}Service`;
        const modelClass = `${pascalName}Model`;

        const decoratorImports = [];
        if (options.route) decoratorImports.push('Controller');
        if (options.crud)
            decoratorImports.push('Delete', 'Get', 'Post', 'Put', 'Request', 'Response');

        const decoratorImportString =
            decoratorImports.length > 0
                ? `import { ${decoratorImports.join(', ')} } from '@aagun/core';\n`
                : '';

        const controllerTemplate = `
${decoratorImportString}${options.service ? `import { ${serviceClass} } from '${structure === 'module-based' ? `./${pascalName}.service` : `../services/${pascalName}.service`}';\n` : ''}
${options.route ? `@Controller('${options.route}')\n` : ''}export default class ${controllerClass} {
    ${options.service ? `private ${lowerFirst(serviceClass)} = new ${serviceClass}();\n` : ''}

${options.crud ? generateCrudMethods(name) : '  // Add your routes here'}
}
`;

        const serviceTemplate = `
export class ${serviceClass} {
  // Add service methods here
}
`;

        const modelTemplate = `
export class ${modelClass} {
  // Define your model schema or class fields here
}
`;

        await writeIfNotExists(controllerPath, controllerTemplate);
        if (options.service) await writeIfNotExists(servicePath, serviceTemplate);
        if (options.model) await writeIfNotExists(modelPath, modelTemplate);

        console.log(chalk.green(`✅ Controller "${pascalName}" generated.`));
        console.log(`  - Controller: ${controllerPath}`);
        if (options.service) console.log(`  - Service:    ${servicePath}`);
        if (options.model) console.log(`  - Model:      ${modelPath}`);
    });

function writeIfNotExists(filePath: string, content: string) {
    if (fs.existsSync(filePath)) {
        console.log(chalk.yellow(`⚠️  Skipped (already exists): ${filePath}`));
        return;
    }
    fs.writeFileSync(filePath, content.trimStart());
    console.log(chalk.green(`✅ Created: ${filePath}`));
}

function generateCrudMethods(name: string): string {
    const lcName = name.toLowerCase();
    return `
  @Post('/')
  create(req: Request, res: Response) {
    // TODO: Create new ${lcName}
  }

  @Get('/')
  findAll(req: Request, res: Response) {
    // TODO: List all ${lcName}s
  }

  @Get('/:id')
  findOne(req: Request, res: Response) {
    // TODO: Get one ${lcName}
  }

  @Put('/:id')
  update(req: Request, res: Response) {
    // TODO: Update ${lcName}
  }

  @Delete('/:id')
  delete(req: Request, res: Response) {
    // TODO: Delete ${lcName}
  }
`;
}

function lowerFirst(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
