import { Command } from 'commander';
import { generateModuleCommand } from './generate.module';
import { generateControllerCommand } from './generate.controller';
import { generateServiceCommand } from './generate.service';
import { generateModelCommand } from './generate.model';
// later you’ll import generateControllerCommand, generateServiceCommand, etc.

export const generateCommand = new Command('generate')
    .description('Generate files for your Aagun app')
    .addCommand(generateModuleCommand)
    .addCommand(generateControllerCommand)
    .addCommand(generateServiceCommand)
    .addCommand(generateModelCommand);
