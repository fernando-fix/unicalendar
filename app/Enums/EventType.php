<?php

namespace App\Enums;

enum EventType: string
{
    case Meeting = 'meeting';
    case Deadline = 'deadline';
    case Exam = 'exam';
    case Presentation = 'presentation';
    case Event = 'event';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Meeting => 'Reunião',
            self::Deadline => 'Prazo',
            self::Exam => 'Prova',
            self::Presentation => 'Apresentação',
            self::Event => 'Evento',
            self::Other => 'Outro',
        };
    }
}
