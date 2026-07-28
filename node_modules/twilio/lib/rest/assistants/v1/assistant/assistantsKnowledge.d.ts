import { inspect, InspectOptions } from "util";
import Page, { TwilioResponsePayload } from "../../../../base/Page";
import Response from "../../../../http/response";
import V1 from "../../V1";
import { ApiResponse } from "../../../../base/ApiResponse";
/**
 * Options to pass to each
 */
export interface AssistantsKnowledgeListInstanceEachOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: AssistantsKnowledgeInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface AssistantsKnowledgeListInstanceOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface AssistantsKnowledgeListInstancePageOptions {
    /** How many resources to return in each list page. The default is 50, and the maximum is 1000. */
    pageSize?: number;
    /** Page Number, this value is simply for client state */
    pageNumber?: number;
    /** PageToken provided by the API */
    pageToken?: string;
}
export interface AssistantsKnowledgeContext {
    /**
     * Create a AssistantsKnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AssistantsKnowledgeInstance
     */
    create(callback?: (error: Error | null, item?: AssistantsKnowledgeInstance) => any): Promise<AssistantsKnowledgeInstance>;
    /**
     * Create a AssistantsKnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AssistantsKnowledgeInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AssistantsKnowledgeInstance>) => any): Promise<ApiResponse<AssistantsKnowledgeInstance>>;
    /**
     * Remove a AssistantsKnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a AssistantsKnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface AssistantsKnowledgeContextSolution {
    assistantId: string;
    id: string;
}
export declare class AssistantsKnowledgeContextImpl implements AssistantsKnowledgeContext {
    protected _version: V1;
    protected _solution: AssistantsKnowledgeContextSolution;
    protected _uri: string;
    constructor(_version: V1, assistantId: string, id: string);
    create(callback?: (error: Error | null, item?: AssistantsKnowledgeInstance) => any): Promise<AssistantsKnowledgeInstance>;
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AssistantsKnowledgeInstance>) => any): Promise<ApiResponse<AssistantsKnowledgeInstance>>;
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): AssistantsKnowledgeContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface AssistantsKnowledgePayload extends TwilioResponsePayload {
    knowledge: AssistantsKnowledgeResource[];
}
interface AssistantsKnowledgeResource {
    description: string;
    id: string;
    account_sid: string;
    knowledge_source_details: Record<string, object>;
    name: string;
    status: string;
    type: string;
    url: string;
    embedding_model: string;
    date_created: Date;
    date_updated: Date;
}
export declare class AssistantsKnowledgeInstance {
    protected _version: V1;
    protected _solution: AssistantsKnowledgeContextSolution;
    protected _context?: AssistantsKnowledgeContext;
    constructor(_version: V1, payload: AssistantsKnowledgeResource, assistantId: string, id?: string);
    /**
     * The type of knowledge source.
     */
    description: string;
    /**
     * The description of knowledge.
     */
    id: string;
    /**
     * The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Knowledge resource.
     */
    accountSid: string;
    /**
     * The details of the knowledge source based on the type.
     */
    knowledgeSourceDetails: Record<string, object>;
    /**
     * The name of the knowledge source.
     */
    name: string;
    /**
     * The status of processing the knowledge source (\'QUEUED\', \'PROCESSING\', \'COMPLETED\', \'FAILED\')
     */
    status: string;
    /**
     * The type of knowledge source (\'Web\', \'Database\', \'Text\', \'File\')
     */
    type: string;
    /**
     * The url of the knowledge resource.
     */
    url: string;
    /**
     * The embedding model to be used for the knowledge source.
     */
    embeddingModel: string;
    /**
     * The date and time in GMT when the Knowledge was created specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateCreated: Date;
    /**
     * The date and time in GMT when the Knowledge was last updated specified in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.
     */
    dateUpdated: Date;
    private get _proxy();
    /**
     * Create a AssistantsKnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AssistantsKnowledgeInstance
     */
    create(callback?: (error: Error | null, item?: AssistantsKnowledgeInstance) => any): Promise<AssistantsKnowledgeInstance>;
    /**
     * Create a AssistantsKnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed AssistantsKnowledgeInstance with HTTP metadata
     */
    createWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<AssistantsKnowledgeInstance>) => any): Promise<ApiResponse<AssistantsKnowledgeInstance>>;
    /**
     * Remove a AssistantsKnowledgeInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a AssistantsKnowledgeInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        description: string;
        id: string;
        accountSid: string;
        knowledgeSourceDetails: Record<string, object>;
        name: string;
        status: string;
        type: string;
        url: string;
        embeddingModel: string;
        dateCreated: Date;
        dateUpdated: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface AssistantsKnowledgeSolution {
    assistantId: string;
}
export interface AssistantsKnowledgeListInstance {
    _version: V1;
    _solution: AssistantsKnowledgeSolution;
    _uri: string;
    (id: string): AssistantsKnowledgeContext;
    get(id: string): AssistantsKnowledgeContext;
    /**
     * Streams AssistantsKnowledgeInstance records from the API.
     *
     * This operation lazily loads records as efficiently as possible until the limit
     * is reached.
     *
     * The results are passed into the callback function, so this operation is memory
     * efficient.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AssistantsKnowledgeListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: AssistantsKnowledgeInstance, done: (err?: Error) => void) => void): void;
    each(params: AssistantsKnowledgeListInstanceEachOptions, callback?: (item: AssistantsKnowledgeInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams AssistantsKnowledgeInstance records from the API with HTTP metadata captured per page.
     *
     * This operation lazily loads records as efficiently as possible until the limit
     * is reached. HTTP metadata (status code, headers) is captured for each page request.
     *
     * The results are passed into the callback function, so this operation is memory
     * efficient.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AssistantsKnowledgeListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: AssistantsKnowledgeInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: AssistantsKnowledgeListInstanceEachOptions, callback?: (item: AssistantsKnowledgeInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of AssistantsKnowledgeInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: AssistantsKnowledgePage) => any): Promise<AssistantsKnowledgePage>;
    /**
     * Retrieve a single target page of AssistantsKnowledgeInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<AssistantsKnowledgePage>) => any): Promise<ApiResponse<AssistantsKnowledgePage>>;
    /**
     * Lists AssistantsKnowledgeInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AssistantsKnowledgeListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: AssistantsKnowledgeInstance[]) => any): Promise<AssistantsKnowledgeInstance[]>;
    list(params: AssistantsKnowledgeListInstanceOptions, callback?: (error: Error | null, items: AssistantsKnowledgeInstance[]) => any): Promise<AssistantsKnowledgeInstance[]>;
    /**
     * Lists AssistantsKnowledgeInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AssistantsKnowledgeListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<AssistantsKnowledgeInstance[]>) => any): Promise<ApiResponse<AssistantsKnowledgeInstance[]>>;
    listWithHttpInfo(params: AssistantsKnowledgeListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<AssistantsKnowledgeInstance[]>) => any): Promise<ApiResponse<AssistantsKnowledgeInstance[]>>;
    /**
     * Retrieve a single page of AssistantsKnowledgeInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AssistantsKnowledgeListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: AssistantsKnowledgePage) => any): Promise<AssistantsKnowledgePage>;
    page(params: AssistantsKnowledgeListInstancePageOptions, callback?: (error: Error | null, items: AssistantsKnowledgePage) => any): Promise<AssistantsKnowledgePage>;
    /**
     * Retrieve a single page of AssistantsKnowledgeInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { AssistantsKnowledgeListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<AssistantsKnowledgePage>) => any): Promise<ApiResponse<AssistantsKnowledgePage>>;
    pageWithHttpInfo(params: AssistantsKnowledgeListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<AssistantsKnowledgePage>) => any): Promise<ApiResponse<AssistantsKnowledgePage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function AssistantsKnowledgeListInstance(version: V1, assistantId: string): AssistantsKnowledgeListInstance;
export declare class AssistantsKnowledgePage extends Page<V1, AssistantsKnowledgePayload, AssistantsKnowledgeResource, AssistantsKnowledgeInstance> {
    /**
     * Initialize the AssistantsKnowledgePage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param solution - Path solution
     */
    constructor(version: V1, response: Response<string>, solution: AssistantsKnowledgeSolution);
    /**
     * Build an instance of AssistantsKnowledgeInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: AssistantsKnowledgeResource): AssistantsKnowledgeInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
