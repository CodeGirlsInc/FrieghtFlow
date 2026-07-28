import ConversationsBase from "../ConversationsBase";
import Version from "../../base/Version";
import { ActionListInstance } from "./v2/action";
import { CommunicationListInstance, CommunicationContext } from "./v2/communication";
import { ConfigurationListInstance } from "./v2/configuration";
import { ConversationListInstance } from "./v2/conversation";
import { OperationListInstance } from "./v2/operation";
import { ParticipantListInstance, ParticipantContext } from "./v2/participant";
export default class V2 extends Version {
    /**
     * Initialize the V2 version of Conversations
     *
     * @param domain - The Twilio (Twilio.Conversations) domain
     */
    constructor(domain: ConversationsBase);
    /** configurations - { Twilio.Conversations.V2.ConfigurationListInstance } resource */
    protected _configurations?: ConfigurationListInstance;
    /** conversations - { Twilio.Conversations.V2.ConversationListInstance } resource */
    protected _conversations?: ConversationListInstance;
    /** operations - { Twilio.Conversations.V2.OperationListInstance } resource */
    protected _operations?: OperationListInstance;
    /** Accessor for actions resource */
    actions(ConversationId: string): ActionListInstance;
    /** Accessor for communications resource - list operations */
    communications(ConversationSid: string): CommunicationListInstance;
    /** Accessor for communications resource - instance operations */
    communications(ConversationSid: string, sid: string): CommunicationContext;
    /** Getter for configurations resource */
    get configurations(): ConfigurationListInstance;
    /** Getter for conversations resource */
    get conversations(): ConversationListInstance;
    /** Getter for operations resource */
    get operations(): OperationListInstance;
    /** Accessor for participants resource - list operations */
    participants(ConversationSid: string): ParticipantListInstance;
    /** Accessor for participants resource - instance operations */
    participants(ConversationSid: string, sid: string): ParticipantContext;
}
