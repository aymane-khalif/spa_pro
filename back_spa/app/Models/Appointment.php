<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Client;
use App\Models\Service;

class Appointment extends Model
{
    protected $hidden = ['code_suivi'];

    protected $fillable = [
        'client_id',
        'service_id',
        'appointment_date',
        'appointment_time',
        'status',
        'code_suivi',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
