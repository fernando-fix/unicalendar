<?php

use App\Models\Calendar;
use App\Models\User;

test('registration page is accessible', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register with valid data', function () {
    $response = $this->post(route('register'), [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'john@example.com',
        'name' => 'John Doe',
    ]);
    $this->assertDatabaseHas('notification_preferences', [
        'user_id' => User::where('email', 'john@example.com')->first()->id,
    ]);
});

test('new users are redirected back to the calendar after registration when redirect is provided', function () {
    $calendar = Calendar::factory()->create();

    $response = $this->post(route('register'), [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'redirect' => "/calendar/{$calendar->uuid}",
    ]);

    $response->assertRedirect("/calendar/{$calendar->uuid}");
    $this->assertAuthenticated();
});

test('external redirect targets are rejected after registration', function () {
    $response = $this->post(route('register'), [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'redirect' => '//evil.example.com/calendar',
    ]);

    $response->assertRedirect(route('dashboard'));
});

test('new users cannot register with invalid data', function () {
    $response = $this->post(route('register'), []);

    $response->assertSessionHasErrors(['name', 'email', 'password']);

    $response = $this->post(route('register'), [
        'name' => '',
        'email' => 'not-an-email',
        'password' => 'short',
    ]);

    $response->assertSessionHasErrors(['name', 'email', 'password']);

    $response = $this->post(route('register'), [
        'name' => 'John',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'different-password',
    ]);

    $response->assertSessionHasErrors('password');
});

test('new users cannot register with existing email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post(route('register'), [
        'name' => 'John Doe',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});
