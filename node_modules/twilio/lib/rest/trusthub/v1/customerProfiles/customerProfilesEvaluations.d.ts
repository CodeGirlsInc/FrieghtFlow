import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../base/Page";
import Response from "../../../../http/response";
import V1 from "../../V1";
import { ApiResponse } from "../../../../base/ApiResponse";
/**
 * The compliance status of the Evaluation resource.
 */
export type CustomerProfilesEvaluationsStatus = "compliant" | "noncompliant";
/**
 * Options to pass to create a CustomerProfilesEvaluationsInstance
 */
export interface CustomerProfilesEvaluationsListInstanceCreateOptions {
    /** The unique string of a policy that is associated to the customer_profile resource. */
    policySid: string;
}
/**
 * Options to pass to each
 */
export interface CustomerProfilesEvaluationsListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: CustomerProfilesEvaluationsInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface CustomerProfilesEvaluationsListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface CustomerProfilesEvaluationsListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface CustomerProfilesEvaluationsContext {
    /**
     * Fetch a CustomerProfilesEvaluationsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CustomerProfilesEvaluationsInstance
     */
    fetch(callback?: (error: Error | null, item?: CustomerProfilesEvaluationsInstance) => any): Promise<CustomerProfilesEvaluationsInstance>;
    /**
     * Fetch a CustomerProfilesEvaluationsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CustomerProfilesEvaluationsInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<CustomerProfilesEvaluationsInstance>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface CustomerProfilesEvaluationsContextSolution {
    customerProfileSid: string;
    sid: string;
}
export declare class CustomerProfilesEvaluationsContextImpl implements CustomerProfilesEvaluationsContext {
    protected _version: V1;
    protected _solution: CustomerProfilesEvaluationsContextSolution;
    protected _uri: string;
    constructor(_version: V1, customerProfileSid: string, sid: string);
    fetch(callback?: (error: Error | null, item?: CustomerProfilesEvaluationsInstance) => any): Promise<CustomerProfilesEvaluationsInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<CustomerProfilesEvaluationsInstance>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): CustomerProfilesEvaluationsContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface CustomerProfilesEvaluationsPayload extends TwilioResponsePayload {
    results: CustomerProfilesEvaluationsResource[];
}
interface CustomerProfilesEvaluationsResource {
    sid: string;
    account_sid: string;
    policy_sid: string;
    customer_profile_sid: string;
    status: CustomerProfilesEvaluationsStatus;
    results: Array<any>;
    date_created: Date;
    url: string;
}
export declare class CustomerProfilesEvaluationsInstance {
    protected _version: V1;
    protected _solution: CustomerProfilesEvaluationsContextSolution;
    protected _context?: CustomerProfilesEvaluationsContext;
    constructor(_version: V1, payload: CustomerProfilesEvaluationsResource, customerProfileSid: string, sid?: string);
    /**
     * The unique string that identifies the Evaluation resource.
     */
    sid: string;
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the customer_profile resource.
     */
    accountSid: string;
    /**
     * The unique string of a policy that is associated to the customer_profile resource.
     */
    policySid: string;
    /**
     * The unique string that we created to identify the customer_profile resource.
     */
    customerProfileSid: string;
    status: CustomerProfilesEvaluationsStatus;
    /**
     * The results of the Evaluation which includes the valid and invalid attributes.
     */
    results: Array<any>;
    dateCreated: Date;
    url: string;
    private get _proxy();
    /**
     * Fetch a CustomerProfilesEvaluationsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CustomerProfilesEvaluationsInstance
     */
    fetch(callback?: (error: Error | null, item?: CustomerProfilesEvaluationsInstance) => any): Promise<CustomerProfilesEvaluationsInstance>;
    /**
     * Fetch a CustomerProfilesEvaluationsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CustomerProfilesEvaluationsInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<CustomerProfilesEvaluationsInstance>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        accountSid: string;
        policySid: string;
        customerProfileSid: string;
        status: CustomerProfilesEvaluationsStatus;
        results: any[];
        dateCreated: Date;
        url: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface CustomerProfilesEvaluationsSolution {
    customerProfileSid: string;
}
export interface CustomerProfilesEvaluationsListInstance {
    _version: V1;
    _solution: CustomerProfilesEvaluationsSolution;
    _uri: string;
    (sid: string): CustomerProfilesEvaluationsContext;
    get(sid: string): CustomerProfilesEvaluationsContext;
    /**
     * Create a CustomerProfilesEvaluationsInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CustomerProfilesEvaluationsInstance
     */
    create(params: CustomerProfilesEvaluationsListInstanceCreateOptions, callback?: (error: Error | null, item?: CustomerProfilesEvaluationsInstance) => any): Promise<CustomerProfilesEvaluationsInstance>;
    /**
     * Create a CustomerProfilesEvaluationsInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed CustomerProfilesEvaluationsInstance with HTTP metadata
     */
    createWithHttpInfo(params: CustomerProfilesEvaluationsListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<CustomerProfilesEvaluationsInstance>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsInstance>>;
    /**
     * Streams CustomerProfilesEvaluationsInstance records from the API.
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
     * @param { CustomerProfilesEvaluationsListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: CustomerProfilesEvaluationsInstance, done: (err?: Error) => void) => void): void;
    each(params: CustomerProfilesEvaluationsListInstanceEachOptions, callback?: (item: CustomerProfilesEvaluationsInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams CustomerProfilesEvaluationsInstance records from the API with HTTP metadata captured per page.
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
     * @param { CustomerProfilesEvaluationsListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: CustomerProfilesEvaluationsInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: CustomerProfilesEvaluationsListInstanceEachOptions, callback?: (item: CustomerProfilesEvaluationsInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of CustomerProfilesEvaluationsInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: CustomerProfilesEvaluationsPage) => any): Promise<CustomerProfilesEvaluationsPage>;
    /**
     * Retrieve a single target page of CustomerProfilesEvaluationsInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<CustomerProfilesEvaluationsPage>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsPage>>;
    /**
     * Lists CustomerProfilesEvaluationsInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { CustomerProfilesEvaluationsListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: CustomerProfilesEvaluationsInstance[]) => any): Promise<CustomerProfilesEvaluationsInstance[]>;
    list(params: CustomerProfilesEvaluationsListInstanceOptions, callback?: (error: Error | null, items: CustomerProfilesEvaluationsInstance[]) => any): Promise<CustomerProfilesEvaluationsInstance[]>;
    /**
     * Lists CustomerProfilesEvaluationsInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { CustomerProfilesEvaluationsListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<CustomerProfilesEvaluationsInstance[]>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsInstance[]>>;
    listWithHttpInfo(params: CustomerProfilesEvaluationsListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<CustomerProfilesEvaluationsInstance[]>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsInstance[]>>;
    /**
     * Retrieve a single page of CustomerProfilesEvaluationsInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { CustomerProfilesEvaluationsListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: CustomerProfilesEvaluationsPage) => any): Promise<CustomerProfilesEvaluationsPage>;
    page(params: CustomerProfilesEvaluationsListInstancePageOptions, callback?: (error: Error | null, items: CustomerProfilesEvaluationsPage) => any): Promise<CustomerProfilesEvaluationsPage>;
    /**
     * Retrieve a single page of CustomerProfilesEvaluationsInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { CustomerProfilesEvaluationsListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<CustomerProfilesEvaluationsPage>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsPage>>;
    pageWithHttpInfo(params: CustomerProfilesEvaluationsListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<CustomerProfilesEvaluationsPage>) => any): Promise<ApiResponse<CustomerProfilesEvaluationsPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function CustomerProfilesEvaluationsListInstance(version: V1, customerProfileSid: string): CustomerProfilesEvaluationsListInstance;
export declare class CustomerProfilesEvaluationsPage extends Page<V1, CustomerProfilesEvaluationsPayload, CustomerProfilesEvaluationsResource, CustomerProfilesEvaluationsInstance> {
    /**
     * Initialize the CustomerProfilesEvaluationsPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: CustomerProfilesEvaluationsSolution);
    /**
     * Build an instance of CustomerProfilesEvaluationsInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: CustomerProfilesEvaluationsResource): CustomerProfilesEvaluationsInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
