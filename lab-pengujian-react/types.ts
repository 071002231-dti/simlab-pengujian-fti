
export enum UserRole {
  ADMIN = 'admin',
  LABORAN = 'laboran', // Digabung dari Petugas & Analis
  CUSTOMER = 'customer',
}

export enum RequestStatus {
  PENDING = 'Menunggu Persetujuan',
  APPROVED = 'Disetujui Admin', // Status Baru
  RECEIVED = 'Sampel Diterima',
  IN_PROGRESS = 'Sedang Diuji',
  COMPLETED = 'Selesai',
  DELIVERED = 'Hasil Dikirim',
}

export interface Lab {
  id: number;
  name: string;
  code: string;
  description: string;
  services: string[]; // Added services list
  iconName: string;
}

export interface TestRequest {
  id: string;
  userId: number; // Menambahkan User ID pemilik request
  customerName: string;
  labId: number;
  labName: string;
  testType: string;
  dateSubmitted: string;
  status: RequestStatus;
  expiryDate?: string;
  description?: string; // Deskripsi tambahan untuk detail
  sampleName?: string; // Nama sampel untuk detail
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email: string;
  labId?: number; // Menambahkan Lab ID untuk staff
  avatar?: string; // Untuk foto profil Google
  googleId?: string; // ID dari Google Auth
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  iconName: string;
}
