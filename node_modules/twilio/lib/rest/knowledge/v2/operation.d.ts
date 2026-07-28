import { inspect, InspectOptions } from "util";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class OperationResultResourceId {
    "type": string;
    /**
     * The identifier of the created or affected resource.
     */
    "id": string;
    constructor(payload: any);
}
export declare class OperationStatusError {
    /**
     * A URI reference identifying the problem type.
     */
    "type"?: string;
    /**
     * A short, human-readable summary of the problem type.
     */
    "title"?: string;
    /**
     * The numeric Twilio error code.
     */
    "code"?: number;
    /**
     * A human-readable explanation specific to this occurrence of the problem.
     */
    "detail"?: string;
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
    operationId: string;
}
export declare class OperationContextImpl implements OperationContext {
    protected _version: V2;
    protected _solution: OperationContextSolution;
    protected _uri: string;
    constructor(_version: V2, operationId: string);
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
    statusUrl: string;
    completedAt: Date;
    result: OperationResultResourceId;
    error: OperationStatusError;
    resultUrl: string;
}
export declare class OperationInstance {
    protected _version: V2;
    protected _solution: OperationContextSolution;
    protected _context?: OperationContext;
    constructor(_version: V2, _payload: OperationResource, operationId?: string);
    /**
     * The unique identifier for this operation.
     */
    operationId: string;
    /**
     * The current status of the operation.
     */
    status: string;
    /**
     * When the operation was created.
     */
    createdAt: Date;
    /**
     * URI to check operation status.
     */
    statusUrl: string;
    /**
     * When the operation completed or failed.
     */
    completedAt: Date;
    result: OperationResultResourceId;
    error: OperationStatusError;
    /**
     * URL to fetch the resulting resource.
     */
    resultUrl: string;
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
        statusUrl: string;
        completedAt: Date;
        result: OperationResultResourceId;
        error: OperationStatusError;
        resultUrl: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface OperationSolution {
}
export interface OperationListInstance {
    _version: V2;
    _solution: OperationSolution;
    _uri: string;
    (operationId: string): OperationContext;
    get(operationId: string): OperationContext;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function OperationListInstance(version: V2): OperationListInstance;
export {};
