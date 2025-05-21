import 'reflect-metadata';
import { registerModel } from './registry';

export function Model(name: string) {
    return function (target: any) {
        target.setup?.();
        target.attachStatics?.();
        target.attachHooks?.();

        if (target.model) {
            target.watchChanges?.();
            registerModel(name, target.model);
        } else {
            console.warn(`[Aagun.js] ⚠️ No 'model' found in @Model(${name})`);
        }
    };
}
