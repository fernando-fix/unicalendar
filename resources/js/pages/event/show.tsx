import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    MapPinIcon,
    ExternalLinkIcon,
    TrashIcon,
    PencilIcon,
    CalendarIcon,
    ClockIcon,
    CheckIcon,
    HelpCircleIcon,
    XIcon,
} from 'lucide-react';
import type { Calendar, Event, Comment, SharedData } from '@/types';

type EventShowProps = {
    calendar: Calendar;
    event: Event;
    userAttendance: string | null;
};

const TYPE_COLORS: Record<string, string> = {
    meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    deadline: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    exam: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    presentation: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const TYPE_LABELS: Record<string, string> = {
    meeting: 'Reunião',
    deadline: 'Prazo',
    exam: 'Prova',
    presentation: 'Apresentação',
    event: 'Evento',
    other: 'Outro',
};

const ATTENDANCE_OPTIONS = [
    { value: 'attending', label: 'Vou participar', icon: CheckIcon, activeColor: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700' },
    { value: 'maybe', label: 'Talvez', icon: HelpCircleIcon, activeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700' },
    { value: 'not_attending', label: 'Não vou', icon: XIcon, activeColor: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700' },
] as const;

const STATUS_LABELS: Record<string, string> = {
    attending: 'Vai participar',
    maybe: 'Talvez',
    not_attending: 'Não vai participar',
};

export default function EventShow({ calendar, event, userAttendance }: EventShowProps) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;

    const { data: commentData, setData: setCommentData, post: postComment, processing: commentProcessing, reset: resetComment } = useForm({
        body: '',
    });

    function handleAttendance(status: string) {
        router.post(`/calendar/${calendar.slug}/events/${event.id}/attend`, {
            status,
        });
    }

    function handleSubmitComment(e: React.FormEvent) {
        e.preventDefault();
        postComment(`/calendar/${calendar.slug}/events/${event.id}/comments`, {
            onSuccess: () => resetComment(),
        });
    }

    function handleDeleteComment(commentId: number) {
        if (confirm('Tem certeza que deseja excluir este comentário?')) {
            router.delete(
                `/calendar/${calendar.slug}/events/${event.id}/comments/${commentId}`
            );
        }
    }

    const attending =
        event.attendees?.filter((a) => a.pivot.status === 'attending').length ?? 0;
    const maybe =
        event.attendees?.filter((a) => a.pivot.status === 'maybe').length ?? 0;
    const notAttending =
        event.attendees?.filter((a) => a.pivot.status === 'not_attending').length ?? 0;

    const groupedAttendees = {
        attending: event.attendees?.filter((a) => a.pivot.status === 'attending') ?? [],
        maybe: event.attendees?.filter((a) => a.pivot.status === 'maybe') ?? [],
        not_attending: event.attendees?.filter((a) => a.pivot.status === 'not_attending') ?? [],
    };

    return (
        <AppLayout>
            <Head title={`${event.title} - ${calendar.name}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={`/calendar/${calendar.slug}`} className="hover:text-foreground">
                        {calendar.name}
                    </Link>
                    <span>/</span>
                    <span className="truncate">{event.title}</span>
                </nav>

                {/* Event Header */}
                <div>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold">{event.title}</h1>
                            <Badge
                                variant="secondary"
                                className={TYPE_COLORS[event.type] ?? TYPE_COLORS.other}
                            >
                                {TYPE_LABELS[event.type] ?? event.type}
                            </Badge>
                        </div>
                        {auth.user && (event.creator_id === auth.user.id || calendar.owner_id === auth.user.id) && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" render={<Link href={`/calendar/${calendar.slug}/events/${event.id}/edit`} />}>
                                    <PencilIcon className="size-4" />
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm('Tem certeza que deseja excluir este evento?')) {
                                            router.delete(`/calendar/${calendar.slug}/events/${event.id}`);
                                        }
                                    }}
                                >
                                    <TrashIcon className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="size-4" />
                            {new Date(event.start_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(event.start_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                            {event.end_at && (
                                <>
                                    {' - '}
                                    {new Date(event.end_at).toLocaleDateString('pt-BR')} às{' '}
                                    {new Date(event.end_at).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </>
                            )}
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="size-4" />
                                {event.location}
                            </div>
                        )}
                        {event.meeting_url && (
                            <div className="flex items-center gap-2">
                                <ExternalLinkIcon className="size-4" />
                                <a
                                    href={event.meeting_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                                >
                                    Link da reunião
                                </a>
                            </div>
                        )}
                    </div>

                    {event.creator && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="size-5">
                                <AvatarImage src={event.creator.avatar ? `/storage/${event.creator.avatar}` : undefined} alt={event.creator.name} />
                                <AvatarFallback className="text-[10px]">{event.creator.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span>Criado por {event.creator.name}</span>
                        </div>
                    )}
                </div>

                {event.description && (
                    <>
                        <Separator />
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="whitespace-pre-wrap">{event.description}</p>
                        </div>
                    </>
                )}

                <Separator />

                {/* Attendance Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Presença</h2>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {ATTENDANCE_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                variant={userAttendance === option.value ? 'default' : 'outline'}
                                size="sm"
                                className={
                                    userAttendance === option.value
                                        ? option.activeColor + ' border'
                                        : ''
                                }
                                onClick={() => handleAttendance(option.value)}
                                disabled={!isLoggedIn}
                            >
                                <option.icon className="size-4" />
                                {option.label}
                            </Button>
                        ))}
                        {!isLoggedIn && (
                            <Link
                                href="/login"
                                className="ml-2 inline-flex items-center text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                            >
                                Faça login para confirmar presença
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CheckIcon className="size-4 text-green-600" />
                            {attending} confirmados
                        </span>
                        <span className="flex items-center gap-1">
                            <HelpCircleIcon className="size-4 text-amber-600" />
                            {maybe} talvez
                        </span>
                        <span className="flex items-center gap-1">
                            <XIcon className="size-4 text-red-600" />
                            {notAttending} não vão
                        </span>
                    </div>
                </div>

                {/* Participants */}
                {event.attendees && event.attendees.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h2 className="text-lg font-semibold mb-3">Participantes</h2>
                            <div className="space-y-3">
                                {Object.entries(groupedAttendees).map(
                                    ([status, attendees]) =>
                                        attendees.length > 0 && (
                                            <div key={status}>
                                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                                    {STATUS_LABELS[status]}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {attendees.map((attendee) => (
                                                        <Badge key={attendee.id} variant="outline" className="gap-1.5">
                                                            <Avatar className="size-4">
                                                                <AvatarImage src={attendee.avatar ? `/storage/${attendee.avatar}` : undefined} alt={attendee.name} />
                                                                <AvatarFallback className="text-[8px]">{attendee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            {attendee.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                )}
                            </div>
                        </div>
                    </>
                )}

                <Separator />

                {/* Comments Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">
                        Comentários ({event.comments?.length ?? 0})
                    </h2>

                    {isLoggedIn ? (
                        <form onSubmit={handleSubmitComment} className="mb-6">
                            <div className="space-y-2">
                                <Textarea
                                    value={commentData.body}
                                    onChange={(e) => setCommentData('body', e.target.value)}
                                    placeholder="Adicione um comentário..."
                                    rows={2}
                                />
                            </div>
                            <div className="mt-2 flex justify-end">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={commentProcessing || !commentData.body.trim()}
                                >
                                    {commentProcessing ? 'Enviando...' : 'Comentar'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <p className="mb-6 text-sm text-muted-foreground">
                            <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                Faça login
                            </Link>{' '}
                            para comentar.
                        </p>
                    )}

                    {event.comments && event.comments.length > 0 ? (
                        <div className="space-y-4">
                            {event.comments.map((comment: Comment) => {
                                const canDelete =
                                    auth.user &&
                                    (comment.user_id === auth.user.id ||
                                        calendar.owner_id === auth.user.id);

                                return (
                                    <div
                                        key={comment.id}
                                        className="rounded-lg border p-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="size-5">
                                                        <AvatarImage src={comment.user?.avatar ? `/storage/${comment.user.avatar}` : undefined} alt={comment.user?.name ?? ''} />
                                                        <AvatarFallback className="text-[10px]">{(comment.user?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">
                                                        {comment.user?.name ?? 'Usuário'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            comment.created_at
                                                        ).toLocaleDateString('pt-BR')}{' '}
                                                        às{' '}
                                                        {new Date(
                                                            comment.created_at
                                                        ).toLocaleTimeString('pt-BR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm whitespace-pre-wrap">
                                                    {comment.body}
                                                </p>
                                            </div>
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        handleDeleteComment(comment.id)
                                                    }
                                                    aria-label="Excluir comentário"
                                                >
                                                    <TrashIcon className="size-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Nenhum comentário ainda
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
