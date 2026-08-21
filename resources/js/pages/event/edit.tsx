import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EVENT_TYPES } from '@/types';
import type { Calendar, Event } from '@/types';

type EventEditProps = {
    calendar: Calendar;
    event: Event;
};

function toLocalDatetimeValue(dateStr: string) {
    const d = new Date(dateStr);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
}

export default function EventEdit({ calendar, event }: EventEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: event.title,
        description: event.description ?? '',
        type: event.type,
        start_at: toLocalDatetimeValue(event.start_at),
        end_at: event.end_at ? toLocalDatetimeValue(event.end_at) : '',
        location: event.location ?? '',
        meeting_url: event.meeting_url ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/calendar/${calendar.uuid}/events/${event.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Editar Evento - ${calendar.name}`} />

            <div className="mx-auto max-w-xl">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link href={`/calendar/${calendar.uuid}`} className="hover:text-foreground">
                        {calendar.name}
                    </Link>
                    <span>/</span>
                    <span>Editar Evento</span>
                </nav>

                <h1 className="text-2xl font-bold mb-6">Editar Evento</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Título do evento"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Descrição opcional"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <select
                            id="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as typeof data.type)}
                            className="flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                        >
                            {Object.entries(EVENT_TYPES).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        {errors.type && (
                            <p className="text-sm text-destructive">{errors.type}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="start_at">Data e hora de início</Label>
                            <Input
                                id="start_at"
                                type="datetime-local"
                                value={data.start_at}
                                onChange={(e) => setData('start_at', e.target.value)}
                            />
                            {errors.start_at && (
                                <p className="text-sm text-destructive">{errors.start_at}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_at">Data e hora de término</Label>
                            <Input
                                id="end_at"
                                type="datetime-local"
                                value={data.end_at}
                                onChange={(e) => setData('end_at', e.target.value)}
                            />
                            {errors.end_at && (
                                <p className="text-sm text-destructive">{errors.end_at}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Local</Label>
                        <Input
                            id="location"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder="Local do evento (opcional)"
                        />
                        {errors.location && (
                            <p className="text-sm text-destructive">{errors.location}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meeting_url">URL da reunião</Label>
                        <Input
                            id="meeting_url"
                            type="url"
                            value={data.meeting_url}
                            onChange={(e) => setData('meeting_url', e.target.value)}
                            placeholder="https://..."
                        />
                        {errors.meeting_url && (
                            <p className="text-sm text-destructive">{errors.meeting_url}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            nativeButton={false}
                            render={
                                <Link href={`/calendar/${calendar.uuid}/events/${event.id}`} />
                            }
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
