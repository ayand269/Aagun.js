import 'reflect-metadata';

export const METHOD_METADATA = 'aagun:method';
export const PATH_METADATA = 'aagun:path';
export const MIDDLEWARE_METADATA = 'aagun:middleware';
export const PUBLIC_ROUTE_METADATA_KEY = 'aagun:isPublic';

// --------------------------------------
// Controller-level path
export function Controller(basePath: string = ''): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(PATH_METADATA, basePath, target);
    };
}

// --------------------------------------
// Method-level HTTP decorators
function createMethodDecorator(method: string): (path: string) => MethodDecorator {
    return (path: string): MethodDecorator => {
        return function (
            target: Object,
            propertyKey: string | symbol,
            descriptor: PropertyDescriptor
        ): PropertyDescriptor | void {
            Reflect.defineMetadata(METHOD_METADATA, method, target, propertyKey);
            Reflect.defineMetadata(PATH_METADATA, path, target, propertyKey);
            return descriptor;
        };
    };
}

// --------------------------------------
// Middleware decorator
export function Use(...middleware: any[]): any {
    return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
        if (propertyKey && descriptor) {
            // Method-level
            Reflect.defineMetadata(MIDDLEWARE_METADATA, middleware, target, propertyKey);
            return descriptor;
        } else {
            // Class-level
            Reflect.defineMetadata(MIDDLEWARE_METADATA, middleware, target);
        }
    };
}

export function Public(): any {
    return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
        if (propertyKey && descriptor) {
            Reflect.defineMetadata(PUBLIC_ROUTE_METADATA_KEY, true, target, propertyKey);
            return descriptor;
        } else {
            Reflect.defineMetadata(PUBLIC_ROUTE_METADATA_KEY, true, target);
        }
    };
}

// --------------------------------------
// Export all HTTP methods
export const Get = createMethodDecorator('get');
export const Post = createMethodDecorator('post');
export const Put = createMethodDecorator('put');
export const Delete = createMethodDecorator('delete');
export const Patch = createMethodDecorator('patch');
export const Head = createMethodDecorator('head');
export const Options = createMethodDecorator('options');

export function Aagun(): ClassDecorator {
    return () => {};
}
