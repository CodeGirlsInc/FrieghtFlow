import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export type AddressConfigurationAutoCreationType = "webhook" | "studio" | "default";
export type AddressConfigurationMethod = "get" | "post";
/**
 * Type of Address, value can be `whatsapp` or `sms`.
 */
export type AddressConfigurationType = "sms" | "whatsapp" | "messenger" | "gbm" | "email" | "rcs" | "apple" | "chat";
/**
 * Options to pass to update a AddressConfigurationInstance
 */
export interface AddressConfigurationContextUpdateOptions {
    /** The human-readable name of this configuration, limited to 256 characters. Optional. */
    friendlyName?: string;
    /** Enable/Disable auto-creating conversations for messages to this address */
    "autoCreation.enabled"?: boolean;
    /**  */
    "autoCreation.type"?: AddressConfigurationAutoCreationType;
    /** Conversation Service for the auto-created conversation. If not set, the conversation is created in the default service. */
    "autoCreation.conversationServiceSid"?: string;
    /** For type `webhook`, the url for the webhook request. */
    "autoCreation.webhookUrl"?: string;
    /**  */
    "autoCreation.webhookMethod"?: AddressConfigurationMethod;
    /** The list of events, firing webhook event for this Conversation. Values can be any of the following: `onMessageAdded`, `onMessageUpdated`, `onMessageRemoved`, `onConversationUpdated`, `onConversationStateUpdated`, `onConversationRemoved`, `onParticipantAdded`, `onParticipantUpdated`, `onParticipantRemoved`, `onDeliveryUpdated` */
    "autoCreation.webhookFilters"?: Array<string>;
    /** For type `studio`, the studio flow SID where the webhook should be sent to. */
    "autoCreation.studioFlowSid"?: string;
    /** For type `studio`, number of times to retry the webhook request */
    "autoCreation.studioRetryCount"?: number;
}
/**
 * Options to pass to create a AddressConfigurationInstance
 */
export interface AddressConfigurationListInstanceCreateOptions {
    /**  */
    type: AddressConfigurationType;
    /** The unique address to be configured. The address can be a whatsapp address or phone number */
    address: string;
    /** The human-readable name of this configuration, limited to 256 characters. Optional. */
    friendlyName?: string;
    /** Enable/Disable auto-creating conversations for messages to this address */
    "autoCreation.enabled"?: boolean;
    /**  */
    "autoCreation.type"?: AddressConfigurationAutoCreationType;
    /** Conversation Service for the auto-created conversation. If not set, the conversation is created in the default service. */
    "autoCreation.conversationServiceSid"?: string;
    /** For type `webhook`, the url for the webhook request. */
    "autoCreation.webhookUrl"?: string;
    /**  */
    "autoCreation.webhookMethod"?: AddressConfigurationMethod;
    /** The list of events, firing webhook event for this Conversation. Values can be any of the following: `onMessageAdded`, `onMessageUpdated`, `onMessageRemoved`, `onConversationUpdated`, `onConversationStateUpdated`, `onConversationRemoved`, `onParticipantAdded`, `onParticipantUpdated`, `onParticipantRemoved`, `onDeliveryUpdated` */
    "autoCreation.webhookFilters"?: Array<string>;
    /** For type `studio`, the studio flow SID where the webhook should be sent to. */
    "autoCreation.studioFlowSid"?: string;
    /** For type `studio`, number of times to retry the webhook request */
    "autoCreation.studioRetryCount"?: number;
    /** An ISO 3166-1 alpha-2n country code which the address belongs to. This is currently only applicable to short code addresses. */
    addressCountry?: string;
}
/**
 * Options to pass to each
 */
export interface AddressConfigurationListInstanceEachOptions {
    /** Filter the address configurations by its type. This value can be one of: `whatsapp`, `sms`. */
    type?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: AddressConfigurationInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface AddressConfigurationListInstanceOptions {
    /** Filter the address configurations by its type. This value can be one of: `whatsapp`, `sms`. */
    type?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface AddressConfigurationListInstancePageOptions {
    /** Filter the address configurations by its type. This value can be one of: `whatsapp`, `sms`. */
    type?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface AddressConfigurationContext {
    /**
     * Remove a AddressConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a AddressConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a AddressConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance
     */
    fetch(callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    /**
     * Fetch a AddressConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    /**
     * Update a AddressConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance
     */
    update(callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    /**
     * Update a AddressConfigurationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance
     */
    update(params: AddressConfigurationContextUpdateOptions, callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    /**
     * Update a AddressConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    /**
     * Update a AddressConfigurationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance with HTTP metadata
     */
    updateWithHttpInfo(params: AddressConfigurationContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface AddressConfigurationContextSolution {
    sid: string;
}
export declare class AddressConfigurationContextImpl implements AddressConfigurationContext {
    protected _version: V1;
    protected _solution: AddressConfigurationContextSolution;
    protected _uri: string;
    constructor(_version: V1, sid: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    update(params?: AddressConfigurationContextUpdateOptions | ((error: Error | null, item?: AddressConfigurationInstance) => any), callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    updateWithHttpInfo(params?: AddressConfigurationContextUpdateOptions | ((error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): AddressConfigurationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface AddressConfigurationPayload extends TwilioResponsePayload {
    address_configurations: AddressConfigurationResource[];
}
interface AddressConfigurationResource {
    sid: string;
    account_sid: string;
    type: string;
    address: string;
    friendly_name: string;
    auto_creation: any;
    date_created: Date;
    date_updated: Date;
    url: string;
    address_country: string;
}
export declare class AddressConfigurationInstance {
    protected _version: V1;
    protected _solution: AddressConfigurationContextSolution;
    protected _context?: AddressConfigurationContext;
    constructor(_version: V1, payload: AddressConfigurationResource, sid?: string);
    /**
     * A 34 character string that uniquely identifies this resource.
     */
    sid: string;
    /**
     * The unique ID of the [Account](https://www.twilio.com/docs/iam/api/account) the address belongs to
     */
    accountSid: string;
    /**
     * Type of Address, value can be `whatsapp` or `sms`.
     */
    type: string;
    /**
     * The unique address to be configured. The address can be a whatsapp address or phone number
     */
    address: string;
    /**
     * The human-readable name of this configuration, limited to 256 characters. Optional.
     */
    friendlyName: string;
    /**
     * Auto Creation configuration for the address.
     */
    autoCreation: any;
    /**
     * The date that this resource was created.
     */
    dateCreated: Date;
    /**
     * The date that this resource was last updated.
     */
    dateUpdated: Date;
    /**
     * An absolute API resource URL for this address configuration.
     */
    url: string;
    /**
     * An ISO 3166-1 alpha-2n country code which the address belongs to. This is currently only applicable to short code addresses.
     */
    addressCountry: string;
    private get _proxy();
    /**
     * Remove a AddressConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a AddressConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a AddressConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance
     */
    fetch(callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    /**
     * Fetch a AddressConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    /**
     * Update a AddressConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance
     */
    update(callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    /**
     * Update a AddressConfigurationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance
     */
    update(params: AddressConfigurationContextUpdateOptions, callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    /**
     * Update a AddressConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    /**
     * Update a AddressConfigurationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance with HTTP metadata
     */
    updateWithHttpInfo(params: AddressConfigurationContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        accountSid: string;
        type: string;
        address: string;
        friendlyName: string;
        autoCreation: any;
        dateCreated: Date;
        dateUpdated: Date;
        url: string;
        addressCountry: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface AddressConfigurationSolution {
}
export interface AddressConfigurationListInstance {
    _version: V1;
    _solution: AddressConfigurationSolution;
    _uri: string;
    (sid: string): AddressConfigurationContext;
    get(sid: string): AddressConfigurationContext;
    /**
     * Create a AddressConfigurationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance
     */
    create(params: AddressConfigurationListInstanceCreateOptions, callback?: (error: Error | null, item?: AddressConfigurationInstance) => any): Promise<AddressConfigurationInstance>;
    /**
     * Create a AddressConfigurationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AddressConfigurationInstance with HTTP metadata
     */
    createWithHttpInfo(params: AddressConfigurationListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<AddressConfigurationInstance>) => any): Promise<ApiResponse<AddressConfigurationInstance>>;
    /**
     * Streams AddressConfigurationInstance records from the API.
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
     * @param { AddressConfigurationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: AddressConfigurationInstance, done: (err?: Error) => void) => void): void;
    each(params: AddressConfigurationListInstanceEachOptions, callback?: (item: AddressConfigurationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams AddressConfigurationInstance records from the API with HTTP metadata captured per page.
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
     * @param { AddressConfigurationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: AddressConfigurationInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: AddressConfigurationListInstanceEachOptions, callback?: (item: AddressConfigurationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of AddressConfigurationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: AddressConfigurationPage) => any): Promise<AddressConfigurationPage>;
    /**
     * Retrieve a single target page of AddressConfigurationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<AddressConfigurationPage>) => any): Promise<ApiResponse<AddressConfigurationPage>>;
    /**
     * Lists AddressConfigurationInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AddressConfigurationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: AddressConfigurationInstance[]) => any): Promise<AddressConfigurationInstance[]>;
    list(params: AddressConfigurationListInstanceOptions, callback?: (error: Error | null, items: AddressConfigurationInstance[]) => any): Promise<AddressConfigurationInstance[]>;
    /**
     * Lists AddressConfigurationInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AddressConfigurationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<AddressConfigurationInstance[]>) => any): Promise<ApiResponse<AddressConfigurationInstance[]>>;
    listWithHttpInfo(params: AddressConfigurationListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<AddressConfigurationInstance[]>) => any): Promise<ApiResponse<AddressConfigurationInstance[]>>;
    /**
     * Retrieve a single page of AddressConfigurationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AddressConfigurationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: AddressConfigurationPage) => any): Promise<AddressConfigurationPage>;
    page(params: AddressConfigurationListInstancePageOptions, callback?: (error: Error | null, items: AddressConfigurationPage) => any): Promise<AddressConfigurationPage>;
    /**
     * Retrieve a single page of AddressConfigurationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AddressConfigurationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<AddressConfigurationPage>) => any): Promise<ApiResponse<AddressConfigurationPage>>;
    pageWithHttpInfo(params: AddressConfigurationListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<AddressConfigurationPage>) => any): Promise<ApiResponse<AddressConfigurationPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function AddressConfigurationListInstance(version: V1): AddressConfigurationListInstance;
export declare class AddressConfigurationPage extends Page<V1, AddressConfigurationPayload, AddressConfigurationResource, AddressConfigurationInstance> {
    /**
     * Initialize the AddressConfigurationPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: AddressConfigurationSolution);
    /**
     * Build an instance of AddressConfigurationInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: AddressConfigurationResource): AddressConfigurationInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
