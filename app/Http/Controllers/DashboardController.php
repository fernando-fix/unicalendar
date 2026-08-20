<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private const CALENDAR_COLORS = [
        'blue',
        'emerald',
        'purple',
        'amber',
        'rose',
        'cyan',
        'orange',
        'indigo',
    ];

    public function index()
    {
        $user = Auth::user();

        $allCalendarsQuery = $user->calendarsOwned()
            ->orWhereHas('members', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });

        $allCalendars = $allCalendarsQuery->get()->values();
        $allCalendarsWithColors = $allCalendars->map(function ($calendar, $index) {
            $calendar->color = self::CALENDAR_COLORS[$index % count(self::CALENDAR_COLORS)];
            $calendar->active = true;

            return $calendar;
        });

        $allCalendarIds = $allCalendars->pluck('id');

        $allEvents = Event::query()
            ->whereIn('calendar_id', $allCalendarIds)
            ->with('calendar')
            ->orderBy('start_at')
            ->get();

        $upcomingEvents = Event::query()
            ->whereHas('calendar', function ($query) use ($user) {
                $query->where('owner_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            })
            ->with('calendar')
            ->where('start_at', '>=', now())
            ->orderBy('start_at')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'upcomingEvents' => $upcomingEvents,
            'allEvents' => $allEvents,
            'allCalendars' => $allCalendarsWithColors,
        ]);
    }
}
