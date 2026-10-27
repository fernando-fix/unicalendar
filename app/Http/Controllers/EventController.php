<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBatchEventRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Http\Requests\UpdateEventSummaryRequest;
use App\Models\Calendar;
use App\Models\Event;
use App\Models\EventDraft;
use App\Notifications\EventNotification;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class EventController extends Controller
{
    public function quickCreate()
    {
        $user = auth()->user();

        $calendars = Calendar::query()
            ->where('owner_id', $user->id)
            ->orWhere(function ($query) use ($user) {
                $query->where('allow_member_event_creation', true)
                    ->whereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            })
            ->get();

        return Inertia::render('event/quick-create', [
            'calendars' => $calendars,
            'date' => request()->query('date'),
            'draft' => $this->resolveDraft(request()->integer('from_draft'), $user->id),
        ]);
    }

    public function storeBatch(StoreBatchEventRequest $request, Calendar $calendar)
    {
        $this->authorize('create', [Event::class, $calendar]);

        $user = auth()->user();
        $createdEvents = [];

        foreach ($request->dates as $date) {
            $event = $calendar->events()->create([
                'creator_id' => $user->id,
                'title' => $request->title,
                'description' => $request->description,
                'summary' => $request->summary,
                'type' => $request->type,
                'start_at' => $date['start_at'],
                'end_at' => $date['end_at'] ?? null,
                'location' => $request->location,
                'meeting_url' => $request->meeting_url,
            ]);

            $createdEvents[] = $event;
        }

        foreach ($createdEvents as $event) {
            $this->notifyMembers($calendar, $event, 'created');
        }

        return redirect()->route('calendars.show', $calendar->uuid)
            ->with('success', count($createdEvents).' eventos criados com sucesso.');
    }

    public function create(Calendar $calendar)
    {
        $this->authorize('create', [Event::class, $calendar]);

        return Inertia::render('event/create', [
            'calendar' => $calendar,
            'date' => request()->query('date'),
            'draft' => $this->resolveDraft(request()->integer('from_draft'), auth()->id()),
        ]);
    }

    public function store(StoreEventRequest $request, Calendar $calendar)
    {
        $this->authorize('create', [Event::class, $calendar]);

        $event = $calendar->events()->create([
            'creator_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'summary' => $request->summary,
            'type' => $request->type,
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'location' => $request->location,
            'meeting_url' => $request->meeting_url,
        ]);

        $this->notifyMembers($calendar, $event, 'created');

        return redirect()->route('events.show', [$calendar->uuid, $event->id]);
    }

    public function show(Calendar $calendar, Event $event)
    {
        $event->load(['creator', 'attendees', 'comments.user']);

        $userAttendance = null;
        if (auth()->check()) {
            $userAttendance = $event->attendees()
                ->where('user_id', auth()->id())
                ->first()?->pivot?->status;
        }

        return Inertia::render('event/show', [
            'calendar' => $calendar,
            'event' => $event,
            'userAttendance' => $userAttendance,
            'canEditSummary' => auth()->check() && auth()->user()->can('updateSummary', $event),
        ]);
    }

    public function edit(Calendar $calendar, Event $event)
    {
        $this->authorize('update', $event);

        return Inertia::render('event/edit', [
            'calendar' => $calendar,
            'event' => $event,
        ]);
    }

    public function update(UpdateEventRequest $request, Calendar $calendar, Event $event)
    {
        $this->authorize('update', $event);

        $event->update($request->validated());

        $this->notifyMembers($calendar, $event, 'updated');

        return redirect()->route('events.show', [$calendar->uuid, $event->id]);
    }

    public function updateSummary(UpdateEventSummaryRequest $request, Calendar $calendar, Event $event)
    {
        $this->authorize('updateSummary', $event);

        $event->update($request->validated());

        return redirect()->route('events.show', [$calendar->uuid, $event->id]);
    }

    public function destroy(Calendar $calendar, Event $event)
    {
        $this->authorize('delete', $event);

        $this->notifyMembers($calendar, $event, 'deleted');

        $event->delete();

        return redirect()->route('calendars.show', $calendar->uuid);
    }

    public function saveAsDraft(Calendar $calendar, Event $event)
    {
        $this->authorize('create', [EventDraft::class, $calendar]);

        EventDraft::create([
            'calendar_id' => $calendar->id,
            'creator_id' => auth()->id(),
            'title' => $event->title,
            'description' => $event->description,
            'summary' => $event->summary,
            'type' => $event->type,
            'start_at' => null,
            'location' => $event->location,
            'meeting_url' => $event->meeting_url,
        ]);

        return redirect()
            ->route('drafts.index')
            ->with('success', 'Rascunho criado a partir deste evento.');
    }

    private function notifyMembers(Calendar $calendar, Event $event, string $action): void
    {
        $members = $calendar->members()->get();

        foreach ($members as $member) {
            if ($member->id === auth()->id()) {
                continue;
            }

            $preference = $member->notificationPreference;

            if (! $preference) {
                continue;
            }

            $shouldNotify = match ($action) {
                'created' => $preference->new_events,
                'updated' => $preference->event_updates,
                'deleted' => $preference->event_deletions,
                default => false,
            };

            if ($shouldNotify) {
                Notification::send($member, new EventNotification($event, $action));
            }
        }
    }

    private function resolveDraft(int $draftId, int $userId): ?EventDraft
    {
        if ($draftId <= 0) {
            return null;
        }

        $draft = EventDraft::query()
            ->where('id', $draftId)
            ->where('creator_id', $userId)
            ->first();

        return $draft;
    }
}
