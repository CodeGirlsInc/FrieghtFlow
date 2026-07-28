import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Represents a single identifier value paired with its `idType`. Write operations obey limits, uniqueness, and normalization rules configured via identifier settings.
 */
export declare class Identifier {
    /**
     * Identifier type as configured in the service\'s Identity Resolution Settings.
     */
    "idType": string;
    /**
     * Raw value captured for the identifier. The service may normalize this value according to the `normalization` rule defined in the identifier settings before storage or matching (for example E.164 formatting for phone numbers).
     */
    "value": string;
    constructor(payload: any);
}
export declare class IdentifierUpdate {
    /**
     * The identifier type to update (e.g., email, phone).
     */
    "idType": string;
    /**
     * Existing stored value to replace.
     */
    "oldValue": string;
    /**
     * New value to store for the identifier. Normalization rules from the corresponding identifier settings apply.
     */
    "newValue": string;
    constructor(payload: any);
}
/**
 * Options to pass to remove a IdentifierInstance
 */
export interface IdentifierContextRemoveOptions {
    /** When true, removes every stored value for the identifier type in a single operation. Defaults to false. */
    removeAll?: boolean;
}
/**
 * Options to pass to patch a IdentifierInstance
 */
export interface IdentifierContextPatchOptions {
    /**  */
    identifierUpdate: IdentifierUpdate;
}
/**
 * Options to pass to create a IdentifierInstance
 */
export interface IdentifierListInstanceCreateOptions {
    /**  */
    identifier: Identifier;
}
/**
 * Options to pass to list
 */
export interface IdentifierListInstanceOptions {
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
export interface IdentifierContext {
    /**
     * Remove a IdentifierInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    remove(callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Remove a IdentifierInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    remove(params: IdentifierContextRemoveOptions, callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Remove a IdentifierInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Remove a IdentifierInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    removeWithHttpInfo(params: IdentifierContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Fetch a IdentifierInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    fetch(callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Fetch a IdentifierInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Patch a IdentifierInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    patch(params: IdentifierUpdate, headers?: any, callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Patch a IdentifierInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    patchWithHttpInfo(params: IdentifierUpdate, headers?: any, callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface IdentifierContextSolution {
    storeId: string;
    profileId: string;
    idType: string;
}
export declare class IdentifierContextImpl implements IdentifierContext {
    protected _version: V1;
    protected _solution: IdentifierContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string, profileId: string, idType: string);
    remove(params?: IdentifierContextRemoveOptions | ((error: Error | null, item?: IdentifierInstance) => any), callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    removeWithHttpInfo(params?: IdentifierContextRemoveOptions | ((error: Error | null, item?: ApiResponse<IdentifierInstance>) => any), callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    fetch(callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    patch(params: IdentifierUpdate, headers?: any, callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    patchWithHttpInfo(params: IdentifierUpdate, headers?: any, callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): IdentifierContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for Identifier
 */
export interface Identifier {
    idType: string;
    value: string;
}
/**
 * Nested model for IdentifierUpdate
 */
export interface IdentifierUpdate {
    idType: string;
    oldValue: string;
    newValue: string;
}
/**
 * Response model for CreateProfileIdentifier202Response operations
 */
interface CreateProfileIdentifier202Response_ResponseResource {
    message: string;
}
/**
 * Response model for IdentifierSet operations
 */
interface IdentifierSet_ResponseResource {
    idType: string;
    values: Array<string>;
}
/**
 * Response model for DeleteProfileIdentifier202Response operations
 */
interface DeleteProfileIdentifier202Response_ResponseResource {
    message: string;
}
/**
 * Response model for PatchProfileIdentifier202Response operations
 */
interface PatchProfileIdentifier202Response_ResponseResource {
    message: string;
}
/**
 * Union type for all possible response models
 */
type IdentifierResource = CreateProfileIdentifier202Response_ResponseResource | IdentifierSet_ResponseResource | DeleteProfileIdentifier202Response_ResponseResource | PatchProfileIdentifier202Response_ResponseResource;
export declare class IdentifierInstance {
    protected _version: V1;
    protected _solution: IdentifierContextSolution;
    protected _context?: IdentifierContext;
    constructor(_version: V1, _payload: IdentifierResource, storeId: string, profileId: string, idType?: string);
    message?: string;
    /**
     * Identifier type defined in Identity Resolution Settings.
     */
    idType?: string;
    /**
     * Server managed collection of stored values for the identifier type.  Identifier values are normalized according to the corresponding identifier settings and ordered chronologically.
     */
    values?: Array<string>;
    private get _proxy();
    /**
     * Remove a IdentifierInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    remove(callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Remove a IdentifierInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    remove(params: IdentifierContextRemoveOptions, callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Remove a IdentifierInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Remove a IdentifierInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    removeWithHttpInfo(params: IdentifierContextRemoveOptions, callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Fetch a IdentifierInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    fetch(callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Fetch a IdentifierInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Patch a IdentifierInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    patch(params: IdentifierUpdate, headers?: any, callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Patch a IdentifierInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    patchWithHttpInfo(params: IdentifierUpdate, headers?: any, callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        message: string;
        idType: string;
        values: string[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface IdentifierSolution {
    storeId: string;
    profileId: string;
}
export interface IdentifierListInstance {
    _version: V1;
    _solution: IdentifierSolution;
    _uri: string;
    (idType: string): IdentifierContext;
    get(idType: string): IdentifierContext;
    /**
     * Create a IdentifierInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance
     */
    create(params: Identifier, headers?: any, callback?: (error: Error | null, item?: IdentifierInstance) => any): Promise<IdentifierInstance>;
    /**
     * Create a IdentifierInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed IdentifierInstance with HTTP metadata
     */
    createWithHttpInfo(params: Identifier, headers?: any, callback?: (error: Error | null, item?: ApiResponse<IdentifierInstance>) => any): Promise<ApiResponse<IdentifierInstance>>;
    /**
     * Lists IdentifierInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { IdentifierListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: IdentifierInstance[]) => any): Promise<IdentifierInstance[]>;
    /**
     * Lists IdentifierInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { IdentifierListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<IdentifierInstance[]>) => any): Promise<ApiResponse<IdentifierInstance[]>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function IdentifierListInstance(version: V1, storeId: string, profileId: string): IdentifierListInstance;
export {};
