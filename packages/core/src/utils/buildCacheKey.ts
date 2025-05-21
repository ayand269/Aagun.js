import { Request } from 'express';

export function buildCacheKey(req: Request): string {
    const q = JSON.stringify(req.query || {});
    return `[${req.method}] ${req.originalUrl}?${q}`;
}
