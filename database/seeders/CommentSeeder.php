<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        $ana = User::where('email', 'ana@example.com')->first();
        $bruno = User::where('email', 'bruno@example.com')->first();
        $carlos = User::where('email', 'carlos@example.com')->first();

        $reuniao = Event::where('title', 'Reunião de planejamento')->first();

        Comment::create([
            'event_id' => $reuniao->id,
            'user_id' => $ana->id,
            'body' => 'Não esqueçam de trazer os rascunhos do protótipo para a reunião.',
        ]);

        Comment::create([
            'event_id' => $reuniao->id,
            'user_id' => $bruno->id,
            'body' => 'Vou preparar a apresentação do cronograma atualizado.',
        ]);

        Comment::create([
            'event_id' => $reuniao->id,
            'user_id' => $carlos->id,
            'body' => 'Posso chegar 15 minutos atrasado, tenho aula até 13h45.',
        ]);
    }
}
