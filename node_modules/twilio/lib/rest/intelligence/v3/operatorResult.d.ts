import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V3 from "../V3";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * Details about the conditions under which the Operator executed.
 */
export declare class ExecutionDetails {
    "trigger": ExecutionDetailsTrigger;
    "communications": ExecutionDetailsCommunications;
    /**
     * Communication channels included in the Conversation when this Operator was executed.
     */
    "channels": Array<string>;
    /**
     * Metadata for the participants included in the Conversation when this Operator executed.
     */
    "participants": Array<ExecutionDetailsParticipants>;
    "resolvedContext"?: ResolvedContext;
    constructor(payload: any);
}
/**
 * Range of first and last communications in the Conversation that were processed during this Operator execution.
 */
export declare class ExecutionDetailsCommunications {
    /**
     * Communication `id` from the attached Conversation.
     */
    "first": string;
    /**
     * Communication `id` from the attached Conversation.
     */
    "last": string;
    constructor(payload: any);
}
export declare class ExecutionDetailsParticipants {
    /**
     * The `id` of the Participant in the Conversation.
     */
    "id": string;
    /**
     * Customer Memory Profile identifier
     */
    "profileId"?: string;
    /**
     * Type of participant in the conversation. Available types: - `CUSTOMER` - `HUMAN_AGENT` - `AI_AGENT` - `AGENT` - `UNKNOWN`
     */
    "type"?: string;
    constructor(payload: any);
}
/**
 * Metadata for the trigger that generated this Operator Result.
 */
export declare class ExecutionDetailsTrigger {
    /**
     * The conversational lifecycle event that activated execution of the Rule. Available values are: - `COMMUNICATION`: Trigger the Rule on each communication within the Conversation. - `CONVERSATION_END`: Trigger the Rule when the Conversation moves to the `closed` state. - `CONVERSATION_INACTIVE`: Trigger the Rule when the Conversation moves to the `inactive` state.
     */
    "on": string;
    /**
     * Timestamp of when the trigger was activated.
     */
    "timestamp": Date;
    constructor(payload: any);
}
/**
 * The actual result from executing the Language Operator with `EXTRACTION` output format.
 */
export declare class ExtractionResultResult {
    /**
     * List of extracted entities from the Conversation.
     */
    "entities": Array<ExtractionResultResultEntities>;
    constructor(payload: any);
}
export declare class ExtractionResultResultEntities {
    /**
     * The actual text of the extracted entity as it appears in the Conversation.
     */
    "text": string;
    /**
     * The label for the extracted entity (e.g., `PERSON`, `LOCATION`).
     */
    "label": string;
    constructor(payload: any);
}
/**
 * Reference to the Intelligence Configuration that generated the Operator Result.
 */
export declare class IntelligenceConfigurationReference {
    /**
     * Unique identifier for a Intelligence Configuration that generated the Operator Result. Assigned by Twilio (TTID).
     */
    "id": string;
    /**
     * Unique identifier of the rule of the Intelligence Configuration that triggered the result. Assigned by Twilio (TTID).
     */
    "ruleId": string;
    /**
     * Version of the Intelligence Configuration used to generate the Operator Result.
     */
    "version": number;
    constructor(payload: any);
}
/**
 * Reference to the Language Operator that generated the Operator Result.
 */
export declare class OperatorReference {
    /**
     * The `id` of the Language Operator.
     */
    "id": string;
    /**
     * Version of the Language Operator used to generate the Operator Result.
     */
    "version": number;
    /**
     * Parameter values used for Operator execution, provided by the Rule at runtime. This object contains a dictionary of parameter keys and their corresponding values.
     */
    "parameters": {
        [key: string]: any;
    };
    constructor(payload: any);
}
export declare class OperatorResultsResponseBaseMetadata {
    "system": SystemMetaData;
    constructor(payload: any);
}
/**
 * The context that was actually used by the operator during execution
 */
export declare class ResolvedContext {
    "memory"?: ResolvedContextMemory;
    "knowledge"?: ResolvedContextKnowledge | null;
    constructor(payload: any);
}
/**
 * Knowledge source IDs with their respective knowledge base ID that was accessed and used by the LLM to generate the result.  null if no knowledge was accessed.
 */
export declare class ResolvedContextKnowledge {
    "sources": Array<ResolvedContextKnowledgeSources>;
    constructor(payload: any);
}
export declare class ResolvedContextKnowledgeSources {
    /**
     * Knowledge base identifier
     */
    "baseId": string;
    /**
     * Knowledge source identifier
     */
    "sourceId": string;
    constructor(payload: any);
}
/**
 * The customer profile that was accessed. null if no memory was accessed.  Either observations and/or traits from the profile were used by the LLM to generate the result.
 */
export declare class ResolvedContextMemory {
    /**
     * Customer Memory Profile identifier
     */
    "profileId": string;
    /**
     * Customer Memory store identifier
     */
    "memoryStoreId": string;
    constructor(payload: any);
}
export declare class SystemMetaData {
    /**
     * The underlying LLM model used for this execution.
     */
    "resolvedModel"?: string;
    /**
     * Operator execution time in milliseconds.
     */
    "latencyMs": number;
    /**
     * Number of characters in the input sent to the model. Aligns with the billing unit.
     */
    "inputCharacters": number;
    /**
     * Number of characters in the model\'s response. Aligns with the billing unit.
     */
    "outputCharacters": number;
    /**
     * Whether the conversation input was truncated to fit the model\'s context window.
     */
    "inputTruncated": boolean;
    constructor(payload: any);
}
/**
 * Options to pass to each
 */
export interface OperatorResultListInstanceEachOptions {
    /** Filter Operator Results by attached Conversation `id`. */
    conversationId?: string;
    /** Filter Operator Results by Intelligence Configuration `id` used to generate them. */
    intelligenceConfigurationId?: string;
    /** Filter Operator Results by Language Operator `id`. */
    operatorId?: string;
    /** The maximum number of resources to return */
    pageSize?: number;
    /** Token for pagination */
    pageToken?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: OperatorResultInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface OperatorResultListInstanceOptions {
    /** Filter Operator Results by attached Conversation `id`. */
    conversationId?: string;
    /** Filter Operator Results by Intelligence Configuration `id` used to generate them. */
    intelligenceConfigurationId?: string;
    /** Filter Operator Results by Language Operator `id`. */
    operatorId?: string;
    /** The maximum number of resources to return */
    pageSize?: number;
    /** Token for pagination */
    pageToken?: string;
    /** Upper limit for the number of records to return. list() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to page
 */
export interface OperatorResultListInstancePageOptions {
    /** Filter Operator Results by attached Conversation `id`. */
    conversationId?: string;
    /** Filter Operator Results by Intelligence Configuration `id` used to generate them. */
    intelligenceConfigurationId?: string;
    /** Filter Operator Results by Language Operator `id`. */
    operatorId?: string;
    /** The maximum number of resources to return */
    pageSize?: number;
    /** Token for pagination */
    pageToken?: string;
}
export interface OperatorResultContext {
    /**
     * Remove a OperatorResultInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a OperatorResultInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a OperatorResultInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OperatorResultInstance
     */
    fetch(callback?: (error: Error | null, item?: OperatorResultInstance) => any): Promise<OperatorResultInstance>;
    /**
     * Fetch a OperatorResultInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OperatorResultInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<OperatorResultInstance>) => any): Promise<ApiResponse<OperatorResultInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface OperatorResultContextSolution {
    operatorResultId: string;
}
export declare class OperatorResultContextImpl implements OperatorResultContext {
    protected _version: V3;
    protected _solution: OperatorResultContextSolution;
    protected _uri: string;
    constructor(_version: V3, operatorResultId: string);
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    fetch(callback?: (error: Error | null, item?: OperatorResultInstance) => any): Promise<OperatorResultInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<OperatorResultInstance>) => any): Promise<ApiResponse<OperatorResultInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): OperatorResultContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
interface OperatorResultPayload extends TokenPaginationPayload {
    items: OperatorResultResource[];
}
interface OperatorResultResource {
    outputFormat: string;
    id: string;
    accountId: string;
    intelligenceConfiguration: IntelligenceConfigurationReference;
    conversationId: string;
    operator: OperatorReference;
    dateCreated: Date;
    referenceIds: Array<string>;
    executionDetails: ExecutionDetails;
    metadata: OperatorResultsResponseBaseMetadata;
    result: ExtractionResultResult;
}
export declare class OperatorResultInstance {
    protected _version: V3;
    protected _solution: OperatorResultContextSolution;
    protected _context?: OperatorResultContext;
    constructor(_version: V3, _payload: OperatorResultResource, operatorResultId?: string);
    /**
     * The output format set on the Operator that generated this result. Determines the structure of the `result` object.
     */
    outputFormat: string;
    /**
     * A unique identifier for the Operator Result. Assigned by Twilio (TTID).
     */
    id: string;
    /**
     * The ID of the Account that created the Language Operator.
     */
    accountId: string;
    intelligenceConfiguration: IntelligenceConfigurationReference;
    /**
     * The `id` of the Conversation attached to the Operator Result.
     */
    conversationId: string;
    operator: OperatorReference;
    /**
     * Timestamp for when the Operator Result was created.
     */
    dateCreated: Date;
    /**
     * The `id`s of objects related to this Operator Result.
     */
    referenceIds: Array<string>;
    executionDetails: ExecutionDetails;
    metadata: OperatorResultsResponseBaseMetadata;
    result: ExtractionResultResult;
    private get _proxy();
    /**
     * Remove a OperatorResultInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean
     */
    remove(callback?: (error: Error | null, item?: boolean) => any): Promise<boolean>;
    /**
     * Remove a OperatorResultInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed boolean with HTTP metadata
     */
    removeWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<boolean>) => any): Promise<ApiResponse<boolean>>;
    /**
     * Fetch a OperatorResultInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OperatorResultInstance
     */
    fetch(callback?: (error: Error | null, item?: OperatorResultInstance) => any): Promise<OperatorResultInstance>;
    /**
     * Fetch a OperatorResultInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed OperatorResultInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<OperatorResultInstance>) => any): Promise<ApiResponse<OperatorResultInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        outputFormat: string;
        id: string;
        accountId: string;
        intelligenceConfiguration: IntelligenceConfigurationReference;
        conversationId: string;
        operator: OperatorReference;
        dateCreated: Date;
        referenceIds: string[];
        executionDetails: ExecutionDetails;
        metadata: OperatorResultsResponseBaseMetadata;
        result: ExtractionResultResult;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface OperatorResultSolution {
}
export interface OperatorResultListInstance {
    _version: V3;
    _solution: OperatorResultSolution;
    _uri: string;
    (operatorResultId: string): OperatorResultContext;
    get(operatorResultId: string): OperatorResultContext;
    /**
     * Streams OperatorResultInstance records from the API.
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
     * @param { OperatorResultListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: OperatorResultInstance, done: (err?: Error) => void) => void): void;
    each(params: OperatorResultListInstanceEachOptions, callback?: (item: OperatorResultInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams OperatorResultInstance records from the API with HTTP metadata captured per page.
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
     * @param { OperatorResultListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: OperatorResultInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: OperatorResultListInstanceEachOptions, callback?: (item: OperatorResultInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of OperatorResultInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: OperatorResultPage) => any): Promise<OperatorResultPage>;
    /**
     * Retrieve a single target page of OperatorResultInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<OperatorResultPage>) => any): Promise<ApiResponse<OperatorResultPage>>;
    /**
     * Lists OperatorResultInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { OperatorResultListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: OperatorResultInstance[]) => any): Promise<OperatorResultInstance[]>;
    list(params: OperatorResultListInstanceOptions, callback?: (error: Error | null, items: OperatorResultInstance[]) => any): Promise<OperatorResultInstance[]>;
    /**
     * Lists OperatorResultInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { OperatorResultListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<OperatorResultInstance[]>) => any): Promise<ApiResponse<OperatorResultInstance[]>>;
    listWithHttpInfo(params: OperatorResultListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<OperatorResultInstance[]>) => any): Promise<ApiResponse<OperatorResultInstance[]>>;
    /**
     * Retrieve a single page of OperatorResultInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { OperatorResultListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: OperatorResultPage) => any): Promise<OperatorResultPage>;
    page(params: OperatorResultListInstancePageOptions, callback?: (error: Error | null, items: OperatorResultPage) => any): Promise<OperatorResultPage>;
    /**
     * Retrieve a single page of OperatorResultInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { OperatorResultListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<OperatorResultPage>) => any): Promise<ApiResponse<OperatorResultPage>>;
    pageWithHttpInfo(params: OperatorResultListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<OperatorResultPage>) => any): Promise<ApiResponse<OperatorResultPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function OperatorResultListInstance(version: V3): OperatorResultListInstance;
export declare class OperatorResultPage extends TokenPage<V3, OperatorResultPayload, OperatorResultResource, OperatorResultInstance> {
    /**
     * Initialize the OperatorResultPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V3, response: Response<string>, uri: string, params: any, solution: OperatorResultSolution);
    /**
     * Build an instance of OperatorResultInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: OperatorResultResource): OperatorResultInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
