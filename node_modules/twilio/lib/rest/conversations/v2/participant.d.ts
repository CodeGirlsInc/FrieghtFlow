import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class ConversationsV2Address {
    /**
     * The channel for Communication.
     */
    "channel": string;
    /**
     * The address value formatted according to channel type: - SMS/VOICE: E.164 phone number (such as \"+18005550100\") - WHATSAPP: Phone number with whatsapp prefix (such as \"whatsapp:+18005550100\") - RCS: Sender ID or phone number with rcs prefix (such as \"rcs:brand_acme_agent\" or \"rcs:+18005550100\") - CHAT: Customer-defined string identifier
     */
    "address": string;
    /**
     * Channel-specific ID for correlating Communications.
     */
    "channelId"?: string;
    constructor(payload: any);
}
export declare class CreateParticipantInConversationRequest {
    "name"?: string;
    "type"?: string;
    "profileId"?: string;
    "addresses": Array<CreateParticipantInConversationRequestAddresses>;
    constructor(payload: any);
}
export declare class CreateParticipantInConversationRequestAddresses {
    "channel": string;
    "address": string;
    "channelId"?: string;
    constructor(payload: any);
}
export declare class UpdateParticipantInConversationRequest {
    "name"?: string;
    "type"?: string;
    "profileId"?: string;
    "addresses"?: Array<CreateParticipantInConversationRequestAddresses>;
    constructor(payload: any);
}
/**
 * Options to pass to update a ParticipantInstance
 */
export interface ParticipantContextUpdateOptions {
    /**  */
    updateParticipantInConversationRequest?: UpdateParticipantInConversationRequest;
}
/**
 * Options to pass to create a ParticipantInstance
 */
export interface ParticipantListInstanceCreateOptions {
    /**  */
    createParticipantInConversationRequest?: CreateParticipantInConversationRequest;
}
/**
 * Options to pass to each
 */
export interface ParticipantListInstanceEachOptions {
    /** Maximum number of items to return */
    pageSize?: number;
    /** Page token for pagination */
    pageToken?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ParticipantInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ParticipantListInstanceOptions {
    /** Maximum number of items to return */
    pageSize?: number;
    /** Page token for pagination */
    pageToken?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ParticipantListInstancePageOptions {
    /** Maximum number of items to return */
    pageSize?: number;
    /** Page token for pagination */
    pageToken?: string;
}
export interface ParticipantContext {
    /**
     * Fetch a ParticipantInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance
     */
    fetch(callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    /**
     * Fetch a ParticipantInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Update a ParticipantInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance
     */
    update(callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    /**
     * Update a ParticipantInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance
     */
    update(params: UpdateParticipantInConversationRequest, headers?: any, callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    /**
     * Update a ParticipantInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Update a ParticipantInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateParticipantInConversationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ParticipantContextSolution {
    conversationSid: string;
    sid: string;
}
export declare class ParticipantContextImpl implements ParticipantContext {
    protected _version: V2;
    protected _solution: ParticipantContextSolution;
    protected _uri: string;
    constructor(_version: V2, conversationSid: string, sid: string);
    fetch(callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    update(params?: UpdateParticipantInConversationRequest | ((error: Error | null, item?: ParticipantInstance) => any), headers?: any, callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    updateWithHttpInfo(params?: UpdateParticipantInConversationRequest | ((error: Error | null, item?: ApiResponse<ParticipantInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ParticipantContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface ParticipantPayload extends TokenPaginationPayload {
    participants: ParticipantResource[];
}
interface ParticipantResource {
    id: string;
    conversationId: string;
    accountId: string;
    name: string;
    type: string;
    profileId: string;
    addresses: Array<ConversationsV2Address>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ParticipantInstance {
    protected _version: V2;
    protected _solution: ParticipantContextSolution;
    protected _context?: ParticipantContext;
    constructor(_version: V2, _payload: ParticipantResource, conversationSid: string, sid?: string);
    /**
     * Participant ID.
     */
    id: string;
    /**
     * Conversation ID.
     */
    conversationId: string;
    /**
     * Account ID.
     */
    accountId: string;
    /**
     * Participant display name.
     */
    name: string;
    /**
     * Type of Participant in the Conversation.
     */
    type: string;
    /**
     * Profile ID. Note: This field is only resolved for `CUSTOMER` participant types, not for `HUMAN_AGENT` or `AI_AGENT` participants.
     */
    profileId: string;
    /**
     * Communication addresses for this Participant. Address format varies by channel: - SMS/VOICE: E.164 phone number (such as \"+18005550100\") - EMAIL: Email address (such as \"user@example.com\") - WHATSAPP: Phone number with whatsapp prefix (such as \"whatsapp:+18005550100\") - RCS: Sender ID or phone number with rcs prefix (such as \"rcs:brand_acme_agent\" or \"rcs:+18005550100\")
     */
    addresses: Array<ConversationsV2Address>;
    /**
     * Timestamp when this Participant was created.
     */
    createdAt: Date;
    /**
     * Timestamp when this Participant was last updated.
     */
    updatedAt: Date;
    private get _proxy();
    /**
     * Fetch a ParticipantInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance
     */
    fetch(callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    /**
     * Fetch a ParticipantInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Update a ParticipantInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance
     */
    update(callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    /**
     * Update a ParticipantInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance
     */
    update(params: UpdateParticipantInConversationRequest, headers?: any, callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    /**
     * Update a ParticipantInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Update a ParticipantInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateParticipantInConversationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        conversationId: string;
        accountId: string;
        name: string;
        type: string;
        profileId: string;
        addresses: ConversationsV2Address[];
        createdAt: Date;
        updatedAt: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ParticipantSolution {
    conversationSid: string;
}
export interface ParticipantListInstance {
    _version: V2;
    _solution: ParticipantSolution;
    _uri: string;
    (sid: string): ParticipantContext;
    get(sid: string): ParticipantContext;
    /**
     * Create a ParticipantInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance
     */
    create(callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    /**
     * Create a ParticipantInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance
     */
    create(params: CreateParticipantInConversationRequest, headers?: any, callback?: (error: Error | null, item?: ParticipantInstance) => any): Promise<ParticipantInstance>;
    /**
     * Create a ParticipantInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Create a ParticipantInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ParticipantInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateParticipantInConversationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ParticipantInstance>) => any): Promise<ApiResponse<ParticipantInstance>>;
    /**
     * Streams ParticipantInstance records from the API.
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
     * @param { ParticipantListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: ParticipantInstance, done: (err?: Error) => void) => void): void;
    each(params: ParticipantListInstanceEachOptions, callback?: (item: ParticipantInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams ParticipantInstance records from the API with HTTP metadata captured per page.
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
     * @param { ParticipantListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: ParticipantInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ParticipantListInstanceEachOptions, callback?: (item: ParticipantInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ParticipantInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ParticipantPage) => any): Promise<ParticipantPage>;
    /**
     * Retrieve a single target page of ParticipantInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ParticipantPage>) => any): Promise<ApiResponse<ParticipantPage>>;
    /**
     * Lists ParticipantInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ParticipantListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: ParticipantInstance[]) => any): Promise<ParticipantInstance[]>;
    list(params: ParticipantListInstanceOptions, callback?: (error: Error | null, items: ParticipantInstance[]) => any): Promise<ParticipantInstance[]>;
    /**
     * Lists ParticipantInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ParticipantListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ParticipantInstance[]>) => any): Promise<ApiResponse<ParticipantInstance[]>>;
    listWithHttpInfo(params: ParticipantListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<ParticipantInstance[]>) => any): Promise<ApiResponse<ParticipantInstance[]>>;
    /**
     * Retrieve a single page of ParticipantInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ParticipantListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ParticipantPage) => any): Promise<ParticipantPage>;
    page(params: ParticipantListInstancePageOptions, callback?: (error: Error | null, items: ParticipantPage) => any): Promise<ParticipantPage>;
    /**
     * Retrieve a single page of ParticipantInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ParticipantListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ParticipantPage>) => any): Promise<ApiResponse<ParticipantPage>>;
    pageWithHttpInfo(params: ParticipantListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ParticipantPage>) => any): Promise<ApiResponse<ParticipantPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ParticipantListInstance(version: V2, conversationSid: string): ParticipantListInstance;
export declare class ParticipantPage extends TokenPage<V2, ParticipantPayload, ParticipantResource, ParticipantInstance> {
    /**
     * Initialize the ParticipantPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, uri: string, params: any, solution: ParticipantSolution);
    /**
     * Build an instance of ParticipantInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ParticipantResource): ParticipantInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
