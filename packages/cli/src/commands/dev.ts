import chokidar from 'chokidar';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { Command } from 'commander';
import { checkProjectStructure } from '../utils/projectStructure';
import { loadUserAagunConfig } from '../utils/loadUserConfig';

let proc: ChildProcess | null = null;

const entry = path.resolve(process.cwd(), 'src/index.ts');

function startApp() {
    if (proc) proc.kill();
    proc = spawn(
        'node',
        ['--no-warnings', '--import', path.resolve(__dirname, '../src/aagun-loader.js'), entry],
        {
            stdio: 'inherit',
            shell: false // important for avoiding /bin/sh issues
        }
    );
}

function checkDoctorWarning() {
    const projectRoot = process.cwd();
    const pkgPath = path.join(projectRoot, 'package.json');
    const versionMapPath = path.join(__dirname, '../src/version.json');

    if (!fs.existsSync(pkgPath) || !fs.existsSync(versionMapPath)) return;

    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const versionMap = JSON.parse(fs.readFileSync(versionMapPath, 'utf-8'));

    const installed = {
        ...pkgJson.dependencies,
        ...pkgJson.devDependencies
    };

    const aagunVerRaw = installed['@aagun/core'];
    if (!aagunVerRaw) return;

    const aagunVer = aagunVerRaw.replace(/^[^0-9]*/, '');
    const expected = versionMap[aagunVer];
    if (!expected) return;

    let mismatch = false;

    for (const [dep, expectedVer] of Object.entries(expected)) {
        const actual = installed[dep];
        if (!actual || actual.replace(/^[^0-9]*/, '') !== expectedVer) {
            mismatch = true;
            break;
        }
    }

    if (mismatch) {
        console.log(
            chalk.yellow.bold('\n⚠️  Dependency mismatch detected!\n') +
                chalk.white('Run ') +
                chalk.cyan.bold('aagun doctor') +
                chalk.white(' to inspect or ') +
                chalk.green.bold('aagun fix') +
                chalk.white(' to auto-resolve.\n')
        );
    }
}

export const devCommand = new Command('dev')
    .description('Start Aagun app in dev mode with hot reloading')
    .action(async () => {
        const config = await loadUserAagunConfig();
        const ok = await checkProjectStructure(config, { verbose: true });
        if (!ok) {
            console.log(chalk.red.bold('\n❌ Project structure mismatch detected. Exiting...\n'));
            process.exit(1);
        }

        checkDoctorWarning();
        startApp();

        chokidar
            .watch('src', {
                ignoreInitial: true,
                ignored: /node_modules/,
                awaitWriteFinish: {
                    stabilityThreshold: 100,
                    pollInterval: 10
                }
            })
            .on('all', async (event, file) => {
                console.clear();
                console.log(`🔁 Detected ${event} on ${file} — restarting app...\n`);

                const config = await loadUserAagunConfig();
                const ok = await checkProjectStructure(config, { verbose: true });
                if (!ok) {
                    console.log(
                        chalk.red.bold('\n❌ Project structure mismatch detected. Exiting...\n')
                    );
                    process.exit(1);
                }

                checkDoctorWarning();
                startApp();
            });

        process.on('SIGINT', () => {
            if (proc) proc.kill();
            process.exit(0);
        });
    });
