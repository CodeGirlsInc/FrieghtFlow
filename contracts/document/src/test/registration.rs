use super::setup;
use crate::errors::DocumentError;
use crate::types::DocumentType;

#[test]
fn test_register_document() {
    let ctx = setup();

    let (id, hash) = ctx.register(&ctx.shipper, ctx.shipment_id);

    assert_eq!(id, 1);
    assert_eq!(ctx.client.get_total_documents(), 1);

    let doc = ctx.client.get_document(&id);
    assert_eq!(doc.id, 1);
    assert_eq!(doc.shipment_id, ctx.shipment_id);
    assert_eq!(doc.uploader, ctx.shipper);
    assert_eq!(doc.doc_type, DocumentType::BillOfLading);
    assert_eq!(doc.content_hash, hash);
    assert!(!doc.is_verified);
    assert!(doc.verified_by.is_none());
}

#[test]
fn test_multiple_docs_per_shipment() {
    let ctx = setup();

    let (id1, _) = ctx.register(&ctx.shipper, ctx.shipment_id);
    let id2 = ctx.client.register_document(
        &ctx.carrier,
        &ctx.shipment_id,
        &DocumentType::ProofOfDelivery,
        &ctx.fake_hash(),
        &ctx.fake_cid(),
    );

    let docs = ctx
        .client
        .get_documents_by_shipment(&ctx.shipment_id, &0, &10);
    assert_eq!(docs.len(), 2);
    assert_eq!(docs.get(0).unwrap(), id1);
    assert_eq!(docs.get(1).unwrap(), id2);
}

#[test]
fn test_documents_are_scoped_to_their_shipment() {
    let ctx = setup();
    let other = ctx.new_shipment();

    ctx.register(&ctx.shipper, ctx.shipment_id);
    ctx.register(&ctx.shipper, other);

    assert_eq!(
        ctx.client
            .get_documents_by_shipment(&ctx.shipment_id, &0, &10)
            .len(),
        1
    );
    assert_eq!(
        ctx.client.get_documents_by_shipment(&other, &0, &10).len(),
        1
    );
}

#[test]
fn test_documents_by_shipment_pagination() {
    let ctx = setup();

    for _ in 0..15 {
        ctx.register(&ctx.shipper, ctx.shipment_id);
    }

    let page1 = ctx
        .client
        .get_documents_by_shipment(&ctx.shipment_id, &0, &10);
    assert_eq!(page1.len(), 10);
    assert_eq!(page1.get(0), Some(1));
    assert_eq!(page1.get(9), Some(10));

    let page2 = ctx
        .client
        .get_documents_by_shipment(&ctx.shipment_id, &10, &10);
    assert_eq!(page2.len(), 5);
    assert_eq!(page2.get(0), Some(11));
    assert_eq!(page2.get(4), Some(15));

    let page3 = ctx
        .client
        .get_documents_by_shipment(&ctx.shipment_id, &20, &10);
    assert_eq!(page3.len(), 0);
}

#[test]
fn test_all_document_types() {
    let ctx = setup();

    let types = [
        DocumentType::BillOfLading,
        DocumentType::ProofOfDelivery,
        DocumentType::Invoice,
        DocumentType::CustomsDeclaration,
        DocumentType::InsuranceCertificate,
        DocumentType::Photo,
        DocumentType::Other,
    ];

    for doc_type in types {
        let id = ctx.client.register_document(
            &ctx.shipper,
            &ctx.shipment_id,
            &doc_type,
            &ctx.fake_hash(),
            &ctx.fake_cid(),
        );
        assert_eq!(ctx.client.get_document(&id).doc_type, doc_type);
    }
}

#[test]
fn test_not_found_error() {
    let ctx = setup();
    let result = ctx.client.try_get_document(&404u64);
    assert_eq!(result, Err(Ok(DocumentError::NotFound)));
}

#[test]
fn test_double_initialize_fails() {
    let ctx = setup();

    let result = ctx.client.try_initialize(&ctx.admin, &ctx.shipment.address);
    assert_eq!(result, Err(Ok(DocumentError::AlreadyInitialized)));
}
