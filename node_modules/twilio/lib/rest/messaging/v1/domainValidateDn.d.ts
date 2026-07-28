import { inspect, InspectOptions } from "util";
import V1 from "../V1";
import { ApiResponse } from "../../../base/ApiResponse";
export interface DomainValidateDnContext {
    /**
     * Fetch a DomainValidateDnInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DomainValidateDnInstance
     */
    fetch(callback?: (error: Error | null, item?: DomainValidateDnInstance) => any): Promise<DomainValidateDnInstance>;
    /**
     * Fetch a DomainValidateDnInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DomainValidateDnInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DomainValidateDnInstance>) => any): Promise<ApiResponse<DomainValidateDnInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface DomainValidateDnContextSolution {
    domainSid: string;
}
export declare class DomainValidateDnContextImpl implements DomainValidateDnContext {
    protected _version: V1;
    protected _solution: DomainValidateDnContextSolution;
    protected _uri: string;
    constructor(_version: V1, domainSid: string);
    fetch(callback?: (error: Error | null, item?: DomainValidateDnInstance) => any): Promise<DomainValidateDnInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DomainValidateDnInstance>) => any): Promise<ApiResponse<DomainValidateDnInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): DomainValidateDnContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface DomainValidateDnResource {
    domain_sid: string;
    is_valid: boolean;
    reason: string;
    url: string;
}
export declare class DomainValidateDnInstance {
    protected _version: V1;
    protected _solution: DomainValidateDnContextSolution;
    protected _context?: DomainValidateDnContext;
    constructor(_version: V1, payload: DomainValidateDnResource, domainSid?: string);
    /**
     * The unique string that we created to identify the Domain resource.
     */
    domainSid: string;
    isValid: boolean;
    reason: string;
    url: string;
    private get _proxy();
    /**
     * Fetch a DomainValidateDnInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DomainValidateDnInstance
     */
    fetch(callback?: (error: Error | null, item?: DomainValidateDnInstance) => any): Promise<DomainValidateDnInstance>;
    /**
     * Fetch a DomainValidateDnInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DomainValidateDnInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DomainValidateDnInstance>) => any): Promise<ApiResponse<DomainValidateDnInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        domainSid: string;
        isValid: boolean;
        reason: string;
        url: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface DomainValidateDnSolution {
}
export interface DomainValidateDnListInstance {
    _version: V1;
    _solution: DomainValidateDnSolution;
    _uri: string;
    (domainSid: string): DomainValidateDnContext;
    get(domainSid: string): DomainValidateDnContext;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function DomainValidateDnListInstance(version: V1): DomainValidateDnListInstance;
export {};
