import { inspect, InspectOptions } from "util";
import V3 from "../V3";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class CreateV3TranscriptionsRequest {
    /**
     * The ID of the transcription configuration to use
     */
    "transcriptionConfigurationId": string;
    /**
     * Discriminator indicating the input source type
     */
    "inputSource"?: string;
    /**
     * The SID or TTID of the source audio to transcribe (e.g. a Twilio Recording SID). When provided, audioStartedAt is inferred from the recording\'s start time and does not need to be supplied by the caller.
     */
    "sourceId": string;
    /**
     * Participants in the conversation. If omitted or partially specified, defaults from the transcription configuration will be applied.
     */
    "participants"?: Array<VoiceV3TranscriptionParticipant>;
    /**
     * URL to the media file to transcribe
     */
    "mediaUrl": string;
    /**
     * The start time of the audio recording
     */
    "audioStartedAt"?: Date;
    constructor(payload: any);
}
export declare class VoiceV3TranscriptionParticipant {
    /**
     * The role of this participant in the conversation.
     */
    "type"?: string;
    /**
     * The phone number or identifier for this participant (E.164 format for phone numbers). Used to correlate this participant with their profile and conversation history.
     */
    "address"?: string;
    /**
     * User-defined name for this participant
     */
    "name"?: string;
    /**
     * One-based index of the audio channel in a multi-channel recording
     */
    "audioChannelIndex": number;
    constructor(payload: any);
}
export declare class VoiceV3TranscriptionResolvedConfiguration {
    /**
     * The engine used for transcription (Deepgram, Google, or auto)
     */
    "transcriptionEngine"?: string;
    /**
     * The speech model used for transcription (e.g., nova-2, nova-3, chirp_2)
     */
    "speechModel"?: string;
    /**
     * The language code for transcription
     */
    "language"?: string;
    "transcriptionStatusCallback"?: VoiceV3TranscriptionTranscriptionStatusCallback;
    /**
     * Maestro conversation configuration ID
     */
    "conversationConfigurationId"?: string | null;
    /**
     * Default participant configurations for the transcription
     */
    "participantDefaults"?: Array<VoiceV3TranscriptionResolvedConfigurationParticipantDefaults>;
    constructor(payload: any);
}
export declare class VoiceV3TranscriptionResolvedConfigurationParticipantDefaults {
    /**
     * One-based index of the audio channel
     */
    "audioChannelIndex": number;
    /**
     * The participant role type
     */
    "type": string;
    constructor(payload: any);
}
export declare class VoiceV3TranscriptionTranscription {
    /**
     * Unique identifier for a Transcription. This is also the transcriptionId returned in the LRO 202 response.
     */
    "id": string;
    /**
     * Twilio Account SID
     */
    "accountId": string;
    /**
     * The current status of the transcription operation
     */
    "status": string;
    /**
     * Unique identifier for a Transcription configuration.
     */
    "transcriptionConfigurationId": string;
    /**
     * The third party media URL
     */
    "mediaUrl"?: string | null;
    /**
     * The source ID (recording ID) - used for tracking only
     */
    "sourceId"?: string | null;
    /**
     * The call/recording start time. When the transcription was created using a sourceId, this value is inferred from the recording resource\'s start time. When created using a mediaUrl, this reflects the value supplied by the caller.
     */
    "audioStartedAt"?: Date;
    /**
     * Maestro conversation ID, populated once the transcription has been stored in Maestro.
     */
    "conversationId"?: string | null;
    /**
     * Array of participants in the conversation
     */
    "participants"?: Array<VoiceV3TranscriptionParticipant>;
    /**
     * Audio duration in seconds
     */
    "duration"?: number | null;
    "resolvedConfiguration"?: VoiceV3TranscriptionResolvedConfiguration;
    /**
     * When this transcript was created
     */
    "createdAt": Date;
    /**
     * When this transcript was last updated
     */
    "updatedAt": Date;
    /**
     * The URL of this resource
     */
    "url": string;
    constructor(payload: any);
}
export declare class VoiceV3TranscriptionTranscriptionStatusCallback {
    /**
     * The URL to call when transcription status changes
     */
    "url"?: string;
    /**
     * The HTTP method to use for the callback, currently only POST is supported
     */
    "method"?: string;
    /**
     * The transcription events that will trigger the callback
     */
    "events"?: Array<string> | null;
    constructor(payload: any);
}
/**
 * Options to pass to create a TranscriptionInstance
 */
export interface TranscriptionListInstanceCreateOptions {
    /**  */
    createV3TranscriptionsRequest: CreateV3TranscriptionsRequest;
    /** A unique key to ensure idempotency. We recommend using UUID v7. Requests with the same key within the idempotency window return the original response. */
    idempotencyKey?: string;
}
export interface TranscriptionContext {
    /**
     * Fetch a TranscriptionInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TranscriptionInstance
     */
    fetch(callback?: (error: Error | null, item?: TranscriptionInstance) => any): Promise<TranscriptionInstance>;
    /**
     * Fetch a TranscriptionInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TranscriptionInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TranscriptionInstance>) => any): Promise<ApiResponse<TranscriptionInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface TranscriptionContextSolution {
    transcriptionId: string;
}
export declare class TranscriptionContextImpl implements TranscriptionContext {
    protected _version: V3;
    protected _solution: TranscriptionContextSolution;
    protected _uri: string;
    constructor(_version: V3, transcriptionId: string);
    fetch(callback?: (error: Error | null, item?: TranscriptionInstance) => any): Promise<TranscriptionInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TranscriptionInstance>) => any): Promise<ApiResponse<TranscriptionInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): TranscriptionContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for CreateV3TranscriptionsRequest
 */
export interface CreateV3TranscriptionsRequest {
    transcriptionConfigurationId: string;
    inputSource?: string;
    sourceId: string;
    participants?: Array<VoiceV3TranscriptionParticipant>;
    mediaUrl: string;
    audioStartedAt?: Date;
}
/**
 * Nested model for VoiceV3TranscriptionParticipant
 */
export interface VoiceV3TranscriptionParticipant {
    type?: string;
    address?: string;
    name?: string;
    audioChannelIndex: number;
}
/**
 * Nested model for VoiceV3TranscriptionResolvedConfiguration
 */
export interface VoiceV3TranscriptionResolvedConfiguration {
    transcriptionEngine?: string;
    speechModel?: string;
    language?: string;
    transcriptionStatusCallback?: VoiceV3TranscriptionTranscriptionStatusCallback;
    conversationConfigurationId?: string;
    participantDefaults?: Array<VoiceV3TranscriptionResolvedConfigurationParticipantDefaults>;
}
/**
 * Nested model for VoiceV3TranscriptionResolvedConfigurationParticipantDefaults
 */
export interface VoiceV3TranscriptionResolvedConfigurationParticipantDefaults {
    audioChannelIndex: number;
    type: string;
}
/**
 * Nested model for VoiceV3TranscriptionTranscription
 */
export interface VoiceV3TranscriptionTranscription {
    id: string;
    accountId: string;
    status: string;
    transcriptionConfigurationId: string;
    mediaUrl?: string;
    sourceId?: string;
    audioStartedAt?: Date;
    conversationId?: string;
    participants?: Array<VoiceV3TranscriptionParticipant>;
    duration?: number;
    resolvedConfiguration?: VoiceV3TranscriptionResolvedConfiguration;
    createdAt: Date;
    updatedAt: Date;
    url: string;
}
/**
 * Nested model for VoiceV3TranscriptionTranscriptionStatusCallback
 */
export interface VoiceV3TranscriptionTranscriptionStatusCallback {
    url?: string;
    method?: string;
    events?: Array<string>;
}
/**
 * Response model for VoiceV3TranscriptionLongRunningOperation202Response operations
 */
interface VoiceV3TranscriptionLongRunningOperation202Response_ResponseResource {
    status: string;
    statusUrl: string;
    transcription: VoiceV3TranscriptionTranscription;
}
/**
 * Response model for VoiceV3TranscriptionLongRunningOperationResponse operations
 */
interface VoiceV3TranscriptionLongRunningOperationResponse_ResponseResource {
    operationId: string;
    status: string;
    statusUrl: string;
    transcription: VoiceV3TranscriptionTranscription;
}
/**
 * Union type for all possible response models
 */
type TranscriptionResource = VoiceV3TranscriptionLongRunningOperation202Response_ResponseResource | VoiceV3TranscriptionLongRunningOperationResponse_ResponseResource;
/**
 * Response envelope for long-running operations (202 Accepted pattern). Returned immediately on acceptance and on each status poll. Extensible to allow additional fields in future versions.
 */
export declare class TranscriptionInstance {
    protected _version: V3;
    protected _solution: TranscriptionContextSolution;
    protected _context?: TranscriptionContext;
    constructor(_version: V3, _payload: TranscriptionResource, transcriptionId?: string);
    /**
     * Current status of the long-running operation. PENDING: accepted but not yet started. RUNNING: currently in progress. COMPLETED: successfully completed. FAILED: failed and cannot be completed.
     */
    status?: string;
    /**
     * URI to poll for operation status. Mirrors the Location response header. Provided as a body field for programmatic access by JSON-parsing clients (RFC 9110 Section 15.3.3).
     */
    statusUrl?: string;
    transcription?: VoiceV3TranscriptionTranscription;
    /**
     * Unique identifier for the transcription operation.
     */
    operationId?: string;
    private get _proxy();
    /**
     * Fetch a TranscriptionInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TranscriptionInstance
     */
    fetch(callback?: (error: Error | null, item?: TranscriptionInstance) => any): Promise<TranscriptionInstance>;
    /**
     * Fetch a TranscriptionInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TranscriptionInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TranscriptionInstance>) => any): Promise<ApiResponse<TranscriptionInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        status: string;
        statusUrl: string;
        transcription: VoiceV3TranscriptionTranscription;
        operationId: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface TranscriptionSolution {
}
export interface TranscriptionListInstance {
    _version: V3;
    _solution: TranscriptionSolution;
    _uri: string;
    (transcriptionId: string): TranscriptionContext;
    get(transcriptionId: string): TranscriptionContext;
    /**
     * Create a TranscriptionInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TranscriptionInstance
     */
    create(params: CreateV3TranscriptionsRequest, headers?: any, callback?: (error: Error | null, item?: TranscriptionInstance) => any): Promise<TranscriptionInstance>;
    /**
     * Create a TranscriptionInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TranscriptionInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateV3TranscriptionsRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<TranscriptionInstance>) => any): Promise<ApiResponse<TranscriptionInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function TranscriptionListInstance(version: V3): TranscriptionListInstance;
export {};
