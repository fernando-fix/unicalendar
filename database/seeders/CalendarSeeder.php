<?php

namespace Database\Seeders;

use App\Models\Calendar;
use App\Models\User;
use Illuminate\Database\Seeder;

class CalendarSeeder extends Seeder
{
    public function run(): void
    {
        $ana = User::where('email', 'ana@example.com')->first();
        $bruno = User::where('email', 'bruno@example.com')->first();

        Calendar::create([
            'owner_id' => $ana->id,
            'name' => 'Trabalho de Engenharia de Software',
            'slug' => 'trabalho-de-engenharia-de-software',
            'description' => 'Calendário para o trabalho de Engenharia de Software da disciplina.',
            'visibility' => 'public',
            'allow_member_event_creation' => true,
        ]);

        Calendar::create([
            'owner_id' => $bruno->id,
            'name' => 'Grupo de Estudos Database',
            'slug' => 'grupo-de-estudos-database',
            'description' => 'Grupo de estudos focado em banco de dados.',
            'visibility' => 'private',
            'allow_member_event_creation' => true,
        ]);
    }
}
