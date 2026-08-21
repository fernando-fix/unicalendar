<?php

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;

test('home page is accessible', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});

test('home page displays platform stats', function () {
    $users = User::factory()->count(2)->create();

    Calendar::factory()->count(3)->create(['owner_id' => $users->first()->id]);

    Event::factory()->count(7)->create([
        'calendar_id' => Calendar::first()->id,
        'creator_id' => $users->last()->id,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();

    $page = $response->viewData('page');

    expect($page['props']['stats']['users'])->toBe(2)
        ->and($page['props']['stats']['calendars'])->toBe(3)
        ->and($page['props']['stats']['events'])->toBe(7);
});
