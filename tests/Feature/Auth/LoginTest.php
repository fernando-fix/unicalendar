<?php

use App\Models\Calendar;
use App\Models\User;

test('login page is accessible', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can login using correct credentials', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response = $this->post(route('login'), [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($user);
});

test('users are redirected back to the calendar after login when redirect is provided', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);
    $calendar = Calendar::factory()->create();

    $response = $this->post(route('login'), [
        'email' => 'test@example.com',
        'password' => 'password123',
        'redirect' => "/calendar/{$calendar->uuid}",
    ]);

    $response->assertRedirect("/calendar/{$calendar->uuid}");
    $this->assertAuthenticatedAs($user);
});

test('external redirect targets are rejected after login', function () {
    User::factory()->create([
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response = $this->post(route('login'), [
        'email' => 'test@example.com',
        'password' => 'password123',
        'redirect' => 'https://evil.example.com/calendar',
    ]);

    $response->assertRedirect(route('dashboard'));
});

test('users cannot login with incorrect credentials', function () {
    User::factory()->create([
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response = $this->post(route('login'), [
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $this->actingAs($user);
    $response = $this->post(route('logout'));

    $response->assertRedirect(route('home'));
    $this->assertGuest();
});
