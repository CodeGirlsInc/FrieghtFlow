import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../base/Page";
import Response from "../../../../http/response";
import Versionless from "../../Versionless";
import { ApiResponse } from "../../../../base/ApiResponse";
/**
 * Email address list of the user. Primary email must be defined if there are more than 1 email. Primary email must match the username.
 */
export declare class ScimEmailAddress {
    /**
     * Indicates if this email address is the primary one
     */
    "primary"?: boolean;
    /**
     * The actual email address value
     */
    "value"?: string;
    /**
     * The type of email address (e.g., work, home, etc.)
     */
    "type"?: string;
    constructor(payload: any);
}
/**
 * Meta
 */
export declare class ScimMeta {
    /**
     * Indicates the type of the resource
     */
    "resourceType"?: string;
    /**
     * The date and time when the resource was created in the system
     */
    "created"?: Date;
    /**
     * The date and time when the resource was last modified
     */
    "lastModified"?: Date;
    /**
     * A version identifier for the resource. This can be used to manage resource versioning and concurrency control.
     */
    "version"?: string;
    constructor(payload: any);
}
/**
 * User\'s name
 */
export declare class ScimName {
    /**
     * The user\'s first or given name
     */
    "givenName"?: string;
    /**
     * The user\'s last or family name
     */
    "familyName"?: string;
    constructor(payload: any);
}
export declare class ScimPatchOperation {
    /**
     * The operation to perform
     */
    "op"?: string;
    "path"?: string;
    "value"?: Record<string, object>;
    constructor(payload: any);
}
export declare class ScimPatchRequest {
    "schemas"?: Array<string>;
    "operations"?: Array<ScimPatchOperation>;
    constructor(payload: any);
}
export declare class ScimUser {
    /**
     * Unique Twilio user sid
     */
    "id"?: string;
    /**
     * External unique resource id defined by provisioning client
     */
    "externalId"?: string;
    /**
     * Unique username, MUST be same as primary email address
     */
    "userName": string;
    /**
     * User friendly display name
     */
    "displayName"?: string;
    "name"?: ScimName;
    /**
     * Email address list of the user. Primary email must be defined if there are more than 1 email. Primary email must match the username.
     */
    "emails"?: Array<ScimEmailAddress>;
    /**
     * Indicates whether the user is active
     */
    "active"?: boolean;
    /**
     * User\'s locale
     */
    "locale"?: string;
    /**
     * User\'s time zone
     */
    "timezone"?: string;
    /**
     * An array of URIs that indicate the schemas supported for this user resource
     */
    "schemas"?: Array<string>;
    "meta"?: ScimMeta;
    /**
     * A human-readable description of the error
     */
    "detail"?: string;
    /**
     * A scimType error code as defined in RFC7644
     */
    "scimType"?: string;
    /**
     * Http status code
     */
    "status"?: string;
    /**
     * Twilio-specific error code
     */
    "code"?: number;
    /**
     * Link to Error Code References
     */
    "moreInfo"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to patch a UserInstance
 */
export interface UserContextPatchOptions {
    /**  */
    scimPatchRequest: ScimPatchRequest;
    /**  */
    ifMatch?: string;
}
/**
 * Options to pass to update a UserInstance
 */
export interface UserContextUpdateOptions {
    /**  */
    scimUser: ScimUser;
    /**  */
    ifMatch?: string;
}
/**
 * Options to pass to create a UserInstance
 */
export interface UserListInstanceCreateOptions {
    /**  */
    scimUser: ScimUser;
}
/**
 * Options to pass to each
 */
export interface UserListInstanceEachOptions {
    /**  */
    filter?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: UserInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface UserListInstanceOptions {
    /**  */
    filter?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface UserListInstancePageOptions {
    /**  */
    filter?: string;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface UserContext {
    /**
     * Remove a UserInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a UserInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a UserInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance
     */
    fetch(callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    /**
     * Fetch a UserInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    /**
     * Patch a UserInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance
     */
    patch(params: ScimPatchRequest, headers?: any, callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    /**
     * Patch a UserInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance with HTTP metadata
     */
    patchWithHttpInfo(params: ScimPatchRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    /**
     * Update a UserInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance
     */
    update(params: ScimUser, headers?: any, callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    /**
     * Update a UserInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance with HTTP metadata
     */
    updateWithHttpInfo(params: ScimUser, headers?: any, callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface UserContextSolution {
    organizationSid: string;
    id: string;
}
export declare class UserContextImpl implements UserContext {
    protected _version: Versionless;
    protected _solution: UserContextSolution;
    protected _uri: string;
    constructor(_version: Versionless, organizationSid: string, id: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    patch(params: ScimPatchRequest, headers?: any, callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    patchWithHttpInfo(params: ScimPatchRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    update(params: ScimUser, headers?: any, callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    updateWithHttpInfo(params: ScimUser, headers?: any, callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): UserContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface UserPayload extends TwilioResponsePayload {
    Resources: UserResource[];
}
interface UserResource {
    id: string;
    externalId: string;
    userName: string;
    displayName: string;
    name: ScimName;
    emails: Array<ScimEmailAddress>;
    active: boolean;
    locale: string;
    timezone: string;
    schemas: Array<string>;
    meta: ScimMeta;
    detail: string;
    scimType: string;
    status: string;
    code: number;
    moreInfo: string;
}
export declare class UserInstance {
    protected _version: Versionless;
    protected _solution: UserContextSolution;
    protected _context?: UserContext;
    constructor(_version: Versionless, payload: UserResource, organizationSid: string, id?: string);
    /**
     * Unique Twilio user sid
     */
    id: string;
    /**
     * External unique resource id defined by provisioning client
     */
    externalId: string;
    /**
     * Unique username, MUST be same as primary email address
     */
    userName: string;
    /**
     * User friendly display name
     */
    displayName: string;
    name: ScimName;
    /**
     * Email address list of the user. Primary email must be defined if there are more than 1 email. Primary email must match the username.
     */
    emails: Array<ScimEmailAddress>;
    /**
     * Indicates whether the user is active
     */
    active: boolean;
    /**
     * User\'s locale
     */
    locale: string;
    /**
     * User\'s time zone
     */
    timezone: string;
    /**
     * An array of URIs that indicate the schemas supported for this user resource
     */
    schemas: Array<string>;
    meta: ScimMeta;
    /**
     * A human-readable description of the error
     */
    detail: string;
    /**
     * A scimType error code as defined in RFC7644
     */
    scimType: string;
    /**
     * Http status code
     */
    status: string;
    /**
     * Twilio-specific error code
     */
    code: number;
    /**
     * Link to Error Code References
     */
    moreInfo: string;
    private get _proxy();
    /**
     * Remove a UserInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a UserInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a UserInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance
     */
    fetch(callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    /**
     * Fetch a UserInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    /**
     * Patch a UserInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance
     */
    patch(params: ScimPatchRequest, headers?: any, callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    /**
     * Patch a UserInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance with HTTP metadata
     */
    patchWithHttpInfo(params: ScimPatchRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    /**
     * Update a UserInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance
     */
    update(params: ScimUser, headers?: any, callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    /**
     * Update a UserInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance with HTTP metadata
     */
    updateWithHttpInfo(params: ScimUser, headers?: any, callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        externalId: string;
        userName: string;
        displayName: string;
        name: ScimName;
        emails: ScimEmailAddress[];
        active: boolean;
        locale: string;
        timezone: string;
        schemas: string[];
        meta: ScimMeta;
        detail: string;
        scimType: string;
        status: string;
        code: number;
        moreInfo: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface UserSolution {
    organizationSid: string;
}
export interface UserListInstance {
    _version: Versionless;
    _solution: UserSolution;
    _uri: string;
    (id: string): UserContext;
    get(id: string): UserContext;
    /**
     * Create a UserInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance
     */
    create(params: ScimUser, headers?: any, callback?: (error: Error | null, item?: UserInstance) => any): Promise<UserInstance>;
    /**
     * Create a UserInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed UserInstance with HTTP metadata
     */
    createWithHttpInfo(params: ScimUser, headers?: any, callback?: (error: Error | null, item?: ApiResponse<UserInstance>) => any): Promise<ApiResponse<UserInstance>>;
    /**
     * Streams UserInstance records from the API.
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
     * @param { UserListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: UserInstance, done: (err?: Error) => void) => void): void;
    each(params: UserListInstanceEachOptions, callback?: (item: UserInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams UserInstance records from the API with HTTP metadata captured per page.
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
     * @param { UserListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: UserInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: UserListInstanceEachOptions, callback?: (item: UserInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of UserInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: UserPage) => any): Promise<UserPage>;
    /**
     * Retrieve a single target page of UserInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<UserPage>) => any): Promise<ApiResponse<UserPage>>;
    /**
     * Lists UserInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { UserListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: UserInstance[]) => any): Promise<UserInstance[]>;
    list(params: UserListInstanceOptions, callback?: (error: Error | null, items: UserInstance[]) => any): Promise<UserInstance[]>;
    /**
     * Lists UserInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { UserListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<UserInstance[]>) => any): Promise<ApiResponse<UserInstance[]>>;
    listWithHttpInfo(params: UserListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<UserInstance[]>) => any): Promise<ApiResponse<UserInstance[]>>;
    /**
     * Retrieve a single page of UserInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { UserListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: UserPage) => any): Promise<UserPage>;
    page(params: UserListInstancePageOptions, callback?: (error: Error | null, items: UserPage) => any): Promise<UserPage>;
    /**
     * Retrieve a single page of UserInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { UserListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<UserPage>) => any): Promise<ApiResponse<UserPage>>;
    pageWithHttpInfo(params: UserListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<UserPage>) => any): Promise<ApiResponse<UserPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function UserListInstance(version: Versionless, organizationSid: string): UserListInstance;
export declare class UserPage extends Page<Versionless, UserPayload, UserResource, UserInstance> {
    /**
     * Initialize the UserPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: Versionless, response: Response<string>, solution: UserSolution);
    /**
     * Build an instance of UserInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: UserResource): UserInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
