import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class IdentifierConfig {
    /**
     * Name of the identifier type. Usual values are email, phone, external_id etc.
     */
    "idType": string;
    /**
     * The algorithm to use for matching identifier values.    - `exact`, exact string match.   - `fuzzy`, low precision match allowing for some variations.
     */
    "matchingAlgo"?: string;
    /**
     * The `fuzzy` matching threshold percentage.
     */
    "matchingThreshold"?: number;
    /**
     * Maximum number of historical values to retain.
     */
    "limit"?: number;
    /**
     * Removal policy to apply when the number of values exceeds the limit and is based on the timestamp of the request when the identifier was added. - `fifo`: First In First Out, removes the oldest values first. - `lifo`: Last In First Out, removes the most recent values first.
     */
    "limitPolicy"?: string;
    /**
     * When enabled, more than one profile may not share the same identifier value. Adding a shared identifier to a second profile may trigger a merge. Disabling creates a compound identifier where merges are only triggered if two or more identifiers satisfy a matching rule.
     */
    "enforceUnique"?: boolean;
    /**
     * Normalization to apply to the identifier value before storing and matching. - `phone`: Normalize phone numbers to E.164 format. - `email`: Normalize email addresses by coverting to lowercase and removing spaces. - `trim`: Removes spaces from both ends of the string. - `none`: No normalization.  **Important Note for Phone Number Normalization:** When using the `phone` normalization option, please adhere to the following guidelines to ensure proper formatting: - All US numbers must be at least valid 10 digit phone numbers with area code. They may also include or omit the \"+1\" prefix. - Non-US numbers must include a 1-3 digit country code (a \"+\" prefix is optional). Non-US national formats are not supported and will be interpreted as US numbers.
     */
    "normalization"?: string;
    constructor(payload: any);
}
/**
 * Identity Resolution settings help determine if a new profile should be created, or if the incoming conversation should be added to an existing profile. These settings resolve how profiles are looked up and which profiles should merge together.
 */
export declare class IdentityResolutionSettingsCore {
    /**
     * List of identifier types and their resolution settings.
     */
    "identifierConfigs"?: Array<IdentifierConfig>;
    /**
     * Priority list of identifiers to locate profiles to apply new data to, or for  determining if two existing profiles should merge. Rules are evaluated in order. - If no rule matches against existing profiles, a new profile will be created.  - If a rule matches to a single existing profile, the profile will be updated.  - If a rule matches to multiple existing profiles, those existing profiles will be merged.
     */
    "matchingRules"?: Array<string>;
    constructor(payload: any);
}
/**
 * Options to pass to update a IdentityResolutionSettingInstance
 */
export interface IdentityResolutionSettingContextUpdateOptions {
    /**  */
    identityResolutionSettingsCore: IdentityResolutionSettingsCore;
    /** Allows for optimistic concurrency control by making the request conditional. Server will only act if the resource\'s current Entity Tag (ETag) matches the one provided, preventing accidental overwrites. */
    ifMatch?: string;
}
export interface IdentityResolutionSettingContext {
    /**
     * Fetch a IdentityResolutionSettingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentityResolutionSettingInstance
     */
    fetch(callback?: (error: Error | null, item?: IdentityResolutionSettingInstance) => any): Promise<IdentityResolutionSettingInstance>;
    /**
     * Fetch a IdentityResolutionSettingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentityResolutionSettingInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<IdentityResolutionSettingInstance>) => any): Promise<ApiResponse<IdentityResolutionSettingInstance>>;
    /**
     * Update a IdentityResolutionSettingInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentityResolutionSettingInstance
     */
    update(params: IdentityResolutionSettingsCore, headers?: any, callback?: (error: Error | null, item?: IdentityResolutionSettingInstance) => any): Promise<IdentityResolutionSettingInstance>;
    /**
     * Update a IdentityResolutionSettingInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentityResolutionSettingInstance with HTTP metadata
     */
    updateWithHttpInfo(params: IdentityResolutionSettingsCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<IdentityResolutionSettingInstance>) => any): Promise<ApiResponse<IdentityResolutionSettingInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface IdentityResolutionSettingContextSolution {
    storeId: string;
}
export declare class IdentityResolutionSettingContextImpl implements IdentityResolutionSettingContext {
    protected _version: V1;
    protected _solution: IdentityResolutionSettingContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string);
    fetch(callback?: (error: Error | null, item?: IdentityResolutionSettingInstance) => any): Promise<IdentityResolutionSettingInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<IdentityResolutionSettingInstance>) => any): Promise<ApiResponse<IdentityResolutionSettingInstance>>;
    update(params: IdentityResolutionSettingsCore, headers?: any, callback?: (error: Error | null, item?: IdentityResolutionSettingInstance) => any): Promise<IdentityResolutionSettingInstance>;
    updateWithHttpInfo(params: IdentityResolutionSettingsCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<IdentityResolutionSettingInstance>) => any): Promise<ApiResponse<IdentityResolutionSettingInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): IdentityResolutionSettingContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for IdentifierConfig
 */
export interface IdentifierConfig {
    idType: string;
    matchingAlgo?: string;
    matchingThreshold?: number;
    limit?: number;
    limitPolicy?: string;
    enforceUnique?: boolean;
    normalization?: string;
}
/**
 * Nested model for IdentityResolutionSettingsCore
 */
export interface IdentityResolutionSettingsCore {
    identifierConfigs?: Array<IdentifierConfig>;
    matchingRules?: Array<string>;
}
/**
 * Response model for IdentityResolutionSettings operations
 */
interface IdentityResolutionSettings_ResponseResource {
    identifierConfigs?: Array<IdentifierConfig>;
    matchingRules?: Array<string>;
    version: number;
}
/**
 * Response model for UpdateIdentityResolutionSettings202Response operations
 */
interface UpdateIdentityResolutionSettings202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Union type for all possible response models
 */
type IdentityResolutionSettingResource = IdentityResolutionSettings_ResponseResource | UpdateIdentityResolutionSettings202Response_ResponseResource;
export declare class IdentityResolutionSettingInstance {
    protected _version: V1;
    protected _solution: IdentityResolutionSettingContextSolution;
    protected _context?: IdentityResolutionSettingContext;
    constructor(_version: V1, _payload: IdentityResolutionSettingResource, storeId?: string);
    /**
     * List of identifier types and their resolution settings.
     */
    identifierConfigs?: Array<IdentifierConfig>;
    /**
     * Priority list of identifiers to locate profiles to apply new data to, or for  determining if two existing profiles should merge. Rules are evaluated in order. - If no rule matches against existing profiles, a new profile will be created.  - If a rule matches to a single existing profile, the profile will be updated.  - If a rule matches to multiple existing profiles, those existing profiles will be merged.
     */
    matchingRules?: Array<string>;
    /**
     * The current version number of the Identity Resolution Settings. Incremented on each successful update.
     */
    version?: number;
    message?: string;
    /**
     * URI to check operation status.
     */
    statusUrl?: string;
    private get _proxy();
    /**
     * Fetch a IdentityResolutionSettingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentityResolutionSettingInstance
     */
    fetch(callback?: (error: Error | null, item?: IdentityResolutionSettingInstance) => any): Promise<IdentityResolutionSettingInstance>;
    /**
     * Fetch a IdentityResolutionSettingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentityResolutionSettingInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<IdentityResolutionSettingInstance>) => any): Promise<ApiResponse<IdentityResolutionSettingInstance>>;
    /**
     * Update a IdentityResolutionSettingInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentityResolutionSettingInstance
     */
    update(params: IdentityResolutionSettingsCore, headers?: any, callback?: (error: Error | null, item?: IdentityResolutionSettingInstance) => any): Promise<IdentityResolutionSettingInstance>;
    /**
     * Update a IdentityResolutionSettingInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentityResolutionSettingInstance with HTTP metadata
     */
    updateWithHttpInfo(params: IdentityResolutionSettingsCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<IdentityResolutionSettingInstance>) => any): Promise<ApiResponse<IdentityResolutionSettingInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        identifierConfigs: IdentifierConfig[];
        matchingRules: string[];
        version: number;
        message: string;
        statusUrl: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface IdentityResolutionSettingSolution {
}
export interface IdentityResolutionSettingListInstance {
    _version: V1;
    _solution: IdentityResolutionSettingSolution;
    _uri: string;
    (storeId: string): IdentityResolutionSettingContext;
    get(storeId: string): IdentityResolutionSettingContext;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function IdentityResolutionSettingListInstance(version: V1): IdentityResolutionSettingListInstance;
export {};
