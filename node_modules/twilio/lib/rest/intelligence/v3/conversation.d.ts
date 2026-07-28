import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V3 from "../V3";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Communication channel type.
 */
export type Channel = "VOICE" | "SMS" | "RCS" | "EMAIL" | "WHATSAPP" | "CHAT" | "API" | "SYSTEM";
export declare class Communication {
    /**
     * Communication `id` from the attached Conversation.
     */
    "id": string;
    /**
     * The `id` of the Participant in the Conversation.
     */
    "participantId": string;
    "content": Content;
    /**
     * The timestamp for when the Communication was created.
     */
    "createdAt": Date;
    constructor(payload: any);
}
/**
 * The content of the communication.
 */
export declare class Content {
    /**
     * The transcript of the communication.
     */
    "text"?: string;
    constructor(payload: any);
}
/**
 * The status of the Conversation.
 */
export type ConversationStatus = "ACTIVE" | "INACTIVE" | "CLOSED";
export declare class Participant {
    /**
     * The `id` of the Participant in the Conversation.
     */
    "id": string;
    /**
     * Participant display name.
     */
    "name"?: string | null;
    /**
     * Type of participant in the conversation. Available types: - `CUSTOMER` - `HUMAN_AGENT` - `AI_AGENT` - `AGENT` - `UNKNOWN`
     */
    "type"?: string | null;
    /**
     * Participant address values (for example, a phone number or sender identifier).
     */
    "addressValues": Array<string>;
    constructor(payload: any);
}
/**
 * Options to pass to each
 */
export interface ConversationListInstanceEachOptions {
    /** The maximum number of resources to return */
    pageSize?: number;
    /** Token for pagination */
    pageToken?: string;
    /** Filter by Conversations created before this timestamp. */
    createdAtBefore?: Date;
    /** Filter by Conversations created after this timestamp. */
    createdAtAfter?: Date;
    /** Filter by Conversation status. */
    status?: "ACTIVE" | "INACTIVE" | "CLOSED";
    /** Filters Conversations by the underlying channel resource ID, such as a Call ID or Message ID. */
    channelId?: string;
    /** Filters Conversations that include one or more of the specified communication channels (`OR` match). */
    channels?: Array<"VOICE" | "SMS" | "RCS" | "EMAIL" | "WHATSAPP" | "CHAT" | "API" | "SYSTEM">;
    /** The configuration `id` used to generate the Conversation. */
    conversationConfigurationId?: string;
    /** Filters Conversations activated by one or more of the specified Intelligence Configuration IDs (`OR` match). */
    intelligenceConfigurationIds?: Array<string>;
    /** Filters Conversations to those where at least one of the specified Language Operators was executed (`OR` match). */
    operatorIds?: Array<string>;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ConversationInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ConversationListInstanceOptions {
    /** The maximum number of resources to return */
    pageSize?: number;
    /** Token for pagination */
    pageToken?: string;
    /** Filter by Conversations created before this timestamp. */
    createdAtBefore?: Date;
    /** Filter by Conversations created after this timestamp. */
    createdAtAfter?: Date;
    /** Filter by Conversation status. */
    status?: "ACTIVE" | "INACTIVE" | "CLOSED";
    /** Filters Conversations by the underlying channel resource ID, such as a Call ID or Message ID. */
    channelId?: string;
    /** Filters Conversations that include one or more of the specified communication channels (`OR` match). */
    channels?: Array<"VOICE" | "SMS" | "RCS" | "EMAIL" | "WHATSAPP" | "CHAT" | "API" | "SYSTEM">;
    /** The configuration `id` used to generate the Conversation. */
    conversationConfigurationId?: string;
    /** Filters Conversations activated by one or more of the specified Intelligence Configuration IDs (`OR` match). */
    intelligenceConfigurationIds?: Array<string>;
    /** Filters Conversations to those where at least one of the specified Language Operators was executed (`OR` match). */
    operatorIds?: Array<string>;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ConversationListInstancePageOptions {
    /** The maximum number of resources to return */
    pageSize?: number;
    /** Token for pagination */
    pageToken?: string;
    /** Filter by Conversations created before this timestamp. */
    createdAtBefore?: Date;
    /** Filter by Conversations created after this timestamp. */
    createdAtAfter?: Date;
    /** Filter by Conversation status. */
    status?: "ACTIVE" | "INACTIVE" | "CLOSED";
    /** Filters Conversations by the underlying channel resource ID, such as a Call ID or Message ID. */
    channelId?: string;
    /** Filters Conversations that include one or more of the specified communication channels (`OR` match). */
    channels?: Array<"VOICE" | "SMS" | "RCS" | "EMAIL" | "WHATSAPP" | "CHAT" | "API" | "SYSTEM">;
    /** The configuration `id` used to generate the Conversation. */
    conversationConfigurationId?: string;
    /** Filters Conversations activated by one or more of the specified Intelligence Configuration IDs (`OR` match). */
    intelligenceConfigurationIds?: Array<string>;
    /** Filters Conversations to those where at least one of the specified Language Operators was executed (`OR` match). */
    operatorIds?: Array<string>;
}
export interface ConversationContext {
    /**
     * Fetch a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    fetch(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Fetch a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ConversationContextSolution {
    id: string;
}
export declare class ConversationContextImpl implements ConversationContext {
    protected _version: V3;
    protected _solution: ConversationContextSolution;
    protected _uri: string;
    constructor(_version: V3, id: string);
    fetch(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ConversationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for Communication
 */
export interface Communication {
    id: string;
    participantId: string;
    content: Content;
    createdAt: Date;
}
/**
 * Nested model for Content
 */
export interface Content {
    text?: string;
}
/**
 * Nested model for Participant
 */
export interface Participant {
    id: string;
    name?: string;
    type?: string;
    addressValues: Array<string>;
}
interface ConversationPayload extends TokenPaginationPayload {
    items: ConversationResource[];
}
/**
 * Response model for FetchConversation200Response operations
 */
interface FetchConversation200Response_ResponseResource {
    id: string;
    accountId: string;
    name: string;
    status: ConversationStatus;
    createdAt: Date;
    updatedAt: Date;
    intelligenceConfigurationIds: Array<string>;
    conversationConfigurationId: string;
    channels: Array<Channel>;
    channelIds: Array<string>;
    participants: Array<Participant>;
    communications: Array<Communication>;
    operatorResultIds: Array<string>;
}
/**
 * Response model for ConversationListItem operations
 */
interface ConversationListItem_ResponseResource {
    id: string;
    accountId: string;
    name: string;
    status: ConversationStatus;
    createdAt: Date;
    updatedAt: Date;
    intelligenceConfigurationIds: Array<string>;
    conversationConfigurationId: string;
    channels: Array<Channel>;
    channelIds: Array<string>;
    participants: Array<Participant>;
    operatorResultIds: Array<string>;
}
/**
 * Union type for all possible response models
 */
type ConversationResource = FetchConversation200Response_ResponseResource | ConversationListItem_ResponseResource;
export declare class ConversationInstance {
    protected _version: V3;
    protected _solution: ConversationContextSolution;
    protected _context?: ConversationContext;
    constructor(_version: V3, _payload: ConversationResource, id?: string);
    /**
     * The `id` of the Conversation attached to the Operator Result.
     */
    id?: string;
    /**
     * The ID of the account that owns the Conversation.
     */
    accountId?: string;
    /**
     * Display name of the Conversation.
     */
    name?: string;
    status?: ConversationStatus;
    /**
     * Timestamp for when the Conversation was created.
     */
    createdAt?: Date;
    /**
     * Timestamp for when the Conversation was last updated.
     */
    updatedAt?: Date;
    /**
     * The Intelligence Configuration(s) associated with the Conversation.
     */
    intelligenceConfigurationIds?: Array<string>;
    /**
     * The `id` of the Configuration for a Conversation.
     */
    conversationConfigurationId?: string;
    /**
     * The communication channel(s) included in the Conversation.
     */
    channels?: Array<Channel>;
    /**
     * The underlying channel resource `id`s associated with this Conversation, such as a Call ID or Message ID.
     */
    channelIds?: Array<string>;
    /**
     * Metadata for Participants of the Conversation.
     */
    participants?: Array<Participant>;
    /**
     * Metadata for the Communications that make up the Conversation.
     */
    communications?: Array<Communication>;
    /**
     * List of Operator Result IDs generated from this Conversation.
     */
    operatorResultIds?: Array<string>;
    private get _proxy();
    /**
     * Fetch a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    fetch(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Fetch a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        accountId: string;
        name: string;
        status: ConversationStatus;
        createdAt: Date;
        updatedAt: Date;
        intelligenceConfigurationIds: string[];
        conversationConfigurationId: string;
        channels: Channel[];
        channelIds: string[];
        participants: Participant[];
        communications: Communication[];
        operatorResultIds: string[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ConversationSolution {
}
export interface ConversationListInstance {
    _version: V3;
    _solution: ConversationSolution;
    _uri: string;
    (id: string): ConversationContext;
    get(id: string): ConversationContext;
    /**
     * Streams ConversationInstance records from the API.
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
     * @param { ConversationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: ConversationInstance, done: (err?: Error) => void) => void): void;
    each(params: ConversationListInstanceEachOptions, callback?: (item: ConversationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams ConversationInstance records from the API with HTTP metadata captured per page.
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
     * @param { ConversationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: ConversationInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ConversationListInstanceEachOptions, callback?: (item: ConversationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ConversationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ConversationPage) => any): Promise<ConversationPage>;
    /**
     * Retrieve a single target page of ConversationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ConversationPage>) => any): Promise<ApiResponse<ConversationPage>>;
    /**
     * Lists ConversationInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConversationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: ConversationInstance[]) => any): Promise<ConversationInstance[]>;
    list(params: ConversationListInstanceOptions, callback?: (error: Error | null, items: ConversationInstance[]) => any): Promise<ConversationInstance[]>;
    /**
     * Lists ConversationInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConversationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ConversationInstance[]>) => any): Promise<ApiResponse<ConversationInstance[]>>;
    listWithHttpInfo(params: ConversationListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<ConversationInstance[]>) => any): Promise<ApiResponse<ConversationInstance[]>>;
    /**
     * Retrieve a single page of ConversationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConversationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ConversationPage) => any): Promise<ConversationPage>;
    page(params: ConversationListInstancePageOptions, callback?: (error: Error | null, items: ConversationPage) => any): Promise<ConversationPage>;
    /**
     * Retrieve a single page of ConversationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConversationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ConversationPage>) => any): Promise<ApiResponse<ConversationPage>>;
    pageWithHttpInfo(params: ConversationListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ConversationPage>) => any): Promise<ApiResponse<ConversationPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ConversationListInstance(version: V3): ConversationListInstance;
export declare class ConversationPage extends TokenPage<V3, ConversationPayload, ConversationResource, ConversationInstance> {
    /**
     * Initialize the ConversationPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V3, response: Response<string>, uri: string, params: any, solution: ConversationSolution);
    /**
     * Build an instance of ConversationInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ConversationResource): ConversationInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
