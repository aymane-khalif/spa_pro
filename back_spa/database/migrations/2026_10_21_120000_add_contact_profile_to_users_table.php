<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nom')->nullable();
            $table->string('prenom')->nullable();
            $table->string('telephone')->nullable();
        });
        // Only recover known details; never invent names or phone numbers for old accounts.
        DB::table('users')->orderBy('id')->chunkById(100, function ($users) {
            foreach ($users as $user) {
                $client=DB::table('clients')->where('email',$user->email)->first();
                if ($client) DB::table('users')->where('id',$user->id)->update([
                    'nom'=>$client->nom, 'prenom'=>$client->prenom, 'telephone'=>$client->telephone,
                ]);
            }
        });
    }
    public function down(): void {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['nom','prenom','telephone']));
    }
};
