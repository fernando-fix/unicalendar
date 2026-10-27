import type { DateSlot } from '@/components/event-dates-field';
import type { EventDraft } from '@/types';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Converte um ISO datetime em string compatível com `<input type="datetime-local">`,
 * preservando o instante mas exibindo-o no fuso do navegador.
 */
export function formatDateTimeLocal(iso: string | null, fallback?: string): string {
    if (!iso) {
        return fallback ?? '';
    }

    const d = new Date(iso);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Converte um rascunho nos valores iniciais aceitos por `useForm` nas páginas
 * de criação/edição de eventos. Quando o rascunho não tem data, usa o `date`
 * recebido via query string; caso contrário, deriva `end_at` como 1h após
 * `start_at` para preencher o campo derivado.
 */
export function draftToFormValues(
    draft: EventDraft,
    date: string | undefined,
): {
    title: string;
    description: string;
    summary: string;
    type: EventDraft['type'];
    start_at: string;
    end_at: string;
    location: string;
    meeting_url: string;
    dates: DateSlot[];
} {
    const startAt = formatDateTimeLocal(draft.start_at ?? null, date ? `${date}T09:00` : undefined);
    const endAtIso = draft.start_at
        ? new Date(new Date(draft.start_at).getTime() + 60 * 60 * 1000).toISOString()
        : null;
    const endAt = formatDateTimeLocal(endAtIso, date ? `${date}T10:00` : undefined);

    return {
        title: draft.title,
        description: draft.description ?? '',
        summary: draft.summary ?? '',
        type: draft.type,
        start_at: startAt,
        end_at: endAt,
        location: draft.location ?? '',
        meeting_url: draft.meeting_url ?? '',
        dates: [{ start_at: startAt, end_at: endAt }],
    };
}
