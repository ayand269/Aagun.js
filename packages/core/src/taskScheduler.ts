import cron from 'node-cron';
import { runInWorker } from './worker/runInWorker';
import { TaskPriority } from './worker/types';
import { registerTask } from './worker/taskRegistry';

export function schedule(
    cronExpr: string,
    taskName: string,
    taskFn: () => Promise<any> | any,
    opts: { background?: boolean } = { background: false }
) {
    if (opts?.background !== false) {
        registerTask(taskName, taskFn); // 🛠️ Auto-register task for background scheduler
    }

    cron.schedule(cronExpr, async () => {
        if (opts?.background === false) {
            await taskFn();
        } else {
            await runInWorker(taskName, {}, TaskPriority.LOW);
        }
    });

    console.log(`[Scheduler] Registered cron: "${taskName}" with pattern: "${cronExpr}"`);
}
