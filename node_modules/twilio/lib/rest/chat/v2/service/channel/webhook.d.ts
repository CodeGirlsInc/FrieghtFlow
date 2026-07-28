import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../../base/Page";
import Response from "../../../../../http/response";
import V2 from "../../../V2";
import { ApiResponse } from "../../../../../base/ApiResponse";
export type WebhookMethod = "GET" | "POST";
/**
 * The type of webhook. Can be: `webhook`, `studio`, or `trigger`.
 */
export type WebhookType = "webhook" | "trigger" | "studio";
/**
 * Options to pass to update a WebhookInstance
 */
export interface WebhookContextUpdateOptions {
    /** The URL of the webhook to call using the `configuration.method`. */
    "configuration.url"?: string;
    /**  */
    "configuration.method"?: WebhookMethod;
    /** The events that cause us to call the Channel Webhook. Used when `type` is `webhook`. This parameter takes only one event. To specify more than one event, repeat this parameter for each event. For the list of possible events, see [Webhook Event Triggers](https://www.twilio.com/docs/chat/webhook-events#webhook-event-trigger). */
    "configuration.filters"?: Array<string>;
    /** A string that will cause us to call the webhook when it is present in a message body. This parameter takes only one trigger string. To specify more than one, repeat this parameter for each trigger string up to a total of 5 trigger strings. Used only when `type` = `trigger`. */
    "configuration.triggers"?: Array<string>;
    /** The SID of the Studio [Flow](https://www.twilio.com/docs/studio/rest-api/flow) to call when an event in `configuration.filters` occurs. Used only when `type` = `studio`. */
    "configuration.flowSid"?: string;
    /** The number of times to retry the webhook if the first attempt fails. Can be an integer between 0 and 3, inclusive, and the default is 0. */
    "configuration.retryCount"?: number;
}
/**
 * Options to pass to create a WebhookInstance
 */
export interface WebhookListInstanceCreateOptions {
    /**  */
    type: WebhookType;
    /** The URL of the webhook to call using the `configuration.method`. */
    "configuration.url"?: string;
    /**  */
    "configuration.method"?: WebhookMethod;
    /** The events that cause us to call the Channel Webhook. Used when `type` is `webhook`. This parameter takes only one event. To specify more than one event, repeat this parameter for each event. For the list of possible events, see [Webhook Event Triggers](https://www.twilio.com/docs/chat/webhook-events#webhook-event-trigger). */
    "configuration.filters"?: Array<string>;
    /** A string that will cause us to call the webhook when it is present in a message body. This parameter takes only one trigger string. To specify more than one, repeat this parameter for each trigger string up to a total of 5 trigger strings. Used only when `type` = `trigger`. */
    "configuration.triggers"?: Array<string>;
    /** The SID of the Studio [Flow](https://www.twilio.com/docs/studio/rest-api/flow) to call when an event in `configuration.filters` occurs. Used only when `type` is `studio`. */
    "configuration.flowSid"?: string;
    /** The number of times to retry the webhook if the first attempt fails. Can be an integer between 0 and 3, inclusive, and the default is 0. */
    "configuration.retryCount"?: number;
}
/**
 * Options to pass to each
 */
export interface WebhookListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 5, and the maximum is 5. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: WebhookInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface WebhookListInstanceOptions {
    /** How many resources to return in each list page. The default is 5, and the maximum is 5. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface WebhookListInstancePageOptions {
    /** How many resources to return in each list page. The default is 5, and the maximum is 5. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface WebhookContext {
    /**
     * Remove a WebhookInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a WebhookInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a WebhookInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance
     */
    fetch(callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    /**
     * Fetch a WebhookInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    /**
     * Update a WebhookInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance
     */
    update(callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    /**
     * Update a WebhookInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance
     */
    update(params: WebhookContextUpdateOptions, callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    /**
     * Update a WebhookInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    /**
     * Update a WebhookInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance with HTTP metadata
     */
    updateWithHttpInfo(params: WebhookContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface WebhookContextSolution {
    serviceSid: string;
    channelSid: string;
    sid: string;
}
export declare class WebhookContextImpl implements WebhookContext {
    protected _version: V2;
    protected _solution: WebhookContextSolution;
    protected _uri: string;
    constructor(_version: V2, serviceSid: string, channelSid: string, sid: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    update(params?: WebhookContextUpdateOptions | ((error: Error | null, item?: WebhookInstance) => any), callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    updateWithHttpInfo(params?: WebhookContextUpdateOptions | ((error: Error | null, item?: ApiResponse<WebhookInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): WebhookContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface WebhookPayload extends TwilioResponsePayload {
    webhooks: WebhookResource[];
}
interface WebhookResource {
    sid: string;
    account_sid: string;
    service_sid: string;
    channel_sid: string;
    type: string;
    url: string;
    configuration: any;
    date_created: Date;
    date_updated: Date;
}
export declare class WebhookInstance {
    protected _version: V2;
    protected _solution: WebhookContextSolution;
    protected _context?: WebhookContext;
    constructor(_version: V2, payload: WebhookResource, serviceSid: string, channelSid: string, sid?: string);
    /**
     * The unique string that we created to identify the Channel Webhook resource.
     */
    sid: string;
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Channel Webhook resource.
     */
    accountSid: string;
    /**
     * The SID of the [Service](https://www.twilio.com/docs/chat/rest/service-resource) the Channel Webhook resource is associated with.
     */
    serviceSid: string;
    /**
     * The SID of the [Channel](https://www.twilio.com/docs/chat/channels) the Channel Webhook resource belongs to.
     */
    channelSid: string;
    /**
     * The type of webhook. Can be: `webhook`, `studio`, or `trigger`.
     */
    type: string;
    /**
     * The absolute URL of the Channel Webhook resource.
     */
    url: string;
    /**
     * The JSON string that describes how the channel webhook is configured. The configuration object contains the `url`, `method`, `filters`, and `retry_count` values that are configured by the create and update actions.
     */
    configuration: any;
    /**
     * The date and time in GMT when the resource was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateCreated: Date;
    /**
     * The date and time in GMT when the resource was last updated specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateUpdated: Date;
    private get _proxy();
    /**
     * Remove a WebhookInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a WebhookInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a WebhookInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance
     */
    fetch(callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    /**
     * Fetch a WebhookInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    /**
     * Update a WebhookInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance
     */
    update(callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    /**
     * Update a WebhookInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance
     */
    update(params: WebhookContextUpdateOptions, callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    /**
     * Update a WebhookInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    /**
     * Update a WebhookInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance with HTTP metadata
     */
    updateWithHttpInfo(params: WebhookContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        accountSid: string;
        serviceSid: string;
        channelSid: string;
        type: string;
        url: string;
        configuration: any;
        dateCreated: Date;
        dateUpdated: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface WebhookSolution {
    serviceSid: string;
    channelSid: string;
}
export interface WebhookListInstance {
    _version: V2;
    _solution: WebhookSolution;
    _uri: string;
    (sid: string): WebhookContext;
    get(sid: string): WebhookContext;
    /**
     * Create a WebhookInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance
     */
    create(params: WebhookListInstanceCreateOptions, callback?: (error: Error | null, item?: WebhookInstance) => any): Promise<WebhookInstance>;
    /**
     * Create a WebhookInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed WebhookInstance with HTTP metadata
     */
    createWithHttpInfo(params: WebhookListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<WebhookInstance>) => any): Promise<ApiResponse<WebhookInstance>>;
    /**
     * Streams WebhookInstance records from the API.
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
     * @param { WebhookListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: WebhookInstance, done: (err?: Error) => void) => void): void;
    each(params: WebhookListInstanceEachOptions, callback?: (item: WebhookInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams WebhookInstance records from the API with HTTP metadata captured per page.
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
     * @param { WebhookListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: WebhookInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: WebhookListInstanceEachOptions, callback?: (item: WebhookInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of WebhookInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: WebhookPage) => any): Promise<WebhookPage>;
    /**
     * Retrieve a single target page of WebhookInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<WebhookPage>) => any): Promise<ApiResponse<WebhookPage>>;
    /**
     * Lists WebhookInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { WebhookListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: WebhookInstance[]) => any): Promise<WebhookInstance[]>;
    list(params: WebhookListInstanceOptions, callback?: (error: Error | null, items: WebhookInstance[]) => any): Promise<WebhookInstance[]>;
    /**
     * Lists WebhookInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { WebhookListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<WebhookInstance[]>) => any): Promise<ApiResponse<WebhookInstance[]>>;
    listWithHttpInfo(params: WebhookListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<WebhookInstance[]>) => any): Promise<ApiResponse<WebhookInstance[]>>;
    /**
     * Retrieve a single page of WebhookInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { WebhookListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: WebhookPage) => any): Promise<WebhookPage>;
    page(params: WebhookListInstancePageOptions, callback?: (error: Error | null, items: WebhookPage) => any): Promise<WebhookPage>;
    /**
     * Retrieve a single page of WebhookInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { WebhookListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<WebhookPage>) => any): Promise<ApiResponse<WebhookPage>>;
    pageWithHttpInfo(params: WebhookListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<WebhookPage>) => any): Promise<ApiResponse<WebhookPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function WebhookListInstance(version: V2, serviceSid: string, channelSid: string): WebhookListInstance;
export declare class WebhookPage extends Page<V2, WebhookPayload, WebhookResource, WebhookInstance> {
    /**
     * Initialize the WebhookPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, solution: WebhookSolution);
    /**
     * Build an instance of WebhookInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: WebhookResource): WebhookInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
