import Version from "./Version";
import Response from "../http/response";
/**
 * Token-based pagination metadata structure
 * Used for APIs that return pagination tokens instead of URLs
 */
export interface TokenPaginationPayload {
    [key: string]: any;
    meta: {
        key: string;
        pageSize?: number;
        nextToken?: string | null;
        previousToken?: string | null;
    };
}
interface Solution {
    [name: string]: any;
}
/**
 * TokenPage handles token-based pagination where the API returns
 * nextToken/previousToken strings instead of full URLs.
 *
 * Example response format:
 * {
 *   "meta": {
 *     "key": "items",
 *     "pageSize": 50,
 *     "nextToken": "abc123",
 *     "previousToken": "xyz789"
 *   },
 *   "items": [
 *     { "id": 1, "name": "Item 1" },
 *     { "id": 2, "name": "Item 2" }
 *   ]
 * }
 */
export default class TokenPage<TVersion extends Version, TPayload extends TokenPaginationPayload, TResource, TInstance> {
    instances: TInstance[];
    protected _version: TVersion;
    protected _payload: TPayload;
    protected _solution: Solution;
    private readonly _uri;
    private readonly _params;
    /**
     * Base page object to maintain request state for token-based pagination.
     *
     * @param version - A twilio version instance
     * @param response - The http response
     * @param uri - The URI for making pagination requests
     * @param data - The request parameters
     * @param solution - path solution
     */
    constructor(version: TVersion, response: Response<string | TPayload>, uri: string, data?: Record<string, any>, solution?: Solution);
    /**
     * Parse json response from API
     *
     * @param response - API response
     *
     * @throws Error If non 200 status code is returned
     *
     * @returns json parsed response
     */
    processResponse(response: Response<string | TPayload>): TPayload;
    /**
     * Load a page of records from the payload
     *
     * @param payload - json payload
     * @returns the page of records
     */
    loadPage(payload: TPayload): TResource[];
    /**
     * Build a new instance given a json payload
     *
     * @param payload - Payload response from the API
     * @returns instance of a resource
     */
    getInstance(payload: TResource): TInstance;
    /**
     * Load a list of records
     *
     * @param resources - json payload of records
     * @returns list of resources
     */
    loadInstances(resources: TResource[]): TInstance[];
    toJSON(): object;
    /**
     * Returns the key that identifies the collection in the response.
     *
     * @returns the key or undefined if doesn't exist
     */
    get key(): string | undefined;
    /**
     * Returns the page size or undefined if doesn't exist.
     *
     * @returns the page size or undefined
     */
    get pageSize(): number | undefined;
    /**
     * Returns the next_token for pagination or undefined if doesn't exist.
     *
     * @returns the next token or undefined
     */
    get nextToken(): string | undefined;
    /**
     * Returns the previous_token for pagination or undefined if doesn't exist.
     *
     * @returns the previous token or undefined
     */
    get previousToken(): string | undefined;
    /**
     * Internal helper to fetch a page using a given token.
     *
     * @param token - The pagination token to use
     * @returns promise that resolves to the page or undefined if no token exists
     */
    private _getPage;
    /**
     * Fetch the next page of records using token-based pagination.
     * Makes a request to the same URI with pageToken set to nextToken.
     *
     * @returns promise that resolves to next page of results,
     * or undefined if there isn't a nextToken.
     */
    nextPage(): Promise<TokenPage<TVersion, TPayload, TResource, TInstance>> | undefined;
    /**
     * Fetch the previous page of records using token-based pagination.
     * Makes a request to the same URI with pageToken set to previousToken.
     *
     * @returns promise that resolves to previous page of results,
     * or undefined if there isn't a previousToken.
     */
    previousPage(): Promise<TokenPage<TVersion, TPayload, TResource, TInstance>> | undefined;
}
export {};
