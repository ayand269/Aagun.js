// packages/core/src/config.ts
import { AagunConfig } from './types';

const defaultConfig: AagunConfig = {
    app: {
        port: 3000,
        basePath: '',
        hostname: 'localhost'
    },
    middleware: {
        cors: {
            enabled: false,
            origin: '*'
        }
    }
};

export default defaultConfig;
