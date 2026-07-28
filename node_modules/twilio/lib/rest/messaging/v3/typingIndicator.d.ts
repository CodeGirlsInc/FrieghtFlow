import { inspect, InspectOptions } from "util";
import V3 from "../V3";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Request body for sending a typing indicator. The schema varies by channel. Use the `channel` field to determine which properties are required.
 */
export declare class TypingIndicatorRequest {
    /**
     * The messaging channel. Must be \"APPLE\".
     */
    "channel": string;
    /**
     * The SID of a recent inbound message from the recipient. Must be an SM or MM SID format.
     */
    "messageId": string;
    /**
     * The Apple Messages for Business identifier of the sender (business).
     */
    "from": string;
    /**
     * The Apple Messages for Business identifier of the recipient (customer).
     */
    "to": string;
    /**
     * The type of typing event. \"START\" indicates the agent began typing, \"END\" indicates the agent stopped typing. Defaults to \"START\".
     */
    "event"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to create a TypingIndicatorInstance
 */
export interface TypingIndicatorListInstanceCreateOptions {
    /**  */
    typingIndicatorRequest: TypingIndicatorRequest;
}
export interface TypingIndicatorSolution {
}
export interface TypingIndicatorListInstance {
    _version: V3;
    _solution: TypingIndicatorSolution;
    _uri: string;
    /**
     * Create a TypingIndicatorInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TypingIndicatorInstance
     */
    create(params: TypingIndicatorRequest, headers?: any, callback?: (error: Error | null, item?: TypingIndicatorInstance) => any): Promise<TypingIndicatorInstance>;
    /**
     * Create a TypingIndicatorInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TypingIndicatorInstance with HTTP metadata
     */
    createWithHttpInfo(params: TypingIndicatorRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<TypingIndicatorInstance>) => any): Promise<ApiResponse<TypingIndicatorInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function TypingIndicatorListInstance(version: V3): TypingIndicatorListInstance;
interface TypingIndicatorResource {
    success: boolean;
}
export declare class TypingIndicatorInstance {
    protected _version: V3;
    constructor(_version: V3, payload: TypingIndicatorResource);
    /**
     * Indicates if the typing indicator was sent successfully.
     */
    success: boolean;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        success: boolean;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
