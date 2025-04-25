import { ErrorRequestHandler, RequestHandler, Request } from 'express';

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
        structure: AagunStructure;
    };
}

export type AagunStructure = 'type-based' | 'module-based';
