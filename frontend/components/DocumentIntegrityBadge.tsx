import React from 'react';

interface DocumentIntegrityBadgeProps {
  documentHash: string;
  verified: boolean;
  timestamp?: Date;
}

export const DocumentIntegrityBadge: React.FC<DocumentIntegrityBadgeProps> = ({
  documentHash,
  verified,
  timestamp,
}) => {
  return (
    <div className={`integrity-badge ${verified ? 'verified' : 'unverified'}`}>
      <div className="badge-content">
        <span className="badge-icon">
          {verified ? '✓' : '✗'}
        </span>
        <span className="badge-status">
          {verified ? 'Verified' : 'Unverified'}
        </span>
      </div>
      <div className="badge-details">
        <small>Hash: {documentHash.substring(0, 16)}...</small>
        {timestamp && <small>On-Chain: {timestamp.toISOString()}</small>}
      </div>
    </div>
  );
};
