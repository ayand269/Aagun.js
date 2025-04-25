import { Worker } from 'node:worker_threads';
import { WorkerJob } from './types';

export class WorkerQueue {
    private queue: WorkerJob[] = [];
    private active = 0;
    private maxThreads: number;

    constructor(opts: { maxThreads?: number } = {}) {
        this.maxThreads = opts.maxThreads || 4;
    }

    run(fnName: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push({ fnName, data, resolve, reject });
            this.tryNext();
        });
    }

    private tryNext() {
        if (this.active >= this.maxThreads || this.queue.length === 0) return;

        const job = this.queue.shift()!;
        this.active++;

        const worker = new Worker(new URL('./worker/thread-core.js', import.meta.url), {
            workerData: { fnName: job.fnName, data: job.data }
        });

        worker.on('message', (res) => {
            this.active--;
            worker.terminate();
            this.tryNext();

            if (res.ok) job.resolve(res.data);
            else job.reject(new Error(res.error));
        });

        worker.on('error', (err) => {
            this.active--;
            worker.terminate();
            this.tryNext();
            job.reject(err);
        });
    }
}
