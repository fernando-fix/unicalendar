<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventDraftRequest;
use App\Http\Requests\UpdateEventDraftRequest;
use App\Models\Calendar;
use App\Models\EventDraft;
use Inertia\Inertia;

class EventDraftController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $editableCalendarIds = $this->editableCalendarsFor($user)->pluck('id');

        $drafts = EventDraft::query()
            ->with('calendar:id,uuid,name')
            ->where(function ($query) use ($user, $editableCalendarIds) {
                $query->where('creator_id', $user->id)
                    ->orWhereIn('calendar_id', $editableCalendarIds);
            })
            ->latest('updated_at')
            ->get();

        return Inertia::render('drafts/index', [
            'drafts' => $drafts,
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        $calendars = $this->editableCalendarsFor($user)->get();

        return Inertia::render('drafts/create', [
            'calendars' => $calendars,
        ]);
    }

    public function store(StoreEventDraftRequest $request)
    {
        $calendar = Calendar::query()->findOrFail($request->integer('calendar_id'));
        $this->authorize('create', [EventDraft::class, $calendar]);

        $draft = EventDraft::create([
            'calendar_id' => $calendar->id,
            'creator_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'summary' => $request->summary,
            'type' => $request->type,
            'start_at' => $request->start_at,
            'location' => $request->location,
            'meeting_url' => $request->meeting_url,
        ]);

        return redirect()
            ->route('drafts.index')
            ->with('success', 'Rascunho salvo com sucesso.');
    }

    public function edit(EventDraft $draft)
    {
        $this->authorize('update', $draft);

        $user = auth()->user();

        $calendars = $this->editableCalendarsFor($user)->get();

        return Inertia::render('drafts/edit', [
            'draft' => $draft->load('calendar:id,uuid,name'),
            'calendars' => $calendars,
        ]);
    }

    public function update(UpdateEventDraftRequest $request, EventDraft $draft)
    {
        $this->authorize('update', $draft);

        $draft->update($request->validated());

        return redirect()
            ->route('drafts.index')
            ->with('success', 'Rascunho atualizado.');
    }

    public function destroy(EventDraft $draft)
    {
        $this->authorize('delete', $draft);

        $draft->delete();

        return redirect()
            ->route('drafts.index')
            ->with('success', 'Rascunho excluído.');
    }

    private function editableCalendarsFor($user)
    {
        return Calendar::query()
            ->where('owner_id', $user->id)
            ->orWhere(function ($query) use ($user) {
                $query->where('allow_member_event_creation', true)
                    ->whereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            });
    }
}
