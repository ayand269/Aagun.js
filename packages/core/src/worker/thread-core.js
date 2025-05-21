import { parentPort, workerData } from 'node:worker_threads';

(async () => {
    try {
        const { taskName, data, fn } = workerData;

        if (!fn) {
            throw new Error(`No function provided for task: ${taskName}`);
        }

        console.log(`[Worker] Starting task: "${taskName}"`);

        const start = Date.now();

        // Reconstruct function from string
        const taskFn = eval(`(${fn})`);

        const result = await taskFn(data);

        const end = Date.now();

        console.log(`[Worker] Finished task: "${taskName}" in ${end - start}ms`);

        parentPort.postMessage({ success: true, result });
    } catch (error) {
        parentPort.postMessage({ success: false, error: error.message });
    }
})();
