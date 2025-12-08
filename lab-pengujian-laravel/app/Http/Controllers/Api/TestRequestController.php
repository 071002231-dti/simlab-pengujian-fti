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
            'lab_name' => 'required|string',
            'test_type' => 'required|string',
            'sample_name' => 'nullable|string',
            'description' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        $user = $request->user();

        $testRequest = TestRequest::create([
            'id' => TestRequest::generateId(),
            'user_id' => $user->id,
            'customer_name' => $user->name,
            'lab_id' => $validated['lab_id'],
            'lab_name' => $validated['lab_name'],
            'test_type' => $validated['test_type'],
            'date_submitted' => now(),
            'status' => TestRequest::STATUS_PENDING,
            'sample_name' => $validated['sample_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'expiry_date' => $validated['expiry_date'] ?? null,
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
