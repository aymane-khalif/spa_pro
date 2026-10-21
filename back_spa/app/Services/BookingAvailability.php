<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Service;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class BookingAvailability
{
    public function slots(Service $service, string $date, ?int $except = null): array
    {
        $timezone = config('booking.timezone');
        $now = CarbonImmutable::now($timezone);
        $bookings = Appointment::with('service')
            ->whereDate('appointment_date', $date)
            ->where('status', '!=', 'cancelled')
            ->when($except, fn ($q) => $q->where('id', '!=', $except))
            ->get();

        return array_values(array_filter(config('booking.starts'), function ($time) use ($service, $date, $timezone, $now, $bookings) {
            $start = CarbonImmutable::parse($date.' '.$time, $timezone);
            $end = $start->addMinutes(max(1, (int) $service->duration));
            if ($start->lessThanOrEqualTo($now)) {
                return false;
            }
            $withinHours = false;
            foreach (config('booking.opening_periods') as [$opening, $closing]) {
                if ($start->greaterThanOrEqualTo(CarbonImmutable::parse($date.' '.$opening, $timezone))
                    && $end->lessThanOrEqualTo(CarbonImmutable::parse($date.' '.$closing, $timezone))) {
                    $withinHours = true;
                }
            }
            if (!$withinHours) {
                return false;
            }
            foreach ($bookings as $booking) {
                $otherStart = CarbonImmutable::parse($date.' '.$booking->appointment_time, $timezone);
                $otherEnd = $otherStart->addMinutes(max(1, (int) ($booking->service?->duration ?? 60)));
                if ($start->lessThan($otherEnd) && $end->greaterThan($otherStart)) {
                    return false;
                }
            }
            return true;
        }));
    }

    // Called inside every booking write transaction, before reading appointments.
    // A shared service-row mutex serializes competing bookings across the entire spa.
    public function lockCalendar(): void
    {
        Service::orderBy('id')->lockForUpdate()->firstOrFail();
    }

    public function assertAvailable(array $data, ?int $except = null): void
    {
        $service = Service::findOrFail($data['service_id']);
        if (!in_array($data['appointment_time'], $this->slots($service, $data['appointment_date'], $except), true)) {
            throw ValidationException::withMessages([
                'appointment_time' => 'Ce créneau est indisponible. Veuillez choisir une autre heure.',
            ]);
        }
    }
}
