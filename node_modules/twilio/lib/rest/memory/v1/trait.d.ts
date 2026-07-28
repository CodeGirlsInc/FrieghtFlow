import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to each
 */
export interface TraitListInstanceEachOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Comma separated list of trait group names to include. */
    traitGroups?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: TraitInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface TraitListInstanceOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Comma separated list of trait group names to include. */
    traitGroups?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface TraitListInstancePageOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Comma separated list of trait group names to include. */
    traitGroups?: string;
}
export interface TraitSolution {
    storeId: string;
    profileId: string;
}
export interface TraitListInstance {
    _version: V1;
    _solution: TraitSolution;
    _uri: string;
    /**
     * Streams TraitInstance records from the API.
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
     * @param { TraitListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: TraitInstance, done: (err?: Error) => void) => void): void;
    each(params: TraitListInstanceEachOptions, callback?: (item: TraitInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams TraitInstance records from the API with HTTP metadata captured per page.
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
     * @param { TraitListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: TraitInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: TraitListInstanceEachOptions, callback?: (item: TraitInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of TraitInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: TraitPage) => any): Promise<TraitPage>;
    /**
     * Retrieve a single target page of TraitInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<TraitPage>) => any): Promise<ApiResponse<TraitPage>>;
    /**
     * Lists TraitInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TraitListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: TraitInstance[]) => any): Promise<TraitInstance[]>;
    list(params: TraitListInstanceOptions, callback?: (error: Error | null, items: TraitInstance[]) => any): Promise<TraitInstance[]>;
    /**
     * Lists TraitInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TraitListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<TraitInstance[]>) => any): Promise<ApiResponse<TraitInstance[]>>;
    listWithHttpInfo(params: TraitListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<TraitInstance[]>) => any): Promise<ApiResponse<TraitInstance[]>>;
    /**
     * Retrieve a single page of TraitInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TraitListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: TraitPage) => any): Promise<TraitPage>;
    page(params: TraitListInstancePageOptions, callback?: (error: Error | null, items: TraitPage) => any): Promise<TraitPage>;
    /**
     * Retrieve a single page of TraitInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TraitListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<TraitPage>) => any): Promise<ApiResponse<TraitPage>>;
    pageWithHttpInfo(params: TraitListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<TraitPage>) => any): Promise<ApiResponse<TraitPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function TraitListInstance(version: V1, storeId: string, profileId: string): TraitListInstance;
interface TraitPayload extends TokenPaginationPayload {
    traits: TraitResource[];
}
interface TraitResource {
    name: string;
    value: any;
    traitGroup: string;
    timestamp: Date;
}
/**
 * Full metadata about a trait, beyond the name value pair.
 */
export declare class TraitInstance {
    protected _version: V1;
    constructor(_version: V1, _payload: TraitResource, storeId: string, profileId: string);
    /**
     * The name of the trait.
     */
    name: string;
    /**
     * The value of a trait. Can be a string, integer, boolean, or an array of these types (arrays cannot contain nested arrays).
     */
    value: any;
    /**
     * The trait group name to which this trait belongs.
     */
    traitGroup: string;
    /**
     * The time the trait was created or last updated.
     */
    timestamp: Date;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        name: string;
        value: any;
        traitGroup: string;
        timestamp: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export declare class TraitPage extends TokenPage<V1, TraitPayload, TraitResource, TraitInstance> {
    /**
     * Initialize the TraitPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, uri: string, params: any, solution: TraitSolution);
    /**
     * Build an instance of TraitInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: TraitResource): TraitInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
