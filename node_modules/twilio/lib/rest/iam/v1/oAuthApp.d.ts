import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class IamV1AccountVendorOauthAppCreateRequest {
    "type"?: string;
    "friendlyName"?: string;
    "ownerSid"?: string | null;
    "description"?: string;
    "clientSid"?: string | null;
    "policy"?: IamV1OrganizationVendoroauthappPolicy;
    "accessTokenTtl"?: number;
    constructor(payload: any);
}
export declare class IamV1AccountVendorOauthAppUpdateRequest {
    "type"?: string | null;
    "friendlyName"?: string | null;
    "description"?: string | null;
    "policy"?: IamV1OrganizationVendorOauthAppUpdateRequestPolicy | null;
    "accessTokenTtl"?: number | null;
    constructor(payload: any);
}
export declare class IamV1OrganizationVendorOauthAppUpdateRequestPolicy {
    /**
     * Set of permissions explicitly allowed
     */
    "allow"?: Array<string>;
    /**
     * Set of permissions explicitly denied
     */
    "deny"?: Array<string>;
    constructor(payload: any);
}
export declare class IamV1OrganizationVendoroauthappPolicy {
    /**
     * Set of permissions explicitly allowed
     */
    "allow"?: Array<string>;
    /**
     * Set of permissions explicitly denied
     */
    "deny"?: Array<string>;
    constructor(payload: any);
}
/**
 * Options to pass to update a OAuthAppInstance
 */
export interface OAuthAppContextUpdateOptions {
    /**  */
    iamV1AccountVendorOauthAppUpdateRequest: IamV1AccountVendorOauthAppUpdateRequest;
}
/**
 * Options to pass to create a OAuthAppInstance
 */
export interface OAuthAppListInstanceCreateOptions {
    /**  */
    iamV1AccountVendorOauthAppCreateRequest: IamV1AccountVendorOauthAppCreateRequest;
}
export interface OAuthAppContext {
    /**
     * Remove a OAuthAppInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a OAuthAppInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Update a OAuthAppInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OAuthAppInstance
     */
    update(params: IamV1AccountVendorOauthAppUpdateRequest, headers?: any, callback?: (error: Error | null, item?: OAuthAppInstance) => any): Promise<OAuthAppInstance>;
    /**
     * Update a OAuthAppInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OAuthAppInstance with HTTP metadata
     */
    updateWithHttpInfo(params: IamV1AccountVendorOauthAppUpdateRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<OAuthAppInstance>) => any): Promise<ApiResponse<OAuthAppInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface OAuthAppContextSolution {
    sid: string;
}
export declare class OAuthAppContextImpl implements OAuthAppContext {
    protected _version: V1;
    protected _solution: OAuthAppContextSolution;
    protected _uri: string;
    constructor(_version: V1, sid: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    update(params: IamV1AccountVendorOauthAppUpdateRequest, headers?: any, callback?: (error: Error | null, item?: OAuthAppInstance) => any): Promise<OAuthAppInstance>;
    updateWithHttpInfo(params: IamV1AccountVendorOauthAppUpdateRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<OAuthAppInstance>) => any): Promise<ApiResponse<OAuthAppInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): OAuthAppContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface OAuthAppResource {
    type: string;
    sid: string;
    friendly_name: string;
    description: string;
    date_created: Date;
    created_by: string;
    secret: string;
    status: string;
    policy: IamV1OrganizationVendoroauthappPolicy;
    access_token_ttl: number;
    code: number;
    message: string;
    more_info: string;
}
export declare class OAuthAppInstance {
    protected _version: V1;
    protected _solution: OAuthAppContextSolution;
    protected _context?: OAuthAppContext;
    constructor(_version: V1, payload: OAuthAppResource, sid?: string);
    type: string;
    sid: string;
    friendlyName: string;
    description: string;
    dateCreated: Date;
    createdBy: string;
    secret: string;
    status: string;
    policy: IamV1OrganizationVendoroauthappPolicy;
    accessTokenTtl: number;
    /**
     * Twilio-specific error code
     */
    code: number;
    /**
     * Error message
     */
    message: string;
    /**
     * Link to Error Code References
     */
    moreInfo: string;
    private get _proxy();
    /**
     * Remove a OAuthAppInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a OAuthAppInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Update a OAuthAppInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OAuthAppInstance
     */
    update(params: IamV1AccountVendorOauthAppUpdateRequest, headers?: any, callback?: (error: Error | null, item?: OAuthAppInstance) => any): Promise<OAuthAppInstance>;
    /**
     * Update a OAuthAppInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OAuthAppInstance with HTTP metadata
     */
    updateWithHttpInfo(params: IamV1AccountVendorOauthAppUpdateRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<OAuthAppInstance>) => any): Promise<ApiResponse<OAuthAppInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        type: string;
        sid: string;
        friendlyName: string;
        description: string;
        dateCreated: Date;
        createdBy: string;
        secret: string;
        status: string;
        policy: IamV1OrganizationVendoroauthappPolicy;
        accessTokenTtl: number;
        code: number;
        message: string;
        moreInfo: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface OAuthAppSolution {
}
export interface OAuthAppListInstance {
    _version: V1;
    _solution: OAuthAppSolution;
    _uri: string;
    (sid: string): OAuthAppContext;
    get(sid: string): OAuthAppContext;
    /**
     * Create a OAuthAppInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OAuthAppInstance
     */
    create(params: IamV1AccountVendorOauthAppCreateRequest, headers?: any, callback?: (error: Error | null, item?: OAuthAppInstance) => any): Promise<OAuthAppInstance>;
    /**
     * Create a OAuthAppInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OAuthAppInstance with HTTP metadata
     */
    createWithHttpInfo(params: IamV1AccountVendorOauthAppCreateRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<OAuthAppInstance>) => any): Promise<ApiResponse<OAuthAppInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function OAuthAppListInstance(version: V1): OAuthAppListInstance;
export {};
