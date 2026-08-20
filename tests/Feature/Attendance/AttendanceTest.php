<?php

use App\Models\Calendar;
use App\Models\Event;
use App\Models\EventAttendee;
use App\Models\User;

test('authenticated user can attend event', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);
    $user = User::factory()->create();

    $this->actingAs($user);
    $response = $this->post(route('events.attend', [$calendar->slug, $event->id]), [
        'status' => 'attending',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('event_attendees', [
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'attending',
    ]);
});

test('user can change attendance status', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);
    $user = User::factory()->create();

    $this->actingAs($user);

    $this->post(route('events.attend', [$calendar->slug, $event->id]), [
        'status' => 'attending',
    ]);

    $this->post(route('events.attend', [$calendar->slug, $event->id]), [
        'status' => 'maybe',
    ]);

    $this->assertDatabaseHas('event_attendees', [
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'maybe',
    ]);

    $this->assertDatabaseMissing('event_attendees', [
        'event_id' => $event->id,
        'user_id' => $user->id,
        'status' => 'attending',
    ]);
});

test('attendance summary shows correct counts', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);

    $attending = User::factory()->count(3)->create();
    $maybe = User::factory()->count(2)->create();
    $notAttending = User::factory()->count(1)->create();

    foreach ($attending as $user) {
        EventAttendee::factory()->create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'status' => 'attending',
        ]);
    }

    foreach ($maybe as $user) {
        EventAttendee::factory()->create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'status' => 'maybe',
        ]);
    }

    foreach ($notAttending as $user) {
        EventAttendee::factory()->create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'status' => 'not_attending',
        ]);
    }

    expect($event->getAttendeeCount('attending'))->toBe(3);
    expect($event->getAttendeeCount('maybe'))->toBe(2);
    expect($event->getAttendeeCount('not_attending'))->toBe(1);
});

test('unauthenticated user cannot attend event', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);

    $response = $this->post(route('events.attend', [$calendar->slug, $event->id]), [
        'status' => 'attending',
    ]);

    $response->assertRedirect('/login');
    $this->assertDatabaseMissing('event_attendees', [
        'event_id' => $event->id,
    ]);
});
