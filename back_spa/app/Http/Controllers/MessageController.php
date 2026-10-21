<?php
namespace App\Http\Controllers;
use App\Models\Message;
use Illuminate\Http\Request;
class MessageController extends Controller {
    public function store(Request $request) {
        $data = $request->validate(['nom' => 'required|string|max:255', 'email' => 'required|email|max:255', 'sujet' => 'required|string|max:255', 'message' => 'required|string|max:10000']);
        Message::create($data);
        return response()->json(['message' => 'Votre message a été envoyé avec succès !'], 201);
    }
    public function index() { return Message::latest()->get(); }
}
