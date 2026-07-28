import MemoryBase from "../MemoryBase";
import Version from "../../base/Version";
import { BulkContext } from "./v1/bulk";
import { ConversationSummaryListInstance, ConversationSummaryContext } from "./v1/conversationSummary";
import { DataMappingListInstance, DataMappingContext } from "./v1/dataMapping";
import { EventListInstance } from "./v1/event";
import { IdentifierListInstance, IdentifierContext } from "./v1/identifier";
import { IdentityResolutionSettingContext } from "./v1/identityResolutionSetting";
import { ImportListInstance, ImportContext } from "./v1/import";
import { LookupListInstance } from "./v1/lookup";
import { ObservationListInstance, ObservationContext } from "./v1/observation";
import { OperationListInstance } from "./v1/operation";
import { ProfileListInstance, ProfileContext } from "./v1/profile";
import { RecallListInstance } from "./v1/recall";
import { RevisionListInstance } from "./v1/revision";
import { StoreListInstance } from "./v1/store";
import { TraitListInstance } from "./v1/trait";
import { TraitGroupListInstance, TraitGroupContext } from "./v1/traitGroup";
export default class V1 extends Version {
    /**
     * Initialize the V1 version of Memory
     *
     * @param domain - The Twilio (Twilio.Memory) domain
     */
    constructor(domain: MemoryBase);
    /** operations - { Twilio.Memory.V1.OperationListInstance } resource */
    protected _operations?: OperationListInstance;
    /** stores - { Twilio.Memory.V1.StoreListInstance } resource */
    protected _stores?: StoreListInstance;
    /** Accessor for bulk resource */
    bulk(storeId: string): BulkContext;
    /** Accessor for conversationSummaries resource - list operations */
    conversationSummaries(storeId: string, profileId: string): ConversationSummaryListInstance;
    /** Accessor for conversationSummaries resource - instance operations */
    conversationSummaries(storeId: string, profileId: string, summaryId: string): ConversationSummaryContext;
    /** Accessor for dataMappings resource - list operations */
    dataMappings(storeId: string): DataMappingListInstance;
    /** Accessor for dataMappings resource - instance operations */
    dataMappings(storeId: string, dataMappingId: string): DataMappingContext;
    /** Accessor for events resource */
    events(storeId: string, profileId: string): EventListInstance;
    /** Accessor for identifiers resource - list operations */
    identifiers(storeId: string, profileId: string): IdentifierListInstance;
    /** Accessor for identifiers resource - instance operations */
    identifiers(storeId: string, profileId: string, idType: string): IdentifierContext;
    /** Accessor for identityResolutionSettings resource */
    identityResolutionSettings(storeId: string): IdentityResolutionSettingContext;
    /** Accessor for imports resource - list operations */
    imports(storeId: string): ImportListInstance;
    /** Accessor for imports resource - instance operations */
    imports(storeId: string, importId: string): ImportContext;
    /** Accessor for lookup resource */
    lookup(storeId: string): LookupListInstance;
    /** Accessor for observations resource - list operations */
    observations(storeId: string, profileId: string): ObservationListInstance;
    /** Accessor for observations resource - instance operations */
    observations(storeId: string, profileId: string, observationId: string): ObservationContext;
    /** Getter for operations resource */
    get operations(): OperationListInstance;
    /** Accessor for profiles resource - list operations */
    profiles(storeId: string): ProfileListInstance;
    /** Accessor for profiles resource - instance operations */
    profiles(storeId: string, profileId: string): ProfileContext;
    /** Accessor for recall resource */
    recall(storeId: string, profileId: string): RecallListInstance;
    /** Accessor for revisions resource */
    revisions(storeId: string, profileId: string, observationId: string): RevisionListInstance;
    /** Getter for stores resource */
    get stores(): StoreListInstance;
    /** Accessor for traits resource */
    traits(storeId: string, profileId: string): TraitListInstance;
    /** Accessor for traitGroups resource - list operations */
    traitGroups(storeId: string): TraitGroupListInstance;
    /** Accessor for traitGroups resource - instance operations */
    traitGroups(storeId: string, traitGroupName: string): TraitGroupContext;
}
