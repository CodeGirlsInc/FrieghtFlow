import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../base/Page";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * The organizational authority for business registrations. Required for all business types except SOLE_PROPRIETOR.
 */
export type TollfreeVerificationBusinessRegistrationAuthority = "EIN" | "CBN" | "CRN" | "PROVINCIAL_NUMBER" | "VAT" | "ACN" | "ABN" | "BRN" | "SIREN" | "SIRET" | "NZBN" | "USt-IdNr" | "CIF" | "NIF" | "CNPJ" | "UID" | "NEQ" | "OTHER";
/**
 * The type of business, valid values are PRIVATE_PROFIT, PUBLIC_PROFIT, NON_PROFIT, SOLE_PROPRIETOR, GOVERNMENT. Required field.
 */
export type TollfreeVerificationBusinessType = "PRIVATE_PROFIT" | "PUBLIC_PROFIT" | "SOLE_PROPRIETOR" | "NON_PROFIT" | "GOVERNMENT";
/**
 * Describe how a user opts-in to text messages.
 */
export type TollfreeVerificationOptInType = "VERBAL" | "WEB_FORM" | "PAPER_FORM" | "VIA_TEXT" | "MOBILE_QR_CODE" | "IMPORT" | "IMPORT_PLEASE_REPLACE";
/**
 * The compliance status of the Tollfree Verification record.
 */
export type TollfreeVerificationStatus = "PENDING_REVIEW" | "IN_REVIEW" | "TWILIO_APPROVED" | "TWILIO_REJECTED";
/**
 * The third-party political vetting provider.
 */
export type TollfreeVerificationVettingProvider = "CAMPAIGN_VERIFY";
/**
 * Options to pass to update a TollfreeVerificationInstance
 */
export interface TollfreeVerificationContextUpdateOptions {
    /** The name of the business or organization using the Tollfree number. */
    businessName?: string;
    /** The website of the business or organization using the Tollfree number. */
    businessWebsite?: string;
    /** The email address to receive the notification about the verification result. . */
    notificationEmail?: string;
    /** The category of the use case for the Tollfree Number. List as many as are applicable. */
    useCaseCategories?: Array<string>;
    /** Use this to further explain how messaging is used by the business or organization. */
    useCaseSummary?: string;
    /** An example of message content, i.e. a sample message. */
    productionMessageSample?: string;
    /** Link to an image that shows the opt-in workflow. Multiple images allowed and must be a publicly hosted URL. */
    optInImageUrls?: Array<string>;
    /**  */
    optInType?: TollfreeVerificationOptInType;
    /** Estimate monthly volume of messages from the Tollfree Number. */
    messageVolume?: string;
    /** The address of the business or organization using the Tollfree number. */
    businessStreetAddress?: string;
    /** The address of the business or organization using the Tollfree number. */
    businessStreetAddress2?: string;
    /** The city of the business or organization using the Tollfree number. */
    businessCity?: string;
    /** The state/province/region of the business or organization using the Tollfree number. */
    businessStateProvinceRegion?: string;
    /** The postal code of the business or organization using the Tollfree number. */
    businessPostalCode?: string;
    /** The country of the business or organization using the Tollfree number. */
    businessCountry?: string;
    /** Additional information to be provided for verification. */
    additionalInformation?: string;
    /** The first name of the contact for the business or organization using the Tollfree number. */
    businessContactFirstName?: string;
    /** The last name of the contact for the business or organization using the Tollfree number. */
    businessContactLastName?: string;
    /** The email address of the contact for the business or organization using the Tollfree number. */
    businessContactEmail?: string;
    /** The E.164 formatted phone number of the contact for the business or organization using the Tollfree number. */
    businessContactPhone?: string;
    /** Describe why the verification is being edited. If the verification was rejected because of a technical issue, such as the website being down, and the issue has been resolved this parameter should be set to something similar to \\\'Website fixed\\\'. */
    editReason?: string;
    /** A legally recognized business registration number */
    businessRegistrationNumber?: string;
    /**  */
    businessRegistrationAuthority?: TollfreeVerificationBusinessRegistrationAuthority;
    /** Country business is registered in */
    businessRegistrationCountry?: string;
    /**  */
    businessType?: TollfreeVerificationBusinessType;
    /** The E.164 formatted number associated with the business. */
    businessRegistrationPhoneNumber?: string;
    /** Trade name, sub entity, or downstream business name of business being submitted for verification */
    doingBusinessAs?: string;
    /** The confirmation message sent to users when they opt in to receive messages. */
    optInConfirmationMessage?: string;
    /** A sample help message provided to users. */
    helpMessageSample?: string;
    /** The URL to the privacy policy for the business or organization. */
    privacyPolicyUrl?: string;
    /** The URL to the terms and conditions for the business or organization. */
    termsAndConditionsUrl?: string;
    /** Indicates if the content is age gated. */
    ageGatedContent?: boolean;
    /** List of keywords that users can text in to opt in to receive messages. */
    optInKeywords?: Array<string>;
    /**  */
    vettingProvider?: TollfreeVerificationVettingProvider;
    /** The unique ID of the vetting */
    vettingId?: string;
}
/**
 * Options to pass to create a TollfreeVerificationInstance
 */
export interface TollfreeVerificationListInstanceCreateOptions {
    /** The name of the business or organization using the Tollfree number. */
    businessName: string;
    /** The website of the business or organization using the Tollfree number. */
    businessWebsite: string;
    /** The email address to receive the notification about the verification result. . */
    notificationEmail: string;
    /** The category of the use case for the Tollfree Number. List as many as are applicable. */
    useCaseCategories: Array<string>;
    /** Use this to further explain how messaging is used by the business or organization. */
    useCaseSummary: string;
    /** An example of message content, i.e. a sample message. */
    productionMessageSample: string;
    /** Link to an image that shows the opt-in workflow. Multiple images allowed and must be a publicly hosted URL. */
    optInImageUrls: Array<string>;
    /**  */
    optInType: TollfreeVerificationOptInType;
    /** Estimate monthly volume of messages from the Tollfree Number. */
    messageVolume: string;
    /** The SID of the Phone Number associated with the Tollfree Verification. */
    tollfreePhoneNumberSid: string;
    /** Customer\\\'s Profile Bundle BundleSid. */
    customerProfileSid?: string;
    /** The address of the business or organization using the Tollfree number. */
    businessStreetAddress?: string;
    /** The address of the business or organization using the Tollfree number. */
    businessStreetAddress2?: string;
    /** The city of the business or organization using the Tollfree number. */
    businessCity?: string;
    /** The state/province/region of the business or organization using the Tollfree number. */
    businessStateProvinceRegion?: string;
    /** The postal code of the business or organization using the Tollfree number. */
    businessPostalCode?: string;
    /** The country of the business or organization using the Tollfree number. */
    businessCountry?: string;
    /** Additional information to be provided for verification. */
    additionalInformation?: string;
    /** The first name of the contact for the business or organization using the Tollfree number. */
    businessContactFirstName?: string;
    /** The last name of the contact for the business or organization using the Tollfree number. */
    businessContactLastName?: string;
    /** The email address of the contact for the business or organization using the Tollfree number. */
    businessContactEmail?: string;
    /** The E.164 formatted phone number of the contact for the business or organization using the Tollfree number. */
    businessContactPhone?: string;
    /** An optional external reference ID supplied by customer and echoed back on status retrieval. */
    externalReferenceId?: string;
    /** A legally recognized business registration number. Required for all business types except SOLE_PROPRIETOR. */
    businessRegistrationNumber?: string;
    /**  */
    businessRegistrationAuthority?: TollfreeVerificationBusinessRegistrationAuthority;
    /** The country where the business is registered. Required for all business types except SOLE_PROPRIETOR. */
    businessRegistrationCountry?: string;
    /**  */
    businessType?: TollfreeVerificationBusinessType;
    /** The E.164 formatted number associated with the business. */
    businessRegistrationPhoneNumber?: string;
    /** Trade name, sub entity, or downstream business name of business being submitted for verification */
    doingBusinessAs?: string;
    /** The confirmation message sent to users when they opt in to receive messages. */
    optInConfirmationMessage?: string;
    /** A sample help message provided to users. */
    helpMessageSample?: string;
    /** The URL to the privacy policy for the business or organization. */
    privacyPolicyUrl?: string;
    /** The URL to the terms and conditions for the business or organization. */
    termsAndConditionsUrl?: string;
    /** Indicates if the content is age gated. */
    ageGatedContent?: boolean;
    /** List of keywords that users can text in to opt in to receive messages. */
    optInKeywords?: Array<string>;
    /**  */
    vettingProvider?: TollfreeVerificationVettingProvider;
    /** The unique ID of the vetting */
    vettingId?: string;
}
/**
 * Options to pass to each
 */
export interface TollfreeVerificationListInstanceEachOptions {
    /** The SID of the Phone Number associated with the Tollfree Verification. */
    tollfreePhoneNumberSid?: string;
    /** The compliance status of the Tollfree Verification record. */
    status?: TollfreeVerificationStatus;
    /** Customer supplied reference id for the Tollfree Verification record. */
    externalReferenceId?: string;
    /** Whether to include Tollfree Verifications from sub accounts in list response. */
    includeSubAccounts?: boolean;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** The trust product sids / tollfree bundle sids of tollfree verifications */
    trustProductSid?: Array<string>;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: TollfreeVerificationInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface TollfreeVerificationListInstanceOptions {
    /** The SID of the Phone Number associated with the Tollfree Verification. */
    tollfreePhoneNumberSid?: string;
    /** The compliance status of the Tollfree Verification record. */
    status?: TollfreeVerificationStatus;
    /** Customer supplied reference id for the Tollfree Verification record. */
    externalReferenceId?: string;
    /** Whether to include Tollfree Verifications from sub accounts in list response. */
    includeSubAccounts?: boolean;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** The trust product sids / tollfree bundle sids of tollfree verifications */
    trustProductSid?: Array<string>;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface TollfreeVerificationListInstancePageOptions {
    /** The SID of the Phone Number associated with the Tollfree Verification. */
    tollfreePhoneNumberSid?: string;
    /** The compliance status of the Tollfree Verification record. */
    status?: TollfreeVerificationStatus;
    /** Customer supplied reference id for the Tollfree Verification record. */
    externalReferenceId?: string;
    /** Whether to include Tollfree Verifications from sub accounts in list response. */
    includeSubAccounts?: boolean;
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** The trust product sids / tollfree bundle sids of tollfree verifications */
    trustProductSid?: Array<string>;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface TollfreeVerificationContext {
    /**
     * Remove a TollfreeVerificationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a TollfreeVerificationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a TollfreeVerificationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance
     */
    fetch(callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    /**
     * Fetch a TollfreeVerificationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    /**
     * Update a TollfreeVerificationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance
     */
    update(callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    /**
     * Update a TollfreeVerificationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance
     */
    update(params: TollfreeVerificationContextUpdateOptions, callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    /**
     * Update a TollfreeVerificationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    /**
     * Update a TollfreeVerificationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance with HTTP metadata
     */
    updateWithHttpInfo(params: TollfreeVerificationContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface TollfreeVerificationContextSolution {
    sid: string;
}
export declare class TollfreeVerificationContextImpl implements TollfreeVerificationContext {
    protected _version: V1;
    protected _solution: TollfreeVerificationContextSolution;
    protected _uri: string;
    constructor(_version: V1, sid: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    update(params?: TollfreeVerificationContextUpdateOptions | ((error: Error | null, item?: TollfreeVerificationInstance) => any), callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    updateWithHttpInfo(params?: TollfreeVerificationContextUpdateOptions | ((error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): TollfreeVerificationContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface TollfreeVerificationPayload extends TwilioResponsePayload {
    verifications: TollfreeVerificationResource[];
}
interface TollfreeVerificationResource {
    sid: string;
    account_sid: string;
    customer_profile_sid: string;
    trust_product_sid: string;
    date_created: Date;
    date_updated: Date;
    regulated_item_sid: string;
    business_name: string;
    business_street_address: string;
    business_street_address2: string;
    business_city: string;
    business_state_province_region: string;
    business_postal_code: string;
    business_country: string;
    business_website: string;
    business_contact_first_name: string;
    business_contact_last_name: string;
    business_contact_email: string;
    business_contact_phone: string;
    notification_email: string;
    use_case_categories: Array<string>;
    use_case_summary: string;
    production_message_sample: string;
    opt_in_image_urls: Array<string>;
    opt_in_type: TollfreeVerificationOptInType;
    message_volume: string;
    additional_information: string;
    tollfree_phone_number_sid: string;
    tollfree_phone_number: string;
    status: TollfreeVerificationStatus;
    url: string;
    rejection_reason: string;
    error_code: number;
    edit_expiration: Date;
    edit_allowed: boolean;
    business_registration_number: string;
    business_registration_authority: TollfreeVerificationBusinessRegistrationAuthority;
    business_registration_country: string;
    business_type: TollfreeVerificationBusinessType;
    business_registration_phone_number: string;
    doing_business_as: string;
    opt_in_confirmation_message: string;
    help_message_sample: string;
    privacy_policy_url: string;
    terms_and_conditions_url: string;
    age_gated_content: boolean;
    opt_in_keywords: Array<string>;
    rejection_reasons: Array<any>;
    resource_links: any;
    external_reference_id: string;
    vetting_id: string;
    vetting_provider: TollfreeVerificationVettingProvider;
    vetting_id_expiration: Date;
}
export declare class TollfreeVerificationInstance {
    protected _version: V1;
    protected _solution: TollfreeVerificationContextSolution;
    protected _context?: TollfreeVerificationContext;
    constructor(_version: V1, payload: TollfreeVerificationResource, sid?: string);
    /**
     * The unique string to identify Tollfree Verification.
     */
    sid: string;
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Tollfree Verification resource.
     */
    accountSid: string;
    /**
     * Customer\'s Profile Bundle BundleSid.
     */
    customerProfileSid: string;
    /**
     * Tollfree TrustProduct Bundle BundleSid.
     */
    trustProductSid: string;
    /**
     * The date and time in GMT when the resource was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateCreated: Date;
    /**
     * The date and time in GMT when the resource was last updated specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateUpdated: Date;
    /**
     * The SID of the Regulated Item.
     */
    regulatedItemSid: string;
    /**
     * The name of the business or organization using the Tollfree number.
     */
    businessName: string;
    /**
     * The address of the business or organization using the Tollfree number.
     */
    businessStreetAddress: string;
    /**
     * The address of the business or organization using the Tollfree number.
     */
    businessStreetAddress2: string;
    /**
     * The city of the business or organization using the Tollfree number.
     */
    businessCity: string;
    /**
     * The state/province/region of the business or organization using the Tollfree number.
     */
    businessStateProvinceRegion: string;
    /**
     * The postal code of the business or organization using the Tollfree number.
     */
    businessPostalCode: string;
    /**
     * The country of the business or organization using the Tollfree number.
     */
    businessCountry: string;
    /**
     * The website of the business or organization using the Tollfree number.
     */
    businessWebsite: string;
    /**
     * The first name of the contact for the business or organization using the Tollfree number.
     */
    businessContactFirstName: string;
    /**
     * The last name of the contact for the business or organization using the Tollfree number.
     */
    businessContactLastName: string;
    /**
     * The email address of the contact for the business or organization using the Tollfree number.
     */
    businessContactEmail: string;
    /**
     * The E.164 formatted phone number of the contact for the business or organization using the Tollfree number.
     */
    businessContactPhone: string;
    /**
     * The email address to receive the notification about the verification result. .
     */
    notificationEmail: string;
    /**
     * The category of the use case for the Tollfree Number. List as many as are applicable.
     */
    useCaseCategories: Array<string>;
    /**
     * Use this to further explain how messaging is used by the business or organization.
     */
    useCaseSummary: string;
    /**
     * An example of message content, i.e. a sample message.
     */
    productionMessageSample: string;
    /**
     * Link to an image that shows the opt-in workflow. Multiple images allowed and must be a publicly hosted URL.
     */
    optInImageUrls: Array<string>;
    optInType: TollfreeVerificationOptInType;
    /**
     * Estimate monthly volume of messages from the Tollfree Number.
     */
    messageVolume: string;
    /**
     * Additional information to be provided for verification.
     */
    additionalInformation: string;
    /**
     * The SID of the Phone Number associated with the Tollfree Verification.
     */
    tollfreePhoneNumberSid: string;
    /**
     * The E.164 formatted toll-free phone number associated with the verification.
     */
    tollfreePhoneNumber: string;
    status: TollfreeVerificationStatus;
    /**
     * The absolute URL of the Tollfree Verification resource.
     */
    url: string;
    /**
     * The rejection reason given when a Tollfree Verification has been rejected.
     */
    rejectionReason: string;
    /**
     * The error code given when a Tollfree Verification has been rejected.
     */
    errorCode: number;
    /**
     * The date and time when the ability to edit a rejected verification expires.
     */
    editExpiration: Date;
    /**
     * If a rejected verification is allowed to be edited/resubmitted. Some rejection reasons allow editing and some do not.
     */
    editAllowed: boolean;
    /**
     * A legally recognized business registration number
     */
    businessRegistrationNumber: string;
    businessRegistrationAuthority: TollfreeVerificationBusinessRegistrationAuthority;
    /**
     * Country business is registered in
     */
    businessRegistrationCountry: string;
    businessType: TollfreeVerificationBusinessType;
    /**
     * The E.164 formatted number associated with the business.
     */
    businessRegistrationPhoneNumber: string;
    /**
     * Trade name, sub entity, or downstream business name of business being submitted for verification
     */
    doingBusinessAs: string;
    /**
     * The confirmation message sent to users when they opt in to receive messages.
     */
    optInConfirmationMessage: string;
    /**
     * A sample help message provided to users.
     */
    helpMessageSample: string;
    /**
     * The URL to the privacy policy for the business or organization.
     */
    privacyPolicyUrl: string;
    /**
     * The URL of the terms and conditions for the business or organization.
     */
    termsAndConditionsUrl: string;
    /**
     * Indicates if the content is age gated.
     */
    ageGatedContent: boolean;
    /**
     * List of keywords that users can send to opt in or out of messages.
     */
    optInKeywords: Array<string>;
    /**
     * A list of rejection reasons and codes describing why a Tollfree Verification has been rejected.
     */
    rejectionReasons: Array<any>;
    /**
     * The URLs of the documents associated with the Tollfree Verification resource.
     */
    resourceLinks: any;
    /**
     * An optional external reference ID supplied by customer and echoed back on status retrieval.
     */
    externalReferenceId: string;
    vettingId: string;
    vettingProvider: TollfreeVerificationVettingProvider;
    vettingIdExpiration: Date;
    private get _proxy();
    /**
     * Remove a TollfreeVerificationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a TollfreeVerificationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a TollfreeVerificationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance
     */
    fetch(callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    /**
     * Fetch a TollfreeVerificationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    /**
     * Update a TollfreeVerificationInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance
     */
    update(callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    /**
     * Update a TollfreeVerificationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance
     */
    update(params: TollfreeVerificationContextUpdateOptions, callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    /**
     * Update a TollfreeVerificationInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance with HTTP metadata
     */
    updateWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    /**
     * Update a TollfreeVerificationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance with HTTP metadata
     */
    updateWithHttpInfo(params: TollfreeVerificationContextUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        sid: string;
        accountSid: string;
        customerProfileSid: string;
        trustProductSid: string;
        dateCreated: Date;
        dateUpdated: Date;
        regulatedItemSid: string;
        businessName: string;
        businessStreetAddress: string;
        businessStreetAddress2: string;
        businessCity: string;
        businessStateProvinceRegion: string;
        businessPostalCode: string;
        businessCountry: string;
        businessWebsite: string;
        businessContactFirstName: string;
        businessContactLastName: string;
        businessContactEmail: string;
        businessContactPhone: string;
        notificationEmail: string;
        useCaseCategories: string[];
        useCaseSummary: string;
        productionMessageSample: string;
        optInImageUrls: string[];
        optInType: TollfreeVerificationOptInType;
        messageVolume: string;
        additionalInformation: string;
        tollfreePhoneNumberSid: string;
        tollfreePhoneNumber: string;
        status: TollfreeVerificationStatus;
        url: string;
        rejectionReason: string;
        errorCode: number;
        editExpiration: Date;
        editAllowed: boolean;
        businessRegistrationNumber: string;
        businessRegistrationAuthority: TollfreeVerificationBusinessRegistrationAuthority;
        businessRegistrationCountry: string;
        businessType: TollfreeVerificationBusinessType;
        businessRegistrationPhoneNumber: string;
        doingBusinessAs: string;
        optInConfirmationMessage: string;
        helpMessageSample: string;
        privacyPolicyUrl: string;
        termsAndConditionsUrl: string;
        ageGatedContent: boolean;
        optInKeywords: string[];
        rejectionReasons: any[];
        resourceLinks: any;
        externalReferenceId: string;
        vettingId: string;
        vettingProvider: "CAMPAIGN_VERIFY";
        vettingIdExpiration: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface TollfreeVerificationSolution {
}
export interface TollfreeVerificationListInstance {
    _version: V1;
    _solution: TollfreeVerificationSolution;
    _uri: string;
    (sid: string): TollfreeVerificationContext;
    get(sid: string): TollfreeVerificationContext;
    /**
     * Create a TollfreeVerificationInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance
     */
    create(params: TollfreeVerificationListInstanceCreateOptions, callback?: (error: Error | null, item?: TollfreeVerificationInstance) => any): Promise<TollfreeVerificationInstance>;
    /**
     * Create a TollfreeVerificationInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TollfreeVerificationInstance with HTTP metadata
     */
    createWithHttpInfo(params: TollfreeVerificationListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<TollfreeVerificationInstance>) => any): Promise<ApiResponse<TollfreeVerificationInstance>>;
    /**
     * Streams TollfreeVerificationInstance records from the API.
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
     * @param { TollfreeVerificationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: TollfreeVerificationInstance, done: (err?: Error) => void) => void): void;
    each(params: TollfreeVerificationListInstanceEachOptions, callback?: (item: TollfreeVerificationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams TollfreeVerificationInstance records from the API with HTTP metadata captured per page.
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
     * @param { TollfreeVerificationListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: TollfreeVerificationInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: TollfreeVerificationListInstanceEachOptions, callback?: (item: TollfreeVerificationInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of TollfreeVerificationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: TollfreeVerificationPage) => any): Promise<TollfreeVerificationPage>;
    /**
     * Retrieve a single target page of TollfreeVerificationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<TollfreeVerificationPage>) => any): Promise<ApiResponse<TollfreeVerificationPage>>;
    /**
     * Lists TollfreeVerificationInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TollfreeVerificationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: TollfreeVerificationInstance[]) => any): Promise<TollfreeVerificationInstance[]>;
    list(params: TollfreeVerificationListInstanceOptions, callback?: (error: Error | null, items: TollfreeVerificationInstance[]) => any): Promise<TollfreeVerificationInstance[]>;
    /**
     * Lists TollfreeVerificationInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TollfreeVerificationListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<TollfreeVerificationInstance[]>) => any): Promise<ApiResponse<TollfreeVerificationInstance[]>>;
    listWithHttpInfo(params: TollfreeVerificationListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<TollfreeVerificationInstance[]>) => any): Promise<ApiResponse<TollfreeVerificationInstance[]>>;
    /**
     * Retrieve a single page of TollfreeVerificationInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TollfreeVerificationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: TollfreeVerificationPage) => any): Promise<TollfreeVerificationPage>;
    page(params: TollfreeVerificationListInstancePageOptions, callback?: (error: Error | null, items: TollfreeVerificationPage) => any): Promise<TollfreeVerificationPage>;
    /**
     * Retrieve a single page of TollfreeVerificationInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TollfreeVerificationListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<TollfreeVerificationPage>) => any): Promise<ApiResponse<TollfreeVerificationPage>>;
    pageWithHttpInfo(params: TollfreeVerificationListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<TollfreeVerificationPage>) => any): Promise<ApiResponse<TollfreeVerificationPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function TollfreeVerificationListInstance(version: V1): TollfreeVerificationListInstance;
export declare class TollfreeVerificationPage extends Page<V1, TollfreeVerificationPayload, TollfreeVerificationResource, TollfreeVerificationInstance> {
    /**
     * Initialize the TollfreeVerificationPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: TollfreeVerificationSolution);
    /**
     * Build an instance of TollfreeVerificationInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: TollfreeVerificationResource): TollfreeVerificationInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
