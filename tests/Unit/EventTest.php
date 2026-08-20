<?php

use App\Models\Event;
use App\Models\User;

test('event type label is correct', function () {
    expect(Event::make(['type' => 'meeting'])->type_label)->toBe('Reunião');
    expect(Event::make(['type' => 'deadline'])->type_label)->toBe('Prazo');
    expect(Event::make(['type' => 'exam'])->type_label)->toBe('Prova');
    expect(Event::make(['type' => 'presentation'])->type_label)->toBe('Apresentação');
    expect(Event::make(['type' => 'event'])->type_label)->toBe('Evento');
    expect(Event::make(['type' => 'other'])->type_label)->toBe('Outro');
    expect(Event::make(['type' => 'unknown'])->type_label)->toBe('unknown');
});

test('event attendee count works', function () {
    $event = Event::factory()->create();

    $attending = User::factory()->count(2)->create();
    $maybe = User::factory()->count(1)->create();

    foreach ($attending as $user) {
        $event->attendees()->attach($user->id, ['status' => 'attending']);
    }

    foreach ($maybe as $user) {
        $event->attendees()->attach($user->id, ['status' => 'maybe']);
    }

    expect($event->getAttendeeCount('attending'))->toBe(2);
    expect($event->getAttendeeCount('maybe'))->toBe(1);
    expect($event->getAttendeeCount('not_attending'))->toBe(0);
});
