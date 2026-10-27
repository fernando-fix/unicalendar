<?php

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Carbon;

test('dashboard attaches upcoming_events_count per calendar', function () {
    Carbon::setTestNow('2026-10-26 12:00:00');

    $user = User::factory()->create();

    $calendarWithFuture = Calendar::factory()->create(['owner_id' => $user->id]);
    $user->calendars()->attach($calendarWithFuture->id, ['role' => 'owner']);

    $calendarWithoutEvents = Calendar::factory()->create(['owner_id' => $user->id]);
    $user->calendars()->attach($calendarWithoutEvents->id, ['role' => 'owner']);

    $calendarWithOnlyPast = Calendar::factory()->create(['owner_id' => $user->id]);
    $user->calendars()->attach($calendarWithOnlyPast->id, ['role' => 'owner']);

    // 2 eventos futuros + 1 evento passado no mesmo calendário
    Event::factory()->count(2)->create([
        'calendar_id' => $calendarWithFuture->id,
        'creator_id' => $user->id,
        'start_at' => Carbon::now()->addDays(2),
    ]);
    Event::factory()->create([
        'calendar_id' => $calendarWithFuture->id,
        'creator_id' => $user->id,
        'start_at' => Carbon::now()->subDays(2),
    ]);
    Event::factory()->create([
        'calendar_id' => $calendarWithOnlyPast->id,
        'creator_id' => $user->id,
        'start_at' => Carbon::now()->subDays(1),
    ]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('allCalendars', function ($calendars) use ($calendarWithFuture, $calendarWithoutEvents, $calendarWithOnlyPast) {
            $byId = collect($calendars)->keyBy('id');

            return $byId[$calendarWithFuture->id]['upcoming_events_count'] === 2
                && $byId[$calendarWithoutEvents->id]['upcoming_events_count'] === 0
                && $byId[$calendarWithOnlyPast->id]['upcoming_events_count'] === 0;
        })
    );

    Carbon::setTestNow();
});

test('dashboard upcoming count considers only future events', function () {
    Carbon::setTestNow('2026-10-26 12:00:00');

    $user = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $user->id]);
    $user->calendars()->attach($calendar->id, ['role' => 'owner']);

    Event::factory()->count(3)->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $user->id,
        'start_at' => Carbon::now()->subDays(5),
    ]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('allCalendars.0.upcoming_events_count', 0)
    );

    Carbon::setTestNow();
});

test('dashboard groups calendars from owned and member perspectives', function () {
    Carbon::setTestNow('2026-10-26 12:00:00');

    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
        'start_at' => Carbon::now()->addDays(1),
    ]);

    $this->actingAs($member);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('allCalendars.0.id', $calendar->id)
        ->where('allCalendars.0.upcoming_events_count', 1)
    );

    Carbon::setTestNow();
});
