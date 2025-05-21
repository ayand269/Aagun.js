import type { AagunResponse } from './http';

declare module 'express-serve-static-core' {
    interface Response {
        sendSuccess<T>(
            data: T,
            message: string,
            pagination?: { total: number; currentPage: number; totalPages: number }
        ): AagunResponse<T>;

        sendError(error: any, message?: string, statusCode?: number): AagunResponse<never>;
    }
}
