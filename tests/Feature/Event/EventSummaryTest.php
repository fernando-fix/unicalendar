<?php

use App\Models\Calendar;
use App\Models\Event;
use App\Models\EventAttendee;
use App\Models\User;
use Illuminate\Support\Carbon;

test('attendee can update event summary', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $creator = User::factory()->create();
    $calendar->members()->attach($creator->id, ['role' => 'member']);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $creator->id,
    ]);

    $attendee = User::factory()->create();
    $calendar->members()->attach($attendee->id, ['role' => 'member']);
    EventAttendee::factory()->create([
        'event_id' => $event->id,
        'user_id' => $attendee->id,
        'status' => 'attending',
    ]);

    $this->actingAs($attendee);
    $response = $this->put(route('events.update-summary', [$calendar->uuid, $event->id]), [
        'summary' => 'Resumo atualizado pelo participante.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'summary' => 'Resumo atualizado pelo participante.',
    ]);
});

test('attendee with maybe status can update event summary', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);

    $attendee = User::factory()->create();
    EventAttendee::factory()->create([
        'event_id' => $event->id,
        'user_id' => $attendee->id,
        'status' => 'maybe',
    ]);

    $this->actingAs($attendee);
    $response = $this->put(route('events.update-summary', [$calendar->uuid, $event->id]), [
        'summary' => 'Resumo de quem talvez vá.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'summary' => 'Resumo de quem talvez vá.',
    ]);
});

test('member who is not attendee cannot update event summary', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
    ]);

    $otherMember = User::factory()->create();
    $calendar->members()->attach($otherMember->id, ['role' => 'member']);

    $this->actingAs($otherMember);
    $response = $this->put(route('events.update-summary', [$calendar->uuid, $event->id]), [
        'summary' => 'Resumo invadido.',
    ]);

    $response->assertForbidden();
});

test('creator can update summary without being attendee', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);

    $creator = User::factory()->create();
    $calendar->members()->attach($creator->id, ['role' => 'member']);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $creator->id,
    ]);

    $this->actingAs($creator);
    $response = $this->put(route('events.update-summary', [$calendar->uuid, $event->id]), [
        'summary' => 'Resumo do criador.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'summary' => 'Resumo do criador.',
    ]);
});

test('calendar owner can update summary without being attendee', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => User::factory()->create()->id,
    ]);

    $this->actingAs($owner);
    $response = $this->put(route('events.update-summary', [$calendar->uuid, $event->id]), [
        'summary' => 'Resumo do dono.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'summary' => 'Resumo do dono.',
    ]);
});

test('attendee can clear event summary', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'summary' => 'Resumo antigo',
    ]);

    $attendee = User::factory()->create();
    EventAttendee::factory()->create([
        'event_id' => $event->id,
        'user_id' => $attendee->id,
        'status' => 'attending',
    ]);

    $this->actingAs($attendee);
    $response = $this->put(route('events.update-summary', [$calendar->uuid, $event->id]), [
        'summary' => '',
    ]);

    $response->assertRedirect();
    expect($event->fresh()->summary)->toBeNull();
});

test('unauthenticated user cannot update event summary', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);

    $response = $this->put(route('events.update-summary', [$calendar->uuid, $event->id]), [
        'summary' => 'Resumo anônimo.',
    ]);

    $response->assertRedirect('/login');
});

test('summary must be a string', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
    ]);

    $this->actingAs($owner);
    $response = $this->put(route('events.update-summary', [$calendar->uuid, $event->id]), [
        'summary' => ['not', 'a', 'string'],
    ]);

    $response->assertSessionHasErrors('summary');
});

test('event can be created with summary', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $summary = str_repeat('Resumo longo. ', 999).'Fim do resumo.';

    $this->actingAs($owner);
    $response = $this->post(route('events.store', $calendar->uuid), [
        'title' => 'Evento com resumo',
        'type' => 'meeting',
        'start_at' => Carbon::now()->addDays(1)->toIso8601String(),
        'summary' => $summary,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'title' => 'Evento com resumo',
        'summary' => $summary,
    ]);
});
