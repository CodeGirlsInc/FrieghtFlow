use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    clock::Clock,
    sysvar::Sysvar,
};

// Program entrypoint
entrypoint!(process_instruction);

// Document types
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum DocumentType {
    BillOfLading,
    ProofOfDelivery,
    Invoice,
    CustomsDeclaration,
    InsuranceCertificate,
    Photo,
    Other,
}

// Document record structure
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct DocumentRecord {
    pub document_id: u64,
    pub document_hash: [u8; 32],
    pub document_type: DocumentType,
    pub shipment_id: String,
    pub uploader: Pubkey,
    pub upload_timestamp: i64,
    pub metadata_ipfs_hash: String,
    pub is_verified: bool,
}

// Program state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ProgramState {
    pub document_count: u64,
    pub owner: Pubkey,
}

// Instructions
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum DocumentInstruction {
    /// Initialize the program
    /// Accounts expected:
    /// 0. `[writable]` State account
    /// 1. `[signer]` Owner account
    Initialize,

    /// Register a new document
    /// Accounts expected:
    /// 0. `[writable]` Document account
    /// 1. `[writable]` State account
    /// 2. `[signer]` Uploader account
    RegisterDocument {
        document_hash: [u8; 32],
        document_type: DocumentType,
        shipment_id: String,
        metadata_ipfs_hash: String,
    },

    /// Verify a document
    /// Accounts expected:
    /// 0. `[writable]` Document account
    /// 1. `[signer]` Verifier account
    /// 2. `[]` State account
    VerifyDocument,

    /// Update document metadata
    /// Accounts expected:
    /// 0. `[writable]` Document account
    /// 1. `[signer]` Uploader account
    UpdateMetadata {
        new_metadata_hash: String,
    },
}

// Main program logic
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = DocumentInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        DocumentInstruction::Initialize => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts)
        }
        DocumentInstruction::RegisterDocument {
            document_hash,
            document_type,
            shipment_id,
            metadata_ipfs_hash,
        } => {
            msg!("Instruction: RegisterDocument");
            process_register_document(
                program_id,
                accounts,
                document_hash,
                document_type,
                shipment_id,
                metadata_ipfs_hash,
            )
        }
        DocumentInstruction::VerifyDocument => {
            msg!("Instruction: VerifyDocument");
            process_verify_document(program_id, accounts)
        }
        DocumentInstruction::UpdateMetadata { new_metadata_hash } => {
            msg!("Instruction: UpdateMetadata");
            process_update_metadata(program_id, accounts, new_metadata_hash)
        }
    }
}

fn process_initialize(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let state_account = next_account_info(accounts_iter)?;
    let owner_account = next_account_info(accounts_iter)?;

    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let state = ProgramState {
        document_count: 0,
        owner: *owner_account.key,
    };

    state.serialize(&mut &mut state_account.data.borrow_mut()[..])?;
    
    msg!("Program initialized with owner: {}", owner_account.key);
    Ok(())
}

fn process_register_document(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    document_hash: [u8; 32],
    document_type: DocumentType,
    shipment_id: String,
    metadata_ipfs_hash: String,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let state_account = next_account_info(accounts_iter)?;
    let uploader_account = next_account_info(accounts_iter)?;

    if !uploader_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Validate hash is not zero
    if document_hash == [0u8; 32] {
        msg!("Error: Invalid hash (all zeros)");
        return Err(ProgramError::InvalidArgument);
    }

    // Load and update state
    let mut state = ProgramState::try_from_slice(&state_account.data.borrow())?;
    state.document_count += 1;

    // Get current timestamp
    let clock = Clock::get()?;
    let timestamp = clock.unix_timestamp;

    // Create document record
    let document = DocumentRecord {
        document_id: state.document_count,
        document_hash,
        document_type,
        shipment_id: shipment_id.clone(),
        uploader: *uploader_account.key,
        upload_timestamp: timestamp,
        metadata_ipfs_hash,
        is_verified: false,
    };

    // Save document
    document.serialize(&mut &mut document_account.data.borrow_mut()[..])?;
    
    // Save updated state
    state.serialize(&mut &mut state_account.data.borrow_mut()[..])?;

    msg!("Document registered with ID: {}", document.document_id);
    msg!("Hash: {:?}", document_hash);
    msg!("Shipment: {}", shipment_id);
    
    Ok(())
}

fn process_verify_document(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let verifier_account = next_account_info(accounts_iter)?;
    let state_account = next_account_info(accounts_iter)?;

    if !verifier_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check if verifier is owner
    let state = ProgramState::try_from_slice(&state_account.data.borrow())?;
    if *verifier_account.key != state.owner {
        msg!("Error: Not authorized verifier");
        return Err(ProgramError::InvalidAccountData);
    }

    // Load document and verify
    let mut document = DocumentRecord::try_from_slice(&document_account.data.borrow())?;
    document.is_verified = true;

    // Save updated document
    document.serialize(&mut &mut document_account.data.borrow_mut()[..])?;

    msg!("Document {} verified by {}", document.document_id, verifier_account.key);
    
    Ok(())
}

fn process_update_metadata(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    new_metadata_hash: String,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let uploader_account = next_account_info(accounts_iter)?;

    if !uploader_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Load document
    let mut document = DocumentRecord::try_from_slice(&document_account.data.borrow())?;

    // Check if caller is uploader
    if document.uploader != *uploader_account.key {
        msg!("Error: Not the document uploader");
        return Err(ProgramError::InvalidAccountData);
    }

    // Update metadata
    document.metadata_ipfs_hash = new_metadata_hash.clone();

    // Save updated document
    document.serialize(&mut &mut document_account.data.borrow_mut()[..])?;

    msg!("Metadata updated for document {}", document.document_id);
    msg!("New IPFS hash: {}", new_metadata_hash);
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_document_type_serialization() {
        let doc_type = DocumentType::BillOfLading;
        let serialized = doc_type.try_to_vec().unwrap();
        let deserialized = DocumentType::try_from_slice(&serialized).unwrap();
        assert_eq!(doc_type, deserialized);
    }

    #[test]
    fn test_document_record_serialization() {
        let doc = DocumentRecord {
            document_id: 1,
            document_hash: [1u8; 32],
            document_type: DocumentType::Invoice,
            shipment_id: "SHIP001".to_string(),
            uploader: Pubkey::new_unique(),
            upload_timestamp: 1234567890,
            metadata_ipfs_hash: "QmTest123".to_string(),
            is_verified: false,
        };

        let serialized = doc.try_to_vec().unwrap();
        let deserialized = DocumentRecord::try_from_slice(&serialized).unwrap();
        assert_eq!(doc.document_id, deserialized.document_id);
    }
}
