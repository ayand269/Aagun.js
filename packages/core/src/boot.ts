import express from 'express';
import cookieParser from 'cookie-parser';
import loadRoutes from './router';
import chalk from 'chalk';
import { registerMiddleware } from './middleware';
import { AagunConfig } from './types';
import defaultConfig from './config';

function mergeAagunConfig(defaults: any, user: any): any {
    return {
        ...defaults,
        ...user,
        app: { ...defaults.app, ...user.app },
        middleware: { ...defaults.middleware, ...user.middleware },
        routing: { ...defaults.routing, ...user.routing },
        generate: { ...defaults.generate, ...user.generate }
    };
}

export async function startAagunApp(userConfig: AagunConfig) {
    const app = express();

    // Built-in middleware
    app.use(express.json());
    const mergedConfig = mergeAagunConfig(defaultConfig, userConfig);
    // CORS
    if (mergedConfig.middleware?.cors?.enabled) {
        const cors = await import('cors');
        app.use(cors.default(mergedConfig.middleware.cors));
    }

    // Cookies
    // if (mergedConfig.middleware?.cookies?.enabled) {
    //     app.use(cookieParser(mergedConfig.middleware.cookies.secret));
    // }

    await registerMiddleware(app, mergedConfig);

    // Load routes
    await loadRoutes(app, userConfig);

    // Start the server
    const port = mergedConfig.app?.port || 3000;
    const host = mergedConfig.app?.hostname || 'localhost';

    app.listen(port, host, () => {
        console.log(chalk.green(`⚡ Aagun.js is running at http://${host}:${port}`));
    }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            console.error(
                chalk.red(`❌ Port ${port} is already in use. Please update aagun.config.js.`)
            );
        } else {
            console.error(chalk.red('❌ Error starting server:'), err);
        }
        throw err;
    });
}
