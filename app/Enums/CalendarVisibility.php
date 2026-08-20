<?php

namespace App\Enums;

enum CalendarVisibility: string
{
    case Public = 'public';
    case Private = 'private';

    public function label(): string
    {
        return match ($this) {
            self::Public => 'Público',
            self::Private => 'Privado',
        };
    }
}
