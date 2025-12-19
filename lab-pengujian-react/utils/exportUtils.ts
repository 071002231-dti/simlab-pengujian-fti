import * as XLSX from 'xlsx';
import { TestRequest, RequestStatus } from '../types';
import { config } from '../services/config';

// Status label mapping
const STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'Menunggu Persetujuan',
  [RequestStatus.APPROVED]: 'Disetujui',
  [RequestStatus.RECEIVED]: 'Sampel Diterima',
  [RequestStatus.IN_PROGRESS]: 'Sedang Diuji',
  [RequestStatus.COMPLETED]: 'Selesai Uji',
  [RequestStatus.DELIVERED]: 'Hasil Terkirim',
};

/**
 * Export data pengujian ke file Excel
 */
export const exportToExcel = (requests: TestRequest[], filename?: string) => {
  // Prepare data for Excel
  const excelData = requests.map((req, index) => ({
    'No': index + 1,
    'No. Request': req.id,
    'Nama Customer': req.customerName,
    'Laboratorium': req.labName,
    'Jenis Pengujian': req.testType,
    'Nama Sampel': req.sampleName || '-',
    'Tanggal Masuk': req.dateSubmitted,
    'Status': STATUS_LABELS[req.status] || req.status,
    'Berlaku Hingga': req.expiryDate || '-',
    'Deskripsi': req.description || '-',
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },   // No
    { wch: 20 },  // No. Request
    { wch: 25 },  // Nama Customer
    { wch: 20 },  // Laboratorium
    { wch: 25 },  // Jenis Pengujian
    { wch: 20 },  // Nama Sampel
    { wch: 15 },  // Tanggal Masuk
    { wch: 20 },  // Status
    { wch: 15 },  // Berlaku Hingga
    { wch: 40 },  // Deskripsi
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pengujian');

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const outputFilename = filename || `Data_Pengujian_${date}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, outputFilename);

  return outputFilename;
};

/**
 * Export data pengujian ke file PDF (via backend API)
 */
export const exportToPdf = async (requests: TestRequest[], filename?: string): Promise<string> => {
  const token = localStorage.getItem('auth_token');
  const requestIds = requests.map(r => r.id);

  const response = await fetch(`${config.API_BASE_URL}/reports/export-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/pdf',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ request_ids: requestIds }),
  });

  if (!response.ok) {
    throw new Error('Gagal mengunduh PDF');
  }

  // Get blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  const date = new Date().toISOString().split('T')[0];
  const outputFilename = filename || `Laporan_Pengujian_${date}.pdf`;

  link.href = url;
  link.download = outputFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return outputFilename;
};

/**
 * Download PDF Laporan Hasil Uji untuk single request
 */
export const downloadReportPdf = async (requestId: string): Promise<string> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${config.API_BASE_URL}/requests/${requestId}/report-pdf`, {
    method: 'GET',
    headers: {
      'Accept': 'application/pdf',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Gagal mengunduh laporan PDF');
  }

  // Get blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  const outputFilename = `Laporan_Hasil_Uji_${requestId}.pdf`;

  link.href = url;
  link.download = outputFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return outputFilename;
};
