<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\LabController;
use App\Http\Controllers\Api\ProcedureTemplateController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RequestProcedureController;
use App\Http\Controllers\Api\TestRequestController;
use App\Http\Controllers\Api\TestTypeController;
use App\Http\Controllers\Api\TujuanPengujianController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Google OAuth routes
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/auth/google/token', [GoogleAuthController::class, 'handleToken']);
Route::get('/labs', [LabController::class, 'index']);
Route::get('/labs/{id}', [LabController::class, 'show']);
Route::get('/labs/{id}/test-types', [TestTypeController::class, 'byLab']);

// Lookup data (public)
Route::get('/tujuan-pengujian', [TujuanPengujianController::class, 'index']);
Route::get('/test-types', [TestTypeController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Test Requests
    Route::get('/requests', [TestRequestController::class, 'index']);
    Route::post('/requests', [TestRequestController::class, 'store']);
    Route::get('/requests/{id}', [TestRequestController::class, 'show']);
    Route::put('/requests/{id}/status', [TestRequestController::class, 'updateStatus']);
    Route::get('/requests/{id}/report-pdf', [ReportController::class, 'generateReportPdf']);

    // Reports & Export
    Route::post('/reports/export-pdf', [ReportController::class, 'exportPdf']);

    // Request Procedures
    Route::get('/requests/{id}/procedure', [RequestProcedureController::class, 'show']);
    Route::put('/requests/{id}/procedure/steps/{stepId}', [RequestProcedureController::class, 'updateStep']);
    Route::post('/requests/{id}/procedure/approvals', [RequestProcedureController::class, 'requestApproval']);
    Route::put('/requests/{id}/procedure/approvals/{approvalId}', [RequestProcedureController::class, 'processApproval']);
    Route::put('/requests/{id}/procedure/assign-analyst', [RequestProcedureController::class, 'assignAnalyst']);

    // Procedure Templates (Admin/Supervisor)
    Route::get('/procedure-templates', [ProcedureTemplateController::class, 'index']);
    Route::post('/procedure-templates', [ProcedureTemplateController::class, 'store']);
    Route::get('/procedure-templates/{id}', [ProcedureTemplateController::class, 'show']);
    Route::put('/procedure-templates/{id}', [ProcedureTemplateController::class, 'update']);
    Route::put('/procedure-templates/{id}/activate', [ProcedureTemplateController::class, 'activate']);
    Route::post('/procedure-templates/{id}/duplicate', [ProcedureTemplateController::class, 'duplicate']);
});
