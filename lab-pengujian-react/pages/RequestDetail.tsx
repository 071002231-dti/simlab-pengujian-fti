
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building, Phone, MapPin, Beaker, Package, Truck,
  AlertCircle, FileText, Loader2
} from 'lucide-react';
import { EnhancedRequestService, RequestProcedureService } from '../services/database';
import { ProcedureProgress } from '../components/ProcedureProgress';
import {
  TestRequest, RequestStatus, User as UserType, Priority,
  DeliveryMethod, SampleReturn, ProcedureStatus, RequestProcedureStep
} from '../types';

interface RequestDetailProps {
  user: UserType;
}

type TabType = 'info' | 'procedure' | 'attachments';

const STATUS_STYLES: Record<RequestStatus, { bg: string; text: string; label: string }> = {
  [RequestStatus.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Menunggu Persetujuan' },
  [RequestStatus.APPROVED]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Disetujui Admin' },
  [RequestStatus.RECEIVED]: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Sampel Diterima' },
  [RequestStatus.IN_PROGRESS]: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Sedang Diuji' },
  [RequestStatus.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' },
  [RequestStatus.DELIVERED]: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hasil Dikirim' },
};

export const RequestDetail: React.FC<RequestDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [request, setRequest] = useState<TestRequest | null>(null);
  const [procedureData, setProcedureData] = useState<{
    procedure: any;
    steps: RequestProcedureStep[];
    approvals: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const requestData = await EnhancedRequestService.getById(id);
        if (!requestData) {
          setError('Permintaan tidak ditemukan');
          return;
        }
        setRequest(requestData);

        // Load procedure if exists
        const procData = await RequestProcedureService.getByRequestId(id);
        if (procData) {
          setProcedureData({
            procedure: procData.procedure,
            steps: procData.steps as RequestProcedureStep[],
            approvals: procData.approvals,
          });
        }
      } catch (err) {
        setError('Gagal memuat data permintaan');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const canExecuteProcedure = user.role !== 'customer';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-uii-blue" size={32} />
        <span className="ml-3 text-slate-500">Memuat data...</span>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{error || 'Terjadi Kesalahan'}</h2>
        <p className="text-slate-500 mb-6">Tidak dapat memuat detail permintaan.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-uii-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES[RequestStatus.PENDING];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Kembali</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{request.sampleName || request.id}</h1>
            <p className="text-slate-500 mt-1">ID: {request.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'info', label: 'Informasi', icon: FileText },
            { id: 'procedure', label: 'Prosedur', icon: Beaker },
            { id: 'attachments', label: 'Lampiran', icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'border-uii-blue text-uii-blue bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Building size={18} className="text-uii-blue" />
                    Data Pemohon
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Nama Perusahaan</p>
                      <p className="font-medium text-slate-800">{request.companyName || request.customerName}</p>
                    </div>
                    {request.phoneWhatsapp && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <p className="text-slate-700">{request.phoneWhatsapp}</p>
                      </div>
                    )}
                    {request.address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-400 mt-0.5" />
                        <p className="text-slate-700 text-sm">{request.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Beaker size={18} className="text-uii-blue" />
                    Layanan
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Laboratorium</p>
                      <p className="font-medium text-slate-800">{request.labName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Jenis Pengujian</p>
                      <p className="font-medium text-slate-800">{request.testType}</p>
                    </div>
                    {request.tujuanPengujian && (
                      <div>
                        <p className="text-xs text-slate-500">Tujuan</p>
                        <p className="text-slate-700 text-sm">
                          {request.tujuanPengujian.selected?.join(', ')}
                          {request.tujuanPengujian.lainnyaText && ` (${request.tujuanPengujian.lainnyaText})`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sample Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Package size={18} className="text-uii-blue" />
                  Data Sampel
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Kode Sampel</p>
                      <p className="font-mono font-medium text-slate-800">{request.sampleName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Jumlah</p>
                      <p className="font-medium text-slate-800">{request.sampleQuantity || 1}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Prioritas</p>
                      <p className={`font-medium ${request.priority === Priority.URGENT ? 'text-orange-600' : 'text-slate-800'}`}>
                        {request.priority === Priority.URGENT ? 'Urgent' : 'Regular'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tanggal Diajukan</p>
                      <p className="font-medium text-slate-800">{request.dateSubmitted}</p>
                    </div>
                  </div>
                  {request.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-slate-500 mb-1">Deskripsi</p>
                      <p className="text-slate-700">{request.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Logistics */}
              {(request.deliveryMethod || request.sampleReturn) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Truck size={18} className="text-uii-blue" />
                    Logistik
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {request.deliveryMethod && (
                      <div>
                        <p className="text-xs text-slate-500">Metode Pengiriman</p>
                        <p className="font-medium text-slate-800">
                          {request.deliveryMethod === DeliveryMethod.ANTAR_LANGSUNG ? 'Antar Langsung' : 'Via Ekspedisi'}
                        </p>
                      </div>
                    )}
                    {request.sampleReturn && (
                      <div>
                        <p className="text-xs text-slate-500">Pengembalian Sampel</p>
                        <p className="font-medium text-slate-800">
                          {request.sampleReturn === SampleReturn.DIKEMBALIKAN
                            ? 'Dikembalikan'
                            : request.sampleReturn === SampleReturn.DIMUSNAHKAN
                              ? 'Dimusnahkan'
                              : 'Tidak Perlu'}
                        </p>
                      </div>
                    )}
                    {request.specialHandling && request.specialHandling.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500">Penanganan Khusus</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.specialHandling.map((h, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Procedure Tab */}
          {activeTab === 'procedure' && (
            <div className="animate-in fade-in duration-300">
              {procedureData ? (
                <ProcedureProgress
                  templateName={procedureData.procedure.templateName}
                  templateVersion={procedureData.procedure.templateVersion}
                  status={procedureData.procedure.status as ProcedureStatus}
                  assignedAnalyst={procedureData.procedure.assignedAnalyst}
                  progressPercentage={procedureData.procedure.progressPercentage}
                  steps={procedureData.steps}
                  canExecute={canExecuteProcedure}
                  onStepClick={(step) => {
                    console.log('Step clicked:', step);
                    // TODO: Open step execution modal
                  }}
                />
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <Beaker size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">Prosedur Belum Ditetapkan</h3>
                  <p className="text-slate-500 text-sm">
                    {request.status === RequestStatus.PENDING
                      ? 'Prosedur akan ditetapkan setelah permintaan disetujui admin.'
                      : 'Prosedur pengujian belum diassign untuk permintaan ini.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">Belum Ada Lampiran</h3>
                <p className="text-slate-500 text-sm">
                  Dokumen dan lampiran terkait akan ditampilkan di sini.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
