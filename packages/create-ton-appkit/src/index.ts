#!/usr/bin/env node

/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { styleText } from 'node:util';

import * as prompts from '@clack/prompts';
import mri from 'mri';

const logger = console;

const RENAME_FILES: Record<string, string> = {
    _gitignore: '.gitignore',
    _npmrc: '.npmrc',
    _env: '.env',
};

const TEMPLATES = [{ name: 'react', display: 'React + TypeScript', color: 'cyan' as const }];

function detectPackageManager(): { name: string; install: string; run: string } {
    const agent = process.env.npm_config_user_agent ?? '';
    if (agent.startsWith('yarn')) return { name: 'yarn', install: 'yarn', run: 'yarn' };
    if (agent.startsWith('pnpm')) return { name: 'pnpm', install: 'pnpm install', run: 'pnpm' };
    if (agent.startsWith('bun')) return { name: 'bun', install: 'bun install', run: 'bun' };
    return { name: 'npm', install: 'npm install', run: 'npm run' };
}

function toValidPackageName(input: string): string {
    const name = input
        .trim()
        .toLowerCase()
        .replace(/^[._]+/, '')
        .replace(/[^a-z0-9-~]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return name || 'ton-app';
}

function isEmpty(dirPath: string): boolean {
    const files = fs.readdirSync(dirPath);
    return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

function copy(src: string, dest: string): void {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        copyDir(src, dest);
    } else {
        fs.copyFileSync(src, dest);
    }
}

function copyDir(srcDir: string, destDir: string): void {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
        const srcPath = path.join(srcDir, file);
        const destFile = RENAME_FILES[file] ?? file;
        const destPath = path.join(destDir, destFile);
        copy(srcPath, destPath);
    }
}

function replaceInFile(filePath: string, search: string | RegExp, replacement: () => string): void {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    fs.writeFileSync(filePath, content.replace(search, replacement));
}

function emptyDir(dir: string): void {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
        if (file === '.git') continue;
        fs.rmSync(path.join(dir, file), { recursive: true, force: true });
    }
}

async function run(): Promise<void> {
    const argv = mri(process.argv.slice(2), {
        alias: { h: 'help', t: 'template', o: 'overwrite', y: 'yes' },
        boolean: ['help', 'overwrite', 'yes'],
        string: ['template', 'app-url'],
    });

    const useDefaults = argv.yes;

    if (argv.help) {
        logger.log(`
  ${styleText('bold', 'create-ton-appkit')} — scaffold a TON AppKit project

  ${styleText('bold', 'Usage:')}
    create-ton-appkit [project-name] [options]

  ${styleText('bold', 'Options:')}
    -t, --template <name>   Template to use (default: react)
    -o, --overwrite         Overwrite existing directory
    --app-url <url>         App URL for TonConnect manifest
    -y, --yes               Accept all defaults (non-interactive)
    -h, --help              Show this help message

  ${styleText('bold', 'Documentation:')}
    Applications         https://docs.ton.org/applications/apps-overview
    AppKit               https://docs.ton.org/applications/appkit/overview
    How-to guides        https://docs.ton.org/applications/appkit/howto/howto
    TonConnect           https://docs.ton.org/applications/ton-connect/overview
`);
        return;
    }

    prompts.intro(styleText('bold', 'Create TON AppKit'));

    // 1. Project name
    let targetDir = argv._[0] as string | undefined;
    if (!targetDir) {
        if (useDefaults) {
            targetDir = 'my-ton-app';
        } else {
            const result = await prompts.text({
                message: 'Project name',
                placeholder: 'my-ton-app',
                defaultValue: 'my-ton-app',
                validate: (value) => {
                    if (!value?.trim()) return 'Project name is required';
                },
            });
            if (prompts.isCancel(result)) {
                prompts.cancel('Cancelled.');
                process.exit(0);
            }
            targetDir = result;
        }
    }

    const root = path.resolve(process.cwd(), targetDir);
    // Resolve "." to the real folder name so the package name is never "."
    const projectName = path.basename(root);
    const packageName = toValidPackageName(projectName);

    // 2. Handle existing directory
    if (fs.existsSync(root) && !fs.statSync(root).isDirectory()) {
        prompts.cancel(`"${targetDir}" exists and is not a directory.`);
        process.exit(1);
    }
    if (fs.existsSync(root) && !isEmpty(root)) {
        if (argv.overwrite || useDefaults) {
            emptyDir(root);
        } else {
            const overwrite = await prompts.confirm({
                message: `Directory "${projectName}" is not empty. Remove existing files and continue?`,
            });
            if (prompts.isCancel(overwrite) || !overwrite) {
                prompts.cancel('Cancelled.');
                process.exit(0);
            }
            emptyDir(root);
        }
    }

    // 3. Template selection
    let template = argv.template;
    if (!template) {
        if (useDefaults || TEMPLATES.length === 1) {
            template = TEMPLATES[0].name;
        } else {
            const result = await prompts.select({
                message: 'Select a template',
                options: TEMPLATES.map((t) => ({
                    value: t.name,
                    label: t.display,
                })),
            });
            if (prompts.isCancel(result)) {
                prompts.cancel('Cancelled.');
                process.exit(0);
            }
            template = result;
        }
    }

    const distDir = path.dirname(fileURLToPath(import.meta.url));
    const templateDir = path.resolve(distDir, '..', `template-${template}`);

    if (!fs.existsSync(templateDir)) {
        prompts.cancel(`Template "${template}" not found.`);
        process.exit(1);
    }

    // 4. App URL for TonConnect manifest
    // See https://docs.ton.org/applications/appkit/howto/connect-to-a-wallet
    let appUrl = argv['app-url'] as string | undefined;
    if (!appUrl) {
        if (useDefaults) {
            appUrl = 'https://your-app.example.com';
        } else {
            const result = await prompts.text({
                message: 'App URL (for TonConnect manifest)',
                placeholder: 'https://your-app.example.com',
                defaultValue: 'https://your-app.example.com',
            });
            if (prompts.isCancel(result)) {
                prompts.cancel('Cancelled.');
                process.exit(0);
            }
            appUrl = result;
        }
    }

    // 5. Scaffold
    const spinner = prompts.spinner();
    spinner.start('Scaffolding project...');

    copyDir(templateDir, root);

    // Rewrite package.json name
    const pkgPath = path.join(root, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>;
    pkg.name = packageName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');

    // Rewrite index.html <title>
    replaceInFile(path.join(root, 'index.html'), /<title>.*<\/title>/, () => `<title>${projectName}</title>`);

    // Rewrite tonconnect-manifest.json
    const manifestPath = path.join(root, 'public', 'tonconnect-manifest.json');
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Record<string, unknown>;
        manifest.name = projectName;
        manifest.url = appUrl;
        manifest.iconUrl = `${appUrl}/favicon.svg`;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4) + '\n');
    }

    spinner.stop('Project scaffolded.');

    // 6. Done — print next steps
    const pm = detectPackageManager();
    const cdCmd =
        root === process.cwd()
            ? ''
            : `  cd ${path.relative(process.cwd(), root).includes(' ') ? `"${path.relative(process.cwd(), root)}"` : path.relative(process.cwd(), root)}`;

    prompts.note([cdCmd, `  ${pm.install}`, `  ${pm.run} dev`].filter(Boolean).join('\n'), 'Next steps');

    prompts.outro('Done! Docs: https://docs.ton.org/applications/appkit/overview');
}

run().catch((err: unknown) => {
    logger.error(err);
    process.exit(1);
});
