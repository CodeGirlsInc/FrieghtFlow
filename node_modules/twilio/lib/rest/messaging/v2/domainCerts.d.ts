import { inspect, InspectOptions } from "util";
import V2 from "../V2";
import { ApiResponse } from "../../../base/ApiResponse";
export interface DomainCertsContext {
    /**
     * Fetch a DomainCertsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DomainCertsInstance
     */
    fetch(callback?: (error: Error | null, item?: DomainCertsInstance) => any): Promise<DomainCertsInstance>;
    /**
     * Fetch a DomainCertsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DomainCertsInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DomainCertsInstance>) => any): Promise<ApiResponse<DomainCertsInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface DomainCertsContextSolution {
    domainSid: string;
}
export declare class DomainCertsContextImpl implements DomainCertsContext {
    protected _version: V2;
    protected _solution: DomainCertsContextSolution;
    protected _uri: string;
    constructor(_version: V2, domainSid: string);
    fetch(callback?: (error: Error | null, item?: DomainCertsInstance) => any): Promise<DomainCertsInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DomainCertsInstance>) => any): Promise<ApiResponse<DomainCertsInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): DomainCertsContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface DomainCertsResource {
    domain_sid: string;
    date_updated: Date;
    date_expires: Date;
    date_created: Date;
    domain_name: string;
    certificate_sid: string;
    managed: boolean;
    requesting: boolean;
    url: string;
    cert_in_validation: any;
}
export declare class DomainCertsInstance {
    protected _version: V2;
    protected _solution: DomainCertsContextSolution;
    protected _context?: DomainCertsContext;
    constructor(_version: V2, payload: DomainCertsResource, domainSid?: string);
    /**
     * The unique string that we created to identify the Domain resource.
     */
    domainSid: string;
    /**
     * Date that this Domain was last updated.
     */
    dateUpdated: Date;
    /**
     * Date that the private certificate associated with this domain expires. You will need to update the certificate before that date to ensure your shortened links will continue to work.
     */
    dateExpires: Date;
    /**
     * Date that this Domain was registered to the Twilio platform to create a new Domain object.
     */
    dateCreated: Date;
    /**
     * Full url path for this domain.
     */
    domainName: string;
    /**
     * The unique string that we created to identify this Certificate resource.
     */
    certificateSid: string;
    /**
     * Boolean field that indicates whether the certificate is managed by Twilio or uploaded by the customer.
     */
    managed: boolean;
    /**
     * Boolean field that indicates whether a Twilio managed cert request is in progress or completed. True indicates a request is in progress and false indicates the request has completed or not requested yet.
     */
    requesting: boolean;
    url: string;
    /**
     * Optional JSON field describing the status and upload date of a new certificate in the process of validation
     */
    certInValidation: any;
    private get _proxy();
    /**
     * Fetch a DomainCertsInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DomainCertsInstance
     */
    fetch(callback?: (error: Error | null, item?: DomainCertsInstance) => any): Promise<DomainCertsInstance>;
    /**
     * Fetch a DomainCertsInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed DomainCertsInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<DomainCertsInstance>) => any): Promise<ApiResponse<DomainCertsInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        domainSid: string;
        dateUpdated: Date;
        dateExpires: Date;
        dateCreated: Date;
        domainName: string;
        certificateSid: string;
        managed: boolean;
        requesting: boolean;
        url: string;
        certInValidation: any;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface DomainCertsSolution {
}
export interface DomainCertsListInstance {
    _version: V2;
    _solution: DomainCertsSolution;
    _uri: string;
    (domainSid: string): DomainCertsContext;
    get(domainSid: string): DomainCertsContext;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function DomainCertsListInstance(version: V2): DomainCertsListInstance;
export {};
