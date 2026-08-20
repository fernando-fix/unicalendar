<?php

namespace Database\Seeders;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $ana = User::where('email', 'ana@example.com')->first();
        $bruno = User::where('email', 'bruno@example.com')->first();

        $software = Calendar::where('slug', 'trabalho-de-engenharia-de-software')->first();
        $database = Calendar::where('slug', 'grupo-de-estudos-database')->first();

        // Calendar 1: Trabalho de Engenharia de Software
        Event::create([
            'calendar_id' => $software->id,
            'creator_id' => $ana->id,
            'title' => 'Reunião de planejamento',
            'description' => 'Reunião para planejamento do trabalho de engenharia de software.',
            'type' => 'meeting',
            'start_at' => Carbon::now()->addDays(3)->setTime(14, 0),
            'end_at' => Carbon::now()->addDays(3)->setTime(15, 30),
            'location' => 'Sala 101',
        ]);

        Event::create([
            'calendar_id' => $software->id,
            'creator_id' => $ana->id,
            'title' => 'Entrega do capítulo 1',
            'description' => 'Prazo para entrega do primeiro capítulo do trabalho.',
            'type' => 'deadline',
            'start_at' => Carbon::now()->addDays(7)->setTime(23, 59),
            'location' => null,
        ]);

        Event::create([
            'calendar_id' => $software->id,
            'creator_id' => $bruno->id,
            'title' => 'Prova parcial',
            'description' => 'Prova parcial da disciplina de Engenharia de Software.',
            'type' => 'exam',
            'start_at' => Carbon::now()->addDays(14)->setTime(9, 0),
            'end_at' => Carbon::now()->addDays(14)->setTime(11, 0),
            'location' => 'Auditório B',
        ]);

        Event::create([
            'calendar_id' => $software->id,
            'creator_id' => $ana->id,
            'title' => 'Apresentação do projeto',
            'description' => 'Apresentação final do projeto de Engenharia de Software.',
            'type' => 'presentation',
            'start_at' => Carbon::now()->addDays(21)->setTime(10, 0),
            'end_at' => Carbon::now()->addDays(21)->setTime(12, 0),
            'location' => 'Sala de apresentações',
        ]);

        Event::create([
            'calendar_id' => $software->id,
            'creator_id' => $bruno->id,
            'title' => 'Reunião de acompanhamento',
            'description' => 'Reunião de acompanhamento do progresso do trabalho.',
            'type' => 'meeting',
            'start_at' => Carbon::now()->addDays(5)->setTime(16, 0),
            'end_at' => Carbon::now()->addDays(5)->setTime(17, 0),
            'location' => 'Sala 202',
        ]);

        // Calendar 2: Grupo de Estudos Database
        Event::create([
            'calendar_id' => $database->id,
            'creator_id' => $bruno->id,
            'title' => 'Estudo de SQL',
            'description' => 'Sessão de estudo sobre consultas SQL avançadas.',
            'type' => 'meeting',
            'start_at' => Carbon::now()->addDays(2)->setTime(18, 0),
            'end_at' => Carbon::now()->addDays(2)->setTime(20, 0),
            'location' => 'Biblioteca Central',
        ]);

        Event::create([
            'calendar_id' => $database->id,
            'creator_id' => $ana->id,
            'title' => 'Revisão de normalização',
            'description' => 'Revisão de conceitos de normalização de bancos de dados.',
            'type' => 'event',
            'start_at' => Carbon::now()->addDays(10)->setTime(19, 0),
            'end_at' => Carbon::now()->addDays(10)->setTime(21, 0),
            'location' => null,
        ]);
    }
}
