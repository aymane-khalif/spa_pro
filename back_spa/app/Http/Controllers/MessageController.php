<?php
namespace App\Http\Controllers;
use App\Models\Message;
use App\Mail\ContactMessageMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller {
    public function store(Request $request) {
        $user=Auth::guard('web')->user();
        $rules=['sujet'=>'required|string|max:255','message'=>'required|string|max:10000'];
        if (!$user) $rules += ['nom'=>'required|string|max:255','email'=>'required|email|max:255'];
        $data=$request->validate($rules);
        if ($user) {
            $data['nom']=$user->name;
            $data['email']=$user->email;
        }
        $message=Message::create($data);
        $delivered=false;
        // Development transports never imply delivery to a real inbox.
        if (!in_array(config('mail.default'), ['log','array'], true)) {
            try {
                Mail::to(config('contact.email'))->send(new ContactMessageMail($message));
                $delivered=true;
            } catch (\Throwable $error) {
                // Preserve the message for administrators even if SMTP is unavailable.
                Log::warning('Contact email delivery failed; message retained.', ['message_id'=>$message->id]);
            }
        }
        return response()->json([
            'message'=>$delivered ? 'Votre message a été envoyé avec succès !' : 'Votre message a bien été enregistré. Notre équipe pourra le consulter.',
            'email_delivered'=>$delivered,
        ],201);
    }
    public function index() { return Message::latest()->get(); }
}
