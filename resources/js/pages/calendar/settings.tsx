import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CalendarColorPicker from '@/components/calendar-color-picker';
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
import { ArrowLeftIcon, TrashIcon, CheckIcon, XIcon, UsersIcon } from 'lucide-react';
import type { Calendar, CalendarJoinRequest, CalendarMember } from '@/types';

type CalendarSettingsProps = {
    calendar: Calendar;
    pendingRequests: CalendarJoinRequest[];
    members: CalendarMember[];
};

export default function CalendarSettings({ calendar, pendingRequests, members }: CalendarSettingsProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: calendar.name,
        description: calendar.description ?? '',
        visibility: calendar.visibility,
        color: calendar.color ?? 'blue',
        allow_member_event_creation: calendar.allow_member_event_creation,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/calendar/${calendar.uuid}/settings`);
    }

    function handleDelete() {
        router.delete(`/calendar/${calendar.uuid}`);
    }

    function handleApprove(requestId: number) {
        router.put(`/calendar/${calendar.uuid}/requests/${requestId}/approve`);
    }

    function handleReject(requestId: number) {
        router.put(`/calendar/${calendar.uuid}/requests/${requestId}/reject`);
    }

    function handleRemoveMember(userId: number) {
        router.delete(`/calendar/${calendar.uuid}/members/${userId}`);
    }

    const nonOwnerMembers = members.filter((m) => m.pivot?.role !== 'owner');

    return (
        <AppLayout>
            <Head title={`Configurações - ${calendar.name}`} />

            <div className="mx-auto max-w-xl">
                <Link
                    href={`/calendar/${calendar.uuid}`}
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

                    <CalendarColorPicker
                        value={data.color}
                        onChange={(color) => setData('color', color)}
                    />

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

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <>
                        <Separator className="my-8" />

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">
                                Solicitações pendentes ({pendingRequests.length})
                            </h2>
                            <div className="space-y-3">
                                {pendingRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8">
                                                <AvatarImage
                                                    src={request.user?.avatar ? `/storage/${request.user.avatar}` : undefined}
                                                    alt={request.user?.name}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {request.user?.name
                                                        ?.split(' ')
                                                        .map((n: string) => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2) ?? '??'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{request.user?.name}</p>
                                                <p className="text-xs text-muted-foreground">{request.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(request.id)}
                                            >
                                                <CheckIcon className="size-4" />
                                                Aprovar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReject(request.id)}
                                            >
                                                <XIcon className="size-4" />
                                                Rejeitar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Members */}
                <Separator className="my-8" />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <UsersIcon className="size-5" />
                            Membros ({members.length})
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {members.map((member) => {
                            const isOwner = member.pivot?.role === 'owner';
                            return (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-8">
                                            <AvatarImage
                                                src={member.avatar ? `/storage/${member.avatar}` : undefined}
                                                alt={member.name}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {member.name
                                                    ?.split(' ')
                                                    .map((n: string) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2) ?? '??'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">{member.name}</p>
                                                {isOwner && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Owner
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    {!isOwner && (
                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                render={
                                                    <Button variant="outline" size="sm" />
                                                }
                                            >
                                                <TrashIcon className="size-4" />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja remover {member.name} do calendário?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        variant="destructive"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                    >
                                                        Remover
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

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
