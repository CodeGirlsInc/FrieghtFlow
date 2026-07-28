import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
import { TrustProductsChannelEndpointAssignmentListInstance } from "./trustProducts/trustProductsChannelEndpointAssignment";
import { TrustProductsEntityAssignmentsListInstance } from "./trustProducts/trustProductsEntityAssignments";
import { TrustProductsEvaluationsListInstance } from "./trustProducts/trustProductsEvaluations";
/**
 * The verification status of the Trust Product resource.
 */
export type TrustProductsStatus = "draft" | "pending-review" | "in-review" | "twilio-rejected" | "twilio-approved";
/**
 * Options to pass to update a TrustProductsInstance
 */
export interface TrustProductsContextUpdateOptions {
    /**  */
    status?: TrustProductsStatus;
    /** The URL we call to inform your application of status changes. */
    statusCallback?: string;
    /** The string that you assigned to describe the resource. */
    friendlyName?: string;
    /** The email address that will receive updates when the Trust Product resource changes status. */
    email?: string;
}
/**
 * Options to pass to create a TrustProductsInstance
 */
export interface TrustProductsListInstanceCreateOptions {
    /** The string that you assigned to describe the resource. */
    friendlyName: string;
    /** The email address that will receive updates when the Trust Product resource changes status. */
    email: string;
    /** The unique string of a policy that is associated to the Trust Product resource. */
    policySid: string;
    /** The URL we call to inform your application of status changes. */
    statusCallback?: string;
}
/**
 * Options to pass to each
 */
export interface TrustProductsListInstanceEachOptions {
    /** The verification status of the Trust Product resource. */
    status?: TrustProductsStatus;
    /** The string that you assigned to describe the resource. */
    friendlyName?: string;
    /** The unique string of a policy that is associated to the Trust Product resource. */
    policySid?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: TrustProductsInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface TrustProductsListInstanceOptions {
    /** The verification status of the Trust Product resource. */
    status?: TrustProductsStatus;
    /** The string that you assigned to describe the resource. */
    friendlyName?: string;
    /** The unique string of a policy that is associated to the Trust Product resource. */
    policySid?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface TrustProductsListInstancePageOptions {
    /** The verification status of the Trust Product resource. */
    status?: TrustProductsStatus;
    /** The string that you assigned to describe the resource. */
    friendlyName?: string;
    /** The unique string of a policy that is associated to the Trust Product resource. */
    policySid?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface TrustProductsContext {
    trustProductsChannelEndpointAssignment: TrustProductsChannelEndpointAssignmentListInstance;
    trustProductsEntityAssignments: TrustProductsEntityAssignmentsListInstance;
    trustProductsEvaluations: TrustProductsEvaluationsListInstance;
    /**
     * Remove a TrustProductsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a TrustProductsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a TrustProductsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance
     */
    fetch(callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    /**
     * Fetch a TrustProductsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    /**
     * Update a TrustProductsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance
     */
    update(callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    /**
     * Update a TrustProductsInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance
     */
    update(params: TrustProductsContextUpdateOptions, callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    /**
     * Update a TrustProductsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    /**
     * Update a TrustProductsInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance with HTTP metadata
     */
    updateWithHttpInfo(params: TrustProductsContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface TrustProductsContextSolution {
    sid: string;
}
export declare class TrustProductsContextImpl implements TrustProductsContext {
    protected _version: V1;
    protected _solution: TrustProductsContextSolution;
    protected _uri: string;
    protected _trustProductsChannelEndpointAssignment?: TrustProductsChannelEndpointAssignmentListInstance;
    protected _trustProductsEntityAssignments?: TrustProductsEntityAssignmentsListInstance;
    protected _trustProductsEvaluations?: TrustProductsEvaluationsListInstance;
    constructor(_version: V1, sid: string);
    get trustProductsChannelEndpointAssignment(): TrustProductsChannelEndpointAssignmentListInstance;
    get trustProductsEntityAssignments(): TrustProductsEntityAssignmentsListInstance;
    get trustProductsEvaluations(): TrustProductsEvaluationsListInstance;
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    update(params?: TrustProductsContextUpdateOptions | ((error: Error | null, item?: TrustProductsInstance) => any), callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    updateWithHttpInfo(params?: TrustProductsContextUpdateOptions | ((error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): TrustProductsContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface TrustProductsPayload extends TwilioResponsePayload {
    results: TrustProductsResource[];
}
interface TrustProductsResource {
    sid: string;
    account_sid: string;
    policy_sid: string;
    friendly_name: string;
    status: TrustProductsStatus;
    valid_until: Date;
    email: string;
    status_callback: string;
    date_created: Date;
    date_updated: Date;
    url: string;
    links: Record<string, string>;
    errors: Array<any>;
}
export declare class TrustProductsInstance {
    protected _version: V1;
    protected _solution: TrustProductsContextSolution;
    protected _context?: TrustProductsContext;
    constructor(_version: V1, payload: TrustProductsResource, sid?: string);
    /**
     * The unique string that we created to identify the Trust Product resource.
     */
    sid: string;
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Trust Product resource.
     */
    accountSid: string;
    /**
     * The unique string of the policy that is associated with the Trust Product resource.
     */
    policySid: string;
    /**
     * The string that you assigned to describe the resource.
     */
    friendlyName: string;
    status: TrustProductsStatus;
    /**
     * The date and time in GMT in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format until which the resource will be valid.
     */
    validUntil: Date;
    /**
     * The email address that will receive updates when the Trust Product resource changes status.
     */
    email: string;
    /**
     * The URL we call to inform your application of status changes.
     */
    statusCallback: string;
    /**
     * The date and time in GMT when the resource was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateCreated: Date;
    /**
     * The date and time in GMT when the resource was last updated specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateUpdated: Date;
    /**
     * The absolute URL of the Trust Product resource.
     */
    url: string;
    /**
     * The URLs of the Assigned Items of the Trust Product resource.
     */
    links: Record<string, string>;
    /**
     * The error codes associated with the rejection of the Trust Product.
     */
    errors: Array<any>;
    private get _proxy();
    /**
     * Remove a TrustProductsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a TrustProductsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a TrustProductsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance
     */
    fetch(callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    /**
     * Fetch a TrustProductsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    /**
     * Update a TrustProductsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance
     */
    update(callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    /**
     * Update a TrustProductsInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance
     */
    update(params: TrustProductsContextUpdateOptions, callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    /**
     * Update a TrustProductsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    /**
     * Update a TrustProductsInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance with HTTP metadata
     */
    updateWithHttpInfo(params: TrustProductsContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    /**
     * Access the trustProductsChannelEndpointAssignment.
     */
    trustProductsChannelEndpointAssignment(): TrustProductsChannelEndpointAssignmentListInstance;
    /**
     * Access the trustProductsEntityAssignments.
     */
    trustProductsEntityAssignments(): TrustProductsEntityAssignmentsListInstance;
    /**
     * Access the trustProductsEvaluations.
     */
    trustProductsEvaluations(): TrustProductsEvaluationsListInstance;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        accountSid: string;
        policySid: string;
        friendlyName: string;
        status: TrustProductsStatus;
        validUntil: Date;
        email: string;
        statusCallback: string;
        dateCreated: Date;
        dateUpdated: Date;
        url: string;
        links: Record<string, string>;
        errors: any[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface TrustProductsSolution {
}
export interface TrustProductsListInstance {
    _version: V1;
    _solution: TrustProductsSolution;
    _uri: string;
    (sid: string): TrustProductsContext;
    get(sid: string): TrustProductsContext;
    /**
     * Create a TrustProductsInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance
     */
    create(params: TrustProductsListInstanceCreateOptions, callback?: (error: Error | null, item?: TrustProductsInstance) => any): Promise<TrustProductsInstance>;
    /**
     * Create a TrustProductsInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TrustProductsInstance with HTTP metadata
     */
    createWithHttpInfo(params: TrustProductsListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<TrustProductsInstance>) => any): Promise<ApiResponse<TrustProductsInstance>>;
    /**
     * Streams TrustProductsInstance records from the API.
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
     * @param { TrustProductsListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: TrustProductsInstance, done: (err?: Error) => void) => void): void;
    each(params: TrustProductsListInstanceEachOptions, callback?: (item: TrustProductsInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams TrustProductsInstance records from the API with HTTP metadata captured per page.
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
     * @param { TrustProductsListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: TrustProductsInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: TrustProductsListInstanceEachOptions, callback?: (item: TrustProductsInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of TrustProductsInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: TrustProductsPage) => any): Promise<TrustProductsPage>;
    /**
     * Retrieve a single target page of TrustProductsInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<TrustProductsPage>) => any): Promise<ApiResponse<TrustProductsPage>>;
    /**
     * Lists TrustProductsInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TrustProductsListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: TrustProductsInstance[]) => any): Promise<TrustProductsInstance[]>;
    list(params: TrustProductsListInstanceOptions, callback?: (error: Error | null, items: TrustProductsInstance[]) => any): Promise<TrustProductsInstance[]>;
    /**
     * Lists TrustProductsInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TrustProductsListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<TrustProductsInstance[]>) => any): Promise<ApiResponse<TrustProductsInstance[]>>;
    listWithHttpInfo(params: TrustProductsListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<TrustProductsInstance[]>) => any): Promise<ApiResponse<TrustProductsInstance[]>>;
    /**
     * Retrieve a single page of TrustProductsInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TrustProductsListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: TrustProductsPage) => any): Promise<TrustProductsPage>;
    page(params: TrustProductsListInstancePageOptions, callback?: (error: Error | null, items: TrustProductsPage) => any): Promise<TrustProductsPage>;
    /**
     * Retrieve a single page of TrustProductsInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TrustProductsListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<TrustProductsPage>) => any): Promise<ApiResponse<TrustProductsPage>>;
    pageWithHttpInfo(params: TrustProductsListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<TrustProductsPage>) => any): Promise<ApiResponse<TrustProductsPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function TrustProductsListInstance(version: V1): TrustProductsListInstance;
export declare class TrustProductsPage extends Page<V1, TrustProductsPayload, TrustProductsResource, TrustProductsInstance> {
    /**
     * Initialize the TrustProductsPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: TrustProductsSolution);
    /**
     * Build an instance of TrustProductsInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: TrustProductsResource): TrustProductsInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
