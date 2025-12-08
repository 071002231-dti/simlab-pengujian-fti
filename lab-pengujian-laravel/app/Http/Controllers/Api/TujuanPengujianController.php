<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TujuanPengujian;

class TujuanPengujianController extends Controller
{
    public function index()
    {
        $tujuan = TujuanPengujian::active()->get();

        return response()->json([
            'success' => true,
            'data' => $tujuan->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'code' => $item->code,
                    'requires_input' => $item->requires_input,
                ];
            }),
        ]);
    }
}
