export interface DefaultAagunSuccess<T = any> {
    status: true;
    message: string;
    data: T;
    pagination?: {
        total: number;
        currentPage: number;
        totalPages: number;
    };
}

export interface DefaultAagunError {
    status: false;
    message: string;
    error: any;
}

// ✅ Allow override via global `Aagun.Response<T>`
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Aagun {
        type Response<T = any> = DefaultAagunSuccess<T> | DefaultAagunError;
    }
}

// ✅ Always use this inside your Response
export type AagunBodyResponse<T = any> = Aagun.Response<T>;
