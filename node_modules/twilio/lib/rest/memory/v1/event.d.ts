import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class CommunicationLifecycleEventRecipient {
    /**
     * The recipient\'s address. Must be a valid address matching the channel type such as E.164 format for phone numbers.
     */
    "address": string;
    /**
     * The unique identifier for the recipient participant.
     */
    "participantId": string;
    constructor(payload: any);
}
export declare class CommunicationLifecycleEventSender {
    /**
     * The sender\'s address. Must be a valid address matching the channel type such as E.164 format for phone numbers.
     */
    "address": string;
    /**
     * The unique identifier for the sender participant.
     */
    "participantId": string;
    constructor(payload: any);
}
/**
 * Request body for adding events to a specific profile. This request can contain multiple events.
 */
export declare class ProfileEventRequest {
    /**
     * The type of event being sent.
     */
    "type": string;
    "events": Array<ProfileEventRequestEvents>;
    constructor(payload: any);
}
export declare class ProfileEventRequestEvents {
    /**
     * The time the event occurred in ISO8601 format with millisecond resolution. Defaults to received time if not provided.
     */
    "timestamp": Date;
    /**
     * The lifecycle event type of the communication.
     */
    "lifecycle": string;
    /**
     * The unique identifier for the conversation.
     */
    "conversationId": string;
    /**
     * The unique identifier for the communication.
     */
    "communicationId"?: string;
    /**
     * The communication channel type.
     */
    "communicationType": string;
    /**
     * The lifecycle status of the communication.
     */
    "communicationStatus"?: string;
    /**
     * The direction of the communication.
     */
    "direction"?: string;
    "sender"?: CommunicationLifecycleEventSender;
    "recipient"?: CommunicationLifecycleEventRecipient;
    /**
     * Error code for FAILED communication status.
     */
    "errorCode"?: string;
    /**
     * Error message for FAILED communication status.
     */
    "errorMessage"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to create a EventInstance
 */
export interface EventListInstanceCreateOptions {
    /**  */
    profileEventRequest?: ProfileEventRequest;
}
export interface EventSolution {
    storeId: string;
    profileId: string;
}
export interface EventListInstance {
    _version: V1;
    _solution: EventSolution;
    _uri: string;
    /**
     * Create a EventInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed EventInstance
     */
    create(callback?: (error: Error | null, item?: EventInstance) => any): Promise<EventInstance>;
    /**
     * Create a EventInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed EventInstance
     */
    create(params: ProfileEventRequest, headers?: any, callback?: (error: Error | null, item?: EventInstance) => any): Promise<EventInstance>;
    /**
     * Create a EventInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed EventInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<EventInstance>) => any): Promise<ApiResponse<EventInstance>>;
    /**
     * Create a EventInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed EventInstance with HTTP metadata
     */
    createWithHttpInfo(params: ProfileEventRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<EventInstance>) => any): Promise<ApiResponse<EventInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function EventListInstance(version: V1, storeId: string, profileId: string): EventListInstance;
interface EventResource {
    message: string;
}
export declare class EventInstance {
    protected _version: V1;
    constructor(_version: V1, _payload: EventResource, storeId: string, profileId: string);
    message: string;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        message: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
