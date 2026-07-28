import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Mapping of a CSV header column to the trait fields
 */
export declare class ColumnMappingItem {
    /**
     * The name of the column in the CSV header
     */
    "columnName": string;
    /**
     * The trait group to which this trait belongs
     */
    "traitGroup": string;
    /**
     * The name of the trait in the trait group
     */
    "traitName": string;
    constructor(payload: any);
}
export declare class CreateProfilesImportV2Request {
    /**
     * The name of the file to generate a presigned URL
     */
    "filename": string;
    /**
     * The size of the file in bytes (1 byte to 100 MiB)
     */
    "fileSize": number;
    /**
     * Mappings of CSV header columns to traits\' fields
     */
    "columnMappings": Array<ColumnMappingItem>;
    constructor(payload: any);
}
/**
 * Summary statistics of the import operation
 */
export declare class FetchProfileImportV2200ResponseSummary {
    /**
     * Total count of errors encountered during import
     */
    "errors"?: number;
    /**
     * Total count of warnings encountered during import
     */
    "warnings"?: number;
    constructor(payload: any);
}
/**
 * Options to pass to create a ImportInstance
 */
export interface ImportListInstanceCreateOptions {
    /**  */
    createProfilesImportV2Request: CreateProfilesImportV2Request;
}
/**
 * Options to pass to list
 */
export interface ImportListInstanceOptions {
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
export interface ImportContext {
    /**
     * Fetch a ImportInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ImportInstance
     */
    fetch(callback?: (error: Error | null, item?: ImportInstance) => any): Promise<ImportInstance>;
    /**
     * Fetch a ImportInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ImportInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ImportInstance>) => any): Promise<ApiResponse<ImportInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface ImportContextSolution {
    storeId: string;
    importId: string;
}
export declare class ImportContextImpl implements ImportContext {
    protected _version: V1;
    protected _solution: ImportContextSolution;
    protected _uri: string;
    constructor(_version: V1, storeId: string, importId: string);
    fetch(callback?: (error: Error | null, item?: ImportInstance) => any): Promise<ImportInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ImportInstance>) => any): Promise<ApiResponse<ImportInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): ImportContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for ColumnMappingItem
 */
export interface ColumnMappingItem {
    columnName: string;
    traitGroup: string;
    traitName: string;
}
/**
 * Nested model for CreateProfilesImportV2Request
 */
export interface CreateProfilesImportV2Request {
    filename: string;
    fileSize: number;
    columnMappings: Array<ColumnMappingItem>;
}
/**
 * Nested model for FetchProfileImportV2200ResponseSummary
 */
export interface FetchProfileImportV2200ResponseSummary {
    errors?: number;
    warnings?: number;
}
/**
 * Response model for FetchProfileImportV2200Response operations
 */
interface FetchProfileImportV2200Response_ResponseResource {
    status: string;
    filename: string;
    createdAt: Date;
    updatedAt?: Date;
    fileSize?: number;
    columnMappings?: Array<ColumnMappingItem>;
    summary?: FetchProfileImportV2200ResponseSummary;
}
/**
 * Response model for CreateProfilesImportV2201Response operations
 */
interface CreateProfilesImportV2201Response_ResponseResource {
    importId: string;
    url: string;
}
/**
 * Response model for ListProfileImportsV2200Response operations
 */
interface ListProfileImportsV2200Response_ResponseResource {
    imports?: Array<string>;
}
/**
 * Union type for all possible response models
 */
type ImportResource = FetchProfileImportV2200Response_ResponseResource | CreateProfilesImportV2201Response_ResponseResource | ListProfileImportsV2200Response_ResponseResource;
export declare class ImportInstance {
    protected _version: V1;
    protected _solution: ImportContextSolution;
    protected _context?: ImportContext;
    constructor(_version: V1, _payload: ImportResource, storeId: string, importId?: string);
    /**
     * Current processing status of the import task
     */
    status?: string;
    /**
     * Original filename of the uploaded CSV
     */
    filename?: string;
    /**
     * Timestamp when the import was created
     */
    createdAt?: Date;
    /**
     * Timestamp when the import was last updated
     */
    updatedAt?: Date;
    /**
     * Size of the uploaded file in bytes (1 byte to 100 MiB)
     */
    fileSize?: number;
    /**
     * Mappings of CSV header columns to traits\' fields
     */
    columnMappings?: Array<ColumnMappingItem>;
    summary?: FetchProfileImportV2200ResponseSummary;
    /**
     * ID of the import task.
     */
    importId?: string;
    /**
     * Pre-signed URL to upload the CSV via a single PUT request.
     */
    url?: string;
    imports?: Array<string>;
    private get _proxy();
    /**
     * Fetch a ImportInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ImportInstance
     */
    fetch(callback?: (error: Error | null, item?: ImportInstance) => any): Promise<ImportInstance>;
    /**
     * Fetch a ImportInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ImportInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<ImportInstance>) => any): Promise<ApiResponse<ImportInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        status: string;
        filename: string;
        createdAt: Date;
        updatedAt: Date;
        fileSize: number;
        columnMappings: ColumnMappingItem[];
        summary: FetchProfileImportV2200ResponseSummary;
        importId: string;
        url: string;
        imports: string[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface ImportSolution {
    storeId: string;
}
export interface ImportListInstance {
    _version: V1;
    _solution: ImportSolution;
    _uri: string;
    (importId: string): ImportContext;
    get(importId: string): ImportContext;
    /**
     * Create a ImportInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ImportInstance
     */
    create(params: CreateProfilesImportV2Request, headers?: any, callback?: (error: Error | null, item?: ImportInstance) => any): Promise<ImportInstance>;
    /**
     * Create a ImportInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed ImportInstance with HTTP metadata
     */
    createWithHttpInfo(params: CreateProfilesImportV2Request, headers?: any, callback?: (error: Error | null, item?: ApiResponse<ImportInstance>) => any): Promise<ApiResponse<ImportInstance>>;
    /**
     * Lists ImportInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ImportListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: string[]) => any): Promise<string[]>;
    /**
     * Lists ImportInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { ImportListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<string[]>) => any): Promise<ApiResponse<string[]>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function ImportListInstance(version: V1, storeId: string): ImportListInstance;
export {};
