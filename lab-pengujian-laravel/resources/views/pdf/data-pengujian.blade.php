<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Pengujian</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
        }
        .container {
            padding: 15px 20px;
        }
        /* Header */
        .header {
            text-align: center;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header h1 {
            font-size: 14px;
            color: #1e3a5f;
            margin-bottom: 3px;
        }
        .header h2 {
            font-size: 12px;
            color: #1e3a5f;
            font-weight: normal;
        }
        .header p {
            font-size: 9px;
            color: #666;
        }
        /* Meta Info */
        .meta-info {
            margin-bottom: 15px;
            font-size: 9px;
        }
        .meta-info table {
            width: 100%;
        }
        .meta-info td {
            padding: 3px 0;
        }
        /* Data Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .data-table th, .data-table td {
            padding: 8px 5px;
            border: 1px solid #ddd;
            text-align: left;
            font-size: 9px;
        }
        .data-table th {
            background: #1e3a5f;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
        }
        .data-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .data-table td.center {
            text-align: center;
        }
        /* Status Badges */
        .status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #dbeafe; color: #1e40af; }
        .status-received { background: #e0e7ff; color: #3730a3; }
        .status-in_progress { background: #fae8ff; color: #86198f; }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-delivered { background: #ccfbf1; color: #115e59; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        /* Footer */
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 9px;
            color: #666;
        }
        .summary {
            background: #f8f9fa;
            padding: 10px;
            margin-bottom: 15px;
            border-left: 3px solid #1e3a5f;
        }
        .summary-item {
            display: inline-block;
            margin-right: 20px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>UNIVERSITAS ISLAM INDONESIA</h1>
            <h2>FAKULTAS TEKNOLOGI INDUSTRI</h2>
            <h2>SISTEM INFORMASI LABORATORIUM (SimLab)</h2>
            <p>Jl. Kaliurang Km 14,5 Sleman, Yogyakarta 55584</p>
        </div>

        <h2 style="text-align: center; font-size: 12px; margin-bottom: 15px; color: #1e3a5f;">
            REKAPITULASI DATA PENGUJIAN
        </h2>

        <!-- Meta Info -->
        <div class="meta-info">
            <table>
                <tr>
                    <td style="width: 70%;">
                        <strong>Dicetak oleh:</strong> {{ $user->name ?? 'Administrator' }}<br>
                        <strong>Role:</strong> {{ ucfirst($user->role ?? 'admin') }}
                    </td>
                    <td style="width: 30%; text-align: right;">
                        <strong>Tanggal Cetak:</strong> {{ $generatedAt }}<br>
                        <strong>Total Data:</strong> {{ $requests->count() }} permintaan
                    </td>
                </tr>
            </table>
        </div>

        <!-- Summary -->
        <div class="summary">
            <strong>Ringkasan Status:</strong><br>
            @php
                $statusCounts = $requests->groupBy('status')->map->count();
            @endphp
            <span class="summary-item">Pending: {{ $statusCounts['pending'] ?? 0 }}</span>
            <span class="summary-item">Disetujui: {{ $statusCounts['approved'] ?? 0 }}</span>
            <span class="summary-item">Diterima: {{ $statusCounts['received'] ?? 0 }}</span>
            <span class="summary-item">Proses: {{ $statusCounts['in_progress'] ?? 0 }}</span>
            <span class="summary-item">Selesai: {{ $statusCounts['completed'] ?? 0 }}</span>
            <span class="summary-item">Terkirim: {{ $statusCounts['delivered'] ?? 0 }}</span>
        </div>

        <!-- Data Table -->
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 4%;">No</th>
                    <th style="width: 14%;">No. Request</th>
                    <th style="width: 18%;">Customer</th>
                    <th style="width: 12%;">Lab</th>
                    <th style="width: 18%;">Jenis Pengujian</th>
                    <th style="width: 12%;">Nama Sampel</th>
                    <th style="width: 10%;">Tanggal</th>
                    <th style="width: 12%;">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($requests as $index => $req)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td style="font-family: monospace;">{{ $req->id }}</td>
                    <td>{{ Str::limit($req->customer_name, 25) }}</td>
                    <td>{{ Str::limit($req->lab_name, 15) }}</td>
                    <td>{{ Str::limit($req->test_type, 25) }}</td>
                    <td>{{ Str::limit($req->sample_name ?? '-', 15) }}</td>
                    <td class="center">{{ $req->date_submitted->format('d/m/Y') }}</td>
                    <td class="center">
                        @php
                            $statusLabels = [
                                'pending' => 'Pending',
                                'approved' => 'Disetujui',
                                'received' => 'Diterima',
                                'in_progress' => 'Proses',
                                'completed' => 'Selesai',
                                'delivered' => 'Terkirim',
                                'rejected' => 'Ditolak',
                            ];
                        @endphp
                        <span class="status status-{{ $req->status }}">
                            {{ $statusLabels[$req->status] ?? $req->status }}
                        </span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 60%;">
                        <em>Dokumen ini digenerate secara otomatis oleh sistem SimLab FTI UII.</em><br>
                        <em>Untuk keperluan verifikasi, silakan hubungi administrator.</em>
                    </td>
                    <td style="width: 40%; text-align: right;">
                        Yogyakarta, {{ now()->format('d F Y') }}<br><br><br>
                        <strong>{{ $user->name ?? 'Administrator' }}</strong><br>
                        <em>{{ ucfirst($user->role ?? 'Admin') }} SimLab</em>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
