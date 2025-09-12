use starknet::ContractAddress;

#[starknet::interface]
trait IQualityControl<TContractState> {
    fn create_inspection(
        ref self: TContractState,
        item_id: u256,
        inspection_type: InspectionType,
        standard_id: u256,
        scheduled_date: u64,
        inspector: ContractAddress
    ) -> u256;
    
    fn complete_inspection(
        ref self: TContractState,
        inspection_id: u256,
        result: InspectionResult,
        findings: Array<QualityFinding>,
        compliance_status: ComplianceStatus
    );
    
    fn create_quality_standard(
        ref self: TContractState,
        name: ByteArray,
        description: ByteArray,
        criteria: Array<QualityCriteria>
    ) -> u256;
    
    fn get_inspection_details(self: @TContractState, inspection_id: u256) -> InspectionRecord;
    
    fn get_item_quality_history(self: @TContractState, item_id: u256) -> Array<u256>;
    
    fn check_compliance(self: @TContractState, item_id: u256, standard_id: u256) -> ComplianceStatus;
    
    fn issue_quality_certificate(
        ref self: TContractState,
        item_id: u256,
        certificate_type: CertificateType,
        standard_id: u256,
        valid_until: u64,
        issued_by: ContractAddress
    ) -> u256;
    
    fn authorize_inspector(ref self: TContractState, inspector: ContractAddress);
    
    fn authorize_certified_lab(ref self: TContractState, lab: ContractAddress);
    
    fn is_authorized_inspector(self: @TContractState, inspector: ContractAddress) -> bool;
    
    fn is_certified_lab(self: @TContractState, lab: ContractAddress) -> bool;
}

#[derive(Drop, Serde, starknet::Store)]
enum InspectionType {
    PreShipment,
    InTransit,
    Arrival,
    Periodic,
    Compliance,
    Safety,
    Quality
}

#[derive(Drop, Serde, starknet::Store)]
enum InspectionResult {
    Passed,
    Failed,
    ConditionalPass,
    Pending,
    Cancelled
}

#[derive(Drop, Serde, starknet::Store)]
enum ComplianceStatus {
    Compliant,
    NonCompliant,
    ConditionalCompliance,
    UnderReview,
    NotApplicable
}

#[derive(Drop, Serde, starknet::Store)]
enum CertificateType {
    QualityAssurance,
    ComplianceCertificate,
    SafetyCertificate,
    OriginCertificate,
    TestingCertificate
}

#[derive(Drop, Serde, starknet::Store)]
enum FindingType {
    Critical,
    Major,
    Minor,
    Observation,
    Recommendation
}

#[derive(Drop, Serde, starknet::Store)]
enum MeasurementType {
    Numerical,
    Boolean,
    Categorical,
    Range,
    Percentage
}

#[derive(Drop, Serde, starknet::Store)]
struct QualityFinding {
    finding_type: FindingType,
    description: ByteArray,
    severity_level: u8,
    corrective_action_required: bool,
    corrective_action: ByteArray
}

#[derive(Drop, Serde, starknet::Store)]
struct QualityCriteria {
    name: ByteArray,
    measurement_type: MeasurementType,
    min_value: u256,
    max_value: u256,
    target_value: u256,
    tolerance: u256,
    is_mandatory: bool
}

#[derive(Drop, Serde, starknet::Store)]
struct InspectionRecord {
    id: u256,
    item_id: u256,
    inspection_type: InspectionType,
    standard_id: u256,
    inspector: ContractAddress,
    scheduled_date: u64,
    completion_date: u64,
    result: InspectionResult,
    findings: Array<QualityFinding>,
    compliance_status: ComplianceStatus,
    is_completed: bool
}

#[derive(Drop, Serde, starknet::Store)]
struct QualityStandard {
    id: u256,
    name: ByteArray,
    description: ByteArray,
    criteria: Array<QualityCriteria>,
    created_by: ContractAddress,
    created_at: u64,
    is_active: bool
}

#[derive(Drop, Serde, starknet::Store)]
struct QualityCertificate {
    id: u256,
    item_id: u256,
    certificate_type: CertificateType,
    standard_id: u256,
    issued_by: ContractAddress,
    issued_at: u64,
    valid_until: u64,
    is_valid: bool
}

#[starknet::contract]
mod QualityControl {
    use super::{
        IQualityControl, InspectionType, InspectionResult, ComplianceStatus, CertificateType,
        FindingType, MeasurementType, QualityFinding, QualityCriteria, InspectionRecord,
        QualityStandard, QualityCertificate
    };
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        next_inspection_id: u256,
        next_standard_id: u256,
        next_certificate_id: u256,
        inspections: Map<u256, InspectionRecord>,
        quality_standards: Map<u256, QualityStandard>,
        certificates: Map<u256, QualityCertificate>,
        item_inspections: Map<u256, Array<u256>>,
        authorized_inspectors: Map<ContractAddress, bool>,
        certified_labs: Map<ContractAddress, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        InspectionCreated: InspectionCreated,
        InspectionCompleted: InspectionCompleted,
        QualityStandardCreated: QualityStandardCreated,
        CertificateIssued: CertificateIssued,
        NonComplianceDetected: NonComplianceDetected,
        InspectorAuthorized: InspectorAuthorized,
        LabCertified: LabCertified,
    }