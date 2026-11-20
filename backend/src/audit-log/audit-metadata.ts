/** Request-scoped context populated by services for the global interceptor. */
export interface AuditMetadataCarrier {
  auditMetadata?: Record<string, unknown>;
  auditTargetType?: string;
  auditTargetId?: string;
}
