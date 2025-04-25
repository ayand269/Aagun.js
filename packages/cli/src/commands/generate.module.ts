import path from 'path';
import fs from 'fs-extra';
import { Command } from 'commander';
import chalk from 'chalk';
import { loadUserAagunConfig } from '../utils/loadUserConfig';
import { toPascalCase } from '../utils/toPascalCase';

export const generateModuleCommand = new Command('module')
    .description('Generate a full module (controller, service, model)')
    .argument('<name>', 'Module name')
    .option('-c, --crud', 'Generate CRUD methods in controller')
    .option('-r, --route <path>', 'Custom route path for the controller')
    .action(async (name, options) => {
        const config = await loadUserAagunConfig();
        const structure = config.project?.structure || 'type-based';

        if (structure !== 'module-based') {
            console.log(
                chalk.red('❌ "aagun generate module" is only supported in module-based projects.')
            );
            process.exit(1);
        }

        const moduleName = toPascalCase(path.basename(name));
        const modulePath = path.join(
            process.cwd(),
            'src/Modules',
            ...name.split('/').map(toPascalCase)
        );

        await fs.ensureDir(modulePath);

        const controllerPath = path.join(modulePath, `${moduleName}.controller.ts`);
        const servicePath = path.join(modulePath, `${moduleName}.service.ts`);
        const modelPath = path.join(modulePath, `${moduleName}.model.ts`);

        const controllerClass = `${moduleName}Controller`;
        const serviceClass = `${moduleName}Service`;
        const modelClass = `${moduleName}Model`;

        const decoratorImports = [];
        if (options.route) decoratorImports.push('Controller');
        if (options.crud)
            decoratorImports.push('Delete', 'Get', 'Post', 'Put', 'Request', 'Response');

        const decoratorImportString =
            decoratorImports.length > 0
                ? `import { ${decoratorImports.join(', ')} } from '@aagun/core';\n`
                : '';

        const controllerTemplate = `
${decoratorImportString}import { ${serviceClass} } from './${moduleName}.service';

${options.route ? `@Controller('${options.route}')\n` : ''}export default class ${controllerClass} {
    private ${lowerFirst(serviceClass)}: ${serviceClass};
    constructor() {
        this.${lowerFirst(serviceClass)} = new ${serviceClass}();
    }

${options.crud ? generateCrudMethods() : ''}}
`;

        const serviceTemplate = `
import { ${modelClass} } from './${moduleName}.model';

export class ${serviceClass} {
    private ${lowerFirst(modelClass)}: ${modelClass};
    constructor() {
        this.${lowerFirst(modelClass)} = new ${modelClass}();
    }

  // Add service methods here
}
`;

        const modelTemplate = `
export class ${modelClass} {
  // Define model schema or class fields here
}
`;

        await writeIfNotExists(controllerPath, controllerTemplate);
        await writeIfNotExists(servicePath, serviceTemplate);
        await writeIfNotExists(modelPath, modelTemplate);

        console.log(chalk.green(`✅ Module "${moduleName}" created successfully.`));
        console.log(`  - Controller: ${controllerPath}`);
        console.log(`  - Service:    ${servicePath}`);
        console.log(`  - Model:      ${modelPath}`);
    });

function generateCrudMethods(): string {
    return `
    @Post('/')
    create(req: Request, res: Response) {
        // TODO: implement create
    }

    @Get('/')
    findAll(req: Request, res: Response) {
        // TODO: implement findAll
    }

    @Get('/:id')
    findOne(req: Request, res: Response) {
        // TODO: implement findOne
    }

    @Put('/:id')
    update(req: Request, res: Response) {
        // TODO: implement update
    }

    @Delete('/:id')
    delete(req: Request, res: Response) {
        // TODO: implement delete
    }
  `;
}

function lowerFirst(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

const writeIfNotExists = async (filePath: string, content: string) => {
    if (await fs.pathExists(filePath)) {
        console.log(chalk.yellow(`⚠️  Skipped (already exists): ${filePath}`));
    } else {
        await fs.writeFile(filePath, content.trimStart());
        console.log(chalk.green(`✅ Created: ${filePath}`));
    }
};
