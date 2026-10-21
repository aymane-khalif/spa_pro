<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;
use App\Services\BookingAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    public function __construct(private BookingAvailability $availability) {}

    private function rules(): array
    {
        return ['service_id' => 'required|exists:services,id', 'appointment_date' => 'required|date_format:Y-m-d', 'appointment_time' => 'required|date_format:H:i'];
    }

    public function availableSlots(Request $request)
    {
        $data = $request->validate(['service_id' => 'required|exists:services,id', 'date' => 'required|date_format:Y-m-d']);
        return response()->json(['date' => $data['date'], 'slots' => $this->availability->slots(Service::findOrFail($data['service_id']), $data['date']), 'timezone' => config('booking.timezone')])
            ->header('Cache-Control', 'no-store');
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $appointment = DB::transaction(function () use ($data, $request) {
            $this->availability->lockCalendar();
            $this->availability->assertAvailable($data);
            $client = Client::firstOrNew(['email' => $request->user()->email]);
            $user = $request->user();
            // Old accounts may only have a full name and email. Keep known client
            // details and leave unavailable values empty rather than blocking booking.
            $client->fill([
                'nom' => $user->nom ?: ($client->nom ?: $user->name),
                'prenom' => $user->prenom ?: ($client->prenom ?? ''),
                'telephone' => $user->telephone ?: ($client->telephone ?? ''),
            ]);
            $client->date_inscription ??= now()->toDateString();
            $client->save();
            return Appointment::create([
                'client_id' => $client->id, 'service_id' => $data['service_id'],
                'appointment_date' => $data['appointment_date'], 'appointment_time' => $data['appointment_time'],
                'status' => 'confirmed',
                // Retain the legacy DB column for existing installations; never expose it.
                'code_suivi' => 'LUN-'.strtoupper(Str::random(12)),
            ]);
        }, 3);
        return response()->json($appointment->load('service'), 201);
    }

    public function index() { return Appointment::with(['client', 'service'])->latest()->get(); }
    public function show(Appointment $appointment) { return $appointment->load(['client', 'service']); }

    public function adminStore(Request $request)
    {
        $data = $request->validate($this->rules() + ['client_id' => 'required|exists:clients,id', 'status' => 'required|in:pending,confirmed,cancelled']);
        $appointment = DB::transaction(function () use ($data) {
            $this->availability->lockCalendar();
            if ($data['status'] !== 'cancelled') $this->availability->assertAvailable($data);
            $data['code_suivi'] = 'LUN-'.strtoupper(Str::random(12));
            return Appointment::create($data);
        }, 3);
        return response()->json($appointment->load(['client', 'service']), 201);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $data = $request->validate($this->rules() + ['client_id' => 'required|exists:clients,id', 'status' => 'required|in:pending,confirmed,cancelled']);
        DB::transaction(function () use ($data, $appointment) {
            $this->availability->lockCalendar();
            if ($data['status'] !== 'cancelled') $this->availability->assertAvailable($data, $appointment->id);
            $appointment->update($data);
        }, 3);
        return $appointment->load(['client', 'service']);
    }

    public function status(Request $request, Appointment $appointment)
    {
        $data = $request->validate(['status' => 'required|in:confirmed,cancelled']);
        DB::transaction(function () use ($data, $appointment) {
            $this->availability->lockCalendar();
            $appointment->refresh();
            if ($data['status'] === 'confirmed' && $appointment->status === 'cancelled') {
                $this->availability->assertAvailable([
                    'service_id' => $appointment->service_id, 'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => substr($appointment->appointment_time, 0, 5),
                ], $appointment->id);
            }
            $appointment->update($data);
        }, 3);
        return $appointment;
    }

    public function destroy(Appointment $appointment)
    {
        DB::transaction(function () use ($appointment) {
            $this->availability->lockCalendar();
            $appointment->delete();
        }, 3);
        return response()->noContent();
    }
}
