import { inspect, InspectOptions } from "util";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class KnowledgeChunkResult {
    /**
     * The chunk content.
     */
    "content"?: string;
    /**
     * The date and time in GMT when the Chunk was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    "createdAt"?: Date;
    /**
     * The score associated with the chunk.
     */
    "score"?: number;
    /**
     * The unique identifier of knowledge source.
     */
    "knowledgeId"?: string;
    constructor(payload: any);
}
/**
 * Request payload for performing semantic search across knowledge sources within the knowledge base..  Allows querying with natural language text and filtering by specific knowledge  sources to find the most relevant content chunks.
 */
export declare class KnowledgeSearch {
    /**
     * The query to search the knowledge source.
     */
    "query": string;
    /**
     * The top K results to return.
     */
    "top": number;
    /**
     * The list of knowledge IDs to search.
     */
    "knowledgeIds"?: Array<string>;
    constructor(payload: any);
}
/**
 * Options to pass to create a SearchInstance
 */
export interface SearchContextCreateOptions {
    /**  */
    knowledgeSearch?: KnowledgeSearch;
}
export interface SearchContext {
    /**
     * Create a SearchInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SearchInstance
     */
    create(callback?: (error: Error | null, item?: SearchInstance) => any): Promise<SearchInstance>;
    /**
     * Create a SearchInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SearchInstance
     */
    create(params: KnowledgeSearch, headers?: any, callback?: (error: Error | null, item?: SearchInstance) => any): Promise<SearchInstance>;
    /**
     * Create a SearchInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SearchInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<SearchInstance>) => any): Promise<ApiResponse<SearchInstance>>;
    /**
     * Create a SearchInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SearchInstance with HTTP metadata
     */
    createWithHttpInfo(params: KnowledgeSearch, headers?: any, callback?: (error: Error | null, item?: ApiResponse<SearchInstance>) => any): Promise<ApiResponse<SearchInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface SearchContextSolution {
    kbId: string;
}
export declare class SearchContextImpl implements SearchContext {
    protected _version: V2;
    protected _solution: SearchContextSolution;
    protected _uri: string;
    constructor(_version: V2, kbId: string);
    create(params?: KnowledgeSearch | ((error: Error | null, item?: SearchInstance) => any), headers?: any, callback?: (error: Error | null, item?: SearchInstance) => any): Promise<SearchInstance>;
    createWithHttpInfo(params?: KnowledgeSearch | ((error: Error | null, item?: ApiResponse<SearchInstance>) => any), headers?: any, callback?: (error: Error | null, item?: ApiResponse<SearchInstance>) => any): Promise<ApiResponse<SearchInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): SearchContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface SearchResource {
    chunks: Array<KnowledgeChunkResult>;
}
export declare class SearchInstance {
    protected _version: V2;
    protected _solution: SearchContextSolution;
    protected _context?: SearchContext;
    constructor(_version: V2, _payload: SearchResource, kbId?: string);
    chunks: Array<KnowledgeChunkResult>;
    private get _proxy();
    /**
     * Create a SearchInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SearchInstance
     */
    create(callback?: (error: Error | null, item?: SearchInstance) => any): Promise<SearchInstance>;
    /**
     * Create a SearchInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SearchInstance
     */
    create(params: KnowledgeSearch, headers?: any, callback?: (error: Error | null, item?: SearchInstance) => any): Promise<SearchInstance>;
    /**
     * Create a SearchInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SearchInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<SearchInstance>) => any): Promise<ApiResponse<SearchInstance>>;
    /**
     * Create a SearchInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed SearchInstance with HTTP metadata
     */
    createWithHttpInfo(params: KnowledgeSearch, headers?: any, callback?: (error: Error | null, item?: ApiResponse<SearchInstance>) => any): Promise<ApiResponse<SearchInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        chunks: KnowledgeChunkResult[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface SearchSolution {
}
export interface SearchListInstance {
    _version: V2;
    _solution: SearchSolution;
    _uri: string;
    (kbId: string): SearchContext;
    get(kbId: string): SearchContext;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function SearchListInstance(version: V2): SearchListInstance;
export {};
