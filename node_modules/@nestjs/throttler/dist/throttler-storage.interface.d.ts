import { ThrottlerStorageRecord } from './throttler-storage-record.interface';
export interface ThrottlerStorage {
    increment(key: string, ttl: number, limit: number, blockDuration: number, throttlerName: string): Promise<ThrottlerStorageRecord>;
}
export declare const ThrottlerStorage: unique symbol;
