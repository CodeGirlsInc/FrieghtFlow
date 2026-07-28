import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Data for creating or updating a profile, including traits.
 */
export declare class ProfileData {
    /**
     * Multiple trait groups.
     */
    "traits"?: {
        [key: string]: {
            [key: string]: any;
        };
    };
    constructor(payload: any);
}
export declare class ProfilePatch {
    /**
     * Multiple trait groups.
     */
    "traits"?: {
        [key: string]: {
            [key: string]: any;
        };
    };
    constructor(payload: any);
}
export declare class ProfilesMeta {
    /**
     * The key of the list property contains the actual data items. This enables programmatic iteration over paginated results.
     */
    "key"?: string;
    "pageSize"?: number;
    "nextToken"?: string;
    "previousToken"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to fetch a ProfileInstance
 */
export interface ProfileContextFetchOptions {
    /** Comma separated list of trait group names to include. */
    traitGroups?: string;
}
/**
 * Options to pass to patch a ProfileInstance
 */
export interface ProfileContextPatchOptions {
    /**  */
    profilePatch: ProfilePatch;
}
/**
 * Options to pass to create a ProfileInstance
 */
export interface ProfileListInstanceCreateOptions {
    /**  */
    profileData: ProfileData;
}
/**
 * Options to pass to each
 */
export interface ProfileListInstanceEachOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: ProfileInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface ProfileListInstanceOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
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
export interface ProfileListInstancePageOptions {
    /** The maximum number of items to return per page, maximum of 1000. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
}
export interface ProfileContext {
    /**
     * Remove a ProfileInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    remove(callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Remove a ProfileInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Fetch a ProfileInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    fetch(callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Fetch a ProfileInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    fetch(params: ProfileContextFetchOptions, callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Fetch a ProfileInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Fetch a ProfileInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    fetchWithHttpInfo(params: ProfileContextFetchOptions, callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Patch a ProfileInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    patch(params: ProfilePatch, headers?: any, callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Patch a ProfileInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    patchWithHttpInfo(params: ProfilePatch, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ProfileContextSolution {
    storeId: string;
    profileId: string;
}
export declare class ProfileContextImpl implements ProfileContext {
    protected _version: V1;
    protected _solution: ProfileContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string, profileId: string);
    remove(callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    fetch(params?: ProfileContextFetchOptions | ((error: Error | null, item?: ProfileInstance) => any), callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    fetchWithHttpInfo(params?: ProfileContextFetchOptions | ((error: Error | null, item?: ApiResponse<ProfileInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    patch(params: ProfilePatch, headers?: any, callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    patchWithHttpInfo(params: ProfilePatch, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ProfileContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for ProfileData
 */
export interface ProfileData {
    traits?: {
        [key: string]: {
            [key: string]: any;
        };
    };
}
/**
 * Nested model for ProfilePatch
 */
export interface ProfilePatch {
    traits?: {
        [key: string]: {
            [key: string]: any;
        };
    };
}
/**
 * Nested model for ProfilesMeta
 */
export interface ProfilesMeta {
    key?: string;
    pageSize?: number;
    nextToken?: string;
    previousToken?: string;
}
interface ProfilePayload extends TokenPaginationPayload {
    profiles: string[];
}
/**
 * Response model for CreateProfile202Response operations
 */
interface CreateProfile202Response_ResponseResource {
    id: string;
    message: string;
}
/**
 * Response model for DeleteProfile202Response operations
 */
interface DeleteProfile202Response_ResponseResource {
    message: string;
}
/**
 * Response model for PatchProfileTraits202Response operations
 */
interface PatchProfileTraits202Response_ResponseResource {
    message: string;
}
/**
 * Response model for ListProfiles200Response operations
 */
interface ListProfiles200Response_ResponseResource {
    profiles?: Array<string>;
    meta?: ProfilesMeta;
}
/**
 * Response model for Profile operations
 */
interface Profile_ResponseResource {
    id?: string;
    createdAt?: Date;
    traits?: {
        [key: string]: {
            [key: string]: any;
        };
    };
}
/**
 * Union type for all possible response models
 */
type ProfileResource = CreateProfile202Response_ResponseResource | DeleteProfile202Response_ResponseResource | PatchProfileTraits202Response_ResponseResource | ListProfiles200Response_ResponseResource | Profile_ResponseResource;
export declare class ProfileInstance {
    protected _version: V1;
    protected _solution: ProfileContextSolution;
    protected _context?: ProfileContext;
    constructor(_version: V1, _payload: ProfileResource, storeId: string, profileId?: string);
    /**
     * The canonical profile ID.
     */
    id?: string;
    message?: string;
    profiles?: Array<string>;
    meta?: ProfilesMeta;
    /**
     * The time the profile was created.
     */
    createdAt?: Date;
    /**
     * Multiple trait groups.
     */
    traits?: {
        [key: string]: {
            [key: string]: any;
        };
    };
    private get _proxy();
    /**
     * Remove a ProfileInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    remove(callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Remove a ProfileInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Fetch a ProfileInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    fetch(callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Fetch a ProfileInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    fetch(params: ProfileContextFetchOptions, callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Fetch a ProfileInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Fetch a ProfileInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    fetchWithHttpInfo(params: ProfileContextFetchOptions, callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Patch a ProfileInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    patch(params: ProfilePatch, headers?: any, callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Patch a ProfileInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    patchWithHttpInfo(params: ProfilePatch, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        message: string;
        profiles: string[];
        meta: ProfilesMeta;
        createdAt: Date;
        traits: {
            [key: string]: {
                [key: string]: any;
            };
        };
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ProfileSolution {
    storeId: string;
}
export interface ProfileListInstance {
    _version: V1;
    _solution: ProfileSolution;
    _uri: string;
    (profileId: string): ProfileContext;
    get(profileId: string): ProfileContext;
    /**
     * Create a ProfileInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance
     */
    create(params: ProfileData, headers?: any, callback?: (error: Error | null, item?: ProfileInstance) => any): Promise<ProfileInstance>;
    /**
     * Create a ProfileInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ProfileInstance with HTTP metadata
     */
    createWithHttpInfo(params: ProfileData, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ProfileInstance>) => any): Promise<ApiResponse<ProfileInstance>>;
    /**
     * Streams ProfileInstance records from the API.
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
     * @param { ProfileListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: string, done: (err?: Error) => void) => void): void;
    each(params: ProfileListInstanceEachOptions, callback?: (item: string, done: (err?: Error) => void) => void): void;
    /**
     * Streams ProfileInstance records from the API with HTTP metadata captured per page.
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
     * @param { ProfileListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: string, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: ProfileListInstanceEachOptions, callback?: (item: string, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of ProfileInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: ProfilePage) => any): Promise<ProfilePage>;
    /**
     * Retrieve a single target page of ProfileInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<ProfilePage>) => any): Promise<ApiResponse<ProfilePage>>;
    /**
     * Lists ProfileInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ProfileListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: string[]) => any): Promise<string[]>;
    list(params: ProfileListInstanceOptions, callback?: (error: Error | null, items: string[]) => any): Promise<string[]>;
    /**
     * Lists ProfileInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ProfileListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<string[]>) => any): Promise<ApiResponse<string[]>>;
    listWithHttpInfo(params: ProfileListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<string[]>) => any): Promise<ApiResponse<string[]>>;
    /**
     * Retrieve a single page of ProfileInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ProfileListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: ProfilePage) => any): Promise<ProfilePage>;
    page(params: ProfileListInstancePageOptions, callback?: (error: Error | null, items: ProfilePage) => any): Promise<ProfilePage>;
    /**
     * Retrieve a single page of ProfileInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ProfileListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<ProfilePage>) => any): Promise<ApiResponse<ProfilePage>>;
    pageWithHttpInfo(params: ProfileListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<ProfilePage>) => any): Promise<ApiResponse<ProfilePage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ProfileListInstance(version: V1, storeId: string): ProfileListInstance;
export declare class ProfilePage extends TokenPage<V1, ProfilePayload, ProfileResource, string> {
    /**
     * Initialize the ProfilePage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, uri: string, params: any, solution: ProfileSolution);
    /**
     * Build an instance of ProfileInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: ProfileResource): string;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
