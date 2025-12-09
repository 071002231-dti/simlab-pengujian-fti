
export enum UserRole {
  ADMIN = 'admin',
  LABORAN = 'laboran',
  CUSTOMER = 'customer',
}

export enum RequestStatus {
  PENDING = 'Menunggu Persetujuan',
  APPROVED = 'Disetujui Admin',
  RECEIVED = 'Sampel Diterima',
  IN_PROGRESS = 'Sedang Diuji',
  COMPLETED = 'Selesai',
  DELIVERED = 'Hasil Dikirim',
}

export enum ProcedureStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_sample_revision',
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed',
}

export enum PassFailStatus {
  PASS = 'pass',
  FAIL = 'fail',
  PENDING = 'pending',
}

export enum ApprovalType {
  ADMIN_VERIFICATION = 'admin_verification',
  ANALYST_VERIFICATION = 'analyst_verification',
  STEP_APPROVAL = 'step_approval',
  SUPERVISOR_APPROVAL = 'supervisor_approval',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum Priority {
  REGULAR = 'regular',
  URGENT = 'urgent',
}

export enum DeliveryMethod {
  ANTAR_LANGSUNG = 'antar_langsung',
  EKSPEDISI = 'ekspedisi',
}

export enum SampleReturn {
  DIKEMBALIKAN = 'dikembalikan',
  DIMUSNAHKAN = 'dimusnahkan',
  TIDAK_PERLU = 'tidak_perlu',
}

export interface Lab {
  id: number;
  name: string;
  code: string;
  description: string;
  services: string[];
  iconName: string;
}

export interface TestType {
  id: number;
  labId: number;
  labName?: string;
  name: string;
  code: string;
  description?: string;
}

export interface TujuanPengujian {
  id: number;
  name: string;
  code: string;
  requiresInput: boolean;
}

export interface Parameter {
  name: string;
  unit: string;
  type: 'number' | 'text' | 'calculated' | 'select';
  options?: string[];
}

export interface PassFailCriteria {
  min?: number;
  max?: number;
  maxValue?: number;
  unit?: string;
  description?: string;
}

export interface ProcedureStep {
  id: number;
  stepOrder: number;
  name: string;
  description: string;
  equipment?: string[];
  materials?: string[];
  parameters?: Parameter[];
  passFailCriteria?: PassFailCriteria;
  estimatedDurationMinutes: number;
  responsibleRole: 'analyst' | 'admin' | 'supervisor';
  requiresApproval: boolean;
}

export interface ProcedureTemplate {
  id: number;
  testTypeId: number;
  testTypeName?: string;
  labName?: string;
  version: string;
  name: string;
  description?: string;
  referenceStandard?: string;
  estimatedTatDays: number;
  status: 'draft' | 'active' | 'deprecated';
  steps?: ProcedureStep[];
  stepsCount?: number;
  totalEstimatedMinutes?: number;
  createdBy?: { id: number; name: string };
  approvedBy?: { id: number; name: string };
  approvedAt?: string;
  createdAt?: string;
}

export interface RequestProcedureStep {
  id: number;
  stepOrder: number;
  name: string;
  description: string;
  equipment?: string[];
  parameters?: Parameter[];
  passFailCriteria?: PassFailCriteria;
  requiresApproval: boolean;
  status: StepStatus;
  results?: Record<string, { value: any; unit: string }>;
  attachments?: string[];
  notes?: string;
  passFailStatus: PassFailStatus;
  executedBy?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProcedureApproval {
  id: number;
  type: ApprovalType;
  status: ApprovalStatus;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface RequestProcedure {
  id: number;
  templateName: string;
  templateVersion: string;
  status: ProcedureStatus;
  assignedAnalyst?: { id: number; name: string };
  startedAt?: string;
  completedAt?: string;
  progressPercentage: number;
  currentStep?: number;
  steps: RequestProcedureStep[];
  approvals: ProcedureApproval[];
}

// Enhanced TestRequest with 5-section form fields
export interface TestRequest {
  id: string;
  userId: number;
  customerName: string;
  labId: number;
  labName: string;
  testType: string;
  dateSubmitted: string;
  status: RequestStatus;
  expiryDate?: string;
  description?: string;
  sampleName?: string;
  // Bagian A - Pendaftaran
  companyName?: string;
  phoneWhatsapp?: string;
  address?: string;
  // Bagian B - Keperluan
  testTypeId?: number;
  tujuanPengujian?: { selected: number[]; lainnyaText?: string };
  // Bagian C - Data Sampel
  sampleQuantity?: number;
  samplePackaging?: string;
  estimatedDeliveryDate?: string;
  priority?: Priority;
  specialNotes?: string;
  // Bagian D - Logistik
  deliveryMethod?: DeliveryMethod;
  specialHandling?: string[];
  sampleReturn?: SampleReturn;
  // Bagian E - Pernyataan
  dataAccuracyConfirmed?: boolean;
  tatCostUnderstood?: boolean;
  // Procedure
  procedureTemplateId?: number;
  requestProcedure?: RequestProcedure;
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  labId?: number;
  labName?: string;
  avatar?: string;
  googleId?: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  iconName: string;
}

// Form data for 5-section request form
export interface TestRequestFormData {
  // Bagian A
  companyName: string;
  phoneWhatsapp: string;
  address: string;
  // Bagian B
  labId: number | null;
  testTypeId: number | null;
  tujuanPengujian: number[];
  tujuanLainnya: string;
  // Bagian C
  sampleName: string;
  sampleQuantity: number;
  samplePackaging: string;
  description: string;
  estimatedDeliveryDate: string;
  priority: Priority;
  specialNotes: string;
  // Bagian D
  deliveryMethod: DeliveryMethod | null;
  specialHandling: string[];
  sampleReturn: SampleReturn | null;
  // Bagian E
  dataAccuracyConfirmed: boolean;
  tatCostUnderstood: boolean;
}
