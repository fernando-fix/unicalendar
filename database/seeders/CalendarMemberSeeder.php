<?php

namespace Database\Seeders;

use App\Models\Calendar;
use App\Models\User;
use Illuminate\Database\Seeder;

class CalendarMemberSeeder extends Seeder
{
    public function run(): void
    {
        $ana = User::where('email', 'ana@example.com')->first();
        $bruno = User::where('email', 'bruno@example.com')->first();
        $carlos = User::where('email', 'carlos@example.com')->first();

        $software = Calendar::where('slug', 'trabalho-de-engenharia-de-software')->first();
        $database = Calendar::where('slug', 'grupo-de-estudos-database')->first();

        $software->members()->attach($ana->id, ['role' => 'owner']);
        $software->members()->attach($bruno->id, ['role' => 'member']);
        $software->members()->attach($carlos->id, ['role' => 'member']);

        $database->members()->attach($bruno->id, ['role' => 'owner']);
        $database->members()->attach($ana->id, ['role' => 'member']);
    }
}
