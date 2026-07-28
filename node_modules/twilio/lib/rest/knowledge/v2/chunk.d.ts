import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to each
 */
export interface ChunkListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** The page token. This is provided by the API. */
    pageToken?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ChunkInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ChunkListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** The page token. This is provided by the API. */
    pageToken?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ChunkListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** The page token. This is provided by the API. */
    pageToken?: string;
}
export interface ChunkSolution {
    kbId: string;
    knowledgeId: string;
}
export interface ChunkListInstance {
    _version: V2;
    _solution: ChunkSolution;
    _uri: string;
    /**
     * Streams ChunkInstance records from the API.
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
     * @param { ChunkListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: ChunkInstance, done: (err?: Error) => void) => void): void;
    each(params: ChunkListInstanceEachOptions, callback?: (item: ChunkInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams ChunkInstance records from the API with HTTP metadata captured per page.
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
     * @param { ChunkListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: ChunkInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ChunkListInstanceEachOptions, callback?: (item: ChunkInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ChunkInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ChunkPage) => any): Promise<ChunkPage>;
    /**
     * Retrieve a single target page of ChunkInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ChunkPage>) => any): Promise<ApiResponse<ChunkPage>>;
    /**
     * Lists ChunkInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ChunkListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: ChunkInstance[]) => any): Promise<ChunkInstance[]>;
    list(params: ChunkListInstanceOptions, callback?: (error: Error | null, items: ChunkInstance[]) => any): Promise<ChunkInstance[]>;
    /**
     * Lists ChunkInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ChunkListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ChunkInstance[]>) => any): Promise<ApiResponse<ChunkInstance[]>>;
    listWithHttpInfo(params: ChunkListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<ChunkInstance[]>) => any): Promise<ApiResponse<ChunkInstance[]>>;
    /**
     * Retrieve a single page of ChunkInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ChunkListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ChunkPage) => any): Promise<ChunkPage>;
    page(params: ChunkListInstancePageOptions, callback?: (error: Error | null, items: ChunkPage) => any): Promise<ChunkPage>;
    /**
     * Retrieve a single page of ChunkInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ChunkListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ChunkPage>) => any): Promise<ApiResponse<ChunkPage>>;
    pageWithHttpInfo(params: ChunkListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ChunkPage>) => any): Promise<ApiResponse<ChunkPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ChunkListInstance(version: V2, kbId: string, knowledgeId: string): ChunkListInstance;
interface ChunkPayload extends TokenPaginationPayload {
    chunks: ChunkResource[];
}
interface ChunkResource {
    content: string;
    createdAt: Date;
}
/**
 * Represents a processed content chunk extracted from knowledge source.  Chunks are smaller segments of content that have been parsed and indexed  for semantic search operations, containing the original text content.
 */
export declare class ChunkInstance {
    protected _version: V2;
    constructor(_version: V2, _payload: ChunkResource, kbId: string, knowledgeId: string);
    /**
     * The chunk content.
     */
    content: string;
    /**
     * The date and time in GMT when the Chunk was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    createdAt: Date;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        content: string;
        createdAt: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export declare class ChunkPage extends TokenPage<V2, ChunkPayload, ChunkResource, ChunkInstance> {
    /**
     * Initialize the ChunkPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, uri: string, params: any, solution: ChunkSolution);
    /**
     * Build an instance of ChunkInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ChunkResource): ChunkInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
