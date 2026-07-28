import MessagingBase from "../MessagingBase";
import Version from "../../base/Version";
import { TypingIndicatorListInstance } from "./v3/typingIndicator";
export default class V3 extends Version {
    /**
     * Initialize the V3 version of Messaging
     *
     * @param domain - The Twilio (Twilio.Messaging) domain
     */
    constructor(domain: MessagingBase);
    /** typingIndicator - { Twilio.Messaging.V3.TypingIndicatorListInstance } resource */
    protected _typingIndicator?: TypingIndicatorListInstance;
    /** Getter for typingIndicator resource */
    get typingIndicator(): TypingIndicatorListInstance;
}
