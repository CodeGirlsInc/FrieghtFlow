import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to each
 */
export interface RevisionListInstanceEachOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: RevisionInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface RevisionListInstanceOptions {
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
export interface RevisionListInstancePageOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
}
export interface RevisionSolution {
    storeId: string;
    profileId: string;
    observationId: string;
}
export interface RevisionListInstance {
    _version: V1;
    _solution: RevisionSolution;
    _uri: string;
    /**
     * Streams RevisionInstance records from the API.
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
     * @param { RevisionListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: RevisionInstance, done: (err?: Error) => void) => void): void;
    each(params: RevisionListInstanceEachOptions, callback?: (item: RevisionInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams RevisionInstance records from the API with HTTP metadata captured per page.
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
     * @param { RevisionListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: RevisionInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: RevisionListInstanceEachOptions, callback?: (item: RevisionInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of RevisionInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: RevisionPage) => any): Promise<RevisionPage>;
    /**
     * Retrieve a single target page of RevisionInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<RevisionPage>) => any): Promise<ApiResponse<RevisionPage>>;
    /**
     * Lists RevisionInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { RevisionListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: RevisionInstance[]) => any): Promise<RevisionInstance[]>;
    list(params: RevisionListInstanceOptions, callback?: (error: Error | null, items: RevisionInstance[]) => any): Promise<RevisionInstance[]>;
    /**
     * Lists RevisionInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { RevisionListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<RevisionInstance[]>) => any): Promise<ApiResponse<RevisionInstance[]>>;
    listWithHttpInfo(params: RevisionListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<RevisionInstance[]>) => any): Promise<ApiResponse<RevisionInstance[]>>;
    /**
     * Retrieve a single page of RevisionInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { RevisionListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: RevisionPage) => any): Promise<RevisionPage>;
    page(params: RevisionListInstancePageOptions, callback?: (error: Error | null, items: RevisionPage) => any): Promise<RevisionPage>;
    /**
     * Retrieve a single page of RevisionInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { RevisionListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<RevisionPage>) => any): Promise<ApiResponse<RevisionPage>>;
    pageWithHttpInfo(params: RevisionListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<RevisionPage>) => any): Promise<ApiResponse<RevisionPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function RevisionListInstance(version: V1, storeId: string, profileId: string, observationId: string): RevisionListInstance;
interface RevisionPayload extends TokenPaginationPayload {
    revisions: RevisionResource[];
}
interface RevisionResource {
    content: string;
    occurredAt: Date;
    source: string;
    conversationIds: Array<string>;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * A transient and mutable observation memory associated with a profile.
 */
export declare class RevisionInstance {
    protected _version: V1;
    constructor(_version: V1, _payload: RevisionResource, storeId: string, profileId: string, observationId: string);
    /**
     * The main content of the observation.
     */
    content: string;
    /**
     * The timestamp when the observation originally occurred.
     */
    occurredAt: Date;
    /**
     * The source system that generated this observation. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters.
     */
    source: string;
    /**
     * Array of conversation IDs associated with this observation.
     */
    conversationIds: Array<string>;
    /**
     * A unique identifier for the observation using Twilio Type ID (TTID) format.
     */
    id: string;
    /**
     * The timestamp when the observation was created.
     */
    createdAt: Date;
    /**
     * The timestamp when the observation was last updated.
     */
    updatedAt: Date;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
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
export declare class RevisionPage extends TokenPage<V1, RevisionPayload, RevisionResource, RevisionInstance> {
    /**
     * Initialize the RevisionPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, uri: string, params: any, solution: RevisionSolution);
    /**
     * Build an instance of RevisionInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: RevisionResource): RevisionInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
