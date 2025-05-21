import { Response } from 'express';
import type { AagunBodyResponse } from '../types/response';

export function patchResponse() {
    Response.prototype.sendSuccess = function (data, message, pagination) {
        const result: AagunBodyResponse = {
            status: true,
            message,
            data,
            ...(pagination ? { pagination } : {})
        };
        return this.json(result);
    };

    Response.prototype.sendError = function (error, message = 'Something went wrong') {
        const result: AagunBodyResponse = {
            status: false,
            message,
            error
        };
        return this.status(400).json(result);
    };
}
