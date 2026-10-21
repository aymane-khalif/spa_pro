<?php
namespace Tests\Feature;
use Tests\TestCase;
use App\Models\User;
use App\Models\Client;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\CarbonImmutable;

class AvailabilityTest extends TestCase
{
    use RefreshDatabase;
    private function service(int $duration = 60): Service {
        return Service::create(['name'=>'Test '.$duration, 'description'=>'Test', 'price'=>200, 'duration'=>$duration]);
    }
    private function booking(Service $service, string $time): array {
        return ['nom'=>'Test','prenom'=>'Client','telephone'=>'0600000000','service_id'=>$service->id,'appointment_date'=>now()->addDays(2)->toDateString(),'appointment_time'=>$time];
    }
    public function test_duration_blocks_overlaps_across_services_and_cancel_releases_time(): void {
        $this->withHeader('Origin','http://localhost:5173');
        $this->actingAs(User::factory()->create());
        $long=$this->service(90); $short=$this->service(30);
        $data=$this->booking($long,'10:00');
        $booking=$this->postJson('/api/appointments',$data)->assertCreated()->assertJsonPath('status','confirmed');
        $slots=$this->getJson('/api/availability?'.http_build_query(['service_id'=>$short->id,'date'=>$data['appointment_date']]))->assertOk()->json('slots');
        $this->assertNotContains('10:00',$slots); $this->assertNotContains('11:00',$slots); $this->assertContains('12:00',$slots);
        $this->postJson('/api/appointments',$this->booking($short,'11:00'))->assertUnprocessable()->assertJsonValidationErrors('appointment_time');
        $admin=User::factory()->create(); $admin->forceFill(['is_admin'=>true])->save(); $this->actingAs($admin);
        $this->patchJson('/api/admin/appointments/'.$booking->json('id').'/status',['status'=>'cancelled'])->assertOk();
        $this->postJson('/api/appointments',$this->booking($short,'11:00'))->assertCreated();
        $this->patchJson('/api/admin/appointments/'.$booking->json('id').'/status',['status'=>'confirmed'])->assertUnprocessable();
    }
    public function test_boundaries_past_times_and_breaks_are_respected(): void {
        $this->withHeader('Origin','http://localhost:5173');
        $this->actingAs(User::factory()->create());
        $service=$this->service(60); $long=$this->service(90);
        $this->postJson('/api/appointments',$this->booking($service,'10:00'))->assertCreated();
        $this->postJson('/api/appointments',$this->booking($service,'11:00'))->assertCreated();
        $this->postJson('/api/appointments',$this->booking($long,'12:00'))->assertUnprocessable();
        $this->postJson('/api/appointments',$this->booking($long,'17:00'))->assertUnprocessable();
        $this->postJson('/api/appointments',$this->booking($service,'13:00'))->assertUnprocessable();
        $this->postJson('/api/appointments',array_replace($this->booking($service,'09:00'),['appointment_date'=>now()->subDay()->toDateString()]))->assertUnprocessable();
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2030-01-10 10:30','Africa/Casablanca'));
        try {
            $slots=$this->getJson('/api/availability?service_id='.$service->id.'&date=2030-01-10')->assertOk()->json('slots');
            $this->assertNotContains('09:00',$slots); $this->assertNotContains('10:00',$slots); $this->assertContains('11:00',$slots);
        } finally { CarbonImmutable::setTestNow(); }
    }
    public function test_admin_cannot_create_or_move_a_booking_into_an_occupied_slot(): void {
        $admin=User::factory()->create(); $admin->forceFill(['is_admin'=>true])->save();
        $this->actingAs($admin)->withHeader('Origin','http://localhost:5173');
        $service=$this->service();
        $client=Client::create(['nom'=>'Test','prenom'=>'Client','email'=>'a@example.com','telephone'=>'0600000000','date_inscription'=>now()->toDateString()]);
        $data=$this->booking($service,'10:00')+['client_id'=>$client->id,'status'=>'confirmed'];
        $this->postJson('/api/admin/appointments',$data)->assertCreated();
        $this->postJson('/api/admin/appointments',$data)->assertUnprocessable();
        $other=$this->postJson('/api/admin/appointments',array_replace($data,['appointment_time'=>'11:00']))->assertCreated();
        $this->putJson('/api/admin/appointments/'.$other->json('id'),$data)->assertUnprocessable();
        $this->putJson('/api/admin/appointments/'.$other->json('id'),array_replace($data,['appointment_time'=>'11:00']))->assertOk();
    }
    public function test_tracking_endpoint_is_removed(): void {
        $this->postJson('/api/appointments/suivi',['code_suivi'=>'LUN-EXAMPLE'])->assertNotFound();
    }
}
