import { TaskPriority } from './types';
import { InMemoryQueue } from './in-memory-queue';
import { getTaskFn } from './taskRegistry';

// Create a single queue instance
export const queue = new InMemoryQueue();

export async function runInWorker(taskName: string, data: any, priority?: TaskPriority) {
    const effectivePriority = priority || TaskPriority.HIGH;

    const taskFn = getTaskFn(taskName);
    if (!taskFn) {
        throw new Error(`Task "${taskName}" is not registered.`);
    }

    return queue.run(taskName, { data, fn: taskFn.toString() }, effectivePriority);
}
