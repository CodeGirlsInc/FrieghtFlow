import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class NumbersV1CreateEmbeddedSessionRequest {
    /**
     * Theme ID for the Compliance Embeddable UI. Overrides the theme set during registration creation.
     */
    "themeSetId"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to create a EmbeddedSessionInstance
 */
export interface EmbeddedSessionListInstanceCreateOptions {
    /**  */
    numbersV1CreateEmbeddedSessionRequest: NumbersV1CreateEmbeddedSessionRequest;
}
export interface EmbeddedSessionSolution {
    bundleSid: string;
}
export interface EmbeddedSessionListInstance {
    _version: V1;
    _solution: EmbeddedSessionSolution;
    _uri: string;
    /**
     * Create a EmbeddedSessionInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed EmbeddedSessionInstance
     */
    create(params: NumbersV1CreateEmbeddedSessionRequest, headers?: any, callback?: (error: Error | null, item?: EmbeddedSessionInstance) => any): Promise<EmbeddedSessionInstance>;
    /**
     * Create a EmbeddedSessionInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed EmbeddedSessionInstance with HTTP metadata
     */
    createWithHttpInfo(params: NumbersV1CreateEmbeddedSessionRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<EmbeddedSessionInstance>) => any): Promise<ApiResponse<EmbeddedSessionInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function EmbeddedSessionListInstance(version: V1, bundleSid: string): EmbeddedSessionListInstance;
interface EmbeddedSessionResource {
    id: string;
    sessionId: string;
    sessionToken: string;
}
export declare class EmbeddedSessionInstance {
    protected _version: V1;
    constructor(_version: V1, payload: EmbeddedSessionResource, bundleSid?: string);
    /**
     * Registration identifier (BU-prefixed).
     */
    id: string;
    /**
     * Session ID for the compliance embeddable.
     */
    sessionId: string;
    /**
     * Ephemeral session token for the compliance embeddable.
     */
    sessionToken: string;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        sessionId: string;
        sessionToken: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
