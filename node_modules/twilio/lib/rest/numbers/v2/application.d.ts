import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class CreateShortCodeApplicationRequest {
    /**
     * The friendly name for the short code application.
     */
    "friendlyName": string;
    /**
     * The ISO country code.
     */
    "isoCountry": string;
    "businessInformation": CreateShortCodeApplicationRequestBusinessInformation;
    "setup": CreateShortCodeApplicationRequestSetup;
    constructor(payload: any);
}
/**
 * Business information associated with the application.
 */
export declare class CreateShortCodeApplicationRequestBusinessInformation {
    /**
     * The Compliance Profile SID for the customer-facing business profile.
     */
    "customerFacingProfile": string;
    constructor(payload: any);
}
export declare class CreateShortCodeApplicationRequestSetup {
    "chargesApply": boolean;
    constructor(payload: any);
}
/**
 * Business information associated with the application.
 */
export declare class CreateShortCodeApplicationResponseBusinessInformation {
    "managingCompanyProfile"?: string;
    "customerFacingProfile"?: string;
    "businessWebsite"?: string;
    "einManagingCompanyProfile"?: string;
    "einCustomerFacingProfile"?: string;
    constructor(payload: any);
}
/**
 * Compliance keywords for the application.
 */
export declare class CreateShortCodeApplicationResponseComplianceKeywords {
    "help"?: string;
    "stop"?: string;
    "info"?: string;
    "aide"?: string;
    "arret"?: string;
    "optOutFiltering"?: boolean;
    constructor(payload: any);
}
/**
 * Content examples for the application.
 */
export declare class CreateShortCodeApplicationResponseContentExamples {
    "examples"?: Array<string>;
    constructor(payload: any);
}
/**
 * Setup configuration for the application.
 */
export declare class CreateShortCodeApplicationResponseSetup {
    "requestType"?: string;
    "trafficType"?: string;
    "leaseType"?: string;
    "paymentFrequency"?: string;
    "shortCodePreference"?: string;
    "mmsEnabled"?: boolean;
    "freeToEndUser"?: boolean;
    "chargesApply"?: boolean;
    "currentProvider"?: string;
    "migratedMmsEnabled"?: boolean;
    "migratedLiveTraffic"?: boolean;
    constructor(payload: any);
}
/**
 * SMS campaign details for the application.
 */
export declare class CreateShortCodeApplicationResponseSmsCampaignDetails {
    "campaignName"?: string;
    "campaignBrandWebsite"?: string;
    "customerCareChannel"?: string;
    "customerCareValue"?: string;
    "campaignFrequency"?: Array<string>;
    "scUseCaseCategories"?: Array<string>;
    "smsTermsOfServiceUrl"?: string;
    "smsPrivacyPolicyUrl"?: string;
    "monthlyOutboundVolumeExpected"?: string;
    "monthlyInboundVolumeExpected"?: string;
    "avgMonthlyMessagesSentToEachSubscriber"?: string;
    "avgMonthlyMessagesReceivedFromSubscribers"?: string;
    "estimatedTotalSubscribers"?: string;
    "durationOfTheCampaign"?: string;
    "plannedTrafficSpikes"?: string;
    "spikeDetails"?: string;
    "expectedTrafficStartDate"?: string;
    constructor(payload: any);
}
/**
 * User sign-up configuration for the application.
 */
export declare class CreateShortCodeApplicationResponseUserSignUp {
    "signUpOptions"?: Array<string>;
    "doubleOptInProcess"?: boolean;
    "doubleOptInMessage"?: string;
    "signUpConfirmationMessage"?: string;
    "doubleOptInResponseMessage"?: string;
    "onlineWebFormMessage"?: string;
    "keywordMessage"?: string;
    "ivrMessage"?: string;
    "otherFormMessage"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to create a ApplicationInstance
 */
export interface ApplicationListInstanceCreateOptions {
    /**  */
    createShortCodeApplicationRequest: CreateShortCodeApplicationRequest;
}
/**
 * Options to pass to each
 */
export interface ApplicationListInstanceEachOptions {
    /** The Account SID to filter by. */
    accountSid?: string;
    /** The ISO country to filter by. */
    isoCountry?: string;
    /** The application status to filter by. */
    status?: string;
    /** The friendly name to filter by. */
    friendlyName?: string;
    /** The application SID to filter by. */
    sid?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ApplicationInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ApplicationListInstanceOptions {
    /** The Account SID to filter by. */
    accountSid?: string;
    /** The ISO country to filter by. */
    isoCountry?: string;
    /** The application status to filter by. */
    status?: string;
    /** The friendly name to filter by. */
    friendlyName?: string;
    /** The application SID to filter by. */
    sid?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface ApplicationListInstancePageOptions {
    /** The Account SID to filter by. */
    accountSid?: string;
    /** The ISO country to filter by. */
    isoCountry?: string;
    /** The application status to filter by. */
    status?: string;
    /** The friendly name to filter by. */
    friendlyName?: string;
    /** The application SID to filter by. */
    sid?: string;
    /** How many resources to return in each list page. The default is 50, and the maximum is 50. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface ApplicationContext {
    /**
     * Fetch a ApplicationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ApplicationInstance
     */
    fetch(callback?: (error: Error | null, item?: ApplicationInstance) => any): Promise<ApplicationInstance>;
    /**
     * Fetch a ApplicationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ApplicationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ApplicationInstance>) => any): Promise<ApiResponse<ApplicationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ApplicationContextSolution {
    sid: string;
}
export declare class ApplicationContextImpl implements ApplicationContext {
    protected _version: V2;
    protected _solution: ApplicationContextSolution;
    protected _uri: string;
    constructor(_version: V2, sid: string);
    fetch(callback?: (error: Error | null, item?: ApplicationInstance) => any): Promise<ApplicationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ApplicationInstance>) => any): Promise<ApiResponse<ApplicationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ApplicationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface ApplicationPayload extends TwilioResponsePayload {
    results: ApplicationResource[];
}
interface ApplicationResource {
    sid: string;
    application_requirements_sid: string;
    application_requirements_version: number;
    account_sid: string;
    bundle_sid: string;
    reviewer: string;
    zendesk_ticket_id: string;
    friendly_name: string;
    notification_emails: Array<string>;
    iso_country: string;
    state: string;
    setup: CreateShortCodeApplicationResponseSetup;
    business_information: CreateShortCodeApplicationResponseBusinessInformation;
    user_sign_up: CreateShortCodeApplicationResponseUserSignUp;
    compliance_keywords: CreateShortCodeApplicationResponseComplianceKeywords;
    content_examples: CreateShortCodeApplicationResponseContentExamples;
    sms_campaign_details: CreateShortCodeApplicationResponseSmsCampaignDetails;
    date_created: Date;
    date_updated: Date;
    created_by: string;
    updated_by: string;
}
export declare class ApplicationInstance {
    protected _version: V2;
    protected _solution: ApplicationContextSolution;
    protected _context?: ApplicationContext;
    constructor(_version: V2, payload: ApplicationResource, sid?: string);
    /**
     * The unique identifier of the Short Code Application.
     */
    sid: string;
    /**
     * The Application Requirements SID.
     */
    applicationRequirementsSid: string;
    /**
     * The version of the application requirements.
     */
    applicationRequirementsVersion: number;
    /**
     * The Account SID associated with the application.
     */
    accountSid: string;
    /**
     * The Bundle SID for regulatory compliance.
     */
    bundleSid: string;
    /**
     * The reviewer of the application.
     */
    reviewer: string;
    /**
     * The Zendesk ticket ID associated with the application.
     */
    zendeskTicketId: string;
    /**
     * The friendly name of the application.
     */
    friendlyName: string;
    /**
     * The notification emails for the application.
     */
    notificationEmails: Array<string>;
    /**
     * The ISO country code.
     */
    isoCountry: string;
    /**
     * The state of the application.
     */
    state: string;
    setup: CreateShortCodeApplicationResponseSetup;
    businessInformation: CreateShortCodeApplicationResponseBusinessInformation;
    userSignUp: CreateShortCodeApplicationResponseUserSignUp;
    complianceKeywords: CreateShortCodeApplicationResponseComplianceKeywords;
    contentExamples: CreateShortCodeApplicationResponseContentExamples;
    smsCampaignDetails: CreateShortCodeApplicationResponseSmsCampaignDetails;
    /**
     * The date and time the application was created.
     */
    dateCreated: Date;
    /**
     * The date and time the application was last updated.
     */
    dateUpdated: Date;
    /**
     * The identity of the user who created the application.
     */
    createdBy: string;
    /**
     * The identity of the user who last updated the application.
     */
    updatedBy: string;
    private get _proxy();
    /**
     * Fetch a ApplicationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ApplicationInstance
     */
    fetch(callback?: (error: Error | null, item?: ApplicationInstance) => any): Promise<ApplicationInstance>;
    /**
     * Fetch a ApplicationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ApplicationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ApplicationInstance>) => any): Promise<ApiResponse<ApplicationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        applicationRequirementsSid: string;
        applicationRequirementsVersion: number;
        accountSid: string;
        bundleSid: string;
        reviewer: string;
        zendeskTicketId: string;
        friendlyName: string;
        notificationEmails: string[];
        isoCountry: string;
        state: string;
        setup: CreateShortCodeApplicationResponseSetup;
        businessInformation: CreateShortCodeApplicationResponseBusinessInformation;
        userSignUp: CreateShortCodeApplicationResponseUserSignUp;
        complianceKeywords: CreateShortCodeApplicationResponseComplianceKeywords;
        contentExamples: CreateShortCodeApplicationResponseContentExamples;
        smsCampaignDetails: CreateShortCodeApplicationResponseSmsCampaignDetails;
        dateCreated: Date;
        dateUpdated: Date;
        createdBy: string;
        updatedBy: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ApplicationSolution {
}
export interface ApplicationListInstance {
    _version: V2;
    _solution: ApplicationSolution;
    _uri: string;
    (sid: string): ApplicationContext;
    get(sid: string): ApplicationContext;
    /**
     * Create a ApplicationInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ApplicationInstance
     */
    create(params: CreateShortCodeApplicationRequest, headers?: any, callback?: (error: Error | null, item?: ApplicationInstance) => any): Promise<ApplicationInstance>;
    /**
     * Create a ApplicationInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ApplicationInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateShortCodeApplicationRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ApplicationInstance>) => any): Promise<ApiResponse<ApplicationInstance>>;
    /**
     * Streams ApplicationInstance records from the API.
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
     * @param { ApplicationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: ApplicationInstance, done: (err?: Error) => void) => void): void;
    each(params: ApplicationListInstanceEachOptions, callback?: (item: ApplicationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams ApplicationInstance records from the API with HTTP metadata captured per page.
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
     * @param { ApplicationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: ApplicationInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ApplicationListInstanceEachOptions, callback?: (item: ApplicationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ApplicationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ApplicationPage) => any): Promise<ApplicationPage>;
    /**
     * Retrieve a single target page of ApplicationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ApplicationPage>) => any): Promise<ApiResponse<ApplicationPage>>;
    /**
     * Lists ApplicationInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ApplicationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: ApplicationInstance[]) => any): Promise<ApplicationInstance[]>;
    list(params: ApplicationListInstanceOptions, callback?: (error: Error | null, items: ApplicationInstance[]) => any): Promise<ApplicationInstance[]>;
    /**
     * Lists ApplicationInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ApplicationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ApplicationInstance[]>) => any): Promise<ApiResponse<ApplicationInstance[]>>;
    listWithHttpInfo(params: ApplicationListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<ApplicationInstance[]>) => any): Promise<ApiResponse<ApplicationInstance[]>>;
    /**
     * Retrieve a single page of ApplicationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ApplicationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ApplicationPage) => any): Promise<ApplicationPage>;
    page(params: ApplicationListInstancePageOptions, callback?: (error: Error | null, items: ApplicationPage) => any): Promise<ApplicationPage>;
    /**
     * Retrieve a single page of ApplicationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ApplicationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ApplicationPage>) => any): Promise<ApiResponse<ApplicationPage>>;
    pageWithHttpInfo(params: ApplicationListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ApplicationPage>) => any): Promise<ApiResponse<ApplicationPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ApplicationListInstance(version: V2): ApplicationListInstance;
export declare class ApplicationPage extends Page<V2, ApplicationPayload, ApplicationResource, ApplicationInstance> {
    /**
     * Initialize the ApplicationPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V2, response: Response<string>, solution: ApplicationSolution);
    /**
     * Build an instance of ApplicationInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ApplicationResource): ApplicationInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
