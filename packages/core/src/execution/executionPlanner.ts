import { AwaitCall, ExecutionPlan } from './types';

export function planExecutionBatches(awaits: AwaitCall[]): ExecutionPlan {
    const batches: (Function | Function[])[] = [];
    const preserved: string[] = [];
    const unsafe: string[] = [];

    // Dummy logic (replace with real DAG planner later)
    for (const awaitCall of awaits) {
        if (!awaitCall.dependsOn) {
            batches.push([() => {}]); // placeholder for independent await
        } else {
            preserved.push(awaitCall.id);
            batches.push(() => {}); // sequential fallback for dependent await
        }
    }

    return { batches, preserved, unsafe };
}
