import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to each
 */
export interface PortingAllPortInListInstanceEachOptions {
    /** Page start token, if null then it will start from the beginning */
    token?: string;
    /** Number of items per page */
    size?: number;
    /** Filter by Port in request SID, supports multiple values separated by comma */
    portInRequestSid?: string;
    /** Filter by Port In request status */
    portInRequestStatus?: string;
    /** Find all created before a certain date */
    createdBefore?: string;
    /** Find all created after a certain date */
    createdAfter?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: PortingAllPortInInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface PortingAllPortInListInstanceOptions {
    /** Page start token, if null then it will start from the beginning */
    token?: string;
    /** Number of items per page */
    size?: number;
    /** Filter by Port in request SID, supports multiple values separated by comma */
    portInRequestSid?: string;
    /** Filter by Port In request status */
    portInRequestStatus?: string;
    /** Find all created before a certain date */
    createdBefore?: string;
    /** Find all created after a certain date */
    createdAfter?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface PortingAllPortInListInstancePageOptions {
    /** Page start token, if null then it will start from the beginning */
    token?: string;
    /** Number of items per page */
    size?: number;
    /** Filter by Port in request SID, supports multiple values separated by comma */
    portInRequestSid?: string;
    /** Filter by Port In request status */
    portInRequestStatus?: string;
    /** Find all created before a certain date */
    createdBefore?: string;
    /** Find all created after a certain date */
    createdAfter?: string;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface PortingAllPortInSolution {
}
export interface PortingAllPortInListInstance {
    _version: V1;
    _solution: PortingAllPortInSolution;
    _uri: string;
    /**
     * Streams PortingAllPortInInstance records from the API.
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
     * @param { PortingAllPortInListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: PortingAllPortInInstance, done: (err?: Error) => void) => void): void;
    each(params: PortingAllPortInListInstanceEachOptions, callback?: (item: PortingAllPortInInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams PortingAllPortInInstance records from the API with HTTP metadata captured per page.
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
     * @param { PortingAllPortInListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: PortingAllPortInInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: PortingAllPortInListInstanceEachOptions, callback?: (item: PortingAllPortInInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of PortingAllPortInInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: PortingAllPortInPage) => any): Promise<PortingAllPortInPage>;
    /**
     * Retrieve a single target page of PortingAllPortInInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<PortingAllPortInPage>) => any): Promise<ApiResponse<PortingAllPortInPage>>;
    /**
     * Lists PortingAllPortInInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { PortingAllPortInListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: PortingAllPortInInstance[]) => any): Promise<PortingAllPortInInstance[]>;
    list(params: PortingAllPortInListInstanceOptions, callback?: (error: Error | null, items: PortingAllPortInInstance[]) => any): Promise<PortingAllPortInInstance[]>;
    /**
     * Lists PortingAllPortInInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { PortingAllPortInListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<PortingAllPortInInstance[]>) => any): Promise<ApiResponse<PortingAllPortInInstance[]>>;
    listWithHttpInfo(params: PortingAllPortInListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<PortingAllPortInInstance[]>) => any): Promise<ApiResponse<PortingAllPortInInstance[]>>;
    /**
     * Retrieve a single page of PortingAllPortInInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { PortingAllPortInListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: PortingAllPortInPage) => any): Promise<PortingAllPortInPage>;
    page(params: PortingAllPortInListInstancePageOptions, callback?: (error: Error | null, items: PortingAllPortInPage) => any): Promise<PortingAllPortInPage>;
    /**
     * Retrieve a single page of PortingAllPortInInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { PortingAllPortInListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<PortingAllPortInPage>) => any): Promise<ApiResponse<PortingAllPortInPage>>;
    pageWithHttpInfo(params: PortingAllPortInListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<PortingAllPortInPage>) => any): Promise<ApiResponse<PortingAllPortInPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function PortingAllPortInListInstance(version: V1): PortingAllPortInListInstance;
interface PortingAllPortInPayload extends TwilioResponsePayload {
    port_in_requests: PortingAllPortInResource[];
}
interface PortingAllPortInResource {
    port_in_request_sid: string;
    port_in_request_status: string;
    status_last_updated_timestamp: string;
    phone_numbers_requested: number;
    phone_numbers_ported: number;
    suggested_action: string;
}
export declare class PortingAllPortInInstance {
    protected _version: V1;
    constructor(_version: V1, payload: PortingAllPortInResource);
    /**
     * The SID of the Port-in request
     */
    portInRequestSid: string;
    /**
     * Status of the Port In Request
     */
    portInRequestStatus: string;
    /**
     * The last updated timestamp of the request
     */
    statusLastUpdatedTimestamp: string;
    /**
     * Amount of phone numbers requested
     */
    phoneNumbersRequested: number;
    /**
     * Amount of phone numbers ported
     */
    phoneNumbersPorted: number;
    /**
     * Suggested action on this ticket
     */
    suggestedAction: string;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        portInRequestSid: string;
        portInRequestStatus: string;
        statusLastUpdatedTimestamp: string;
        phoneNumbersRequested: number;
        phoneNumbersPorted: number;
        suggestedAction: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export declare class PortingAllPortInPage extends Page<V1, PortingAllPortInPayload, PortingAllPortInResource, PortingAllPortInInstance> {
    /**
     * Initialize the PortingAllPortInPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: PortingAllPortInSolution);
    /**
     * Build an instance of PortingAllPortInInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: PortingAllPortInResource): PortingAllPortInInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
