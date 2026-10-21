<?php
namespace Tests\Feature;
use Tests\TestCase;
use App\Models\User;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AccountDetailsTest extends TestCase {
    use RefreshDatabase;
    protected function setUp(): void {parent::setUp();$this->withHeader('Origin','http://localhost:5173');}
    public function test_registration_persists_the_contact_details(): void {
        $this->postJson('/api/inscription',['nom'=>'Nom','prenom'=>'Prenom','telephone'=>'0612345678','email'=>'new@example.com','password'=>'password123','password_confirmation'=>'password123'])->assertCreated();
        $this->assertDatabaseHas('users',['email'=>'new@example.com','nom'=>'Nom','prenom'=>'Prenom','telephone'=>'0612345678']);
        $this->getJson('/api/user')->assertOk()->assertJsonPath('nom','Nom')->assertJsonPath('prenom','Prenom')->assertJsonPath('telephone','0612345678');
        $this->putJson('/api/profile',['nom'=>'Nouveau Nom','prenom'=>'Nouveau Prenom','telephone'=>'0698765432'])->assertOk();
        $this->postJson('/api/logout')->assertNoContent();
        $this->postJson('/api/login',['email'=>'new@example.com','password'=>'password123'])->assertOk();
        $this->getJson('/api/user')->assertOk()->assertJsonPath('nom','Nouveau Nom')->assertJsonPath('prenom','Nouveau Prenom')->assertJsonPath('telephone','0698765432');
        $this->assertDatabaseHas('users',['email'=>'new@example.com','nom'=>'Nouveau Nom','prenom'=>'Nouveau Prenom','telephone'=>'0698765432']);
    }
    public function test_contact_and_booking_use_the_account_not_submitted_identity(): void {
        $user=User::factory()->create(['name'=>'Real Name','nom'=>'Name','prenom'=>'Real','telephone'=>'0612345678']);
        $this->actingAs($user);
        $this->postJson('/api/contact',['sujet'=>'Question','message'=>'Bonjour','nom'=>'Fake','email'=>'fake@example.com'])->assertCreated();
        $this->assertDatabaseHas('messages',['nom'=>'Real Name','email'=>$user->email]);
        $service=Service::create(['name'=>'Test','description'=>'Test','duration'=>60,'price'=>200]);
        $this->postJson('/api/appointments',['service_id'=>$service->id,'appointment_date'=>now()->addDays(2)->toDateString(),'appointment_time'=>'10:00','nom'=>'Fake','prenom'=>'Fake','telephone'=>'fake'])->assertCreated();
        $this->assertDatabaseHas('clients',['email'=>$user->email,'nom'=>'Name','prenom'=>'Real','telephone'=>'0612345678']);
    }
    public function test_old_account_can_book_without_reentering_details_and_profile_is_optional(): void {
        $user=User::factory()->create(['nom'=>null,'prenom'=>null,'telephone'=>null]);$this->actingAs($user);
        $service=Service::create(['name'=>'Test','description'=>'Test','duration'=>60,'price'=>200]);
        $booking=['service_id'=>$service->id,'appointment_date'=>now()->addDays(2)->toDateString(),'appointment_time'=>'10:00'];
        $this->postJson('/api/appointments',$booking)->assertCreated();
        $this->assertDatabaseHas('clients',['email'=>$user->email,'nom'=>$user->name,'prenom'=>'','telephone'=>'']);
        $this->putJson('/api/profile',['nom'=>'Nom','prenom'=>'Prenom','telephone'=>'0612345678','is_admin'=>true,'email'=>'attacker@example.com'])->assertOk()->assertJsonPath('is_admin',false)->assertJsonPath('email',$user->email);
        $this->postJson('/api/appointments',array_replace($booking,['appointment_time'=>'11:00']))->assertCreated();
    }
    public function test_guests_still_need_contact_details_and_cannot_update_profile(): void {
        $this->postJson('/api/contact',['sujet'=>'Question','message'=>'Bonjour'])->assertUnprocessable()->assertJsonValidationErrors(['nom','email']);
        $this->putJson('/api/profile',['nom'=>'Nom','prenom'=>'Prenom','telephone'=>'0612345678'])->assertUnauthorized();
    }
    public function test_profile_displays_and_updates_only_the_signed_in_account(): void {
        $owner=User::factory()->create(['name'=>'Owner Name','nom'=>'Name','prenom'=>'Owner','telephone'=>'0611111111']);
        $other=User::factory()->create(['name'=>'Other Name','telephone'=>'0622222222']);
        $this->actingAs($owner)->getJson('/api/user')->assertOk()->assertJsonPath('id',$owner->id)->assertJsonPath('email',$owner->email)->assertJsonPath('telephone','0611111111')->assertJsonMissingPath('password');
        $this->putJson('/api/profile',['id'=>$other->id,'nom'=>'Updated','prenom'=>'Owner','telephone'=>'0633333333'])->assertOk()->assertJsonPath('id',$owner->id)->assertJsonPath('name','Owner Updated');
        $this->assertDatabaseHas('users',['id'=>$other->id,'name'=>'Other Name','telephone'=>'0622222222']);
        $this->assertDatabaseHas('users',['id'=>$owner->id,'name'=>'Owner Updated','telephone'=>'0633333333']);
    }
}
