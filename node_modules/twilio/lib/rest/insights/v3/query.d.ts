import { inspect, InspectOptions } from "util";
import V3 from "../V3";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class InsightsQueryRequest {
    /**
     * The business domain to execute the query against
     */
    "domain"?: string;
    "query": QueryDefinition;
    constructor(payload: any);
}
/**
 * Pagination metadata containing navigation tokens and result information, this schema should according to convention be added to the response payload\'s \'meta\' attribute
 */
export declare class PaginationMeta {
    /**
     * The key of the list property contains the actual data items. This enables programmatic iteration over paginated results.
     */
    "key": string;
    /**
     * The actual number of items returned in this response. May be less than the requested pageSize for the last page.
     */
    "pageSize": number;
    /**
     * Token to fetch the previous page of results. Only included if there is a previous page, otherwise omitted.
     */
    "previousToken"?: string | null;
    /**
     * Token to fetch the next page of results. Only included if there is a next page, otherwise omitted.
     */
    "nextToken"?: string | null;
    constructor(payload: any);
}
/**
 * Structured query definition that specifies what data to retrieve and how to filter, group, and order it
 */
export declare class QueryDefinition {
    /**
     * Array of measures to retrieve, representing quantitative values or metrics to be calculated
     */
    "measures"?: Array<string>;
    /**
     * Array of dimensions to retrieve, representing categorical attributes for grouping and organizing data
     */
    "dimensions"?: Array<string>;
    /**
     * Nested filter conditions. Always use `op` and `expressions`.
     */
    "filters"?: Array<QueryDefinitionFilters>;
    /**
     * Specifications for sorting the query results by specific fields in ascending or descending order
     */
    "orderBy"?: Array<QueryDefinitionOrderBy>;
    constructor(payload: any);
}
export declare class QueryDefinitionFilters {
    "op"?: string;
    "expressions": Array<QueryDefinitionFiltersExpressions>;
    constructor(payload: any);
}
export declare class QueryDefinitionFiltersExpressions {
    "op": string;
    "field": string;
    "values"?: Array<string>;
    constructor(payload: any);
}
export declare class QueryDefinitionOrderBy {
    /**
     * Dimension or measure to order by
     */
    "field"?: string;
    /**
     * Sort order direction, ascending or descending
     */
    "direction"?: string;
    constructor(payload: any);
}
/**
 * Options to pass to create a QueryInstance
 */
export interface QueryListInstanceCreateOptions {
    /**  */
    insightsQueryRequest: InsightsQueryRequest;
    /** Number of items per page */
    pageSize?: number;
}
/**
 * Options to pass to fetch a QueryInstance
 */
export interface QueryListInstanceFetchOptions {
    /** Pagination token */
    pageToken: string;
}
export interface QuerySolution {
}
export interface QueryListInstance {
    _version: V3;
    _solution: QuerySolution;
    _uri: string;
    /**
     * Create a QueryInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed QueryInstance
     */
    create(params: InsightsQueryRequest, headers?: any, callback?: (error: Error | null, item?: QueryInstance) => any): Promise<QueryInstance>;
    /**
     * Create a QueryInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed QueryInstance with HTTP metadata
     */
    createWithHttpInfo(params: InsightsQueryRequest, headers?: any, callback?: (error: Error | null, item?: ApiResponse<QueryInstance>) => any): Promise<ApiResponse<QueryInstance>>;
    /**
     * Fetch a QueryInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed QueryInstance
     */
    fetch(params: QueryListInstanceFetchOptions, callback?: (error: Error | null, item?: QueryInstance) => any): Promise<QueryInstance>;
    /**
     * Fetch a QueryInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed QueryInstance with HTTP metadata
     */
    fetchWithHttpInfo(params: QueryListInstanceFetchOptions, callback?: (error: Error | null, item?: ApiResponse<QueryInstance>) => any): Promise<ApiResponse<QueryInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function QueryListInstance(version: V3): QueryListInstance;
interface QueryResource {
    domain: string;
    items: Array<{
        [key: string]: any;
    }>;
    meta: PaginationMeta;
}
export declare class QueryInstance {
    protected _version: V3;
    constructor(_version: V3, _payload: QueryResource);
    /**
     * Indicates the business domain the query was executed against
     */
    domain: string;
    /**
     * Array of result objects containing the query results. Each object contains properties matching the requested measures and dimensions.
     */
    items: Array<{
        [key: string]: any;
    }>;
    meta: PaginationMeta;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        domain: string;
        items: {
            [key: string]: any;
        }[];
        meta: PaginationMeta;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
