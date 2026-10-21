<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // Original names, descriptions and prices from the first Home page.
        // Durations are proposed defaults: the original database values were unavailable.
        $services = [
            ['name' => 'Relaxing Massage', 'description' => 'A relaxing treatment to release stress and restore your energy.', 'price' => 250, 'duration' => 60],
            ['name' => 'Facial Treatment', 'description' => 'A refreshing facial treatment for healthy and glowing skin.', 'price' => 200, 'duration' => 45],
            ['name' => 'Body Care', 'description' => 'A complete wellness experience for your body and mind.', 'price' => 220, 'duration' => 60],
            ['name' => 'Aromatherapy', 'description' => 'A soothing treatment with relaxing essential oils for body and mind.', 'price' => 230, 'duration' => 60],
            ['name' => 'Hammam Spa', 'description' => 'A traditional wellness ritual with steam, black soap and gentle exfoliation.', 'price' => 180, 'duration' => 60],
            ['name' => 'Signature Head Massage', 'description' => 'A soothing head massage to release tension and promote deep relaxation.', 'price' => 150, 'duration' => 30],
        ];

        DB::transaction(function () use ($services): void {
            foreach ($services as $service) {
                // Preserve IDs, bookings and any later changes to existing services.
                Service::firstOrCreate(['name' => $service['name']], $service);
            }
        });
    }
}
