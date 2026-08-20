<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function show()
    {
        $preferences = NotificationPreference::firstOrCreate([
            'user_id' => auth()->id(),
        ], [
            'new_events' => true,
            'event_updates' => true,
            'event_deletions' => true,
            'event_reminders' => true,
            'reminder_minutes' => 60,
        ]);

        return Inertia::render('settings/show', [
            'preferences' => $preferences,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'new_events' => ['sometimes', 'boolean'],
            'event_updates' => ['sometimes', 'boolean'],
            'event_deletions' => ['sometimes', 'boolean'],
            'event_reminders' => ['sometimes', 'boolean'],
            'reminder_minutes' => ['nullable', 'integer', 'min:1'],
        ]);

        NotificationPreference::updateOrCreate(
            ['user_id' => auth()->id()],
            $validated,
        );

        return back();
    }
}
