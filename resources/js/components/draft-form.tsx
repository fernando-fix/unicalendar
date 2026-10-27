import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EVENT_TYPES  } from '@/types';
import type {Calendar} from '@/types';

export type DraftFormInitialValues = {
    calendar_id?: number | string;
    title: string;
    description: string;
    summary: string;
    type: keyof typeof EVENT_TYPES;
    start_at: string;
    location: string;
    meeting_url: string;
};

type DraftFormProps = {
    calendars: Calendar[];
    initialValues: Partial<DraftFormInitialValues>;
    method: 'post' | 'put';
    action: string;
    submitLabel: string;
    processing?: boolean;
    errors?: Partial<Record<string, string>>;
    onSubmit: (data: DraftFormInitialValues) => void;
};

export default function DraftForm({
    calendars,
    initialValues,
    method,
    action,
    submitLabel,
    onSubmit,
    errors,
}: DraftFormProps) {
    const { data, setData, processing } = useForm<DraftFormInitialValues>({
        calendar_id: initialValues.calendar_id ?? (calendars.length === 1 ? calendars[0].id : ''),
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
        summary: initialValues.summary ?? '',
        type: initialValues.type ?? 'meeting',
        start_at: initialValues.start_at ?? '',
        location: initialValues.location ?? '',
        meeting_url: initialValues.meeting_url ?? '',
    });

    const computedErrors = errors ?? {};

    return (
        <form
            method={method}
            action={action}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(data);
            }}
            className="space-y-6"
        >
            <div className="space-y-2">
                <Label htmlFor="calendar_id">Calendário</Label>
                <select
                    id="calendar_id"
                    value={data.calendar_id === '' || data.calendar_id === undefined ? '' : String(data.calendar_id)}
                    onChange={(e) => setData('calendar_id', e.target.value ? Number(e.target.value) : '')}
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
                {computedErrors.calendar_id && (
                    <p className="text-sm text-destructive">{computedErrors.calendar_id}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Título do evento"
                    required
                />
                {computedErrors.title && (
                    <p className="text-sm text-destructive">{computedErrors.title}</p>
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
                {computedErrors.description && (
                    <p className="text-sm text-destructive">{computedErrors.description}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="summary">Resumo</Label>
                <Textarea
                    id="summary"
                    value={data.summary}
                    onChange={(e) => setData('summary', e.target.value)}
                    placeholder="Resumo do evento (opcional)"
                    rows={5}
                />
                {computedErrors.summary && (
                    <p className="text-sm text-destructive">{computedErrors.summary}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                    id="type"
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value as keyof typeof EVENT_TYPES)}
                    className="flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                >
                    {Object.entries(EVENT_TYPES).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                {computedErrors.type && (
                    <p className="text-sm text-destructive">{computedErrors.type}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="start_at">Data e hora (opcional em rascunhos)</Label>
                <Input
                    id="start_at"
                    type="datetime-local"
                    value={data.start_at}
                    onChange={(e) => setData('start_at', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Deixe em branco se ainda não tiver a data. Você só precisa preencher a data quando for publicar.
                </p>
                {computedErrors.start_at && (
                    <p className="text-sm text-destructive">{computedErrors.start_at}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    placeholder="Local do evento (opcional)"
                />
                {computedErrors.location && (
                    <p className="text-sm text-destructive">{computedErrors.location}</p>
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
                {computedErrors.meeting_url && (
                    <p className="text-sm text-destructive">{computedErrors.meeting_url}</p>
                )}
            </div>

            <div className="flex gap-3">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Salvando...' : submitLabel}
                </Button>
                <Button
                    variant="outline"
                    type="button"
                    nativeButton={false}
                    render={<Link href="/drafts" />}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
