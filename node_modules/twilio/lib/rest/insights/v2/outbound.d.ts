import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class CountyCarrierValue {
    "country"?: string;
    "carriers"?: Array<CountyCarrierValueCarriers>;
    constructor(payload: any);
}
export declare class CountyCarrierValueCarriers {
    /**
     * The name of the carrier.
     */
    "carrier"?: string;
    /**
     * Total number of outbound calls for the carrier in the country.
     */
    "totalCalls"?: number;
    /**
     * Total number of blocked outbound calls for the carrier in the country.
     */
    "blockedCalls"?: number;
    /**
     * Percentage of blocked outbound calls for the carrier in the country.
     */
    "blockedCallsPercentage"?: number;
    constructor(payload: any);
}
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
/**
 * Number of calls made in answering machine detection (AMD) enabled.
 */
export declare class InsightsV2OutboundPhoneNumberReportAnsweringMachineDetection {
    /**
     * Total number of calls with answering machine detection (AMD) enabled.
     */
    "totalCalls"?: number;
    /**
     * Percentage of calls marked as answered by human.
     */
    "answeredByHumanPercentage"?: number;
    /**
     * Percentage of calls marked as answered by machined related like the following: `machine_start`, `machine_end_beep`, `machine_end_silence`, `machine_end_other`, `fax`
     */
    "answeredByMachinePercentage"?: number;
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
 * Options to pass to create a OutboundInstance
 */
export interface OutboundContextCreateOptions {
    /**  */
    insightsV2CreatePhoneNumbersReportRequest?: InsightsV2CreatePhoneNumbersReportRequest;
}
/**
 * Options to pass to each
 */
export interface OutboundListInstanceEachOptions {
    /** How many resources to return in each list page. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: OutboundInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface OutboundListInstanceOptions {
    /** How many resources to return in each list page. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface OutboundListInstancePageOptions {
    /** How many resources to return in each list page. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface OutboundContext {
    /**
     * Create a OutboundInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OutboundInstance
     */
    create(callback?: (error: Error | null, item?: OutboundInstance) => any): Promise<OutboundInstance>;
    /**
     * Create a OutboundInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OutboundInstance
     */
    create(params: InsightsV2CreatePhoneNumbersReportRequest, headers?: any, callback?: (error: Error | null, item?: OutboundInstance) => any): Promise<OutboundInstance>;
    /**
     * Create a OutboundInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OutboundInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<OutboundInstance>) => any): Promise<ApiResponse<OutboundInstance>>;
    /**
     * Create a OutboundInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OutboundInstance with HTTP metadata
     */
    createWithHttpInfo(params: InsightsV2CreatePhoneNumbersReportRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<OutboundInstance>) => any): Promise<ApiResponse<OutboundInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface OutboundContextSolution {
    reportId: string;
}
export declare class OutboundContextImpl implements OutboundContext {
    protected _version: V2;
    protected _solution: OutboundContextSolution;
    protected _uri: string;
    constructor(_version: V2, reportId: string);
    create(params?: InsightsV2CreatePhoneNumbersReportRequest | ((error: Error | null, item?: OutboundInstance) => any), headers?: any, callback?: (error: Error | null, item?: OutboundInstance) => any): Promise<OutboundInstance>;
    createWithHttpInfo(params?: InsightsV2CreatePhoneNumbersReportRequest | ((error: Error | null, item?: ApiResponse<OutboundInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<OutboundInstance>) => any): Promise<ApiResponse<OutboundInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): OutboundContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface OutboundPayload extends TwilioResponsePayload {
    reports: OutboundResource[];
}
interface OutboundResource {
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
    calls_by_device_type: {
        [key: string]: number;
    };
    answer_rate_device_type: {
        [key: string]: number;
    };
    blocked_calls_by_carrier: Array<CountyCarrierValue>;
    short_duration_calls_percentage: number;
    long_duration_calls_percentage: number;
    potential_robocalls_percentage: number;
    answering_machine_detection: InsightsV2OutboundPhoneNumberReportAnsweringMachineDetection;
}
export declare class OutboundInstance {
    protected _version: V2;
    protected _solution: OutboundContextSolution;
    protected _context?: OutboundContext;
    constructor(_version: V2, payload: OutboundResource, reportId?: string);
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
    /**
     * Number of calls made with each device type. `voip`, `mobile`, `landline`, `unknown`
     */
    callsByDeviceType: {
        [key: string]: number;
    };
    /**
     * Answer rate for each device type. `voip`, `mobile`, `landline`, `unknown`
     */
    answerRateDeviceType: {
        [key: string]: number;
    };
    /**
     * Percentage of blocked calls by carrier per country.
     */
    blockedCallsByCarrier: Array<CountyCarrierValue>;
    /**
     * Percentage of completed outbound calls under 10 seconds (PSTN Short call tags); More than 15% is typically low trust measured.
     */
    shortDurationCallsPercentage: number;
    /**
     * Percentage of long duration calls ( >= 60 seconds)
     */
    longDurationCallsPercentage: number;
    /**
     * Percentage of completed outbound calls to unassigned or unallocated phone numbers.
     */
    potentialRobocallsPercentage: number;
    answeringMachineDetection: InsightsV2OutboundPhoneNumberReportAnsweringMachineDetection;
    private get _proxy();
    /**
     * Create a OutboundInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OutboundInstance
     */
    create(callback?: (error: Error | null, item?: OutboundInstance) => any): Promise<OutboundInstance>;
    /**
     * Create a OutboundInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OutboundInstance
     */
    create(params: InsightsV2CreatePhoneNumbersReportRequest, headers?: any, callback?: (error: Error | null, item?: OutboundInstance) => any): Promise<OutboundInstance>;
    /**
     * Create a OutboundInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OutboundInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<OutboundInstance>) => any): Promise<ApiResponse<OutboundInstance>>;
    /**
     * Create a OutboundInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OutboundInstance with HTTP metadata
     */
    createWithHttpInfo(params: InsightsV2CreatePhoneNumbersReportRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<OutboundInstance>) => any): Promise<ApiResponse<OutboundInstance>>;
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
        callsByDeviceType: {
            [key: string]: number;
        };
        answerRateDeviceType: {
            [key: string]: number;
        };
        blockedCallsByCarrier: CountyCarrierValue[];
        shortDurationCallsPercentage: number;
        longDurationCallsPercentage: number;
        potentialRobocallsPercentage: number;
        answeringMachineDetection: InsightsV2OutboundPhoneNumberReportAnsweringMachineDetection;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface OutboundSolution {
    reportId: string;
}
export interface OutboundListInstance {
    _version: V2;
    _solution: OutboundSolution;
    _uri: string;
    (reportId: string): OutboundContext;
    get(reportId: string): OutboundContext;
    /**
     * Streams OutboundInstance records from the API.
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
     * @param { OutboundListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: OutboundInstance, done: (err?: Error) => void) => void): void;
    each(params: OutboundListInstanceEachOptions, callback?: (item: OutboundInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams OutboundInstance records from the API with HTTP metadata captured per page.
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
     * @param { OutboundListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: OutboundInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: OutboundListInstanceEachOptions, callback?: (item: OutboundInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of OutboundInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: OutboundPage) => any): Promise<OutboundPage>;
    /**
     * Retrieve a single target page of OutboundInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<OutboundPage>) => any): Promise<ApiResponse<OutboundPage>>;
    /**
     * Lists OutboundInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { OutboundListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: OutboundInstance[]) => any): Promise<OutboundInstance[]>;
    list(params: OutboundListInstanceOptions, callback?: (error: Error | null, items: OutboundInstance[]) => any): Promise<OutboundInstance[]>;
    /**
     * Lists OutboundInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { OutboundListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<OutboundInstance[]>) => any): Promise<ApiResponse<OutboundInstance[]>>;
    listWithHttpInfo(params: OutboundListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<OutboundInstance[]>) => any): Promise<ApiResponse<OutboundInstance[]>>;
    /**
     * Retrieve a single page of OutboundInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { OutboundListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: OutboundPage) => any): Promise<OutboundPage>;
    page(params: OutboundListInstancePageOptions, callback?: (error: Error | null, items: OutboundPage) => any): Promise<OutboundPage>;
    /**
     * Retrieve a single page of OutboundInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { OutboundListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<OutboundPage>) => any): Promise<ApiResponse<OutboundPage>>;
    pageWithHttpInfo(params: OutboundListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<OutboundPage>) => any): Promise<ApiResponse<OutboundPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function OutboundListInstance(version: V2, reportId: string): OutboundListInstance;
export declare class OutboundPage extends Page<V2, OutboundPayload, OutboundResource, OutboundInstance> {
    /**
     * Initialize the OutboundPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, solution: OutboundSolution);
    /**
     * Build an instance of OutboundInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: OutboundResource): OutboundInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
