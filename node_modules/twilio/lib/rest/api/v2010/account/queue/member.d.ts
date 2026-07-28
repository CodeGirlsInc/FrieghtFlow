import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../../base/Page";
import Response from "../../../../../http/response";
import V2010 from "../../../V2010";
import { ApiResponse } from "../../../../../base/ApiResponse";
/**
 * Options to pass to update a MemberInstance
 */
export interface MemberContextUpdateOptions {
    /** The absolute URL of the Queue resource. */
    url: string;
    /** How to pass the update request data. Can be `GET` or `POST` and the default is `POST`. `POST` sends the data as encoded form data and `GET` sends the data as query parameters. */
    method?: string;
}
/**
 * Options to pass to each
 */
export interface MemberListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: MemberInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface MemberListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface MemberListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface MemberContext {
    /**
     * Fetch a MemberInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MemberInstance
     */
    fetch(callback?: (error: Error | null, item?: MemberInstance) => any): Promise<MemberInstance>;
    /**
     * Fetch a MemberInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MemberInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<MemberInstance>) => any): Promise<ApiResponse<MemberInstance>>;
    /**
     * Update a MemberInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MemberInstance
     */
    update(params: MemberContextUpdateOptions, callback?: (error: Error | null, item?: MemberInstance) => any): Promise<MemberInstance>;
    /**
     * Update a MemberInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MemberInstance with HTTP metadata
     */
    updateWithHttpInfo(params: MemberContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<MemberInstance>) => any): Promise<ApiResponse<MemberInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface MemberContextSolution {
    accountSid: string;
    queueSid: string;
    callSid: string;
}
export declare class MemberContextImpl implements MemberContext {
    protected _version: V2010;
    protected _solution: MemberContextSolution;
    protected _uri: string;
    constructor(_version: V2010, accountSid: string, queueSid: string, callSid: string);
    fetch(callback?: (error: Error | null, item?: MemberInstance) => any): Promise<MemberInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<MemberInstance>) => any): Promise<ApiResponse<MemberInstance>>;
    update(params: MemberContextUpdateOptions, callback?: (error: Error | null, item?: MemberInstance) => any): Promise<MemberInstance>;
    updateWithHttpInfo(params: MemberContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<MemberInstance>) => any): Promise<ApiResponse<MemberInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): MemberContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface MemberPayload extends TwilioResponsePayload {
    queue_members: MemberResource[];
}
interface MemberResource {
    call_sid: string;
    date_enqueued: Date;
    position: number;
    uri: string;
    wait_time: number;
    queue_sid: string;
}
export declare class MemberInstance {
    protected _version: V2010;
    protected _solution: MemberContextSolution;
    protected _context?: MemberContext;
    constructor(_version: V2010, payload: MemberResource, accountSid: string, queueSid: string, callSid?: string);
    /**
     * The SID of the [Call](https://www.twilio.com/docs/voice/api/call-resource) the Member resource is associated with.
     */
    callSid: string;
    /**
     * The date that the member was enqueued, given in RFC 2822 format.
     */
    dateEnqueued: Date;
    /**
     * This member\'s current position in the queue.
     */
    position: number;
    /**
     * The URI of the resource, relative to `https://api.twilio.com`.
     */
    uri: string;
    /**
     * The number of seconds the member has been in the queue.
     */
    waitTime: number;
    /**
     * The SID of the Queue the member is in.
     */
    queueSid: string;
    private get _proxy();
    /**
     * Fetch a MemberInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MemberInstance
     */
    fetch(callback?: (error: Error | null, item?: MemberInstance) => any): Promise<MemberInstance>;
    /**
     * Fetch a MemberInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MemberInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<MemberInstance>) => any): Promise<ApiResponse<MemberInstance>>;
    /**
     * Update a MemberInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MemberInstance
     */
    update(params: MemberContextUpdateOptions, callback?: (error: Error | null, item?: MemberInstance) => any): Promise<MemberInstance>;
    /**
     * Update a MemberInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MemberInstance with HTTP metadata
     */
    updateWithHttpInfo(params: MemberContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<MemberInstance>) => any): Promise<ApiResponse<MemberInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        callSid: string;
        dateEnqueued: Date;
        position: number;
        uri: string;
        waitTime: number;
        queueSid: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface MemberSolution {
    accountSid: string;
    queueSid: string;
}
export interface MemberListInstance {
    _version: V2010;
    _solution: MemberSolution;
    _uri: string;
    (callSid: string): MemberContext;
    get(callSid: string): MemberContext;
    /**
     * Streams MemberInstance records from the API.
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
     * @param { MemberListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: MemberInstance, done: (err?: Error) => void) => void): void;
    each(params: MemberListInstanceEachOptions, callback?: (item: MemberInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams MemberInstance records from the API with HTTP metadata captured per page.
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
     * @param { MemberListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: MemberInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: MemberListInstanceEachOptions, callback?: (item: MemberInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of MemberInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: MemberPage) => any): Promise<MemberPage>;
    /**
     * Retrieve a single target page of MemberInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<MemberPage>) => any): Promise<ApiResponse<MemberPage>>;
    /**
     * Lists MemberInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { MemberListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: MemberInstance[]) => any): Promise<MemberInstance[]>;
    list(params: MemberListInstanceOptions, callback?: (error: Error | null, items: MemberInstance[]) => any): Promise<MemberInstance[]>;
    /**
     * Lists MemberInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { MemberListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<MemberInstance[]>) => any): Promise<ApiResponse<MemberInstance[]>>;
    listWithHttpInfo(params: MemberListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<MemberInstance[]>) => any): Promise<ApiResponse<MemberInstance[]>>;
    /**
     * Retrieve a single page of MemberInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { MemberListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: MemberPage) => any): Promise<MemberPage>;
    page(params: MemberListInstancePageOptions, callback?: (error: Error | null, items: MemberPage) => any): Promise<MemberPage>;
    /**
     * Retrieve a single page of MemberInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { MemberListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<MemberPage>) => any): Promise<ApiResponse<MemberPage>>;
    pageWithHttpInfo(params: MemberListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<MemberPage>) => any): Promise<ApiResponse<MemberPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function MemberListInstance(version: V2010, accountSid: string, queueSid: string): MemberListInstance;
export declare class MemberPage extends Page<V2010, MemberPayload, MemberResource, MemberInstance> {
    /**
     * Initialize the MemberPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2010, response: Response<string>, solution: MemberSolution);
    /**
     * Build an instance of MemberInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: MemberResource): MemberInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
