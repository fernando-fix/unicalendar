<?php

use App\Models\Calendar;
use App\Models\Comment;
use App\Models\Event;
use App\Models\User;

test('authenticated user can comment on event', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);
    $user = User::factory()->create();

    $this->actingAs($user);
    $response = $this->post(route('comments.store', [$calendar->slug, $event->id]), [
        'body' => 'Great event!',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('comments', [
        'event_id' => $event->id,
        'user_id' => $user->id,
        'body' => 'Great event!',
    ]);
});

test('comment author can delete own comment', function () {
    $calendar = Calendar::factory()->create();
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);
    $user = User::factory()->create();
    $comment = Comment::factory()->create([
        'event_id' => $event->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user);
    $response = $this->delete(route('comments.destroy', [$calendar->slug, $event->id, $comment->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
});

test('calendar owner can delete any comment', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $event = Event::factory()->create(['calendar_id' => $calendar->id]);

    $commenter = User::factory()->create();
    $comment = Comment::factory()->create([
        'event_id' => $event->id,
        'user_id' => $commenter->id,
    ]);

    $this->actingAs($owner);
    $response = $this->delete(route('comments.destroy', [$calendar->slug, $event->id, $comment->id]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
});

test('non-author non-owner cannot delete comment', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $event = Event::factory()->create(['calendar_id' => $calendar->id]);

    $commenter = User::factory()->create();
    $comment = Comment::factory()->create([
        'event_id' => $event->id,
        'user_id' => $commenter->id,
    ]);

    $otherUser = User::factory()->create();
    $calendar->members()->attach($otherUser->id, ['role' => 'member']);

    $this->actingAs($otherUser);
    $response = $this->delete(route('comments.destroy', [$calendar->slug, $event->id, $comment->id]));

    $response->assertForbidden();
    $this->assertDatabaseHas('comments', ['id' => $comment->id]);
});

test('unauthenticated user cannot comment', function () {
    $calendar = Calendar::factory()->create(['visibility' => 'public']);
    $event = Event::factory()->create(['calendar_id' => $calendar->id]);

    $response = $this->post(route('comments.store', [$calendar->slug, $event->id]), [
        'body' => 'Nice!',
    ]);

    $response->assertRedirect('/login');
    $this->assertDatabaseMissing('comments', [
        'event_id' => $event->id,
    ]);
});
