import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Core properties for knowledge source that can be set at creation time. Regularly update and organize your Knowledge sources to ensure it contains the most accurate and relevant information. This includes adding new entries, updating existing ones, and removing outdated content.
 */
export declare class KnowledgeCore {
    /**
     * The name of the knowledge source.
     */
    "name": string;
    /**
     * A detailed description of the knowledge source and when to use it.  This helps provide context about the content and its intended purpose.
     */
    "description"?: string;
    "source"?: KnowledgeSourceTypes;
    constructor(payload: any);
}
/**
 * Details specific to the knowledge source type. Each knowledge source type has  its own set of configuration parameters and source specific properties.
 */
export declare class KnowledgeSourceTypes {
    /**
     * Raw text knowledge sources
     */
    "type": string;
    /**
     * The raw text content to be processed
     */
    "content": string;
    /**
     * The URL to crawl for web content
     */
    "url": string;
    /**
     * The maximum depth to crawl from the source URL
     */
    "crawlDepth"?: number;
    /**
     * Frequency of re-crawling the website for updated content
     */
    "crawlPeriod"?: string;
    /**
     * Name of the file to be uploaded
     */
    "fileName": string;
    /**
     * Expected size of the file in bytes
     */
    "fileSize": number;
    "mimeType": SupportedFileMimeType;
    /**
     * Presigned S3 URL for file upload (when status is SCHEDULED) or the permanent S3 location after upload completes. Use PUT method to upload the file to this URL when status is SCHEDULED.
     */
    "importUrl"?: string;
    /**
     * Expiration time of the presigned upload URL in ISO 8601 format (only present when status is SCHEDULED)
     */
    "uploadExpiration"?: Date;
    constructor(payload: any);
}
/**
 * Supported MIME types for knowledge file imports. Maximum file size for any file is 16MB (16 * 1024 * 1024 bytes). Extensions → MIME:   .csv → text/csv   .md → text/markdown   .mdx → text/mdx   .pdf → application/pdf   .tsv → text/tab-separated-values   .txt → text/plain
 */
export type SupportedFileMimeType = "text/csv" | "text/markdown" | "text/mdx" | "application/pdf" | "text/tab-separated-values" | "text/plain";
/**
 * Options to pass to update a KnowledgeInstance
 */
export interface KnowledgeContextUpdateOptions {
    /** When true, re-queues processing for this knowledge resource. Idempotent while the resource is already QUEUED or PROCESSING. */
    refresh?: boolean;
    /**  */
    knowledgeCore?: KnowledgeCore;
}
/**
 * Options to pass to create a KnowledgeInstance
 */
export interface KnowledgeListInstanceCreateOptions {
    /**  */
    knowledgeCore: KnowledgeCore;
}
/**
 * Options to pass to each
 */
export interface KnowledgeListInstanceEachOptions {
    /** The page index. This value is simply for client state. */
    page?: number;
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: KnowledgeInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface KnowledgeListInstanceOptions {
    /** The page index. This value is simply for client state. */
    page?: number;
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface KnowledgeListInstancePageOptions {
    /** The page index. This value is simply for client state. */
    page?: number;
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
}
export interface KnowledgeContext {
    /**
     * Remove a KnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a KnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a KnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance
     */
    fetch(callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    /**
     * Fetch a KnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    /**
     * Update a KnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance
     */
    update(callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    /**
     * Update a KnowledgeInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance
     */
    update(params: KnowledgeCore, headers?: any, callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    /**
     * Update a KnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    /**
     * Update a KnowledgeInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance with HTTP metadata
     */
    updateWithHttpInfo(params: KnowledgeCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface KnowledgeContextSolution {
    kbId: string;
    knowledgeId: string;
}
export declare class KnowledgeContextImpl implements KnowledgeContext {
    protected _version: V2;
    protected _solution: KnowledgeContextSolution;
    protected _uri: string;
    constructor(_version: V2, kbId: string, knowledgeId: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    update(params?: KnowledgeCore | ((error: Error | null, item?: KnowledgeInstance) => any), headers?: any, callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    updateWithHttpInfo(params?: KnowledgeCore | ((error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): KnowledgeContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface KnowledgePayload extends TokenPaginationPayload {
    knowledge: KnowledgeResource[];
}
interface KnowledgeResource {
    name: string;
    description: string;
    source: KnowledgeSourceTypes;
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class KnowledgeInstance {
    protected _version: V2;
    protected _solution: KnowledgeContextSolution;
    protected _context?: KnowledgeContext;
    constructor(_version: V2, _payload: KnowledgeResource, kbId: string, knowledgeId?: string);
    /**
     * The name of the knowledge source.
     */
    name: string;
    /**
     * A detailed description of the knowledge source and when to use it.  This helps provide context about the content and its intended purpose.
     */
    description: string;
    source: KnowledgeSourceTypes;
    /**
     * The unique identifier of knowledge source.
     */
    id: string;
    /**
     * The status of processing the knowledge source (\'SCHEDULED\', \'QUEUED\', \'PROCESSING\', \'COMPLETED\', \'FAILED\').
     */
    status: string;
    /**
     * The date and time in GMT when the Knowledge was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    createdAt: Date;
    /**
     * The date and time in GMT when the Knowledge was last updated specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    updatedAt: Date;
    private get _proxy();
    /**
     * Remove a KnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a KnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a KnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance
     */
    fetch(callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    /**
     * Fetch a KnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    /**
     * Update a KnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance
     */
    update(callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    /**
     * Update a KnowledgeInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance
     */
    update(params: KnowledgeCore, headers?: any, callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    /**
     * Update a KnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    /**
     * Update a KnowledgeInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance with HTTP metadata
     */
    updateWithHttpInfo(params: KnowledgeCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        name: string;
        description: string;
        source: KnowledgeSourceTypes;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface KnowledgeSolution {
    kbId: string;
}
export interface KnowledgeListInstance {
    _version: V2;
    _solution: KnowledgeSolution;
    _uri: string;
    (knowledgeId: string): KnowledgeContext;
    get(knowledgeId: string): KnowledgeContext;
    /**
     * Create a KnowledgeInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance
     */
    create(params: KnowledgeCore, headers?: any, callback?: (error: Error | null, item?: KnowledgeInstance) => any): Promise<KnowledgeInstance>;
    /**
     * Create a KnowledgeInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KnowledgeInstance with HTTP metadata
     */
    createWithHttpInfo(params: KnowledgeCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<KnowledgeInstance>) => any): Promise<ApiResponse<KnowledgeInstance>>;
    /**
     * Streams KnowledgeInstance records from the API.
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
     * @param { KnowledgeListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: KnowledgeInstance, done: (err?: Error) => void) => void): void;
    each(params: KnowledgeListInstanceEachOptions, callback?: (item: KnowledgeInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams KnowledgeInstance records from the API with HTTP metadata captured per page.
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
     * @param { KnowledgeListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: KnowledgeInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: KnowledgeListInstanceEachOptions, callback?: (item: KnowledgeInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of KnowledgeInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: KnowledgePage) => any): Promise<KnowledgePage>;
    /**
     * Retrieve a single target page of KnowledgeInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<KnowledgePage>) => any): Promise<ApiResponse<KnowledgePage>>;
    /**
     * Lists KnowledgeInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KnowledgeListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: KnowledgeInstance[]) => any): Promise<KnowledgeInstance[]>;
    list(params: KnowledgeListInstanceOptions, callback?: (error: Error | null, items: KnowledgeInstance[]) => any): Promise<KnowledgeInstance[]>;
    /**
     * Lists KnowledgeInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KnowledgeListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<KnowledgeInstance[]>) => any): Promise<ApiResponse<KnowledgeInstance[]>>;
    listWithHttpInfo(params: KnowledgeListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<KnowledgeInstance[]>) => any): Promise<ApiResponse<KnowledgeInstance[]>>;
    /**
     * Retrieve a single page of KnowledgeInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KnowledgeListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: KnowledgePage) => any): Promise<KnowledgePage>;
    page(params: KnowledgeListInstancePageOptions, callback?: (error: Error | null, items: KnowledgePage) => any): Promise<KnowledgePage>;
    /**
     * Retrieve a single page of KnowledgeInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KnowledgeListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<KnowledgePage>) => any): Promise<ApiResponse<KnowledgePage>>;
    pageWithHttpInfo(params: KnowledgeListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<KnowledgePage>) => any): Promise<ApiResponse<KnowledgePage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function KnowledgeListInstance(version: V2, kbId: string): KnowledgeListInstance;
export declare class KnowledgePage extends TokenPage<V2, KnowledgePayload, KnowledgeResource, KnowledgeInstance> {
    /**
     * Initialize the KnowledgePage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, uri: string, params: any, solution: KnowledgeSolution);
    /**
     * Build an instance of KnowledgeInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: KnowledgeResource): KnowledgeInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
