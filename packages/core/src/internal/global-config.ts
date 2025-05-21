import { AagunConfig } from '../types';

let globalAagunConfig: AagunConfig | null = null;

export function setGlobalAagunConfig(config: AagunConfig) {
    globalAagunConfig = config;
}

export function getGlobalAagunConfig(): AagunConfig {
    if (!globalAagunConfig) {
        throw new Error('Aagun config not initialized yet.');
    }
    return globalAagunConfig;
}
