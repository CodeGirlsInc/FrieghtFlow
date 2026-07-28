import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to fetch a MessagingGeopermissionsInstance
 */
export interface MessagingGeopermissionsListInstanceFetchOptions {
    /** The country code to filter the geo permissions. If provided, only the geo permission for the specified country will be returned. */
    countryCode?: string;
}
/**
 * Options to pass to update a MessagingGeopermissionsInstance
 */
export interface MessagingGeopermissionsListInstanceUpdateOptions {
    /** A list of objects where each object represents the Geo Permission to be updated. Each object contains the following fields: `country_code`, unique code for each country of Geo Permission; `type`, permission type of the Geo Permission i.e. country; `enabled`, configure true for enabling the Geo Permission, false for disabling the Geo Permission. */
    permissions: Array<any>;
}
export interface MessagingGeopermissionsSolution {
}
export interface MessagingGeopermissionsListInstance {
    _version: V1;
    _solution: MessagingGeopermissionsSolution;
    _uri: string;
    /**
     * Fetch a MessagingGeopermissionsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MessagingGeopermissionsInstance
     */
    fetch(callback?: (error: Error | null, item?: MessagingGeopermissionsInstance) => any): Promise<MessagingGeopermissionsInstance>;
    /**
     * Fetch a MessagingGeopermissionsInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MessagingGeopermissionsInstance
     */
    fetch(params: MessagingGeopermissionsListInstanceFetchOptions, callback?: (error: Error | null, item?: MessagingGeopermissionsInstance) => any): Promise<MessagingGeopermissionsInstance>;
    /**
     * Fetch a MessagingGeopermissionsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MessagingGeopermissionsInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<MessagingGeopermissionsInstance>) => any): Promise<ApiResponse<MessagingGeopermissionsInstance>>;
    /**
     * Fetch a MessagingGeopermissionsInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MessagingGeopermissionsInstance with HTTP metadata
     */
    fetchWithHttpInfo(params: MessagingGeopermissionsListInstanceFetchOptions, callback?: (error: Error | null, item?: ApiResponse<MessagingGeopermissionsInstance>) => any): Promise<ApiResponse<MessagingGeopermissionsInstance>>;
    /**
     * Update a MessagingGeopermissionsInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MessagingGeopermissionsInstance
     */
    update(params: MessagingGeopermissionsListInstanceUpdateOptions, callback?: (error: Error | null, item?: MessagingGeopermissionsInstance) => any): Promise<MessagingGeopermissionsInstance>;
    /**
     * Update a MessagingGeopermissionsInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MessagingGeopermissionsInstance with HTTP metadata
     */
    updateWithHttpInfo(params: MessagingGeopermissionsListInstanceUpdateOptions, callback?: (error: Error | null, item?: ApiResponse<MessagingGeopermissionsInstance>) => any): Promise<ApiResponse<MessagingGeopermissionsInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function MessagingGeopermissionsListInstance(version: V1): MessagingGeopermissionsListInstance;
interface MessagingGeopermissionsResource {
    permissions: any;
}
export declare class MessagingGeopermissionsInstance {
    protected _version: V1;
    constructor(_version: V1, payload: MessagingGeopermissionsResource);
    /**
     * A list of objects where each object represents the result of processing a messaging Geo Permission. Each object contains the following fields: `country_code`, the country code of the country for which the permission was updated; `type`, the type of the permission i.e. country; `enabled`, true if the permission is enabled else false; `error_code`, an integer where 0 indicates success and any non-zero value represents an error; and `error_messages`, an array of strings describing specific validation errors encountered. If the request is successful, the error_messages array will be empty.
     */
    permissions: any;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        permissions: any;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
