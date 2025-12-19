<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TestRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Generate PDF Laporan Hasil Uji untuk single request
     */
    public function generateReportPdf(Request $request, string $id)
    {
        $user = $request->user();
        $testRequest = TestRequest::with(['user', 'lab'])->findOrFail($id);

        // Authorization check
        if ($user->isCustomer() && $testRequest->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($user->isLaboran() && $testRequest->lab_id !== $user->lab_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Only allow PDF for completed or delivered requests
        if (!in_array($testRequest->status, [TestRequest::STATUS_COMPLETED, TestRequest::STATUS_DELIVERED])) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan hanya tersedia untuk pengujian yang sudah selesai',
            ], 400);
        }

        $data = [
            'request' => $testRequest,
            'lab' => $testRequest->lab,
            'generatedAt' => now()->format('d F Y H:i'),
            'reportNumber' => 'LHU/' . $testRequest->lab->code . '/' . date('Y') . '/' . str_pad($testRequest->id, 4, '0', STR_PAD_LEFT),
        ];

        $pdf = Pdf::loadView('pdf.laporan-hasil-uji', $data);
        $pdf->setPaper('A4', 'portrait');

        $filename = "Laporan_Hasil_Uji_{$testRequest->id}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Export multiple requests to PDF
     */
    public function exportPdf(Request $request)
    {
        $validated = $request->validate([
            'request_ids' => 'required|array',
            'request_ids.*' => 'string',
        ]);

        $user = $request->user();
        $query = TestRequest::with(['user', 'lab'])->whereIn('id', $validated['request_ids']);

        // Filter by role
        if ($user->isCustomer()) {
            $query->where('user_id', $user->id);
        } elseif ($user->isLaboran()) {
            $query->where('lab_id', $user->lab_id);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        if ($requests->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data yang dapat diekspor',
            ], 404);
        }

        $data = [
            'requests' => $requests,
            'generatedAt' => now()->format('d F Y H:i'),
            'user' => $user,
        ];

        $pdf = Pdf::loadView('pdf.data-pengujian', $data);
        $pdf->setPaper('A4', 'landscape');

        $filename = 'Laporan_Pengujian_' . date('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }
}
