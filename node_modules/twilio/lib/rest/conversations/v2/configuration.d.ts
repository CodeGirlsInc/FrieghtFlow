import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Defines a capture rule with from and to addresses. Supports wildcard `*` for omnidirectional matching.
 */
export declare class ConversationsV2CaptureRule {
    /**
     * The from address. Use `*` for wildcard to match any from address.
     */
    "from": string;
    /**
     * The to address. Use `*` for wildcard to match any to address.
     */
    "to": string;
    /**
     * Additional matching criteria for the capture rule. For voice calls, can include `callType` (`PSTN`, `SIP`, and similar).
     */
    "metadata"?: {
        [key: string]: string;
    };
    constructor(payload: any);
}
/**
 * Configuration settings for a specific channel type.
 */
export declare class ConversationsV2ChannelSetting {
    "statusTimeouts"?: ConversationsV2StatusTimeouts;
    /**
     * Array of capture rules with from/to addresses and optional metadata. Use `*` for wildcard matching in either direction.
     */
    "captureRules"?: Array<ConversationsV2CaptureRule>;
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
/**
 * Timeout settings for channel status transitions.
 */
export declare class ConversationsV2StatusTimeouts {
    /**
     * Inactivity timeout in minutes.
     */
    "inactive"?: number;
    /**
     * Close timeout in minutes.
     */
    "closed"?: number;
    constructor(payload: any);
}
export declare class CreateConfigurationRequest {
    /**
     * A human-readable name for the configuration. Limited to 32 characters.
     */
    "displayName": string;
    /**
     * Human-readable description for the configuration.
     */
    "description": string;
    /**
     * The strategy Conversation Orchestrator uses to assign communications to conversations.
     */
    "conversationGroupingType": string;
    /**
     * The memory store ID that Conversation Orchestrator uses for profile resolution.
     */
    "memoryStoreId": string;
    "channelSettings"?: {
        [key: string]: CreateConfigurationRequestChannelSettingsValue;
    };
    /**
     * A list of webhook configurations.
     */
    "statusCallbacks"?: Array<CreateConfigurationRequestStatusCallbacks>;
    /**
     * A list of Conversational Intelligence configuration IDs.
     */
    "intelligenceConfigurationIds"?: Array<string>;
    /**
     * Whether memory extraction is enabled for conversations under this configuration. Defaults to false.
     */
    "memoryExtractionEnabled"?: boolean;
    constructor(payload: any);
}
export declare class CreateConfigurationRequestChannelSettingsValue {
    "statusTimeouts"?: CreateConfigurationRequestChannelSettingsValueStatusTimeouts;
    "captureRules"?: Array<CreateConfigurationRequestChannelSettingsValueCaptureRules>;
    constructor(payload: any);
}
export declare class CreateConfigurationRequestChannelSettingsValueCaptureRules {
    /**
     * The from address. Use \'*\' for wildcard.
     */
    "from": string;
    /**
     * The to address. Use \'*\' for wildcard.
     */
    "to": string;
    "metadata"?: {
        [key: string]: string;
    };
    constructor(payload: any);
}
export declare class CreateConfigurationRequestChannelSettingsValueStatusTimeouts {
    /**
     * The inactivity timeout in minutes. For more information, see [Conversation lifecycle](/docs/platform/conversations/concepts/lifecycle).
     */
    "inactive"?: number;
    /**
     * The close timeout in minutes. For more information, see [Conversation lifecycle](/docs/platform/conversations/concepts/lifecycle).
     */
    "closed"?: number;
    constructor(payload: any);
}
export declare class CreateConfigurationRequestStatusCallbacks {
    /**
     * The destination URL for webhooks.
     */
    "url": string;
    /**
     * The HTTP method used to invoke the webhook URL.
     */
    "method"?: string;
    constructor(payload: any);
}
export declare class UpdateConfigurationRequest {
    /**
     * A human-readable name for the configuration. Limited to 32 characters.
     */
    "displayName"?: string;
    /**
     * Human-readable description for the configuration.
     */
    "description": string;
    /**
     * The strategy Conversation Orchestrator uses to assign communications to conversations.
     */
    "conversationGroupingType": string;
    /**
     * The Memory Store ID for profile resolution.
     */
    "memoryStoreId": string;
    "channelSettings": {
        [key: string]: UpdateConfigurationRequestChannelSettingsValue;
    };
    "statusCallbacks"?: Array<UpdateConfigurationRequestStatusCallbacks>;
    /**
     * A list of Conversational Intelligence configuration IDs.
     */
    "intelligenceConfigurationIds"?: Array<string>;
    /**
     * Whether memory extraction is enabled for conversations under this configuration. Defaults to false.
     */
    "memoryExtractionEnabled"?: boolean;
    constructor(payload: any);
}
export declare class UpdateConfigurationRequestChannelSettingsValue {
    "statusTimeouts"?: UpdateConfigurationRequestChannelSettingsValueStatusTimeouts;
    "captureRules"?: Array<UpdateConfigurationRequestChannelSettingsValueCaptureRules>;
    constructor(payload: any);
}
export declare class UpdateConfigurationRequestChannelSettingsValueCaptureRules {
    "from": string;
    "to": string;
    "metadata"?: {
        [key: string]: string;
    };
    constructor(payload: any);
}
export declare class UpdateConfigurationRequestChannelSettingsValueStatusTimeouts {
    "inactive"?: number;
    "closed"?: number;
    constructor(payload: any);
}
export declare class UpdateConfigurationRequestStatusCallbacks {
    "url": string;
    "method"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to remove a ConfigurationInstance
 */
export interface ConfigurationContextRemoveOptions {
    /** Client-generated UUID key to ensure idempotent behavior. Submitting the same key returns the original response without creating a duplicate operation. Keys are scoped to account + region with a 24-hour TTL. */
    idempotencyKey?: string;
}
/**
 * Options to pass to update a ConfigurationInstance
 */
export interface ConfigurationContextUpdateOptions {
    /** Client-generated UUID key to ensure idempotent behavior. Submitting the same key returns the original response without creating a duplicate operation. Keys are scoped to account + region with a 24-hour TTL. */
    idempotencyKey?: string;
    /** The configuration to update */
    updateConfigurationRequest?: UpdateConfigurationRequest;
}
/**
 * Options to pass to create a ConfigurationInstance
 */
export interface ConfigurationListInstanceCreateOptions {
    /** Client-generated UUID key to ensure idempotent behavior. Submitting the same key returns the original response without creating a duplicate operation. Keys are scoped to account + region with a 24-hour TTL. */
    idempotencyKey?: string;
    /** The configuration to create */
    createConfigurationRequest?: CreateConfigurationRequest;
}
/**
 * Options to pass to each
 */
export interface ConfigurationListInstanceEachOptions {
    /** Maximum number of items to return in a single response */
    pageSize?: number;
    /** A URL-safe, base64-encoded token representing the page of results to return */
    pageToken?: string;
    /** Filter configurations by Memory Store ID */
    memoryStoreId?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ConfigurationInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ConfigurationListInstanceOptions {
    /** Maximum number of items to return in a single response */
    pageSize?: number;
    /** A URL-safe, base64-encoded token representing the page of results to return */
    pageToken?: string;
    /** Filter configurations by Memory Store ID */
    memoryStoreId?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ConfigurationListInstancePageOptions {
    /** Maximum number of items to return in a single response */
    pageSize?: number;
    /** A URL-safe, base64-encoded token representing the page of results to return */
    pageToken?: string;
    /** Filter configurations by Memory Store ID */
    memoryStoreId?: string;
}
export interface ConfigurationContext {
    /**
     * Remove a ConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    remove(callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Remove a ConfigurationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    remove(params: ConfigurationContextRemoveOptions, callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Remove a ConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Remove a ConfigurationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    removeWithHttpInfo(params: ConfigurationContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Fetch a ConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    fetch(callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Fetch a ConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Update a ConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    update(callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Update a ConfigurationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    update(params: UpdateConfigurationRequest, headers?: any, callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Update a ConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Update a ConfigurationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateConfigurationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ConfigurationContextSolution {
    sid: string;
}
export declare class ConfigurationContextImpl implements ConfigurationContext {
    protected _version: V2;
    protected _solution: ConfigurationContextSolution;
    protected _uri: string;
    constructor(_version: V2, sid: string);
    remove(params?: ConfigurationContextRemoveOptions | ((error: Error | null, item?: ConfigurationInstance) => any), callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    removeWithHttpInfo(params?: ConfigurationContextRemoveOptions | ((error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    fetch(callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    update(params?: UpdateConfigurationRequest | ((error: Error | null, item?: ConfigurationInstance) => any), headers?: any, callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    updateWithHttpInfo(params?: UpdateConfigurationRequest | ((error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ConfigurationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for ConversationsV2CaptureRule
 */
export interface ConversationsV2CaptureRule {
    from: string;
    to: string;
    metadata?: {
        [key: string]: string;
    };
}
/**
 * Nested model for ConversationsV2ChannelSetting
 */
export interface ConversationsV2ChannelSetting {
    statusTimeouts?: ConversationsV2StatusTimeouts;
    captureRules?: Array<ConversationsV2CaptureRule>;
}
/**
 * Nested model for ConversationsV2ConversationsV1Bridge
 */
export interface ConversationsV2ConversationsV1Bridge {
    serviceId: string;
}
/**
 * Nested model for ConversationsV2StatusCallbackConfig
 */
export interface ConversationsV2StatusCallbackConfig {
    url: string;
    method?: string;
}
/**
 * Nested model for ConversationsV2StatusTimeouts
 */
export interface ConversationsV2StatusTimeouts {
    inactive?: number;
    closed?: number;
}
/**
 * Nested model for CreateConfigurationRequest
 */
export interface CreateConfigurationRequest {
    displayName: string;
    description: string;
    conversationGroupingType: string;
    memoryStoreId: string;
    channelSettings?: {
        [key: string]: CreateConfigurationRequestChannelSettingsValue;
    };
    statusCallbacks?: Array<CreateConfigurationRequestStatusCallbacks>;
    intelligenceConfigurationIds?: Array<string>;
    memoryExtractionEnabled?: boolean;
}
/**
 * Nested model for CreateConfigurationRequestChannelSettingsValue
 */
export interface CreateConfigurationRequestChannelSettingsValue {
    statusTimeouts?: CreateConfigurationRequestChannelSettingsValueStatusTimeouts;
    captureRules?: Array<CreateConfigurationRequestChannelSettingsValueCaptureRules>;
}
/**
 * Nested model for CreateConfigurationRequestChannelSettingsValueCaptureRules
 */
export interface CreateConfigurationRequestChannelSettingsValueCaptureRules {
    from: string;
    to: string;
    metadata?: {
        [key: string]: string;
    };
}
/**
 * Nested model for CreateConfigurationRequestChannelSettingsValueStatusTimeouts
 */
export interface CreateConfigurationRequestChannelSettingsValueStatusTimeouts {
    inactive?: number;
    closed?: number;
}
/**
 * Nested model for CreateConfigurationRequestStatusCallbacks
 */
export interface CreateConfigurationRequestStatusCallbacks {
    url: string;
    method?: string;
}
/**
 * Nested model for UpdateConfigurationRequest
 */
export interface UpdateConfigurationRequest {
    displayName?: string;
    description: string;
    conversationGroupingType: string;
    memoryStoreId: string;
    channelSettings: {
        [key: string]: UpdateConfigurationRequestChannelSettingsValue;
    };
    statusCallbacks?: Array<UpdateConfigurationRequestStatusCallbacks>;
    intelligenceConfigurationIds?: Array<string>;
    memoryExtractionEnabled?: boolean;
}
/**
 * Nested model for UpdateConfigurationRequestChannelSettingsValue
 */
export interface UpdateConfigurationRequestChannelSettingsValue {
    statusTimeouts?: UpdateConfigurationRequestChannelSettingsValueStatusTimeouts;
    captureRules?: Array<UpdateConfigurationRequestChannelSettingsValueCaptureRules>;
}
/**
 * Nested model for UpdateConfigurationRequestChannelSettingsValueCaptureRules
 */
export interface UpdateConfigurationRequestChannelSettingsValueCaptureRules {
    from: string;
    to: string;
    metadata?: {
        [key: string]: string;
    };
}
/**
 * Nested model for UpdateConfigurationRequestChannelSettingsValueStatusTimeouts
 */
export interface UpdateConfigurationRequestChannelSettingsValueStatusTimeouts {
    inactive?: number;
    closed?: number;
}
/**
 * Nested model for UpdateConfigurationRequestStatusCallbacks
 */
export interface UpdateConfigurationRequestStatusCallbacks {
    url: string;
    method?: string;
}
interface ConfigurationPayload extends TokenPaginationPayload {
    configurations: ConfigurationResource[];
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
 * Response model for ListConfiguration200ResponseConfigurations operations
 */
interface ListConfiguration200ResponseConfigurations_ResponseResource {
    id: string;
    displayName: string;
    description: string;
    conversationGroupingType: string;
    memoryStoreId: string;
    channelSettings?: {
        [key: string]: ConversationsV2ChannelSetting;
    };
    statusCallbacks?: Array<ConversationsV2StatusCallbackConfig>;
    intelligenceConfigurationIds?: Array<string>;
    memoryExtractionEnabled?: boolean;
    conversationsV1Bridge?: ConversationsV2ConversationsV1Bridge;
    createdAt?: Date;
    updatedAt?: Date;
    version?: number;
}
/**
 * Union type for all possible response models
 */
type ConfigurationResource = CreateConfiguration202Response_ResponseResource | ListConfiguration200ResponseConfigurations_ResponseResource;
/**
 * Slim response for an accepted long-running operation.
 */
export declare class ConfigurationInstance {
    protected _version: V2;
    protected _solution: ConfigurationContextSolution;
    protected _context?: ConfigurationContext;
    constructor(_version: V2, _payload: ConfigurationResource, sid?: string);
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
     * Configuration ID.
     */
    id?: string;
    /**
     * A human-readable name for the configuration. Limited to 32 characters.
     */
    displayName?: string;
    /**
     * Human-readable description for the Configuration. Allows spaces and special characters, typically limited to a paragraph of text. This serves as a descriptive field rather than just a name.
     */
    description?: string;
    /**
     * Type of Conversation grouping strategy: - `GROUP_BY_PROFILE`: Groups Communications by resolved Profile from the Memory Store.   A Profile is looked up or created for `CUSTOMER` Participant types. All Communications from the same Profile are in the same Conversation, regardless of address or channel. - `GROUP_BY_PARTICIPANT_ADDRESSES`: Groups Communications by Participant addresses across all channels.   A customer using +18005550100 will be in the same Conversation whether they contact by SMS, WhatsApp, or RCS. - `GROUP_BY_PARTICIPANT_ADDRESSES_AND_CHANNEL_TYPE`: Groups Communications by both Participant addresses AND channel.   A customer using +18005550100 by SMS will be in a different Conversation than the same customer by Voice.
     */
    conversationGroupingType?: string;
    /**
     * Memory Store ID for Profile resolution.
     */
    memoryStoreId?: string;
    /**
     * Channel-specific configuration settings by channel type. Keys should be valid channel types (`VOICE`, `SMS`, `RCS`, `WHATSAPP`, `CHAT`).
     */
    channelSettings?: {
        [key: string]: ConversationsV2ChannelSetting;
    };
    /**
     * List of default webhook configurations applied to Conversations under this Configuration.
     */
    statusCallbacks?: Array<ConversationsV2StatusCallbackConfig>;
    /**
     * A list of Conversational Intelligence configuration IDs.
     */
    intelligenceConfigurationIds?: Array<string>;
    /**
     * Whether memory extraction is enabled for conversations under this configuration. Defaults to false.
     */
    memoryExtractionEnabled?: boolean;
    conversationsV1Bridge?: ConversationsV2ConversationsV1Bridge;
    /**
     * Timestamp when this Configuration was created.
     */
    createdAt?: Date;
    /**
     * Timestamp when this Configuration was last updated.
     */
    updatedAt?: Date;
    /**
     * Version number used for optimistic locking.
     */
    version?: number;
    private get _proxy();
    /**
     * Remove a ConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    remove(callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Remove a ConfigurationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    remove(params: ConfigurationContextRemoveOptions, callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Remove a ConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Remove a ConfigurationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    removeWithHttpInfo(params: ConfigurationContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Fetch a ConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    fetch(callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Fetch a ConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Update a ConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    update(callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Update a ConfigurationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    update(params: UpdateConfigurationRequest, headers?: any, callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Update a ConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Update a ConfigurationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    updateWithHttpInfo(params: UpdateConfigurationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
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
        displayName: string;
        description: string;
        conversationGroupingType: string;
        memoryStoreId: string;
        channelSettings: {
            [key: string]: ConversationsV2ChannelSetting;
        };
        statusCallbacks: ConversationsV2StatusCallbackConfig[];
        intelligenceConfigurationIds: string[];
        memoryExtractionEnabled: boolean;
        conversationsV1Bridge: ConversationsV2ConversationsV1Bridge;
        createdAt: Date;
        updatedAt: Date;
        version: number;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ConfigurationSolution {
}
export interface ConfigurationListInstance {
    _version: V2;
    _solution: ConfigurationSolution;
    _uri: string;
    (sid: string): ConfigurationContext;
    get(sid: string): ConfigurationContext;
    /**
     * Create a ConfigurationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    create(callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Create a ConfigurationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance
     */
    create(params: CreateConfigurationRequest, headers?: any, callback?: (error: Error | null, item?: ConfigurationInstance) => any): Promise<ConfigurationInstance>;
    /**
     * Create a ConfigurationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Create a ConfigurationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ConfigurationInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateConfigurationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ConfigurationInstance>) => any): Promise<ApiResponse<ConfigurationInstance>>;
    /**
     * Streams ConfigurationInstance records from the API.
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
     * @param { ConfigurationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: ConfigurationInstance, done: (err?: Error) => void) => void): void;
    each(params: ConfigurationListInstanceEachOptions, callback?: (item: ConfigurationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams ConfigurationInstance records from the API with HTTP metadata captured per page.
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
     * @param { ConfigurationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: ConfigurationInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ConfigurationListInstanceEachOptions, callback?: (item: ConfigurationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ConfigurationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ConfigurationPage) => any): Promise<ConfigurationPage>;
    /**
     * Retrieve a single target page of ConfigurationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ConfigurationPage>) => any): Promise<ApiResponse<ConfigurationPage>>;
    /**
     * Lists ConfigurationInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConfigurationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: ConfigurationInstance[]) => any): Promise<ConfigurationInstance[]>;
    list(params: ConfigurationListInstanceOptions, callback?: (error: Error | null, items: ConfigurationInstance[]) => any): Promise<ConfigurationInstance[]>;
    /**
     * Lists ConfigurationInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConfigurationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ConfigurationInstance[]>) => any): Promise<ApiResponse<ConfigurationInstance[]>>;
    listWithHttpInfo(params: ConfigurationListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<ConfigurationInstance[]>) => any): Promise<ApiResponse<ConfigurationInstance[]>>;
    /**
     * Retrieve a single page of ConfigurationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConfigurationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ConfigurationPage) => any): Promise<ConfigurationPage>;
    page(params: ConfigurationListInstancePageOptions, callback?: (error: Error | null, items: ConfigurationPage) => any): Promise<ConfigurationPage>;
    /**
     * Retrieve a single page of ConfigurationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ConfigurationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ConfigurationPage>) => any): Promise<ApiResponse<ConfigurationPage>>;
    pageWithHttpInfo(params: ConfigurationListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ConfigurationPage>) => any): Promise<ApiResponse<ConfigurationPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ConfigurationListInstance(version: V2): ConfigurationListInstance;
export declare class ConfigurationPage extends TokenPage<V2, ConfigurationPayload, ConfigurationResource, ConfigurationInstance> {
    /**
     * Initialize the ConfigurationPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, uri: string, params: any, solution: ConfigurationSolution);
    /**
     * Build an instance of ConfigurationInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ConfigurationResource): ConfigurationInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
