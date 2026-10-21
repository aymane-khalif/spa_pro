<?php
namespace Tests\Feature;
use App\Mail\ContactMessageMail;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactEmailTest extends TestCase {
    use RefreshDatabase;
    private function payload(): array {return ['nom'=>'Visitor','email'=>'visitor@example.com','sujet'=>'Question','message'=>'Bonjour <script>alert(1)</script>'];}
    public function test_contact_sends_to_configured_inbox_with_visitors_reply_address(): void {
        Mail::fake();config(['mail.default'=>'smtp']);
        $this->postJson('/api/contact',$this->payload())->assertCreated()->assertJsonPath('email_delivered',true);
        $this->assertDatabaseCount('messages',1);
        Mail::assertSent(ContactMessageMail::class,function($mail) {
            $mail->build();
            return $mail->hasTo('khadim.hiba07@gmail.com') && $mail->hasReplyTo('visitor@example.com') && $mail->contactMessage->sujet==='Question';
        });
        $html=(new ContactMessageMail(Message::firstOrFail()))->render();
        $this->assertStringNotContainsString('<script>',$html);
        $this->assertStringContainsString('&lt;script&gt;',$html);
    }
    public function test_transport_failure_keeps_the_message_without_claiming_email_delivery(): void {
        config(['mail.default'=>'smtp']);Mail::shouldReceive('to')->once()->with('khadim.hiba07@gmail.com')->andThrow(new \RuntimeException('Unavailable transport'));
        $this->postJson('/api/contact',$this->payload())->assertCreated()->assertJsonPath('email_delivered',false);
        $this->assertDatabaseCount('messages',1);
    }
    public function test_log_transport_does_not_claim_real_delivery(): void {
        Mail::fake();config(['mail.default'=>'log']);
        $this->postJson('/api/contact',$this->payload())->assertCreated()->assertJsonPath('email_delivered',false);
        Mail::assertNothingSent();
    }
}
