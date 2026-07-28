import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../../base/Page";
import Response from "../../../../../http/response";
import V2 from "../../../V2";
import { ApiResponse } from "../../../../../base/ApiResponse";
export type UserBindingBindingType = "gcm" | "apn" | "fcm";
/**
 * Options to pass to each
 */
export interface UserBindingListInstanceEachOptions {
    /**  */
    bindingType?: Array<UserBindingBindingType>;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: UserBindingInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface UserBindingListInstanceOptions {
    /**  */
    bindingType?: Array<UserBindingBindingType>;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface UserBindingListInstancePageOptions {
    /**  */
    bindingType?: Array<UserBindingBindingType>;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface UserBindingContext {
    /**
     * Remove a UserBindingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a UserBindingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a UserBindingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserBindingInstance
     */
    fetch(callback?: (error: Error | null, item?: UserBindingInstance) => any): Promise<UserBindingInstance>;
    /**
     * Fetch a UserBindingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserBindingInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<UserBindingInstance>) => any): Promise<ApiResponse<UserBindingInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface UserBindingContextSolution {
    serviceSid: string;
    userSid: string;
    sid: string;
}
export declare class UserBindingContextImpl implements UserBindingContext {
    protected _version: V2;
    protected _solution: UserBindingContextSolution;
    protected _uri: string;
    constructor(_version: V2, serviceSid: string, userSid: string, sid: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: UserBindingInstance) => any): Promise<UserBindingInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<UserBindingInstance>) => any): Promise<ApiResponse<UserBindingInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): UserBindingContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface UserBindingPayload extends TwilioResponsePayload {
    bindings: UserBindingResource[];
}
interface UserBindingResource {
    sid: string;
    account_sid: string;
    service_sid: string;
    date_created: Date;
    date_updated: Date;
    endpoint: string;
    identity: string;
    user_sid: string;
    credential_sid: string;
    binding_type: UserBindingBindingType;
    message_types: Array<string>;
    url: string;
}
export declare class UserBindingInstance {
    protected _version: V2;
    protected _solution: UserBindingContextSolution;
    protected _context?: UserBindingContext;
    constructor(_version: V2, payload: UserBindingResource, serviceSid: string, userSid: string, sid?: string);
    sid: string;
    accountSid: string;
    serviceSid: string;
    dateCreated: Date;
    dateUpdated: Date;
    endpoint: string;
    identity: string;
    userSid: string;
    credentialSid: string;
    bindingType: UserBindingBindingType;
    messageTypes: Array<string>;
    url: string;
    private get _proxy();
    /**
     * Remove a UserBindingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a UserBindingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a UserBindingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserBindingInstance
     */
    fetch(callback?: (error: Error | null, item?: UserBindingInstance) => any): Promise<UserBindingInstance>;
    /**
     * Fetch a UserBindingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserBindingInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<UserBindingInstance>) => any): Promise<ApiResponse<UserBindingInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        accountSid: string;
        serviceSid: string;
        dateCreated: Date;
        dateUpdated: Date;
        endpoint: string;
        identity: string;
        userSid: string;
        credentialSid: string;
        bindingType: UserBindingBindingType;
        messageTypes: string[];
        url: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface UserBindingSolution {
    serviceSid: string;
    userSid: string;
}
export interface UserBindingListInstance {
    _version: V2;
    _solution: UserBindingSolution;
    _uri: string;
    (sid: string): UserBindingContext;
    get(sid: string): UserBindingContext;
    /**
     * Streams UserBindingInstance records from the API.
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
     * @param { UserBindingListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: UserBindingInstance, done: (err?: Error) => void) => void): void;
    each(params: UserBindingListInstanceEachOptions, callback?: (item: UserBindingInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams UserBindingInstance records from the API with HTTP metadata captured per page.
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
     * @param { UserBindingListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: UserBindingInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: UserBindingListInstanceEachOptions, callback?: (item: UserBindingInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of UserBindingInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: UserBindingPage) => any): Promise<UserBindingPage>;
    /**
     * Retrieve a single target page of UserBindingInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<UserBindingPage>) => any): Promise<ApiResponse<UserBindingPage>>;
    /**
     * Lists UserBindingInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { UserBindingListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: UserBindingInstance[]) => any): Promise<UserBindingInstance[]>;
    list(params: UserBindingListInstanceOptions, callback?: (error: Error | null, items: UserBindingInstance[]) => any): Promise<UserBindingInstance[]>;
    /**
     * Lists UserBindingInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { UserBindingListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<UserBindingInstance[]>) => any): Promise<ApiResponse<UserBindingInstance[]>>;
    listWithHttpInfo(params: UserBindingListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<UserBindingInstance[]>) => any): Promise<ApiResponse<UserBindingInstance[]>>;
    /**
     * Retrieve a single page of UserBindingInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { UserBindingListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: UserBindingPage) => any): Promise<UserBindingPage>;
    page(params: UserBindingListInstancePageOptions, callback?: (error: Error | null, items: UserBindingPage) => any): Promise<UserBindingPage>;
    /**
     * Retrieve a single page of UserBindingInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { UserBindingListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<UserBindingPage>) => any): Promise<ApiResponse<UserBindingPage>>;
    pageWithHttpInfo(params: UserBindingListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<UserBindingPage>) => any): Promise<ApiResponse<UserBindingPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function UserBindingListInstance(version: V2, serviceSid: string, userSid: string): UserBindingListInstance;
export declare class UserBindingPage extends Page<V2, UserBindingPayload, UserBindingResource, UserBindingInstance> {
    /**
     * Initialize the UserBindingPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, solution: UserBindingSolution);
    /**
     * Build an instance of UserBindingInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: UserBindingResource): UserBindingInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
