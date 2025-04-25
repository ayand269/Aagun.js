import { Request, Response } from 'express';
import { CookieOption } from '../types';

export function getCookie(req: Request, name: string): string | undefined {
    return req.signedCookies?.[name] || req.cookies?.[name];
}

export function setCookie(res: Response, name: string, value: any, options: CookieOption = {}) {
    const defaultOptions: CookieOption = {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        ...options
    };

    res.cookie(name, value, defaultOptions);
}
