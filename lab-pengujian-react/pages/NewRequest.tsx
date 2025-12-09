
import React, { useState, useEffect, useRef } from 'react';
import {
  Beaker, Scissors, Binary, Upload, Check, X,
  ChevronDown, ChevronRight, Loader2, Building, Phone, MapPin,
  FlaskConical, Package, Truck, FileCheck, AlertCircle
} from 'lucide-react';
import {
  LabService, TestTypeService, TujuanPengujianService, EnhancedRequestService
} from '../services/database';
import {
  User, Lab, TestType, TujuanPengujian, TestRequestFormData,
  Priority, DeliveryMethod, SampleReturn
} from '../types';

interface NewRequestProps {
  user: User;
}

const STEP_LABELS = [
  { id: 'A', title: 'Pendaftaran', icon: Building },
  { id: 'B', title: 'Layanan', icon: FlaskConical },
  { id: 'C', title: 'Sampel', icon: Package },
  { id: 'D', title: 'Logistik', icon: Truck },
  { id: 'E', title: 'Pernyataan', icon: FileCheck },
];

const SPECIAL_HANDLING_OPTIONS = [
  'Suhu Terkontrol',
  'Hindari Guncangan',
  'Jauhkan dari Sinar Matahari',
  'Material Mudah Pecah',
  'Bahan Berbahaya',
];

const initialFormData: TestRequestFormData = {
  // Bagian A
  companyName: '',
  phoneWhatsapp: '',
  address: '',
  // Bagian B
  labId: null,
  testTypeId: null,
  tujuanPengujian: [],
  tujuanLainnya: '',
  // Bagian C
  sampleName: '',
  sampleQuantity: 1,
  samplePackaging: '',
  description: '',
  estimatedDeliveryDate: '',
  priority: Priority.REGULAR,
  specialNotes: '',
  // Bagian D
  deliveryMethod: null,
  specialHandling: [],
  sampleReturn: null,
  // Bagian E
  dataAccuracyConfirmed: false,
  tatCostUnderstood: false,
};

export const NewRequest: React.FC<NewRequestProps> = ({ user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TestRequestFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string>('');

  // Lookup data
  const [labs, setLabs] = useState<Lab[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [tujuanPengujianOptions, setTujuanPengujianOptions] = useState<TujuanPengujian[]>([]);
  const [isLoadingLookup, setIsLoadingLookup] = useState(true);

  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load lookup data
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingLookup(true);
      try {
        const [labsData, tujuanData] = await Promise.all([
          LabService.getLabs(),
          TujuanPengujianService.getAll(),
        ]);
        setLabs(labsData);
        setTujuanPengujianOptions(tujuanData);
      } catch (error) {
        console.error('Failed to load lookup data:', error);
      } finally {
        setIsLoadingLookup(false);
      }
    };
    loadData();
  }, []);

  // Load test types when lab changes
  useEffect(() => {
    if (formData.labId) {
      TestTypeService.getByLab(formData.labId).then(setTestTypes);
    } else {
      setTestTypes([]);
    }
  }, [formData.labId]);

  // Pre-fill company name from user
  useEffect(() => {
    if (user.name) {
      setFormData(prev => ({ ...prev, companyName: user.name }));
    }
  }, [user.name]);

  const updateFormData = (updates: Partial<TestRequestFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const generateSampleCode = () => {
    const testType = testTypes.find(t => t.id === formData.testTypeId);
    if (!testType) return '';

    const initials = testType.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    return `${initials}-${dateStr}-${randomSeq}`;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Bagian A
        return !!(formData.companyName && formData.phoneWhatsapp && formData.address);
      case 1: // Bagian B
        return !!(formData.labId && formData.testTypeId && formData.tujuanPengujian.length > 0);
      case 2: // Bagian C
        return !!(formData.sampleName && formData.sampleQuantity > 0 && formData.description);
      case 3: // Bagian D
        return !!(formData.deliveryMethod && formData.sampleReturn);
      case 4: // Bagian E
        return formData.dataAccuracyConfirmed && formData.tatCostUnderstood;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Auto-generate sample code when moving from step B to C
      if (currentStep === 1 && !formData.sampleName) {
        updateFormData({ sampleName: generateSampleCode() });
      }
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const result = await EnhancedRequestService.create(formData);
      setSubmittedId(result.id);
      setSubmitted(true);
    } catch (error) {
      alert('Gagal mengirim permintaan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(0);
    setFormData({ ...initialFormData, companyName: user.name });
    setSelectedFile(null);
    setPreviewUrl(null);
    setSubmittedId('');
  };

  // File handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      processFile(event.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon upload file gambar (JPG/PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar (Max 5MB)');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleTujuanPengujian = (id: number) => {
    setFormData(prev => ({
      ...prev,
      tujuanPengujian: prev.tujuanPengujian.includes(id)
        ? prev.tujuanPengujian.filter(t => t !== id)
        : [...prev.tujuanPengujian, id],
    }));
  };

  const toggleSpecialHandling = (option: string) => {
    setFormData(prev => ({
      ...prev,
      specialHandling: prev.specialHandling.includes(option)
        ? prev.specialHandling.filter(h => h !== option)
        : [...prev.specialHandling, option],
    }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Check size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Permintaan Berhasil Dikirim!</h2>
        <p className="text-slate-500 mb-4">
          ID Permintaan: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">{submittedId}</span>
        </p>
        <p className="text-slate-500 mb-8">
          Kode Sampel: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">{formData.sampleName}</span>
        </p>
        <p className="text-sm text-slate-400 mb-6">
          Tim kami akan segera memverifikasi permintaan Anda. Status dapat dipantau di halaman Riwayat Permohonan.
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-2 bg-uii-blue text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Buat Permintaan Baru
        </button>
      </div>
    );
  }

  if (isLoadingLookup) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-uii-blue" size={32} />
        <span className="ml-3 text-slate-500">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Buat Permintaan Uji Baru</h1>
        <p className="text-slate-500">Lengkapi formulir 5 bagian berikut untuk mengajukan permohonan pengujian.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {STEP_LABELS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-uii-blue text-white shadow-md'
                    : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check size={18} />
                ) : (
                  <Icon size={18} />
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.id}. {step.title}</span>
                <span className="text-sm font-medium sm:hidden">{step.id}</span>
              </button>
              {index < STEP_LABELS.length - 1 && (
                <ChevronRight size={20} className={`mx-1 flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-slate-300'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">

        {/* Bagian A - Pendaftaran */}
        {currentStep === 0 && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Building size={20} className="text-uii-blue" />
                Bagian A - Data Pendaftaran
              </h3>
              <p className="text-sm text-slate-500 mt-1">Informasi perusahaan/instansi pemohon</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Perusahaan/Instansi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateFormData({ companyName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Masukkan nama perusahaan atau instansi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nomor Telepon/WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phoneWhatsapp}
                    onChange={(e) => updateFormData({ phoneWhatsapp: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="Jl. ..., Kec. ..., Kota/Kab. ..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bagian B - Layanan */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FlaskConical size={20} className="text-uii-blue" />
                Bagian B - Keperluan & Layanan
              </h3>
              <p className="text-sm text-slate-500 mt-1">Pilih laboratorium dan jenis pengujian yang dibutuhkan</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pilih Laboratorium <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {labs.map((lab) => {
                    const Icon = lab.iconName === 'Shirt' ? Scissors : lab.iconName === 'FlaskConical' ? Beaker : Binary;
                    const isSelected = formData.labId === lab.id;
                    return (
                      <button
                        key={lab.id}
                        type="button"
                        onClick={() => updateFormData({ labId: lab.id, testTypeId: null })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-uii-blue bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={24} className={isSelected ? 'text-uii-blue' : 'text-slate-400'} />
                        <p className={`font-medium mt-2 ${isSelected ? 'text-uii-blue' : 'text-slate-700'}`}>
                          {lab.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{lab.services?.slice(0, 2).join(', ')}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.labId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Jenis Pengujian <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.testTypeId || ''}
                      onChange={(e) => updateFormData({ testTypeId: parseInt(e.target.value) || null })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                    >
                      <option value="">Pilih jenis pengujian...</option>
                      {testTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tujuan Pengujian <span className="text-red-500">*</span>
                  <span className="font-normal text-slate-400 ml-2">(pilih satu atau lebih)</span>
                </label>
                <div className="space-y-2">
                  {tujuanPengujianOptions.map((tujuan) => (
                    <label key={tujuan.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tujuanPengujian.includes(tujuan.id)}
                        onChange={() => toggleTujuanPengujian(tujuan.id)}
                        className="mt-0.5 w-4 h-4 text-uii-blue border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-slate-700">{tujuan.name}</span>
                    </label>
                  ))}
                </div>
                {formData.tujuanPengujian.includes(5) && ( // 5 = Lainnya
                  <input
                    type="text"
                    value={formData.tujuanLainnya}
                    onChange={(e) => updateFormData({ tujuanLainnya: e.target.value })}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Jelaskan tujuan lainnya..."
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bagian C - Data Sampel */}
        {currentStep === 2 && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-uii-blue" />
                Bagian C - Data Sampel
              </h3>
              <p className="text-sm text-slate-500 mt-1">Informasi detail mengenai sampel yang akan diuji</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kode Sampel (Otomatis)
                </label>
                <input
                  type="text"
                  value={formData.sampleName}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-100 border border-gray-200 rounded-lg font-mono text-slate-600"
                />
                <p className="text-xs text-slate-400 mt-1">Kode unik ini akan digunakan untuk pelabelan.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Jumlah Sampel <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.sampleQuantity}
                  onChange={(e) => updateFormData({ sampleQuantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kemasan Sampel
                </label>
                <input
                  type="text"
                  value={formData.samplePackaging}
                  onChange={(e) => updateFormData({ samplePackaging: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Misal: Plastik klip, botol kaca, dll"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Perkiraan Tanggal Pengiriman
                </label>
                <input
                  type="date"
                  value={formData.estimatedDeliveryDate}
                  onChange={(e) => updateFormData({ estimatedDeliveryDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Deskripsi Sampel <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Jelaskan kondisi sampel, sumber, atau informasi relevan lainnya..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prioritas
                </label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.priority === Priority.REGULAR
                      ? 'border-uii-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="priority"
                      value={Priority.REGULAR}
                      checked={formData.priority === Priority.REGULAR}
                      onChange={(e) => updateFormData({ priority: e.target.value as Priority })}
                      className="sr-only"
                    />
                    <p className="font-medium text-slate-700">Regular</p>
                    <p className="text-xs text-slate-500 mt-1">Waktu pengujian standar</p>
                  </label>
                  <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.priority === Priority.URGENT
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="priority"
                      value={Priority.URGENT}
                      checked={formData.priority === Priority.URGENT}
                      onChange={(e) => updateFormData({ priority: e.target.value as Priority })}
                      className="sr-only"
                    />
                    <p className="font-medium text-slate-700">Urgent</p>
                    <p className="text-xs text-slate-500 mt-1">Biaya tambahan berlaku</p>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Catatan Khusus
                </label>
                <textarea
                  value={formData.specialNotes}
                  onChange={(e) => updateFormData({ specialNotes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Instruksi khusus atau catatan tambahan..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Bagian D - Logistik */}
        {currentStep === 3 && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Truck size={20} className="text-uii-blue" />
                Bagian D - Logistik & Penanganan
              </h3>
              <p className="text-sm text-slate-500 mt-1">Metode pengiriman dan penanganan sampel</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Metode Pengiriman Sampel <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.deliveryMethod === DeliveryMethod.ANTAR_LANGSUNG
                      ? 'border-uii-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.ANTAR_LANGSUNG}
                      checked={formData.deliveryMethod === DeliveryMethod.ANTAR_LANGSUNG}
                      onChange={(e) => updateFormData({ deliveryMethod: e.target.value as DeliveryMethod })}
                      className="sr-only"
                    />
                    <p className="font-medium text-slate-700">Antar Langsung</p>
                    <p className="text-xs text-slate-500 mt-1">Diantar ke lab oleh pemohon</p>
                  </label>
                  <label className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.deliveryMethod === DeliveryMethod.EKSPEDISI
                      ? 'border-uii-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.EKSPEDISI}
                      checked={formData.deliveryMethod === DeliveryMethod.EKSPEDISI}
                      onChange={(e) => updateFormData({ deliveryMethod: e.target.value as DeliveryMethod })}
                      className="sr-only"
                    />
                    <p className="font-medium text-slate-700">Via Ekspedisi</p>
                    <p className="text-xs text-slate-500 mt-1">Dikirim melalui jasa kurir</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Penanganan Khusus
                  <span className="font-normal text-slate-400 ml-2">(opsional)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPECIAL_HANDLING_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specialHandling.includes(option)}
                        onChange={() => toggleSpecialHandling(option)}
                        className="w-4 h-4 text-uii-blue border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pengembalian Sampel <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: SampleReturn.DIKEMBALIKAN, label: 'Dikembalikan', desc: 'Sampel akan dikembalikan setelah pengujian' },
                    { value: SampleReturn.DIMUSNAHKAN, label: 'Dimusnahkan', desc: 'Sampel dimusnahkan oleh lab' },
                    { value: SampleReturn.TIDAK_PERLU, label: 'Tidak Perlu', desc: 'Tidak perlu pengembalian' },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.sampleReturn === opt.value
                        ? 'border-uii-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="sampleReturn"
                        value={opt.value}
                        checked={formData.sampleReturn === opt.value}
                        onChange={(e) => updateFormData({ sampleReturn: e.target.value as SampleReturn })}
                        className="mt-0.5 w-4 h-4 text-uii-blue border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-slate-700">{opt.label}</p>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Foto Sampel
                  <span className="font-normal text-slate-400 ml-2">(opsional)</span>
                </label>
                {previewUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 max-w-sm group">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    <div className="p-2 bg-white border-t text-xs text-slate-500">
                      {selectedFile?.name} ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <Upload size={32} className="text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Klik untuk upload</p>
                    <p className="text-xs text-slate-400">JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bagian E - Pernyataan */}
        {currentStep === 4 && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileCheck size={20} className="text-uii-blue" />
                Bagian E - Pernyataan & Konfirmasi
              </h3>
              <p className="text-sm text-slate-500 mt-1">Baca dan setujui pernyataan berikut</p>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-slate-700 mb-3">Ringkasan Permohonan</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Perusahaan</p>
                  <p className="font-medium text-slate-800">{formData.companyName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Laboratorium</p>
                  <p className="font-medium text-slate-800">{labs.find(l => l.id === formData.labId)?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Jenis Pengujian</p>
                  <p className="font-medium text-slate-800">{testTypes.find(t => t.id === formData.testTypeId)?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Kode Sampel</p>
                  <p className="font-medium text-slate-800 font-mono">{formData.sampleName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Prioritas</p>
                  <p className={`font-medium ${formData.priority === Priority.URGENT ? 'text-orange-600' : 'text-slate-800'}`}>
                    {formData.priority === Priority.URGENT ? 'Urgent' : 'Regular'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Metode Pengiriman</p>
                  <p className="font-medium text-slate-800">
                    {formData.deliveryMethod === DeliveryMethod.ANTAR_LANGSUNG ? 'Antar Langsung' : 'Via Ekspedisi'}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmations */}
            <div className="space-y-4">
              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.dataAccuracyConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.dataAccuracyConfirmed}
                  onChange={(e) => updateFormData({ dataAccuracyConfirmed: e.target.checked })}
                  className="mt-0.5 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-slate-700">Keakuratan Data</p>
                  <p className="text-sm text-slate-500">
                    Saya menyatakan bahwa seluruh data yang diisi dalam formulir ini adalah benar dan akurat.
                    Saya bertanggung jawab atas kebenaran informasi tersebut.
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.tatCostUnderstood ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.tatCostUnderstood}
                  onChange={(e) => updateFormData({ tatCostUnderstood: e.target.checked })}
                  className="mt-0.5 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-slate-700">Waktu & Biaya Pengujian</p>
                  <p className="text-sm text-slate-500">
                    Saya memahami dan menyetujui estimasi waktu pengerjaan (TAT) serta biaya yang akan
                    diinformasikan oleh pihak laboratorium.
                  </p>
                </div>
              </label>
            </div>

            {(!formData.dataAccuracyConfirmed || !formData.tatCostUnderstood) && (
              <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle size={18} />
                <p className="text-sm">Mohon centang kedua pernyataan di atas untuk melanjutkan.</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Kembali
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className={`px-8 py-2.5 font-medium rounded-lg transition-colors shadow-md ${
                validateStep(currentStep)
                  ? 'bg-uii-blue text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              Lanjut
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!validateStep(4) || isSubmitting}
              className={`px-8 py-2.5 font-medium rounded-lg transition-colors shadow-md flex items-center gap-2 ${
                validateStep(4) && !isSubmitting
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Mengirim...</>
              ) : (
                <><Check size={18} /> Kirim Permintaan</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
