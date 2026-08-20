<?php

namespace Database\Seeders;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationPreferenceSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            NotificationPreference::create([
                'user_id' => $user->id,
                'new_events' => true,
                'event_updates' => true,
                'event_deletions' => true,
                'event_reminders' => true,
                'reminder_minutes' => 60,
            ]);
        }
    }
}
