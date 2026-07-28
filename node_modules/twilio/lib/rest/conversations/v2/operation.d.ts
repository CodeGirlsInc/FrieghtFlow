import { inspect, InspectOptions } from "util";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Error details if the operation failed. Follows RFC 9457 Problem Details.
 */
export declare class FetchOperationStatus200ResponseError {
    /**
     * A URI reference that identifies the problem type.
     */
    "type"?: string;
    /**
     * A short, human-readable summary of the problem type.
     */
    "title"?: string;
    /**
     * The HTTP status code for this occurrence of the problem.
     */
    "status"?: number;
    /**
     * A human-readable explanation specific to this occurrence.
     */
    "detail"?: string;
    /**
     * A URI reference that identifies the specific occurrence of the problem.
     */
    "instance"?: string;
    constructor(payload: any);
}
export interface OperationContext {
    /**
     * Fetch a OperationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OperationInstance
     */
    fetch(callback?: (error: Error | null, item?: OperationInstance) => any): Promise<OperationInstance>;
    /**
     * Fetch a OperationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OperationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<OperationInstance>) => any): Promise<ApiResponse<OperationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface OperationContextSolution {
    sid: string;
}
export declare class OperationContextImpl implements OperationContext {
    protected _version: V2;
    protected _solution: OperationContextSolution;
    protected _uri: string;
    constructor(_version: V2, sid: string);
    fetch(callback?: (error: Error | null, item?: OperationInstance) => any): Promise<OperationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<OperationInstance>) => any): Promise<ApiResponse<OperationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): OperationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface OperationResource {
    operationId: string;
    status: string;
    createdAt: Date;
    completedAt: Date;
    statusUrl: string;
    error: FetchOperationStatus200ResponseError;
    related: {
        [key: string]: string;
    };
}
/**
 * Status of a long-running operation.
 */
export declare class OperationInstance {
    protected _version: V2;
    protected _solution: OperationContextSolution;
    protected _context?: OperationContext;
    constructor(_version: V2, _payload: OperationResource, sid?: string);
    /**
     * Unique identifier for the long-running operation.
     */
    operationId: string;
    /**
     * Current status of the operation.
     */
    status: string;
    /**
     * Timestamp when the operation was created.
     */
    createdAt: Date;
    /**
     * Timestamp when the operation completed. Only present for completed or failed operations.
     */
    completedAt: Date;
    /**
     * URL to poll for operation status.
     */
    statusUrl: string;
    error: FetchOperationStatus200ResponseError;
    /**
     * Named resource identifiers associated with this operation. Keys depend on the operation type: - config-create, config-update, config-delete: configurationId - conversation-delete: conversationId
     */
    related: {
        [key: string]: string;
    };
    private get _proxy();
    /**
     * Fetch a OperationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OperationInstance
     */
    fetch(callback?: (error: Error | null, item?: OperationInstance) => any): Promise<OperationInstance>;
    /**
     * Fetch a OperationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OperationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<OperationInstance>) => any): Promise<ApiResponse<OperationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        operationId: string;
        status: string;
        createdAt: Date;
        completedAt: Date;
        statusUrl: string;
        error: FetchOperationStatus200ResponseError;
        related: {
            [key: string]: string;
        };
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface OperationSolution {
}
export interface OperationListInstance {
    _version: V2;
    _solution: OperationSolution;
    _uri: string;
    (sid: string): OperationContext;
    get(sid: string): OperationContext;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function OperationListInstance(version: V2): OperationListInstance;
export {};
