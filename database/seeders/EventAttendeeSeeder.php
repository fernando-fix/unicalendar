<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventAttendeeSeeder extends Seeder
{
    public function run(): void
    {
        $ana = User::where('email', 'ana@example.com')->first();
        $bruno = User::where('email', 'bruno@example.com')->first();
        $carlos = User::where('email', 'carlos@example.com')->first();

        // Reunião de planejamento (first event in calendar 1)
        $reuniao = Event::where('title', 'Reunião de planejamento')->first();
        $reuniao->attendees()->attach($bruno->id, ['status' => 'attending']);
        $reuniao->attendees()->attach($carlos->id, ['status' => 'attending']);

        // Entrega do capítulo 1
        $entrega = Event::where('title', 'Entrega do capítulo 1')->first();
        $entrega->attendees()->attach($carlos->id, ['status' => 'maybe']);
        $entrega->attendees()->attach($bruno->id, ['status' => 'attending']);

        // Prova parcial
        $prova = Event::where('title', 'Prova parcial')->first();
        $prova->attendees()->attach($ana->id, ['status' => 'attending']);
        $prova->attendees()->attach($carlos->id, ['status' => 'attending']);

        // Apresentação do projeto
        $apresentacao = Event::where('title', 'Apresentação do projeto')->first();
        $apresentacao->attendees()->attach($ana->id, ['status' => 'attending']);
        $apresentacao->attendees()->attach($bruno->id, ['status' => 'maybe']);
        $apresentacao->attendees()->attach($carlos->id, ['status' => 'attending']);

        // Reunião de acompanhamento
        $acompanhamento = Event::where('title', 'Reunião de acompanhamento')->first();
        $acompanhamento->attendees()->attach($ana->id, ['status' => 'attending']);
        $acompanhamento->attendees()->attach($carlos->id, ['status' => 'not_attending']);

        // Estudo de SQL (calendar 2)
        $estudoSql = Event::where('title', 'Estudo de SQL')->first();
        $estudoSql->attendees()->attach($ana->id, ['status' => 'attending']);

        // Revisão de normalização (calendar 2)
        $revisao = Event::where('title', 'Revisão de normalização')->first();
        $revisao->attendees()->attach($ana->id, ['status' => 'attending']);
        $revisao->attendees()->attach($bruno->id, ['status' => 'attending']);
    }
}
