<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\EventAttendee;
use Illuminate\Http\Request;

class AttendeeController extends Controller
{
    public function store(Request $request, Calendar $calendar, Event $event)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:attending,maybe,not_attending'],
        ]);

        EventAttendee::updateOrCreate(
            ['event_id' => $event->id, 'user_id' => auth()->id()],
            ['status' => $validated['status']],
        );

        return back();
    }
}
