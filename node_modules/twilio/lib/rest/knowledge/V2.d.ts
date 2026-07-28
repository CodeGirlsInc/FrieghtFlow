import KnowledgeBase from "../KnowledgeBase";
import Version from "../../base/Version";
import { ChunkListInstance } from "./v2/chunk";
import { KnowledgeListInstance, KnowledgeContext } from "./v2/knowledge";
import { KnowledgeBasisListInstance } from "./v2/knowledgeBasis";
import { OperationListInstance } from "./v2/operation";
import { SearchContext } from "./v2/search";
export default class V2 extends Version {
    /**
     * Initialize the V2 version of Knowledge
     *
     * @param domain - The Twilio (Twilio.Knowledge) domain
     */
    constructor(domain: KnowledgeBase);
    /** knowledgeBases - { Twilio.Knowledge.V2.KnowledgeBasisListInstance } resource */
    protected _knowledgeBases?: KnowledgeBasisListInstance;
    /** operations - { Twilio.Knowledge.V2.OperationListInstance } resource */
    protected _operations?: OperationListInstance;
    /** Accessor for chunks resource */
    chunks(kbId: string, knowledgeId: string): ChunkListInstance;
    /** Accessor for knowledge resource - list operations */
    knowledge(kbId: string): KnowledgeListInstance;
    /** Accessor for knowledge resource - instance operations */
    knowledge(kbId: string, knowledgeId: string): KnowledgeContext;
    /** Getter for knowledgeBases resource */
    get knowledgeBases(): KnowledgeBasisListInstance;
    /** Getter for operations resource */
    get operations(): OperationListInstance;
    /** Accessor for search resource */
    search(kbId: string): SearchContext;
}
