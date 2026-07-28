import { inspect, InspectOptions } from "util";
import V3 from "../V3";
import { ApiResponse } from "../../../base/ApiResponse";
export declare class InsightsMetadataResponseCubes {
    /**
     * Name of the cube, used as a reference in queries
     */
    "name": string;
    /**
     * Human-readable description of what the cube represents
     */
    "description"?: string;
    /**
     * List of measures available in the cube, representing quantitative values that can be aggregated
     */
    "measures": Array<InsightsMetadataResponseCubesMeasures>;
    /**
     * List of dimensions available in the cube, representing categorical attributes for grouping data
     */
    "dimensions": Array<InsightsMetadataResponseCubesDimensions>;
    constructor(payload: any);
}
export declare class InsightsMetadataResponseCubesDimensions {
    /**
     * Identifier used to reference this dimension in queries
     */
    "name": string;
    /**
     * Detailed explanation of what this dimension represents
     */
    "description"?: string;
    /**
     * Data type of the dimension (e.g., string, number, boolean, date)
     */
    "type": string;
    constructor(payload: any);
}
export declare class InsightsMetadataResponseCubesMeasures {
    /**
     * Identifier used to reference this measure in queries
     */
    "name": string;
    /**
     * Detailed explanation of what this measure represents
     */
    "description"?: string;
    /**
     * Type of the measure
     */
    "type": string;
    /**
     * Aggregation type for the measure (e.g., sum, count, average)
     */
    "aggregation"?: string;
    constructor(payload: any);
}
export interface MetadataSolution {
}
export interface MetadataListInstance {
    _version: V3;
    _solution: MetadataSolution;
    _uri: string;
    /**
     * Fetch a MetadataInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MetadataInstance
     */
    fetch(callback?: (error: Error | null, item?: MetadataInstance) => any): Promise<MetadataInstance>;
    /**
     * Fetch a MetadataInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed MetadataInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<MetadataInstance>) => any): Promise<ApiResponse<MetadataInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function MetadataListInstance(version: V3): MetadataListInstance;
interface MetadataResource {
    domain: string;
    cubes: Array<InsightsMetadataResponseCubes>;
}
/**
 * Response containing metadata about available cubes, measures, and dimensions for a domain
 */
export declare class MetadataInstance {
    protected _version: V3;
    constructor(_version: V3, _payload: MetadataResource);
    /**
     * The business domain name for which metadata is being provided
     */
    domain: string;
    /**
     * List of data cubes available in the domain, each containing measures and dimensions
     */
    cubes: Array<InsightsMetadataResponseCubes>;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        domain: string;
        cubes: InsightsMetadataResponseCubes[];
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
