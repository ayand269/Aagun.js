import logger from 'morgan';

export default {
    app: {
        port: 4002,
        basePath: '',
        hostname: 'localhost',
        cache: true
    },
    middleware: {
        cors: {
            enabled: true,
            origin: '*'
        },
        global: [logger('dev')]
    },
    routing: {
        useControllerPathOverride: true,
        autoCrud: true,
        strictMode: false
    },
    generate: {
        controllerPattern: 'inherit',
        addCrudStub: true
    },
    project: {
        structure: 'module-based'
    }
};
