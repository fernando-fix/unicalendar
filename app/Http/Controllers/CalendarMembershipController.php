<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarMembershipController extends Controller
{
    public function store(Request $request, Calendar $calendar)
    {
        $user = Auth::user();

        if (! $calendar->hasMember($user)) {
            $calendar->members()->attach($user->id, ['role' => 'member']);
        }

        return back();
    }

    public function destroy(Request $request, Calendar $calendar)
    {
        $user = Auth::user();

        if ($calendar->hasMember($user) && ! $calendar->isOwnedBy($user)) {
            $calendar->members()->detach($user->id);
        }

        return back();
    }
}
