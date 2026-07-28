import { inspect, InspectOptions } from "util";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class AccountReport {
    /**
     * The call deliverability score measures the network effectiveness in delivering calls by scoring calls reach the intended recipient. The score is a value between 0 and 100, where 100 indicates that all calls were successfully delivered.
     */
    "callDeliverabilityScore"?: number;
    /**
     * The call answer score measures customers behavior to the delivered calls. The score is a value between 0 and 100, where 100 indicates that all calls were successfully answered.
     */
    "callAnswerScore"?: number;
    /**
     * Total number of calls made during the report period.
     */
    "totalCalls"?: number;
    "callDirection"?: AccountReportCallDirection;
    "callState"?: AccountReportCallState;
    "callType"?: AccountReportCallType;
    /**
     * Average length of call in seconds.
     */
    "aloc"?: number;
    /**
     * Number of calls made in each Twilio Edge location. Refer to [Public Edge Locations](https://www.twilio.com/docs/global-infrastructure/edge-locations#public-edge-locations) for more detail.
     */
    "twilioEdgeLocation"?: {
        [key: string]: number;
    };
    /**
     * Number of calls originating from each country (ISO alpha-2).
     */
    "callerCountryCode"?: {
        [key: string]: number;
    };
    /**
     * Number of calls terminating in each country (ISO alpha-2).
     */
    "calleeCountryCode"?: {
        [key: string]: number;
    };
    /**
     * Average queue time in milliseconds.
     */
    "averageQueueTimeMs"?: number;
    /**
     * Percentage of silent calls.
     */
    "silentCallsPercentage"?: number;
    "networkIssues"?: AccountReportNetworkIssues;
    "kYT"?: AccountReportKYT;
    "answeringMachineDetection"?: AccountReportAnsweringMachineDetection;
    constructor(payload: any);
}
/**
 * Number of calls made in each answering machine detection.
 */
export declare class AccountReportAnsweringMachineDetection {
    /**
     * Total number of calls with answering machine detection enabled (AMD).
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
/**
 * Number of calls made in each direction.
 */
export declare class AccountReportCallDirection {
    /**
     * Number of outbound calls
     */
    "outbound"?: number;
    /**
     * Number of inbound calls
     */
    "inbound"?: number;
    constructor(payload: any);
}
/**
 * Number of calls made in each state.
 */
export declare class AccountReportCallState {
    /**
     * Number of completed calls
     */
    "completed"?: number;
    /**
     * Number of failed calls
     */
    "fail"?: number;
    /**
     * Number of busy calls
     */
    "busy"?: number;
    /**
     * Number of no-answer calls
     */
    "noanswer"?: number;
    /**
     * Number of canceled calls
     */
    "canceled"?: number;
    constructor(payload: any);
}
/**
 * Number of calls made in each type. `carrier`, `sip`, `trunking`, `client`, `whatsapp`
 */
export declare class AccountReportCallType {
    /**
     * Number of carrier calls
     */
    "carrier"?: number;
    /**
     * Number of SIP calls
     */
    "sip"?: number;
    /**
     * Number of trunking calls
     */
    "trunking"?: number;
    /**
     * Number of client calls
     */
    "client"?: number;
    /**
     * Number of WhatsApp Business calls
     */
    "whatsapp"?: number;
    constructor(payload: any);
}
/**
 * Know Your Traffic (KYT) metrics focused on outbound carrier performance and trust signals for the report period.
 */
export declare class AccountReportKYT {
    "outboundCarrierCalling"?: AccountReportKYTOutboundCarrierCalling;
    constructor(payload: any);
}
/**
 * KYT metrics for outbound carrier calling.
 */
export declare class AccountReportKYTOutboundCarrierCalling {
    /**
     * Number of unique PSTN calling numbers to non-Twilio numbers during the report period.
     */
    "uniqueCallingNumbers"?: number;
    /**
     * Number of unique non-Twilio PSTN called numbers during the report period.
     */
    "uniqueCalledNumbers"?: number;
    /**
     * Percentage of blocked calls by carrier per country.
     */
    "blockedCallsByCarrier"?: Array<CountyCarrierValue>;
    /**
     * Percentage of completed outbound calls under 10 seconds (PSTN Short call tags); More than 15% is typically low trust measured.
     */
    "shortDurationCallsPercentage"?: number;
    /**
     * Percentage of long duration calls ( >= 60 seconds)
     */
    "longDurationCallsPercentage"?: number;
    /**
     * Percentage of completed outbound calls to unassigned or unallocated phone numbers.
     */
    "potentialRobocallsPercentage"?: number;
    "brandedCalling"?: BrandedCalling;
    "voiceIntegrity"?: VoiceIntegrity;
    "stirShaken"?: StirShaken;
    constructor(payload: any);
}
/**
 * Network-quality indicators for SDK and Twilio Gateway traffic during the report period.
 */
export declare class AccountReportNetworkIssues {
    "sdk"?: AccountReportNetworkIssuesSdk;
    "twilioGateway"?: AccountReportNetworkIssuesTwilioGateway;
    constructor(payload: any);
}
/**
 * Network issues of calls for client type. This is indicative of local network issues.
 */
export declare class AccountReportNetworkIssuesSdk {
    /**
     * Percentage of ICE connection failure tag that ICE candidates have failed to find compatible connection.
     */
    "iceFailuresPercentage"?: number;
    /**
     * Percentage of calls with high latency.
     */
    "highLatencyPercentage"?: number;
    /**
     * Percentage of calls with high packet loss.
     */
    "highPacketLossPercentage"?: number;
    /**
     * Percentage of calls with high jitter.
     */
    "highJitterPercentage"?: number;
    constructor(payload: any);
}
/**
 * Network related metrics for Twilio Gateway calls only.
 */
export declare class AccountReportNetworkIssuesTwilioGateway {
    /**
     * Percentage of calls with high latency.
     */
    "highLatencyPercentage"?: number;
    /**
     * Percentage of calls with high packet loss.
     */
    "highPacketLossPercentage"?: number;
    /**
     * Percentage of calls with high jitter.
     */
    "highJitterPercentage"?: number;
    constructor(payload: any);
}
/**
 * Metrics related to Branded Calling bundled calls including CTIA for the report period.
 */
export declare class BrandedCalling {
    /**
     * Total number of Branded bundled calls.
     */
    "totalBrandedCalls"?: number;
    /**
     * Percentage of Branded bundled calls over total outbound calls.
     */
    "percentBrandedCalls"?: number;
    /**
     * Answer rate for Branded bundled calls.
     */
    "answerRate"?: number;
    /**
     * Rate of Branded bundled calls that were answered by Human.
     */
    "humanAnswerRate"?: number;
    /**
     * Engagement Rate for Branded bundled calls where its call length is longer than 60 seconds.
     */
    "engagementRate"?: number;
    /**
     * Details of branded calls by use case.
     */
    "byUseCase"?: Array<BrandedUseCaseDetail>;
    constructor(payload: any);
}
/**
 * Associated metrics for Branded calls grouped by each use case.
 */
export declare class BrandedUseCaseDetail {
    /**
     * The name of supported use case for Branded calls.
     */
    "useCase"?: string;
    /**
     * The number of phone numbers enabled Branded calls.
     */
    "enabledPhonenumbers"?: number;
    /**
     * The number of total outbound calls for the use case.
     */
    "totalCalls"?: number;
    /**
     * Answer rate per each use case for Branded bundled calls.
     */
    "answerRate"?: number;
    /**
     * Rate of Branded bundled calls that were answered by Human per each use case for Branded bundled calls.
     */
    "humanAnswerRate"?: number;
    /**
     * Engagement Rate for Branded bundled calls where its call length is longer than 60 seconds per each use case for Branded bundled calls.
     */
    "engagementRate"?: number;
    constructor(payload: any);
}
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
export declare class InsightsV2CreateAccountReportRequest {
    "timeRange"?: InsightsV2CreateAccountReportRequestTimeRange;
    "filters"?: Array<ReportFilter>;
    constructor(payload: any);
}
/**
 * Optional start and end date time for the report window. Defaults to the most recent 7 days when omitted.
 */
export declare class InsightsV2CreateAccountReportRequestTimeRange {
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
 * Metrics related to STIR/SHAKEN attestation A, B, and C for the report period.
 */
export declare class StirShaken {
    "callCount"?: StirShakenCallCount;
    "percentage"?: StirShakenPercentage;
    "answerRate"?: StirShakenAnswerRate;
    constructor(payload: any);
}
/**
 * Answer rate for each STIR/SHAKEN attestation category.
 */
export declare class StirShakenAnswerRate {
    /**
     * Answer rate for Stir Shaken category A.
     */
    "stshA"?: number;
    /**
     * Answer rate for Stir Shaken category B.
     */
    "stshB"?: number;
    /**
     * Answer rate for Stir Shaken category C.
     */
    "stshC"?: number;
    constructor(payload: any);
}
/**
 * Total number of calls for each STIR/SHAKEN attestation category.
 */
export declare class StirShakenCallCount {
    /**
     * Total number of calls for Stir Shaken category A.
     */
    "stshA"?: number;
    /**
     * Total number of calls for Stir Shaken category B.
     */
    "stshB"?: number;
    /**
     * Total number of calls for Stir Shaken category C.
     */
    "stshC"?: number;
    constructor(payload: any);
}
/**
 * Percentage of calls for each STIR/SHAKEN attestation category.
 */
export declare class StirShakenPercentage {
    /**
     * Percentage of calls for Stir Shaken category A.
     */
    "stshA"?: number;
    /**
     * Percentage of calls for Stir Shaken category B.
     */
    "stshB"?: number;
    /**
     * Percentage of calls for Stir Shaken category C.
     */
    "stshC"?: number;
    constructor(payload: any);
}
/**
 * Metrics related to Voice Integrity enabled calls for the report period.
 */
export declare class VoiceIntegrity {
    /**
     * Total number of calls with Voice Integrity enabled.
     */
    "enabledCalls"?: number;
    /**
     * Percentage of calls with Voice Integrity enabled.
     */
    "enabledPercentage"?: number;
    /**
     * Number of calls per Voice Integrity enabled Bundle Sid.
     */
    "callsPerBundle"?: Array<VoiceIntegrityCallsPerBundle>;
    constructor(payload: any);
}
export declare class VoiceIntegrityCallsPerBundle {
    /**
     * Voice Integrity Approved Profile Sid.
     */
    "bundleSid"?: string;
    /**
     * The number of Voice Integrity enabled and registered phone numbers per Bundle Sid.
     */
    "enabledPhonenumbers"?: number;
    /**
     * The number of outbound calls on Voice Integrity enabled and registered number per Bundle Sid.
     */
    "totalCalls"?: number;
    /**
     * Answer rate for calls on Voice Integrity enabled and registered number per Bundle Sid.
     */
    "answerRate"?: number;
    /**
     * Rate for calls on Voice Integrity enabled and registered number per Bundle Sid that were answered by Human per each use case for Branded bundled calls.
     */
    "humanAnswerRate"?: number;
    constructor(payload: any);
}
/**
 * Options to pass to create a ReportInstance
 */
export interface ReportContextCreateOptions {
    /**  */
    insightsV2CreateAccountReportRequest?: InsightsV2CreateAccountReportRequest;
}
export interface ReportContext {
    /**
     * Create a ReportInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance
     */
    create(callback?: (error: Error | null, item?: ReportInstance) => any): Promise<ReportInstance>;
    /**
     * Create a ReportInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance
     */
    create(params: InsightsV2CreateAccountReportRequest, headers?: any, callback?: (error: Error | null, item?: ReportInstance) => any): Promise<ReportInstance>;
    /**
     * Create a ReportInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ReportInstance>) => any): Promise<ApiResponse<ReportInstance>>;
    /**
     * Create a ReportInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance with HTTP metadata
     */
    createWithHttpInfo(params: InsightsV2CreateAccountReportRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ReportInstance>) => any): Promise<ApiResponse<ReportInstance>>;
    /**
     * Fetch a ReportInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance
     */
    fetch(callback?: (error: Error | null, item?: ReportInstance) => any): Promise<ReportInstance>;
    /**
     * Fetch a ReportInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ReportInstance>) => any): Promise<ApiResponse<ReportInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ReportContextSolution {
    reportId: string;
}
export declare class ReportContextImpl implements ReportContext {
    protected _version: V2;
    protected _solution: ReportContextSolution;
    protected _uri: string;
    constructor(_version: V2, reportId: string);
    create(params?: InsightsV2CreateAccountReportRequest | ((error: Error | null, item?: ReportInstance) => any), headers?: any, callback?: (error: Error | null, item?: ReportInstance) => any): Promise<ReportInstance>;
    createWithHttpInfo(params?: InsightsV2CreateAccountReportRequest | ((error: Error | null, item?: ApiResponse<ReportInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<ReportInstance>) => any): Promise<ApiResponse<ReportInstance>>;
    fetch(callback?: (error: Error | null, item?: ReportInstance) => any): Promise<ReportInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ReportInstance>) => any): Promise<ApiResponse<ReportInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ReportContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface ReportResource {
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
    report: AccountReport;
}
export declare class ReportInstance {
    protected _version: V2;
    protected _solution: ReportContextSolution;
    protected _context?: ReportContext;
    constructor(_version: V2, payload: ReportResource, reportId?: string);
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
    report: AccountReport;
    private get _proxy();
    /**
     * Create a ReportInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance
     */
    create(callback?: (error: Error | null, item?: ReportInstance) => any): Promise<ReportInstance>;
    /**
     * Create a ReportInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance
     */
    create(params: InsightsV2CreateAccountReportRequest, headers?: any, callback?: (error: Error | null, item?: ReportInstance) => any): Promise<ReportInstance>;
    /**
     * Create a ReportInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ReportInstance>) => any): Promise<ApiResponse<ReportInstance>>;
    /**
     * Create a ReportInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance with HTTP metadata
     */
    createWithHttpInfo(params: InsightsV2CreateAccountReportRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ReportInstance>) => any): Promise<ApiResponse<ReportInstance>>;
    /**
     * Fetch a ReportInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance
     */
    fetch(callback?: (error: Error | null, item?: ReportInstance) => any): Promise<ReportInstance>;
    /**
     * Fetch a ReportInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ReportInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ReportInstance>) => any): Promise<ApiResponse<ReportInstance>>;
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
        report: AccountReport;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ReportSolution {
}
export interface ReportListInstance {
    _version: V2;
    _solution: ReportSolution;
    _uri: string;
    (reportId: string): ReportContext;
    get(reportId: string): ReportContext;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ReportListInstance(version: V2): ReportListInstance;
export {};
