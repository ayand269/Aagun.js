type TaskFn = (data: any) => Promise<any> | any;

const taskMap = new Map<string, TaskFn>();

export function registerTask(taskName: string, fn: TaskFn) {
    taskMap.set(taskName, fn);
}

export function getTaskFn(taskName: string): TaskFn | undefined {
    return taskMap.get(taskName);
}
