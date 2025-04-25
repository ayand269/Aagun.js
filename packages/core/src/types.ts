import { ErrorRequestHandler, RequestHandler, Request } from 'express';
import { Algorithm } from 'jsonwebtoken';
import ms from 'ms';

export interface AagunConfig {
    app?: {
        port?: number;
        basePath: string;
        hostname?: string;
    };
    middleware?: {
        cors?: {
            enabled?: boolean;
            origin?: string | string[];
            credentials?: boolean;
        };
        global?: Array<RequestHandler>;
        auth?: RequestHandler;
        error?: ErrorRequestHandler;
    };
    generate?: {
        controllerPattern?: 'inherit' | 'composition';
        addCrudStub?: boolean;
    };
    routing?: {
        useControllerPathOverride?: boolean;
        autoCrud?: boolean;
        strictMode?: boolean;
        basePath?: string;
        publicRoutes?: Array<string>;
    };
    project?: {
        structure: 'module-based' | 'type-based';
    };
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

export type CookieOption = {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
    path?: string;
};

export interface AagunRequest<TUser = any> extends Request {
    user?: TUser;
}

export interface GetTokenOptions {
    payload: Record<string, any>;
    secret?: string;
    expiresIn?: number | ms.StringValue;
    algorithm?: Algorithm;
}
