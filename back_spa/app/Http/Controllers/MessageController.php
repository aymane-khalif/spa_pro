<?php
namespace App\Http\Controllers;
use App\Models\Message;
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
        Message::create($data);
        return response()->json(['message'=>'Votre message a été envoyé avec succès !'],201);
    }
    public function index() { return Message::latest()->get(); }
}
