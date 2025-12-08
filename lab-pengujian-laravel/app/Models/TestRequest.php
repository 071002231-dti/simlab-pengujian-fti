<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestRequest extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'customer_name',
        'lab_id',
        'lab_name',
        'test_type',
        'date_submitted',
        'status',
        'sample_name',
        'description',
        'expiry_date',
    ];

    protected $casts = [
        'date_submitted' => 'date:Y-m-d',
        'expiry_date' => 'date:Y-m-d',
    ];

    // Status Constants
    const STATUS_PENDING = 'Menunggu Persetujuan';
    const STATUS_APPROVED = 'Disetujui Admin';
    const STATUS_RECEIVED = 'Sampel Diterima';
    const STATUS_IN_PROGRESS = 'Sedang Diuji';
    const STATUS_COMPLETED = 'Selesai';
    const STATUS_DELIVERED = 'Hasil Dikirim';

    public static function validStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_APPROVED,
            self::STATUS_RECEIVED,
            self::STATUS_IN_PROGRESS,
            self::STATUS_COMPLETED,
            self::STATUS_DELIVERED,
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lab()
    {
        return $this->belongsTo(Lab::class);
    }

    public static function generateId(): string
    {
        $prefix = 'REQ-' . date('Ym') . '-';
        $lastRequest = self::where('id', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastRequest) {
            $lastNumber = (int) substr($lastRequest->id, -3);
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '001';
        }

        return $prefix . $newNumber;
    }
}
