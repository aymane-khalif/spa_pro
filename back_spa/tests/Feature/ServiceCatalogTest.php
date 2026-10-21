<?php

namespace Tests\Feature;

use App\Models\Service;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ServiceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_is_repeatable_preserves_edits_and_creates_no_customers(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->assertDatabaseCount('services', 6);
        foreach (['users', 'clients', 'appointments', 'messages'] as $table) {
            $this->assertDatabaseCount($table, 0);
        }

        $service = Service::where('name', 'Relaxing Massage')->firstOrFail();
        $service->update(['price' => 275, 'duration' => 75]);
        $this->seed(ServiceSeeder::class);
        $this->assertDatabaseCount('services', 6);
        $this->assertDatabaseHas('services', ['id' => $service->id, 'price' => 275, 'duration' => 75]);
        $this->getJson('/api/services')->assertOk()->assertJsonCount(6);
    }
}
