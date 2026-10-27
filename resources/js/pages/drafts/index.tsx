import { Head, Link, router } from '@inertiajs/react';
import { FileTextIcon, PlusIcon, TrashIcon, PencilIcon, ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { EventDraft } from '@/types';

type DraftsIndexProps = {
    drafts: EventDraft[];
};

export default function DraftsIndex({ drafts }: DraftsIndexProps) {
    function handleDelete(draft: EventDraft) {
        if (!confirm(`Excluir o rascunho "${draft.title}"?`)) {
return;
}

        router.delete(`/drafts/${draft.id}`);
    }

    return (
        <AppLayout>
            <Head title="Rascunhos" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Rascunhos</h1>
                        <p className="text-sm text-muted-foreground">
                            Eventos quase prontos — falta só data e horário.
                        </p>
                    </div>
                    <Button render={<Link href="/drafts/create" />}>
                        <PlusIcon className="size-4" />
                        Novo rascunho
                    </Button>
                </div>

                {drafts.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <FileTextIcon className="size-10 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                                Você ainda não tem rascunhos salvos.
                            </p>
                            <Button variant="outline" render={<Link href="/drafts/create" />}>
                                Criar primeiro rascunho
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {drafts.map((draft) => (
                            <Card key={draft.id}>
                                <CardContent className="flex items-start justify-between gap-4 p-4">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold truncate">{draft.title}</h3>
                                            <Badge variant="secondary">
                                                {EVENT_TYPE_LABELS[draft.type] ?? draft.type}
                                            </Badge>
                                        </div>
                                        {draft.calendar && (
                                            <p className="text-xs text-muted-foreground">
                                                Calendário:{' '}
                                                <Link
                                                    href={`/calendar/${draft.calendar.uuid}`}
                                                    className="underline underline-offset-4 hover:text-foreground"
                                                >
                                                    {draft.calendar.name}
                                                </Link>
                                            </p>
                                        )}
                                        {draft.description && (
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {draft.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {draft.location && <span>📍 {draft.location}</span>}
                                            <span>
                                                Atualizado em{' '}
                                                {new Date(draft.updated_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            size="sm"
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href={`/calendar/${draft.calendar?.uuid}/events/create?from_draft=${draft.id}`}
                                                />
                                            }
                                        >
                                            <ExternalLinkIcon className="size-4" />
                                            Criar evento
                                        </Button>
                                        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/drafts/${draft.id}/edit`} />}>
                                            <PencilIcon className="size-4" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(draft)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <TrashIcon className="size-4" />
                                            Excluir
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

const EVENT_TYPE_LABELS: Record<string, string> = {
    meeting: 'Reunião',
    deadline: 'Prazo',
    exam: 'Prova',
    presentation: 'Apresentação',
    event: 'Evento',
    other: 'Outro',
};
