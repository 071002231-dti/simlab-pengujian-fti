
import {
  User,
  UserRole,
  TestRequest,
  RequestStatus,
  Lab,
  TestType,
  TujuanPengujian,
  ProcedureTemplate,
  RequestProcedure,
  TestRequestFormData,
  Priority,
  DeliveryMethod,
  SampleReturn,
} from '../types';
import { MOCK_REQUESTS as INITIAL_MOCK_REQUESTS } from '../constants';
import { config } from './config';

// KONFIGURASI KONEKSI BACKEND
// Dikonfigurasi melalui environment variables atau runtime injection (Docker)
// Set VITE_USE_MOCK_DATA=false dan VITE_API_BASE_URL untuk production
const USE_MOCK_DATA = config.USE_MOCK_DATA;
const API_BASE_URL = config.API_BASE_URL;

// --- IN-MEMORY STORAGE (Untuk simulasi penambahan data tanpa backend) ---
// Kita copy data dari constants agar bisa dimodifikasi (mutable) selama sesi berjalan
let currentRequests: TestRequest[] = [...INITIAL_MOCK_REQUESTS];

const SEED_USERS: any[] = [
  // --- ADMIN ---
  {
    id: 1,
    name: 'Administrator FTI',
    email: 'admin@uii.ac.id',
    password: 'admin', 
    role: UserRole.ADMIN,
    labId: null
  },
  // --- LAB TEKSTIL (ID: 1) ---
  {
    id: 11,
    name: 'Laboran Tekstil', // Digabung
    email: 'laboran.tekstil@uii.ac.id',
    password: '123',
    role: UserRole.LABORAN,
    labId: 1
  },
  // --- LAB KIMIA (ID: 2) ---
  {
    id: 21,
    name: 'Laboran Kimia', // Digabung
    email: 'laboran.kimia@uii.ac.id',
    password: '123',
    role: UserRole.LABORAN,
    labId: 2
  },
  // --- LAB FORENSIK (ID: 3) ---
  {
    id: 31,
    name: 'Laboran Forensik', // Digabung
    email: 'laboran.forensik@uii.ac.id',
    password: '123',
    role: UserRole.LABORAN,
    labId: 3
  },
  // --- CUSTOMER SEED (Untuk keperluan demo lookup email) ---
  {
    id: 101,
    name: 'PT. Tekstil Maju Jaya',
    email: 'contact@maju-jaya.com',
    role: UserRole.CUSTOMER
  },
  {
    id: 102,
    name: 'Dinas Lingkungan Hidup',
    email: 'admin@dlh.gov.id',
    role: UserRole.CUSTOMER
  },
  {
    id: 103,
    name: 'Kepolisian Daerah DIY',
    email: 'cybercrime@poldadiy.go.id',
    role: UserRole.CUSTOMER
  },
  {
    id: 104,
    name: 'CV. Solusi IT',
    email: 'support@solusiit.com',
    role: UserRole.CUSTOMER
  }
];

// --- API CLIENT HELPER ---
async function apiCall(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal terhubung ke server');
  }
}

// --- SERVICE METHODS ---
export const AuthService = {
  // Login Internal (Staff/Admin)
  loginInternal: async (email: string, password: string): Promise<User> => {
    if (USE_MOCK_DATA) {
      // MOCK MODE
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = SEED_USERS.find(u => u.email === email && u.password === password);
          if (user) {
            const { password, ...userData } = user;
            resolve(userData as User);
          } else {
            reject(new Error('Email atau password salah (Mock).'));
          }
        }, 800);
      });
    } else {
      // REAL API MODE (LARAVEL)
      const response = await apiCall('/login', 'POST', { email, password });
      // Simpan token di localStorage
      localStorage.setItem('auth_token', response.token);
      // Map response to User type
      return {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        labId: response.user.lab_id,
        labName: response.user.lab_name,
        avatar: response.user.avatar,
      } as User;
    }
  },

  // Login Google (Customer)
  loginGoogle: async (): Promise<User> => {
    if (USE_MOCK_DATA) {
      // MOCK MODE
      return new Promise((resolve) => {
        setTimeout(() => {
          const googleUser: User = {
            id: 999, // Fixed ID untuk Demo Customer agar cocok dengan constants.ts
            name: 'Budi Santoso',
            email: 'budi.santoso@gmail.com',
            role: UserRole.CUSTOMER,
            avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
            googleId: 'google-123456789'
          };
          resolve(googleUser);
        }, 1500);
      });
    } else {
      throw new Error("Google Auth via API belum dikonfigurasi.");
    }
  },

  // Helper untuk mendapatkan Email Customer (Simulasi Database Lookup)
  getCustomerEmail: (userId: number): string => {
    // Cek di SEED_USERS
    const user = SEED_USERS.find(u => u.id === userId);
    if (user) return user.email;
    
    // Cek jika user demo (Budi)
    if (userId === 999) return 'budi.santoso@gmail.com';

    return 'customer@email.com'; // Default fallback
  }
};

export const DataService = {
  // Mengambil Data Request
  getRequests: async (token?: string): Promise<TestRequest[]> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        // Return variabel in-memory yang terbaru
        setTimeout(() => resolve([...currentRequests]), 500);
      });
    } else {
      const authToken = token || localStorage.getItem('auth_token') || '';
      const response = await apiCall('/requests', 'GET', null, authToken);
      // Map response to TestRequest type (snake_case to camelCase)
      return response.data.map((req: any) => ({
        id: req.id,
        userId: req.user_id,
        customerName: req.customer_name,
        labId: req.lab_id,
        labName: req.lab_name,
        testType: req.test_type,
        dateSubmitted: req.date_submitted,
        status: req.status as RequestStatus,
        sampleName: req.sample_name,
        description: req.description,
        expiryDate: req.expiry_date,
      }));
    }
  },

  // Menambah Request Baru
  addRequest: async (newRequest: TestRequest, token?: string): Promise<TestRequest> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Tambahkan ke array in-memory (unshift agar paling atas)
          currentRequests.unshift(newRequest);
          resolve(newRequest);
        }, 800);
      });
    } else {
      const authToken = token || localStorage.getItem('auth_token') || '';
      // Convert camelCase to snake_case for API
      const payload = {
        lab_id: newRequest.labId,
        lab_name: newRequest.labName,
        test_type: newRequest.testType,
        sample_name: newRequest.sampleName,
        description: newRequest.description,
        expiry_date: newRequest.expiryDate,
      };
      const response = await apiCall('/requests', 'POST', payload, authToken);
      // Map response back to TestRequest type
      return {
        id: response.data.id,
        userId: response.data.user_id,
        customerName: response.data.customer_name,
        labId: response.data.lab_id,
        labName: response.data.lab_name,
        testType: response.data.test_type,
        dateSubmitted: response.data.date_submitted,
        status: response.data.status as RequestStatus,
        sampleName: response.data.sample_name,
        description: response.data.description,
        expiryDate: response.data.expiry_date,
      };
    }
  },

  // Update Status Request
  updateRequestStatus: async (id: string, newStatus: RequestStatus, token?: string): Promise<TestRequest> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = currentRequests.findIndex(r => r.id === id);
          if (index !== -1) {
            currentRequests[index] = { ...currentRequests[index], status: newStatus };
            resolve(currentRequests[index]);
          } else {
            reject(new Error("Request tidak ditemukan"));
          }
        }, 600);
      });
    } else {
      const authToken = token || localStorage.getItem('auth_token') || '';
      const response = await apiCall(`/requests/${id}/status`, 'PUT', { status: newStatus }, authToken);
      return {
        id: response.data.id,
        status: response.data.status as RequestStatus,
      } as TestRequest;
    }
  }
};

export const getDemoAccounts = () => SEED_USERS;

// --- LAB SERVICE ---
export const LabService = {
  getLabs: async (): Promise<Lab[]> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: 1, name: 'Lab Tekstil', code: 'TXT', description: 'Pengujian tekstil dan bahan', services: ['Pengujian Benang', 'Pengujian Kain'], iconName: 'Shirt' },
            { id: 2, name: 'Lab Kimia', code: 'KIM', description: 'Pengujian kimia dan lingkungan', services: ['Kadar Air', 'Kadar Abu'], iconName: 'FlaskConical' },
            { id: 3, name: 'Lab Forensik Digital', code: 'FRN', description: 'Forensik digital dan cybersecurity', services: ['Forensik HP', 'Forensik Komputer'], iconName: 'Fingerprint' },
          ]);
        }, 300);
      });
    } else {
      const response = await apiCall('/labs', 'GET');
      return response.data.map((lab: any) => ({
        id: lab.id,
        name: lab.name,
        code: lab.code,
        description: lab.description,
        services: lab.services || [],
        iconName: lab.icon_name || 'Building',
      }));
    }
  },

  getLabById: async (id: number): Promise<Lab | null> => {
    if (USE_MOCK_DATA) {
      const labs = await LabService.getLabs();
      return labs.find(l => l.id === id) || null;
    } else {
      const response = await apiCall(`/labs/${id}`, 'GET');
      return {
        id: response.data.id,
        name: response.data.name,
        code: response.data.code,
        description: response.data.description,
        services: response.data.services || [],
        iconName: response.data.icon_name || 'Building',
      };
    }
  },
};

// --- TEST TYPE SERVICE ---
export const TestTypeService = {
  getAll: async (): Promise<TestType[]> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: 1, labId: 1, labName: 'Lab Tekstil', name: 'Pengujian Nomor Benang', code: 'PNB' },
            { id: 2, labId: 1, labName: 'Lab Tekstil', name: 'Pengujian Jenis Anyaman', code: 'PJA' },
            { id: 3, labId: 2, labName: 'Lab Kimia', name: 'Pengujian Kadar Air', code: 'PKA' },
            { id: 4, labId: 2, labName: 'Lab Kimia', name: 'Pengujian Kadar Abu', code: 'PKB' },
            { id: 5, labId: 3, labName: 'Lab Forensik Digital', name: 'Pemeriksaan Handphone', code: 'FHP' },
            { id: 6, labId: 3, labName: 'Lab Forensik Digital', name: 'Pemeriksaan Komputer', code: 'FKM' },
          ]);
        }, 300);
      });
    } else {
      const response = await apiCall('/test-types', 'GET');
      return response.data.map((t: any) => ({
        id: t.id,
        labId: t.lab_id,
        labName: t.lab_name,
        name: t.name,
        code: t.code,
        description: t.description,
      }));
    }
  },

  getByLab: async (labId: number): Promise<TestType[]> => {
    if (USE_MOCK_DATA) {
      const all = await TestTypeService.getAll();
      return all.filter(t => t.labId === labId);
    } else {
      const response = await apiCall(`/labs/${labId}/test-types`, 'GET');
      return response.data.map((t: any) => ({
        id: t.id,
        labId: labId,
        name: t.name,
        code: t.code,
        description: t.description,
      }));
    }
  },
};

// --- TUJUAN PENGUJIAN SERVICE ---
export const TujuanPengujianService = {
  getAll: async (): Promise<TujuanPengujian[]> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: 1, name: 'Kesesuaian SNI/ISO', code: 'SNI_ISO', requiresInput: false },
            { id: 2, name: 'Internal QA/QC', code: 'QA_QC', requiresInput: false },
            { id: 3, name: 'Sertifikasi/Perizinan', code: 'SERTIFIKASI', requiresInput: false },
            { id: 4, name: 'Penelitian', code: 'PENELITIAN', requiresInput: false },
            { id: 5, name: 'Lainnya', code: 'LAINNYA', requiresInput: true },
          ]);
        }, 200);
      });
    } else {
      const response = await apiCall('/tujuan-pengujian', 'GET');
      return response.data.map((t: any) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        requiresInput: t.requires_input,
      }));
    }
  },
};

// --- PROCEDURE TEMPLATE SERVICE ---
export const ProcedureTemplateService = {
  getAll: async (filters?: { labId?: number; testTypeId?: number; status?: string }, token?: string): Promise<{ data: ProcedureTemplate[]; meta: any }> => {
    const authToken = token || localStorage.getItem('auth_token') || '';

    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                id: 1,
                testTypeId: 3,
                testTypeName: 'Pengujian Kadar Air',
                labName: 'Lab Kimia',
                version: '1.0',
                name: 'SOP Pengujian Kadar Air',
                referenceStandard: 'SNI ISO 712:2015',
                estimatedTatDays: 5,
                status: 'active',
                stepsCount: 3,
              },
            ],
            meta: { current_page: 1, total: 1, per_page: 10 },
          });
        }, 500);
      });
    } else {
      let endpoint = '/procedure-templates?';
      if (filters?.labId) endpoint += `lab_id=${filters.labId}&`;
      if (filters?.testTypeId) endpoint += `test_type_id=${filters.testTypeId}&`;
      if (filters?.status) endpoint += `status=${filters.status}&`;

      const response = await apiCall(endpoint, 'GET', null, authToken);
      return {
        data: response.data.map((t: any) => ({
          id: t.id,
          testTypeId: t.test_type_id,
          testTypeName: t.test_type_name,
          labName: t.lab_name,
          version: t.version,
          name: t.name,
          referenceStandard: t.reference_standard,
          estimatedTatDays: t.estimated_tat_days,
          status: t.status,
          stepsCount: t.steps_count,
          createdBy: t.created_by,
          createdAt: t.created_at,
        })),
        meta: response.meta,
      };
    }
  },

  getById: async (id: number, token?: string): Promise<ProcedureTemplate> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    const response = await apiCall(`/procedure-templates/${id}`, 'GET', null, authToken);
    return {
      id: response.data.id,
      testTypeId: response.data.test_type.id,
      testTypeName: response.data.test_type.name,
      labName: response.data.test_type.lab.name,
      version: response.data.version,
      name: response.data.name,
      description: response.data.description,
      referenceStandard: response.data.reference_standard,
      estimatedTatDays: response.data.estimated_tat_days,
      status: response.data.status,
      steps: response.data.steps.map((s: any) => ({
        id: s.id,
        stepOrder: s.step_order,
        name: s.name,
        description: s.description,
        equipment: s.equipment,
        materials: s.materials,
        parameters: s.parameters,
        passFailCriteria: s.pass_fail_criteria,
        estimatedDurationMinutes: s.estimated_duration_minutes,
        responsibleRole: s.responsible_role,
        requiresApproval: s.requires_approval,
      })),
      totalEstimatedMinutes: response.data.total_estimated_minutes,
      createdBy: response.data.created_by,
      approvedBy: response.data.approved_by,
      approvedAt: response.data.approved_at,
      createdAt: response.data.created_at,
    };
  },

  create: async (data: Partial<ProcedureTemplate>, token?: string): Promise<{ id: number; version: string; status: string }> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    const payload = {
      test_type_id: data.testTypeId,
      version: data.version,
      name: data.name,
      description: data.description,
      reference_standard: data.referenceStandard,
      estimated_tat_days: data.estimatedTatDays,
      steps: data.steps?.map((s) => ({
        step_order: s.stepOrder,
        name: s.name,
        description: s.description,
        equipment: s.equipment,
        materials: s.materials,
        parameters: s.parameters,
        pass_fail_criteria: s.passFailCriteria,
        estimated_duration_minutes: s.estimatedDurationMinutes,
        responsible_role: s.responsibleRole,
        requires_approval: s.requiresApproval,
      })),
    };
    const response = await apiCall('/procedure-templates', 'POST', payload, authToken);
    return response.data;
  },

  update: async (id: number, data: Partial<ProcedureTemplate>, token?: string): Promise<void> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.description) payload.description = data.description;
    if (data.referenceStandard) payload.reference_standard = data.referenceStandard;
    if (data.estimatedTatDays) payload.estimated_tat_days = data.estimatedTatDays;
    if (data.steps) {
      payload.steps = data.steps.map((s) => ({
        step_order: s.stepOrder,
        name: s.name,
        description: s.description,
        equipment: s.equipment,
        materials: s.materials,
        parameters: s.parameters,
        pass_fail_criteria: s.passFailCriteria,
        estimated_duration_minutes: s.estimatedDurationMinutes,
        responsible_role: s.responsibleRole,
        requires_approval: s.requiresApproval,
      }));
    }
    await apiCall(`/procedure-templates/${id}`, 'PUT', payload, authToken);
  },

  activate: async (id: number, token?: string): Promise<void> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    await apiCall(`/procedure-templates/${id}/activate`, 'PUT', null, authToken);
  },

  duplicate: async (id: number, newVersion: string, token?: string): Promise<{ id: number; version: string }> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    const response = await apiCall(`/procedure-templates/${id}/duplicate`, 'POST', { version: newVersion }, authToken);
    return response.data;
  },
};

// --- REQUEST PROCEDURE SERVICE ---
export const RequestProcedureService = {
  getByRequestId: async (requestId: string, token?: string): Promise<{ requestId: string; procedure: RequestProcedure; steps: any[]; approvals: any[] } | null> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    try {
      const response = await apiCall(`/requests/${requestId}/procedure`, 'GET', null, authToken);
      return {
        requestId: response.data.request_id,
        procedure: {
          id: response.data.procedure.id,
          templateName: response.data.procedure.template_name,
          templateVersion: response.data.procedure.template_version,
          status: response.data.procedure.status,
          assignedAnalyst: response.data.procedure.assigned_analyst,
          startedAt: response.data.procedure.started_at,
          completedAt: response.data.procedure.completed_at,
          progressPercentage: response.data.procedure.progress_percentage,
          currentStep: response.data.procedure.current_step,
          steps: [],
          approvals: [],
        },
        steps: response.data.steps.map((s: any) => ({
          id: s.id,
          stepOrder: s.step_order,
          name: s.name,
          description: s.description,
          equipment: s.equipment,
          parameters: s.parameters,
          passFailCriteria: s.pass_fail_criteria,
          requiresApproval: s.requires_approval,
          status: s.status,
          results: s.results,
          attachments: s.attachments,
          notes: s.notes,
          passFailStatus: s.pass_fail_status,
          executedBy: s.executed_by,
          startedAt: s.started_at,
          completedAt: s.completed_at,
        })),
        approvals: response.data.approvals.map((a: any) => ({
          id: a.id,
          type: a.type,
          status: a.status,
          requestedBy: a.requested_by,
          approvedBy: a.approved_by,
          approvedAt: a.approved_at,
          notes: a.notes,
        })),
      };
    } catch {
      return null;
    }
  },

  updateStep: async (
    requestId: string,
    stepId: number,
    data: { status?: string; results?: Record<string, any>; notes?: string; passFailStatus?: string },
    token?: string
  ): Promise<void> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    const payload: any = {};
    if (data.status) payload.status = data.status;
    if (data.results) payload.results = data.results;
    if (data.notes) payload.notes = data.notes;
    if (data.passFailStatus) payload.pass_fail_status = data.passFailStatus;
    await apiCall(`/requests/${requestId}/procedure/steps/${stepId}`, 'PUT', payload, authToken);
  },

  requestApproval: async (
    requestId: string,
    data: { approvalType: string; stepId?: number; notes?: string },
    token?: string
  ): Promise<{ id: number; approvalType: string; status: string }> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    const payload = {
      approval_type: data.approvalType,
      step_id: data.stepId,
      notes: data.notes,
    };
    const response = await apiCall(`/requests/${requestId}/procedure/approvals`, 'POST', payload, authToken);
    return response.data;
  },

  processApproval: async (
    requestId: string,
    approvalId: number,
    data: { status: 'approved' | 'rejected'; notes?: string },
    token?: string
  ): Promise<void> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    await apiCall(`/requests/${requestId}/procedure/approvals/${approvalId}`, 'PUT', data, authToken);
  },

  assignAnalyst: async (requestId: string, analystId: number, token?: string): Promise<void> => {
    const authToken = token || localStorage.getItem('auth_token') || '';
    await apiCall(`/requests/${requestId}/procedure/assign-analyst`, 'PUT', { analyst_id: analystId }, authToken);
  },
};

// --- ENHANCED TEST REQUEST SERVICE ---
export const EnhancedRequestService = {
  create: async (formData: TestRequestFormData, token?: string): Promise<TestRequest> => {
    const authToken = token || localStorage.getItem('auth_token') || '';

    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newRequest: TestRequest = {
            id: `REQ-${Date.now()}`,
            userId: 999,
            customerName: formData.companyName,
            labId: formData.labId || 1,
            labName: 'Lab Mock',
            testType: 'Test Mock',
            dateSubmitted: new Date().toISOString().split('T')[0],
            status: RequestStatus.PENDING,
            sampleName: formData.sampleName,
            description: formData.description,
          };
          currentRequests.unshift(newRequest);
          resolve(newRequest);
        }, 800);
      });
    } else {
      const payload = {
        // Bagian A
        company_name: formData.companyName,
        phone_whatsapp: formData.phoneWhatsapp,
        address: formData.address,
        // Bagian B
        lab_id: formData.labId,
        test_type_id: formData.testTypeId,
        tujuan_pengujian: {
          selected: formData.tujuanPengujian,
          lainnya_text: formData.tujuanLainnya || null,
        },
        // Bagian C
        sample_name: formData.sampleName,
        sample_quantity: formData.sampleQuantity,
        sample_packaging: formData.samplePackaging,
        description: formData.description,
        estimated_delivery_date: formData.estimatedDeliveryDate,
        priority: formData.priority,
        special_notes: formData.specialNotes,
        // Bagian D
        delivery_method: formData.deliveryMethod,
        special_handling: formData.specialHandling,
        sample_return: formData.sampleReturn,
        // Bagian E
        data_accuracy_confirmed: formData.dataAccuracyConfirmed,
        tat_cost_understood: formData.tatCostUnderstood,
      };

      const response = await apiCall('/requests', 'POST', payload, authToken);
      return {
        id: response.data.id,
        userId: response.data.user_id,
        customerName: response.data.customer_name,
        labId: response.data.lab_id,
        labName: response.data.lab_name,
        testType: response.data.test_type,
        dateSubmitted: response.data.date_submitted,
        status: response.data.status as RequestStatus,
        sampleName: response.data.sample_name,
        description: response.data.description,
      };
    }
  },

  getById: async (id: string, token?: string): Promise<TestRequest | null> => {
    const authToken = token || localStorage.getItem('auth_token') || '';

    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const req = currentRequests.find(r => r.id === id);
          resolve(req || null);
        }, 300);
      });
    } else {
      try {
        const response = await apiCall(`/requests/${id}`, 'GET', null, authToken);
        return {
          id: response.data.id,
          userId: response.data.user_id,
          customerName: response.data.customer_name,
          labId: response.data.lab_id,
          labName: response.data.lab_name,
          testType: response.data.test_type,
          dateSubmitted: response.data.date_submitted,
          status: response.data.status as RequestStatus,
          sampleName: response.data.sample_name,
          description: response.data.description,
          expiryDate: response.data.expiry_date,
          companyName: response.data.company_name,
          phoneWhatsapp: response.data.phone_whatsapp,
          address: response.data.address,
          testTypeId: response.data.test_type_id,
          tujuanPengujian: response.data.tujuan_pengujian,
          sampleQuantity: response.data.sample_quantity,
          samplePackaging: response.data.sample_packaging,
          estimatedDeliveryDate: response.data.estimated_delivery_date,
          priority: response.data.priority as Priority,
          specialNotes: response.data.special_notes,
          deliveryMethod: response.data.delivery_method as DeliveryMethod,
          specialHandling: response.data.special_handling,
          sampleReturn: response.data.sample_return as SampleReturn,
          dataAccuracyConfirmed: response.data.data_accuracy_confirmed,
          tatCostUnderstood: response.data.tat_cost_understood,
          procedureTemplateId: response.data.procedure_template_id,
        };
      } catch {
        return null;
      }
    }
  },
};
