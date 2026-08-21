<?php

namespace App\Policies;

use App\Models\Calendar;
use App\Models\CalendarJoinRequest;
use App\Models\User;

class CalendarPolicy
{
    public function viewAny(): bool
    {
        return true;
    }

    public function view(?User $user, Calendar $calendar): bool
    {
        if ($calendar->isPublic()) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return $calendar->hasMember($user);
    }

    public function create(?User $user): bool
    {
        return $user !== null;
    }

    public function update(User $user, Calendar $calendar): bool
    {
        return $calendar->isOwnedBy($user);
    }

    public function delete(User $user, Calendar $calendar): bool
    {
        return $calendar->isOwnedBy($user);
    }

    public function join(User $user, Calendar $calendar): bool
    {
        if ($calendar->hasMember($user)) {
            return false;
        }

        return ! CalendarJoinRequest::where('calendar_id', $calendar->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();
    }

    public function leave(User $user, Calendar $calendar): bool
    {
        return $calendar->hasMember($user) && ! $calendar->isOwnedBy($user);
    }

    public function removeMember(User $user, Calendar $calendar): bool
    {
        return $calendar->isOwnedBy($user);
    }
}
