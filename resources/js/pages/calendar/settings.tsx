import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeftIcon, TrashIcon } from 'lucide-react';
import type { Calendar } from '@/types';

type CalendarSettingsProps = {
    calendar: Calendar;
};

export default function CalendarSettings({ calendar }: CalendarSettingsProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: calendar.name,
        description: calendar.description ?? '',
        visibility: calendar.visibility,
        allow_member_event_creation: calendar.allow_member_event_creation,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/calendar/${calendar.slug}/settings`);
    }

    function handleDelete() {
        router.delete(`/calendar/${calendar.slug}`);
    }

    return (
        <AppLayout>
            <Head title={`Configurações - ${calendar.name}`} />

            <div className="mx-auto max-w-xl">
                <Link
                    href={`/calendar/${calendar.slug}`}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeftIcon className="size-4" />
                    Voltar ao calendário
                </Link>

                <h1 className="text-2xl font-bold mb-6">Configurações do Calendário</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="visibility">Visibilidade</Label>
                        <select
                            id="visibility"
                            value={data.visibility}
                            onChange={(e) =>
                                setData('visibility', e.target.value as 'public' | 'private')
                            }
                            className="flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                        >
                            <option value="public">Público</option>
                            <option value="private">Privado</option>
                        </select>
                        {errors.visibility && (
                            <p className="text-sm text-destructive">{errors.visibility}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="allow_member_event_creation"
                            checked={data.allow_member_event_creation}
                            onCheckedChange={(checked) =>
                                setData('allow_member_event_creation', checked === true)
                            }
                        />
                        <Label htmlFor="allow_member_event_creation" className="cursor-pointer">
                            Permitir que membros criem eventos
                        </Label>
                    </div>
                    {errors.allow_member_event_creation && (
                        <p className="text-sm text-destructive">
                            {errors.allow_member_event_creation}
                        </p>
                    )}

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Salvando...' : 'Salvar'}
                    </Button>
                </form>

                <Separator className="my-8" />

                {/* Danger Zone */}
                <div className="rounded-lg border border-destructive/30 p-4">
                    <h2 className="text-lg font-semibold text-destructive mb-2">
                        Zona de perigo
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Excluir este calendário removerá todos os eventos, comentários e dados
                        associados. Esta ação não pode ser desfeita.
                    </p>
                    <AlertDialog>
                        <AlertDialogTrigger
                            render={
                                <Button variant="destructive" size="sm" />
                            }
                        >
                            <TrashIcon className="size-4" />
                            Excluir Calendário
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O calendário "{calendar.name}" e
                                    todos os seus eventos serão permanentemente excluídos.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AppLayout>
    );
}
