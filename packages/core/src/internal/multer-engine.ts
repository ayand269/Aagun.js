import multer from 'multer';
import { getGlobalAagunConfig } from './global-config';
import { AagunConfig } from '../types';

const uploadEngine = (aagunConfig: AagunConfig) =>
    multer({
        storage: multer.memoryStorage(), // 🔥 No Disk Storage anymore
        limits: {
            fileSize: aagunConfig.upload?.maxSize || 5 * 1024 * 1024 // Optional 5MB limit
        },
        fileFilter: function (req, file, cb) {
            const allowed = aagunConfig.upload?.allowedTypes || [];
            if (allowed.length > 0 && !allowed.includes(file.mimetype)) {
                return cb(new Error('Invalid file type'));
            }
            cb(null, true);
        }
    });

export function applyUploadMiddleware(type: 'single' | 'array' | 'fields', options: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.middlewares) {
            target.middlewares = {};
        }
        if (!target.middlewares[propertyKey]) {
            target.middlewares[propertyKey] = [];
        }

        const aagunConfig = getGlobalAagunConfig();

        const uploader = uploadEngine(aagunConfig);
        let middlewareFn: any;
        if (type === 'single') {
            middlewareFn = uploader.single(options.fieldName);
        } else if (type === 'array') {
            middlewareFn = uploader.array(options.fieldName, options.maxCount);
        } else if (type === 'fields') {
            middlewareFn = uploader.fields(options.fields);
        }

        const existing = Reflect.getMetadata('aagun:middleware', target, propertyKey) || [];
        Reflect.defineMetadata(
            'aagun:middleware',
            [...existing, middlewareFn],
            target,
            propertyKey
        );

        Reflect.defineMetadata('aagun:disable_cache', true, target, propertyKey);

        target.middlewares[propertyKey].push(middlewareFn);

        return descriptor;
    };
}
