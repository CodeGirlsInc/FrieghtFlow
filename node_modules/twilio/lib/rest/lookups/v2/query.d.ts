import { inspect, InspectOptions } from "util";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class CallForwardingInfo {
    "callForwardingEnabled"?: boolean;
    "errorCode"?: number;
    constructor(payload: any);
}
export declare class CallerNameInfo {
    "callerName"?: string;
    "callerType"?: string;
    "errorCode"?: number;
    constructor(payload: any);
}
export declare class IdentityMatchInfo {
    "firstNameMatch"?: string;
    "lastNameMatch"?: string;
    "addressLinesMatch"?: string;
    "cityMatch"?: string;
    "stateMatch"?: string;
    "postalCodeMatch"?: string;
    "addressCountryMatch"?: string;
    "nationalIdMatch"?: string;
    "dateOfBirthMatch"?: string;
    "summaryScore"?: number;
    "errorCode"?: number;
    "errorMessage"?: string;
    constructor(payload: any);
}
export declare class IdentityMatchParameters {
    "firstName"?: string;
    "lastName"?: string;
    "addressLine1"?: string;
    "addressLine2"?: string;
    "city"?: string;
    "state"?: string;
    "postalCode"?: string;
    "addressCountryCode"?: string;
    "nationalId"?: string;
    "dateOfBirth"?: string;
    constructor(payload: any);
}
export declare class LastSimSwapInfo {
    "lastSimSwapDate"?: Date;
    "swappedPeriod"?: string;
    "swappedInPeriod"?: boolean;
    constructor(payload: any);
}
export declare class LineStatusInfo {
    "status"?: string;
    "errorCode"?: number;
    constructor(payload: any);
}
export declare class LineTypeIntelligenceInfo {
    "mobileCountryCode"?: string;
    "mobileNetworkCode"?: string;
    "carrierName"?: string;
    "type"?: string;
    "errorCode"?: number;
    constructor(payload: any);
}
export declare class LookupBatchRequest {
    /**
     * Unique identifier used to match request with response
     */
    "correlationId"?: string;
    "phoneNumber": string;
    "fields"?: Array<string>;
    "countryCode"?: string;
    "identityMatch"?: IdentityMatchParameters;
    "reassignedNumber"?: ReassignedNumberParameters;
    "smsPumpingRisk"?: RiskParameters;
    constructor(payload: any);
}
export declare class LookupBatchResponse {
    /**
     * Unique identifier used to match request with response
     */
    "correlationId"?: string;
    /**
     * Twilio error code in case that the request to downstream fails
     */
    "twilioErrorCode"?: number;
    "callingCountryCode"?: string;
    "countryCode"?: string;
    "phoneNumber"?: string;
    "nationalFormat"?: string;
    "valid"?: boolean;
    "validationErrors"?: Array<string>;
    "callerName"?: CallerNameInfo;
    "simSwap"?: SimSwapInfo;
    "callForwarding"?: CallForwardingInfo;
    "lineTypeIntelligence"?: LineTypeIntelligenceInfo;
    "lineStatus"?: LineStatusInfo;
    "identityMatch"?: IdentityMatchInfo;
    "reassignedNumber"?: ReassignedNumberInfo;
    "smsPumpingRisk"?: SmsPumpingRiskInfo;
    "phoneNumberQualityScore"?: any | null;
    "preFill"?: any | null;
    constructor(payload: any);
}
export declare class LookupRequest {
    "phoneNumbers"?: Array<LookupBatchRequest>;
    constructor(payload: any);
}
export declare class ReassignedNumberInfo {
    "lastVerifiedDate"?: string;
    "isNumberReassigned"?: string;
    "errorCode"?: string;
    constructor(payload: any);
}
export declare class ReassignedNumberParameters {
    "lastVerifiedDate"?: string;
    constructor(payload: any);
}
export declare class RiskParameters {
    "partnerSubId"?: string;
    constructor(payload: any);
}
export declare class SimSwapInfo {
    "lastSimSwap"?: LastSimSwapInfo;
    "carrierName"?: string;
    "mobileCountryCode"?: string;
    "mobileNetworkCode"?: string;
    "errorCode"?: number;
    constructor(payload: any);
}
export declare class SmsPumpingRiskInfo {
    "carrierRiskCategory"?: string;
    "numberBlocked"?: boolean;
    "numberBlockedDate"?: Date;
    "numberBlockedLast3Months"?: boolean;
    "smsPumpingRiskScore"?: number;
    "errorCode"?: number;
    constructor(payload: any);
}
/**
 * Options to pass to create a QueryInstance
 */
export interface QueryListInstanceCreateOptions {
    /**  */
    lookupRequest?: LookupRequest;
}
export interface QuerySolution {
}
export interface QueryListInstance {
    _version: V2;
    _solution: QuerySolution;
    _uri: string;
    /**
     * Create a QueryInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed QueryInstance
     */
    create(callback?: (error: Error | null, item?: QueryInstance) => any): Promise<QueryInstance>;
    /**
     * Create a QueryInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed QueryInstance
     */
    create(params: LookupRequest, headers?: any, callback?: (error: Error | null, item?: QueryInstance) => any): Promise<QueryInstance>;
    /**
     * Create a QueryInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed QueryInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<QueryInstance>) => any): Promise<ApiResponse<QueryInstance>>;
    /**
     * Create a QueryInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed QueryInstance with HTTP metadata
     */
    createWithHttpInfo(params: LookupRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<QueryInstance>) => any): Promise<ApiResponse<QueryInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function QueryListInstance(version: V2): QueryListInstance;
interface QueryResource {
    phone_numbers: Array<LookupBatchResponse>;
}
export declare class QueryInstance {
    protected _version: V2;
    constructor(_version: V2, payload: QueryResource);
    phoneNumbers: Array<LookupBatchResponse>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        phoneNumbers: LookupBatchResponse[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
