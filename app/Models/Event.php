<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $calendar_id
 * @property int $creator_id
 * @property string $title
 * @property string|null $description
 * @property string|null $summary
 * @property string $type
 * @property Carbon $start_at
 * @property Carbon|null $end_at
 * @property string|null $location
 * @property string|null $meeting_url
 */
class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'calendar_id',
        'creator_id',
        'title',
        'description',
        'summary',
        'type',
        'start_at',
        'end_at',
        'location',
        'meeting_url',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
        ];
    }

    public function calendar(): BelongsTo
    {
        return $this->belongsTo(Calendar::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_attendees')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function getAttendeeCount(string $status): int
    {
        return $this->attendees()->where('event_attendees.status', $status)->count();
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'meeting' => 'Reunião',
            'deadline' => 'Prazo',
            'exam' => 'Prova',
            'presentation' => 'Apresentação',
            'event' => 'Evento',
            'other' => 'Outro',
            default => $this->type,
        };
    }
}
