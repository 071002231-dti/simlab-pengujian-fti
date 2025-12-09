
import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Beaker, Clock, XCircle,
  FileText, Copy, ChevronDown, Loader2, Eye, Edit3, ToggleRight,
  ClipboardList
} from 'lucide-react';
import { ProcedureTemplateService, LabService } from '../../services/database';
import { ProcedureTemplate, Lab, User } from '../../types';

interface ProcedureTemplatesProps {
  user: User;
}

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' },
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aktif' },
  deprecated: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Tidak Aktif' },
};

export const ProcedureTemplates: React.FC<ProcedureTemplatesProps> = ({ }) => {
  const [templates, setTemplates] = useState<ProcedureTemplate[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLab, setFilterLab] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProcedureTemplate | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterLab, filterStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [templatesRes, labsData] = await Promise.all([
        ProcedureTemplateService.getAll({
          labId: filterLab || undefined,
          status: filterStatus || undefined,
        }),
        LabService.getLabs(),
      ]);
      setTemplates(templatesRes.data);
      setLabs(labsData);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (template: ProcedureTemplate) => {
    try {
      const detail = await ProcedureTemplateService.getById(template.id);
      setSelectedTemplate(detail);
      setShowDetail(true);
    } catch (error) {
      console.error('Failed to load template detail:', error);
    }
  };

  const handleActivate = async (templateId: number) => {
    if (!confirm('Aktivasi template ini akan menonaktifkan template aktif sebelumnya untuk jenis pengujian yang sama. Lanjutkan?')) {
      return;
    }

    setIsActivating(true);
    try {
      await ProcedureTemplateService.activate(templateId);
      await loadData();
      setShowDetail(false);
      alert('Template berhasil diaktifkan');
    } catch (error) {
      alert('Gagal mengaktifkan template');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDuplicate = async (templateId: number) => {
    const newVersion = prompt('Masukkan versi baru (contoh: 2.0):');
    if (!newVersion) return;

    try {
      await ProcedureTemplateService.duplicate(templateId, newVersion);
      await loadData();
      alert('Template berhasil diduplikasi');
    } catch (error) {
      alert('Gagal menduplikasi template');
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.testTypeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList size={24} className="text-uii-blue" />
            Manajemen Template Prosedur
          </h1>
          <p className="text-slate-500 mt-1">Kelola SOP dan template prosedur pengujian laboratorium</p>
        </div>
        <button
          onClick={() => alert('Fitur buat template baru akan segera tersedia')}
          className="flex items-center gap-2 px-4 py-2 bg-uii-blue text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={18} />
          <span>Buat Template</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari template..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Lab Filter */}
          <div className="relative">
            <select
              value={filterLab || ''}
              onChange={(e) => setFilterLab(e.target.value ? parseInt(e.target.value) : null)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[160px]"
            >
              <option value="">Semua Lab</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>{lab.name}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[140px]"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
              <option value="deprecated">Tidak Aktif</option>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-uii-blue" size={32} />
          <span className="ml-3 text-slate-500">Memuat data...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">Tidak Ada Template</h3>
          <p className="text-slate-500">Belum ada template prosedur yang tersedia.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => {
            const statusStyle = STATUS_BADGES[template.status] || STATUS_BADGES.draft;
            return (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Beaker size={20} className="text-uii-blue" />
                      <h3 className="font-semibold text-slate-800">{template.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {template.labName} • {template.testTypeName}
                      </span>
                      <span className="flex items-center gap-1">
                        Versi {template.version}
                      </span>
                      {template.referenceStandard && (
                        <span className="flex items-center gap-1">
                          {template.referenceStandard}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-slate-600">
                        <ClipboardList size={14} className="text-slate-400" />
                        {template.stepsCount} Tahap
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        Est. {template.estimatedTatDays} hari
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewDetail(template)}
                      className="p-2 text-slate-500 hover:text-uii-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                    {template.status === 'draft' && (
                      <button
                        onClick={() => alert('Fitur edit akan segera tersedia')}
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(template.id)}
                      className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Duplikat"
                    >
                      <Copy size={18} />
                    </button>
                    {template.status === 'draft' && (
                      <button
                        onClick={() => handleActivate(template.id)}
                        className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Aktifkan"
                      >
                        <ToggleRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedTemplate.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedTemplate.labName} • {selectedTemplate.testTypeName} • Versi {selectedTemplate.version}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-medium text-slate-800 capitalize">{selectedTemplate.status}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Tahapan</p>
                  <p className="font-medium text-slate-800">{selectedTemplate.steps?.length || 0} step</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Est. TAT</p>
                  <p className="font-medium text-slate-800">{selectedTemplate.estimatedTatDays} hari</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Durasi Total</p>
                  <p className="font-medium text-slate-800">{selectedTemplate.totalEstimatedMinutes || 0} menit</p>
                </div>
              </div>

              {selectedTemplate.referenceStandard && (
                <div className="mb-6">
                  <p className="text-xs text-slate-500 mb-1">Standar Referensi</p>
                  <p className="font-medium text-slate-800">{selectedTemplate.referenceStandard}</p>
                </div>
              )}

              {selectedTemplate.description && (
                <div className="mb-6">
                  <p className="text-xs text-slate-500 mb-1">Deskripsi</p>
                  <p className="text-slate-700">{selectedTemplate.description}</p>
                </div>
              )}

              {/* Steps */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">Tahapan Prosedur</h3>
                <div className="space-y-3">
                  {selectedTemplate.steps?.map((step) => (
                    <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 bg-uii-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {step.stepOrder}
                        </span>
                        <h4 className="font-medium text-slate-800">{step.name}</h4>
                        {step.requiresApproval && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                            Perlu Approval
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 ml-9">{step.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 ml-9 text-xs text-slate-500">
                        <span>Durasi: {step.estimatedDurationMinutes} menit</span>
                        <span>Role: {step.responsibleRole}</span>
                        {step.equipment && step.equipment.length > 0 && (
                          <span>Alat: {step.equipment.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Tutup
              </button>
              {selectedTemplate.status === 'draft' && (
                <button
                  onClick={() => handleActivate(selectedTemplate.id)}
                  disabled={isActivating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  {isActivating ? (
                    <><Loader2 size={16} className="animate-spin" /> Mengaktifkan...</>
                  ) : (
                    <><ToggleRight size={16} /> Aktifkan Template</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
