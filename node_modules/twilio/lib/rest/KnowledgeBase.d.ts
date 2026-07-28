import Domain from "../base/Domain";
import V1 from "./knowledge/V1";
import V2 from "./knowledge/V2";
declare class KnowledgeBase extends Domain {
    _v1?: V1;
    _v2?: V2;
    /**
     * Initialize knowledge domain
     *
     * @param twilio - The twilio client
     */
    constructor(twilio: any);
    get v1(): V1;
    get v2(): V2;
}
export = KnowledgeBase;
