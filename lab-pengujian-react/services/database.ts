
import { User, UserRole, TestRequest, RequestStatus } from '../types';
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
