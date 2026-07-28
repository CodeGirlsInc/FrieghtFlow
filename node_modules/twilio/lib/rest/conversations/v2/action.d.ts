import { inspect, InspectOptions } from "util";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Content for a SEND_MESSAGE action.
 */
export declare class ConversationsV2SendMessageContent {
    /**
     * Plain text message body.
     */
    "text"?: string;
    /**
     * Content template ID (HX... format). When provided, the template is rendered with the variables map and sent to the recipient.
     */
    "contentId"?: string;
    /**
     * Variables to substitute into the content template.
     */
    "variables"?: {
        [key: string]: string;
    };
    /**
     * URLs of media attachments to include with the message.
     */
    "mediaUrls"?: Array<string>;
    constructor(payload: any);
}
/**
 * Identifies a participant for an Action. Supports three resolution modes: 1. participantId + channel: Resolves address from participant\'s registered addresses 2. participantId only: Resolves when participant has exactly one address 3. address + channel: Uses explicit address
 */
export declare class ConversationsV2SendMessageParticipant {
    /**
     * Participant ID to resolve address from.
     */
    "participantId"?: string;
    /**
     * Explicit address formatted according to channel type.
     */
    "address"?: string;
    /**
     * Channel type for address resolution.
     */
    "channel"?: string;
    constructor(payload: any);
}
export declare class ConversationsV2SendMessagePayload {
    "from": ConversationsV2SendMessageParticipant;
    /**
     * The recipients of this action.
     */
    "to": Array<ConversationsV2SendMessageParticipant>;
    "content": ConversationsV2SendMessageContent;
    /**
     * Channel-specific parameters forwarded as-is to the downstream sending service. Allows passing backend-specific fields without requiring API changes.
     */
    "channelSettings"?: {
        [key: string]: any;
    };
    constructor(payload: any);
}
export declare class CreateConversationActionRequest {
    /**
     * Action type discriminator. Accepted values: SEND_MESSAGE.
     */
    "type": string;
    "payload": ConversationsV2SendMessagePayload;
    constructor(payload: any);
}
/**
 * Options to pass to create a ActionInstance
 */
export interface ActionListInstanceCreateOptions {
    /** The action to perform. */
    createConversationActionRequest: CreateConversationActionRequest;
}
export interface ActionContext {
    /**
     * Fetch a ActionInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ActionInstance
     */
    fetch(callback?: (error: Error | null, item?: ActionInstance) => any): Promise<ActionInstance>;
    /**
     * Fetch a ActionInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ActionInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ActionInstance>) => any): Promise<ApiResponse<ActionInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ActionContextSolution {
    conversationId: string;
    actionId: string;
}
export declare class ActionContextImpl implements ActionContext {
    protected _version: V2;
    protected _solution: ActionContextSolution;
    protected _uri: string;
    constructor(_version: V2, conversationId: string, actionId: string);
    fetch(callback?: (error: Error | null, item?: ActionInstance) => any): Promise<ActionInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ActionInstance>) => any): Promise<ApiResponse<ActionInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ActionContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface ActionResource {
    id: string;
    type: string;
    status: string;
    conversationId: string;
    related: {
        [key: string]: string;
    };
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;
}
export declare class ActionInstance {
    protected _version: V2;
    protected _solution: ActionContextSolution;
    protected _context?: ActionContext;
    constructor(_version: V2, _payload: ActionResource, conversationId: string, actionId?: string);
    /**
     * Unique identifier for this Action.
     */
    id: string;
    /**
     * The type of action. Accepted values: SEND_MESSAGE.
     */
    type: string;
    /**
     * Current status of the Action. - PENDING: Action accepted, awaiting downstream confirmation - COMPLETED: Downstream backend confirmed the action - FAILED: Downstream backend reported a failure
     */
    status: string;
    /**
     * The conversation this action belongs to.
     */
    conversationId: string;
    /**
     * Named identifiers from downstream. For SEND_MESSAGE: - messageSid: The downstream message SID (present when PENDING or COMPLETED) - communicationId: The Communication ID (present when COMPLETED)
     */
    related: {
        [key: string]: string;
    };
    /**
     * Timestamp when the action was created.
     */
    createdAt: Date;
    /**
     * Timestamp when the action was last updated.
     */
    updatedAt: Date;
    /**
     * Timestamp when the action reached a terminal status.
     */
    completedAt: Date;
    private get _proxy();
    /**
     * Fetch a ActionInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ActionInstance
     */
    fetch(callback?: (error: Error | null, item?: ActionInstance) => any): Promise<ActionInstance>;
    /**
     * Fetch a ActionInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ActionInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ActionInstance>) => any): Promise<ApiResponse<ActionInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        type: string;
        status: string;
        conversationId: string;
        related: {
            [key: string]: string;
        };
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ActionSolution {
    conversationId: string;
}
export interface ActionListInstance {
    _version: V2;
    _solution: ActionSolution;
    _uri: string;
    (actionId: string): ActionContext;
    get(actionId: string): ActionContext;
    /**
     * Create a ActionInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ActionInstance
     */
    create(params: CreateConversationActionRequest, headers?: any, callback?: (error: Error | null, item?: ActionInstance) => any): Promise<ActionInstance>;
    /**
     * Create a ActionInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ActionInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateConversationActionRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ActionInstance>) => any): Promise<ApiResponse<ActionInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ActionListInstance(version: V2, conversationId: string): ActionListInstance;
export {};
