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
/**
 * Options to pass to create a LookupInstance
 */
export interface LookupListInstanceCreateOptions {
    /**  */
    identifier: Identifier;
}
export interface LookupSolution {
    storeId: string;
}
export interface LookupListInstance {
    _version: V1;
    _solution: LookupSolution;
    _uri: string;
    /**
     * Create a LookupInstance
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed LookupInstance
     */
    create(params: Identifier, headers?: any, callback?: (error: Error | null, item?: LookupInstance) => any): Promise<LookupInstance>;
    /**
     * Create a LookupInstance and return HTTP info
     *
     * @param params - Body for request
     * @param headers - header params for request
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed LookupInstance with HTTP metadata
     */
    createWithHttpInfo(params: Identifier, headers?: any, callback?: (error: Error | null, item?: ApiResponse<LookupInstance>) => any): Promise<ApiResponse<LookupInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function LookupListInstance(version: V1, storeId: string): LookupListInstance;
interface LookupResource {
    normalizedValue: string;
    profiles: Array<string>;
}
export declare class LookupInstance {
    protected _version: V1;
    constructor(_version: V1, _payload: LookupResource, storeId: string);
    /**
     * Identifier value after normalization that was used for the lookup.
     */
    normalizedValue: string;
    profiles: Array<string>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        normalizedValue: string;
        profiles: string[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
