<?php
namespace Tests\Feature;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\Client;
class ApiTest extends TestCase {
    use RefreshDatabase;
    protected function setUp(): void { parent::setUp(); $this->withHeader('Origin', 'http://localhost:5173'); }
    public function test_migrations_create_an_empty_database(): void {
        foreach (['users','clients','services','appointments','messages'] as $table) $this->assertDatabaseCount($table, 0);
        $this->getJson('/api/services')->assertOk()->assertExactJson([]);
    }
    public function test_guests_and_customers_cannot_manage_private_records(): void {
        foreach (['clients','appointments','messages'] as $resource) $this->getJson('/api/admin/'.$resource)->assertUnauthorized();
        $this->actingAs(User::factory()->create());
        foreach (['clients','appointments','messages'] as $resource) $this->getJson('/api/admin/'.$resource)->assertForbidden();
    }
    public function test_registration_login_and_logout(): void {
        $this->postJson('/api/inscription', ['nom'=>'Test','prenom'=>'Client','telephone'=>'0600000000','email'=>'client@example.com','password'=>'password123','password_confirmation'=>'password123','is_admin'=>true])->assertCreated()->assertJsonPath('is_admin', false);
        $this->postJson('/api/logout')->assertNoContent();
        $this->postJson('/api/login', ['email'=>'client@example.com','password'=>'incorrect'])->assertUnprocessable();
        $this->postJson('/api/login', ['email'=>'client@example.com','password'=>'password123'])->assertOk();
        $this->getJson('/api/user')->assertOk()->assertJsonPath('email','client@example.com');
    }
    public function test_booking_is_confirmed_and_admin_can_manage_it(): void {
        $user = User::factory()->create();
        $service = Service::create(['name'=>'Test service','description'=>'Test','price'=>200,'duration'=>60]);
        $data = ['nom'=>'Client','prenom'=>'Test','telephone'=>'0600000000','service_id'=>$service->id,'appointment_date'=>now()->addDay()->toDateString(),'appointment_time'=>'10:00','email'=>'someone-else@example.com'];
        $this->postJson('/api/appointments',$data)->assertUnauthorized();
        $response = $this->actingAs($user)->postJson('/api/appointments',$data)->assertCreated();
        $this->assertDatabaseHas('clients',['email'=>$user->email]);
        $this->assertDatabaseMissing('clients',['email'=>'someone-else@example.com']);
        $response->assertJsonPath('status', 'confirmed')->assertJsonMissingPath('code_suivi');
        $admin = User::factory()->create(); $admin->forceFill(['is_admin'=>true])->save();
        $this->actingAs($admin)->patchJson('/api/admin/appointments/'.$response->json('id').'/status',['status'=>'cancelled'])->assertOk();
        $this->actingAs($user)->postJson('/api/appointments',array_replace($data,['appointment_date'=>now()->subDay()->toDateString()]))->assertUnprocessable();
        $this->postJson('/api/appointments',array_replace($data,['appointment_time'=>'invalid']))->assertUnprocessable();
    }
    public function test_admin_can_create_update_and_delete_clients_and_appointments(): void {
        $admin = User::factory()->create(); $admin->forceFill(['is_admin'=>true])->save(); $this->actingAs($admin);
        $client = $this->postJson('/api/admin/clients',['nom'=>'Test','prenom'=>'Client','email'=>'test@example.com','telephone'=>'0600000000','date_inscription'=>now()->toDateString()])->assertCreated()->json();
        $service = Service::create(['name'=>'Test','description'=>'Test','price'=>100,'duration'=>30]);
        $data = ['client_id'=>$client['id'],'service_id'=>$service->id,'appointment_date'=>now()->addDay()->toDateString(),'appointment_time'=>'11:00','status'=>'pending'];
        $appointment = $this->postJson('/api/admin/appointments',$data)->assertCreated()->json();
        $this->putJson('/api/admin/appointments/'.$appointment['id'],array_replace($data,['status'=>'cancelled']))->assertOk()->assertJsonPath('status','cancelled');
        $this->deleteJson('/api/admin/clients/'.$client['id'])->assertNoContent();
        $this->assertDatabaseCount('appointments',0);
    }
    public function test_contact_messages_are_saved_and_only_admin_can_read_them(): void {
        $this->postJson('/api/contact',['nom'=>'Test','email'=>'test@example.com','sujet'=>'Question','message'=>'Bonjour'])->assertCreated();
        $this->assertDatabaseCount('messages',1);
        $this->getJson('/api/admin/messages')->assertUnauthorized();
    }

    public function test_duplicate_client_email_is_a_validation_error_and_unchanged_email_can_be_saved(): void {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();
        $this->actingAs($admin);
        $data = ['nom'=>'Test','prenom'=>'Client','email'=>'unique@example.com','telephone'=>'0600000000','date_inscription'=>now()->toDateString()];
        $client = $this->postJson('/api/admin/clients', $data)->assertCreated()->json();
        $this->postJson('/api/admin/clients', $data)->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->putJson('/api/admin/clients/'.$client['id'], $data)->assertOk();
        $other = $this->postJson('/api/admin/clients', array_replace($data, ['email'=>'other@example.com']))->assertCreated()->json();
        $this->putJson('/api/admin/clients/'.$other['id'], $data)->assertUnprocessable()->assertJsonValidationErrors('email');
    }
    public function test_registration_without_a_stateful_origin_cannot_create_a_user_then_fail(): void {
        $this->flushHeaders();
        $this->postJson('/api/inscription', ['nom'=>'Test','prenom'=>'Client','telephone'=>'0600000000','email'=>'no-session@example.com','password'=>'password123','password_confirmation'=>'password123'])->assertStatus(400);
        $this->assertDatabaseCount('users', 0);
    }
    public function test_cors_and_csrf_cookie_are_available_to_the_frontend(): void {
        $this->get('/sanctum/csrf-cookie')->assertNoContent()->assertCookie('XSRF-TOKEN')->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')->assertHeader('Access-Control-Allow-Credentials', 'true');
        $this->options('/api/login', [], ['Origin'=>'http://localhost:5173','Access-Control-Request-Method'=>'POST','Access-Control-Request-Headers'=>'content-type,x-xsrf-token'])->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
}
