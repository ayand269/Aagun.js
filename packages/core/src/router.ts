import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'url';
import { Express, NextFunction, RequestHandler, Request, Response } from 'express';
import {
    PATH_METADATA,
    METHOD_METADATA,
    MIDDLEWARE_METADATA,
    DISABLE_CACHE_METADATA_KEY
} from './decorators';
import { HttpMethod, AagunConfig } from './types';
import { routeRegistry } from './internal/routeRegistry';
import { cacheStore } from './internal/cacheStore';
import { buildCacheKey } from './utils/buildCacheKey';
import { CACHE_METADATA_KEY } from './decorators';

export default async function loadRoutes(app: Express, config: AagunConfig) {
    const structure = config.project?.structure || 'type-based';
    const controllerPaths: string[] = [];

    if (structure === 'type-based') {
        const controllerDir = path.resolve(process.cwd(), 'src/controllers');
        if (fs.existsSync(controllerDir)) {
            collectControllersRecursive(controllerDir, controllerPaths);
        } else {
            console.warn('⚠️  Controllers folder not found at:', controllerDir);
        }
    }

    if (structure === 'module-based') {
        const modulesDir = path.resolve(process.cwd(), 'src/Modules');
        if (fs.existsSync(modulesDir)) {
            collectControllersRecursive(modulesDir, controllerPaths);
        } else {
            console.warn('⚠️  Modules folder not found at:', modulesDir);
        }
    }

    for (const controllerPath of controllerPaths) {
        const controllerModule = await import(pathToFileURL(controllerPath).href);
        const controllerClass = controllerModule.default;
        if (!controllerClass) continue;

        const controllerInstance = new controllerClass();
        const prototype = Object.getPrototypeOf(controllerInstance);

        const basePath =
            Reflect.getMetadata(PATH_METADATA, controllerClass) ||
            getRouteFromFilename(controllerPath);

        const classMiddleware = Reflect.getMetadata(MIDDLEWARE_METADATA, controllerClass) || [];

        Object.getOwnPropertyNames(prototype).forEach((methodName) => {
            if (methodName === 'constructor') return;

            const routePath = Reflect.getMetadata(PATH_METADATA, prototype, methodName);
            const httpMethod = Reflect.getMetadata(
                METHOD_METADATA,
                prototype,
                methodName
            ) as HttpMethod;

            if (routePath && httpMethod) {
                const methodMiddleware =
                    Reflect.getMetadata(MIDDLEWARE_METADATA, prototype, methodName) || [];

                const fullPath = joinRoute(config.routing?.basePath || '', basePath, routePath);
                const cacheTTL: number | undefined = Reflect.getMetadata(
                    CACHE_METADATA_KEY,
                    prototype,
                    methodName
                );
                const disableCache: boolean = Reflect.getMetadata(
                    DISABLE_CACHE_METADATA_KEY,
                    prototype,
                    methodName
                );

                const isCacheGloballyEnabled = config.app?.cache !== false;
                const shouldUseCache =
                    !disableCache &&
                    (cacheTTL !== undefined || (isCacheGloballyEnabled && httpMethod === 'get'));
                const ttl = cacheTTL ?? 60;

                // const handler = controllerInstance[methodName].bind(controllerInstance);
                const handler: (
                    req: Request,
                    res: Response,
                    next: NextFunction
                ) => Promise<void> = async (req, res, next) => {
                    try {
                        if (shouldUseCache) {
                            const key = buildCacheKey(req);
                            const cached = cacheStore.get(key);
                            if (cached) {
                                res.json(cached);
                                return;
                            }
                        }

                        let responseBody: any;
                        const originalJson = res.json;
                        res.json = function (body: any) {
                            responseBody = body;
                            return originalJson.call(this, body);
                        };

                        const result = await controllerInstance[methodName](req, res, next);

                        if (shouldUseCache && responseBody) {
                            const key = buildCacheKey(req);
                            cacheStore.set(key, responseBody, ttl);
                        }

                        if (!res.headersSent && result !== undefined) {
                            res.json(result);
                        }
                    } catch (err) {
                        next(err);
                    }
                };
                const allMiddleware: RequestHandler[] = [...classMiddleware, ...methodMiddleware];

                routeRegistry.push({
                    path: fullPath,
                    method: httpMethod.toLowerCase(),
                    controller: controllerClass,
                    methodName
                });

                if (typeof app[httpMethod] === 'function') {
                    app[httpMethod](fullPath, ...allMiddleware, handler);
                } else {
                    console.warn(
                        `⚠️ Unknown method: ${httpMethod} on ${methodName} in ${controllerPath}`
                    );
                }

                console.log(
                    `🔗 ${httpMethod.toUpperCase()} ${fullPath} → ${path.basename(controllerPath)}.${methodName}()`
                );
            }
        });
    }
}

function collectControllersRecursive(dir: string, collected: string[]) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            collectControllersRecursive(fullPath, collected);
        } else if (file.endsWith('.controller.ts') || file.endsWith('.controller.js')) {
            collected.push(fullPath);
        }
    }
}

function getRouteFromFilename(filePath: string): string {
    const srcDir = path.resolve(process.cwd(), 'src');
    const relative = path.relative(srcDir, filePath).replace(/\\/g, '/');
    const noExt = relative.replace(/\.(ts|js)$/, '');

    const parts = noExt.split('/');

    // Trim known root folders only if they are the first segment
    if (parts[0].toLowerCase() === 'modules' || parts[0].toLowerCase() === 'controllers') {
        parts.shift();
    }

    // Remove .controller suffix only from file name
    parts[parts.length - 1] = parts[parts.length - 1].replace(/\.controller$/, '');

    if (
        parts.length >= 2 &&
        parts[parts.length - 1].toLowerCase() === parts[parts.length - 2].toLowerCase()
    ) {
        parts.pop();
    }

    return '/' + parts.map(toKebabCase).join('/');
}

function toKebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

function joinRoute(...segments: string[]): string {
    return (
        '/' +
        segments
            .map((s) => s.replace(/^\/|\/$/g, ''))
            .filter(Boolean)
            .join('/')
    );
}

// Placeholder — next step is to implement this in utils and import it.
// async function autoConstructorInject(Cls: any, baseDir: string): Promise<any> {
//     const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', Cls) || [];
//     const instances = [];

//     console.log("paramTypes", paramTypes)

//     for (const param of paramTypes) {
//         const fileName = param.name; // e.g. BookingService
//         const filePath = path.join(baseDir, `${fileName}.ts`);
//         const altPath = filePath.replace('.ts', '.js');
//         const file = fs.existsSync(filePath) ? filePath : fs.existsSync(altPath) ? altPath : null;
//         if (!file) {
//             throw new Error(`❌ Cannot resolve dependency file for: ${fileName}`);
//         }

//         const mod = await import(pathToFileURL(file).href);
//         const depClass = mod[fileName] || mod.default;

//         if (!depClass) {
//             throw new Error(`❌ Cannot find class '${fileName}' in file: ${file}`);
//         }

//         const depInstance = await autoConstructorInject(depClass, baseDir); // recursive
//         instances.push(depInstance);
//     }

//     return new Cls(...instances);
// }
