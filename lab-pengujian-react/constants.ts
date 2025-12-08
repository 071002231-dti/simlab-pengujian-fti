import { Lab, RequestStatus, TestRequest, StatMetric } from './types';

export const LABS: Lab[] = [
  {
    id: 1,
    name: 'Lab Manufaktur & Pengujian Tekstil',
    code: 'TEXTILE',
    description: 'Fasilitas uji material tekstil dan serat.',
    services: ['Pengujian Nomor Benang', 'Pengujian Anyaman', 'Pengujian Tetal Benang'],
    iconName: 'Scissors'
  },
  {
    id: 2,
    name: 'Lab Penelitian Teknik Kimia',
    code: 'CHEM',
    description: 'Analisis kandungan kimia dan material.',
    services: ['Pengujian Kadar Air', 'Pengujian Kadar Abu'],
    iconName: 'Beaker'
  },
  {
    id: 3,
    name: 'Lab Forensik Digital',
    code: 'DIGITAL',
    description: 'Investigasi bukti digital dan elektronik.',
    services: ['Pemeriksaan Komputer', 'Pemeriksaan Handphone'],
    iconName: 'Binary'
  }
];

// User ID 999 digunakan untuk Demo Customer (Budi Santoso)
export const MOCK_REQUESTS: TestRequest[] = [
  {
    id: 'REQ-202511-001',
    userId: 101, // User lain
    customerName: 'PT. Tekstil Maju Jaya',
    labId: 1,
    labName: 'Lab Manufaktur & Pengujian Tekstil',
    testType: 'Pengujian Nomor Benang',
    dateSubmitted: '2025-11-18',
    status: RequestStatus.IN_PROGRESS,
    sampleName: 'Benang Rayon 30s',
    description: 'Mohon diuji ketebalan dan nomor benang sesuai standar ISO.'
  },
  {
    id: 'REQ-202511-002',
    userId: 102, // User lain
    customerName: 'Dinas Lingkungan Hidup',
    labId: 2,
    labName: 'Lab Penelitian Teknik Kimia',
    testType: 'Pengujian Kadar Air',
    dateSubmitted: '2025-11-19',
    status: RequestStatus.PENDING,
    sampleName: 'Sampel Tanah Liat',
    description: 'Pengujian kandungan air untuk sampel area industri.'
  },
  {
    id: 'REQ-202511-003',
    userId: 103, // User lain
    customerName: 'Kepolisian Daerah DIY',
    labId: 3,
    labName: 'Lab Forensik Digital',
    testType: 'Pemeriksaan Handphone',
    dateSubmitted: '2025-11-17',
    status: RequestStatus.COMPLETED,
    expiryDate: '2025-12-17',
    sampleName: 'Samsung Galaxy S21 (Barang Bukti #44)',
    description: 'Ekstraksi data chat WhatsApp dan Log Panggilan.'
  },
  {
    id: 'REQ-202511-004',
    userId: 999, // MILIK CUSTOMER DEMO (Budi)
    customerName: 'Budi Santoso',
    labId: 1,
    labName: 'Lab Manufaktur & Pengujian Tekstil',
    testType: 'Pengujian Jenis Anyaman',
    dateSubmitted: '2025-11-19',
    status: RequestStatus.RECEIVED,
    sampleName: 'Kain Tenun Troso',
    description: 'Identifikasi pola anyaman untuk sertifikasi.'
  },
  {
    id: 'REQ-202511-005',
    userId: 999, // MILIK CUSTOMER DEMO (Budi)
    customerName: 'Budi Santoso',
    labId: 2,
    labName: 'Lab Penelitian Teknik Kimia',
    testType: 'Pengujian Kadar Abu',
    dateSubmitted: '2025-11-15',
    status: RequestStatus.DELIVERED,
    expiryDate: '2026-05-15',
    sampleName: 'Briket Arang Batok',
    description: 'Uji sisa pembakaran (kadar abu).'
  },
  {
    id: 'REQ-202511-006',
    userId: 104,
    customerName: 'CV. Solusi IT',
    labId: 3,
    labName: 'Lab Forensik Digital',
    testType: 'Pemeriksaan Komputer',
    dateSubmitted: '2025-11-20',
    status: RequestStatus.IN_PROGRESS,
    sampleName: 'Harddisk WD Blue 1TB',
    description: 'Recovery data partisi yang terhapus.'
  }
];

export const DASHBOARD_STATS: StatMetric[] = [
  { label: 'Total Permintaan', value: 124, trend: '+12% bulan ini', trendUp: true, iconName: 'FileText' },
  { label: 'Sedang Diuji', value: 45, trend: 'Kapasitas 80%', trendUp: true, iconName: 'Activity' },
  { label: 'Selesai Minggu Ini', value: 18, trend: '+5% dari mgu lalu', trendUp: true, iconName: 'CheckCircle' },
  { label: 'Pending Approval', value: 8, trend: 'Perlu tindakan', trendUp: false, iconName: 'AlertCircle' },
];