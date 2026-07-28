import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Data for creating or updating a profile, including traits.
 */
export declare class ProfileData {
    /**
     * Multiple trait groups.
     */
    "traits"?: {
        [key: string]: {
            [key: string]: any;
        };
    };
    constructor(payload: any);
}
export declare class UpdateProfilesBulkRequest {
    "profiles"?: Array<ProfileData>;
    constructor(payload: any);
}
/**
 * Options to pass to update a BulkInstance
 */
export interface BulkContextUpdateOptions {
    /**  */
    updateProfilesBulkRequest: UpdateProfilesBulkRequest;
}
export interface BulkContext {
    /**
     * Update a BulkInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed BulkInstance
     */
    update(params: UpdateProfilesBulkRequest, headers?: any, callback?: (error: Error | null, item?: BulkInstance) => any): Promise<BulkInstance>;
    /**
     * Update a BulkInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed BulkInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateProfilesBulkRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<BulkInstance>) => any): Promise<ApiResponse<BulkInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface BulkContextSolution {
    storeId: string;
}
export declare class BulkContextImpl implements BulkContext {
    protected _version: V1;
    protected _solution: BulkContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string);
    update(params: UpdateProfilesBulkRequest, headers?: any, callback?: (error: Error | null, item?: BulkInstance) => any): Promise<BulkInstance>;
    updateWithHttpInfo(params: UpdateProfilesBulkRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<BulkInstance>) => any): Promise<ApiResponse<BulkInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): BulkContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface BulkResource {
    message: string;
}
export declare class BulkInstance {
    protected _version: V1;
    protected _solution: BulkContextSolution;
    protected _context?: BulkContext;
    constructor(_version: V1, _payload: BulkResource, storeId?: string);
    message: string;
    private get _proxy();
    /**
     * Update a BulkInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed BulkInstance
     */
    update(params: UpdateProfilesBulkRequest, headers?: any, callback?: (error: Error | null, item?: BulkInstance) => any): Promise<BulkInstance>;
    /**
     * Update a BulkInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed BulkInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateProfilesBulkRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<BulkInstance>) => any): Promise<ApiResponse<BulkInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        message: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface BulkSolution {
}
export interface BulkListInstance {
    _version: V1;
    _solution: BulkSolution;
    _uri: string;
    (storeId: string): BulkContext;
    get(storeId: string): BulkContext;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function BulkListInstance(version: V1): BulkListInstance;
export {};
