import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import DraftForm from '@/components/draft-form';
import type { DraftFormInitialValues } from '@/components/draft-form';
import AppLayout from '@/layouts/app-layout';
import type { Calendar } from '@/types';


type DraftsCreateProps = {
    calendars: Calendar[];
    errors?: Partial<Record<string, string>>;
};

export default function DraftsCreate({ calendars, errors }: DraftsCreateProps) {
    function handleSubmit(values: DraftFormInitialValues) {
        router.post('/drafts', values, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout>
            <Head title="Novo Rascunho" />

            <div className="mx-auto max-w-xl space-y-6">
                <Link
                    href="/drafts"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-4" />
                    Voltar para Rascunhos
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">Novo rascunho</h1>
                    <p className="text-sm text-muted-foreground">
                        Salve título, local, tipo e tudo mais. A data você preenche depois.
                    </p>
                </div>

                {calendars.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground mb-3">
                            Você não tem calendários onde possa criar eventos. Crie um calendário antes de salvar rascunhos.
                        </p>
                        <Link
                            href="/calendars"
                            className="text-primary underline underline-offset-4"
                        >
                            Ver calendários
                        </Link>
                    </div>
                ) : (
                    <DraftForm
                        calendars={calendars}
                        initialValues={{} as DraftFormInitialValues}
                        method="post"
                        action="/drafts"
                        submitLabel="Salvar rascunho"
                        errors={errors}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>
        </AppLayout>
    );
}
