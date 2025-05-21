#!/usr/bin/env node
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import chalk from 'chalk';

// Simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI flags
const args = process.argv.slice(2);
const cliAppName = args.find((arg) => !arg.startsWith('--'));
const isLatest = args.includes('--latest');

// Locked versions for --stable mode
const lockedVersions = {
    typescript: '5.8.3',
    express: '5.1.0',
    '@esbuild-kit/esm-loader': '2.6.5',
    'reflect-metadata': '0.2.2'
};

console.log(chalk.cyan('\n🚀 Create Aagun App - Let’s build something powerful!\n'));

const response = await prompts([
    {
        type: 'text',
        name: 'name',
        message: 'Project name:',
        initial: cliAppName || 'my-aagun-app'
    },
    {
        type: 'select',
        name: 'structure',
        message: 'Project structure:',
        choices: [
            { title: 'Type-based (controllers/, services/)', value: 'type-based' },
            {
                title: 'Module-based (modules/ with controller/service inside)',
                value: 'module-based'
            }
        ],
        initial: 0
    },
    {
        type: 'text',
        name: 'version',
        message: 'Version:',
        initial: '0.1.0'
    },
    {
        type: 'text',
        name: 'description',
        message: 'Description:'
    },
    {
        type: 'text',
        name: 'author',
        message: 'Author:'
    },
    {
        type: 'text',
        name: 'license',
        message: 'License:',
        initial: 'MIT'
    },
    {
        type: 'list',
        name: 'keywords',
        message: 'Keywords (comma-separated):',
        separator: ','
    },
    {
        type: 'text',
        name: 'repository',
        message: 'Repository URL (Git):'
    },
    {
        type: 'text',
        name: 'homepage',
        message: 'Homepage URL:'
    },
    {
        type: 'text',
        name: 'bugs',
        message: 'Issue Tracker URL:'
    }
]);

const {
    name,
    structure,
    version,
    description,
    author,
    license,
    keywords,
    repository,
    homepage,
    bugs
} = response;

const templateDir = path.resolve(__dirname, `../templates/${structure}`);
const targetDir = path.resolve(process.cwd(), name);

// 📁 CHECK & COPY TEMPLATE
if (fs.existsSync(targetDir)) {
    console.log(chalk.red(`❌ Folder "${name}" already exists.`));
    process.exit(1);
}

console.log(chalk.blue(`\n📁 Creating project folder "${name}"...`));
await fs.copy(templateDir, targetDir);

// Package.json setup
const pkgPath = path.join(targetDir, 'package.json');
const pkgJson = await fs.readJson(pkgPath);

pkgJson.name = name;
pkgJson.version = version;
if (description) pkgJson.description = description;
if (author) pkgJson.author = author;
if (license) pkgJson.license = license;
if (keywords?.length) pkgJson.keywords = keywords.map((kw: string) => kw.trim());
if (repository) {
    pkgJson.repository = { type: 'git', url: repository };
}
if (homepage) pkgJson.homepage = homepage;
if (bugs) pkgJson.bugs = { url: bugs };

// Aagun metadata
pkgJson.aagun = {
    framework: 'aagun',
    createdWith: 'create-aagun-app',
    mode: isLatest ? 'latest' : 'stable'
};

// Dependency installation logic
if (isLatest) {
    console.log(chalk.yellow('\n📦 Installing latest dependencies...'));

    const deps = ['express', 'reflect-metadata', 'morgan', '@aagun/core@0.1.0-beta.2'];
    const devDeps = ['typescript', '@esbuild-kit/esm-loader', '@types/multer'];

    execSync(`npm install ${deps.join(' ')} --save`, { cwd: targetDir, stdio: 'inherit' });
    execSync(`npm install ${devDeps.join(' ')} --save-dev`, { cwd: targetDir, stdio: 'inherit' });

    // Always link @aagun/core from local
    // execSync(`npm install ${`file:${corePath}`} --save`, { cwd: targetDir, stdio: 'inherit' });
} else {
    // Stable mode: Inject locked versions
    pkgJson.dependencies ||= {};
    pkgJson.devDependencies ||= {};

    for (const [pkg, ver] of Object.entries(lockedVersions)) {
        if (['typescript', '@esbuild-kit/esm-loader'].includes(pkg)) {
            pkgJson.devDependencies[pkg] = ver;
        } else {
            pkgJson.dependencies[pkg] = ver;
        }
    }

    // Always link @aagun/core from local
    // pkgJson.dependencies['@aagun/core'] = `file:${corePath}`;

    await fs.writeJson(pkgPath, pkgJson, { spaces: 2 });

    console.log(chalk.yellow('\n📦 Installing stable (locked) dependencies...'));
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
}

console.log(chalk.green('\n✅ Aagun.js project created successfully!'));
console.log('\nNext steps:\n');
console.log(chalk.cyan(`  cd ${name}`));
console.log(chalk.cyan('  npm run dev'));
console.log('\nHappy building with Aagun ⚡\n');
