import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class ContentTranscriptionTranscription {
    "channel"?: number;
    "confidence"?: number;
    "engine"?: string;
    constructor(payload: any);
}
/**
 * Transcription metadata.
 */
export declare class ConversationsV2ContentTranscriptionTranscription {
    /**
     * Audio channel identifier (0 for inbound, 1 for outbound).
     */
    "channel"?: number;
    /**
     * Overall confidence score for the transcription (0.0-1.0).
     */
    "confidence"?: number;
    /**
     * Transcription engine used.
     */
    "engine"?: string;
    /**
     * Word-level transcription data with timing information.
     */
    "words"?: Array<ConversationsV2ContentTranscriptionTranscriptionWords>;
    constructor(payload: any);
}
export declare class ConversationsV2ContentTranscriptionTranscriptionWords {
    /**
     * The transcribed word.
     */
    "text": string;
    /**
     * Start timestamp of this word.
     */
    "startTime"?: Date;
    /**
     * End timestamp of this word.
     */
    "endTime"?: Date;
    constructor(payload: any);
}
export declare class ConversationsV2ParticipantAddress {
    /**
     * The address value formatted according to channel type: - SMS/VOICE: E.164 phone number (such as \"+18005550100\") - WHATSAPP: Phone number with whatsapp prefix (such as \"whatsapp:+18005550100\") - RCS: Sender ID or phone number with rcs prefix (such as \"rcs:brand_acme_agent\" or \"rcs:+18005550100\") - CHAT: Customer-defined string identifier
     */
    "address": string;
    /**
     * Channel type for the Participant address.
     */
    "channel": string;
    /**
     * Participant ID associated with this address.
     */
    "participantId"?: string;
    constructor(payload: any);
}
export declare class CreateCommunicationInConversationRequest {
    "author": CreateCommunicationInConversationRequestAuthor;
    "content": CreateCommunicationInConversationRequestContent;
    "channelId"?: string;
    "recipients": Array<CreateCommunicationInConversationRequestAuthor>;
    constructor(payload: any);
}
export declare class CreateCommunicationInConversationRequestAuthor {
    "address": string;
    "channel": string;
    "participantId"?: string;
    constructor(payload: any);
}
/**
 * The content of the Communication.
 */
export declare class CreateCommunicationInConversationRequestContent {
    "type": string;
    "text": string;
    "transcription"?: ContentTranscriptionTranscription;
    constructor(payload: any);
}
/**
 * The content of the Communication using type field for discrimination.
 */
export declare class ListCommunicationByConversation200ResponseCommunicationsContent {
    /**
     * Content type discriminator.
     */
    "type": string;
    /**
     * Transcribed text.
     */
    "text": string;
    "transcription"?: ConversationsV2ContentTranscriptionTranscription;
    constructor(payload: any);
}
export declare class ListCommunicationByConversation200ResponseCommunicationsRecipients {
    /**
     * The address value formatted according to channel type: - SMS/VOICE: E.164 phone number (such as \"+18005550100\") - WHATSAPP: Phone number with whatsapp prefix (such as \"whatsapp:+18005550100\") - RCS: Sender ID or phone number with rcs prefix (such as \"rcs:brand_acme_agent\" or \"rcs:+18005550100\") - CHAT: Customer-defined string identifier
     */
    "address": string;
    /**
     * Channel type for the Participant address.
     */
    "channel": string;
    /**
     * Participant ID associated with this address.
     */
    "participantId"?: string;
    /**
     * Delivery status of the Communication to this recipient.
     */
    "deliveryStatus"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to create a CommunicationInstance
 */
export interface CommunicationListInstanceCreateOptions {
    /**  */
    createCommunicationInConversationRequest?: CreateCommunicationInConversationRequest;
}
/**
 * Options to pass to each
 */
export interface CommunicationListInstanceEachOptions {
    /** Resource identifier to filter communications */
    channelId?: string;
    /** Maximum number of items to return */
    pageSize?: number;
    /** Page token for pagination */
    pageToken?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: CommunicationInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface CommunicationListInstanceOptions {
    /** Resource identifier to filter communications */
    channelId?: string;
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
export interface CommunicationListInstancePageOptions {
    /** Resource identifier to filter communications */
    channelId?: string;
    /** Maximum number of items to return */
    pageSize?: number;
    /** Page token for pagination */
    pageToken?: string;
}
export interface CommunicationContext {
    /**
     * Fetch a CommunicationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CommunicationInstance
     */
    fetch(callback?: (error: Error | null, item?: CommunicationInstance) => any): Promise<CommunicationInstance>;
    /**
     * Fetch a CommunicationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CommunicationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<CommunicationInstance>) => any): Promise<ApiResponse<CommunicationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface CommunicationContextSolution {
    conversationSid: string;
    sid: string;
}
export declare class CommunicationContextImpl implements CommunicationContext {
    protected _version: V2;
    protected _solution: CommunicationContextSolution;
    protected _uri: string;
    constructor(_version: V2, conversationSid: string, sid: string);
    fetch(callback?: (error: Error | null, item?: CommunicationInstance) => any): Promise<CommunicationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<CommunicationInstance>) => any): Promise<ApiResponse<CommunicationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): CommunicationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface CommunicationPayload extends TokenPaginationPayload {
    communications: CommunicationResource[];
}
interface CommunicationResource {
    id: string;
    conversationId: string;
    accountId: string;
    author: ConversationsV2ParticipantAddress;
    content: ListCommunicationByConversation200ResponseCommunicationsContent;
    channelId: string;
    resourceId: string;
    recipients: Array<ListCommunicationByConversation200ResponseCommunicationsRecipients>;
    createdAt: Date;
    updatedAt: Date;
    occurredAt: Date;
}
export declare class CommunicationInstance {
    protected _version: V2;
    protected _solution: CommunicationContextSolution;
    protected _context?: CommunicationContext;
    constructor(_version: V2, _payload: CommunicationResource, conversationSid: string, sid?: string);
    /**
     * Communication ID.
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
    author: ConversationsV2ParticipantAddress;
    content: ListCommunicationByConversation200ResponseCommunicationsContent;
    /**
     * Channel-specific reference ID.
     */
    channelId: string;
    /**
     * External resource identifier for this Communication (e.g. MessageSid for SMS/RCS/WhatsApp, TranscriptionSid + MessageIndex for Voice). When set, used for Communication deduplication/uniqueness within a Conversation.
     */
    resourceId: string;
    /**
     * Communication recipients.
     */
    recipients: Array<ListCommunicationByConversation200ResponseCommunicationsRecipients>;
    /**
     * Timestamp when this Communication was created.
     */
    createdAt: Date;
    /**
     * Timestamp when this Communication was last updated.
     */
    updatedAt: Date;
    /**
     * ISO 8601 timestamp when the communication occurred.
     */
    occurredAt: Date;
    private get _proxy();
    /**
     * Fetch a CommunicationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CommunicationInstance
     */
    fetch(callback?: (error: Error | null, item?: CommunicationInstance) => any): Promise<CommunicationInstance>;
    /**
     * Fetch a CommunicationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CommunicationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<CommunicationInstance>) => any): Promise<ApiResponse<CommunicationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        conversationId: string;
        accountId: string;
        author: ConversationsV2ParticipantAddress;
        content: ListCommunicationByConversation200ResponseCommunicationsContent;
        channelId: string;
        resourceId: string;
        recipients: ListCommunicationByConversation200ResponseCommunicationsRecipients[];
        createdAt: Date;
        updatedAt: Date;
        occurredAt: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface CommunicationSolution {
    conversationSid: string;
}
export interface CommunicationListInstance {
    _version: V2;
    _solution: CommunicationSolution;
    _uri: string;
    (sid: string): CommunicationContext;
    get(sid: string): CommunicationContext;
    /**
     * Create a CommunicationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CommunicationInstance
     */
    create(callback?: (error: Error | null, item?: CommunicationInstance) => any): Promise<CommunicationInstance>;
    /**
     * Create a CommunicationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CommunicationInstance
     */
    create(params: CreateCommunicationInConversationRequest, headers?: any, callback?: (error: Error | null, item?: CommunicationInstance) => any): Promise<CommunicationInstance>;
    /**
     * Create a CommunicationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CommunicationInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<CommunicationInstance>) => any): Promise<ApiResponse<CommunicationInstance>>;
    /**
     * Create a CommunicationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CommunicationInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateCommunicationInConversationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<CommunicationInstance>) => any): Promise<ApiResponse<CommunicationInstance>>;
    /**
     * Streams CommunicationInstance records from the API.
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
     * @param { CommunicationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: CommunicationInstance, done: (err?: Error) => void) => void): void;
    each(params: CommunicationListInstanceEachOptions, callback?: (item: CommunicationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams CommunicationInstance records from the API with HTTP metadata captured per page.
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
     * @param { CommunicationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: CommunicationInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: CommunicationListInstanceEachOptions, callback?: (item: CommunicationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of CommunicationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: CommunicationPage) => any): Promise<CommunicationPage>;
    /**
     * Retrieve a single target page of CommunicationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<CommunicationPage>) => any): Promise<ApiResponse<CommunicationPage>>;
    /**
     * Lists CommunicationInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { CommunicationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: CommunicationInstance[]) => any): Promise<CommunicationInstance[]>;
    list(params: CommunicationListInstanceOptions, callback?: (error: Error | null, items: CommunicationInstance[]) => any): Promise<CommunicationInstance[]>;
    /**
     * Lists CommunicationInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { CommunicationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<CommunicationInstance[]>) => any): Promise<ApiResponse<CommunicationInstance[]>>;
    listWithHttpInfo(params: CommunicationListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<CommunicationInstance[]>) => any): Promise<ApiResponse<CommunicationInstance[]>>;
    /**
     * Retrieve a single page of CommunicationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { CommunicationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: CommunicationPage) => any): Promise<CommunicationPage>;
    page(params: CommunicationListInstancePageOptions, callback?: (error: Error | null, items: CommunicationPage) => any): Promise<CommunicationPage>;
    /**
     * Retrieve a single page of CommunicationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { CommunicationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<CommunicationPage>) => any): Promise<ApiResponse<CommunicationPage>>;
    pageWithHttpInfo(params: CommunicationListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<CommunicationPage>) => any): Promise<ApiResponse<CommunicationPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function CommunicationListInstance(version: V2, conversationSid: string): CommunicationListInstance;
export declare class CommunicationPage extends TokenPage<V2, CommunicationPayload, CommunicationResource, CommunicationInstance> {
    /**
     * Initialize the CommunicationPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, uri: string, params: any, solution: CommunicationSolution);
    /**
     * Build an instance of CommunicationInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: CommunicationResource): CommunicationInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
