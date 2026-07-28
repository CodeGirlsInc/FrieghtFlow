import Domain from "../base/Domain";
import V1 from "./conversations/V1";
import V2 from "./conversations/V2";
declare class ConversationsBase extends Domain {
    _v1?: V1;
    _v2?: V2;
    /**
     * Initialize conversations domain
     *
     * @param twilio - The twilio client
     */
    constructor(twilio: any);
    get v1(): V1;
    get v2(): V2;
}
export = ConversationsBase;
