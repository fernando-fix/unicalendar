<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('profile page is accessible', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('profile'));

    $response->assertOk();
});

test('unauthenticated users cannot access profile', function () {
    $response = $this->get(route('profile'));

    $response->assertRedirect('/login');
});

test('user can update profile with correct password', function () {
    $user = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'original@example.com',
        'password' => 'password123',
    ]);

    $response = $this->actingAs($user)->put(route('profile'), [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'current_password' => 'password123',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);
});

test('user cannot update profile with wrong password', function () {
    $user = User::factory()->create([
        'name' => 'Original Name',
        'password' => 'password123',
    ]);

    $response = $this->actingAs($user)->put(route('profile'), [
        'name' => 'Updated Name',
        'email' => $user->email,
        'current_password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('current_password');
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Original Name',
    ]);
});

test('user can change password with correct current password', function () {
    $user = User::factory()->create([
        'password' => 'password123',
    ]);

    $response = $this->actingAs($user)->put(route('password'), [
        'current_password' => 'password123',
        'password' => 'newpassword456',
        'password_confirmation' => 'newpassword456',
    ]);

    $response->assertRedirect();
    $this->assertTrue(
        Hash::check('newpassword456', $user->fresh()->password)
    );
});

test('user cannot change password with wrong current password', function () {
    $user = User::factory()->create([
        'password' => 'password123',
    ]);

    $response = $this->actingAs($user)->put(route('password'), [
        'current_password' => 'wrong-password',
        'password' => 'newpassword456',
        'password_confirmation' => 'newpassword456',
    ]);

    $response->assertSessionHasErrors('current_password');
    $this->assertTrue(
        Hash::check('password123', $user->fresh()->password)
    );
});

test('user cannot update profile with duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create(['email' => 'mine@example.com']);

    $response = $this->actingAs($user)->put(route('profile'), [
        'name' => $user->name,
        'email' => 'taken@example.com',
        'current_password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
});
