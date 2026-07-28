import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Request payload for creating one or more conversation summaries. Supports creation of up to 10 summaries.
 */
export declare class CreateSummariesRequest {
    /**
     * Array of summaries to create in a single batch operation.
     */
    "summaries": Array<SummaryCore>;
    constructor(payload: any);
}
/**
 * Core mutable properties for creating summary objects.
 */
export declare class SummaryCore {
    /**
     * The source system that generated the summary. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters.
     */
    "source"?: string;
    /**
     * The main content of the summary.
     */
    "content": string;
    /**
     * The timestamp when the summary was originally created.
     */
    "occurredAt": Date;
    /**
     * A unique identifier for the conversation using Twilio Type ID (TTID) format.
     */
    "conversationId": string;
    constructor(payload: any);
}
/**
 * Core mutable properties for updating summary objects. All fields are optional for PATCH operations.
 */
export declare class SummaryCorePatch {
    /**
     * The source system that generated the summary. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters.
     */
    "source"?: string;
    /**
     * The main content of the summary.
     */
    "content"?: string;
    /**
     * The timestamp when the summary was originally created. If not provided, defaults to the time the summary was received.
     */
    "occurredAt"?: Date;
    /**
     * A unique identifier for the conversation using Twilio Type ID (TTID) format.
     */
    "conversationId"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to patch a ConversationSummaryInstance
 */
export interface ConversationSummaryContextPatchOptions {
    /**  */
    summaryCorePatch: SummaryCorePatch;
}
/**
 * Options to pass to create a ConversationSummaryInstance
 */
export interface ConversationSummaryListInstanceCreateOptions {
    /**  */
    createSummariesRequest: CreateSummariesRequest;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
    /** Compression algorithm used for the request body (e.g., gzip, deflate, br) */
    contentEncoding?: "gzip" | "deflate" | "br" | "compress";
}
/**
 * Options to pass to each
 */
export interface ConversationSummaryListInstanceEachOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ConversationSummaryInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ConversationSummaryListInstanceOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ConversationSummaryListInstancePageOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
}
export interface ConversationSummaryContext {
    /**
     * Remove a ConversationSummaryInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance
     */
    remove(callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    /**
     * Remove a ConversationSummaryInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    /**
     * Fetch a ConversationSummaryInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance
     */
    fetch(callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    /**
     * Fetch a ConversationSummaryInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    /**
     * Patch a ConversationSummaryInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance
     */
    patch(params: SummaryCorePatch, headers?: any, callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    /**
     * Patch a ConversationSummaryInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance with HTTP metadata
     */
    patchWithHttpInfo(params: SummaryCorePatch, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ConversationSummaryContextSolution {
    storeId: string;
    profileId: string;
    summaryId: string;
}
export declare class ConversationSummaryContextImpl implements ConversationSummaryContext {
    protected _version: V1;
    protected _solution: ConversationSummaryContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string, profileId: string, summaryId: string);
    remove(callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    fetch(callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    patch(params: SummaryCorePatch, headers?: any, callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    patchWithHttpInfo(params: SummaryCorePatch, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ConversationSummaryContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for CreateSummariesRequest
 */
export interface CreateSummariesRequest {
    summaries: Array<SummaryCore>;
}
/**
 * Nested model for SummaryCore
 */
export interface SummaryCore {
    source?: string;
    content: string;
    occurredAt: Date;
    conversationId: string;
}
/**
 * Nested model for SummaryCorePatch
 */
export interface SummaryCorePatch {
    source?: string;
    content?: string;
    occurredAt?: Date;
    conversationId?: string;
}
interface ConversationSummaryPayload extends TokenPaginationPayload {
    summaries: ConversationSummaryResource[];
}
/**
 * Response model for SummariesCreatedResponse operations
 */
interface SummariesCreatedResponse_ResponseResource {
    message: string;
}
/**
 * Response model for PatchProfileConversationSummary202Response operations
 */
interface PatchProfileConversationSummary202Response_ResponseResource {
    message: string;
}
/**
 * Response model for DeleteProfileConversationSummary202Response operations
 */
interface DeleteProfileConversationSummary202Response_ResponseResource {
    message: string;
}
/**
 * Response model for SummaryInfo operations
 */
interface SummaryInfo_ResponseResource {
    source?: string;
    content: string;
    occurredAt: Date;
    conversationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Union type for all possible response models
 */
type ConversationSummaryResource = SummariesCreatedResponse_ResponseResource | PatchProfileConversationSummary202Response_ResponseResource | DeleteProfileConversationSummary202Response_ResponseResource | SummaryInfo_ResponseResource;
/**
 * Response for batch summary creation.
 */
export declare class ConversationSummaryInstance {
    protected _version: V1;
    protected _solution: ConversationSummaryContextSolution;
    protected _context?: ConversationSummaryContext;
    constructor(_version: V1, _payload: ConversationSummaryResource, storeId: string, profileId: string, summaryId?: string);
    /**
     * Confirmation message for the operation.
     */
    message?: string;
    /**
     * The source system that generated the summary. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters.
     */
    source?: string;
    /**
     * The main content of the summary.
     */
    content?: string;
    /**
     * The timestamp when the summary was originally created.
     */
    occurredAt?: Date;
    /**
     * A unique identifier for the conversation using Twilio Type ID (TTID) format.
     */
    conversationId?: string;
    /**
     * A unique identifier for the summary using Twilio Type ID (TTID) format.
     */
    id?: string;
    /**
     * The timestamp when the summary was created.
     */
    createdAt?: Date;
    /**
     * The timestamp when the summary was last updated.
     */
    updatedAt?: Date;
    private get _proxy();
    /**
     * Remove a ConversationSummaryInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance
     */
    remove(callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    /**
     * Remove a ConversationSummaryInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    /**
     * Fetch a ConversationSummaryInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance
     */
    fetch(callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    /**
     * Fetch a ConversationSummaryInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    /**
     * Patch a ConversationSummaryInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance
     */
    patch(params: SummaryCorePatch, headers?: any, callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    /**
     * Patch a ConversationSummaryInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance with HTTP metadata
     */
    patchWithHttpInfo(params: SummaryCorePatch, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        message: string;
        source: string;
        content: string;
        occurredAt: Date;
        conversationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ConversationSummarySolution {
    storeId: string;
    profileId: string;
}
export interface ConversationSummaryListInstance {
    _version: V1;
    _solution: ConversationSummarySolution;
    _uri: string;
    (summaryId: string): ConversationSummaryContext;
    get(summaryId: string): ConversationSummaryContext;
    /**
     * Create a ConversationSummaryInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance
     */
    create(params: CreateSummariesRequest, headers?: any, callback?: (error: Error | null, item?: ConversationSummaryInstance) => any): Promise<ConversationSummaryInstance>;
    /**
     * Create a ConversationSummaryInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationSummaryInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateSummariesRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationSummaryInstance>) => any): Promise<ApiResponse<ConversationSummaryInstance>>;
    /**
     * Streams ConversationSummaryInstance records from the API.
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
     * @param { ConversationSummaryListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: ConversationSummaryInstance, done: (err?: Error) => void) => void): void;
    each(params: ConversationSummaryListInstanceEachOptions, callback?: (item: ConversationSummaryInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams ConversationSummaryInstance records from the API with HTTP metadata captured per page.
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
     * @param { ConversationSummaryListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: ConversationSummaryInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ConversationSummaryListInstanceEachOptions, callback?: (item: ConversationSummaryInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ConversationSummaryInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ConversationSummaryPage) => any): Promise<ConversationSummaryPage>;
    /**
     * Retrieve a single target page of ConversationSummaryInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ConversationSummaryPage>) => any): Promise<ApiResponse<ConversationSummaryPage>>;
    /**
     * Lists ConversationSummaryInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConversationSummaryListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: ConversationSummaryInstance[]) => any): Promise<ConversationSummaryInstance[]>;
    list(params: ConversationSummaryListInstanceOptions, callback?: (error: Error | null, items: ConversationSummaryInstance[]) => any): Promise<ConversationSummaryInstance[]>;
    /**
     * Lists ConversationSummaryInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConversationSummaryListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ConversationSummaryInstance[]>) => any): Promise<ApiResponse<ConversationSummaryInstance[]>>;
    listWithHttpInfo(params: ConversationSummaryListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<ConversationSummaryInstance[]>) => any): Promise<ApiResponse<ConversationSummaryInstance[]>>;
    /**
     * Retrieve a single page of ConversationSummaryInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConversationSummaryListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ConversationSummaryPage) => any): Promise<ConversationSummaryPage>;
    page(params: ConversationSummaryListInstancePageOptions, callback?: (error: Error | null, items: ConversationSummaryPage) => any): Promise<ConversationSummaryPage>;
    /**
     * Retrieve a single page of ConversationSummaryInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConversationSummaryListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ConversationSummaryPage>) => any): Promise<ApiResponse<ConversationSummaryPage>>;
    pageWithHttpInfo(params: ConversationSummaryListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ConversationSummaryPage>) => any): Promise<ApiResponse<ConversationSummaryPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ConversationSummaryListInstance(version: V1, storeId: string, profileId: string): ConversationSummaryListInstance;
export declare class ConversationSummaryPage extends TokenPage<V1, ConversationSummaryPayload, ConversationSummaryResource, ConversationSummaryInstance> {
    /**
     * Initialize the ConversationSummaryPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, uri: string, params: any, solution: ConversationSummarySolution);
    /**
     * Build an instance of ConversationSummaryInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ConversationSummaryResource): ConversationSummaryInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
