import InsightsBase from "../InsightsBase";
import Version from "../../base/Version";
import { InboundListInstance } from "./v2/inbound";
import { OutboundListInstance } from "./v2/outbound";
import { ReportListInstance } from "./v2/report";
export default class V2 extends Version {
    /**
     * Initialize the V2 version of Insights
     *
     * @param domain - The Twilio (Twilio.Insights) domain
     */
    constructor(domain: InsightsBase);
    /** reports - { Twilio.Insights.V2.ReportListInstance } resource */
    protected _reports?: ReportListInstance;
    /** Accessor for inbound resource */
    inbound(reportId: string): InboundListInstance;
    /** Accessor for outbound resource */
    outbound(reportId: string): OutboundListInstance;
    /** Getter for reports resource */
    get reports(): ReportListInstance;
}
