<?php

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Carbon;

test('owner can create event', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner);
    $response = $this->post(route('events.store', $calendar->uuid), [
        'title' => 'Team Meeting',
        'description' => 'Weekly sync',
        'type' => 'meeting',
        'start_at' => Carbon::now()->addDays(1)->toIso8601String(),
        'end_at' => Carbon::now()->addDays(1)->addHours(1)->toIso8601String(),
        'location' => 'Room 101',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'calendar_id' => $calendar->id,
        'title' => 'Team Meeting',
        'type' => 'meeting',
    ]);
});

test('member can create event when allowed', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create([
        'owner_id' => $owner->id,
        'allow_member_event_creation' => true,
    ]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member);
    $response = $this->post(route('events.store', $calendar->uuid), [
        'title' => 'Member Event',
        'type' => 'event',
        'start_at' => Carbon::now()->addDays(2)->toIso8601String(),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'calendar_id' => $calendar->id,
        'title' => 'Member Event',
    ]);
});

test('member cannot create event when not allowed', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create([
        'owner_id' => $owner->id,
        'allow_member_event_creation' => false,
    ]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member);
    $response = $this->post(route('events.store', $calendar->uuid), [
        'title' => 'Member Event',
        'type' => 'event',
        'start_at' => Carbon::now()->addDays(2)->toIso8601String(),
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('events', [
        'calendar_id' => $calendar->id,
        'title' => 'Member Event',
    ]);
});

test('event creation validates required fields', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner);
    $response = $this->post(route('events.store', $calendar->uuid), []);

    $response->assertSessionHasErrors(['title', 'type', 'start_at']);
});

test('event end_at cannot be before start_at', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner);
    $response = $this->post(route('events.store', $calendar->uuid), [
        'title' => 'Event',
        'type' => 'meeting',
        'start_at' => Carbon::now()->addDays(5)->toIso8601String(),
        'end_at' => Carbon::now()->addDays(1)->toIso8601String(),
    ]);

    $response->assertSessionHasErrors('end_at');
});

test('owner can update event', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
    ]);

    $this->actingAs($owner);
    $response = $this->put(route('events.update', [$calendar->uuid, $event->id]), [
        'title' => 'Updated Title',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'title' => 'Updated Title',
    ]);
});

test('creator can update own event', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $creator = User::factory()->create();
    $calendar->members()->attach($creator->id, ['role' => 'member']);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $creator->id,
    ]);

    $this->actingAs($creator);
    $response = $this->put(route('events.update', [$calendar->uuid, $event->id]), [
        'title' => 'Creator Updated',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'title' => 'Creator Updated',
    ]);
});

test('non-owner non-creator cannot update event', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $creator = User::factory()->create();
    $calendar->members()->attach($creator->id, ['role' => 'member']);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $creator->id,
    ]);

    $otherMember = User::factory()->create();
    $calendar->members()->attach($otherMember->id, ['role' => 'member']);

    $this->actingAs($otherMember);
    $response = $this->put(route('events.update', [$calendar->uuid, $event->id]), [
        'title' => 'Hacked Title',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseHas('events', [
        'id' => $event->id,
        'title' => $event->title,
    ]);
});

test('owner can delete event', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
    ]);

    $this->actingAs($owner);
    $response = $this->delete(route('events.destroy', [$calendar->uuid, $event->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('events', ['id' => $event->id]);
});

test('event page shows event details', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'title' => 'Important Meeting',
    ]);

    $response = $this->get(route('events.show', [$calendar->uuid, $event->id]));

    $response->assertOk();
});
