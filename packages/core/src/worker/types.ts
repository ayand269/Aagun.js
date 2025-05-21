export enum TaskPriority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export type WorkerJob = {
    taskName: string;
    jobId: string;
    data: any;
    priority: TaskPriority;
    createdAt: number;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
};

export interface BackgroundQueue {
    run(taskName: string, data: any, priority: TaskPriority): Promise<any>;
}
