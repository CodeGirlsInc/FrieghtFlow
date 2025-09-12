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

    
    #[derive(Drop, starknet::Event)]
    struct InspectionCreated {
        #[key]
        inspection_id: u256,
        #[key]
        item_id: u256,
        inspection_type: InspectionType,
        inspector: ContractAddress,
        scheduled_date: u64
    }

    #[derive(Drop, starknet::Event)]
    struct InspectionCompleted {
        #[key]
        inspection_id: u256,
        #[key]
        item_id: u256,
        result: InspectionResult,
        compliance_status: ComplianceStatus,
        completion_date: u64
    }

    #[derive(Drop, starknet::Event)]
    struct QualityStandardCreated {
        #[key]
        standard_id: u256,
        name: ByteArray,
        created_by: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct CertificateIssued {
        #[key]
        certificate_id: u256,
        #[key]
        item_id: u256,
        certificate_type: CertificateType,
        issued_by: ContractAddress,
        valid_until: u64
    }

    #[derive(Drop, starknet::Event)]
    struct NonComplianceDetected {
        #[key]
        inspection_id: u256,
        #[key]
        item_id: u256,
        compliance_status: ComplianceStatus,
        findings_count: u32
    }

    
    #[derive(Drop, starknet::Event)]
    struct InspectorAuthorized {
        #[key]
        inspector: ContractAddress,
        authorized_by: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct LabCertified {
        #[key]
        lab: ContractAddress,
        certified_by: ContractAddress
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.next_inspection_id.write(1);
        self.next_standard_id.write(1);
        self.next_certificate_id.write(1);
    }

    #[abi(embed_v0)]
    impl QualityControlImpl of IQualityControl<ContractState> {
        fn create_inspection(
            ref self: ContractState,
            item_id: u256,
            inspection_type: InspectionType,
            standard_id: u256,
            scheduled_date: u64,
            inspector: ContractAddress
        ) -> u256 {
            // Access control: only authorized inspectors can create inspections
            assert(self.authorized_inspectors.entry(get_caller_address()).read(), 'Unauthorized inspector');
            
            let inspection_id = self.next_inspection_id.read();
            
            let inspection = InspectionRecord {
                id: inspection_id,
                item_id,
                inspection_type,
                standard_id,
                inspector,
                scheduled_date,
                completion_date: 0,
                result: InspectionResult::Pending,
                findings: array![],
                compliance_status: ComplianceStatus::UnderReview,
                is_completed: false
            };
            
            
            self.inspections.entry(inspection_id).write(inspection);
            
            // Update item inspection history
            let mut item_history = self.item_inspections.entry(item_id).read();
            item_history.append(inspection_id);
            self.item_inspections.entry(item_id).write(item_history);
            
            self.next_inspection_id.write(inspection_id + 1);
            
            self.emit(InspectionCreated {
                inspection_id,
                item_id,
                inspection_type,
                inspector,
                scheduled_date
            });
            
            inspection_id
        }

        fn complete_inspection(
            ref self: ContractState,
            inspection_id: u256,
            result: InspectionResult,
            findings: Array<QualityFinding>,
            compliance_status: ComplianceStatus
        ) {
            let caller = get_caller_address();
            assert(self.authorized_inspectors.entry(caller).read(), 'Unauthorized inspector');
            
            let mut inspection = self.inspections.entry(inspection_id).read();
            assert(!inspection.is_completed, 'Inspection already completed');
            assert(inspection.inspector == caller, 'Not assigned inspector');
            
            inspection.result = result;
            inspection.findings = findings.clone();
            inspection.compliance_status = compliance_status;
            inspection.completion_date = get_block_timestamp();
            inspection.is_completed = true;
            
            self.inspections.entry(inspection_id).write(inspection);
            
            self.emit(InspectionCompleted {
                inspection_id,
                item_id: inspection.item_id,
                result,
                compliance_status,
                completion_date: inspection.completion_date
            });
            
            
            // Emit non-compliance event if needed
            if compliance_status == ComplianceStatus::NonCompliant {
                self.emit(NonComplianceDetected {
                    inspection_id,
                    item_id: inspection.item_id,
                    compliance_status,
                    findings_count: findings.len()
                });
            }
        }

        fn create_quality_standard(
            ref self: ContractState,
            name: ByteArray,
            description: ByteArray,
            criteria: Array<QualityCriteria>
        ) -> u256 {
            // Only owner can create quality standards
            assert(get_caller_address() == self.owner.read(), 'Only owner can create standards');
            
            let standard_id = self.next_standard_id.read();
            
            let standard = QualityStandard {
                id: standard_id,
                name: name.clone(),
                description,
                criteria,
                created_by: get_caller_address(),
                created_at: get_block_timestamp(),
                is_active: true
            };
            
            self.quality_standards.entry(standard_id).write(standard);
            self.next_standard_id.write(standard_id + 1);
            
            self.emit(QualityStandardCreated {
                standard_id,
                name,
                created_by: get_caller_address()
            });
            
            standard_id
        }

        fn get_inspection_details(self: @ContractState, inspection_id: u256) -> InspectionRecord {
            self.inspections.entry(inspection_id).read()
        }

        fn get_item_quality_history(self: @ContractState, item_id: u256) -> Array<u256> {
            self.item_inspections.entry(item_id).read()
        }