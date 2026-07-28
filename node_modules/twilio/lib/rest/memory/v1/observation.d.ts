import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Request payload for creating one or more observations. Supports creation of up to 10 observations.
 */
export declare class CreateObservationsRequest {
    /**
     * Array of observations to create in a single batch operation.
     */
    "observations": Array<ObservationCore>;
    constructor(payload: any);
}
/**
 * Core mutable properties for creating observation objects.
 */
export declare class ObservationCore {
    /**
     * The main content of the observation.
     */
    "content": string;
    /**
     * The timestamp when the observation originally occurred.
     */
    "occurredAt": Date;
    /**
     * The source system that generated this observation. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters.
     */
    "source": string;
    /**
     * Array of conversation IDs associated with this observation.
     */
    "conversationIds"?: Array<string>;
    constructor(payload: any);
}
/**
 * Options to pass to patch a ObservationInstance
 */
export interface ObservationContextPatchOptions {
    /**  */
    observationCore: ObservationCore;
}
/**
 * Options to pass to create a ObservationInstance
 */
export interface ObservationListInstanceCreateOptions {
    /**  */
    createObservationsRequest: CreateObservationsRequest;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
    /** Compression algorithm used for the request body (e.g., gzip, deflate, br) */
    contentEncoding?: "gzip" | "deflate" | "br" | "compress";
}
/**
 * Options to pass to each
 */
export interface ObservationListInstanceEachOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Filter by source. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters. */
    source?: string;
    /** Filter observations created after this timestamp (inclusive). */
    createdAfter?: Date;
    /** Filter observations created before this timestamp (exclusive). */
    createdBefore?: Date;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ObservationInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ObservationListInstanceOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Filter by source. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters. */
    source?: string;
    /** Filter observations created after this timestamp (inclusive). */
    createdAfter?: Date;
    /** Filter observations created before this timestamp (exclusive). */
    createdBefore?: Date;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ObservationListInstancePageOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Filter by source. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters. */
    source?: string;
    /** Filter observations created after this timestamp (inclusive). */
    createdAfter?: Date;
    /** Filter observations created before this timestamp (exclusive). */
    createdBefore?: Date;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
}
export interface ObservationContext {
    /**
     * Remove a ObservationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance
     */
    remove(callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    /**
     * Remove a ObservationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    /**
     * Fetch a ObservationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance
     */
    fetch(callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    /**
     * Fetch a ObservationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    /**
     * Patch a ObservationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance
     */
    patch(params: ObservationCore, headers?: any, callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    /**
     * Patch a ObservationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance with HTTP metadata
     */
    patchWithHttpInfo(params: ObservationCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ObservationContextSolution {
    storeId: string;
    profileId: string;
    observationId: string;
}
export declare class ObservationContextImpl implements ObservationContext {
    protected _version: V1;
    protected _solution: ObservationContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string, profileId: string, observationId: string);
    remove(callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    fetch(callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    patch(params: ObservationCore, headers?: any, callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    patchWithHttpInfo(params: ObservationCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ObservationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for CreateObservationsRequest
 */
export interface CreateObservationsRequest {
    observations: Array<ObservationCore>;
}
/**
 * Nested model for ObservationCore
 */
export interface ObservationCore {
    content: string;
    occurredAt: Date;
    source: string;
    conversationIds?: Array<string>;
}
interface ObservationPayload extends TokenPaginationPayload {
    observations: ObservationResource[];
}
/**
 * Response model for DeleteProfileObservation202Response operations
 */
interface DeleteProfileObservation202Response_ResponseResource {
    message: string;
}
/**
 * Response model for ObservationCreatedResponse operations
 */
interface ObservationCreatedResponse_ResponseResource {
    message: string;
}
/**
 * Response model for PatchProfileObservation202Response operations
 */
interface PatchProfileObservation202Response_ResponseResource {
    message: string;
}
/**
 * Response model for ObservationInfo operations
 */
interface ObservationInfo_ResponseResource {
    content: string;
    occurredAt: Date;
    source: string;
    conversationIds?: Array<string>;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Union type for all possible response models
 */
type ObservationResource = DeleteProfileObservation202Response_ResponseResource | ObservationCreatedResponse_ResponseResource | PatchProfileObservation202Response_ResponseResource | ObservationInfo_ResponseResource;
/**
 * Response for batch observation creation.
 */
export declare class ObservationInstance {
    protected _version: V1;
    protected _solution: ObservationContextSolution;
    protected _context?: ObservationContext;
    constructor(_version: V1, _payload: ObservationResource, storeId: string, profileId: string, observationId?: string);
    message?: string;
    /**
     * The main content of the observation.
     */
    content?: string;
    /**
     * The timestamp when the observation originally occurred.
     */
    occurredAt?: Date;
    /**
     * The source system that generated this observation. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters.
     */
    source?: string;
    /**
     * Array of conversation IDs associated with this observation.
     */
    conversationIds?: Array<string>;
    /**
     * A unique identifier for the observation using Twilio Type ID (TTID) format.
     */
    id?: string;
    /**
     * The timestamp when the observation was created.
     */
    createdAt?: Date;
    /**
     * The timestamp when the observation was last updated.
     */
    updatedAt?: Date;
    private get _proxy();
    /**
     * Remove a ObservationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance
     */
    remove(callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    /**
     * Remove a ObservationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    /**
     * Fetch a ObservationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance
     */
    fetch(callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    /**
     * Fetch a ObservationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    /**
     * Patch a ObservationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance
     */
    patch(params: ObservationCore, headers?: any, callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    /**
     * Patch a ObservationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance with HTTP metadata
     */
    patchWithHttpInfo(params: ObservationCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        message: string;
        content: string;
        occurredAt: Date;
        source: string;
        conversationIds: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ObservationSolution {
    storeId: string;
    profileId: string;
}
export interface ObservationListInstance {
    _version: V1;
    _solution: ObservationSolution;
    _uri: string;
    (observationId: string): ObservationContext;
    get(observationId: string): ObservationContext;
    /**
     * Create a ObservationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance
     */
    create(params: CreateObservationsRequest, headers?: any, callback?: (error: Error | null, item?: ObservationInstance) => any): Promise<ObservationInstance>;
    /**
     * Create a ObservationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ObservationInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateObservationsRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ObservationInstance>) => any): Promise<ApiResponse<ObservationInstance>>;
    /**
     * Streams ObservationInstance records from the API.
     *
     * This operation lazily loads records as efficiently as possible until the limit
     * is reached.
     *
     * The results are passed into the callback function, so this operation is memory
     * efficient.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ObservationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: ObservationInstance, done: (err?: Error) => void) => void): void;
    each(params: ObservationListInstanceEachOptions, callback?: (item: ObservationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams ObservationInstance records from the API with HTTP metadata captured per page.
     *
     * This operation lazily loads records as efficiently as possible until the limit
     * is reached. HTTP metadata (status code, headers) is captured for each page request.
     *
     * The results are passed into the callback function, so this operation is memory
     * efficient.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ObservationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: ObservationInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ObservationListInstanceEachOptions, callback?: (item: ObservationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ObservationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ObservationPage) => any): Promise<ObservationPage>;
    /**
     * Retrieve a single target page of ObservationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ObservationPage>) => any): Promise<ApiResponse<ObservationPage>>;
    /**
     * Lists ObservationInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ObservationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: ObservationInstance[]) => any): Promise<ObservationInstance[]>;
    list(params: ObservationListInstanceOptions, callback?: (error: Error | null, items: ObservationInstance[]) => any): Promise<ObservationInstance[]>;
    /**
     * Lists ObservationInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ObservationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ObservationInstance[]>) => any): Promise<ApiResponse<ObservationInstance[]>>;
    listWithHttpInfo(params: ObservationListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<ObservationInstance[]>) => any): Promise<ApiResponse<ObservationInstance[]>>;
    /**
     * Retrieve a single page of ObservationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ObservationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ObservationPage) => any): Promise<ObservationPage>;
    page(params: ObservationListInstancePageOptions, callback?: (error: Error | null, items: ObservationPage) => any): Promise<ObservationPage>;
    /**
     * Retrieve a single page of ObservationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ObservationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ObservationPage>) => any): Promise<ApiResponse<ObservationPage>>;
    pageWithHttpInfo(params: ObservationListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ObservationPage>) => any): Promise<ApiResponse<ObservationPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ObservationListInstance(version: V1, storeId: string, profileId: string): ObservationListInstance;
export declare class ObservationPage extends TokenPage<V1, ObservationPayload, ObservationResource, ObservationInstance> {
    /**
     * Initialize the ObservationPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, uri: string, params: any, solution: ObservationSolution);
    /**
     * Build an instance of ObservationInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ObservationResource): ObservationInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
