<?php

use App\Models\Calendar;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('import page is accessible', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('calendars.import'));

    $response->assertOk();
});

test('unauthenticated users cannot access import page', function () {
    $response = $this->get(route('calendars.import'));

    $response->assertRedirect('/login');
});

test('user can import a valid ICS file', function () {
    $user = User::factory()->create();

    $icsContent = file_get_contents(__DIR__.'/../../Fixtures/sample.ics');
    $file = UploadedFile::fake()->createWithContent('calendar.ics', $icsContent);

    $response = $this->actingAs($user)->post(route('calendars.import'), [
        'ics_file' => $file,
        'name' => 'Meu Calendário Importado',
        'visibility' => 'private',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('calendars', [
        'owner_id' => $user->id,
        'name' => 'Meu Calendário Importado',
        'visibility' => 'private',
    ]);

    $calendar = Calendar::where('owner_id', $user->id)->first();
    $this->assertGreaterThan(0, $calendar->events()->count());
});

test('user can import ICS without providing a name', function () {
    $user = User::factory()->create();

    $icsContent = file_get_contents(__DIR__.'/../../Fixtures/sample.ics');
    $file = UploadedFile::fake()->createWithContent('calendar.ics', $icsContent);

    $response = $this->actingAs($user)->post(route('calendars.import'), [
        'ics_file' => $file,
        'visibility' => 'public',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('calendars', [
        'owner_id' => $user->id,
        'name' => 'Calendário de Teste',
        'visibility' => 'public',
    ]);
});

test('user cannot import an ICS file with no events', function () {
    $user = User::factory()->create();

    $icsContent = file_get_contents(__DIR__.'/../../Fixtures/empty.ics');
    $file = UploadedFile::fake()->createWithContent('empty.ics', $icsContent);

    $response = $this->actingAs($user)->post(route('calendars.import'), [
        'ics_file' => $file,
        'visibility' => 'public',
    ]);

    $response->assertSessionHasErrors('ics_file');
});

test('user cannot import without a file', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('calendars.import'), [
        'visibility' => 'public',
    ]);

    $response->assertSessionHasErrors('ics_file');
});

test('user is set as owner of imported calendar', function () {
    $user = User::factory()->create();

    $icsContent = file_get_contents(__DIR__.'/../../Fixtures/sample.ics');
    $file = UploadedFile::fake()->createWithContent('calendar.ics', $icsContent);

    $this->actingAs($user)->post(route('calendars.import'), [
        'ics_file' => $file,
        'visibility' => 'public',
    ]);

    $calendar = Calendar::where('owner_id', $user->id)->first();
    $this->assertTrue($calendar->hasMember($user));
    $this->assertEquals('owner', $calendar->getMemberRole($user));
});
