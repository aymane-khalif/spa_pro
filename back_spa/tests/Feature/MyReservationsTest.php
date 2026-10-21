<?php
namespace Tests\Feature;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MyReservationsTest extends TestCase {
    use RefreshDatabase;
    public function test_guests_cannot_read_reservations(): void {
        $this->getJson('/api/my-appointments')->assertUnauthorized();
    }
    public function test_only_the_signed_in_accounts_bookings_are_returned(): void {
        $owner=User::factory()->create();$other=User::factory()->create();
        $service=Service::create(['name'=>'Test','description'=>'Test','duration'=>60,'price'=>200]);
        foreach ([$owner,$other] as $user) {
            $client=Client::create(['nom'=>'Name','prenom'=>'Test','email'=>$user->email,'telephone'=>'0600000000','date_inscription'=>now()->toDateString()]);
            Appointment::create(['client_id'=>$client->id,'service_id'=>$service->id,'appointment_date'=>now()->addDay()->toDateString(),'appointment_time'=>'10:00','status'=>'confirmed','code_suivi'=>'LUN-'.$user->id]);
        }
        $ownId=Appointment::whereHas('client',fn($q)=>$q->where('email',$owner->email))->value('id');
        $this->actingAs($owner)->getJson('/api/my-appointments?client_id=2&email='.$other->email)->assertOk()->assertJsonPath('total',1)->assertJsonPath('data.0.id',$ownId)->assertJsonPath('data.0.service.name','Test')->assertJsonMissingPath('data.0.code_suivi')->assertJsonMissingPath('data.0.client');
    }
    public function test_new_booking_appears_in_the_account_list_and_empty_state_is_supported(): void {
        $this->withHeader('Origin','http://localhost:5173')->actingAs(User::factory()->create());
        $this->getJson('/api/my-appointments')->assertOk()->assertJsonPath('total',0);
        $service=Service::create(['name'=>'Test','description'=>'Test','duration'=>60,'price'=>200]);
        $booking=$this->postJson('/api/appointments',['service_id'=>$service->id,'appointment_date'=>now()->addDay()->toDateString(),'appointment_time'=>'10:00'])->assertCreated();
        $this->getJson('/api/my-appointments')->assertOk()->assertJsonPath('total',1)->assertJsonPath('data.0.id',$booking->json('id'))->assertJsonPath('data.0.status','confirmed');
    }
}
