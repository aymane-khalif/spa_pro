<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
  use HasFactory, Notifiable;
    protected $attributes = ['is_admin' => false];

    protected $fillable = [
        'name',
        'nom',
        'prenom',
        'telephone',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'profile_photo_path',
    ];

    protected $appends = ['profile_photo_url'];

    public function getProfilePhotoUrlAttribute(): ?string
    {
        return $this->profile_photo_path
            ? url('/api/profile/photo').'?v='.substr(hash('sha256',$this->profile_photo_path),0,16)
            : null;
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_admin' => 'boolean',
            'password' => 'hashed',
        ];
    }
}
