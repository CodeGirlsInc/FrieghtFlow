import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../base/Page";
import Response from "../../../../http/response";
import V1 from "../../V1";
import { ApiResponse } from "../../../../base/ApiResponse";
/**
 * Options to pass to each
 */
export interface DayListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 400. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: DayInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface DayListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 400. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface DayListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 400. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface DayContext {
    /**
     * Fetch a DayInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DayInstance
     */
    fetch(callback?: (error: Error | null, item?: DayInstance) => any): Promise<DayInstance>;
    /**
     * Fetch a DayInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DayInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DayInstance>) => any): Promise<ApiResponse<DayInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface DayContextSolution {
    resourceType: string;
    day: string;
}
export declare class DayContextImpl implements DayContext {
    protected _version: V1;
    protected _solution: DayContextSolution;
    protected _uri: string;
    constructor(_version: V1, resourceType: string, day: string);
    fetch(callback?: (error: Error | null, item?: DayInstance) => any): Promise<DayInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DayInstance>) => any): Promise<ApiResponse<DayInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): DayContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface DayPayload extends TwilioResponsePayload {
    days: DayResource[];
}
interface DayResource {
    redirect_to: string;
    day: string;
    size: number;
    create_date: string;
    friendly_name: string;
    resource_type: string;
}
export declare class DayInstance {
    protected _version: V1;
    protected _solution: DayContextSolution;
    protected _context?: DayContext;
    constructor(_version: V1, payload: DayResource, resourceType: string, day?: string);
    redirectTo: string;
    /**
     * The ISO 8601 format date of the resources in the file, for a UTC day
     */
    day: string;
    /**
     * The size of the day\'s data file in bytes
     */
    size: number;
    /**
     * The ISO 8601 format date when resources is created
     */
    createDate: string;
    /**
     * The friendly name specified when creating the job
     */
    friendlyName: string;
    /**
     * The type of communication – Messages, Calls, Conferences, and Participants
     */
    resourceType: string;
    private get _proxy();
    /**
     * Fetch a DayInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DayInstance
     */
    fetch(callback?: (error: Error | null, item?: DayInstance) => any): Promise<DayInstance>;
    /**
     * Fetch a DayInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DayInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DayInstance>) => any): Promise<ApiResponse<DayInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        redirectTo: string;
        day: string;
        size: number;
        createDate: string;
        friendlyName: string;
        resourceType: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface DaySolution {
    resourceType: string;
}
export interface DayListInstance {
    _version: V1;
    _solution: DaySolution;
    _uri: string;
    (day: string): DayContext;
    get(day: string): DayContext;
    /**
     * Streams DayInstance records from the API.
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
     * @param { DayListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: DayInstance, done: (err?: Error) => void) => void): void;
    each(params: DayListInstanceEachOptions, callback?: (item: DayInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams DayInstance records from the API with HTTP metadata captured per page.
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
     * @param { DayListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: DayInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: DayListInstanceEachOptions, callback?: (item: DayInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of DayInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: DayPage) => any): Promise<DayPage>;
    /**
     * Retrieve a single target page of DayInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<DayPage>) => any): Promise<ApiResponse<DayPage>>;
    /**
     * Lists DayInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { DayListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: DayInstance[]) => any): Promise<DayInstance[]>;
    list(params: DayListInstanceOptions, callback?: (error: Error | null, items: DayInstance[]) => any): Promise<DayInstance[]>;
    /**
     * Lists DayInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { DayListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<DayInstance[]>) => any): Promise<ApiResponse<DayInstance[]>>;
    listWithHttpInfo(params: DayListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<DayInstance[]>) => any): Promise<ApiResponse<DayInstance[]>>;
    /**
     * Retrieve a single page of DayInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { DayListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: DayPage) => any): Promise<DayPage>;
    page(params: DayListInstancePageOptions, callback?: (error: Error | null, items: DayPage) => any): Promise<DayPage>;
    /**
     * Retrieve a single page of DayInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { DayListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<DayPage>) => any): Promise<ApiResponse<DayPage>>;
    pageWithHttpInfo(params: DayListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<DayPage>) => any): Promise<ApiResponse<DayPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function DayListInstance(version: V1, resourceType: string): DayListInstance;
export declare class DayPage extends Page<V1, DayPayload, DayResource, DayInstance> {
    /**
     * Initialize the DayPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: DaySolution);
    /**
     * Build an instance of DayInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: DayResource): DayInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
