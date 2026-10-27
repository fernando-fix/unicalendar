import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import DraftForm from '@/components/draft-form';
import type { DraftFormInitialValues } from '@/components/draft-form';
import AppLayout from '@/layouts/app-layout';
import { formatDateTimeLocal } from '@/lib/draft-form';
import type { Calendar, EventDraft } from '@/types';

type DraftsEditProps = {
    draft: EventDraft;
    calendars: Calendar[];
    errors?: Partial<Record<string, string>>;
};

export default function DraftsEdit({ draft, calendars, errors }: DraftsEditProps) {
    function handleSubmit(values: DraftFormInitialValues) {
        router.put(`/drafts/${draft.id}`, values, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout>
            <Head title={`Editar rascunho - ${draft.title}`} />

            <div className="mx-auto max-w-xl space-y-6">
                <Link
                    href="/drafts"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-4" />
                    Voltar para Rascunhos
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">Editar rascunho</h1>
                    <p className="text-sm text-muted-foreground">{draft.title}</p>
                </div>

                <DraftForm
                    calendars={calendars}
                    initialValues={{
                        calendar_id: draft.calendar_id,
                        title: draft.title,
                        description: draft.description ?? '',
                        summary: draft.summary ?? '',
                        type: draft.type,
                        start_at: formatDateTimeLocal(draft.start_at),
                        location: draft.location ?? '',
                        meeting_url: draft.meeting_url ?? '',
                    }}
                    method="put"
                    action={`/drafts/${draft.id}`}
                    submitLabel="Salvar alterações"
                    errors={errors}
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}
