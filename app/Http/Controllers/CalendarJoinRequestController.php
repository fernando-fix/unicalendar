<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use App\Models\CalendarJoinRequest;
use App\Notifications\MembershipNotification;
use Illuminate\Support\Facades\Notification;

class CalendarJoinRequestController extends Controller
{
    public function index(Calendar $calendar)
    {
        $this->authorize('update', $calendar);

        $pendingRequests = CalendarJoinRequest::where('calendar_id', $calendar->id)
            ->where('status', 'pending')
            ->with('user')
            ->latest()
            ->get();

        return response()->json($pendingRequests);
    }

    public function approve(Calendar $calendar, CalendarJoinRequest $joinRequest)
    {
        $this->authorize('update', $calendar);

        abort_unless(
            $joinRequest->calendar_id === $calendar->id && $joinRequest->isPending(),
            404
        );

        $joinRequest->approve(auth()->user());

        Notification::send(
            $joinRequest->user,
            new MembershipNotification($calendar, 'approved')
        );

        return back();
    }

    public function reject(Calendar $calendar, CalendarJoinRequest $joinRequest)
    {
        $this->authorize('update', $calendar);

        abort_unless(
            $joinRequest->calendar_id === $calendar->id && $joinRequest->isPending(),
            404
        );

        $joinRequest->reject(auth()->user());

        Notification::send(
            $joinRequest->user,
            new MembershipNotification($calendar, 'rejected')
        );

        return back();
    }
}
