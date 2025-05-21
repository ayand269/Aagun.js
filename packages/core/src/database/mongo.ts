import mongoose from './mongoose';
import { AagunConfig } from '../types';

export async function connectMongo(config: AagunConfig) {
    if (config.database?.type !== 'mongodb') return;

    try {
        await mongoose.connect(config.database.connectionString);
        console.log('[Aagun.js] ✅ MongoDB connected');
    } catch (err) {
        console.error('[Aagun.js] ❌ MongoDB connection failed');
        console.error(err);
        process.exit(1); // fail fast
    }
}
