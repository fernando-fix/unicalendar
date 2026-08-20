<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\NotificationPreference;
use App\Notifications\EventNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;

class SendEventReminders extends Command
{
    protected $signature = 'reminders:send';

    protected $description = 'Send event reminders to calendar members';

    public function handle(): int
    {
        $now = Carbon::now();
        $events = Event::whereBetween('start_at', [$now, $now->copy()->addDay()])
            ->with('calendar.members', 'creator')
            ->get();

        $sent = 0;

        foreach ($events as $event) {
            $calendar = $event->calendar;
            $members = $calendar->members;

            foreach ($members as $member) {
                if ($member->id === $event->creator_id) {
                    continue;
                }

                $preference = NotificationPreference::where('user_id', $member->id)->first();

                if (! $preference?->event_reminders || is_null($preference?->reminder_minutes)) {
                    continue;
                }

                $reminderAt = $event->start_at->subMinutes($preference->reminder_minutes);

                if ($now->greaterThanOrEqualTo($reminderAt) && $now->lessThan($event->start_at)) {
                    Notification::send($member, new EventNotification($event, 'created'));
                    $sent++;
                }
            }
        }

        $this->info("Sent {$sent} reminder(s).");

        return self::SUCCESS;
    }
}
