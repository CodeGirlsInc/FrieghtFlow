'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Eye, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  carrierCertificationsApi,
  CertificationType,
  type CarrierCertification,
} from '../../lib/api/carrier-certifications.api';
import { getErrorMessage } from '../../lib/api/client';
import { documentsApi } from '../../lib/api/documents.api';
import { buildFileAcceptAttribute } from '../../lib/validation/file-upload';
import { DocumentViewer } from '../documents/DocumentViewer';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const ACCEPTED_FILES = buildFileAcceptAttribute();
const DAY_MS = 24 * 60 * 60 * 1000;

function verificationBadge(certification: CarrierCertification) {
  if (certification.isVerified) {
    return { label: 'Verified', className: 'bg-green-500/10 text-green-700' };
  }
  return { label: 'Pending review', className: 'bg-yellow-500/10 text-yellow-700' };
}

function expiryBadge(certification: CarrierCertification) {
  if (!certification.expiresAt) {
    return { label: 'No expiry', className: 'bg-muted text-muted-foreground' };
  }
  const expiry = new Date(certification.expiresAt);
  const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / DAY_MS);
  if (daysLeft < 0) {
    return { label: 'Expired', className: 'bg-red-500/10 text-red-700' };
  }
  if (daysLeft <= 30) {
    return { label: 'Expires soon', className: 'bg-yellow-500/10 text-yellow-700' };
  }
  return {
    label: `Valid until ${expiry.toLocaleDateString()}`,
    className: 'bg-muted text-muted-foreground',
  };
}

export function CertificationsPanel() {
  const [certifications, setCertifications] = useState<CarrierCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<CertificationType>(
    CertificationType.OPERATING_LICENSE,
  );
  const [issuedBy, setIssuedBy] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [viewing, setViewing] = useState<{
    id: string;
    fileName: string;
    mimeType?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCertifications(await carrierCertificationsApi.listMine());
    } catch (err) {
      toast.error(getErrorMessage(err) ?? 'Failed to load certifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error('Choose a certification file.');
      return;
    }
    if (!issuedBy.trim()) {
      toast.error('Issuer is required.');
      return;
    }

    let expiryIso: string | undefined;
    if (expiresAt) {
      const expiry = new Date(`${expiresAt}T23:59:59Z`);
      if (expiry.getTime() <= Date.now()) {
        toast.error('Expiry date must be in the future.');
        return;
      }
      expiryIso = expiry.toISOString();
    }

    setSubmitting(true);
    try {
      const document = await documentsApi.uploadCertificationDocument(file);
      await carrierCertificationsApi.create({
        documentType,
        documentId: document.id,
        issuedBy: issuedBy.trim(),
        expiresAt: expiryIso,
        notes: notes.trim() || undefined,
      });
      toast.success('Certification added.');
      setFile(null);
      setIssuedBy('');
      setExpiresAt('');
      setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err) ?? 'Failed to add certification.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (certification: CarrierCertification) => {
    try {
      await carrierCertificationsApi.remove(certification.id);
      toast.success('Certification deleted.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err) ?? 'Failed to delete certification.');
    }
  };

  const handleView = async (certification: CarrierCertification) => {
    if (!certification.documentId) {
      if (certification.fileUrl) {
        window.open(certification.fileUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      toast.error('No document is attached to this certification.');
      return;
    }
    try {
      const document = await documentsApi.getById(certification.documentId);
      setViewing({
        id: document.id,
        fileName: document.originalName,
        mimeType: document.mimetype,
      });
    } catch (err) {
      toast.error(getErrorMessage(err) ?? 'Failed to open certification document.');
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add certification</CardTitle>
          <CardDescription>
            Upload a platform-hosted document and record its type, issuer and
            expiry.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="certification-file">Document</Label>
              <Input
                ref={fileInputRef}
                id="certification-file"
                type="file"
                accept={ACCEPTED_FILES}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification-type">Certification type</Label>
              <select
                id="certification-type"
                value={documentType}
                onChange={(event) =>
                  setDocumentType(event.target.value as CertificationType)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Object.values(CertificationType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification-issuer">Issued by</Label>
              <Input
                id="certification-issuer"
                placeholder="Federal Motor Carrier Safety Administration"
                value={issuedBy}
                onChange={(event) => setIssuedBy(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification-expiry">
                Expiry date <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="certification-expiry"
                type="date"
                min={today}
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certification-notes">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="certification-notes"
                placeholder="Valid for interstate commerce"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add certification
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your certifications</CardTitle>
          <CardDescription>
            Verification status and expiry are shown for each certification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading certifications…</p>
          ) : certifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No certifications uploaded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {certifications.map((certification) => {
                const verification = verificationBadge(certification);
                const expiry = expiryBadge(certification);
                return (
                  <li
                    key={certification.id}
                    className="flex flex-wrap items-center gap-3 rounded-md border px-3 py-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium">{certification.documentType}</p>
                      <p className="text-xs text-muted-foreground">
                        {certification.issuedBy} · Added{' '}
                        {new Date(certification.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${verification.className}`}
                        >
                          {verification.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${expiry.className}`}
                        >
                          {expiry.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`View ${certification.documentType}`}
                        onClick={() => handleView(certification)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        aria-label={`Delete ${certification.documentType}`}
                        onClick={() => handleDelete(certification)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {viewing && (
        <DocumentViewer
          open
          onClose={() => setViewing(null)}
          documentId={viewing.id}
          fileName={viewing.fileName}
          mimeType={viewing.mimeType}
        />
      )}
    </div>
  );
}
