import { inspect, InspectOptions } from "util";
import TokenPage, { TokenPaginationPayload } from "../../../base/TokenPage";
import Response from "../../../http/response";
import V3 from "../V3";
import { ApiResponse } from "../../../base/ApiResponse";
/**
 * The creator and maintainer of the Language Operator.   Available values: - `SELF` - Created and maintained by the customer (Custom Operator) - `TWILIO` - Created and maintained by Twilio (Twilio-Authored Operator)
 */
export type VersionOperatorAuthor = "SELF" | "TWILIO";
/**
 * Optionally specifies which contextual data sources (Memory, Knowledge) the operator can access during execution. Context objects will be passed in by the Intelligence Configuration Rule at runtime.  **Note**: this simply gives the LLM access to these context objects – ultimately the LLM will determine whether to actually call for context at runtime.
 */
export declare class OperatorContext {
    "memory"?: OperatorContextMemory;
    "knowledge"?: OperatorContextKnowledge;
    constructor(payload: any);
}
/**
 * Defines whether the Operator has access to organizational Knowledge Sources (e.g., policies, FAQs, scripts) at runtime.
 */
export declare class OperatorContextKnowledge {
    /**
     * Set to true to allow access to Knowledge Sources at runtime.
     */
    "enabled"?: boolean;
    constructor(payload: any);
}
/**
 * Defines whether the Operator has access to Memory (past conversational memories and profile traits).
 */
export declare class OperatorContextMemory {
    /**
     * Set to true to allow access to Memory at runtime.
     */
    "enabled"?: boolean;
    constructor(payload: any);
}
/**
 * The structure of the result returned by the Language Operator (specific to what the LLM returns, not the entirety of the Operator Result resource).  Available values: - `TEXT`:  The Operator will return plaintext from the LLM. - `JSON`: the Operator will return a structured object with schema defined in `output_schema` - `CLASSIFICATION`: The Operator will return the determined classifier string.
 */
export type OperatorOutputFormat = "TEXT" | "JSON" | "CLASSIFICATION";
export declare class OperatorParameter {
    /**
     * The data type of the parameter (e.g., STRING, INTEGER). Available values: STRING, INTEGER, NUMBER, BOOLEAN, KNOWLEDGE_BASE_AND_SOURCE_IDS  KNOWLEDGE_BASE_AND_SOURCE_IDS is a special type of parameter that refers to a Memora Knowledge Source, prefixed with its Knowledge Base container. Support for KB type = plaintext only. During Intelligence Configuration creation, this parameter is linked to a specific Knowledge Source. The operator receives the resolved plaintext at runtime and injects it into the prompt. The value of this parameter is expected to be passed in the following format: knowledge_base_id:knowledge_source_id.
     */
    "type": string;
    /**
     * Default value to use in the prompt if no value is provided by the Intelligence Configuration. Note: knowledge_base_and_source_ids does not support the default attribute, but all other param types do allow for a default value.
     */
    "_default"?: any | null;
    /**
     * Whether this parameter must be set at Operator execution time. Defaults to false if not provided.
     */
    "required"?: boolean;
    /**
     * A human-readable description of the parameter.
     */
    "description"?: string;
    constructor(payload: any);
}
export declare class OperatorTrainingExample {
    /**
     * A sample input text that demonstrates the type of content the Operator processes.
     */
    "input": string;
    /**
     * The expected output corresponding to the provided input example. This value must be consistent with the defined `output_format` and `output_schema` of the Operator.
     */
    "output": string;
    constructor(payload: any);
}
/**
 * The lifecycle status of an Operator version.  Available values: - `PREVIEW`: Available but restricted to internal/testing visibility. Normal execution. - `ACTIVE`: Available for normal use. - `DEPRECATED`: Still executes normally, but a Warn event is emitted via the Watch product lifecycle system. Customers should migrate to a newer version. - `RETIRED`: Hard failure on execution. An Error is logged in Watch. Customers must manually update their Intelligence Configuration to a valid version.
 */
export type OperatorVersionStatus = "PREVIEW" | "ACTIVE" | "DEPRECATED" | "RETIRED";
/**
 * Options to pass to each
 */
export interface VersionListInstanceEachOptions {
    /** The maximum number of resources to return */
    pageSize?: number;
    /** Token for pagination */
    pageToken?: string;
    /** Function to process each record. If this and a positional callback are passed, this one will be used */
    callback?: (item: VersionInstance, done: (err?: Error) => void) => void;
    /** Function to be called upon completion of streaming */
    done?: Function;
    /** Upper limit for the number of records to return. each() guarantees never to return more than limit. Default is no limit */
    limit?: number;
}
/**
 * Options to pass to list
 */
export interface VersionListInstanceOptions {
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
export interface VersionListInstancePageOptions {
    /** The maximum number of resources to return */
    pageSize?: number;
    /** Token for pagination */
    pageToken?: string;
}
export interface VersionContext {
    /**
     * Fetch a VersionInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed VersionInstance
     */
    fetch(callback?: (error: Error | null, item?: VersionInstance) => any): Promise<VersionInstance>;
    /**
     * Fetch a VersionInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed VersionInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<VersionInstance>) => any): Promise<ApiResponse<VersionInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export interface VersionContextSolution {
    id: string;
    versionParam: number;
}
export declare class VersionContextImpl implements VersionContext {
    protected _version: V3;
    protected _solution: VersionContextSolution;
    protected _uri: string;
    constructor(_version: V3, id: string, versionParam: number);
    fetch(callback?: (error: Error | null, item?: VersionInstance) => any): Promise<VersionInstance>;
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<VersionInstance>) => any): Promise<ApiResponse<VersionInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): VersionContextSolution;
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
/**
 * Nested model for OperatorContext
 */
export interface OperatorContext {
    memory?: OperatorContextMemory;
    knowledge?: OperatorContextKnowledge;
}
/**
 * Nested model for OperatorContextKnowledge
 */
export interface OperatorContextKnowledge {
    enabled?: boolean;
}
/**
 * Nested model for OperatorContextMemory
 */
export interface OperatorContextMemory {
    enabled?: boolean;
}
/**
 * Nested model for OperatorParameter
 */
export interface OperatorParameter {
    type: string;
    default?: any;
    required?: boolean;
    description?: string;
}
/**
 * Nested model for OperatorTrainingExample
 */
export interface OperatorTrainingExample {
    input: string;
    output: string;
}
interface VersionPayload extends TokenPaginationPayload {
    items: VersionResource[];
}
/**
 * Response model for FetchOperatorVersion200Response operations
 */
interface FetchOperatorVersion200Response_ResponseResource {
    id?: string;
    displayName?: string;
    description?: string;
    version?: number;
    author?: VersionOperatorAuthor;
    prompt?: string;
    outputFormat?: OperatorOutputFormat;
    outputSchema?: Record<string, object>;
    trainingExamples?: Array<OperatorTrainingExample>;
    context?: OperatorContext;
    parameters?: {
        [key: string]: OperatorParameter;
    };
    status: OperatorVersionStatus;
    dateCreated: Date;
}
/**
 * Response model for ListOperatorVersions200ResponseItems operations
 */
interface ListOperatorVersions200ResponseItems_ResponseResource {
    version: number;
    status: OperatorVersionStatus;
    dateCreated: Date;
    dateDeprecated?: Date;
    retirementDate?: Date;
    dateRetired?: Date;
}
/**
 * Union type for all possible response models
 */
type VersionResource = FetchOperatorVersion200Response_ResponseResource | ListOperatorVersions200ResponseItems_ResponseResource;
/**
 * Full detail of a specific Language Operator version.
 */
export declare class VersionInstance {
    protected _version: V3;
    protected _solution: VersionContextSolution;
    protected _context?: VersionContext;
    constructor(_version: V3, _payload: VersionResource, id: string, versionParam?: number);
    /**
     * The unique identifier for the Language Operator. Assigned by Twilio (TTID).
     */
    id?: string;
    /**
     * Display name of the Language Operator describing its purpose.
     */
    displayName?: string;
    /**
     * Description of the Language Operator further explaining its purpose.
     */
    description?: string;
    /**
     * Numeric Operator version. Automatically incremented with each update on the resource, used to ensure integrity when updating the Operator.
     */
    version?: number;
    author?: VersionOperatorAuthor;
    /**
     * The natural language instructions used by the operator to analyze the conversation.  Within the prompt, users can reference parameters using the `{{parameters.[param_name]}}` syntax. Parameter values are provided to the Operator by the Intelligence Configuration Rule at runtime.  **Note**: Prompts will only be exposed for Custom Operators (`author` = `SELF`). Twilio-authored Operators (`author` = `TWILIO`) will have their prompts omitted from the API.
     */
    prompt?: string;
    outputFormat?: OperatorOutputFormat;
    /**
     * Required for `JSON` output only. this will be set to a JSON Schema object describing the properties & data types of the response. Please see https://platform.openai.com/docs/guides/structured-outputs#supported-schemas   Will include the following keywords: - `type` : Must be set to `object` - `properties`:  An object containing the property names and their data types you would like the LLM to return  Additional details on JSON output formatting: - The root level `type` of a JSON schema must be set to `object` - The following property data types are supported : `string`, `number`, `boolean`, `integer`, `object`, `array`, `anyOf` - Definitions with `$defs` / `$ref` are supported - Max 100 object properties and 10 levels of nesting are supported - Max 1000 enum values across all enum properties are supported - Notable JSON Schema keywords not supported include:   - For `strings`: `minLength`, `maxLength`   - For `objects`: `patternProperties`, `unevaluatedProperties`, `propertyNames`, `minProperties`, `maxProperties`   - For `arrays`: `unevaluatedItems`, `contains`, `minContains`, `maxContains`, `uniqueItems` - Structured Operator Results will be returned in the same order as the ordering of keys in the schema - In the event an Operator execution request is refused for safety reasons the Operator Result API response will include a new field called `refusal` to indicate that the LLM refused to fulfill the request - Twilio will automatically set `additionalProperties` to false and specify all provided fields as required (constraints of Structured Outputs). You don\'t need to pass these fields as part of your JSON schema. Twilio will automatically overwrite any user-provided values for these fields.
     */
    outputSchema?: Record<string, object>;
    /**
     * An array of example input/output pairs used to illustrate the intended behavior of the Language Operator. These examples help guide the model\'s understanding of expected input–output relationships and improve consistency during evaluation and testing.  **Note**: Training examples will only be exposed for Custom Operators (`author` = `SELF`). Twilio-authored Operators (`author` = `TWILIO`) will have their training examples omitted from the API.
     */
    trainingExamples?: Array<OperatorTrainingExample>;
    context?: OperatorContext;
    /**
     * Defines the schema of the parameters that are provided when running the operator, including required and optional values that determine the operator\'s behavior. The values of the parameters themselves are passed in by the attached Intelligence Configuration.
     */
    parameters?: {
        [key: string]: OperatorParameter;
    };
    status?: OperatorVersionStatus;
    /**
     * Timestamp of when this version was created.
     */
    dateCreated?: Date;
    /**
     * Timestamp of when this version was deprecated. Present when status is `DEPRECATED` or `RETIRED`.
     */
    dateDeprecated?: Date;
    /**
     * Scheduled retirement date for this version. Present when status is `DEPRECATED`.
     */
    retirementDate?: Date;
    /**
     * Timestamp of when this version was retired. Present when status is `RETIRED`.
     */
    dateRetired?: Date;
    private get _proxy();
    /**
     * Fetch a VersionInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed VersionInstance
     */
    fetch(callback?: (error: Error | null, item?: VersionInstance) => any): Promise<VersionInstance>;
    /**
     * Fetch a VersionInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed VersionInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<VersionInstance>) => any): Promise<ApiResponse<VersionInstance>>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        id: string;
        displayName: string;
        description: string;
        version: number;
        author: VersionOperatorAuthor;
        prompt: string;
        outputFormat: OperatorOutputFormat;
        outputSchema: Record<string, object>;
        trainingExamples: OperatorTrainingExample[];
        context: OperatorContext;
        parameters: {
            [key: string]: OperatorParameter;
        };
        status: OperatorVersionStatus;
        dateCreated: Date;
        dateDeprecated: Date;
        retirementDate: Date;
        dateRetired: Date;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export interface VersionSolution {
    id: string;
}
export interface VersionListInstance {
    _version: V3;
    _solution: VersionSolution;
    _uri: string;
    (versionParam: number): VersionContext;
    get(versionParam: number): VersionContext;
    /**
     * Streams VersionInstance records from the API.
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
     * @param { VersionListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    each(callback?: (item: VersionInstance, done: (err?: Error) => void) => void): void;
    each(params: VersionListInstanceEachOptions, callback?: (item: VersionInstance, done: (err?: Error) => void) => void): void;
    /**
     * Streams VersionInstance records from the API with HTTP metadata captured per page.
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
     * @param { VersionListInstanceEachOptions } [params] - Options for request
     * @param { function } [callback] - Function to process each record
     */
    eachWithHttpInfo(callback?: (item: VersionInstance, done: (err?: Error) => void) => void): void;
    eachWithHttpInfo(params: VersionListInstanceEachOptions, callback?: (item: VersionInstance, done: (err?: Error) => void) => void): void;
    /**
     * Retrieve a single target page of VersionInstance records from the API.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records
     */
    getPage(targetUrl: string, callback?: (error: Error | null, items: VersionPage) => any): Promise<VersionPage>;
    /**
     * Retrieve a single target page of VersionInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * @param { string } [targetUrl] - API-generated URL for the requested results page
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    getPageWithHttpInfo(targetUrl: string, callback?: (error: Error | null, items: ApiResponse<VersionPage>) => any): Promise<ApiResponse<VersionPage>>;
    /**
     * Lists VersionInstance records from the API as a list.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { VersionListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    list(callback?: (error: Error | null, items: VersionInstance[]) => any): Promise<VersionInstance[]>;
    list(params: VersionListInstanceOptions, callback?: (error: Error | null, items: VersionInstance[]) => any): Promise<VersionInstance[]>;
    /**
     * Lists VersionInstance records from the API as a list with HTTP metadata.
     *
     * Returns all records along with HTTP metadata from the first page fetched.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { VersionListInstanceOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    listWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<VersionInstance[]>) => any): Promise<ApiResponse<VersionInstance[]>>;
    listWithHttpInfo(params: VersionListInstanceOptions, callback?: (error: Error | null, items: ApiResponse<VersionInstance[]>) => any): Promise<ApiResponse<VersionInstance[]>>;
    /**
     * Retrieve a single page of VersionInstance records from the API.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { VersionListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records
     */
    page(callback?: (error: Error | null, items: VersionPage) => any): Promise<VersionPage>;
    page(params: VersionListInstancePageOptions, callback?: (error: Error | null, items: VersionPage) => any): Promise<VersionPage>;
    /**
     * Retrieve a single page of VersionInstance records from the API with HTTP metadata.
     *
     * The request is executed immediately.
     *
     * If a function is passed as the first argument, it will be used as the callback
     * function.
     *
     * @param { VersionListInstancePageOptions } [params] - Options for request
     * @param { function } [callback] - Callback to handle list of records with metadata
     */
    pageWithHttpInfo(callback?: (error: Error | null, items: ApiResponse<VersionPage>) => any): Promise<ApiResponse<VersionPage>>;
    pageWithHttpInfo(params: VersionListInstancePageOptions, callback?: (error: Error | null, items: ApiResponse<VersionPage>) => any): Promise<ApiResponse<VersionPage>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function VersionListInstance(version: V3, id: string): VersionListInstance;
export declare class VersionPage extends TokenPage<V3, VersionPayload, VersionResource, VersionInstance> {
    /**
     * Initialize the VersionPage
     *
     * @param version - Version of the resource
     * @param response - Response from the API
     * @param uri - URI of the resource
     * @param params - Query parameters
     * @param solution - Path solution
     */
    constructor(version: V3, response: Response<string>, uri: string, params: any, solution: VersionSolution);
    /**
     * Build an instance of VersionInstance
     *
     * @param payload - Payload response from the API
     */
    getInstance(payload: VersionResource): VersionInstance;
    [inspect.custom](depth: any, options: InspectOptions): string;
}
export {};
