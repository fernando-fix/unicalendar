<?php

use App\Models\Calendar;
use App\Models\User;

test('calendar generates unique slugs', function () {
    Calendar::factory()->create(['slug' => 'team-meeting']);

    $slug = Calendar::generateUniqueSlug('team-meeting');
    expect($slug)->toBe('team-meeting-1');

    Calendar::factory()->create(['slug' => 'team-meeting-1']);

    $slug = Calendar::generateUniqueSlug('team-meeting');
    expect($slug)->toBe('team-meeting-2');
});

test('calendar detects membership', function () {
    $calendar = Calendar::factory()->create();
    $owner = User::factory()->create();
    $calendar->members()->attach($owner->id, ['role' => 'owner']);
    $calendar->update(['owner_id' => $owner->id]);

    $nonMember = User::factory()->create();

    expect($calendar->hasMember($owner))->toBeTrue();
    expect($calendar->hasMember($nonMember))->toBeFalse();
});

test('calendar detects ownership', function () {
    $calendar = Calendar::factory()->create();
    $owner = User::factory()->create();
    $calendar->update(['owner_id' => $owner->id]);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    expect($calendar->isOwnedBy($owner))->toBeTrue();
    expect($calendar->isOwnedBy($member))->toBeFalse();
});

test('calendar visibility check', function () {
    $publicCalendar = Calendar::factory()->create(['visibility' => 'public']);
    $privateCalendar = Calendar::factory()->create(['visibility' => 'private']);

    expect($publicCalendar->isPublic())->toBeTrue();
    expect($privateCalendar->isPublic())->toBeFalse();
});
