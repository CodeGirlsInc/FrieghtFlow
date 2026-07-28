import Domain from "../base/Domain";
import V1 from "./voice/V1";
import V3 from "./voice/V3";
declare class VoiceBase extends Domain {
    _v1?: V1;
    _v3?: V3;
    /**
     * Initialize voice domain
     *
     * @param twilio - The twilio client
     */
    constructor(twilio: any);
    get v1(): V1;
    get v3(): V3;
}
export = VoiceBase;
