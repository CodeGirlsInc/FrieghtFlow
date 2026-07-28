import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to each
 */
export interface SupportingDocumentTypeListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: SupportingDocumentTypeInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface SupportingDocumentTypeListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface SupportingDocumentTypeListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface SupportingDocumentTypeContext {
    /**
     * Fetch a SupportingDocumentTypeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SupportingDocumentTypeInstance
     */
    fetch(callback?: (error: Error | null, item?: SupportingDocumentTypeInstance) => any): Promise<SupportingDocumentTypeInstance>;
    /**
     * Fetch a SupportingDocumentTypeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SupportingDocumentTypeInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<SupportingDocumentTypeInstance>) => any): Promise<ApiResponse<SupportingDocumentTypeInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface SupportingDocumentTypeContextSolution {
    sid: string;
}
export declare class SupportingDocumentTypeContextImpl implements SupportingDocumentTypeContext {
    protected _version: V1;
    protected _solution: SupportingDocumentTypeContextSolution;
    protected _uri: string;
    constructor(_version: V1, sid: string);
    fetch(callback?: (error: Error | null, item?: SupportingDocumentTypeInstance) => any): Promise<SupportingDocumentTypeInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<SupportingDocumentTypeInstance>) => any): Promise<ApiResponse<SupportingDocumentTypeInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): SupportingDocumentTypeContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface SupportingDocumentTypePayload extends TwilioResponsePayload {
    supporting_document_types: SupportingDocumentTypeResource[];
}
interface SupportingDocumentTypeResource {
    sid: string;
    friendly_name: string;
    machine_name: string;
    fields: Array<any>;
    url: string;
}
export declare class SupportingDocumentTypeInstance {
    protected _version: V1;
    protected _solution: SupportingDocumentTypeContextSolution;
    protected _context?: SupportingDocumentTypeContext;
    constructor(_version: V1, payload: SupportingDocumentTypeResource, sid?: string);
    /**
     * The unique string that identifies the Supporting Document Type resource.
     */
    sid: string;
    /**
     * A human-readable description of the Supporting Document Type resource.
     */
    friendlyName: string;
    /**
     * The machine-readable description of the Supporting Document Type resource.
     */
    machineName: string;
    /**
     * The required information for creating a Supporting Document. The required fields will change as regulatory needs change and will differ for businesses and individuals.
     */
    fields: Array<any>;
    /**
     * The absolute URL of the Supporting Document Type resource.
     */
    url: string;
    private get _proxy();
    /**
     * Fetch a SupportingDocumentTypeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SupportingDocumentTypeInstance
     */
    fetch(callback?: (error: Error | null, item?: SupportingDocumentTypeInstance) => any): Promise<SupportingDocumentTypeInstance>;
    /**
     * Fetch a SupportingDocumentTypeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SupportingDocumentTypeInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<SupportingDocumentTypeInstance>) => any): Promise<ApiResponse<SupportingDocumentTypeInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        friendlyName: string;
        machineName: string;
        fields: any[];
        url: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface SupportingDocumentTypeSolution {
}
export interface SupportingDocumentTypeListInstance {
    _version: V1;
    _solution: SupportingDocumentTypeSolution;
    _uri: string;
    (sid: string): SupportingDocumentTypeContext;
    get(sid: string): SupportingDocumentTypeContext;
    /**
     * Streams SupportingDocumentTypeInstance records from the API.
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
     * @param { SupportingDocumentTypeListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: SupportingDocumentTypeInstance, done: (err?: Error) => void) => void): void;
    each(params: SupportingDocumentTypeListInstanceEachOptions, callback?: (item: SupportingDocumentTypeInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams SupportingDocumentTypeInstance records from the API with HTTP metadata captured per page.
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
     * @param { SupportingDocumentTypeListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: SupportingDocumentTypeInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: SupportingDocumentTypeListInstanceEachOptions, callback?: (item: SupportingDocumentTypeInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of SupportingDocumentTypeInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: SupportingDocumentTypePage) => any): Promise<SupportingDocumentTypePage>;
    /**
     * Retrieve a single target page of SupportingDocumentTypeInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<SupportingDocumentTypePage>) => any): Promise<ApiResponse<SupportingDocumentTypePage>>;
    /**
     * Lists SupportingDocumentTypeInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { SupportingDocumentTypeListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: SupportingDocumentTypeInstance[]) => any): Promise<SupportingDocumentTypeInstance[]>;
    list(params: SupportingDocumentTypeListInstanceOptions, callback?: (error: Error | null, items: SupportingDocumentTypeInstance[]) => any): Promise<SupportingDocumentTypeInstance[]>;
    /**
     * Lists SupportingDocumentTypeInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { SupportingDocumentTypeListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<SupportingDocumentTypeInstance[]>) => any): Promise<ApiResponse<SupportingDocumentTypeInstance[]>>;
    listWithHttpInfo(params: SupportingDocumentTypeListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<SupportingDocumentTypeInstance[]>) => any): Promise<ApiResponse<SupportingDocumentTypeInstance[]>>;
    /**
     * Retrieve a single page of SupportingDocumentTypeInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { SupportingDocumentTypeListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: SupportingDocumentTypePage) => any): Promise<SupportingDocumentTypePage>;
    page(params: SupportingDocumentTypeListInstancePageOptions, callback?: (error: Error | null, items: SupportingDocumentTypePage) => any): Promise<SupportingDocumentTypePage>;
    /**
     * Retrieve a single page of SupportingDocumentTypeInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { SupportingDocumentTypeListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<SupportingDocumentTypePage>) => any): Promise<ApiResponse<SupportingDocumentTypePage>>;
    pageWithHttpInfo(params: SupportingDocumentTypeListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<SupportingDocumentTypePage>) => any): Promise<ApiResponse<SupportingDocumentTypePage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function SupportingDocumentTypeListInstance(version: V1): SupportingDocumentTypeListInstance;
export declare class SupportingDocumentTypePage extends Page<V1, SupportingDocumentTypePayload, SupportingDocumentTypeResource, SupportingDocumentTypeInstance> {
    /**
     * Initialize the SupportingDocumentTypePage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: SupportingDocumentTypeSolution);
    /**
     * Build an instance of SupportingDocumentTypeInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: SupportingDocumentTypeResource): SupportingDocumentTypeInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
