<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use App\Models\CalendarJoinRequest;
use App\Notifications\MembershipNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class CalendarMembershipController extends Controller
{
    public function store(Request $request, Calendar $calendar)
    {
        $this->authorize('join', $calendar);

        $user = Auth::user();

        $existingRequest = CalendarJoinRequest::where('calendar_id', $calendar->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'pending') {
                return back();
            }

            $existingRequest->update(['status' => $calendar->isPublic() ? 'approved' : 'pending']);
            $joinRequest = $existingRequest;
        } else {
            $joinRequest = CalendarJoinRequest::create([
                'calendar_id' => $calendar->id,
                'user_id' => $user->id,
                'status' => $calendar->isPublic() ? 'approved' : 'pending',
            ]);
        }

        if ($calendar->isPublic()) {
            $joinRequest->approve($user);
        } else {
            $owner = $calendar->owner;
            Notification::send($owner, new MembershipNotification($calendar, 'request'));
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

    public function remove(Request $request, Calendar $calendar, int $userId)
    {
        $this->authorize('removeMember', $calendar);

        if ($calendar->owner_id !== $userId) {
            $calendar->members()->detach($userId);
        }

        return back();
    }
}
