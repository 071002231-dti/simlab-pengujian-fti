<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TestRequest;
use Illuminate\Http\Request;

class TestRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = TestRequest::with(['user', 'lab']);

        if ($user->isCustomer()) {
            $query->where('user_id', $user->id);
        } elseif ($user->isLaboran()) {
            $query->where('lab_id', $user->lab_id);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $requests->map(function ($req) {
                return [
                    'id' => $req->id,
                    'user_id' => $req->user_id,
                    'customer_name' => $req->customer_name,
                    'lab_id' => $req->lab_id,
                    'lab_name' => $req->lab_name,
                    'test_type' => $req->test_type,
                    'date_submitted' => $req->date_submitted->format('Y-m-d'),
                    'status' => $req->status,
                    'sample_name' => $req->sample_name,
                    'description' => $req->description,
                    'expiry_date' => $req->expiry_date?->format('Y-m-d'),
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lab_id' => 'required|exists:labs,id',
            'test_type_id' => 'nullable|exists:test_types,id',
            // Enhanced form fields
            'company_name' => 'nullable|string',
            'phone_whatsapp' => 'nullable|string',
            'address' => 'nullable|string',
            'sample_name' => 'nullable|string',
            'sample_quantity' => 'nullable|integer',
            'sample_packaging' => 'nullable|string',
            'description' => 'nullable|string',
            'estimated_delivery_date' => 'nullable|date',
            'priority' => 'nullable|string',
            'special_notes' => 'nullable|string',
            'delivery_method' => 'nullable|string',
            'special_handling' => 'nullable|array',
            'sample_return' => 'nullable|string',
            'tujuan_pengujian' => 'nullable|array',
            'data_accuracy_confirmed' => 'nullable|boolean',
            'tat_cost_understood' => 'nullable|boolean',
        ]);

        $user = $request->user();

        // Get lab and test type names
        $lab = \App\Models\Lab::find($validated['lab_id']);
        $testType = isset($validated['test_type_id'])
            ? \App\Models\TestType::find($validated['test_type_id'])
            : null;

        $testRequest = TestRequest::create([
            'id' => TestRequest::generateId(),
            'user_id' => $user->id,
            'customer_name' => $validated['company_name'] ?? $user->name,
            'lab_id' => $validated['lab_id'],
            'lab_name' => $lab->name,
            'test_type' => $testType?->name ?? 'Pengujian Umum',
            'test_type_id' => $validated['test_type_id'] ?? null,
            'date_submitted' => now(),
            'status' => TestRequest::STATUS_PENDING,
            'sample_name' => $validated['sample_name'] ?? null,
            'description' => $validated['description'] ?? null,
            // Enhanced fields
            'company_name' => $validated['company_name'] ?? null,
            'phone_whatsapp' => $validated['phone_whatsapp'] ?? null,
            'address' => $validated['address'] ?? null,
            'sample_quantity' => $validated['sample_quantity'] ?? null,
            'sample_packaging' => $validated['sample_packaging'] ?? null,
            'estimated_delivery_date' => $validated['estimated_delivery_date'] ?? null,
            'priority' => $validated['priority'] ?? 'regular',
            'special_notes' => $validated['special_notes'] ?? null,
            'delivery_method' => $validated['delivery_method'] ?? null,
            'special_handling' => $validated['special_handling'] ?? null,
            'sample_return' => $validated['sample_return'] ?? null,
            'tujuan_pengujian' => $validated['tujuan_pengujian'] ?? null,
            'data_accuracy_confirmed' => $validated['data_accuracy_confirmed'] ?? false,
            'tat_cost_understood' => $validated['tat_cost_understood'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan pengujian berhasil dibuat',
            'data' => [
                'id' => $testRequest->id,
                'user_id' => $testRequest->user_id,
                'customer_name' => $testRequest->customer_name,
                'lab_id' => $testRequest->lab_id,
                'lab_name' => $testRequest->lab_name,
                'test_type' => $testRequest->test_type,
                'date_submitted' => $testRequest->date_submitted->format('Y-m-d'),
                'status' => $testRequest->status,
                'sample_name' => $testRequest->sample_name,
                'description' => $testRequest->description,
                'expiry_date' => $testRequest->expiry_date?->format('Y-m-d'),
            ],
        ], 201);
    }

    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $testRequest = TestRequest::with(['user', 'lab'])->findOrFail($id);

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

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $testRequest->id,
                'user_id' => $testRequest->user_id,
                'customer_name' => $testRequest->customer_name,
                'lab_id' => $testRequest->lab_id,
                'lab_name' => $testRequest->lab_name,
                'test_type' => $testRequest->test_type,
                'date_submitted' => $testRequest->date_submitted->format('Y-m-d'),
                'status' => $testRequest->status,
                'sample_name' => $testRequest->sample_name,
                'description' => $testRequest->description,
                'expiry_date' => $testRequest->expiry_date?->format('Y-m-d'),
            ],
        ]);
    }

    public function update(Request $request, string $id)
    {
        $user = $request->user();
        $testRequest = TestRequest::findOrFail($id);

        // Authorization: Hanya pemilik (customer) yang bisa edit
        if ($user->isCustomer() && $testRequest->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengedit permintaan ini',
            ], 403);
        }

        // Business rule: Hanya status PENDING yang bisa diedit
        if ($testRequest->status !== TestRequest::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya permintaan dengan status pending yang dapat diedit',
            ], 422);
        }

        $validated = $request->validate([
            'test_type_id' => 'sometimes|exists:test_types,id',
            'sample_name' => 'sometimes|string',
            'description' => 'sometimes|string',
            'sample_quantity' => 'sometimes|integer',
            'sample_packaging' => 'sometimes|string',
            'special_notes' => 'sometimes|string',
            'priority' => 'sometimes|string',
        ]);

        // Update test_type name if test_type_id changed
        if (isset($validated['test_type_id'])) {
            $testType = \App\Models\TestType::find($validated['test_type_id']);
            $validated['test_type'] = $testType?->name ?? $testRequest->test_type;
        }

        $testRequest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan berhasil diperbarui',
            'data' => [
                'id' => $testRequest->id,
                'user_id' => $testRequest->user_id,
                'customer_name' => $testRequest->customer_name,
                'lab_id' => $testRequest->lab_id,
                'lab_name' => $testRequest->lab_name,
                'test_type' => $testRequest->test_type,
                'date_submitted' => $testRequest->date_submitted->format('Y-m-d'),
                'status' => $testRequest->status,
                'sample_name' => $testRequest->sample_name,
                'description' => $testRequest->description,
            ],
        ]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:' . implode(',', TestRequest::validStatuses()),
        ]);

        $user = $request->user();
        $testRequest = TestRequest::findOrFail($id);

        if ($user->isLaboran() && $testRequest->lab_id !== $user->lab_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $testRequest->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui',
            'data' => [
                'id' => $testRequest->id,
                'status' => $testRequest->status,
            ],
        ]);
    }
}
