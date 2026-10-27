<?php

namespace App\Policies;

use App\Models\Calendar;
use App\Models\EventDraft;
use App\Models\User;

class EventDraftPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, EventDraft $eventDraft): bool
    {
        return $this->manageableBy($user, $eventDraft);
    }

    public function create(User $user, Calendar $calendar): bool
    {
        if ($calendar->isOwnedBy($user)) {
            return true;
        }

        return $calendar->allow_member_event_creation && $calendar->hasMember($user);
    }

    public function update(User $user, EventDraft $eventDraft): bool
    {
        return $this->manageableBy($user, $eventDraft);
    }

    public function delete(User $user, EventDraft $eventDraft): bool
    {
        return $this->manageableBy($user, $eventDraft);
    }

    private function manageableBy(User $user, EventDraft $eventDraft): bool
    {
        if ($eventDraft->creator_id === $user->id) {
            return true;
        }

        $calendar = $eventDraft->calendar;

        return $calendar && $calendar->isOwnedBy($user);
    }
}
