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