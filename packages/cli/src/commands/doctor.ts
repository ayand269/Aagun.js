import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { Command } from 'commander';
import { loadUserAagunConfig } from '../utils/loadUserConfig';
import { checkProjectStructure } from '../utils/projectStructure';

export const doctorCommand = new Command('doctor')
    .description('Check for dependency mismatches based on @aagun/core version')
    .action(async () => {
        const config = await loadUserAagunConfig();
        const ok = await checkProjectStructure(config, { verbose: true });

        if (ok) {
            console.log('✅ Project structure is valid.');
        } else {
            console.log('❌ Project structure mismatch detected.');
        }
        // 🔥 Get CLI root path
        // const __filename = fileURLToPath(import.meta.url);
        // const __dirname = path.dirname(__filename);
        const cliRoot = path.resolve(__dirname, '../src');

        // ✅ Get project root (where the command is being run)
        const projectRoot = process.cwd();

        // Load version map from CLI
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
        const expected = versionMap[aagunVer];

        if (!expected) {
            console.log(chalk.yellow(`⚠️ No version map found for @aagun/core v${aagunVer}`));
            return;
        }

        console.log(chalk.cyan(`\n🔎 Checking dependencies for @aagun/core v${aagunVer}...\n`));
        let issues = 0;

        for (const [dep, expectedVer] of Object.entries(expected)) {
            const actual = installed[dep];
            if (!actual) {
                console.log(chalk.yellow(`⚠️ Missing ${dep} (expected ${expectedVer})`));
                issues++;
            } else if (actual.replace(/^[^0-9]*/, '') !== expectedVer) {
                console.log(chalk.red(`❌ ${dep}@${actual} — expected ${expectedVer}`));
                issues++;
            } else {
                console.log(chalk.green(`✅ ${dep}@${actual}`));
            }
        }

        if (issues === 0) {
            console.log(chalk.green('\n🎉 All Aagun dependencies look good!\n'));
        } else {
            console.log(chalk.red(`\n⚠️ ${issues} issue(s) found.`));
            console.log(chalk.yellow(`👉 Run 'aagun fix' to resolve them.\n`));
        }
    });
