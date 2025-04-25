export interface WorkerJob {
    fnName: string;
    data: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
}
