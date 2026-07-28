import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * A data mapping connects external data sources to a Memory Store, enabling automatic ingestion and mapping of data to profile traits.
 */
export declare class CreateDataMappingInput {
    /**
     * Name of the data mapping.
     */
    "displayName": string;
    /**
     * A human readable description of this resource, up to 512 characters.
     */
    "description"?: string;
    /**
     * Flag indicating whether the data mapping is active. When true, data will be ingested and mapped according to the configuration. When false, the data mapping will be inactive and no data will be ingested into the Memory Store.
     */
    "isEnabled"?: boolean;
    "mappingTo": DataMappingToTraits;
    "mappingFrom": DataMappingFromDataSet;
    constructor(payload: any);
}
/**
 * Writable fields of a data mapping. Used directly as the PATCH request body (all fields optional). Composed into CreateDataMappingInput via allOf.
 */
export declare class DataMappingCore {
    /**
     * Name of the data mapping.
     */
    "displayName"?: string;
    /**
     * A human readable description of this resource, up to 512 characters.
     */
    "description"?: string;
    /**
     * Flag indicating whether the data mapping is active. When true, data will be ingested and mapped according to the configuration. When false, the data mapping will be inactive and no data will be ingested into the Memory Store.
     */
    "isEnabled"?: boolean;
    "mappingTo"?: DataMappingToTraits;
    constructor(payload: any);
}
/**
 * Configuration for mapping from a TDI dataset.
 */
export declare class DataMappingFromDataSet {
    /**
     * The source data type, which determines the source of the data and the required configuration parameters.
     */
    "type": string;
    /**
     * The unique identifier of the TDI dataset to connect.
     */
    "datasetId": string;
    constructor(payload: any);
}
/**
 * Configuration for mapping data to traits in a Memory Store.
 */
export declare class DataMappingToTraits {
    /**
     * The destination data type, which determines where to write the data and the required configuration parameters.
     */
    "type": string;
    /**
     * The list of field to trait mappings.
     */
    "mappings": Array<MappingTraitItem>;
    constructor(payload: any);
}
/**
 * The type of data mapping defining how data flows into the Memory Store.
 */
export type DataMappingType = "DATASET";
/**
 * Maps a field from a source to a Trait in the Memory Store.
 */
export declare class MappingTraitItem {
    /**
     * The name of the field/column in the source. Deprecated in favor of expression.
     */
    "fieldName": string;
    /**
     * The expression identifying the field/column in the source.
     */
    "expression"?: string;
    /**
     * The name of the Trait Group to map to.
     */
    "traitGroup": string;
    /**
     * The name of the trait within the Trait Group to map to.
     */
    "traitName": string;
    constructor(payload: any);
}
/**
 * Options to pass to patch a DataMappingInstance
 */
export interface DataMappingContextPatchOptions {
    /** Allows for optimistic concurrency control by making the request conditional. Server will only act if the resource\'s current Entity Tag (ETag) matches the one provided, preventing accidental overwrites. */
    ifMatch?: string;
    /**  */
    dataMappingCore?: DataMappingCore;
}
/**
 * Options to pass to create a DataMappingInstance
 */
export interface DataMappingListInstanceCreateOptions {
    /**  */
    createDataMappingInput: CreateDataMappingInput;
}
/**
 * Options to pass to each
 */
export interface DataMappingListInstanceEachOptions {
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Filter data mappings by type. */
    type?: DataMappingType;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: DataMappingInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface DataMappingListInstanceOptions {
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Filter data mappings by type. */
    type?: DataMappingType;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface DataMappingListInstancePageOptions {
    /** The maximum number of items to return per page, maximum of 100. */
    pageSize?: number;
    /** The token for the page of results to retrieve. */
    pageToken?: string;
    /** Either \'ASC\' or \'DESC\' to sort results ascending or descending respectively. */
    orderBy?: "ASC" | "DESC";
    /** Filter data mappings by type. */
    type?: DataMappingType;
}
export interface DataMappingContext {
    /**
     * Remove a DataMappingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    remove(callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Remove a DataMappingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Fetch a DataMappingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    fetch(callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Fetch a DataMappingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Patch a DataMappingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    patch(callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Patch a DataMappingInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    patch(params: DataMappingCore, headers?: any, callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Patch a DataMappingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    patchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Patch a DataMappingInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    patchWithHttpInfo(params: DataMappingCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface DataMappingContextSolution {
    storeId: string;
    dataMappingId: string;
}
export declare class DataMappingContextImpl implements DataMappingContext {
    protected _version: V1;
    protected _solution: DataMappingContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string, dataMappingId: string);
    remove(callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    fetch(callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    patch(params?: DataMappingCore | ((error: Error | null, item?: DataMappingInstance) => any), headers?: any, callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    patchWithHttpInfo(params?: DataMappingCore | ((error: Error | null, item?: ApiResponse<DataMappingInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): DataMappingContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for CreateDataMappingInput
 */
export interface CreateDataMappingInput {
    displayName: string;
    description?: string;
    isEnabled?: boolean;
    mappingTo: DataMappingToTraits;
    mappingFrom: DataMappingFromDataSet;
}
/**
 * Nested model for DataMappingCore
 */
export interface DataMappingCore {
    displayName?: string;
    description?: string;
    isEnabled?: boolean;
    mappingTo?: DataMappingToTraits;
}
/**
 * Nested model for DataMappingFromDataSet
 */
export interface DataMappingFromDataSet {
    type: string;
    datasetId: string;
}
/**
 * Nested model for DataMappingToTraits
 */
export interface DataMappingToTraits {
    type: string;
    mappings: Array<MappingTraitItem>;
}
/**
 * Nested model for MappingTraitItem
 */
export interface MappingTraitItem {
    fieldName: string;
    expression?: string;
    traitGroup: string;
    traitName: string;
}
interface DataMappingPayload extends TokenPaginationPayload {
    dataMappings: DataMappingResource[];
}
/**
 * Response model for CreateDataMapping202Response operations
 */
interface CreateDataMapping202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Response model for PatchDataMapping202Response operations
 */
interface PatchDataMapping202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Response model for DataMapping operations
 */
interface DataMapping_ResponseResource {
    displayName: string;
    description?: string;
    isEnabled?: boolean;
    mappingTo: DataMappingToTraits;
    mappingFrom: DataMappingFromDataSet;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
/**
 * Response model for DeleteDataMapping202Response operations
 */
interface DeleteDataMapping202Response_ResponseResource {
    message?: string;
    statusUrl?: string;
}
/**
 * Union type for all possible response models
 */
type DataMappingResource = CreateDataMapping202Response_ResponseResource | PatchDataMapping202Response_ResponseResource | DataMapping_ResponseResource | DeleteDataMapping202Response_ResponseResource;
export declare class DataMappingInstance {
    protected _version: V1;
    protected _solution: DataMappingContextSolution;
    protected _context?: DataMappingContext;
    constructor(_version: V1, _payload: DataMappingResource, storeId: string, dataMappingId?: string);
    message?: string;
    /**
     * URI to check operation status.
     */
    statusUrl?: string;
    /**
     * Name of the data mapping.
     */
    displayName?: string;
    /**
     * A human readable description of this resource, up to 512 characters.
     */
    description?: string;
    /**
     * Flag indicating whether the data mapping is active. When true, data will be ingested and mapped according to the configuration. When false, the data mapping will be inactive and no data will be ingested into the Memory Store.
     */
    isEnabled?: boolean;
    mappingTo?: DataMappingToTraits;
    mappingFrom?: DataMappingFromDataSet;
    /**
     * The unique identifier for the data mapping.
     */
    id?: string;
    /**
     * The ISO 8601 timestamp when the  data mapping was created.
     */
    createdAt?: Date;
    /**
     * The ISO 8601 timestamp when the data mapping was last updated.
     */
    updatedAt?: Date;
    /**
     * The current version number of the DataMapping. Incremented on each successful update.
     */
    version?: number;
    private get _proxy();
    /**
     * Remove a DataMappingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    remove(callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Remove a DataMappingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Fetch a DataMappingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    fetch(callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Fetch a DataMappingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Patch a DataMappingInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    patch(callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Patch a DataMappingInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    patch(params: DataMappingCore, headers?: any, callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Patch a DataMappingInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    patchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Patch a DataMappingInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    patchWithHttpInfo(params: DataMappingCore, headers?: any, callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
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
        isEnabled: boolean;
        mappingTo: DataMappingToTraits;
        mappingFrom: DataMappingFromDataSet;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface DataMappingSolution {
    storeId: string;
}
export interface DataMappingListInstance {
    _version: V1;
    _solution: DataMappingSolution;
    _uri: string;
    (dataMappingId: string): DataMappingContext;
    get(dataMappingId: string): DataMappingContext;
    /**
     * Create a DataMappingInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance
     */
    create(params: CreateDataMappingInput, headers?: any, callback?: (error: Error | null, item?: DataMappingInstance) => any): Promise<DataMappingInstance>;
    /**
     * Create a DataMappingInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DataMappingInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateDataMappingInput, headers?: any, callback?: (error: Error | null, item?: ApiResponse<DataMappingInstance>) => any): Promise<ApiResponse<DataMappingInstance>>;
    /**
     * Streams DataMappingInstance records from the API.
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
     * @param { DataMappingListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: DataMappingInstance, done: (err?: Error) => void) => void): void;
    each(params: DataMappingListInstanceEachOptions, callback?: (item: DataMappingInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams DataMappingInstance records from the API with HTTP metadata captured per page.
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
     * @param { DataMappingListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: DataMappingInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: DataMappingListInstanceEachOptions, callback?: (item: DataMappingInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of DataMappingInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: DataMappingPage) => any): Promise<DataMappingPage>;
    /**
     * Retrieve a single target page of DataMappingInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<DataMappingPage>) => any): Promise<ApiResponse<DataMappingPage>>;
    /**
     * Lists DataMappingInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { DataMappingListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: DataMappingInstance[]) => any): Promise<DataMappingInstance[]>;
    list(params: DataMappingListInstanceOptions, callback?: (error: Error | null, items: DataMappingInstance[]) => any): Promise<DataMappingInstance[]>;
    /**
     * Lists DataMappingInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { DataMappingListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<DataMappingInstance[]>) => any): Promise<ApiResponse<DataMappingInstance[]>>;
    listWithHttpInfo(params: DataMappingListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<DataMappingInstance[]>) => any): Promise<ApiResponse<DataMappingInstance[]>>;
    /**
     * Retrieve a single page of DataMappingInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { DataMappingListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: DataMappingPage) => any): Promise<DataMappingPage>;
    page(params: DataMappingListInstancePageOptions, callback?: (error: Error | null, items: DataMappingPage) => any): Promise<DataMappingPage>;
    /**
     * Retrieve a single page of DataMappingInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { DataMappingListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<DataMappingPage>) => any): Promise<ApiResponse<DataMappingPage>>;
    pageWithHttpInfo(params: DataMappingListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<DataMappingPage>) => any): Promise<ApiResponse<DataMappingPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function DataMappingListInstance(version: V1, storeId: string): DataMappingListInstance;
export declare class DataMappingPage extends TokenPage<V1, DataMappingPayload, DataMappingResource, DataMappingInstance> {
    /**
     * Initialize the DataMappingPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, uri: string, params: any, solution: DataMappingSolution);
    /**
     * Build an instance of DataMappingInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: DataMappingResource): DataMappingInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
