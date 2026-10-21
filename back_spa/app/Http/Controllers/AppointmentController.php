<?php
namespace App\Http\Controllers;
use App\Models\Appointment;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
class AppointmentController extends Controller {
    private function rules(): array {
        return ['service_id' => 'required|exists:services,id', 'appointment_date' => 'required|date|after_or_equal:today', 'appointment_time' => 'required|date_format:H:i'];
    }
    public function store(Request $request) {
        $data = $request->validate($this->rules() + [
            'nom' => 'required|string|max:255', 'prenom' => 'required|string|max:255', 'telephone' => 'required|string|max:255',
        ]);
        $appointment = DB::transaction(function () use ($data, $request) {
            $client = Client::firstOrNew(['email' => $request->user()->email]);
            $client->fill(['nom' => $data['nom'], 'prenom' => $data['prenom'], 'telephone' => $data['telephone']]);
            $client->date_inscription ??= now()->toDateString();
            $client->save();
            return Appointment::create([
                'client_id' => $client->id, 'service_id' => $data['service_id'],
                'appointment_date' => $data['appointment_date'], 'appointment_time' => $data['appointment_time'],
                'status' => 'pending', 'code_suivi' => 'LUN-'.strtoupper(Str::random(12)),
            ]);
        });
        return response()->json($appointment->load('service'), 201);
    }
    public function suivi(Request $request) {
        $data = $request->validate(['code_suivi' => 'required|string|max:50']);
        $appointment = Appointment::with('service')->where('code_suivi', strtoupper(trim($data['code_suivi'])))->firstOrFail();
        return response()->json($appointment);
    }
    public function index() { return Appointment::with(['client', 'service'])->latest()->get(); }
    public function show(Appointment $appointment) { return $appointment->load(['client', 'service']); }
    public function adminStore(Request $request) {
        $data = $request->validate($this->rules() + ['client_id' => 'required|exists:clients,id', 'status' => 'required|in:pending,confirmed,cancelled']);
        $data['code_suivi'] = 'LUN-'.strtoupper(Str::random(12));
        return response()->json(Appointment::create($data)->load(['client', 'service']), 201);
    }
    public function update(Request $request, Appointment $appointment) {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id', 'service_id' => 'required|exists:services,id',
            'appointment_date' => 'required|date', 'appointment_time' => 'required|date_format:H:i',
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);
        $appointment->update($data);
        return $appointment->load(['client', 'service']);
    }
    public function status(Request $request, Appointment $appointment) {
        $appointment->update($request->validate(['status' => 'required|in:confirmed,cancelled']));
        return $appointment;
    }
    public function destroy(Appointment $appointment) { $appointment->delete(); return response()->noContent(); }
}
