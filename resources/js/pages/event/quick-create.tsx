import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { EVENT_TYPES } from '@/types';
import type { Calendar } from '@/types';

type QuickCreateProps = {
    calendars: Calendar[];
    date?: string;
};

type DateSlot = {
    start_at: string;
    end_at: string;
};

export default function EventQuickCreate({ calendars, date }: QuickCreateProps) {
    const [multipleDates, setMultipleDates] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        calendar_id: calendars.length === 1 ? String(calendars[0].id) : '',
        title: '',
        description: '',
        type: 'meeting',
        start_at: date ? `${date}T09:00` : '',
        end_at: date ? `${date}T10:00` : '',
        location: '',
        meeting_url: '',
        dates: [{ start_at: date ? `${date}T09:00` : '', end_at: date ? `${date}T10:00` : '' }] as DateSlot[],
    });

    const selectedCalendar = calendars.find((c) => c.id === Number(data.calendar_id));

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedCalendar) return;

        if (multipleDates) {
            post(`/calendar/${selectedCalendar.uuid}/events/batch`);
        } else {
            post(`/calendar/${selectedCalendar.uuid}/events`);
        }
    }

    function addDateSlot() {
        const last = data.dates[data.dates.length - 1];
        setData('dates', [...data.dates, { start_at: last?.start_at || '', end_at: last?.end_at || '' }]);
    }

    function removeDateSlot(index: number) {
        if (data.dates.length <= 1) return;
        setData('dates', data.dates.filter((_, i) => i !== index));
    }

    function updateDateSlot(index: number, field: keyof DateSlot, value: string) {
        const newDates = data.dates.map((d, i) =>
            i === index ? { ...d, [field]: value } : d
        );
        setData('dates', newDates);
    }

    function toggleMultipleDates() {
        if (!multipleDates) {
            setData('dates', [{ start_at: data.start_at || '', end_at: data.end_at || '' }]);
        }
        setMultipleDates(!multipleDates);
    }

    function getDateError(index: number, field: string): string | null {
        const key = `dates.${index}.${field}`;
        return (errors as Record<string, string>)[key] || null;
    }

    return (
        <AppLayout>
            <Head title="Criar Evento" />

            <div className="mx-auto max-w-xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeftIcon className="size-4" />
                    Voltar ao Dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-6">Criar Evento</h1>

                {calendars.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground mb-3">
                            Você não possui calendários onde possa criar eventos.
                        </p>
                        <Button variant="outline" nativeButton={false} render={<Link href="/calendars" />}>
                            Ver Calendários
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="calendar_id">Calendário</Label>
                            <select
                                id="calendar_id"
                                value={data.calendar_id}
                                onChange={(e) => setData('calendar_id', e.target.value)}
                                className="flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                                disabled={calendars.length === 1}
                            >
                                <option value="">Selecione um calendário</option>
                                {calendars.map((cal) => (
                                    <option key={cal.id} value={cal.id}>
                                        {cal.name}
                                    </option>
                                ))}
                            </select>
                            {errors.calendar_id && (
                                <p className="text-sm text-destructive">{errors.calendar_id}</p>
                            )}
                        </div>

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

                        {multipleDates ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Datas</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {data.dates.length} {data.dates.length === 1 ? 'data' : 'datas'}
                                    </span>
                                </div>

                                {data.dates.map((dateSlot, index) => (
                                    <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                                        <div className="flex-1 grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor={`start_at-${index}`}>Início</Label>
                                                <Input
                                                    id={`start_at-${index}`}
                                                    type="datetime-local"
                                                    value={dateSlot.start_at}
                                                    onChange={(e) => updateDateSlot(index, 'start_at', e.target.value)}
                                                />
                                                {getDateError(index, 'start_at') && (
                                                    <p className="text-sm text-destructive">{getDateError(index, 'start_at')}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`end_at-${index}`}>Término</Label>
                                                <Input
                                                    id={`end_at-${index}`}
                                                    type="datetime-local"
                                                    value={dateSlot.end_at}
                                                    onChange={(e) => updateDateSlot(index, 'end_at', e.target.value)}
                                                />
                                                {getDateError(index, 'end_at') && (
                                                    <p className="text-sm text-destructive">{getDateError(index, 'end_at')}</p>
                                                )}
                                            </div>
                                        </div>
                                        {data.dates.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDateSlot(index)}
                                                className="mt-6 text-destructive hover:text-destructive"
                                            >
                                                <TrashIcon className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addDateSlot} className="w-full">
                                    <PlusIcon className="size-4 mr-2" />
                                    Adicionar Data
                                </Button>
                            </div>
                        ) : (
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
                        )}

                        <button
                            type="button"
                            onClick={toggleMultipleDates}
                            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
                        >
                            {multipleDates ? 'Criar em uma data apenas' : 'Criar em várias datas'}
                        </button>

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
                            <Button type="submit" disabled={processing || !data.calendar_id}>
                                {processing
                                    ? 'Criando...'
                                    : multipleDates
                                        ? `Criar em ${data.dates.length} ${data.dates.length === 1 ? 'data' : 'datas'}`
                                        : 'Criar Evento'
                                }
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                nativeButton={false}
                                render={<Link href="/dashboard" />}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
