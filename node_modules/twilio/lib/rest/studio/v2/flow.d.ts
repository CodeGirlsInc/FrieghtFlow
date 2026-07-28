import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
import { ExecutionListInstance } from "./flow/execution";
import { FlowRevisionListInstance } from "./flow/flowRevision";
import { FlowTestUserListInstance } from "./flow/flowTestUser";
/**
 * The status of the Flow. Can be: `draft` or `published`.
 */
export type FlowStatus = "draft" | "published";
/**
 * Options to pass to update a FlowInstance
 */
export interface FlowContextUpdateOptions {
    /**  */
    status: FlowStatus;
    /** The string that you assigned to describe the Flow. */
    friendlyName?: string;
    /** JSON representation of flow definition. */
    definition?: any;
    /** Description of change made in the revision. */
    commitMessage?: string;
    /** The SID of the User that created or last updated the Flow. */
    authorSid?: string;
}
/**
 * Options to pass to create a FlowInstance
 */
export interface FlowListInstanceCreateOptions {
    /** The string that you assigned to describe the Flow. */
    friendlyName: string;
    /**  */
    status: FlowStatus;
    /** JSON representation of flow definition. */
    definition: any;
    /** Description of change made in the revision. */
    commitMessage?: string;
    /** The SID of the User that created the Flow. */
    authorSid?: string;
}
/**
 * Options to pass to each
 */
export interface FlowListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: FlowInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface FlowListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface FlowListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface FlowContext {
    executions: ExecutionListInstance;
    revisions: FlowRevisionListInstance;
    testUsers: FlowTestUserListInstance;
    /**
     * Remove a FlowInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a FlowInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a FlowInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance
     */
    fetch(callback?: (error: Error | null, item?: FlowInstance) => any): Promise<FlowInstance>;
    /**
     * Fetch a FlowInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<FlowInstance>) => any): Promise<ApiResponse<FlowInstance>>;
    /**
     * Update a FlowInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance
     */
    update(params: FlowContextUpdateOptions, callback?: (error: Error | null, item?: FlowInstance) => any): Promise<FlowInstance>;
    /**
     * Update a FlowInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance with HTTP metadata
     */
    updateWithHttpInfo(params: FlowContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<FlowInstance>) => any): Promise<ApiResponse<FlowInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface FlowContextSolution {
    sid: string;
}
export declare class FlowContextImpl implements FlowContext {
    protected _version: V2;
    protected _solution: FlowContextSolution;
    protected _uri: string;
    protected _executions?: ExecutionListInstance;
    protected _revisions?: FlowRevisionListInstance;
    protected _testUsers?: FlowTestUserListInstance;
    constructor(_version: V2, sid: string);
    get executions(): ExecutionListInstance;
    get revisions(): FlowRevisionListInstance;
    get testUsers(): FlowTestUserListInstance;
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: FlowInstance) => any): Promise<FlowInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<FlowInstance>) => any): Promise<ApiResponse<FlowInstance>>;
    update(params: FlowContextUpdateOptions, callback?: (error: Error | null, item?: FlowInstance) => any): Promise<FlowInstance>;
    updateWithHttpInfo(params: FlowContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<FlowInstance>) => any): Promise<ApiResponse<FlowInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): FlowContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface FlowPayload extends TwilioResponsePayload {
    flows: FlowResource[];
}
interface FlowResource {
    sid: string;
    account_sid: string;
    author_sid: string;
    friendly_name: string;
    definition: any;
    status: FlowStatus;
    revision: number;
    commit_message: string;
    valid: boolean;
    errors: Array<any>;
    warnings: Array<any>;
    date_created: Date;
    date_updated: Date;
    webhook_url: string;
    url: string;
    links: Record<string, string>;
}
export declare class FlowInstance {
    protected _version: V2;
    protected _solution: FlowContextSolution;
    protected _context?: FlowContext;
    constructor(_version: V2, payload: FlowResource, sid?: string);
    /**
     * The unique string that we created to identify the Flow resource.
     */
    sid: string;
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Flow resource.
     */
    accountSid: string;
    /**
     * The SID of the User that created or last updated the Flow.
     */
    authorSid: string;
    /**
     * The string that you assigned to describe the Flow.
     */
    friendlyName: string;
    /**
     * JSON representation of flow definition.
     */
    definition: any;
    status: FlowStatus;
    /**
     * The latest revision number of the Flow\'s definition.
     */
    revision: number;
    /**
     * Description of change made in the revision.
     */
    commitMessage: string;
    /**
     * Boolean if the flow definition is valid.
     */
    valid: boolean;
    /**
     * List of error in the flow definition.
     */
    errors: Array<any>;
    /**
     * List of warnings in the flow definition.
     */
    warnings: Array<any>;
    /**
     * The date and time in GMT when the resource was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateCreated: Date;
    /**
     * The date and time in GMT when the resource was last updated specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateUpdated: Date;
    webhookUrl: string;
    /**
     * The absolute URL of the resource.
     */
    url: string;
    /**
     * The URLs of the Flow\'s nested resources.
     */
    links: Record<string, string>;
    private get _proxy();
    /**
     * Remove a FlowInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a FlowInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a FlowInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance
     */
    fetch(callback?: (error: Error | null, item?: FlowInstance) => any): Promise<FlowInstance>;
    /**
     * Fetch a FlowInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<FlowInstance>) => any): Promise<ApiResponse<FlowInstance>>;
    /**
     * Update a FlowInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance
     */
    update(params: FlowContextUpdateOptions, callback?: (error: Error | null, item?: FlowInstance) => any): Promise<FlowInstance>;
    /**
     * Update a FlowInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance with HTTP metadata
     */
    updateWithHttpInfo(params: FlowContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<FlowInstance>) => any): Promise<ApiResponse<FlowInstance>>;
    /**
     * Access the executions.
     */
    executions(): ExecutionListInstance;
    /**
     * Access the revisions.
     */
    revisions(): FlowRevisionListInstance;
    /**
     * Access the testUsers.
     */
    testUsers(): FlowTestUserListInstance;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        accountSid: string;
        authorSid: string;
        friendlyName: string;
        definition: any;
        status: FlowStatus;
        revision: number;
        commitMessage: string;
        valid: boolean;
        errors: any[];
        warnings: any[];
        dateCreated: Date;
        dateUpdated: Date;
        webhookUrl: string;
        url: string;
        links: Record<string, string>;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface FlowSolution {
}
export interface FlowListInstance {
    _version: V2;
    _solution: FlowSolution;
    _uri: string;
    (sid: string): FlowContext;
    get(sid: string): FlowContext;
    /**
     * Create a FlowInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance
     */
    create(params: FlowListInstanceCreateOptions, callback?: (error: Error | null, item?: FlowInstance) => any): Promise<FlowInstance>;
    /**
     * Create a FlowInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed FlowInstance with HTTP metadata
     */
    createWithHttpInfo(params: FlowListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<FlowInstance>) => any): Promise<ApiResponse<FlowInstance>>;
    /**
     * Streams FlowInstance records from the API.
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
     * @param { FlowListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: FlowInstance, done: (err?: Error) => void) => void): void;
    each(params: FlowListInstanceEachOptions, callback?: (item: FlowInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams FlowInstance records from the API with HTTP metadata captured per page.
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
     * @param { FlowListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: FlowInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: FlowListInstanceEachOptions, callback?: (item: FlowInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of FlowInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: FlowPage) => any): Promise<FlowPage>;
    /**
     * Retrieve a single target page of FlowInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<FlowPage>) => any): Promise<ApiResponse<FlowPage>>;
    /**
     * Lists FlowInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { FlowListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: FlowInstance[]) => any): Promise<FlowInstance[]>;
    list(params: FlowListInstanceOptions, callback?: (error: Error | null, items: FlowInstance[]) => any): Promise<FlowInstance[]>;
    /**
     * Lists FlowInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { FlowListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<FlowInstance[]>) => any): Promise<ApiResponse<FlowInstance[]>>;
    listWithHttpInfo(params: FlowListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<FlowInstance[]>) => any): Promise<ApiResponse<FlowInstance[]>>;
    /**
     * Retrieve a single page of FlowInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { FlowListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: FlowPage) => any): Promise<FlowPage>;
    page(params: FlowListInstancePageOptions, callback?: (error: Error | null, items: FlowPage) => any): Promise<FlowPage>;
    /**
     * Retrieve a single page of FlowInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { FlowListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<FlowPage>) => any): Promise<ApiResponse<FlowPage>>;
    pageWithHttpInfo(params: FlowListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<FlowPage>) => any): Promise<ApiResponse<FlowPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function FlowListInstance(version: V2): FlowListInstance;
export declare class FlowPage extends Page<V2, FlowPayload, FlowResource, FlowInstance> {
    /**
     * Initialize the FlowPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, solution: FlowSolution);
    /**
     * Build an instance of FlowInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: FlowResource): FlowInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
