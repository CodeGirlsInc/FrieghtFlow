export interface ThrottlerStorageOptions {
    totalHits: Map<string, number>;
    expiresAt: number;
    isBlocked: boolean;
    blockExpiresAt: number;
}
export declare const ThrottlerStorageOptions: unique symbol;
