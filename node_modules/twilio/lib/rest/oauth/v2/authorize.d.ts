import { inspect, InspectOptions } from "util";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to fetch a AuthorizeInstance
 */
export interface AuthorizeListInstanceFetchOptions {
    /**  */
    responseType?: string;
    /**  */
    clientId?: string;
    /**  */
    redirectUri?: string;
    /**  */
    scope?: string;
    /**  */
    state?: string;
}
export interface AuthorizeSolution {
}
export interface AuthorizeListInstance {
    _version: V2;
    _solution: AuthorizeSolution;
    _uri: string;
    /**
     * Fetch a AuthorizeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AuthorizeInstance
     */
    fetch(callback?: (error: Error | null, item?: AuthorizeInstance) => any): Promise<AuthorizeInstance>;
    /**
     * Fetch a AuthorizeInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AuthorizeInstance
     */
    fetch(params: AuthorizeListInstanceFetchOptions, callback?: (error: Error | null, item?: AuthorizeInstance) => any): Promise<AuthorizeInstance>;
    /**
     * Fetch a AuthorizeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AuthorizeInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AuthorizeInstance>) => any): Promise<ApiResponse<AuthorizeInstance>>;
    /**
     * Fetch a AuthorizeInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AuthorizeInstance with HTTP metadata
     */
    fetchWithHttpInfo(params: AuthorizeListInstanceFetchOptions, callback?: (error: Error | null, item?: ApiResponse<AuthorizeInstance>) => any): Promise<ApiResponse<AuthorizeInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function AuthorizeListInstance(version: V2): AuthorizeListInstance;
interface AuthorizeResource {
    redirect_to: string;
}
export declare class AuthorizeInstance {
    protected _version: V2;
    constructor(_version: V2, payload: AuthorizeResource);
    /**
     * The callback URL
     */
    redirectTo: string;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        redirectTo: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
