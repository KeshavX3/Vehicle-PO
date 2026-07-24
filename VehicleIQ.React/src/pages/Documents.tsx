import { useEffect, useState, useRef } from 'react';
import { FileText, Upload, Trash2, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { documentsApi } from '../api/documents.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { DocumentDto, VehicleDto } from '../types';
import { DocumentType } from '../types';
import { formatDate, formatFileSize, documentTypeLabel } from '../utils/formatters';

const docTypeVariants: Record<DocumentType, 'blue'|'green'|'amber'|'red'|'purple'|'slate'> = {
  [DocumentType.RC]: 'blue',
  [DocumentType.DrivingLicense]: 'green',
  [DocumentType.Insurance]: 'amber',
  [DocumentType.PUC]: 'purple',
  [DocumentType.ServiceBill]: 'slate',
  [DocumentType.Other]: 'slate',
};

const fileIconColor: Record<string, string> = {
  'application/pdf': 'text-red-400',
  'image/jpeg': 'text-blue-400',
  'image/png': 'text-blue-400',
  default: 'text-slate-400',
};

import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

export default function Documents() {
  const [docs, setDocs] = useState<DocumentDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.Other);
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
      toast.success('Document uploaded!');
      load();
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
      toast.success('Document deleted permanently from server and database');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload Bar */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="form-group">
            <label>Document Type</label>
            <select value={docType} onChange={e => setDocType(Number(e.target.value) as DocumentType)} className="min-w-[160px]">
              {Object.entries(DocumentType).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                <option key={v as number} value={v as number}>{documentTypeLabel[v as DocumentType]}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Vehicle (optional)</label>
            <select value={vehicleId} onChange={e => setVehicleId(e.target.value ? Number(e.target.value) : '')} className="min-w-[180px]">
              <option value="">— None —</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
            </select>
          </div>
          <button className="btn-primary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload Document'}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        </div>
      </Card>

      {/* Documents Grid */}
      {docs.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title="No documents yet"
          description="Upload RC books, insurance policies, PUC certificates and more."
          action={<button onClick={() => fileInputRef.current?.click()} className="btn-primary"><Upload className="w-4 h-4" /> Upload First Document</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {docs.map(doc => {
            const vehicle = vehicles.find(v => v.id === doc.vehicleId);
            const iconColor = fileIconColor[doc.contentType] || fileIconColor.default;
            return (
              <div key={doc.id} className="glass-card hover:border-white/15 transition-all duration-300 group">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center ${iconColor} flex-shrink-0`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{doc.originalFileName}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(doc.fileSizeBytes)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge label={documentTypeLabel[doc.documentType]} variant={docTypeVariants[doc.documentType]} />
                  {vehicle && <Badge label={vehicle.registrationNumber} variant="slate" />}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/8">
                  <p className="text-xs text-slate-500">{formatDate(doc.createdAt)}</p>
                  <div className="flex gap-1">
                    <a href={`http://localhost:5109/${doc.filePath}`} target="_blank" rel="noreferrer"
                      className="btn-ghost !px-2 !py-1.5 opacity-0 group-hover:opacity-100">
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => setDeleteId(doc.id)} className="btn-danger !px-2 !py-1.5 opacity-0 group-hover:opacity-100" title="Delete document">
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
        description="Are you sure you want to permanently delete this document and remove its physical file from the server?"
      />
    </div>
  );
}
