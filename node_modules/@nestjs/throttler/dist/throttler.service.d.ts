import { OnApplicationShutdown } from '@nestjs/common';
import { ThrottlerStorageOptions } from './throttler-storage-options.interface';
import { ThrottlerStorageRecord } from './throttler-storage-record.interface';
import { ThrottlerStorage } from './throttler-storage.interface';
export declare class ThrottlerStorageService implements ThrottlerStorage, OnApplicationShutdown {
    private _storage;
    private timeoutIds;
    get storage(): Map<string, ThrottlerStorageOptions>;
    private getExpirationTime;
    private getBlockExpirationTime;
    private setExpirationTime;
    private clearExpirationTimes;
    private resetBlockdRequest;
    private fireHitCount;
    increment(key: string, ttl: number, limit: number, blockDuration: number, throttlerName: string): Promise<ThrottlerStorageRecord>;
    onApplicationShutdown(): void;
}
