import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Options to pass to fetch a InsightsSettingsCommentInstance
 */
export interface InsightsSettingsCommentListInstanceFetchOptions {
    /** The Authorization HTTP request header */
    authorization?: string;
}
export interface InsightsSettingsCommentSolution {
}
export interface InsightsSettingsCommentListInstance {
    _version: V1;
    _solution: InsightsSettingsCommentSolution;
    _uri: string;
    /**
     * Fetch a InsightsSettingsCommentInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsSettingsCommentInstance
     */
    fetch(callback?: (error: Error | null, item?: InsightsSettingsCommentInstance) => any): Promise<InsightsSettingsCommentInstance>;
    /**
     * Fetch a InsightsSettingsCommentInstance
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsSettingsCommentInstance
     */
    fetch(params: InsightsSettingsCommentListInstanceFetchOptions, callback?: (error: Error | null, item?: InsightsSettingsCommentInstance) => any): Promise<InsightsSettingsCommentInstance>;
    /**
     * Fetch a InsightsSettingsCommentInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsSettingsCommentInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<InsightsSettingsCommentInstance>) => any): Promise<ApiResponse<InsightsSettingsCommentInstance>>;
    /**
     * Fetch a InsightsSettingsCommentInstance and return HTTP info
     *
     * @param params - Parameter for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed InsightsSettingsCommentInstance with HTTP metadata
     */
    fetchWithHttpInfo(params: InsightsSettingsCommentListInstanceFetchOptions, callback?: (error: Error | null, item?: ApiResponse<InsightsSettingsCommentInstance>) => any): Promise<ApiResponse<InsightsSettingsCommentInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function InsightsSettingsCommentListInstance(version: V1): InsightsSettingsCommentListInstance;
interface InsightsSettingsCommentResource {
    account_sid: string;
    comments: any;
    url: string;
}
export declare class InsightsSettingsCommentInstance {
    protected _version: V1;
    constructor(_version: V1, payload: InsightsSettingsCommentResource);
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Flex Insights resource and owns this resource.
     */
    accountSid: string;
    comments: any;
    url: string;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        accountSid: string;
        comments: any;
        url: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
