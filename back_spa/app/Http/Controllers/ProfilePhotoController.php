<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProfilePhotoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['photo'=>['required','image','mimes:jpg,jpeg,png,webp','max:2048','dimensions:max_width=4096,max_height=4096']]);
        $path=$request->file('photo')->store('profile-photos','local');
        abort_unless($path,500,'Impossible de sauvegarder la photo.');
        try {
            [$user,$previous]=DB::transaction(function () use ($request,$path) {
                $user=User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
                $previous=$user->profile_photo_path;
                $user->forceFill(['profile_photo_path'=>$path])->save();
                return [$user,$previous];
            });
        } catch (\Throwable $error) {
            Storage::disk('local')->delete($path);
            throw $error;
        }
        if ($previous) Storage::disk('local')->delete($previous);
        return response()->json($user);
    }

    public function show(Request $request)
    {
        $path=$request->user()->refresh()->profile_photo_path;
        abort_unless($path && Storage::disk('local')->exists($path),404);
        return response()->file(Storage::disk('local')->path($path),[
            'Cache-Control'=>'private, no-store', 'X-Content-Type-Options'=>'nosniff',
        ]);
    }
}
