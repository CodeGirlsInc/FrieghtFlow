import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class Meta {
    /**
     * The key of the list property contains the actual data items. This enables programmatic iteration over paginated results.
     */
    "key"?: string;
    "pageSize"?: number;
    "nextToken"?: string;
    "previousToken"?: string;
    constructor(payload: any);
}
export declare class PatchStoreRequest {
    /**
     * Provides a unique and addressable name to be assigned to this Store. This name is assigned by the developer and can be used in addition to the ID. It is intended to be human-readable and unique within the account.
     */
    "displayName"?: string;
    /**
     * A human readable description of this resource, up to 128 characters.
     */
    "description"?: string;
    constructor(payload: any);
}
export declare class ServiceRequest {
    /**
     * Provides a unique and addressable name to be assigned to this Store. This name is assigned by the developer and can be used in addition to the ID. It is intended to be human-readable and unique within the account.
     */
    "displayName": string;
    /**
     * A human readable description of this resource, up to 128 characters.
     */
    "description"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to patch a StoreInstance
 */
export interface StoreContextPatchOptions {
    /** Allows for optimistic concurrency control by making the request conditional. Server will only act if the resource\'s current Entity Tag (ETag) matches the one provided, preventing accidental overwrites. */
    ifMatch?: string;
    /**  */
    patchStoreRequest?: PatchStoreRequest;
}
/**
 * Options to pass to create a StoreInstance
 */
export interface StoreListInstanceCreateOptions {
    /**  */
    serviceRequest: ServiceRequest;
}
/**
 * Options to pass to each
 */
export interface StoreListInstanceEachOptions {
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: StoreInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface StoreListInstanceOptions {
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface StoreListInstancePageOptions {
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
}
export interface StoreContext {
    /**
     * Remove a StoreInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    remove(callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Remove a StoreInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Fetch a StoreInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    fetch(callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Fetch a StoreInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Patch a StoreInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    patch(callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Patch a StoreInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    patch(params: PatchStoreRequest, headers?: any, callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Patch a StoreInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    patchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Patch a StoreInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    patchWithHttpInfo(params: PatchStoreRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface StoreContextSolution {
    storeId: string;
}
export declare class StoreContextImpl implements StoreContext {
    protected _version: V1;
    protected _solution: StoreContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string);
    remove(callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    fetch(callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    patch(params?: PatchStoreRequest | ((error: Error | null, item?: StoreInstance) => any), headers?: any, callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    patchWithHttpInfo(params?: PatchStoreRequest | ((error: Error | null, item?: ApiResponse<StoreInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): StoreContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for Meta
 */
export interface Meta {
    key?: string;
    pageSize?: number;
    nextToken?: string;
    previousToken?: string;
}
/**
 * Nested model for PatchStoreRequest
 */
export interface PatchStoreRequest {
    displayName?: string;
    description?: string;
}
/**
 * Nested model for ServiceRequest
 */
export interface ServiceRequest {
    displayName: string;
    description?: string;
}
interface StorePayload extends TokenPaginationPayload {
    stores: string[];
}
/**
 * Response model for PatchStore202Response operations
 */
interface PatchStore202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Response model for CreateStore202Response operations
 */
interface CreateStore202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Response model for ServiceList operations
 */
interface ServiceList_ResponseResource {
    stores?: Array<string>;
    meta?: Meta;
}
/**
 * Response model for DeleteStore202Response operations
 */
interface DeleteStore202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Response model for Store operations
 */
interface Store_ResponseResource {
    displayName: string;
    description?: string;
    id: string;
    status: string;
    intelligenceServiceId: string;
    version: number;
}
/**
 * Union type for all possible response models
 */
type StoreResource = PatchStore202Response_ResponseResource | CreateStore202Response_ResponseResource | ServiceList_ResponseResource | DeleteStore202Response_ResponseResource | Store_ResponseResource;
export declare class StoreInstance {
    protected _version: V1;
    protected _solution: StoreContextSolution;
    protected _context?: StoreContext;
    constructor(_version: V1, _payload: StoreResource, storeId?: string);
    message?: string;
    /**
     * URI to check operation status.
     */
    statusUrl?: string;
    /**
     * List of Memory Store IDs associated with the Twilio account.
     */
    stores?: Array<string>;
    meta?: Meta;
    /**
     * Provides a unique and addressable name to be assigned to this Store. This name is assigned by the developer and can be used in addition to the ID. It is intended to be human-readable and unique within the account.
     */
    displayName?: string;
    /**
     * A human readable description of this resource, up to 128 characters.
     */
    description?: string;
    /**
     * The unique identifier for the Memory Store
     */
    id?: string;
    /**
     * The current status of the Memory Store.  A store begins in the QUEUED state as it is scheduled for processing.  It then moves to PROVISIONING at the beginning of processing. It transitions to ACTIVE once all dependent resources are provisioned, including Conversational Intelligence capabilities.  If there is an issue provisioning resources, the store will move to the FAILED state.
     */
    status?: string;
    /**
     * The ID of the associated intelligence service that was provisioned for memory extraction.
     */
    intelligenceServiceId?: string;
    /**
     * The current version number of the Memory Store. Incremented on each successful update.
     */
    version?: number;
    private get _proxy();
    /**
     * Remove a StoreInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    remove(callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Remove a StoreInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Fetch a StoreInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    fetch(callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Fetch a StoreInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Patch a StoreInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    patch(callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Patch a StoreInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    patch(params: PatchStoreRequest, headers?: any, callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Patch a StoreInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    patchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Patch a StoreInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    patchWithHttpInfo(params: PatchStoreRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        message: string;
        statusUrl: string;
        stores: string[];
        meta: Meta;
        displayName: string;
        description: string;
        id: string;
        status: string;
        intelligenceServiceId: string;
        version: number;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface StoreSolution {
}
export interface StoreListInstance {
    _version: V1;
    _solution: StoreSolution;
    _uri: string;
    (storeId: string): StoreContext;
    get(storeId: string): StoreContext;
    /**
     * Create a StoreInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance
     */
    create(params: ServiceRequest, headers?: any, callback?: (error: Error | null, item?: StoreInstance) => any): Promise<StoreInstance>;
    /**
     * Create a StoreInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed StoreInstance with HTTP metadata
     */
    createWithHttpInfo(params: ServiceRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<StoreInstance>) => any): Promise<ApiResponse<StoreInstance>>;
    /**
     * Streams StoreInstance records from the API.
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
     * @param { StoreListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: string, done: (err?: Error) => void) => void): void;
    each(params: StoreListInstanceEachOptions, callback?: (item: string, done: (err?: Error) => void) => void): void;
    /**
     * Streams StoreInstance records from the API with HTTP metadata captured per page.
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
     * @param { StoreListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: string, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: StoreListInstanceEachOptions, callback?: (item: string, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of StoreInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: StorePage) => any): Promise<StorePage>;
    /**
     * Retrieve a single target page of StoreInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<StorePage>) => any): Promise<ApiResponse<StorePage>>;
    /**
     * Lists StoreInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { StoreListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: string[]) => any): Promise<string[]>;
    list(params: StoreListInstanceOptions, callback?: (error: Error | null, items: string[]) => any): Promise<string[]>;
    /**
     * Lists StoreInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { StoreListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<string[]>) => any): Promise<ApiResponse<string[]>>;
    listWithHttpInfo(params: StoreListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<string[]>) => any): Promise<ApiResponse<string[]>>;
    /**
     * Retrieve a single page of StoreInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { StoreListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: StorePage) => any): Promise<StorePage>;
    page(params: StoreListInstancePageOptions, callback?: (error: Error | null, items: StorePage) => any): Promise<StorePage>;
    /**
     * Retrieve a single page of StoreInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { StoreListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<StorePage>) => any): Promise<ApiResponse<StorePage>>;
    pageWithHttpInfo(params: StoreListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<StorePage>) => any): Promise<ApiResponse<StorePage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function StoreListInstance(version: V1): StoreListInstance;
export declare class StorePage extends TokenPage<V1, StorePayload, StoreResource, string> {
    /**
     * Initialize the StorePage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, uri: string, params: any, solution: StoreSolution);
    /**
     * Build an instance of StoreInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: StoreResource): string;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
