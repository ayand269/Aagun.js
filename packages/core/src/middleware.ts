import { Express, NextFunction, Request, Response } from 'express';
import { AagunConfig } from './types';
import { match } from 'path-to-regexp';
import { findMatchingRoute } from './utils/findMatchingRoute';
import { PUBLIC_ROUTE_METADATA_KEY } from './decorators';

function isPublicRoute(req: Request, config: AagunConfig): boolean {
    const path = req.path;
    const publicPaths = config.routing?.publicRoutes || [];

    return publicPaths.some((route) => {
        const matcher = match(route, { decode: decodeURIComponent });
        return matcher(path);
    });
}

function wrapAuthMiddleware(auth: any, config: AagunConfig) {
    return function (req: Request, res: Response, next: NextFunction) {
        if (isPublicRoute(req, config)) {
            return next();
        }

        const matchedRoute = findMatchingRoute(req);

        let isPublicViaDecorator = false;

        if (matchedRoute) {
            const { controller, methodName } = matchedRoute;

            const methodLevel = Reflect.getMetadata(
                PUBLIC_ROUTE_METADATA_KEY,
                controller.prototype,
                methodName
            );

            const classLevel = Reflect.getMetadata(PUBLIC_ROUTE_METADATA_KEY, controller);

            isPublicViaDecorator = methodLevel || classLevel;
        }

        if (isPublicViaDecorator) {
            return next();
        }

        // Will skip auth if metadata is present (will apply per route during route registration if needed)
        return auth(req, res, next);
    };
}

export async function registerMiddleware(app: Express, config: AagunConfig) {
    // JSON + cookies will be handled here too
    // Global middleware
    for (const mw of config.middleware?.global || []) {
        app.use(mw);
    }

    // Auth middleware to wrap each route
    if (config.middleware?.auth) {
        app.use(wrapAuthMiddleware(config.middleware.auth, config));
    }

    // Error handler middleware
    if (config.middleware?.error) {
        app.use(config.middleware.error);
    } else {
        app.use(DefaultErrorHandler);
    }
}

function DefaultErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error('🔥 Error caught by Aagun:', err);

    res.status(500).json({
        status: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err?.message || err : undefined
    });
}
