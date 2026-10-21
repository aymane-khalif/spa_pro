<?php
namespace App\Mail;
use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMessageMail extends Mailable
{
    use Queueable, SerializesModels;
    public function __construct(public Message $contactMessage) {}
    public function build(): static
    {
        return $this->subject('Lunéa Spa — '.str_replace(["\r","\n"],' ',$this->contactMessage->sujet))
            ->replyTo($this->contactMessage->email,$this->contactMessage->nom)
            ->view('emails.contact-message');
    }
}
