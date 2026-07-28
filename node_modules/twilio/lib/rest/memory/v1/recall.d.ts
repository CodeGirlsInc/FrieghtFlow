import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * A single communication within a conversation across channels including SMS, Voice, Email, etc. Contains fields that are relevant to an agent to maintain session memory.
 */
export declare class Communication {
    /**
     * Unique communication identifier.
     */
    "id": string;
    /**
     * Channel-specific ID (optional).
     */
    "channelId"?: string;
    "content": CommunicationContent;
    /**
     * When communication was created.
     */
    "createdAt"?: Date;
    /**
     * When communication was last updated.
     */
    "updatedAt"?: Date;
    "author": Participant;
    /**
     * Communication recipients
     */
    "recipients": Array<CommunicationRecipients>;
    constructor(payload: any);
}
/**
 * Content of a communication.
 */
export declare class CommunicationContent {
    /**
     * Primary text content (optional).
     */
    "text"?: string;
    constructor(payload: any);
}
export declare class CommunicationRecipients {
    /**
     * Participant identifier.
     */
    "id": string;
    /**
     * Participant display name
     */
    "name": string;
    "type"?: ParticipantType;
    /**
     * The canonical profile ID.
     */
    "profileId"?: string;
    /**
     * Address of the Participant (e.g., phone number, email address)
     */
    "address": string;
    /**
     * The channel on which the message originated
     */
    "channel": string;
    /**
     * Delivery status of the Communication to this recipient
     */
    "deliveryStatus"?: string;
    constructor(payload: any);
}
/**
 * Request payload for retrieving profile memories with advanced filtering and semantic search.
 */
export declare class MemoryRetrievalRequest {
    /**
     * A unique identifier for the conversation using Twilio Type ID (TTID) format.
     */
    "conversationId"?: string;
    /**
     * Hybrid search query for finding relevant memories. Omit to use query expansion to generate query from previous 10 communications in conversation.
     */
    "query"?: string;
    /**
     * Start date for filtering memories (inclusive).
     */
    "beginDate"?: Date;
    /**
     * End date for filtering memories (exclusive).
     */
    "endDate"?: Date;
    /**
     * Maximum number of conversational session memories to return. If omitted or set to 0, no session memories will be fetched.
     */
    "communicationsLimit"?: number;
    /**
     * Maximum number of observation memories to return. If omitted, defaults to 20. If set to 0, no observation memories will be fetched.
     */
    "observationsLimit"?: number;
    /**
     * Maximum number of summary memories to return. If omitted, defaults to 5. If set to 0, no summary memories will be fetched.
     */
    "summariesLimit"?: number;
    /**
     * Minimum relevance score threshold for observations and summaries to be returned. Only memories with a relevance score greater than or equal to this threshold will be included in the response. This threshold only applies when results are ranked by relevance. When results are returned in most-recent order, this field has no effect.
     */
    "relevanceThreshold"?: number;
    constructor(payload: any);
}
/**
 * Metadata about the retrieval operation.
 */
export declare class MemoryRetrievalResponseMeta {
    /**
     * Query execution time in milliseconds.
     */
    "queryTime": number;
    constructor(payload: any);
}
export declare class Participant {
    /**
     * Participant identifier.
     */
    "id": string;
    /**
     * Participant display name
     */
    "name": string;
    "type"?: ParticipantType;
    /**
     * The canonical profile ID.
     */
    "profileId"?: string;
    /**
     * Address of the Participant (e.g., phone number, email address)
     */
    "address": string;
    /**
     * The channel on which the message originated
     */
    "channel": string;
    constructor(payload: any);
}
/**
 * Type of Participant in the Conversation
 */
export type ParticipantType = "HUMAN_AGENT" | "CUSTOMER" | "AI_AGENT" | "AGENT" | "UNKNOWN";
/**
 * A transient and mutable observation memory associated with a profile.
 */
export declare class RecallObservationInfo {
    /**
     * The main content of the observation.
     */
    "content": string;
    /**
     * The timestamp when the observation originally occurred.
     */
    "occurredAt": Date;
    /**
     * The source system that generated this observation. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters.
     */
    "source": string;
    /**
     * Array of conversation IDs associated with this observation.
     */
    "conversationIds"?: Array<string>;
    /**
     * A unique identifier for the observation using Twilio Type ID (TTID) format.
     */
    "id": string;
    /**
     * The timestamp when the observation was created.
     */
    "createdAt": Date;
    /**
     * The timestamp when the observation was last updated.
     */
    "updatedAt": Date;
    /**
     * The relevance score of the observation in relation to the query. Higher values indicate greater relevance. This field is omitted when results are returned in most-recent order. This may occur when no query is provided and one cannot be inferred from the conversation context, or when the system defaults to chronological retrieval to ensure high availability.
     */
    "score"?: number;
    constructor(payload: any);
}
/**
 * A summary memory derived from conversations.
 */
export declare class RecallSummaryInfo {
    /**
     * The source system that generated the summary. Allows letters, numbers, spaces, and URL-safe symbols. Excludes URL-unsafe characters like quotes, angle brackets, and control characters.
     */
    "source"?: string;
    /**
     * The main content of the summary.
     */
    "content": string;
    /**
     * The timestamp when the summary was originally created.
     */
    "occurredAt": Date;
    /**
     * A unique identifier for the conversation using Twilio Type ID (TTID) format.
     */
    "conversationId": string;
    /**
     * A unique identifier for the summary using Twilio Type ID (TTID) format.
     */
    "id": string;
    /**
     * The timestamp when the summary was created.
     */
    "createdAt": Date;
    /**
     * The timestamp when the summary was last updated.
     */
    "updatedAt": Date;
    /**
     * The relevance score of the summary in relation to the query. Higher values indicate greater relevance. This field is omitted when results are returned in most-recent order. This may occur when no query is provided and one cannot be inferred from the conversation context, or when the system defaults to chronological retrieval to ensure high availability.
     */
    "score"?: number;
    constructor(payload: any);
}
/**
 * Options to pass to create a RecallInstance
 */
export interface RecallListInstanceCreateOptions {
    /**  */
    memoryRetrievalRequest: MemoryRetrievalRequest;
    /** Compression algorithms supported by the client (e.g., gzip, deflate, br) */
    acceptEncoding?: string;
    /** Compression algorithm used for the request body (e.g., gzip, deflate, br) */
    contentEncoding?: "gzip" | "deflate" | "br" | "compress";
}
export interface RecallSolution {
    storeId: string;
    profileId: string;
}
export interface RecallListInstance {
    _version: V1;
    _solution: RecallSolution;
    _uri: string;
    /**
     * Create a RecallInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed RecallInstance
     */
    create(params: MemoryRetrievalRequest, headers?: any, callback?: (error: Error | null, item?: RecallInstance) => any): Promise<RecallInstance>;
    /**
     * Create a RecallInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed RecallInstance with HTTP metadata
     */
    createWithHttpInfo(params: MemoryRetrievalRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<RecallInstance>) => any): Promise<ApiResponse<RecallInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function RecallListInstance(version: V1, storeId: string, profileId: string): RecallListInstance;
interface RecallResource {
    observations: Array<RecallObservationInfo>;
    summaries: Array<RecallSummaryInfo>;
    communications: Array<Communication>;
    meta: MemoryRetrievalResponseMeta;
}
/**
 * Response containing retrieved profile memories organized by type.
 */
export declare class RecallInstance {
    protected _version: V1;
    constructor(_version: V1, _payload: RecallResource, storeId: string, profileId: string);
    /**
     * Array of observation memories.
     */
    observations: Array<RecallObservationInfo>;
    /**
     * Array of summary memories derived from observations at the end of conversations.
     */
    summaries: Array<RecallSummaryInfo>;
    /**
     * Array of recent communication context.
     */
    communications: Array<Communication>;
    meta: MemoryRetrievalResponseMeta;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        observations: RecallObservationInfo[];
        summaries: RecallSummaryInfo[];
        communications: Communication[];
        meta: MemoryRetrievalResponseMeta;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
