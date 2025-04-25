import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { loadUserAagunConfig } from '../utils/loadUserConfig';
import { detectCurrentStructure } from '../utils/detectStructure';

export const fixCommand = new Command('fix')
    .description('Automatically fix dependency mismatches based on @aagun/core version')
    .action(async () => {
        const cliRoot = path.resolve(__dirname, '../src');
        const projectRoot = process.cwd();
        const versionMapPath = path.join(cliRoot, 'version.json');
        const pkgPath = path.join(projectRoot, 'package.json');

        if (!fs.existsSync(pkgPath)) {
            console.log(chalk.red('❌ No package.json found in current directory.'));
            process.exit(1);
        }

        if (!fs.existsSync(versionMapPath)) {
            console.log(chalk.red(`❌ version.json not found inside CLI.`));
            process.exit(1);
        }

        const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const versionMap = JSON.parse(fs.readFileSync(versionMapPath, 'utf-8'));

        const installed = {
            ...pkgJson.dependencies,
            ...pkgJson.devDependencies
        };

        const aagunVerRaw = installed['@aagun/core'];
        if (!aagunVerRaw) {
            console.log(chalk.red('❌ @aagun/core not found.'));
            process.exit(1);
        }

        const aagunVer = aagunVerRaw.replace(/^[^0-9]*/, '');
        const expectedDeps = versionMap[aagunVer];

        if (!expectedDeps) {
            console.log(chalk.yellow(`⚠️ No version map found for @aagun/core v${aagunVer}`));
            return;
        }

        let changesMade = false;
        for (const [dep, expectedVer] of Object.entries(expectedDeps)) {
            const actual = installed[dep];
            if (!actual || actual.replace(/^[^0-9]*/, '') !== expectedVer) {
                if (pkgJson.dependencies?.[dep]) {
                    pkgJson.dependencies[dep] = `^${expectedVer}`;
                } else if (pkgJson.devDependencies?.[dep]) {
                    pkgJson.devDependencies[dep] = `^${expectedVer}`;
                } else {
                    if (!pkgJson.dependencies) pkgJson.dependencies = {};
                    pkgJson.dependencies[dep] = `^${expectedVer}`;
                }
                console.log(chalk.yellow(`🔧 Updating ${dep} to ^${expectedVer}`));
                changesMade = true;
            }
        }

        if (changesMade) {
            fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));
            console.log(chalk.cyan('\n📦 Installing updated dependencies...\n'));
            execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
            console.log(chalk.green('\n✅ Dependencies fixed successfully.\n'));
        } else {
            console.log(
                chalk.green('\n✅ All dependencies already match the expected versions.\n')
            );
        }

        const configPath = path.resolve(process.cwd(), 'aagun.config.js');
        const config = await loadUserAagunConfig();
        const current = detectCurrentStructure();

        if (config.project.structure !== current) {
            console.log(chalk.yellow(`⚠️ Updating aagun.config.js structure to '${current}'...`));
            let raw = fs.readFileSync(configPath, 'utf-8');

            if (/project:\s*{[^}]*structure:\s*['"`](type|module)-based['"`]/.test(raw)) {
                // 🔁 Replace existing project.structure value
                raw = raw.replace(
                    /structure:\s*['"`](type|module)-based['"`]/,
                    `structure: '${current}'`
                );
            } else if (/project:\s*{/.test(raw)) {
                // ➕ Inject structure inside existing project object
                raw = raw.replace(/project:\s*{([\s\S]*?)}/, (match, inner) => {
                    return `project: {\n    structure: '${current}',\n${inner.trim() ? '    ' + inner.trim() + '\n' : ''}}`;
                });
            } else {
                // ➕ Add entire project block
                raw = raw.replace(/export\s+default\s+{([\s\S]*?)}/, (match, inner) => {
                    return `export default {\n  project: {\n    structure: '${current}'\n  },\n${inner.trim() ? '  ' + inner.trim() + '\n' : ''}}`;
                });
            }

            fs.writeFileSync(configPath, raw);
            console.log(chalk.green('✅ aagun.config.js project.structure field updated.\n'));
        } else {
            console.log(chalk.green('✅ Project structure is correct.\n'));
        }
    });
