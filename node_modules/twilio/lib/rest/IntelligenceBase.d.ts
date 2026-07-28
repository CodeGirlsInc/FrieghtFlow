import Domain from "../base/Domain";
import V2 from "./intelligence/V2";
import V3 from "./intelligence/V3";
declare class IntelligenceBase extends Domain {
    _v2?: V2;
    _v3?: V3;
    /**
     * Initialize intelligence domain
     *
     * @param twilio - The twilio client
     */
    constructor(twilio: any);
    get v2(): V2;
    get v3(): V3;
}
export = IntelligenceBase;
