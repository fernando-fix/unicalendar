import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeftIcon } from 'lucide-react';
import type { NotificationPreferences } from '@/types';

type SettingsShowProps = {
    preferences: NotificationPreferences;
};

export default function SettingsShow({ preferences }: SettingsShowProps) {
    const { data, setData, put, processing, errors } = useForm<{
        new_events: boolean;
        event_updates: boolean;
        event_deletions: boolean;
        event_reminders: boolean;
        reminder_minutes: number | null;
    }>({
        new_events: preferences.new_events,
        event_updates: preferences.event_updates,
        event_deletions: preferences.event_deletions,
        event_reminders: preferences.event_reminders,
        reminder_minutes: preferences.reminder_minutes ?? 60,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put('/settings');
    }

    return (
        <AppLayout>
            <Head title="Configurações de Notificação" />

            <div className="mx-auto max-w-xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeftIcon className="size-4" />
                    Voltar ao Dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-6">Configurações de Notificação</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="new_events"
                                checked={data.new_events}
                                onCheckedChange={(checked) =>
                                    setData('new_events', checked === true)
                                }
                            />
                            <Label htmlFor="new_events" className="cursor-pointer">
                                Novos eventos
                            </Label>
                        </div>
                        {errors.new_events && (
                            <p className="text-sm text-destructive">{errors.new_events}</p>
                        )}

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="event_updates"
                                checked={data.event_updates}
                                onCheckedChange={(checked) =>
                                    setData('event_updates', checked === true)
                                }
                            />
                            <Label htmlFor="event_updates" className="cursor-pointer">
                                Eventos alterados
                            </Label>
                        </div>
                        {errors.event_updates && (
                            <p className="text-sm text-destructive">{errors.event_updates}</p>
                        )}

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="event_deletions"
                                checked={data.event_deletions}
                                onCheckedChange={(checked) =>
                                    setData('event_deletions', checked === true)
                                }
                            />
                            <Label htmlFor="event_deletions" className="cursor-pointer">
                                Eventos cancelados
                            </Label>
                        </div>
                        {errors.event_deletions && (
                            <p className="text-sm text-destructive">{errors.event_deletions}</p>
                        )}

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="event_reminders"
                                checked={data.event_reminders}
                                onCheckedChange={(checked) =>
                                    setData('event_reminders', checked === true)
                                }
                            />
                            <Label htmlFor="event_reminders" className="cursor-pointer">
                                Lembretes
                            </Label>
                        </div>
                        {errors.event_reminders && (
                            <p className="text-sm text-destructive">{errors.event_reminders}</p>
                        )}
                    </div>

                    {data.event_reminders && (
                        <div className="space-y-2 ml-7">
                            <Label htmlFor="reminder_minutes">Antecedência do lembrete</Label>
                            <select
                                id="reminder_minutes"
                                value={data.reminder_minutes ?? ''}
                                onChange={(e) =>
                                    setData(
                                        'reminder_minutes',
                                        e.target.value === '' ? null : Number(e.target.value)
                                    )
                                }
                                className="flex h-8 w-full max-w-xs rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                            >
                                <option value={60}>1 hora antes</option>
                                <option value={1440}>1 dia antes</option>
                            </select>
                            {errors.reminder_minutes && (
                                <p className="text-sm text-destructive">
                                    {errors.reminder_minutes}
                                </p>
                            )}
                        </div>
                    )}

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Salvando...' : 'Salvar Preferências'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
