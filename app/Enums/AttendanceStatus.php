<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case Attending = 'attending';
    case Maybe = 'maybe';
    case NotAttending = 'not_attending';

    public function label(): string
    {
        return match ($this) {
            self::Attending => 'Vou participar',
            self::Maybe => 'Talvez',
            self::NotAttending => 'Não vou',
        };
    }
}
