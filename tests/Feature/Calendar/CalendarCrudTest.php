<?php

use App\Models\Calendar;
use App\Models\User;

test('authenticated user can create a calendar', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->post(route('calendars.store'), [
        'name' => 'My Calendar',
        'description' => 'A test calendar',
        'visibility' => 'public',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('calendars', [
        'name' => 'My Calendar',
        'visibility' => 'public',
        'owner_id' => $user->id,
    ]);
    $this->assertDatabaseHas('calendar_user', [
        'user_id' => $user->id,
        'role' => 'owner',
    ]);
});

test('calendar creation generates unique slug', function () {
    Calendar::factory()->create(['slug' => 'my-calendar']);

    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('calendars.store'), [
        'name' => 'My Calendar',
        'description' => null,
        'visibility' => 'public',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('calendars', [
        'name' => 'My Calendar',
        'slug' => 'my-calendar-1',
    ]);
});

test('calendar page is accessible for public calendars', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);

    $response = $this->get(route('calendars.show', $calendar->slug));

    $response->assertOk();
});

test('private calendar is not accessible to non-members', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'private']);
    $nonMember = User::factory()->create();

    $this->actingAs($nonMember);
    $response = $this->get(route('calendars.show', $calendar->slug));

    $response->assertForbidden();
});

test('private calendar is accessible to members', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'private']);
    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member);
    $response = $this->get(route('calendars.show', $calendar->slug));

    $response->assertOk();
});

test('owner can update calendar settings', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $owner = User::factory()->create();
    $calendar->members()->attach($owner->id, ['role' => 'owner']);
    $calendar->update(['owner_id' => $owner->id]);

    $this->actingAs($owner);
    $response = $this->put(route('calendars.update', $calendar->slug), [
        'name' => 'Updated Name',
        'visibility' => 'private',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('calendars', [
        'id' => $calendar->id,
        'name' => 'Updated Name',
        'visibility' => 'private',
    ]);
});

test('owner can delete calendar', function () {
    $calendar = Calendar::factory()->create();
    $owner = User::factory()->create();
    $calendar->members()->attach($owner->id, ['role' => 'owner']);
    $calendar->update(['owner_id' => $owner->id]);

    $this->actingAs($owner);
    $response = $this->delete(route('calendars.destroy', $calendar->slug));

    $response->assertRedirect(route('dashboard'));
    $this->assertDatabaseMissing('calendars', ['id' => $calendar->id]);
});

test('non-owner cannot delete calendar', function () {
    $calendar = Calendar::factory()->create();
    $owner = User::factory()->create();
    $calendar->members()->attach($owner->id, ['role' => 'owner']);
    $calendar->update(['owner_id' => $owner->id]);

    $nonOwner = User::factory()->create();
    $calendar->members()->attach($nonOwner->id, ['role' => 'member']);

    $this->actingAs($nonOwner);
    $response = $this->delete(route('calendars.destroy', $calendar->slug));

    $this->assertDatabaseHas('calendars', ['id' => $calendar->id]);
});

test('user can join a public calendar', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $user = User::factory()->create();

    $this->actingAs($user);
    $response = $this->post(route('calendars.join', $calendar->slug));

    $response->assertRedirect();
    $this->assertDatabaseHas('calendar_user', [
        'calendar_id' => $calendar->id,
        'user_id' => $user->id,
        'role' => 'member',
    ]);
});

test('user can leave a calendar they are member of', function () {
    $calendar = Calendar::factory()->create();
    $owner = User::factory()->create();
    $calendar->members()->attach($owner->id, ['role' => 'owner']);
    $calendar->update(['owner_id' => $owner->id]);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member);
    $response = $this->delete(route('calendars.leave', $calendar->slug));

    $response->assertRedirect();
    $this->assertDatabaseMissing('calendar_user', [
        'calendar_id' => $calendar->id,
        'user_id' => $member->id,
    ]);
});

test('owner cannot leave their own calendar', function () {
    $calendar = Calendar::factory()->create();
    $owner = User::factory()->create();
    $calendar->members()->attach($owner->id, ['role' => 'owner']);
    $calendar->update(['owner_id' => $owner->id]);

    $this->actingAs($owner);
    $response = $this->delete(route('calendars.leave', $calendar->slug));

    $response->assertRedirect();
    $this->assertDatabaseHas('calendar_user', [
        'calendar_id' => $calendar->id,
        'user_id' => $owner->id,
    ]);
});
