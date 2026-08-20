<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property bool $new_events
 * @property bool $event_updates
 * @property bool $event_deletions
 * @property bool $event_reminders
 * @property int|null $reminder_minutes
 */
class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'new_events',
        'event_updates',
        'event_deletions',
        'event_reminders',
        'reminder_minutes',
    ];

    protected function casts(): array
    {
        return [
            'new_events' => 'boolean',
            'event_updates' => 'boolean',
            'event_deletions' => 'boolean',
            'event_reminders' => 'boolean',
            'reminder_minutes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
