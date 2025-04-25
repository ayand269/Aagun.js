import { WorkerQueue } from './WorkerQueue';

const queue = new WorkerQueue({ maxThreads: 4 });

export const runInWorker = (fnName: string, data: any) => {
    return queue.run(fnName, data);
};
