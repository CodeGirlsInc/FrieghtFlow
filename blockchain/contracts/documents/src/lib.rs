#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, String, Vec, BytesN};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Document(String),
    DocumentCount,
    UserDocuments(Address),
    ContractConfig,
}

#[derive(Clone)]
#[contracttype]
pub enum DocumentType {
    BillOfLading,
    CommercialInvoice,
    PackingList,
    Certificate,
    CustomsDeclaration,
    InsurancePolicy,
    DeliveryReceipt,
    Other,
}

#[derive(Clone)]
#[contracttype]
pub enum DocumentStatus {
    Draft,
    Submitted,
    Verified,
    Rejected,
    Archived,
}

#[derive(Clone)]
#[contracttype]
pub struct Document {
    pub id: String,
    pub shipment_id: Option<String>,
    pub document_type: DocumentType,
    pub title: String,
    pub description: Option<String>,
    pub uploader: Address,
    pub file_hash: String,
    pub file_size: u64,
    pub mime_type: String,
    pub status: DocumentStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub verified_by: Option<Address>,
    pub verified_at: Option<u64>,
    pub access_list: Vec<Address>,
    pub is_public: bool,
    pub metadata: Option<String>,
}

#[derive(Clone)]
#[contracttype]
pub struct DocumentConfig {
    pub admin: Address,
    pub max_file_size: u64,
    pub allowed_mime_types: Vec<String>,
    pub verification_required: bool,
}

#[contract]
pub struct DocumentContract;

#[contractimpl]
impl DocumentContract {
    /// Initialize document contract
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        
        let config = DocumentConfig {
            admin: admin.clone(),
            max_file_size: 50_000_000, // 50MB
            allowed_mime_types: vec![
                String::from_str(&env, "application/pdf"),
                String::from_str(&env, "image/jpeg"),
                String::from_str(&env, "image/png"),
                String::from_str(&env, "application/msword"),
                String::from_str(&env, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            ],
            verification_required: true,
        };

        env.storage().instance().set(&DataKey::ContractConfig, &config);
        env.storage().instance().set(&DataKey::DocumentCount, &0u64);
    }

    /// Upload document
    pub fn upload_document(
        env: Env,
        uploader: Address,
        shipment_id: Option<String>,
        document_type: DocumentType,
        title: String,
        description: Option<String>,
        file_hash: String,
        file_size: u64,
        mime_type: String,
        access_list: Vec<Address>,
        is_public: bool,
        metadata: Option<String>,
    ) -> String {
        uploader.require_auth();

        let config: DocumentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        
        // Validate file size
        if file_size > config.max_file_size {
            panic!("File size exceeds maximum allowed");
        }

        // Validate MIME type
        if !config.allowed_mime_types.contains(&mime_type) {
            panic!("File type not allowed");
        }

        let mut document_count: u64 = env.storage().instance().get(&DataKey::DocumentCount).unwrap_or(0);
        document_count += 1;

        let document_id = format!("DOC{:08}", document_count);
        let current_time = env.ledger().timestamp();

        let document = Document {
            id: document_id.clone(),
            shipment_id,
            document_type,
            title,
            description,
            uploader: uploader.clone(),
            file_hash,
            file_size,
            mime_type,
            status: DocumentStatus::Submitted,
            created_at: current_time,
            updated_at: current_time,
            verified_by: None,
            verified_at: None,
            access_list,
            is_public,
            metadata,
        };

        env.storage().persistent().set(&DataKey::Document(document_id.clone()), &document);
        env.storage().instance().set(&DataKey::DocumentCount, &document_count);

        // Add to user's documents
        Self::add_document_to_user(&env, &uploader, &document_id);

        document_id
    }

    /// Verify document
    pub fn verify_document(
        env: Env,
        verifier: Address,
        document_id: String,
        approved: bool,
        notes: Option<String>,
    ) {
        verifier.require_auth();

        let mut document: Document = env.storage().persistent()
            .get(&DataKey::Document(document_id.clone()))
            .expect("Document not found");

        let config: DocumentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        
        // Check if verifier has permission
        if verifier != config.admin && !document.access_list.contains(&verifier) {
            panic!("Unauthorized to verify document");
        }

        if !matches!(document.status, DocumentStatus::Submitted) {
            panic!("Document not in submitted status");
        }

        let current_time = env.ledger().timestamp();
        document.verified_by = Some(verifier);
        document.verified_at = Some(current_time);
        document.updated_at = current_time;

        if approved {
            document.status = DocumentStatus::Verified;
        } else {
            document.status = DocumentStatus::Rejected;
        }

        env.storage().persistent().set(&DataKey::Document(document_id), &document);
    }

    /// Update document access
    pub fn update_access(
        env: Env,
        caller: Address,
        document_id: String,
        new_access_list: Vec<Address>,
        is_public: bool,
    ) {
        caller.require_auth();

        let mut document: Document = env.storage().persistent()
            .get(&DataKey::Document(document_id.clone()))
            .expect("Document not found");

        if caller != document.uploader {
            let config: DocumentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
            if caller != config.admin {
                panic!("Only uploader or admin can update access");
            }
        }

        document.access_list = new_access_list;
        document.is_public = is_public;
        document.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Document(document_id), &document);
    }

    /// Get document (with access control)
    pub fn get_document(env: Env, caller: Address, document_id: String) -> Document {
        let document: Document = env.storage().persistent()
            .get(&DataKey::Document(document_id))
            .expect("Document not found");

        // Check access permissions
        if !document.is_public {
            if caller != document.uploader && !document.access_list.contains(&caller) {
                let config: DocumentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
                if caller != config.admin {
                    panic!("Access denied");
                }
            }
        }

        document
    }

    /// Get user documents
    pub fn get_user_documents(env: Env, user: Address) -> Vec<String> {
        env.storage().persistent()
            .get(&DataKey::UserDocuments(user))
            .unwrap_or(vec![])
    }

    /// Archive document
    pub fn archive_document(env: Env, caller: Address, document_id: String) {
        caller.require_auth();

        let mut document: Document = env.storage().persistent()
            .get(&DataKey::Document(document_id.clone()))
            .expect("Document not found");

        if caller != document.uploader {
            let config: DocumentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
            if caller != config.admin {
                panic!("Only uploader or admin can archive document");
            }
        }

        document.status = DocumentStatus::Archived;
        document.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Document(document_id), &document);
    }

    /// Get document count
    pub fn get_document_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::DocumentCount).unwrap_or(0)
    }

    /// Update configuration (Admin only)
    pub fn update_config(
        env: Env,
        admin: Address,
        max_file_size: Option<u64>,
        verification_required: Option<bool>,
    ) {
        admin.require_auth();
        
        let mut config: DocumentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        
        if admin != config.admin {
            panic!("Admin access required");
        }

        if let Some(size) = max_file_size {
            config.max_file_size = size;
        }

        if let Some(verification) = verification_required {
            config.verification_required = verification;
        }

        env.storage().instance().set(&DataKey::ContractConfig, &config);
    }

    // Helper function
    fn add_document_to_user(env: &Env, user: &Address, document_id: &String) {
        let mut user_documents: Vec<String> = env.storage().persistent()
            .get(&DataKey::UserDocuments(user.clone()))
            .unwrap_or(vec![]);
        
        user_documents.push_back(document_id.clone());
        env.storage().persistent().set(&DataKey::UserDocuments(user.clone()), &user_documents);
    }
}
