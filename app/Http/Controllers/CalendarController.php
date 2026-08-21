<?php

namespace App\Http\Controllers;

use App\Enums\CalendarRole;
use App\Http\Requests\StoreCalendarRequest;
use App\Http\Requests\UpdateCalendarRequest;
use App\Models\Calendar;
use App\Models\CalendarJoinRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function create()
    {
        return Inertia::render('calendar/create');
    }

    public function store(StoreCalendarRequest $request)
    {
        $user = Auth::user();

        $calendar = Calendar::create([
            'owner_id' => $user->id,
            'name' => $request->name,
            'slug' => Calendar::generateUniqueSlug($request->name),
            'description' => $request->description,
            'visibility' => $request->visibility,
            'color' => $request->color ?? 'blue',
        ]);

        $calendar->members()->attach($user->id, ['role' => CalendarRole::Owner->value]);

        return redirect()->route('calendars.show', $calendar->uuid);
    }

    public function show(Calendar $calendar)
    {
        $user = Auth::user();
        $isMember = $user !== null && $calendar->hasMember($user);

        $calendar->load(['owner']);

        $pendingRequest = null;
        if ($user !== null) {
            $pendingRequest = CalendarJoinRequest::where('calendar_id', $calendar->id)
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->first();
        }

        if (! $calendar->isPublic() && ! $isMember) {
            $pendingRequestsCount = $calendar->joinRequests()->where('status', 'pending')->count();

            return Inertia::render('calendar/show', [
                'calendar' => $calendar,
                'events' => [],
                'upcomingEvents' => [],
                'isMember' => false,
                'userRole' => null,
                'pendingRequest' => $pendingRequest,
                'pendingRequestsCount' => $pendingRequestsCount,
            ]);
        }

        $calendar->load(['members']);
        $calendar->load(['events' => function ($query) {
            $query->with(['creator', 'attendees'])->orderBy('start_at');
        }]);

        $userRole = $isMember ? $calendar->getMemberRole($user) : null;

        $upcomingEvents = $calendar->events()
            ->where('start_at', '>=', now())
            ->with(['creator', 'attendees'])
            ->orderBy('start_at')
            ->get();

        $pendingRequestsCount = $calendar->joinRequests()->where('status', 'pending')->count();

        return Inertia::render('calendar/show', [
            'calendar' => $calendar,
            'events' => $calendar->events,
            'upcomingEvents' => $upcomingEvents,
            'isMember' => $isMember,
            'userRole' => $userRole,
            'pendingRequest' => $pendingRequest,
            'pendingRequestsCount' => $pendingRequestsCount,
        ]);
    }

    public function update(UpdateCalendarRequest $request, Calendar $calendar)
    {
        $calendar->update($request->validated());

        return back();
    }

    public function destroy(Calendar $calendar)
    {
        $this->authorize('delete', $calendar);

        $calendar->delete();

        return redirect()->route('dashboard');
    }
}
