import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Type of Business.
 */
export type ComplianceTollfreeInquiriesBusinessType = "PRIVATE_PROFIT" | "PUBLIC_PROFIT" | "NON_PROFIT" | "SOLE_PROPRIETOR" | "GOVERNMENT";
/**
 * Describe how a user opts-in to text messages.
 */
export type ComplianceTollfreeInquiriesOptInType = "VERBAL" | "WEB_FORM" | "PAPER_FORM" | "VIA_TEXT" | "MOBILE_QR_CODE";
/**
 * Options to pass to create a ComplianceTollfreeInquiriesInstance
 */
export interface ComplianceTollfreeInquiriesListInstanceCreateOptions {
    /** The Tollfree phone number to be verified */
    tollfreePhoneNumber: string;
    /** The email address to receive the notification about the verification result. */
    notificationEmail: string;
    /** The Customer Profile Sid associated with the Account. */
    customerProfileSid?: string;
    /** The name of the business or organization using the Tollfree number. */
    businessName?: string;
    /** The website of the business or organization using the Tollfree number. */
    businessWebsite?: string;
    /** The category of the use case for the Tollfree Number. List as many are applicable.. */
    useCaseCategories?: Array<string>;
    /** Use this to further explain how messaging is used by the business or organization. */
    useCaseSummary?: string;
    /** An example of message content, i.e. a sample message. */
    productionMessageSample?: string;
    /** Link to an image that shows the opt-in workflow. Multiple images allowed and must be a publicly hosted URL. */
    optInImageUrls?: Array<string>;
    /**  */
    optInType?: ComplianceTollfreeInquiriesOptInType;
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
    /** The phone number of the contact for the business or organization using the Tollfree number. */
    businessContactPhone?: string;
    /** Theme id for styling the inquiry form. */
    themeSetId?: string;
    /** Skip the messaging use case screen of the inquiry form. */
    skipMessagingUseCase?: boolean;
    /** The Business Registration Number of the business or organization. */
    businessRegistrationNumber?: string;
    /** The Business Registration Authority of the business or organization. */
    businessRegistrationAuthority?: string;
    /** The Business Registration Country of the business or organization. */
    businessRegistrationCountry?: string;
    /**  */
    businessType?: ComplianceTollfreeInquiriesBusinessType;
    /** Trade name, sub entity, or downstream business name of business being submitted for verification. */
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
    /** A legally recognized business registration number. */
    externalReferenceId?: string;
    /** List of keywords that users can text in to opt in to receive messages. */
    optInKeywords?: Array<string>;
    /** Unique identifier for the created Vetting . */
    vettingId?: string;
    /** Name of the vetting provider. */
    vettingProvider?: string;
}
export interface ComplianceTollfreeInquiriesSolution {
}
export interface ComplianceTollfreeInquiriesListInstance {
    _version: V1;
    _solution: ComplianceTollfreeInquiriesSolution;
    _uri: string;
    /**
     * Create a ComplianceTollfreeInquiriesInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ComplianceTollfreeInquiriesInstance
     */
    create(params: ComplianceTollfreeInquiriesListInstanceCreateOptions, callback?: (error: Error | null, item?: ComplianceTollfreeInquiriesInstance) => any): Promise<ComplianceTollfreeInquiriesInstance>;
    /**
     * Create a ComplianceTollfreeInquiriesInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ComplianceTollfreeInquiriesInstance with HTTP metadata
     */
    createWithHttpInfo(params: ComplianceTollfreeInquiriesListInstanceCreateOptions, callback?: (error: Error | null, item?: ApiResponse<ComplianceTollfreeInquiriesInstance>) => any): Promise<ApiResponse<ComplianceTollfreeInquiriesInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ComplianceTollfreeInquiriesListInstance(version: V1): ComplianceTollfreeInquiriesListInstance;
interface ComplianceTollfreeInquiriesResource {
    inquiry_id: string;
    inquiry_session_token: string;
    registration_id: string;
    url: string;
}
export declare class ComplianceTollfreeInquiriesInstance {
    protected _version: V1;
    constructor(_version: V1, payload: ComplianceTollfreeInquiriesResource);
    /**
     * The unique ID used to start an embedded compliance registration session.
     */
    inquiryId: string;
    /**
     * The session token used to start an embedded compliance registration session.
     */
    inquirySessionToken: string;
    /**
     * The TolfreeId matching the Tollfree Profile that should be resumed or resubmitted for editing.
     */
    registrationId: string;
    /**
     * The URL of this resource.
     */
    url: string;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        inquiryId: string;
        inquirySessionToken: string;
        registrationId: string;
        url: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
