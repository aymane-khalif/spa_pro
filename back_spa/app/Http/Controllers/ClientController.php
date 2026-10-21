<?php
namespace App\Http\Controllers;
use App\Models\Client;
use Illuminate\Http\Request;
class ClientController extends Controller {
    private function data(Request $request): array {
        return $request->validate(['nom' => 'required|string|max:255', 'prenom' => 'required|string|max:255', 'email' => 'required|email|max:255', 'telephone' => 'required|string|max:255', 'date_inscription' => 'required|date']);
    }
    public function index(Request $request) {
        return Client::query()->when($request->filled('search'), function ($q) use ($request) {
            $search = '%'.$request->string('search').'%';
            $q->where(fn ($q) => $q->where('nom', 'like', $search)->orWhere('prenom', 'like', $search)->orWhere('email', 'like', $search)->orWhere('telephone', 'like', $search));
        })->get();
    }
    public function store(Request $request) { return response()->json(Client::create($this->data($request)), 201); }
    public function show(Client $client) { return $client; }
    public function update(Request $request, Client $client) { $client->update($this->data($request)); return $client; }
    public function destroy(Client $client) { $client->delete(); return response()->noContent(); }
}
