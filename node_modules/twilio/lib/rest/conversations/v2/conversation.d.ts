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
/**
 * Configuration for Conversations V1 bridge. When set, messaging channels route through Conversations V1. Use this to integrate with existing Conversations V1 applications.
 */
export declare class ConversationsV2ConversationsV1Bridge {
    /**
     * The Conversations V1 Service SID (IS prefix). One configuration per V1 Service SID.
     */
    "serviceId": string;
    constructor(payload: any);
}
export declare class ConversationsV2Participant {
    /**
     * Participant ID.
     */
    "id": string;
    /**
     * Conversation ID.
     */
    "conversationId": string;
    /**
     * Account ID.
     */
    "accountId": string;
    /**
     * Participant display name.
     */
    "name": string;
    /**
     * Type of Participant in the Conversation.
     */
    "type"?: string;
    /**
     * Profile ID. Note: This field is only resolved for `CUSTOMER` participant types, not for `HUMAN_AGENT` or `AI_AGENT` participants.
     */
    "profileId"?: string;
    /**
     * Communication addresses for this Participant. Address format varies by channel: - SMS/VOICE: E.164 phone number (such as \"+18005550100\") - EMAIL: Email address (such as \"user@example.com\") - WHATSAPP: Phone number with whatsapp prefix (such as \"whatsapp:+18005550100\") - RCS: Sender ID or phone number with rcs prefix (such as \"rcs:brand_acme_agent\" or \"rcs:+18005550100\")
     */
    "addresses"?: Array<ConversationsV2Address>;
    /**
     * Timestamp when this Participant was created.
     */
    "createdAt"?: Date;
    /**
     * Timestamp when this Participant was last updated.
     */
    "updatedAt"?: Date;
    constructor(payload: any);
}
/**
 * Default webhook configuration for Conversation-level events under this Configuration.
 */
export declare class ConversationsV2StatusCallbackConfig {
    /**
     * Destination URL for webhooks.
     */
    "url": string;
    /**
     * HTTP method used to invoke the webhook URL.
     */
    "method"?: string;
    constructor(payload: any);
}
export declare class CreateConversationWithConfigRequest {
    /**
     * The ID of an existing configuration.
     */
    "configurationId": string;
    /**
     * The name of the conversation.
     */
    "name"?: string;
    "configuration"?: CreateConversationWithConfigRequestConfiguration;
    /**
     * Optional list of Participants to create with the Conversation.
     */
    "participants"?: Array<CreateConversationWithConfigRequestParticipants>;
    constructor(payload: any);
}
/**
 * Conversation configuration settings.
 */
export declare class CreateConversationWithConfigRequestConfiguration {
    /**
     * A list of Conversational Intelligence configuration IDs.
     */
    "intelligenceConfigurationIds"?: Array<string>;
    constructor(payload: any);
}
export declare class CreateConversationWithConfigRequestParticipants {
    /**
     * Display name for the Participant.
     */
    "name"?: string;
    /**
     * Type of Participant in the Conversation.
     */
    "type"?: string;
    /**
     * Resolved profile ID.
     */
    "profileId"?: string;
    /**
     * List of Communication addresses for the Participant.
     */
    "addresses"?: Array<CreateConversationWithConfigRequestParticipantsAddresses>;
    constructor(payload: any);
}
export declare class CreateConversationWithConfigRequestParticipantsAddresses {
    "channel": string;
    "address": string;
    "channelId"?: string;
    constructor(payload: any);
}
/**
 * Full configuration settings for this Conversation.
 */
export declare class ListConversationByAccount200ResponseConversationsConfiguration {
    /**
     * A human-readable name for the configuration. Limited to 32 characters.
     */
    "displayName"?: string;
    /**
     * Human-readable description for the Configuration.
     */
    "description"?: string;
    /**
     * Type of Conversation grouping strategy: - `GROUP_BY_PROFILE`: Groups Communications by resolved Profile from the Memory Store.   A Profile is looked up or created for `CUSTOMER` Participant types. All Communications from the same Profile are in the same Conversation, regardless of address or channel. - `GROUP_BY_PARTICIPANT_ADDRESSES`: Groups Communications by Participant addresses across all channels.   A customer using +18005550100 will be in the same Conversation whether they contact by SMS, WhatsApp, or RCS. - `GROUP_BY_PARTICIPANT_ADDRESSES_AND_CHANNEL_TYPE`: Groups Communications by both Participant addresses AND channel.   A customer using +18005550100 by SMS will be in a different Conversation than the same customer by Voice.
     */
    "conversationGroupingType"?: string;
    /**
     * Memory Store ID for Profile resolution.
     */
    "memoryStoreId"?: string;
    /**
     * Channel-specific parameters forwarded as-is to the downstream sending service. Allows passing backend-specific fields without requiring API changes.
     */
    "channelSettings"?: {
        [key: string]: any;
    };
    /**
     * List of default webhook configurations applied to Conversations under this Configuration.
     */
    "statusCallbacks"?: Array<ConversationsV2StatusCallbackConfig>;
    /**
     * List of Intelligence Configuration IDs configured for this Configuration.
     */
    "intelligenceConfigurationIds"?: Array<string>;
    /**
     * Whether memory extraction is enabled for conversations under this configuration. Defaults to false.
     */
    "memoryExtractionEnabled"?: boolean;
    "conversationsV1Bridge"?: ConversationsV2ConversationsV1Bridge;
    constructor(payload: any);
}
export declare class PatchConversationByIdRequest {
    /**
     * The name of the Conversation.
     */
    "name"?: string;
    /**
     * The state of the Conversation.
     */
    "status"?: string;
    "configuration"?: PatchConversationByIdRequestConfiguration;
    constructor(payload: any);
}
/**
 * Partial configuration update for an existing conversation. Only statusCallbacks can be modified.
 */
export declare class PatchConversationByIdRequestConfiguration {
    /**
     * List of webhook configurations for this conversation. Send an empty array to clear all callbacks and stop webhook delivery.
     */
    "statusCallbacks"?: Array<ConversationsV2StatusCallbackConfig>;
    constructor(payload: any);
}
export declare class UpdateConversationByIdRequest {
    /**
     * The name of the Conversation.
     */
    "name"?: string;
    /**
     * The state of the Conversation.
     */
    "status": string;
    constructor(payload: any);
}
/**
 * Options to pass to remove a ConversationInstance
 */
export interface ConversationContextRemoveOptions {
    /** Client-generated UUID key to ensure idempotent behavior. Submitting the same key returns the original response without creating a duplicate operation. Keys are scoped to account + region with a 24-hour TTL. */
    idempotencyKey?: string;
}
/**
 * Options to pass to patch a ConversationInstance
 */
export interface ConversationContextPatchOptions {
    /** The conversation fields to update */
    patchConversationByIdRequest?: PatchConversationByIdRequest;
}
/**
 * Options to pass to update a ConversationInstance
 */
export interface ConversationContextUpdateOptions {
    /** The conversation to update */
    updateConversationByIdRequest?: UpdateConversationByIdRequest;
}
/**
 * Options to pass to create a ConversationInstance
 */
export interface ConversationListInstanceCreateOptions {
    /**  */
    createConversationWithConfigRequest?: CreateConversationWithConfigRequest;
}
/**
 * Options to pass to each
 */
export interface ConversationListInstanceEachOptions {
    /** Filters for specific statuses */
    status?: Array<"ACTIVE" | "INACTIVE" | "CLOSED">;
    /** The resource identifier (such as callSid or messageSid) to filter conversations. */
    channelId?: string;
    /** Maximum number of items to return in a single response */
    pageSize?: number;
    /** A URL-safe, base64-encoded token representing the page of results to return */
    pageToken?: string;
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
    /** Filters for specific statuses */
    status?: Array<"ACTIVE" | "INACTIVE" | "CLOSED">;
    /** The resource identifier (such as callSid or messageSid) to filter conversations. */
    channelId?: string;
    /** Maximum number of items to return in a single response */
    pageSize?: number;
    /** A URL-safe, base64-encoded token representing the page of results to return */
    pageToken?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ConversationListInstancePageOptions {
    /** Filters for specific statuses */
    status?: Array<"ACTIVE" | "INACTIVE" | "CLOSED">;
    /** The resource identifier (such as callSid or messageSid) to filter conversations. */
    channelId?: string;
    /** Maximum number of items to return in a single response */
    pageSize?: number;
    /** A URL-safe, base64-encoded token representing the page of results to return */
    pageToken?: string;
}
export interface ConversationContext {
    /**
     * Remove a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    remove(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Remove a ConversationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    remove(params: ConversationContextRemoveOptions, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Remove a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Remove a ConversationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    removeWithHttpInfo(params: ConversationContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
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
     * Patch a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    patch(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Patch a ConversationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    patch(params: PatchConversationByIdRequest, headers?: any, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Patch a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    patchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Patch a ConversationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    patchWithHttpInfo(params: PatchConversationByIdRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Update a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    update(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Update a ConversationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    update(params: UpdateConversationByIdRequest, headers?: any, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Update a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Update a ConversationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateConversationByIdRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ConversationContextSolution {
    sid: string;
}
export declare class ConversationContextImpl implements ConversationContext {
    protected _version: V2;
    protected _solution: ConversationContextSolution;
    protected _uri: string;
    constructor(_version: V2, sid: string);
    remove(params?: ConversationContextRemoveOptions | ((error: Error | null, item?: ConversationInstance) => any), callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    removeWithHttpInfo(params?: ConversationContextRemoveOptions | ((error: Error | null, item?: ApiResponse<ConversationInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    fetch(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    patch(params?: PatchConversationByIdRequest | ((error: Error | null, item?: ConversationInstance) => any), headers?: any, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    patchWithHttpInfo(params?: PatchConversationByIdRequest | ((error: Error | null, item?: ApiResponse<ConversationInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    update(params?: UpdateConversationByIdRequest | ((error: Error | null, item?: ConversationInstance) => any), headers?: any, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    updateWithHttpInfo(params?: UpdateConversationByIdRequest | ((error: Error | null, item?: ApiResponse<ConversationInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ConversationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for ConversationsV2Address
 */
export interface ConversationsV2Address {
    channel: string;
    address: string;
    channelId?: string;
}
/**
 * Nested model for ConversationsV2ConversationsV1Bridge
 */
export interface ConversationsV2ConversationsV1Bridge {
    serviceId: string;
}
/**
 * Nested model for ConversationsV2Participant
 */
export interface ConversationsV2Participant {
    id: string;
    conversationId: string;
    accountId: string;
    name: string;
    type?: string;
    profileId?: string;
    addresses?: Array<ConversationsV2Address>;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * Nested model for ConversationsV2StatusCallbackConfig
 */
export interface ConversationsV2StatusCallbackConfig {
    url: string;
    method?: string;
}
/**
 * Nested model for CreateConversationWithConfigRequest
 */
export interface CreateConversationWithConfigRequest {
    configurationId: string;
    name?: string;
    configuration?: CreateConversationWithConfigRequestConfiguration;
    participants?: Array<CreateConversationWithConfigRequestParticipants>;
}
/**
 * Nested model for CreateConversationWithConfigRequestConfiguration
 */
export interface CreateConversationWithConfigRequestConfiguration {
    intelligenceConfigurationIds?: Array<string>;
}
/**
 * Nested model for CreateConversationWithConfigRequestParticipants
 */
export interface CreateConversationWithConfigRequestParticipants {
    name?: string;
    type?: string;
    profileId?: string;
    addresses?: Array<CreateConversationWithConfigRequestParticipantsAddresses>;
}
/**
 * Nested model for CreateConversationWithConfigRequestParticipantsAddresses
 */
export interface CreateConversationWithConfigRequestParticipantsAddresses {
    channel: string;
    address: string;
    channelId?: string;
}
/**
 * Nested model for ListConversationByAccount200ResponseConversationsConfiguration
 */
export interface ListConversationByAccount200ResponseConversationsConfiguration {
    displayName?: string;
    description?: string;
    conversationGroupingType?: string;
    memoryStoreId?: string;
    channelSettings?: {
        [key: string]: any;
    };
    statusCallbacks?: Array<ConversationsV2StatusCallbackConfig>;
    intelligenceConfigurationIds?: Array<string>;
    memoryExtractionEnabled?: boolean;
    conversationsV1Bridge?: ConversationsV2ConversationsV1Bridge;
}
/**
 * Nested model for PatchConversationByIdRequest
 */
export interface PatchConversationByIdRequest {
    name?: string;
    status?: string;
    configuration?: PatchConversationByIdRequestConfiguration;
}
/**
 * Nested model for PatchConversationByIdRequestConfiguration
 */
export interface PatchConversationByIdRequestConfiguration {
    statusCallbacks?: Array<ConversationsV2StatusCallbackConfig>;
}
/**
 * Nested model for UpdateConversationByIdRequest
 */
export interface UpdateConversationByIdRequest {
    name?: string;
    status: string;
}
interface ConversationPayload extends TokenPaginationPayload {
    conversations: ConversationResource[];
}
/**
 * Response model for CreateConfiguration202Response operations
 */
interface CreateConfiguration202Response_ResponseResource {
    statusUrl: string;
    related?: {
        [key: string]: string;
    };
}
/**
 * Response model for ListConversationByAccount200ResponseConversations operations
 */
interface ListConversationByAccount200ResponseConversations_ResponseResource {
    id: string;
    accountId: string;
    configurationId: string;
    status?: string;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    configuration?: ListConversationByAccount200ResponseConversationsConfiguration;
    participants?: Array<ConversationsV2Participant>;
}
/**
 * Union type for all possible response models
 */
type ConversationResource = CreateConfiguration202Response_ResponseResource | ListConversationByAccount200ResponseConversations_ResponseResource;
export declare class ConversationInstance {
    protected _version: V2;
    protected _solution: ConversationContextSolution;
    protected _context?: ConversationContext;
    constructor(_version: V2, _payload: ConversationResource, sid?: string);
    /**
     * URL to poll for operation status.
     */
    statusUrl?: string;
    /**
     * Named resource identifiers associated with this operation. Keys depend on the operation type: - config-create, config-update, config-delete: configurationId - conversation-delete: conversationId
     */
    related?: {
        [key: string]: string;
    };
    /**
     * Conversation ID.
     */
    id?: string;
    /**
     * Account ID.
     */
    accountId?: string;
    /**
     * Configuration ID.
     */
    configurationId?: string;
    /**
     * Conversation status.
     */
    status?: string;
    /**
     * Conversation name.
     */
    name?: string;
    /**
     * Timestamp when this Conversation was created.
     */
    createdAt?: Date;
    /**
     * Timestamp when this Conversation was last updated.
     */
    updatedAt?: Date;
    configuration?: ListConversationByAccount200ResponseConversationsConfiguration;
    /**
     * Participants in this Conversation.
     */
    participants?: Array<ConversationsV2Participant>;
    private get _proxy();
    /**
     * Remove a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    remove(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Remove a ConversationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    remove(params: ConversationContextRemoveOptions, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Remove a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Remove a ConversationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    removeWithHttpInfo(params: ConversationContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
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
     * Patch a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    patch(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Patch a ConversationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    patch(params: PatchConversationByIdRequest, headers?: any, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Patch a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    patchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Patch a ConversationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    patchWithHttpInfo(params: PatchConversationByIdRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Update a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    update(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Update a ConversationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    update(params: UpdateConversationByIdRequest, headers?: any, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Update a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Update a ConversationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateConversationByIdRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        statusUrl: string;
        related: {
            [key: string]: string;
        };
        id: string;
        accountId: string;
        configurationId: string;
        status: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        configuration: ListConversationByAccount200ResponseConversationsConfiguration;
        participants: ConversationsV2Participant[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ConversationSolution {
}
export interface ConversationListInstance {
    _version: V2;
    _solution: ConversationSolution;
    _uri: string;
    (sid: string): ConversationContext;
    get(sid: string): ConversationContext;
    /**
     * Create a ConversationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    create(callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Create a ConversationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance
     */
    create(params: CreateConversationWithConfigRequest, headers?: any, callback?: (error: Error | null, item?: ConversationInstance) => any): Promise<ConversationInstance>;
    /**
     * Create a ConversationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
    /**
     * Create a ConversationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConversationInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateConversationWithConfigRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConversationInstance>) => any): Promise<ApiResponse<ConversationInstance>>;
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
export declare function ConversationListInstance(version: V2): ConversationListInstance;
export declare class ConversationPage extends TokenPage<V2, ConversationPayload, ConversationResource, ConversationInstance> {
    /**
     * Initialize the ConversationPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, uri: string, params: any, solution: ConversationSolution);
    /**
     * Build an instance of ConversationInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ConversationResource): ConversationInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
