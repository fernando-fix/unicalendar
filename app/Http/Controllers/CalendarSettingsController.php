<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCalendarRequest;
use App\Models\Calendar;
use Inertia\Inertia;

class CalendarSettingsController extends Controller
{
    public function show(Calendar $calendar)
    {
        abort_unless($calendar->isOwnedBy(auth()->user()), 403);

        return Inertia::render('calendar/settings', [
            'calendar' => $calendar,
        ]);
    }

    public function update(UpdateCalendarRequest $request, Calendar $calendar)
    {
        abort_unless($calendar->isOwnedBy(auth()->user()), 403);

        $calendar->update($request->validated());

        return back();
    }
}
