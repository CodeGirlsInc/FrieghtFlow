export interface ThrottlerStorageRecord {
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
    timeToBlockExpire: number;
}
export declare const ThrottlerStorageRecord: unique symbol;
