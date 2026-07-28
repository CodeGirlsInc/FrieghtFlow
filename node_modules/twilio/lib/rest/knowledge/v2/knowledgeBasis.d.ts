import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class KnowledgeBaseCore {
    /**
     * Provides a unique and addressable name to be assigned to this Knowledge Base. This name is assigned by the developer and can be used in addition to the ID. It is intended to be human-readable and unique within the account.
     */
    "displayName": string;
    /**
     * A human readable description of this resource, up to 128 characters.
     */
    "description"?: string;
    constructor(payload: any);
}
export declare class UpdateKnowledgeBaseRequest {
    /**
     * Provides a unique and addressable name to be assigned to this Knowledge Base. This name is assigned by the developer and can be used in addition to the ID. It is intended to be human-readable and unique within the account.
     */
    "displayName"?: string;
    /**
     * A human readable description of this resource, up to 128 characters.
     */
    "description"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to update a KnowledgeBasisInstance
 */
export interface KnowledgeBasisContextUpdateOptions {
    /**  */
    updateKnowledgeBaseRequest: UpdateKnowledgeBaseRequest;
    /** Allows for optimistic concurrency control by making the request conditional. Server will only act if the resource\'s current Entity Tag (ETag) matches the one provided, preventing accidental overwrites. */
    ifMatch?: string;
}
/**
 * Options to pass to create a KnowledgeBasisInstance
 */
export interface KnowledgeBasisListInstanceCreateOptions {
    /**  */
    knowledgeBaseCore: KnowledgeBaseCore;
}
/**
 * Options to pass to each
 */
export interface KnowledgeBasisListInstanceEachOptions {
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: KnowledgeBasisInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface KnowledgeBasisListInstanceOptions {
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
export interface KnowledgeBasisListInstancePageOptions {
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
}
export interface KnowledgeBasisContext {
    /**
     * Remove a KnowledgeBasisInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance
     */
    remove(callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    /**
     * Remove a KnowledgeBasisInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    /**
     * Fetch a KnowledgeBasisInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance
     */
    fetch(callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    /**
     * Fetch a KnowledgeBasisInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    /**
     * Update a KnowledgeBasisInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance
     */
    update(params: UpdateKnowledgeBaseRequest, headers?: any, callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    /**
     * Update a KnowledgeBasisInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateKnowledgeBaseRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface KnowledgeBasisContextSolution {
    kbId: string;
}
export declare class KnowledgeBasisContextImpl implements KnowledgeBasisContext {
    protected _version: V2;
    protected _solution: KnowledgeBasisContextSolution;
    protected _uri: string;
    constructor(_version: V2, kbId: string);
    remove(callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    fetch(callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    update(params: UpdateKnowledgeBaseRequest, headers?: any, callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    updateWithHttpInfo(params: UpdateKnowledgeBaseRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): KnowledgeBasisContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for KnowledgeBaseCore
 */
export interface KnowledgeBaseCore {
    displayName: string;
    description?: string;
}
/**
 * Nested model for UpdateKnowledgeBaseRequest
 */
export interface UpdateKnowledgeBaseRequest {
    displayName?: string;
    description?: string;
}
interface KnowledgeBasisPayload extends TokenPaginationPayload {
    knowledgeBases: KnowledgeBasisResource[];
}
/**
 * Response model for DeleteKnowledgeBase202Response operations
 */
interface DeleteKnowledgeBase202Response_ResponseResource {
    message?: string;
}
/**
 * Response model for KnowledgeBase operations
 */
interface KnowledgeBase_ResponseResource {
    displayName: string;
    description?: string;
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
/**
 * Response model for CreateKnowledgeBase202Response operations
 */
interface CreateKnowledgeBase202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Response model for UpdateKnowledgeBase202Response operations
 */
interface UpdateKnowledgeBase202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Union type for all possible response models
 */
type KnowledgeBasisResource = DeleteKnowledgeBase202Response_ResponseResource | KnowledgeBase_ResponseResource | CreateKnowledgeBase202Response_ResponseResource | UpdateKnowledgeBase202Response_ResponseResource;
export declare class KnowledgeBasisInstance {
    protected _version: V2;
    protected _solution: KnowledgeBasisContextSolution;
    protected _context?: KnowledgeBasisContext;
    constructor(_version: V2, _payload: KnowledgeBasisResource, kbId?: string);
    message?: string;
    /**
     * Provides a unique and addressable name to be assigned to this Knowledge Base. This name is assigned by the developer and can be used in addition to the ID. It is intended to be human-readable and unique within the account.
     */
    displayName?: string;
    /**
     * A human readable description of this resource, up to 128 characters.
     */
    description?: string;
    /**
     * The unique identifier for the Knowledge Base
     */
    id?: string;
    /**
     * The provisioning status of the Knowledge Base
     */
    status?: string;
    /**
     * The ISO 8601 timestamp when the Knowledge Base was created.
     */
    createdAt?: Date;
    /**
     * The ISO 8601 timestamp when the Knowledge Base was last updated.
     */
    updatedAt?: Date;
    /**
     * The current version number of the Knowledge Base. Incremented on each successful mutable update.
     */
    version?: number;
    /**
     * URI to check operation status.
     */
    statusUrl?: string;
    private get _proxy();
    /**
     * Remove a KnowledgeBasisInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance
     */
    remove(callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    /**
     * Remove a KnowledgeBasisInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    /**
     * Fetch a KnowledgeBasisInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance
     */
    fetch(callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    /**
     * Fetch a KnowledgeBasisInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    /**
     * Update a KnowledgeBasisInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance
     */
    update(params: UpdateKnowledgeBaseRequest, headers?: any, callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    /**
     * Update a KnowledgeBasisInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateKnowledgeBaseRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        message: string;
        displayName: string;
        description: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        statusUrl: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface KnowledgeBasisSolution {
}
export interface KnowledgeBasisListInstance {
    _version: V2;
    _solution: KnowledgeBasisSolution;
    _uri: string;
    (kbId: string): KnowledgeBasisContext;
    get(kbId: string): KnowledgeBasisContext;
    /**
     * Create a KnowledgeBasisInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance
     */
    create(params: KnowledgeBaseCore, headers?: any, callback?: (error: Error | null, item?: KnowledgeBasisInstance) => any): Promise<KnowledgeBasisInstance>;
    /**
     * Create a KnowledgeBasisInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeBasisInstance with HTTP metadata
     */
    createWithHttpInfo(params: KnowledgeBaseCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<KnowledgeBasisInstance>) => any): Promise<ApiResponse<KnowledgeBasisInstance>>;
    /**
     * Streams KnowledgeBasisInstance records from the API.
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
     * @param { KnowledgeBasisListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: KnowledgeBasisInstance, done: (err?: Error) => void) => void): void;
    each(params: KnowledgeBasisListInstanceEachOptions, callback?: (item: KnowledgeBasisInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams KnowledgeBasisInstance records from the API with HTTP metadata captured per page.
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
     * @param { KnowledgeBasisListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: KnowledgeBasisInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: KnowledgeBasisListInstanceEachOptions, callback?: (item: KnowledgeBasisInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of KnowledgeBasisInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: KnowledgeBasisPage) => any): Promise<KnowledgeBasisPage>;
    /**
     * Retrieve a single target page of KnowledgeBasisInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<KnowledgeBasisPage>) => any): Promise<ApiResponse<KnowledgeBasisPage>>;
    /**
     * Lists KnowledgeBasisInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KnowledgeBasisListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: KnowledgeBasisInstance[]) => any): Promise<KnowledgeBasisInstance[]>;
    list(params: KnowledgeBasisListInstanceOptions, callback?: (error: Error | null, items: KnowledgeBasisInstance[]) => any): Promise<KnowledgeBasisInstance[]>;
    /**
     * Lists KnowledgeBasisInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KnowledgeBasisListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<KnowledgeBasisInstance[]>) => any): Promise<ApiResponse<KnowledgeBasisInstance[]>>;
    listWithHttpInfo(params: KnowledgeBasisListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<KnowledgeBasisInstance[]>) => any): Promise<ApiResponse<KnowledgeBasisInstance[]>>;
    /**
     * Retrieve a single page of KnowledgeBasisInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KnowledgeBasisListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: KnowledgeBasisPage) => any): Promise<KnowledgeBasisPage>;
    page(params: KnowledgeBasisListInstancePageOptions, callback?: (error: Error | null, items: KnowledgeBasisPage) => any): Promise<KnowledgeBasisPage>;
    /**
     * Retrieve a single page of KnowledgeBasisInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KnowledgeBasisListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<KnowledgeBasisPage>) => any): Promise<ApiResponse<KnowledgeBasisPage>>;
    pageWithHttpInfo(params: KnowledgeBasisListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<KnowledgeBasisPage>) => any): Promise<ApiResponse<KnowledgeBasisPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function KnowledgeBasisListInstance(version: V2): KnowledgeBasisListInstance;
export declare class KnowledgeBasisPage extends TokenPage<V2, KnowledgeBasisPayload, KnowledgeBasisResource, KnowledgeBasisInstance> {
    /**
     * Initialize the KnowledgeBasisPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, uri: string, params: any, solution: KnowledgeBasisSolution);
    /**
     * Build an instance of KnowledgeBasisInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: KnowledgeBasisResource): KnowledgeBasisInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
