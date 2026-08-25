<?php

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Carbon;

test('owner can create events in batch', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner);
    $response = $this->post(route('events.store-batch', $calendar->uuid), [
        'title' => 'Serie de reunioes',
        'summary' => 'Resumo da serie',
        'type' => 'meeting',
        'location' => 'Room 101',
        'dates' => [
            [
                'start_at' => Carbon::now()->addDays(1)->toIso8601String(),
                'end_at' => Carbon::now()->addDays(1)->addHour()->toIso8601String(),
            ],
            [
                'start_at' => Carbon::now()->addDays(2)->toIso8601String(),
                'end_at' => null,
            ],
        ],
    ]);

    $response->assertRedirect();

    $events = Event::query()
        ->where('calendar_id', $calendar->id)
        ->where('title', 'Serie de reunioes')
        ->get();

    expect($events)->toHaveCount(2);
    expect($events->every(fn (Event $event) => $event->summary === 'Resumo da serie'))->toBeTrue();
    expect($events->every(fn (Event $event) => $event->location === 'Room 101'))->toBeTrue();
    expect($events->pluck('start_at')->map->format('Y-m-d')->unique())->toHaveCount(2);
});

test('member can create events in batch when allowed', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create([
        'owner_id' => $owner->id,
        'allow_member_event_creation' => true,
    ]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member);
    $response = $this->post(route('events.store-batch', $calendar->uuid), [
        'title' => 'Evento do membro',
        'type' => 'event',
        'dates' => [
            ['start_at' => Carbon::now()->addDays(3)->toIso8601String()],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'calendar_id' => $calendar->id,
        'title' => 'Evento do membro',
        'creator_id' => $member->id,
    ]);
});

test('member cannot create events in batch when not allowed', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create([
        'owner_id' => $owner->id,
        'allow_member_event_creation' => false,
    ]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member);
    $response = $this->post(route('events.store-batch', $calendar->uuid), [
        'title' => 'Evento proibido',
        'type' => 'event',
        'dates' => [
            ['start_at' => Carbon::now()->addDays(3)->toIso8601String()],
        ],
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('events', ['title' => 'Evento proibido']);
});

test('batch creation validates required fields', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner);
    $response = $this->post(route('events.store-batch', $calendar->uuid), []);

    $response->assertSessionHasErrors(['title', 'type', 'dates']);
});
