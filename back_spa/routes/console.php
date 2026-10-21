<?php
use Illuminate\Support\Facades\Artisan;
use App\Models\User;
Artisan::command('spa:admin {email}', function () {
    $user = User::where('email', $this->argument('email'))->first();
    if (!$user) { $this->error('Utilisateur introuvable. Inscrivez-vous depuis le frontend.'); return 1; }
    $user->forceFill(['is_admin' => true])->save();
    $this->info('Droits administrateur accordés à '.$user->email);
    return 0;
})->purpose('Grant administrator access to an existing registered user');
