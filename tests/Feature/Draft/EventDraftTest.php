<?php

use App\Models\Calendar;
use App\Models\Event;
use App\Models\EventDraft;
use App\Models\User;

test('owner can create an event draft', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner);

    $response = $this->post(route('drafts.store'), [
        'calendar_id' => $calendar->id,
        'title' => 'Avaliação de Cálculo',
        'description' => 'Prova bimestral.',
        'type' => 'exam',
        'location' => 'Sala 12',
    ]);

    $response->assertRedirect(route('drafts.index'));
    $this->assertDatabaseHas('event_drafts', [
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
        'title' => 'Avaliação de Cálculo',
        'type' => 'exam',
        'start_at' => null,
    ]);
});

test('draft allows null start_at', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner);

    $response = $this->post(route('drafts.store'), [
        'calendar_id' => $calendar->id,
        'title' => 'Rascunho sem data',
        'type' => 'meeting',
    ]);

    $response->assertRedirect(route('drafts.index'));
    expect(EventDraft::first())->not->toBeNull();
    expect(EventDraft::first()->start_at)->toBeNull();
});

test('draft requires title and type', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner);

    $response = $this->post(route('drafts.store'), [
        'calendar_id' => $calendar->id,
    ]);

    $response->assertSessionHasErrors(['title', 'type']);
});

test('member cannot create draft in calendar that disallows member events', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create([
        'owner_id' => $owner->id,
        'allow_member_event_creation' => false,
    ]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member);

    $response = $this->post(route('drafts.store'), [
        'calendar_id' => $calendar->id,
        'title' => 'Tentativa',
        'type' => 'event',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('event_drafts', ['title' => 'Tentativa']);
});

test('owner of draft can edit it', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $draft = EventDraft::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
        'title' => 'Antigo',
    ]);

    $this->actingAs($owner);

    $response = $this->put(route('drafts.update', $draft->id), [
        'title' => 'Novo título',
        'type' => 'meeting',
    ]);

    $response->assertRedirect(route('drafts.index'));
    $this->assertDatabaseHas('event_drafts', [
        'id' => $draft->id,
        'title' => 'Novo título',
    ]);
});

test('creator can destroy own draft', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $draft = EventDraft::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
    ]);

    $this->actingAs($owner);

    $response = $this->delete(route('drafts.destroy', $draft->id));

    $response->assertRedirect(route('drafts.index'));
    $this->assertDatabaseMissing('event_drafts', ['id' => $draft->id]);
});

test('non-owner non-creator cannot edit draft', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $creator = User::factory()->create();
    $calendar->members()->attach($creator->id, ['role' => 'member']);

    $draft = EventDraft::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $creator->id,
        'title' => 'Original',
    ]);

    $other = User::factory()->create();
    $calendar->members()->attach($other->id, ['role' => 'member']);

    $this->actingAs($other);

    $response = $this->put(route('drafts.update', $draft->id), [
        'title' => 'Hackeado',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseHas('event_drafts', [
        'id' => $draft->id,
        'title' => 'Original',
    ]);
});

test('owner of calendar can override member draft', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $creator = User::factory()->create();
    $calendar->members()->attach($creator->id, ['role' => 'member']);

    $draft = EventDraft::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $creator->id,
        'title' => 'Original',
    ]);

    $this->actingAs($owner);

    $response = $this->put(route('drafts.update', $draft->id), [
        'title' => 'Atualizado pelo dono',
        'type' => $draft->type,
    ]);

    $response->assertRedirect(route('drafts.index'));
    $this->assertDatabaseHas('event_drafts', [
        'id' => $draft->id,
        'title' => 'Atualizado pelo dono',
    ]);
});

test('save-as-draft from event copies fields without start_at', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $event = Event::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
        'title' => 'Prova antiga',
        'description' => 'Conteúdo da prova antiga',
        'type' => 'exam',
        'location' => 'Sala 100',
        'meeting_url' => 'https://meet.example/prova',
    ]);

    $this->actingAs($owner);

    $response = $this->post(route('events.save-as-draft', [$calendar->uuid, $event->id]));

    $response->assertRedirect(route('drafts.index'));
    $this->assertDatabaseHas('event_drafts', [
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
        'title' => 'Prova antiga',
        'description' => 'Conteúdo da prova antiga',
        'type' => 'exam',
        'location' => 'Sala 100',
        'meeting_url' => 'https://meet.example/prova',
        'start_at' => null,
    ]);
});

test('event create route accepts from_draft and prefills values', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $draft = EventDraft::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $owner->id,
        'title' => 'Preenchido',
    ]);

    $this->actingAs($owner);

    $response = $this->get(route('events.create', $calendar->uuid).'?from_draft='.$draft->id);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('event/create')
        ->where('draft.id', $draft->id)
        ->where('draft.title', 'Preenchido')
    );
});

test('drafts index page lists only drafts of owned calendars', function () {
    $owner = User::factory()->create();
    $calendarA = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendarA->members()->attach($owner->id, ['role' => 'owner']);
    $calendarB = Calendar::factory()->create();
    $calendarB->members()->attach($calendarB->owner_id, ['role' => 'owner']);

    $mine = EventDraft::factory()->create([
        'calendar_id' => $calendarA->id,
        'creator_id' => $owner->id,
    ]);
    $other = EventDraft::factory()->create([
        'calendar_id' => $calendarB->id,
        'creator_id' => $calendarB->owner_id,
    ]);

    $this->actingAs($owner);

    $response = $this->get(route('drafts.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('drafts/index')
        ->where('drafts', fn ($drafts) => collect($drafts)->pluck('id')->contains($mine->id))
        ->where('drafts', fn ($drafts) => ! collect($drafts)->pluck('id')->contains($other->id))
    );
});

test('calendar owner sees member drafts in index', function () {
    $owner = User::factory()->create();
    $calendar = Calendar::factory()->create(['owner_id' => $owner->id]);
    $calendar->members()->attach($owner->id, ['role' => 'owner']);

    $member = User::factory()->create();
    $calendar->members()->attach($member->id, ['role' => 'member']);

    $memberDraft = EventDraft::factory()->create([
        'calendar_id' => $calendar->id,
        'creator_id' => $member->id,
        'title' => 'Rascunho do membro',
    ]);

    $strangerDraft = EventDraft::factory()->create([
        'title' => 'Rascunho de outro lado',
    ]);

    $this->actingAs($owner);

    $response = $this->get(route('drafts.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('drafts/index')
        ->where('drafts', fn ($drafts) => collect($drafts)->pluck('id')->contains($memberDraft->id))
        ->where('drafts', fn ($drafts) => ! collect($drafts)->pluck('id')->contains($strangerDraft->id))
    );
});
