import { UlwLoopError } from "./types.js";
export declare const ULW_LOOP_LOCK_TIMEOUT_CODE = "ULW_LOOP_LOCK_TIMEOUT";
export interface StateLockOptions {
    readonly timeoutMs?: number;
    readonly staleMs?: number;
}
export declare function withStateLock<T>(lockPath: string, fn: () => Promise<T>, options?: StateLockOptions): Promise<T>;
export declare function withStateLockSync<T>(lockPath: string, fn: () => T, options?: StateLockOptions): T;
export declare function isStateLockTimeout(error: unknown): error is UlwLoopError;
