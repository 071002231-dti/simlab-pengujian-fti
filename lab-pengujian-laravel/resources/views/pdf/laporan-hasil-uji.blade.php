<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Hasil Uji - {{ $request->id }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            line-height: 1.5;
            color: #333;
        }
        .container {
            padding: 20px 40px;
        }
        /* Header */
        .header {
            text-align: center;
            border-bottom: 3px double #1e3a5f;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header-logo {
            margin-bottom: 10px;
        }
        .header h1 {
            font-size: 16px;
            color: #1e3a5f;
            margin-bottom: 5px;
        }
        .header h2 {
            font-size: 14px;
            color: #1e3a5f;
            font-weight: normal;
        }
        .header p {
            font-size: 10px;
            color: #666;
        }
        /* Report Number */
        .report-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
        }
        .report-number {
            font-weight: bold;
            font-size: 12px;
        }
        /* Info Table */
        .info-section {
            margin-bottom: 20px;
        }
        .info-section h3 {
            font-size: 12px;
            color: #1e3a5f;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 8px;
            border: 1px solid #ddd;
            vertical-align: top;
        }
        .info-table td:first-child {
            width: 30%;
            background: #f8f9fa;
            font-weight: bold;
        }
        /* Result Section */
        .result-section {
            margin-bottom: 20px;
        }
        .result-section h3 {
            font-size: 12px;
            color: #1e3a5f;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .result-table {
            width: 100%;
            border-collapse: collapse;
        }
        .result-table th, .result-table td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        .result-table th {
            background: #1e3a5f;
            color: white;
            font-weight: bold;
        }
        .result-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }
        .status-completed {
            background: #d1fae5;
            color: #065f46;
        }
        .status-delivered {
            background: #dbeafe;
            color: #1e40af;
        }
        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        .signature-section {
            display: table;
            width: 100%;
            margin-top: 30px;
        }
        .signature-box {
            display: table-cell;
            width: 33%;
            text-align: center;
            padding: 10px;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 60px;
            padding-top: 5px;
        }
        .note {
            font-size: 9px;
            color: #666;
            margin-top: 20px;
            padding: 10px;
            background: #f8f9fa;
            border-left: 3px solid #1e3a5f;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0, 0, 0, 0.05);
            font-weight: bold;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="watermark">FTI UII</div>

    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>UNIVERSITAS ISLAM INDONESIA</h1>
            <h2>FAKULTAS TEKNOLOGI INDUSTRI</h2>
            <h2>{{ strtoupper($lab->name ?? 'LABORATORIUM PENGUJIAN') }}</h2>
            <p>Jl. Kaliurang Km 14,5 Sleman, Yogyakarta 55584 | Telp: (0274) 895287</p>
        </div>

        <!-- Report Meta -->
        <table style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td style="text-align: left;">
                    <strong>No. Laporan:</strong> {{ $reportNumber }}
                </td>
                <td style="text-align: right;">
                    <strong>Tanggal Cetak:</strong> {{ $generatedAt }}
                </td>
            </tr>
        </table>

        <h2 style="text-align: center; font-size: 14px; margin-bottom: 20px; color: #1e3a5f;">
            LAPORAN HASIL UJI
        </h2>

        <!-- Customer Info -->
        <div class="info-section">
            <h3>A. INFORMASI PEMOHON</h3>
            <table class="info-table">
                <tr>
                    <td>Nama Pemohon</td>
                    <td>{{ $request->customer_name }}</td>
                </tr>
                <tr>
                    <td>Perusahaan/Instansi</td>
                    <td>{{ $request->company_name ?? $request->customer_name }}</td>
                </tr>
                <tr>
                    <td>No. Telepon/WhatsApp</td>
                    <td>{{ $request->phone_whatsapp ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Alamat</td>
                    <td>{{ $request->address ?? '-' }}</td>
                </tr>
            </table>
        </div>

        <!-- Sample Info -->
        <div class="info-section">
            <h3>B. INFORMASI SAMPEL</h3>
            <table class="info-table">
                <tr>
                    <td>No. Permohonan</td>
                    <td>{{ $request->id }}</td>
                </tr>
                <tr>
                    <td>Tanggal Diterima</td>
                    <td>{{ $request->date_submitted->format('d F Y') }}</td>
                </tr>
                <tr>
                    <td>Nama Sampel</td>
                    <td>{{ $request->sample_name ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Jenis Pengujian</td>
                    <td>{{ $request->test_type }}</td>
                </tr>
                <tr>
                    <td>Laboratorium</td>
                    <td>{{ $request->lab_name }}</td>
                </tr>
                <tr>
                    <td>Deskripsi/Catatan</td>
                    <td>{{ $request->description ?? '-' }}</td>
                </tr>
            </table>
        </div>

        <!-- Test Results -->
        <div class="result-section">
            <h3>C. HASIL PENGUJIAN</h3>
            <table class="result-table">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 30%">Parameter Uji</th>
                        <th style="width: 20%">Metode Uji</th>
                        <th style="width: 20%">Hasil</th>
                        <th style="width: 15%">Satuan</th>
                        <th style="width: 10%">Ket</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: center;">1</td>
                        <td>{{ $request->test_type }}</td>
                        <td>SNI/ISO</td>
                        <td style="text-align: center;">-</td>
                        <td style="text-align: center;">-</td>
                        <td style="text-align: center;">
                            <span class="status-badge status-completed">LULUS</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p style="font-size: 9px; color: #666; margin-top: 10px;">
                * Hasil pengujian ini hanya berlaku untuk sampel yang diuji
            </p>
        </div>

        <!-- Conclusion -->
        <div class="info-section">
            <h3>D. KESIMPULAN</h3>
            <div style="padding: 15px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 5px;">
                <p>Berdasarkan hasil pengujian yang telah dilakukan, sampel <strong>{{ $request->sample_name ?? 'yang diuji' }}</strong>
                dinyatakan <strong style="color: #166534;">MEMENUHI</strong> standar yang berlaku.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="signature-section">
                <div class="signature-box">
                    <p>Diuji oleh,</p>
                    <div class="signature-line">
                        <p><strong>Laboran</strong></p>
                        <p>NIP. -</p>
                    </div>
                </div>
                <div class="signature-box">
                    <p>Diperiksa oleh,</p>
                    <div class="signature-line">
                        <p><strong>Kepala Laboratorium</strong></p>
                        <p>NIP. -</p>
                    </div>
                </div>
                <div class="signature-box">
                    <p>Yogyakarta, {{ now()->format('d F Y') }}</p>
                    <p>Disetujui oleh,</p>
                    <div class="signature-line">
                        <p><strong>Dekan FTI UII</strong></p>
                        <p>NIP. -</p>
                    </div>
                </div>
            </div>

            <div class="note">
                <strong>Catatan:</strong><br>
                1. Laporan ini sah tanpa tanda tangan basah dan cap asli.<br>
                2. Hasil uji ini hanya berlaku untuk sampel yang diuji dan tidak dapat digandakan tanpa izin.<br>
                3. Berlaku hingga: {{ $request->expiry_date ? $request->expiry_date->format('d F Y') : '-' }}<br>
                4. Untuk verifikasi keaslian dokumen, silakan hubungi laboratorium terkait.
            </div>
        </div>
    </div>
</body>
</html>
