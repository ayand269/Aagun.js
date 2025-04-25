export interface AwaitCall {
    id: string;
    line: number;
    variable?: string;
    dependsOn?: string[];
}

export interface ExecutionPlan {
    batches: (Function | Function[])[];
    preserved: string[];
    unsafe: string[];
}

export interface SmartLogEntry {
    controller?: string;
    method?: string;
    route?: string;
    httpMethod?: string;
    batches: any[];
    preserved: string[];
    unsafe: string[];
}
