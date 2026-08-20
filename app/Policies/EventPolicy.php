<?php

namespace App\Policies;

use App\Models\Calendar;
use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function view(User $user, Event $event): bool
    {
        $calendar = $event->calendar;

        if ($calendar->isPublic()) {
            return true;
        }

        return $calendar->hasMember($user);
    }

    public function create(User $user, Calendar $calendar): bool
    {
        if ($calendar->isOwnedBy($user)) {
            return true;
        }

        return $calendar->allow_member_event_creation && $calendar->hasMember($user);
    }

    public function update(User $user, Event $event): bool
    {
        return $event->creator_id === $user->id || $event->calendar->isOwnedBy($user);
    }

    public function delete(User $user, Event $event): bool
    {
        return $event->creator_id === $user->id || $event->calendar->isOwnedBy($user);
    }
}
