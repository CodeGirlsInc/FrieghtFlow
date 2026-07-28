import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class Meta {
    /**
     * The key of the list property contains the actual data items. This enables programmatic iteration over paginated results.
     */
    "key"?: string;
    "pageSize"?: number;
    "nextToken"?: string;
    "previousToken"?: string;
    constructor(payload: any);
}
export declare class PatchTraitGroupRequest {
    /**
     * Updated description of the Trait Group
     */
    "description"?: string;
    /**
     * Map of traits to add, update, or remove in this Trait Group, where the key is the trait name. - To update/add a trait: provide the complete TraitDefinition object - To remove a trait: set dataType to an empty string (\"\")
     */
    "traits"?: {
        [key: string]: TraitDefinition;
    };
    constructor(payload: any);
}
/**
 * A Trait is a single attribute or characteristic of a profile, such as age, location, or preferences.
 */
export declare class TraitDefinition {
    /**
     * Data type of the Trait, such as STRING, NUMBER, BOOLEAN, ARRAY. For DELETE operations in PATCH requests, set this to an empty string (\"\") to mark the trait for deletion.
     */
    "dataType": string;
    /**
     * Description of the Trait, providing additional context or information.
     */
    "description"?: string;
    /**
     * The name of the identifier type to promote the trait value to, such as \'\'email\'\', \'\'phone\'\', \'\'user_id\'\', etc. This allows the trait to be mapped to an identifier in Identity Resolution. The identifier type should be configured in the Identity Resolution Settings.
     */
    "idTypePromotion"?: string;
    constructor(payload: any);
}
export declare class TraitGroup {
    /**
     * Provides a unique and addressable name to be assigned to this Trait Group
     */
    "displayName": string;
    /**
     * description of the Trait Group
     */
    "description"?: string;
    /**
     * Map of traits that are part of this Trait Group, where the key is the trait name and the value is the trait\'s definition.
     */
    "traits"?: {
        [key: string]: TraitGroupCoreTraitsValue;
    };
    /**
     * The current version number of the Trait Group. Incremented on each successful update.
     */
    "version": number;
    constructor(payload: any);
}
/**
 * A Trait is a single attribute or characteristic of a profile, such as age, location, or preferences.
 */
export declare class TraitGroupCoreTraitsValue {
    /**
     * Data type of the Trait, such as STRING, NUMBER, BOOLEAN, ARRAY. For DELETE operations in PATCH requests, set this to an empty string (\"\") to mark the trait for deletion.
     */
    "dataType": string;
    /**
     * Description of the Trait, providing additional context or information.
     */
    "description"?: string;
    "validationRule"?: ValidationRule;
    /**
     * The name of the identifier type to promote the trait value to, such as \'\'email\'\', \'\'phone\'\', \'\'user_id\'\', etc. This allows the trait to be mapped to an identifier in Identity Resolution. The identifier type should be configured in the Identity Resolution Settings.
     */
    "idTypePromotion"?: string;
    constructor(payload: any);
}
/**
 * Payload schema for creating Trait Groups.
 */
export declare class TraitGroupRequest {
    /**
     * Unique name of the Trait Group
     */
    "displayName": string;
    /**
     * description of the Trait Group
     */
    "description"?: string;
    /**
     * Map of traits belonging to this Trait Group, keyed by trait name.
     */
    "traits"?: {
        [key: string]: TraitGroupCoreTraitsValue;
    };
    constructor(payload: any);
}
export declare class ValidationRule {
    /**
     * Regex pattern (max 1000 chars)
     */
    "pattern"?: string;
    /**
     * Minimum string length
     */
    "minLength"?: number;
    /**
     * Maximum string length
     */
    "maxLength"?: number;
    /**
     * Discriminator field indicating this is an array validation rule.
     */
    "ruleType": string;
    /**
     * Minimum value
     */
    "min"?: number;
    /**
     * Maximum value
     */
    "max"?: number;
    /**
     * Minimum number of items
     */
    "minItems"?: number;
    /**
     * Maximum number of items
     */
    "maxItems"?: number;
    constructor(payload: any);
}
/**
 * Options to pass to fetch a TraitGroupInstance
 */
export interface TraitGroupContextFetchOptions {
    /** Whether to include trait definitions in the response */
    includeTraits?: boolean;
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
}
/**
 * Options to pass to patch a TraitGroupInstance
 */
export interface TraitGroupContextPatchOptions {
    /** Allows for optimistic concurrency control by making the request conditional. Server will only act if the resource\'s current Entity Tag (ETag) matches the one provided, preventing accidental overwrites. */
    ifMatch?: string;
    /**  */
    patchTraitGroupRequest?: PatchTraitGroupRequest;
}
/**
 * Options to pass to create a TraitGroupInstance
 */
export interface TraitGroupListInstanceCreateOptions {
    /**  */
    traitGroupRequest?: TraitGroupRequest;
}
/**
 * Options to pass to each
 */
export interface TraitGroupListInstanceEachOptions {
    /** Whether to include trait definitions in the response */
    includeTraits?: boolean;
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: TraitGroupInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface TraitGroupListInstanceOptions {
    /** Whether to include trait definitions in the response */
    includeTraits?: boolean;
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface TraitGroupListInstancePageOptions {
    /** Whether to include trait definitions in the response */
    includeTraits?: boolean;
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
}
export interface TraitGroupContext {
    /**
     * Remove a TraitGroupInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    remove(callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Remove a TraitGroupInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Fetch a TraitGroupInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    fetch(callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Fetch a TraitGroupInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    fetch(params: TraitGroupContextFetchOptions, callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Fetch a TraitGroupInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Fetch a TraitGroupInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    fetchWithHttpInfo(params: TraitGroupContextFetchOptions, callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Patch a TraitGroupInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    patch(callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Patch a TraitGroupInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    patch(params: PatchTraitGroupRequest, headers?: any, callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Patch a TraitGroupInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    patchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Patch a TraitGroupInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    patchWithHttpInfo(params: PatchTraitGroupRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface TraitGroupContextSolution {
    storeId: string;
    traitGroupName: string;
}
export declare class TraitGroupContextImpl implements TraitGroupContext {
    protected _version: V1;
    protected _solution: TraitGroupContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string, traitGroupName: string);
    remove(callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    fetch(params?: TraitGroupContextFetchOptions | ((error: Error | null, item?: TraitGroupInstance) => any), callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    fetchWithHttpInfo(params?: TraitGroupContextFetchOptions | ((error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    patch(params?: PatchTraitGroupRequest | ((error: Error | null, item?: TraitGroupInstance) => any), headers?: any, callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    patchWithHttpInfo(params?: PatchTraitGroupRequest | ((error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): TraitGroupContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for Meta
 */
export interface Meta {
    key?: string;
    pageSize?: number;
    nextToken?: string;
    previousToken?: string;
}
/**
 * Nested model for PatchTraitGroupRequest
 */
export interface PatchTraitGroupRequest {
    description?: string;
    traits?: {
        [key: string]: TraitDefinition;
    };
}
/**
 * Nested model for TraitDefinition
 */
export interface TraitDefinition {
    dataType: string;
    description?: string;
    idTypePromotion?: string;
}
/**
 * Nested model for TraitGroup
 */
export interface TraitGroup {
    displayName: string;
    description?: string;
    traits?: {
        [key: string]: TraitGroupCoreTraitsValue;
    };
    version: number;
}
/**
 * Nested model for TraitGroupCoreTraitsValue
 */
export interface TraitGroupCoreTraitsValue {
    dataType: string;
    description?: string;
    validationRule?: ValidationRule;
    idTypePromotion?: string;
}
/**
 * Nested model for TraitGroupRequest
 */
export interface TraitGroupRequest {
    displayName: string;
    description?: string;
    traits?: {
        [key: string]: TraitGroupCoreTraitsValue;
    };
}
/**
 * Nested model for ValidationRule
 */
export interface ValidationRule {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    ruleType: string;
    min?: number;
    max?: number;
    minItems?: number;
    maxItems?: number;
}
interface TraitGroupPayload extends TokenPaginationPayload {
    traitGroups: TraitGroupResource[];
}
/**
 * Response model for DeleteTraitGroup202Response operations
 */
interface DeleteTraitGroup202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Response model for PatchTraitGroup202Response operations
 */
interface PatchTraitGroup202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Response model for TraitGroup operations
 */
interface TraitGroup_ResponseResource {
    displayName: string;
    description?: string;
    traits?: {
        [key: string]: TraitGroupCoreTraitsValue;
    };
    version: number;
}
/**
 * Response model for FetchTraitGroup200Response operations
 */
interface FetchTraitGroup200Response_ResponseResource {
    traitGroup?: TraitGroup;
    meta?: Meta;
}
/**
 * Response model for CreateTraitGroup202Response operations
 */
interface CreateTraitGroup202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Union type for all possible response models
 */
type TraitGroupResource = DeleteTraitGroup202Response_ResponseResource | PatchTraitGroup202Response_ResponseResource | TraitGroup_ResponseResource | FetchTraitGroup200Response_ResponseResource | CreateTraitGroup202Response_ResponseResource;
export declare class TraitGroupInstance {
    protected _version: V1;
    protected _solution: TraitGroupContextSolution;
    protected _context?: TraitGroupContext;
    constructor(_version: V1, _payload: TraitGroupResource, storeId: string, traitGroupName?: string);
    message?: string;
    /**
     * URI to check operation status.
     */
    statusUrl?: string;
    /**
     * Provides a unique and addressable name to be assigned to this Trait Group
     */
    displayName?: string;
    /**
     * description of the Trait Group
     */
    description?: string;
    /**
     * Map of traits that are part of this Trait Group, where the key is the trait name and the value is the trait\'s definition.
     */
    traits?: {
        [key: string]: TraitGroupCoreTraitsValue;
    };
    /**
     * The current version number of the Trait Group. Incremented on each successful update.
     */
    version?: number;
    traitGroup?: TraitGroup;
    meta?: Meta;
    private get _proxy();
    /**
     * Remove a TraitGroupInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    remove(callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Remove a TraitGroupInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Fetch a TraitGroupInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    fetch(callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Fetch a TraitGroupInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    fetch(params: TraitGroupContextFetchOptions, callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Fetch a TraitGroupInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Fetch a TraitGroupInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    fetchWithHttpInfo(params: TraitGroupContextFetchOptions, callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Patch a TraitGroupInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    patch(callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Patch a TraitGroupInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    patch(params: PatchTraitGroupRequest, headers?: any, callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Patch a TraitGroupInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    patchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Patch a TraitGroupInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    patchWithHttpInfo(params: PatchTraitGroupRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        message: string;
        statusUrl: string;
        displayName: string;
        description: string;
        traits: {
            [key: string]: TraitGroupCoreTraitsValue;
        };
        version: number;
        traitGroup: TraitGroup;
        meta: Meta;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface TraitGroupSolution {
    storeId: string;
}
export interface TraitGroupListInstance {
    _version: V1;
    _solution: TraitGroupSolution;
    _uri: string;
    (traitGroupName: string): TraitGroupContext;
    get(traitGroupName: string): TraitGroupContext;
    /**
     * Create a TraitGroupInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    create(callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Create a TraitGroupInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance
     */
    create(params: TraitGroupRequest, headers?: any, callback?: (error: Error | null, item?: TraitGroupInstance) => any): Promise<TraitGroupInstance>;
    /**
     * Create a TraitGroupInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Create a TraitGroupInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed TraitGroupInstance with HTTP metadata
     */
    createWithHttpInfo(params: TraitGroupRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<TraitGroupInstance>) => any): Promise<ApiResponse<TraitGroupInstance>>;
    /**
     * Streams TraitGroupInstance records from the API.
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
     * @param { TraitGroupListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: TraitGroupInstance, done: (err?: Error) => void) => void): void;
    each(params: TraitGroupListInstanceEachOptions, callback?: (item: TraitGroupInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams TraitGroupInstance records from the API with HTTP metadata captured per page.
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
     * @param { TraitGroupListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: TraitGroupInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: TraitGroupListInstanceEachOptions, callback?: (item: TraitGroupInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of TraitGroupInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: TraitGroupPage) => any): Promise<TraitGroupPage>;
    /**
     * Retrieve a single target page of TraitGroupInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<TraitGroupPage>) => any): Promise<ApiResponse<TraitGroupPage>>;
    /**
     * Lists TraitGroupInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TraitGroupListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: TraitGroupInstance[]) => any): Promise<TraitGroupInstance[]>;
    list(params: TraitGroupListInstanceOptions, callback?: (error: Error | null, items: TraitGroupInstance[]) => any): Promise<TraitGroupInstance[]>;
    /**
     * Lists TraitGroupInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TraitGroupListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<TraitGroupInstance[]>) => any): Promise<ApiResponse<TraitGroupInstance[]>>;
    listWithHttpInfo(params: TraitGroupListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<TraitGroupInstance[]>) => any): Promise<ApiResponse<TraitGroupInstance[]>>;
    /**
     * Retrieve a single page of TraitGroupInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TraitGroupListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: TraitGroupPage) => any): Promise<TraitGroupPage>;
    page(params: TraitGroupListInstancePageOptions, callback?: (error: Error | null, items: TraitGroupPage) => any): Promise<TraitGroupPage>;
    /**
     * Retrieve a single page of TraitGroupInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { TraitGroupListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<TraitGroupPage>) => any): Promise<ApiResponse<TraitGroupPage>>;
    pageWithHttpInfo(params: TraitGroupListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<TraitGroupPage>) => any): Promise<ApiResponse<TraitGroupPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function TraitGroupListInstance(version: V1, storeId: string): TraitGroupListInstance;
export declare class TraitGroupPage extends TokenPage<V1, TraitGroupPayload, TraitGroupResource, TraitGroupInstance> {
    /**
     * Initialize the TraitGroupPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, uri: string, params: any, solution: TraitGroupSolution);
    /**
     * Build an instance of TraitGroupInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: TraitGroupResource): TraitGroupInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
