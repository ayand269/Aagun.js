// thread-core.js (ESM style)
import { workerData, parentPort } from 'node:worker_threads';

const { fnName, data } = workerData;

await import(process.cwd() + '/src/worker/registry.ts');

const fn = global.__AAGUN_WORKERS__?.[fnName];

if (!fn) {
    parentPort.postMessage({ ok: false, error: `Function '${fnName}' not found.` });
    process.exit(1);
}

fn(data)
    .then((res) => parentPort.postMessage({ ok: true, data: res }))
    .catch((err) => parentPort.postMessage({ ok: false, error: err.message }));
