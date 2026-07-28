import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../base/Page";
import Response from "../../../../http/response";
import V2 from "../../V2";
import { ApiResponse } from "../../../../base/ApiResponse";
import { InviteListInstance } from "./channel/invite";
import { MemberListInstance } from "./channel/member";
import { MessageListInstance } from "./channel/message";
import { WebhookListInstance } from "./channel/webhook";
/**
 * The visibility of the channel. Can be: `public` or `private`.
 */
export type ChannelChannelType = "public" | "private";
export type ChannelWebhookEnabledType = "true" | "false";
/**
 * Options to pass to remove a ChannelInstance
 */
export interface ChannelContextRemoveOptions {
    /** The X-Twilio-Webhook-Enabled HTTP request header */
    xTwilioWebhookEnabled?: ChannelWebhookEnabledType;
}
/**
 * Options to pass to update a ChannelInstance
 */
export interface ChannelContextUpdateOptions {
    /** The X-Twilio-Webhook-Enabled HTTP request header */
    xTwilioWebhookEnabled?: ChannelWebhookEnabledType;
    /** A descriptive string that you create to describe the resource. It can be up to 256 characters long. */
    friendlyName?: string;
    /** An application-defined string that uniquely identifies the resource. It can be used to address the resource in place of the resource\\\'s `sid` in the URL. This value must be 256 characters or less in length and unique within the Service. */
    uniqueName?: string;
    /** A valid JSON string that contains application-specific data. */
    attributes?: string;
    /** The date, specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, to assign to the resource as the date it was created. The default value is the current time set by the Chat service.  Note that this should only be used in cases where a Channel is being recreated from a backup/separate source. */
    dateCreated?: Date;
    /** The date, specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, to assign to the resource as the date it was last updated. */
    dateUpdated?: Date;
    /** The `identity` of the User that created the channel. Default is: `system`. */
    createdBy?: string;
}
/**
 * Options to pass to create a ChannelInstance
 */
export interface ChannelListInstanceCreateOptions {
    /** The X-Twilio-Webhook-Enabled HTTP request header */
    xTwilioWebhookEnabled?: ChannelWebhookEnabledType;
    /** A descriptive string that you create to describe the new resource. It can be up to 64 characters long. */
    friendlyName?: string;
    /** An application-defined string that uniquely identifies the resource. It can be used to address the resource in place of the Channel resource\\\'s `sid` in the URL. This value must be 64 characters or less in length and be unique within the Service. */
    uniqueName?: string;
    /** A valid JSON string that contains application-specific data. */
    attributes?: string;
    /**  */
    type?: ChannelChannelType;
    /** The date, specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, to assign to the resource as the date it was created. The default value is the current time set by the Chat service.  Note that this should only be used in cases where a Channel is being recreated from a backup/separate source. */
    dateCreated?: Date;
    /** The date, specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, to assign to the resource as the date it was last updated. The default value is `null`. Note that this parameter should only be used in cases where a Channel is being recreated from a backup/separate source  and where a Message was previously updated. */
    dateUpdated?: Date;
    /** The `identity` of the User that created the channel. Default is: `system`. */
    createdBy?: string;
}
/**
 * Options to pass to each
 */
export interface ChannelListInstanceEachOptions {
    /** The visibility of the Channels to read. Can be: `public` or `private` and defaults to `public`. */
    type?: Array<ChannelChannelType>;
    /** How many resources to return in each list page. The default is 50, and the maximum is 100. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ChannelInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ChannelListInstanceOptions {
    /** The visibility of the Channels to read. Can be: `public` or `private` and defaults to `public`. */
    type?: Array<ChannelChannelType>;
    /** How many resources to return in each list page. The default is 50, and the maximum is 100. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ChannelListInstancePageOptions {
    /** The visibility of the Channels to read. Can be: `public` or `private` and defaults to `public`. */
    type?: Array<ChannelChannelType>;
    /** How many resources to return in each list page. The default is 50, and the maximum is 100. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface ChannelContext {
    invites: InviteListInstance;
    members: MemberListInstance;
    messages: MessageListInstance;
    webhooks: WebhookListInstance;
    /**
     * Remove a ChannelInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a ChannelInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    remove(params: ChannelContextRemoveOptions, callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a ChannelInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Remove a ChannelInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    removeWithHttpInfo(params: ChannelContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a ChannelInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    fetch(callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    /**
     * Fetch a ChannelInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Update a ChannelInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    update(callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    /**
     * Update a ChannelInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    update(params: ChannelContextUpdateOptions, callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    /**
     * Update a ChannelInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Update a ChannelInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    updateWithHttpInfo(params: ChannelContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ChannelContextSolution {
    serviceSid: string;
    sid: string;
}
export declare class ChannelContextImpl implements ChannelContext {
    protected _version: V2;
    protected _solution: ChannelContextSolution;
    protected _uri: string;
    protected _invites?: InviteListInstance;
    protected _members?: MemberListInstance;
    protected _messages?: MessageListInstance;
    protected _webhooks?: WebhookListInstance;
    constructor(_version: V2, serviceSid: string, sid: string);
    get invites(): InviteListInstance;
    get members(): MemberListInstance;
    get messages(): MessageListInstance;
    get webhooks(): WebhookListInstance;
    remove(params?: ChannelContextRemoveOptions | ((error: Error | null, item?: boolean) => any), callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(params?: ChannelContextRemoveOptions | ((error: Error | null, item?: ApiResponse<boolean>) => any), callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    update(params?: ChannelContextUpdateOptions | ((error: Error | null, item?: ChannelInstance) => any), callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    updateWithHttpInfo(params?: ChannelContextUpdateOptions | ((error: Error | null, item?: ApiResponse<ChannelInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ChannelContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface ChannelPayload extends TwilioResponsePayload {
    channels: ChannelResource[];
}
interface ChannelResource {
    sid: string;
    account_sid: string;
    service_sid: string;
    friendly_name: string;
    unique_name: string;
    attributes: string;
    type: ChannelChannelType;
    date_created: Date;
    date_updated: Date;
    created_by: string;
    members_count: number;
    messages_count: number;
    url: string;
    links: Record<string, string>;
}
export declare class ChannelInstance {
    protected _version: V2;
    protected _solution: ChannelContextSolution;
    protected _context?: ChannelContext;
    constructor(_version: V2, payload: ChannelResource, serviceSid: string, sid?: string);
    /**
     * The unique string that we created to identify the Channel resource.
     */
    sid: string;
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Channel resource.
     */
    accountSid: string;
    /**
     * The SID of the [Service](https://www.twilio.com/docs/chat/rest/service-resource) the Channel resource is associated with.
     */
    serviceSid: string;
    /**
     * The string that you assigned to describe the resource.
     */
    friendlyName: string;
    /**
     * An application-defined string that uniquely identifies the resource. It can be used to address the resource in place of the resource\'s `sid` in the URL.
     */
    uniqueName: string;
    /**
     * The JSON string that stores application-specific data. If attributes have not been set, `{}` is returned.
     */
    attributes: string;
    type: ChannelChannelType;
    /**
     * The date and time in GMT when the resource was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateCreated: Date;
    /**
     * The date and time in GMT when the resource was last updated specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateUpdated: Date;
    /**
     * The `identity` of the User that created the channel. If the Channel was created by using the API, the value is `system`.
     */
    createdBy: string;
    /**
     * The number of Members in the Channel.
     */
    membersCount: number;
    /**
     * The number of Messages that have been passed in the Channel.
     */
    messagesCount: number;
    /**
     * The absolute URL of the Channel resource.
     */
    url: string;
    /**
     * The absolute URLs of the [Members](https://www.twilio.com/docs/chat/rest/member-resource), [Messages](https://www.twilio.com/docs/chat/rest/message-resource), [Invites](https://www.twilio.com/docs/chat/rest/invite-resource), Webhooks and, if it exists, the last [Message](https://www.twilio.com/docs/chat/rest/message-resource) for the Channel.
     */
    links: Record<string, string>;
    private get _proxy();
    /**
     * Remove a ChannelInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a ChannelInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    remove(params: ChannelContextRemoveOptions, callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a ChannelInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Remove a ChannelInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    removeWithHttpInfo(params: ChannelContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a ChannelInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    fetch(callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    /**
     * Fetch a ChannelInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Update a ChannelInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    update(callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    /**
     * Update a ChannelInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    update(params: ChannelContextUpdateOptions, callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    /**
     * Update a ChannelInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Update a ChannelInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    updateWithHttpInfo(params: ChannelContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Access the invites.
     */
    invites(): InviteListInstance;
    /**
     * Access the members.
     */
    members(): MemberListInstance;
    /**
     * Access the messages.
     */
    messages(): MessageListInstance;
    /**
     * Access the webhooks.
     */
    webhooks(): WebhookListInstance;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        accountSid: string;
        serviceSid: string;
        friendlyName: string;
        uniqueName: string;
        attributes: string;
        type: ChannelChannelType;
        dateCreated: Date;
        dateUpdated: Date;
        createdBy: string;
        membersCount: number;
        messagesCount: number;
        url: string;
        links: Record<string, string>;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ChannelSolution {
    serviceSid: string;
}
export interface ChannelListInstance {
    _version: V2;
    _solution: ChannelSolution;
    _uri: string;
    (sid: string): ChannelContext;
    get(sid: string): ChannelContext;
    /**
     * Create a ChannelInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    create(callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    /**
     * Create a ChannelInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance
     */
    create(params: ChannelListInstanceCreateOptions, callback?: (error: Error | null, item?: ChannelInstance) => any): Promise<ChannelInstance>;
    /**
     * Create a ChannelInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Create a ChannelInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ChannelInstance with HTTP metadata
     */
    createWithHttpInfo(params: ChannelListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<ChannelInstance>) => any): Promise<ApiResponse<ChannelInstance>>;
    /**
     * Streams ChannelInstance records from the API.
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
     * @param { ChannelListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: ChannelInstance, done: (err?: Error) => void) => void): void;
    each(params: ChannelListInstanceEachOptions, callback?: (item: ChannelInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams ChannelInstance records from the API with HTTP metadata captured per page.
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
     * @param { ChannelListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: ChannelInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ChannelListInstanceEachOptions, callback?: (item: ChannelInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ChannelInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ChannelPage) => any): Promise<ChannelPage>;
    /**
     * Retrieve a single target page of ChannelInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ChannelPage>) => any): Promise<ApiResponse<ChannelPage>>;
    /**
     * Lists ChannelInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ChannelListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: ChannelInstance[]) => any): Promise<ChannelInstance[]>;
    list(params: ChannelListInstanceOptions, callback?: (error: Error | null, items: ChannelInstance[]) => any): Promise<ChannelInstance[]>;
    /**
     * Lists ChannelInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ChannelListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ChannelInstance[]>) => any): Promise<ApiResponse<ChannelInstance[]>>;
    listWithHttpInfo(params: ChannelListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<ChannelInstance[]>) => any): Promise<ApiResponse<ChannelInstance[]>>;
    /**
     * Retrieve a single page of ChannelInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ChannelListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ChannelPage) => any): Promise<ChannelPage>;
    page(params: ChannelListInstancePageOptions, callback?: (error: Error | null, items: ChannelPage) => any): Promise<ChannelPage>;
    /**
     * Retrieve a single page of ChannelInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ChannelListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ChannelPage>) => any): Promise<ApiResponse<ChannelPage>>;
    pageWithHttpInfo(params: ChannelListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ChannelPage>) => any): Promise<ApiResponse<ChannelPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ChannelListInstance(version: V2, serviceSid: string): ChannelListInstance;
export declare class ChannelPage extends Page<V2, ChannelPayload, ChannelResource, ChannelInstance> {
    /**
     * Initialize the ChannelPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, solution: ChannelSolution);
    /**
     * Build an instance of ChannelInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ChannelResource): ChannelInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
