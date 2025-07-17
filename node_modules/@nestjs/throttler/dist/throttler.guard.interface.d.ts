import { ExecutionContext } from '@nestjs/common';
import { ThrottlerStorageRecord } from './throttler-storage-record.interface';
import { ThrottlerGenerateKeyFunction, ThrottlerGetTrackerFunction, ThrottlerOptions } from './throttler-module-options.interface';
export interface ThrottlerLimitDetail extends ThrottlerStorageRecord {
    ttl: number;
    limit: number;
    key: string;
    tracker: string;
}
export interface ThrottlerRequest {
    context: ExecutionContext;
    limit: number;
    ttl: number;
    throttler: ThrottlerOptions;
    blockDuration: number;
    getTracker: ThrottlerGetTrackerFunction;
    generateKey: ThrottlerGenerateKeyFunction;
}
