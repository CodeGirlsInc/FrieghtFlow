import Domain from "../base/Domain";
import V1 from "./memory/V1";
declare class MemoryBase extends Domain {
    _v1?: V1;
    /**
     * Initialize memory domain
     *
     * @param twilio - The twilio client
     */
    constructor(twilio: any);
    get v1(): V1;
}
export = MemoryBase;
