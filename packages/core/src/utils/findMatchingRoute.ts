import { match } from 'path-to-regexp';
import { Request } from 'express';
import { routeRegistry } from '../internal/routeRegistry';

export function findMatchingRoute(req: Request) {
    const method = req.method.toLowerCase();

    for (const route of routeRegistry) {
        if (route.method === method) {
            const matcher = match(route.path, { decode: decodeURIComponent });
            if (matcher(req.path)) {
                return route;
            }
        }
    }

    return null;
}
