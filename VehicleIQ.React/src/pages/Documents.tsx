import React, { useEffect, useState, useRef } from 'react';
import { FileText, Upload, Trash2, Download, Eye, FolderCheck, Shield, FileCheck, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import CockpitCard from '../components/cockpit/CockpitCard';
import MetricTile from '../components/cockpit/MetricTile';
import CockpitButton from '../components/cockpit/CockpitButton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import RegistrationPlate from '../components/cockpit/RegistrationPlate';

import { documentsApi } from '../api/documents.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { DocumentDto, VehicleDto } from '../types';
import { DocumentType } from '../types';
import { formatDate, formatFileSize, documentTypeLabel } from '../utils/formatters';

export default function Documents() {
  const [docs, setDocs] = useState<DocumentDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.RC);
  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => Promise.all([documentsApi.getAll(), vehiclesApi.getAll()]).then(([d, v]) => { setDocs(d); setVehicles(v); });
  useEffect(() => { load(); }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('documentType', String(docType));
    if (vehicleId) fd.append('vehicleId', String(vehicleId));
    try {
      await documentsApi.upload(fd);
      toast.success('Document uploaded to vault!');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await documentsApi.delete(deleteId);
      toast.success('Document deleted successfully');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDocs = filterType === 'all'
    ? docs
    : docs.filter(d => d.documentType === filterType);

  const rcCount = docs.filter(d => d.documentType === DocumentType.RC).length;
  const insuranceCount = docs.filter(d => d.documentType === DocumentType.Insurance).length;
  const pucCount = docs.filter(d => d.documentType === DocumentType.PUC).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricTile
          label="Total Vault Documents"
          value={docs.length}
          unit="files"
          icon={<FolderCheck className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricTile
          label="RC Registration Books"
          value={rcCount}
          unit="RCs"
          icon={<FileText className="w-5 h-5" />}
          accentColor="amber"
        />
        <MetricTile
          label="Insurance Policies"
          value={insuranceCount}
          unit="policies"
          icon={<Shield className="w-5 h-5" />}
          accentColor="green"
        />
        <MetricTile
          label="PUC Certificates"
          value={pucCount}
          unit="tests"
          icon={<FileCheck className="w-5 h-5" />}
          accentColor="blue"
        />
      </div>

      {/* Upload Drop Zone Card */}
      <CockpitCard accent="amber" title="Secure Telemetry Document Vault Upload" subtitle="Upload vehicle RC books, insurance policies, or PUC test papers">
        <div className="flex flex-col lg:flex-row items-center gap-6 justify-between pt-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cockpit-amber/15 border border-cockpit-amber/30 text-cockpit-amber flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-cockpit-muted font-mono">Supported Formats: PDF, JPG, PNG, DOC (Max 10MB)</p>
              <p className="text-xs text-cockpit-text font-semibold mt-0.5">Encrypted local file storage associated with digital twin vehicle units.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="form-group mb-0 min-w-[170px]">
              <select
                value={docType}
                onChange={e => setDocType(Number(e.target.value) as DocumentType)}
                className="bg-cockpit-surface-2 border-cockpit-border text-cockpit-text rounded-xl text-xs py-2 px-3"
              >
                {Object.entries(DocumentType).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                  <option key={v as number} value={v as number}>{documentTypeLabel[v as DocumentType]}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0 min-w-[180px]">
              <select
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value ? Number(e.target.value) : '')}
                className="bg-cockpit-surface-2 border-cockpit-border text-cockpit-text rounded-xl text-xs py-2 px-3"
              >
                <option value="">— Unassigned Unit —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registrationNumber})</option>)}
              </select>
            </div>

            <CockpitButton
              variant="primary"
              loading={uploading}
              icon={<Upload className="w-4 h-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'Uploading…' : 'Select File'}
            </CockpitButton>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>
        </div>
      </CockpitCard>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap font-mono text-xs border-b border-cockpit-border pb-3">
        <span className="text-cockpit-muted font-medium flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5 text-cockpit-amber" /> Filter Category:
        </span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg transition-all border ${
            filterType === 'all'
              ? 'bg-cockpit-amber text-black font-bold border-cockpit-amber'
              : 'bg-cockpit-surface-2 text-cockpit-muted border-cockpit-border hover:text-cockpit-text'
          }`}
        >
          ALL ({docs.length})
        </button>
        {Object.entries(DocumentType).filter(([, v]) => typeof v === 'number').map(([k, v]) => {
          const count = docs.filter(d => d.documentType === (v as DocumentType)).length;
          return (
            <button
              key={v as number}
              onClick={() => setFilterType(v as DocumentType)}
              className={`px-3 py-1.5 rounded-lg transition-all border ${
                filterType === v
                  ? 'bg-cockpit-amber text-black font-bold border-cockpit-amber'
                  : 'bg-cockpit-surface-2 text-cockpit-muted border-cockpit-border hover:text-cockpit-text'
              }`}
            >
              {documentTypeLabel[v as DocumentType]} ({count})
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-cockpit-amber" />}
          title="No documents in vault"
          description="Upload RC books, insurance policies, emission papers, or service bills."
          action={
            <CockpitButton variant="primary" icon={<Upload className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()}>
              Upload Document
            </CockpitButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocs.map(doc => {
            const vehicle = vehicles.find(v => v.id === doc.vehicleId);
            const isImage = doc.contentType.startsWith('image/');
            const fileUrl = `http://localhost:5109/${doc.filePath}`;

            return (
              <CockpitCard
                key={doc.id}
                title={doc.originalFileName}
                subtitle={`${formatFileSize(doc.fileSizeBytes)} • Uploaded ${formatDate(doc.createdAt)}`}
                action={
                  <button
                    onClick={() => setDeleteId(doc.id)}
                    className="btn-cockpit-danger !p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                }
              >
                {vehicle && (
                  <div className="my-3 p-2 rounded-lg bg-cockpit-surface-2/60 border border-cockpit-border flex items-center justify-between">
                    <span className="text-xs font-bold text-cockpit-text">{vehicle.make} {vehicle.model}</span>
                    <RegistrationPlate registrationNumber={vehicle.registrationNumber} size="sm" />
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-cockpit-border flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-cockpit-amber font-bold border border-cockpit-amber/30 px-2 py-0.5 rounded bg-cockpit-amber/10">
                    {documentTypeLabel[doc.documentType]}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-cockpit-secondary !px-2.5 !py-1 text-xs"
                      title="View File"
                    >
                      <Eye className="w-3.5 h-3.5 text-cockpit-amber" /> View
                    </a>
                    <a
                      href={fileUrl}
                      download
                      className="btn-cockpit-secondary !px-2.5 !py-1 text-xs"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  </div>
                </div>
              </CockpitCard>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Document"
        description="Are you sure you want to delete this document?"
      />
    </div>
  );
}
