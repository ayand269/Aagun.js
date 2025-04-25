import { NextFunction, Response } from 'express';
import { GetTokenOptions, AagunRequest } from './types';
import jwt from 'jsonwebtoken';

export function createAuthMiddleware(req: AagunRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: false,
            message: 'Unauthorized',
            error: 'Missing or malformed Authorization header'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.AAGUN_JWT_SECRET || 'defaultAagunSecret');
        req.user = decoded; // Attach decoded payload (e.g., user info)
        next();
    } catch (err: any) {
        return res.status(403).json({
            status: false,
            message: 'Forbidden',
            error: err.message || 'Invalid or expired token'
        });
    }
}

export function getToken({ payload, expiresIn = '10d', algorithm = 'HS256' }: GetTokenOptions): string {
    if (!payload || typeof payload !== 'object') {
        throw new Error('getToken: payload must be a valid object');
    }

    try {
        const token = jwt.sign(payload, process.env.AAGUN_JWT_SECRET || 'defaultAagunSecret', {
            algorithm,
            expiresIn
        });

        return token;
    } catch (err: any) {
        console.error('❌ getToken error:', err.message);
        throw new Error('Failed to generate token');
    }
}
