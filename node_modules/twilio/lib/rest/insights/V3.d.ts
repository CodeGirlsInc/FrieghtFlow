import InsightsBase from "../InsightsBase";
import Version from "../../base/Version";
import { MetadataListInstance } from "./v3/metadata";
import { QueryListInstance } from "./v3/query";
export default class V3 extends Version {
    /**
     * Initialize the V3 version of Insights
     *
     * @param domain - The Twilio (Twilio.Insights) domain
     */
    constructor(domain: InsightsBase);
    /** metadata - { Twilio.Insights.V3.MetadataListInstance } resource */
    protected _metadata?: MetadataListInstance;
    /** query - { Twilio.Insights.V3.QueryListInstance } resource */
    protected _query?: QueryListInstance;
    /** Getter for metadata resource */
    get metadata(): MetadataListInstance;
    /** Getter for query resource */
    get query(): QueryListInstance;
}
