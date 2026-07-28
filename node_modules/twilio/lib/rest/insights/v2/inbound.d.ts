import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class InsightsV2CreatePhoneNumbersReportRequest {
    "timeRange"?: InsightsV2CreatePhoneNumbersReportRequestTimeRange;
    "filters"?: Array<PhoneNumberReportFilter>;
    /**
     * The number of max available top Phone Numbers to generate.
     */
    "size"?: number;
    constructor(payload: any);
}
export declare class InsightsV2CreatePhoneNumbersReportRequestTimeRange {
    /**
     * Start date time of the report
     */
    "startDatetime"?: Date;
    /**
     * End date time of the report
     */
    "endDatetime"?: Date;
    constructor(payload: any);
}
/**
 * Percentage of calls made in each state.
 */
export declare class InsightsV2InboundPhoneNumberReportCallStatePercentage {
    /**
     * Percentage of completed inbound calls.
     */
    "completed"?: number;
    /**
     * Percentage of failed inbound calls.
     */
    "fail"?: number;
    /**
     * Percentage of busy inbound calls.
     */
    "busy"?: number;
    /**
     * Percentage of no-answer inbound calls.
     */
    "noanswer"?: number;
    /**
     * Percentage of canceled inbound calls.
     */
    "canceled"?: number;
    constructor(payload: any);
}
export declare class PhoneNumberReportFilter {
    /**
     * The name of the filter
     */
    "key"?: string;
    /**
     * List of supported filter values for the field name
     */
    "values"?: Array<string>;
    constructor(payload: any);
}
export declare class ReportFilter {
    /**
     * The name of the filter \'call_state\', \'call_direction\', \'call_type\', \'twilio_regions\', \'caller_country_code\', \'callee_country_code\', \'silent\'
     */
    "key"?: string;
    /**
     * List of supported filter values for the field name
     */
    "values"?: Array<string>;
    constructor(payload: any);
}
export declare class ReportMetadata {
    /**
     * Start date time of the report
     */
    "startDatetime"?: Date;
    /**
     * End date time of the report
     */
    "endDatetime"?: Date;
    /**
     * Filter values applied to the report
     */
    "filters"?: Array<ReportFilter>;
    constructor(payload: any);
}
/**
 * The status of the report.
 */
export type ReportStatus = "created" | "running" | "completed";
/**
 * Options to pass to create a InboundInstance
 */
export interface InboundContextCreateOptions {
    /**  */
    insightsV2CreatePhoneNumbersReportRequest?: InsightsV2CreatePhoneNumbersReportRequest;
}
/**
 * Options to pass to each
 */
export interface InboundListInstanceEachOptions {
    /** How many resources to return in each list page. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: InboundInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface InboundListInstanceOptions {
    /** How many resources to return in each list page. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface InboundListInstancePageOptions {
    /** How many resources to return in each list page. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface InboundContext {
    /**
     * Create a InboundInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InboundInstance
     */
    create(callback?: (error: Error | null, item?: InboundInstance) => any): Promise<InboundInstance>;
    /**
     * Create a InboundInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InboundInstance
     */
    create(params: InsightsV2CreatePhoneNumbersReportRequest, headers?: any, callback?: (error: Error | null, item?: InboundInstance) => any): Promise<InboundInstance>;
    /**
     * Create a InboundInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InboundInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<InboundInstance>) => any): Promise<ApiResponse<InboundInstance>>;
    /**
     * Create a InboundInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InboundInstance with HTTP metadata
     */
    createWithHttpInfo(params: InsightsV2CreatePhoneNumbersReportRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<InboundInstance>) => any): Promise<ApiResponse<InboundInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface InboundContextSolution {
    reportId: string;
}
export declare class InboundContextImpl implements InboundContext {
    protected _version: V2;
    protected _solution: InboundContextSolution;
    protected _uri: string;
    constructor(_version: V2, reportId: string);
    create(params?: InsightsV2CreatePhoneNumbersReportRequest | ((error: Error | null, item?: InboundInstance) => any), headers?: any, callback?: (error: Error | null, item?: InboundInstance) => any): Promise<InboundInstance>;
    createWithHttpInfo(params?: InsightsV2CreatePhoneNumbersReportRequest | ((error: Error | null, item?: ApiResponse<InboundInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<InboundInstance>) => any): Promise<ApiResponse<InboundInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): InboundContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface InboundPayload extends TwilioResponsePayload {
    reports: InboundResource[];
}
interface InboundResource {
    account_sid: string;
    report_id: string;
    status: ReportStatus;
    request_meta: ReportMetadata;
    url: string;
    handle: string;
    total_calls: number;
    call_answer_score: number;
    call_state_percentage: InsightsV2InboundPhoneNumberReportCallStatePercentage;
    silent_calls_percentage: number;
}
export declare class InboundInstance {
    protected _version: V2;
    protected _solution: InboundContextSolution;
    protected _context?: InboundContext;
    constructor(_version: V2, payload: InboundResource, reportId?: string);
    /**
     * The unique SID identifier of the Account.
     */
    accountSid: string;
    /**
     * The report identifier as Voice Insights Report TTID.
     */
    reportId: string;
    status: ReportStatus;
    requestMeta: ReportMetadata;
    /**
     * The URL of this resource.
     */
    url: string;
    /**
     * Inbound phone number handle represented in the report.
     */
    handle: string;
    /**
     * Total number of calls made with the given handle during the report period.
     */
    totalCalls: number;
    /**
     * The call answer score measures customers behavior to the delivered calls. The score is a value between 0 and 100, where 100 indicates that all calls were successfully answered.
     */
    callAnswerScore: number;
    callStatePercentage: InsightsV2InboundPhoneNumberReportCallStatePercentage;
    /**
     * Percentage of inbound calls with silence tags over total outbound calls. A silent tag is indicative of a connectivity issue or muted audio.
     */
    silentCallsPercentage: number;
    private get _proxy();
    /**
     * Create a InboundInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InboundInstance
     */
    create(callback?: (error: Error | null, item?: InboundInstance) => any): Promise<InboundInstance>;
    /**
     * Create a InboundInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InboundInstance
     */
    create(params: InsightsV2CreatePhoneNumbersReportRequest, headers?: any, callback?: (error: Error | null, item?: InboundInstance) => any): Promise<InboundInstance>;
    /**
     * Create a InboundInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InboundInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<InboundInstance>) => any): Promise<ApiResponse<InboundInstance>>;
    /**
     * Create a InboundInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InboundInstance with HTTP metadata
     */
    createWithHttpInfo(params: InsightsV2CreatePhoneNumbersReportRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<InboundInstance>) => any): Promise<ApiResponse<InboundInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        accountSid: string;
        reportId: string;
        status: ReportStatus;
        requestMeta: ReportMetadata;
        url: string;
        handle: string;
        totalCalls: number;
        callAnswerScore: number;
        callStatePercentage: InsightsV2InboundPhoneNumberReportCallStatePercentage;
        silentCallsPercentage: number;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface InboundSolution {
    reportId: string;
}
export interface InboundListInstance {
    _version: V2;
    _solution: InboundSolution;
    _uri: string;
    (reportId: string): InboundContext;
    get(reportId: string): InboundContext;
    /**
     * Streams InboundInstance records from the API.
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
     * @param { InboundListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: InboundInstance, done: (err?: Error) => void) => void): void;
    each(params: InboundListInstanceEachOptions, callback?: (item: InboundInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams InboundInstance records from the API with HTTP metadata captured per page.
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
     * @param { InboundListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: InboundInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: InboundListInstanceEachOptions, callback?: (item: InboundInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of InboundInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: InboundPage) => any): Promise<InboundPage>;
    /**
     * Retrieve a single target page of InboundInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<InboundPage>) => any): Promise<ApiResponse<InboundPage>>;
    /**
     * Lists InboundInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { InboundListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: InboundInstance[]) => any): Promise<InboundInstance[]>;
    list(params: InboundListInstanceOptions, callback?: (error: Error | null, items: InboundInstance[]) => any): Promise<InboundInstance[]>;
    /**
     * Lists InboundInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { InboundListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<InboundInstance[]>) => any): Promise<ApiResponse<InboundInstance[]>>;
    listWithHttpInfo(params: InboundListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<InboundInstance[]>) => any): Promise<ApiResponse<InboundInstance[]>>;
    /**
     * Retrieve a single page of InboundInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { InboundListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: InboundPage) => any): Promise<InboundPage>;
    page(params: InboundListInstancePageOptions, callback?: (error: Error | null, items: InboundPage) => any): Promise<InboundPage>;
    /**
     * Retrieve a single page of InboundInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { InboundListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<InboundPage>) => any): Promise<ApiResponse<InboundPage>>;
    pageWithHttpInfo(params: InboundListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<InboundPage>) => any): Promise<ApiResponse<InboundPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function InboundListInstance(version: V2, reportId: string): InboundListInstance;
export declare class InboundPage extends Page<V2, InboundPayload, InboundResource, InboundInstance> {
    /**
     * Initialize the InboundPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, solution: InboundSolution);
    /**
     * Build an instance of InboundInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: InboundResource): InboundInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
