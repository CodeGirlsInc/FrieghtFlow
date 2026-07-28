import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to remove a InsightsQuestionnairesCategoryInstance
 */
export interface InsightsQuestionnairesCategoryContextRemoveOptions {
    /** The Authorization HTTP request header */
    authorization?: string;
}
/**
 * Options to pass to update a InsightsQuestionnairesCategoryInstance
 */
export interface InsightsQuestionnairesCategoryContextUpdateOptions {
    /** The name of this category. */
    name: string;
    /** The Authorization HTTP request header */
    authorization?: string;
}
/**
 * Options to pass to create a InsightsQuestionnairesCategoryInstance
 */
export interface InsightsQuestionnairesCategoryListInstanceCreateOptions {
    /** The name of this category. */
    name: string;
    /** The Authorization HTTP request header */
    authorization?: string;
}
/**
 * Options to pass to each
 */
export interface InsightsQuestionnairesCategoryListInstanceEachOptions {
    /** The Authorization HTTP request header */
    authorization?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: InsightsQuestionnairesCategoryInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface InsightsQuestionnairesCategoryListInstanceOptions {
    /** The Authorization HTTP request header */
    authorization?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface InsightsQuestionnairesCategoryListInstancePageOptions {
    /** The Authorization HTTP request header */
    authorization?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface InsightsQuestionnairesCategoryContext {
    /**
     * Remove a InsightsQuestionnairesCategoryInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a InsightsQuestionnairesCategoryInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance
     */
    remove(params: InsightsQuestionnairesCategoryContextRemoveOptions, callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a InsightsQuestionnairesCategoryInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Remove a InsightsQuestionnairesCategoryInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance with HTTP metadata
     */
    removeWithHttpInfo(params: InsightsQuestionnairesCategoryContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Update a InsightsQuestionnairesCategoryInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance
     */
    update(params: InsightsQuestionnairesCategoryContextUpdateOptions, callback?: (error: Error | null, item?: InsightsQuestionnairesCategoryInstance) => any): Promise<InsightsQuestionnairesCategoryInstance>;
    /**
     * Update a InsightsQuestionnairesCategoryInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance with HTTP metadata
     */
    updateWithHttpInfo(params: InsightsQuestionnairesCategoryContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<InsightsQuestionnairesCategoryInstance>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface InsightsQuestionnairesCategoryContextSolution {
    categorySid: string;
}
export declare class InsightsQuestionnairesCategoryContextImpl implements InsightsQuestionnairesCategoryContext {
    protected _version: V1;
    protected _solution: InsightsQuestionnairesCategoryContextSolution;
    protected _uri: string;
    constructor(_version: V1, categorySid: string);
    remove(params?: InsightsQuestionnairesCategoryContextRemoveOptions | ((error: Error | null, item?: boolean) => any), callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(params?: InsightsQuestionnairesCategoryContextRemoveOptions | ((error: Error | null, item?: ApiResponse<boolean>) => any), callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    update(params: InsightsQuestionnairesCategoryContextUpdateOptions, callback?: (error: Error | null, item?: InsightsQuestionnairesCategoryInstance) => any): Promise<InsightsQuestionnairesCategoryInstance>;
    updateWithHttpInfo(params: InsightsQuestionnairesCategoryContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<InsightsQuestionnairesCategoryInstance>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): InsightsQuestionnairesCategoryContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface InsightsQuestionnairesCategoryPayload extends TwilioResponsePayload {
    categories: InsightsQuestionnairesCategoryResource[];
}
interface InsightsQuestionnairesCategoryResource {
    account_sid: string;
    category_sid: string;
    name: string;
    url: string;
}
export declare class InsightsQuestionnairesCategoryInstance {
    protected _version: V1;
    protected _solution: InsightsQuestionnairesCategoryContextSolution;
    protected _context?: InsightsQuestionnairesCategoryContext;
    constructor(_version: V1, payload: InsightsQuestionnairesCategoryResource, categorySid?: string);
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Flex Insights resource and owns this resource.
     */
    accountSid: string;
    /**
     * The SID of the category
     */
    categorySid: string;
    /**
     * The name of this category.
     */
    name: string;
    url: string;
    private get _proxy();
    /**
     * Remove a InsightsQuestionnairesCategoryInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a InsightsQuestionnairesCategoryInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance
     */
    remove(params: InsightsQuestionnairesCategoryContextRemoveOptions, callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a InsightsQuestionnairesCategoryInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Remove a InsightsQuestionnairesCategoryInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance with HTTP metadata
     */
    removeWithHttpInfo(params: InsightsQuestionnairesCategoryContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Update a InsightsQuestionnairesCategoryInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance
     */
    update(params: InsightsQuestionnairesCategoryContextUpdateOptions, callback?: (error: Error | null, item?: InsightsQuestionnairesCategoryInstance) => any): Promise<InsightsQuestionnairesCategoryInstance>;
    /**
     * Update a InsightsQuestionnairesCategoryInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance with HTTP metadata
     */
    updateWithHttpInfo(params: InsightsQuestionnairesCategoryContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<InsightsQuestionnairesCategoryInstance>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        accountSid: string;
        categorySid: string;
        name: string;
        url: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface InsightsQuestionnairesCategorySolution {
}
export interface InsightsQuestionnairesCategoryListInstance {
    _version: V1;
    _solution: InsightsQuestionnairesCategorySolution;
    _uri: string;
    (categorySid: string): InsightsQuestionnairesCategoryContext;
    get(categorySid: string): InsightsQuestionnairesCategoryContext;
    /**
     * Create a InsightsQuestionnairesCategoryInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance
     */
    create(params: InsightsQuestionnairesCategoryListInstanceCreateOptions, callback?: (error: Error | null, item?: InsightsQuestionnairesCategoryInstance) => any): Promise<InsightsQuestionnairesCategoryInstance>;
    /**
     * Create a InsightsQuestionnairesCategoryInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsQuestionnairesCategoryInstance with HTTP metadata
     */
    createWithHttpInfo(params: InsightsQuestionnairesCategoryListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<InsightsQuestionnairesCategoryInstance>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryInstance>>;
    /**
     * Streams InsightsQuestionnairesCategoryInstance records from the API.
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
     * @param { InsightsQuestionnairesCategoryListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: InsightsQuestionnairesCategoryInstance, done: (err?: Error) => void) => void): void;
    each(params: InsightsQuestionnairesCategoryListInstanceEachOptions, callback?: (item: InsightsQuestionnairesCategoryInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams InsightsQuestionnairesCategoryInstance records from the API with HTTP metadata captured per page.
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
     * @param { InsightsQuestionnairesCategoryListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: InsightsQuestionnairesCategoryInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: InsightsQuestionnairesCategoryListInstanceEachOptions, callback?: (item: InsightsQuestionnairesCategoryInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of InsightsQuestionnairesCategoryInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: InsightsQuestionnairesCategoryPage) => any): Promise<InsightsQuestionnairesCategoryPage>;
    /**
     * Retrieve a single target page of InsightsQuestionnairesCategoryInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<InsightsQuestionnairesCategoryPage>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryPage>>;
    /**
     * Lists InsightsQuestionnairesCategoryInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { InsightsQuestionnairesCategoryListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: InsightsQuestionnairesCategoryInstance[]) => any): Promise<InsightsQuestionnairesCategoryInstance[]>;
    list(params: InsightsQuestionnairesCategoryListInstanceOptions, callback?: (error: Error | null, items: InsightsQuestionnairesCategoryInstance[]) => any): Promise<InsightsQuestionnairesCategoryInstance[]>;
    /**
     * Lists InsightsQuestionnairesCategoryInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { InsightsQuestionnairesCategoryListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<InsightsQuestionnairesCategoryInstance[]>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryInstance[]>>;
    listWithHttpInfo(params: InsightsQuestionnairesCategoryListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<InsightsQuestionnairesCategoryInstance[]>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryInstance[]>>;
    /**
     * Retrieve a single page of InsightsQuestionnairesCategoryInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { InsightsQuestionnairesCategoryListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: InsightsQuestionnairesCategoryPage) => any): Promise<InsightsQuestionnairesCategoryPage>;
    page(params: InsightsQuestionnairesCategoryListInstancePageOptions, callback?: (error: Error | null, items: InsightsQuestionnairesCategoryPage) => any): Promise<InsightsQuestionnairesCategoryPage>;
    /**
     * Retrieve a single page of InsightsQuestionnairesCategoryInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { InsightsQuestionnairesCategoryListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<InsightsQuestionnairesCategoryPage>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryPage>>;
    pageWithHttpInfo(params: InsightsQuestionnairesCategoryListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<InsightsQuestionnairesCategoryPage>) => any): Promise<ApiResponse<InsightsQuestionnairesCategoryPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function InsightsQuestionnairesCategoryListInstance(version: V1): InsightsQuestionnairesCategoryListInstance;
export declare class InsightsQuestionnairesCategoryPage extends Page<V1, InsightsQuestionnairesCategoryPayload, InsightsQuestionnairesCategoryResource, InsightsQuestionnairesCategoryInstance> {
    /**
     * Initialize the InsightsQuestionnairesCategoryPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: InsightsQuestionnairesCategorySolution);
    /**
     * Build an instance of InsightsQuestionnairesCategoryInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: InsightsQuestionnairesCategoryResource): InsightsQuestionnairesCategoryInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
