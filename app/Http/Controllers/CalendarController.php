<?php

namespace App\Http\Controllers;

use App\Enums\CalendarRole;
use App\Http\Requests\StoreCalendarRequest;
use App\Http\Requests\UpdateCalendarRequest;
use App\Models\Calendar;
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
        ]);

        $calendar->members()->attach($user->id, ['role' => CalendarRole::Owner->value]);

        return redirect()->route('calendars.show', $calendar->slug);
    }

    public function show(Calendar $calendar)
    {
        if (! $calendar->isPublic()) {
            $user = Auth::user();

            if ($user === null || ! $calendar->hasMember($user)) {
                abort(403);
            }
        }

        $calendar->load(['owner', 'members']);
        $calendar->load(['events' => function ($query) {
            $query->with(['creator', 'attendees'])->orderBy('start_at');
        }]);

        $user = Auth::user();
        $isMember = $user !== null && $calendar->hasMember($user);
        $userRole = $isMember ? $calendar->getMemberRole($user) : null;

        $upcomingEvents = $calendar->events()
            ->where('start_at', '>=', now())
            ->with(['creator', 'attendees'])
            ->orderBy('start_at')
            ->get();

        return Inertia::render('calendar/show', [
            'calendar' => $calendar,
            'events' => $calendar->events,
            'upcomingEvents' => $upcomingEvents,
            'isMember' => $isMember,
            'userRole' => $userRole,
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
