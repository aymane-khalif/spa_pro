<?php
namespace Tests\Feature;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfilePhotoTest extends TestCase {
    use RefreshDatabase;
    private function photo(): UploadedFile {
        return UploadedFile::fake()->createWithContent('avatar.png',base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='));
    }
    public function test_upload_persists_displays_and_replaces_only_own_photo(): void {
        Storage::fake('local');$this->withHeader('Origin','http://localhost:5173');
        $user=User::factory()->create();$other=User::factory()->create();$this->actingAs($user);
        $this->post('/api/profile/photo',['photo'=>$this->photo(),'id'=>$other->id],['Accept'=>'application/json'])->assertOk()->assertJsonPath('id',$user->id)->assertJsonMissingPath('profile_photo_path');
        $old=$user->fresh()->profile_photo_path;Storage::disk('local')->assertExists($old);
        $this->get('/api/profile/photo')->assertOk()->assertHeader('Content-Type','image/png');
        $this->getJson('/api/user')->assertOk()->assertJsonPath('profile_photo_url',$user->fresh()->profile_photo_url);
        $this->post('/api/profile/photo',['photo'=>$this->photo()],['Accept'=>'application/json'])->assertOk();
        Storage::disk('local')->assertMissing($old);Storage::disk('local')->assertExists($user->fresh()->profile_photo_path);
        $this->assertNull($other->fresh()->profile_photo_path);
    }
    public function test_guests_and_invalid_files_are_rejected(): void {
        Storage::fake('local');$this->withHeader('Origin','http://localhost:5173');
        $this->post('/api/profile/photo',['photo'=>$this->photo()],['Accept'=>'application/json'])->assertUnauthorized();
        $this->getJson('/api/profile/photo')->assertUnauthorized();
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/profile/photo')->assertNotFound();
        $this->post('/api/profile/photo',['photo'=>UploadedFile::fake()->createWithContent('bad.svg','<svg/>')],['Accept'=>'application/json'])->assertUnprocessable();
        $this->post('/api/profile/photo',['photo'=>UploadedFile::fake()->createWithContent('huge.png',str_repeat('x',2097153))],['Accept'=>'application/json'])->assertUnprocessable();
        $this->assertEmpty(Storage::disk('local')->allFiles());
    }
}
