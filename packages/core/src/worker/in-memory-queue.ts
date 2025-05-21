import { BackgroundQueue, TaskPriority, WorkerJob } from './types';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'node:url';

export class InMemoryQueue implements BackgroundQueue {
    private highPriorityQueue: WorkerJob[] = [];
    private mediumPriorityQueue: WorkerJob[] = [];
    private lowPriorityQueue: WorkerJob[] = [];
    private active = 0;
    private maxThreads: number;

    constructor(maxThreads = 4) {
        this.maxThreads = maxThreads;
    }

    run(taskName: string, data: any, priority: TaskPriority = TaskPriority.MEDIUM): Promise<any> {
        return new Promise((resolve, reject) => {
            const jobId = `${taskName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
            const job: WorkerJob = {
                taskName,
                jobId,
                data,
                priority,
                createdAt: Date.now(),
                resolve,
                reject
            };

            if (priority === TaskPriority.HIGH) {
                this.highPriorityQueue.push(job);
            } else if (priority === TaskPriority.MEDIUM) {
                this.mediumPriorityQueue.push(job);
            } else {
                this.lowPriorityQueue.push(job);
            }

            this.tryNext();
        });
    }

    private tryNext() {
        if (this.active >= this.maxThreads) return;

        let job: WorkerJob | undefined;

        if (this.highPriorityQueue.length > 0) {
            job = this.highPriorityQueue.shift();
        } else if (this.mediumPriorityQueue.length > 0) {
            job = this.mediumPriorityQueue.shift();
        } else if (this.lowPriorityQueue.length > 0) {
            job = this.lowPriorityQueue.shift();
        }

        if (!job) return;

        this.active++;

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const worker = new Worker(path.resolve(__dirname, 'worker/thread-core.js'), {
            workerData: {
                taskName: job.taskName,
                fn: job.data.fn, // Function body
                data: job.data.data // Actual data
            }
        });

        worker.on('message', (msg) => {
            if (msg.success) {
                job!.resolve(msg.result);
            } else {
                job!.reject(new Error(msg.error));
            }
        });

        worker.on('error', (err) => {
            job!.reject(err);
        });

        worker.on('exit', () => {
            this.active--;
            this.tryNext();
        });
    }
}
