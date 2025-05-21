let mongoose: typeof import('mongoose');

try {
    mongoose = await import('mongoose');
} catch {
    throw new Error('[Aagun.js] Mongoose is not installed. Please run: npm install mongoose');
}

export const { Schema, model, Types, connection } = mongoose;
export default mongoose;
