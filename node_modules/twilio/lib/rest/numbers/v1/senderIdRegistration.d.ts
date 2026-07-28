import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class NumbersV1CreateEmbeddedRegistrationRequest {
    /**
     * The regulation for this registration.
     */
    "regulationId": string;
    /**
     * The regulation version.
     */
    "regulationVersion": number;
    /**
     * Human-readable name for the registration.
     */
    "friendlyName": string;
    /**
     * Email address for registration status notifications.
     */
    "statusNotificationEmail"?: string;
    /**
     * The URL of this resource.
     */
    "statusCallbackUrl"?: string | null;
    /**
     * Additional comments about the registration.
     */
    "comments"?: string;
    /**
     * Theme ID for the Compliance Embeddable UI.
     */
    "themeSetId"?: string;
    /**
     * Registration data organized by section (alphanumericSender, business, useCase, authorizedRepresentative, officer, businessAddress).
     */
    "data": {
        [key: string]: any;
    };
    constructor(payload: any);
}
export declare class NumbersV1EmbeddedSession {
    /**
     * Session ID for the compliance embeddable.
     */
    "sessionId": string;
    /**
     * Ephemeral session token for the compliance embeddable.
     */
    "sessionToken": string;
    constructor(payload: any);
}
/**
 * Options to pass to create a SenderIdRegistrationInstance
 */
export interface SenderIdRegistrationListInstanceCreateOptions {
    /**  */
    numbersV1CreateEmbeddedRegistrationRequest: NumbersV1CreateEmbeddedRegistrationRequest;
}
export interface SenderIdRegistrationSolution {
}
export interface SenderIdRegistrationListInstance {
    _version: V1;
    _solution: SenderIdRegistrationSolution;
    _uri: string;
    /**
     * Create a SenderIdRegistrationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SenderIdRegistrationInstance
     */
    create(params: NumbersV1CreateEmbeddedRegistrationRequest, headers?: any, callback?: (error: Error | null, item?: SenderIdRegistrationInstance) => any): Promise<SenderIdRegistrationInstance>;
    /**
     * Create a SenderIdRegistrationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SenderIdRegistrationInstance with HTTP metadata
     */
    createWithHttpInfo(params: NumbersV1CreateEmbeddedRegistrationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<SenderIdRegistrationInstance>) => any): Promise<ApiResponse<SenderIdRegistrationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function SenderIdRegistrationListInstance(version: V1): SenderIdRegistrationListInstance;
interface SenderIdRegistrationResource {
    id: string;
    regulationId: string;
    regulationVersion: number;
    friendlyName: string;
    status: string;
    statusNotificationEmail: string;
    statusCallbackUrl: string;
    comments: string;
    embeddedSession: NumbersV1EmbeddedSession;
    data: {
        [key: string]: any;
    };
    dateCreated: Date;
    dateUpdated: Date;
}
export declare class SenderIdRegistrationInstance {
    protected _version: V1;
    constructor(_version: V1, payload: SenderIdRegistrationResource);
    /**
     * Registration identifier (BU-prefixed).
     */
    id: string;
    /**
     * The regulation ID for this registration.
     */
    regulationId: string;
    /**
     * The regulation version.
     */
    regulationVersion: number;
    /**
     * The friendly name provided in the request.
     */
    friendlyName: string;
    /**
     * Registration status. Always DRAFT on creation.
     */
    status: string;
    /**
     * Email address for status notifications.
     */
    statusNotificationEmail: string;
    /**
     * Callback URL for status webhooks.
     */
    statusCallbackUrl: string;
    /**
     * Additional comments.
     */
    comments: string;
    embeddedSession: NumbersV1EmbeddedSession;
    /**
     * Registration data echoed from the request.
     */
    data: {
        [key: string]: any;
    };
    /**
     * Timestamp of creation.
     */
    dateCreated: Date;
    /**
     * Timestamp of last update.
     */
    dateUpdated: Date;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        regulationId: string;
        regulationVersion: number;
        friendlyName: string;
        status: string;
        statusNotificationEmail: string;
        statusCallbackUrl: string;
        comments: string;
        embeddedSession: NumbersV1EmbeddedSession;
        data: {
            [key: string]: any;
        };
        dateCreated: Date;
        dateUpdated: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
