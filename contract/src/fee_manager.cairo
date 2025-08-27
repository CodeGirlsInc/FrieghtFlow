use starknet::ContractAddress;

#[starknet::interface]
trait IFeeManager<TContractState> {
    fn set_fee_structure(ref self: TContractState, fee_type: FeeType, rate: u256, flat_fee: u256);
    fn calculate_total_fees(self: @TContractState, amount: u256, service_type: ServiceType) -> FeeBreakdown;
    fn collect_fees(ref self: TContractState, fee_type: FeeType, amount: u256, token_address: ContractAddress);
    fn distribute_fees(ref self: TContractState, fee_type: FeeType);
    fn get_fee_structure(self: @TContractState, fee_type: FeeType) -> FeeStructure;
    fn add_fee_recipient(ref self: TContractState, recipient: ContractAddress, share_percentage: u256);
}

#[derive(Drop, Serde, starknet::Store)]
enum FeeType {
    Platform,
    Processing,
    Escrow,
    Dispute,
    Late,
    Cancellation,
}

#[derive(Drop, Serde, starknet::Store)]
enum ServiceType {
    StandardShipping,
    ExpressShipping,
    InternationalShipping,
    HazardousMaterials,
    HighValue,
    Bulk,
}

#[derive(Drop, Serde, starknet::Store)]
struct FeeStructure {
    fee_type: FeeType,
    rate: u256, // basis points
    flat_fee: u256,
    min_fee: u256,
    max_fee: u256,
    is_active: bool,
}

#[derive(Drop, Serde, starknet::Store)]
struct FeeBreakdown {
    platform_fee: u256,
    processing_fee: u256,
    service_fee: u256,
    total_fee: u256,
}

#[derive(Drop, Serde, starknet::Store)]
struct FeeRecipient {
    address: ContractAddress,
    share_percentage: u256, // basis points
    is_active: bool,
}

#[starknet::contract]
mod FeeManagerContract {
    use super::{IFeeManager, FeeType, ServiceType, FeeStructure, FeeBreakdown, FeeRecipient};
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map
    };
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    #[storage]
    struct Storage {
        fee_structures: Map<FeeType, FeeStructure>,
        fee_recipients: Map<FeeType, Array<FeeRecipient>>,
        collected_fees: Map<(FeeType, ContractAddress), u256>, // fee_type -> token -> amount
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        FeeStructureUpdated: FeeStructureUpdated,
        FeesCollected: FeesCollected,
        FeesDistributed: FeesDistributed,
        FeeRecipientAdded: FeeRecipientAdded,
    }

    #[derive(Drop, starknet::Event)]
    struct FeeStructureUpdated {
        #[key]
        fee_type: FeeType,
        rate: u256,
        flat_fee: u256,
        updated_by: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct FeesCollected {
        #[key]
        fee_type: FeeType,
        amount: u256,
        token_address: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct FeesDistributed {
        #[key]
        fee_type: FeeType,
        total_amount: u256,
        recipients_count: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct FeeRecipientAdded {
        #[key]
        fee_type: FeeType,
        recipient: ContractAddress,
        share_percentage: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        
        // Initialize default fee structures
        self._initialize_default_fees();
    }

    #[abi(embed_v0)]
    impl FeeManagerImpl of IFeeManager<ContractState> {
        fn set_fee_structure(ref self: ContractState, fee_type: FeeType, rate: u256, flat_fee: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can set fees');
            
            let fee_structure = FeeStructure {
                fee_type,
                rate,
                flat_fee,
                min_fee: 0,
                max_fee: 0,
                is_active: true,
            };
            
            self.fee_structures.entry(fee_type).write(fee_structure);
            
            self.emit(FeeStructureUpdated {
                fee_type,
                rate,
                flat_fee,
                updated_by: caller,
            });
        }

        fn calculate_total_fees(self: @ContractState, amount: u256, service_type: ServiceType) -> FeeBreakdown {
            let platform_structure = self.fee_structures.entry(FeeType::Platform).read();
            let processing_structure = self.fee_structures.entry(FeeType::Processing).read();
            
            let platform_fee = self._calculate_fee(amount, platform_structure);
            let processing_fee = self._calculate_fee(amount, processing_structure);
            
            // Service-specific fee calculation
            let service_fee = match service_type {
                ServiceType::ExpressShipping => amount * 150 / 10000, // 1.5%
                ServiceType::InternationalShipping => amount * 300 / 10000, // 3%
                ServiceType::HazardousMaterials => amount * 500 / 10000, // 5%
                ServiceType::HighValue => amount * 200 / 10000, // 2%
                ServiceType::Bulk => amount * 50 / 10000, // 0.5%
                _ => amount * 100 / 10000, // 1% standard
            };
            
            FeeBreakdown {
                platform_fee,
                processing_fee,
                service_fee,
                total_fee: platform_fee + processing_fee + service_fee,
            }
        }

        fn collect_fees(ref self: ContractState, fee_type: FeeType, amount: u256, token_address: ContractAddress) {
            let caller = get_caller_address();
            // In real implementation, would verify caller is authorized contract
            
            let current_balance = self.collected_fees.entry((fee_type, token_address)).read();
            self.collected_fees.entry((fee_type, token_address)).write(current_balance + amount);
            
            self.emit(FeesCollected {
                fee_type,
                amount,
                token_address,
            });
        }

        fn distribute_fees(ref self: ContractState, fee_type: FeeType) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can distribute');
            
            let recipients = self.fee_recipients.entry(fee_type).read();
            assert(recipients.len() > 0, 'No recipients configured');
            
            // For simplicity, assuming ETH distribution
            // In real implementation, would handle multiple tokens
            let eth_address = starknet::contract_address_const::<0>();
            let total_amount = self.collected_fees.entry((fee_type, eth_address)).read();
            
            if total_amount > 0 {
                let mut i = 0;
                loop {
                    if i >= recipients.len() {
                        break;
                    }
                    
                    let recipient = *recipients.at(i);
                    if recipient.is_active {
                        let share_amount = (total_amount * recipient.share_percentage) / 10000;
                        // Transfer share_amount to recipient.address
                        // Implementation would use actual token transfers
                    }
                    
                    i += 1;
                };
                
                // Reset collected fees
                self.collected_fees.entry((fee_type, eth_address)).write(0);
                
                self.emit(FeesDistributed {
                    fee_type,
                    total_amount,
                    recipients_count: recipients.len(),
                });
            }
        }

        fn get_fee_structure(self: @ContractState, fee_type: FeeType) -> FeeStructure {
            self.fee_structures.entry(fee_type).read()
        }

        fn add_fee_recipient(ref self: ContractState, recipient: ContractAddress, share_percentage: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can add recipients');
            assert(share_percentage <= 10000, 'Share exceeds 100%');
            
            let fee_recipient = FeeRecipient {
                address: recipient,
                share_percentage,
                is_active: true,
            };
            
            // Add to platform fee recipients by default
            let mut recipients = self.fee_recipients.entry(FeeType::Platform).read();
            recipients.append(fee_recipient);
            self.fee_recipients.entry(FeeType::Platform).write(recipients);
            
            self.emit(FeeRecipientAdded {
                fee_type: FeeType::Platform,
                recipient,
                share_percentage,
            });
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _calculate_fee(self: @ContractState, amount: u256, structure: FeeStructure) -> u256 {
            if !structure.is_active {
                return 0;
            }
            
            let percentage_fee = (amount * structure.rate) / 10000;
            let total_fee = percentage_fee + structure.flat_fee;
            
            // Apply min/max limits if set
            if structure.min_fee > 0 && total_fee < structure.min_fee {
                return structure.min_fee;
            }
            
            if structure.max_fee > 0 && total_fee > structure.max_fee {
                return structure.max_fee;
            }
            
            total_fee
        }

        fn _initialize_default_fees(ref self: ContractState) {
            // Platform fee: 2.5%
            let platform_fee = FeeStructure {
                fee_type: FeeType::Platform,
                rate: 250,
                flat_fee: 0,
                min_fee: 0,
                max_fee: 0,
                is_active: true,
            };
            self.fee_structures.entry(FeeType::Platform).write(platform_fee);
            
            // Processing fee: 0.5%
            let processing_fee = FeeStructure {
                fee_type: FeeType::Processing,
                rate: 50,
                flat_fee: 0,
                min_fee: 0,
                max_fee: 0,
                is_active: true,
            };
            self.fee_structures.entry(FeeType::Processing).write(processing_fee);
            
            // Escrow fee: 1%
            let escrow_fee = FeeStructure {
                fee_type: FeeType::Escrow,
                rate: 100,
                flat_fee: 0,
                min_fee: 0,
                max_fee: 0,
                is_active: true,
            };
            self.fee_structures.entry(FeeType::Escrow).write(escrow_fee);
        }
    }
}
