<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $calendar_id
 * @property int $creator_id
 * @property string $title
 * @property string|null $description
 * @property string|null $summary
 * @property string $type
 * @property Carbon|null $start_at
 * @property string|null $location
 * @property string|null $meeting_url
 */
class EventDraft extends Model
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
        'location',
        'meeting_url',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
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
