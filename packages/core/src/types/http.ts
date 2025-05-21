import type { Response as ExpressResponse } from 'express';
import type { AagunBodyResponse } from './response';

export type AagunResponse<T = any> = ExpressResponse<AagunBodyResponse<T>> & {
    sendSuccess: (
        data: T,
        message: string,
        pagination?: {
            total: number;
            currentPage: number;
            totalPages: number;
        }
    ) => AagunResponse<T>;

    sendError: (error: any, message?: string, statusCode?: number) => AagunResponse<never>;
};
