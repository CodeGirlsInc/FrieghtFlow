import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../base/Page";
import Response from "../../../../http/response";
import V2010 from "../../V2010";
import { ApiResponse } from "../../../../base/ApiResponse";
/**
 * Options to pass to update a KeyInstance
 */
export interface KeyContextUpdateOptions {
    /** A descriptive string that you create to describe the resource. It can be up to 64 characters long. */
    friendlyName?: string;
}
/**
 * Options to pass to each
 */
export interface KeyListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: KeyInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface KeyListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface KeyListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface KeyContext {
    /**
     * Remove a KeyInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a KeyInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a KeyInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance
     */
    fetch(callback?: (error: Error | null, item?: KeyInstance) => any): Promise<KeyInstance>;
    /**
     * Fetch a KeyInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KeyInstance>) => any): Promise<ApiResponse<KeyInstance>>;
    /**
     * Update a KeyInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance
     */
    update(callback?: (error: Error | null, item?: KeyInstance) => any): Promise<KeyInstance>;
    /**
     * Update a KeyInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance
     */
    update(params: KeyContextUpdateOptions, callback?: (error: Error | null, item?: KeyInstance) => any): Promise<KeyInstance>;
    /**
     * Update a KeyInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KeyInstance>) => any): Promise<ApiResponse<KeyInstance>>;
    /**
     * Update a KeyInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance with HTTP metadata
     */
    updateWithHttpInfo(params: KeyContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<KeyInstance>) => any): Promise<ApiResponse<KeyInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface KeyContextSolution {
    accountSid: string;
    sid: string;
}
export declare class KeyContextImpl implements KeyContext {
    protected _version: V2010;
    protected _solution: KeyContextSolution;
    protected _uri: string;
    constructor(_version: V2010, accountSid: string, sid: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: KeyInstance) => any): Promise<KeyInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KeyInstance>) => any): Promise<ApiResponse<KeyInstance>>;
    update(params?: KeyContextUpdateOptions | ((error: Error | null, item?: KeyInstance) => any), callback?: (error: Error | null, item?: KeyInstance) => any): Promise<KeyInstance>;
    updateWithHttpInfo(params?: KeyContextUpdateOptions | ((error: Error | null, item?: ApiResponse<KeyInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<KeyInstance>) => any): Promise<ApiResponse<KeyInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): KeyContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface KeyPayload extends TwilioResponsePayload {
    keys: KeyResource[];
}
interface KeyResource {
    sid: string;
    friendly_name: string;
    date_created: Date;
    date_updated: Date;
}
export declare class KeyInstance {
    protected _version: V2010;
    protected _solution: KeyContextSolution;
    protected _context?: KeyContext;
    constructor(_version: V2010, payload: KeyResource, accountSid: string, sid?: string);
    /**
     * The unique string that that we created to identify the Key resource.
     */
    sid: string;
    /**
     * The string that you assigned to describe the resource.
     */
    friendlyName: string;
    /**
     * The date and time in GMT that the resource was created specified in [RFC 2822](https://www.ietf.org/rfc/rfc2822.txt) format.
     */
    dateCreated: Date;
    /**
     * The date and time in GMT that the resource was last updated specified in [RFC 2822](https://www.ietf.org/rfc/rfc2822.txt) format.
     */
    dateUpdated: Date;
    private get _proxy();
    /**
     * Remove a KeyInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a KeyInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a KeyInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance
     */
    fetch(callback?: (error: Error | null, item?: KeyInstance) => any): Promise<KeyInstance>;
    /**
     * Fetch a KeyInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KeyInstance>) => any): Promise<ApiResponse<KeyInstance>>;
    /**
     * Update a KeyInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance
     */
    update(callback?: (error: Error | null, item?: KeyInstance) => any): Promise<KeyInstance>;
    /**
     * Update a KeyInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance
     */
    update(params: KeyContextUpdateOptions, callback?: (error: Error | null, item?: KeyInstance) => any): Promise<KeyInstance>;
    /**
     * Update a KeyInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<KeyInstance>) => any): Promise<ApiResponse<KeyInstance>>;
    /**
     * Update a KeyInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed KeyInstance with HTTP metadata
     */
    updateWithHttpInfo(params: KeyContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<KeyInstance>) => any): Promise<ApiResponse<KeyInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        friendlyName: string;
        dateCreated: Date;
        dateUpdated: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface KeySolution {
    accountSid: string;
}
export interface KeyListInstance {
    _version: V2010;
    _solution: KeySolution;
    _uri: string;
    (sid: string): KeyContext;
    get(sid: string): KeyContext;
    /**
     * Streams KeyInstance records from the API.
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
     * @param { KeyListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: KeyInstance, done: (err?: Error) => void) => void): void;
    each(params: KeyListInstanceEachOptions, callback?: (item: KeyInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams KeyInstance records from the API with HTTP metadata captured per page.
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
     * @param { KeyListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: KeyInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: KeyListInstanceEachOptions, callback?: (item: KeyInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of KeyInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: KeyPage) => any): Promise<KeyPage>;
    /**
     * Retrieve a single target page of KeyInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<KeyPage>) => any): Promise<ApiResponse<KeyPage>>;
    /**
     * Lists KeyInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KeyListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: KeyInstance[]) => any): Promise<KeyInstance[]>;
    list(params: KeyListInstanceOptions, callback?: (error: Error | null, items: KeyInstance[]) => any): Promise<KeyInstance[]>;
    /**
     * Lists KeyInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KeyListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<KeyInstance[]>) => any): Promise<ApiResponse<KeyInstance[]>>;
    listWithHttpInfo(params: KeyListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<KeyInstance[]>) => any): Promise<ApiResponse<KeyInstance[]>>;
    /**
     * Retrieve a single page of KeyInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KeyListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: KeyPage) => any): Promise<KeyPage>;
    page(params: KeyListInstancePageOptions, callback?: (error: Error | null, items: KeyPage) => any): Promise<KeyPage>;
    /**
     * Retrieve a single page of KeyInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { KeyListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<KeyPage>) => any): Promise<ApiResponse<KeyPage>>;
    pageWithHttpInfo(params: KeyListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<KeyPage>) => any): Promise<ApiResponse<KeyPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function KeyListInstance(version: V2010, accountSid: string): KeyListInstance;
export declare class KeyPage extends Page<V2010, KeyPayload, KeyResource, KeyInstance> {
    /**
     * Initialize the KeyPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2010, response: Response<string>, solution: KeySolution);
    /**
     * Build an instance of KeyInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: KeyResource): KeyInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
