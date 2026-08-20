<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CalendarsController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $ownedCalendars = $user->calendarsOwned()
            ->withCount(['events as upcoming_events_count' => function ($query) {
                $query->where('start_at', '>=', now());
            }])
            ->withCount('members as members_count')
            ->get();

        $memberCalendars = $user->calendars()
            ->withCount(['events as upcoming_events_count' => function ($query) {
                $query->where('start_at', '>=', now());
            }])
            ->withCount('members as members_count')
            ->get();

        return Inertia::render('calendar/list', [
            'ownedCalendars' => $ownedCalendars,
            'memberCalendars' => $memberCalendars,
        ]);
    }
}
