#!/usr/bin/env node
import { Command } from 'commander';
import { devCommand } from './commands/dev';
import { doctorCommand } from './commands/doctor';
import { fixCommand } from './commands/fix';
import { generateCommand } from './commands/generate';
// import { buildCommand } from './commands/build';
// import { startCommand } from './commands/start';

const program = new Command();

program.name('aagun').description('Aagun.js CLI').version('0.1.0');

program.addCommand(devCommand);
program.addCommand(doctorCommand);
program.addCommand(fixCommand);
program.addCommand(generateCommand)

program.parse(process.argv);
