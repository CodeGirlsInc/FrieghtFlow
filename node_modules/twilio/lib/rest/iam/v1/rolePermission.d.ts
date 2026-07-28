import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to each
 */
export interface RolePermissionListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 100. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: RolePermissionInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface RolePermissionListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 100. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface RolePermissionListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 100. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface RolePermissionSolution {
    roleSid: string;
}
export interface RolePermissionListInstance {
    _version: V1;
    _solution: RolePermissionSolution;
    _uri: string;
    /**
     * Streams RolePermissionInstance records from the API.
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
     * @param { RolePermissionListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: RolePermissionInstance, done: (err?: Error) => void) => void): void;
    each(params: RolePermissionListInstanceEachOptions, callback?: (item: RolePermissionInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams RolePermissionInstance records from the API with HTTP metadata captured per page.
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
     * @param { RolePermissionListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: RolePermissionInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: RolePermissionListInstanceEachOptions, callback?: (item: RolePermissionInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of RolePermissionInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: RolePermissionPage) => any): Promise<RolePermissionPage>;
    /**
     * Retrieve a single target page of RolePermissionInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<RolePermissionPage>) => any): Promise<ApiResponse<RolePermissionPage>>;
    /**
     * Lists RolePermissionInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { RolePermissionListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: RolePermissionInstance[]) => any): Promise<RolePermissionInstance[]>;
    list(params: RolePermissionListInstanceOptions, callback?: (error: Error | null, items: RolePermissionInstance[]) => any): Promise<RolePermissionInstance[]>;
    /**
     * Lists RolePermissionInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { RolePermissionListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<RolePermissionInstance[]>) => any): Promise<ApiResponse<RolePermissionInstance[]>>;
    listWithHttpInfo(params: RolePermissionListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<RolePermissionInstance[]>) => any): Promise<ApiResponse<RolePermissionInstance[]>>;
    /**
     * Retrieve a single page of RolePermissionInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { RolePermissionListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: RolePermissionPage) => any): Promise<RolePermissionPage>;
    page(params: RolePermissionListInstancePageOptions, callback?: (error: Error | null, items: RolePermissionPage) => any): Promise<RolePermissionPage>;
    /**
     * Retrieve a single page of RolePermissionInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { RolePermissionListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<RolePermissionPage>) => any): Promise<ApiResponse<RolePermissionPage>>;
    pageWithHttpInfo(params: RolePermissionListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<RolePermissionPage>) => any): Promise<ApiResponse<RolePermissionPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function RolePermissionListInstance(version: V1, roleSid: string): RolePermissionListInstance;
interface RolePermissionPayload extends TwilioResponsePayload {
    permissions: RolePermissionResource[];
}
interface RolePermissionResource {
    sid: string;
    namespace: string;
    product: string;
    resource: string;
    action: string;
    externalDescription: string;
}
export declare class RolePermissionInstance {
    protected _version: V1;
    constructor(_version: V1, payload: RolePermissionResource, roleSid?: string);
    /**
     * The unique string that identifies the Permission resource.
     */
    sid: string;
    /**
     * The namespace of the permission (e.g., twilio).
     */
    namespace: string;
    /**
     * The product the permission belongs to (e.g., iam).
     */
    product: string;
    /**
     * The resource the permission applies to (e.g., roles).
     */
    resource: string;
    /**
     * The action granted by the permission (e.g., read).
     */
    action: string;
    /**
     * The external description of the permission.
     */
    externalDescription: string;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        namespace: string;
        product: string;
        resource: string;
        action: string;
        externalDescription: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export declare class RolePermissionPage extends Page<V1, RolePermissionPayload, RolePermissionResource, RolePermissionInstance> {
    /**
     * Initialize the RolePermissionPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: RolePermissionSolution);
    /**
     * Build an instance of RolePermissionInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: RolePermissionResource): RolePermissionInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
