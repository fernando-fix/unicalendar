<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCalendarRequest;
use App\Models\Calendar;
use App\Models\CalendarJoinRequest;
use Inertia\Inertia;

class CalendarSettingsController extends Controller
{
    public function show(Calendar $calendar)
    {
        abort_unless($calendar->isOwnedBy(auth()->user()), 403);

        $pendingRequests = CalendarJoinRequest::where('calendar_id', $calendar->id)
            ->where('status', 'pending')
            ->with('user')
            ->latest()
            ->get();

        $members = $calendar->members()->withPivot('role')->get();

        return Inertia::render('calendar/settings', [
            'calendar' => $calendar,
            'pendingRequests' => $pendingRequests,
            'members' => $members,
        ]);
    }

    public function update(UpdateCalendarRequest $request, Calendar $calendar)
    {
        abort_unless($calendar->isOwnedBy(auth()->user()), 403);

        $calendar->update($request->validated());

        return back();
    }
}
