<?php

namespace App\Notifications;

use App\Models\Calendar;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Calendar $calendar,
        public string $action,
        public ?User $reviewer = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return match ($this->action) {
            'request' => (new MailMessage)
                ->subject("Nova solicitação em {$this->calendar->name}")
                ->line("Um usuário solicitou participar do calendário \"{$this->calendar->name}\".")
                ->action('Ver solicitações', route('calendars.settings', $this->calendar->uuid)),
            'approved' => (new MailMessage)
                ->subject("Solicitação aprovada - {$this->calendar->name}")
                ->line("Sua solicitação para o calendário \"{$this->calendar->name}\" foi aprovada.")
                ->action('Ver calendário', route('calendars.show', $this->calendar->uuid)),
            'rejected' => (new MailMessage)
                ->subject("Solicitação rejeitada - {$this->calendar->name}")
                ->line("Sua solicitação para o calendário \"{$this->calendar->name}\" foi rejeitada."),
            default => (new MailMessage)
                ->subject("Atualização em {$this->calendar->name}")
                ->line("Houve uma atualização no calendário {$this->calendar->name}."),
        };
    }
}
