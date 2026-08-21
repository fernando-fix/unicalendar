<?php

namespace App\Notifications;

use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Event $event,
        public string $action,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $calendar = $this->event->calendar;

        return match ($this->action) {
            'created' => (new MailMessage)
                ->subject("Novo evento em {$calendar->name}")
                ->line("Um novo evento \"{$this->event->title}\" foi criado em {$calendar->name}.")
                ->line("Data: {$this->event->start_at->format('d/m/Y H:i')}")
                ->action('Ver evento', route('events.show', [$calendar->uuid, $this->event->id])),
            'updated' => (new MailMessage)
                ->subject("Evento atualizado em {$calendar->name}")
                ->line("O evento \"{$this->event->title}\" foi atualizado em {$calendar->name}.")
                ->action('Ver evento', route('events.show', [$calendar->uuid, $this->event->id])),
            'deleted' => (new MailMessage)
                ->subject("Evento removido em {$calendar->name}")
                ->line("O evento \"{$this->event->title}\" foi removido de {$calendar->name}."),
            default => (new MailMessage)
                ->subject("Atualização em {$calendar->name}")
                ->line("Houve uma atualização no calendário {$calendar->name}."),
        };
    }
}
