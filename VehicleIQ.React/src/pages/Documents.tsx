import { useEffect, useState, useRef } from 'react';
import { FileText, Upload, Trash2, Download, Eye, File, FolderCheck, Shield, FileCheck, Filter, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { documentsApi } from '../api/documents.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { DocumentDto, VehicleDto } from '../types';
import { DocumentType } from '../types';
import { formatDate, formatFileSize, documentTypeLabel } from '../utils/formatters';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

const docTypeVariants: Record<DocumentType, 'blue'|'green'|'amber'|'red'|'purple'|'slate'> = {
  [DocumentType.RC]: 'blue',
  [DocumentType.DrivingLicense]: 'green',
  [DocumentType.Insurance]: 'amber',
  [DocumentType.PUC]: 'purple',
  [DocumentType.ServiceBill]: 'slate',
  [DocumentType.Other]: 'slate',
};

const fileIconColor: Record<string, string> = {
  'application/pdf': 'bg-red-500/10 text-red-400 border-red-500/20',
  'image/jpeg': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'image/png': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  default: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

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
      toast.success('Document uploaded successfully!');
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
      toast.success('Document deleted permanently');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={docs.length.toString()}
          subtitle="Stored on secure vault"
          icon={<FolderCheck className="w-5 h-5" />}
          ring="blue"
        />
        <StatCard
          title="RC Books"
          value={rcCount.toString()}
          subtitle="Vehicle registrations"
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          ring="blue"
        />
        <StatCard
          title="Insurance Policies"
          value={insuranceCount.toString()}
          subtitle="Policy coverages"
          icon={<Shield className="w-5 h-5 text-amber-400" />}
          ring="amber"
        />
        <StatCard
          title="PUC Certificates"
          value={pucCount.toString()}
          subtitle="Emission test records"
          icon={<FileCheck className="w-5 h-5 text-purple-400" />}
          ring="purple"
        />
      </div>

      {/* Hero Upload Drop Zone */}
      <Card className="!p-6 border-accent/20 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-transparent relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 text-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Upload Vehicle Document</h3>
              <p className="text-xs text-slate-400 mt-1">Upload RC, Insurance, PUC, or Service invoices (PDF, JPG, PNG up to 10MB)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="form-group mb-0 min-w-[160px]">
              <select
                value={docType}
                onChange={e => setDocType(Number(e.target.value) as DocumentType)}
                className="bg-navy-800 border-white/12 text-white rounded-xl text-xs py-2 px-3 focus:ring-accent"
              >
                {Object.entries(DocumentType).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                  <option key={v as number} value={v as number}>{documentTypeLabel[v as DocumentType]}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0 min-w-[170px]">
              <select
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value ? Number(e.target.value) : '')}
                className="bg-navy-800 border-white/12 text-white rounded-xl text-xs py-2 px-3 focus:ring-accent"
              >
                <option value="">— Unassigned —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registrationNumber})</option>)}
              </select>
            </div>

            <button
              className="btn-primary !py-2.5 !px-5 shadow-lg shadow-blue-500/20 flex items-center gap-2"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Choose File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap border-b border-white/8 pb-3">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5 text-accent" /> Filter:
        </span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-accent text-white shadow-md shadow-blue-500/20'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          All ({docs.length})
        </button>
        {Object.entries(DocumentType).filter(([, v]) => typeof v === 'number').map(([k, v]) => {
          const count = docs.filter(d => d.documentType === (v as DocumentType)).length;
          return (
            <button
              key={v as number}
              onClick={() => setFilterType(v as DocumentType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === v
                  ? 'bg-accent text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
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
          icon={<FileText className="w-8 h-8 text-accent" />}
          title={filterType === 'all' ? "No documents uploaded yet" : `No ${documentTypeLabel[filterType as DocumentType]} documents`}
          description="Upload your vehicle RC books, insurance papers, emission certificates, and service bills to keep them handy."
          action={
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDocs.map(doc => {
            const vehicle = vehicles.find(v => v.id === doc.vehicleId);
            const styleClass = fileIconColor[doc.contentType] || fileIconColor.default;
            const isImage = doc.contentType.startsWith('image/');
            const fileUrl = `http://localhost:5109/${doc.filePath}`;

            return (
              <div
                key={doc.id}
                className="glass-card hover:border-accent/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group flex flex-col justify-between overflow-hidden"
              >
                {/* Header / Thumbnail */}
                <div className="p-4 flex-1">
                  <div className="flex items-start gap-3.5">
                    {/* Icon or Thumbnail */}
                    {isImage ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/15 bg-slate-900 flex-shrink-0 relative group-hover:scale-105 transition-transform">
                        <img src={fileUrl} alt={doc.originalFileName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-14 h-14 rounded-xl border flex items-center justify-center flex-shrink-0 ${styleClass} shadow-md`}>
                        <FileText className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-accent transition-colors" title={doc.originalFileName}>
                        {doc.originalFileName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{formatFileSize(doc.fileSizeBytes)}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{formatDate(doc.createdAt)}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mt-4">
                    <Badge label={documentTypeLabel[doc.documentType]} variant={docTypeVariants[doc.documentType]} />
                    {vehicle ? (
                      <Badge label={`${vehicle.make} (${vehicle.registrationNumber})`} variant="slate" />
                    ) : (
                      <span className="text-[11px] text-slate-500">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-4 py-3 bg-white/3 border-t border-white/8 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                    {doc.contentType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost !px-2.5 !py-1.5 !text-xs !text-slate-300 hover:!text-white border-white/10 flex items-center gap-1"
                      title="View / Open File"
                    >
                      <Eye className="w-3.5 h-3.5 text-accent" />
                      View
                    </a>
                    <a
                      href={fileUrl}
                      download
                      className="btn-ghost !px-2.5 !py-1.5 !text-xs !text-slate-300 hover:!text-white border-white/10 flex items-center gap-1"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                    <button
                      onClick={() => setDeleteId(doc.id)}
                      className="btn-danger !px-2 !py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
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
        description="Are you sure you want to permanently delete this document and remove its file from the server?"
      />
    </div>
  );
}
