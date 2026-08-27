import { useState, useMemo, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    CalendarIcon,
    PlusIcon,
    SettingsIcon,
    UsersIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MapPinIcon,
    ExternalLinkIcon,
    LinkIcon,
    LockIcon,
} from 'lucide-react';
import type { Calendar, CalendarJoinRequest, Event, SharedData } from '@/types';

type CalendarShowProps = {
    calendar: Calendar;
    events: Event[];
    upcomingEvents: Event[];
    isMember: boolean;
    userRole: string | null;
    pendingRequest: CalendarJoinRequest | null;
    pendingRequestsCount: number;
};

const EVENT_TYPES = ['meeting', 'deadline', 'exam', 'presentation', 'event', 'other'] as const;

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

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const ITEMS_PER_PAGE = 10;

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function formatDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CalendarShow({
    calendar,
    events,
    upcomingEvents,
    isMember,
    userRole,
    pendingRequest,
    pendingRequestsCount,
}: CalendarShowProps) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isOwner = userRole === 'owner';

    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [sidebarPage, setSidebarPage] = useState(1);

    const eventDateMap = useMemo(() => {
        const map: Record<string, Event[]> = {};
        for (const event of events) {
            const key = formatDateKey(new Date(event.start_at));
            if (!map[key]) map[key] = [];
            map[key].push(event);
        }
        return map;
    }, [events]);

    const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
    const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);

    const calendarDays = useMemo(() => {
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    }, [firstDay, daysInMonth]);

    const selectedDayEvents = useMemo(() => {
        const dayEvents = selectedDay ? eventDateMap[selectedDay] ?? [] : [];
        if (!typeFilter) return dayEvents;
        return dayEvents.filter((e) => e.type === typeFilter);
    }, [selectedDay, eventDateMap, typeFilter]);

    const filteredUpcomingEvents = useMemo(() => {
        if (!typeFilter) return upcomingEvents;
        return upcomingEvents.filter((e) => e.type === typeFilter);
    }, [upcomingEvents, typeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUpcomingEvents.length / ITEMS_PER_PAGE));
    const paginatedEvents = filteredUpcomingEvents.slice(
        (sidebarPage - 1) * ITEMS_PER_PAGE,
        sidebarPage * ITEMS_PER_PAGE
    );

    function prevMonth() {
        setCurrentMonth((prev) => {
            if (prev.month === 0) return { year: prev.year - 1, month: 11 };
            return { ...prev, month: prev.month - 1 };
        });
        setSelectedDay(null);
    }

    function nextMonth() {
        setCurrentMonth((prev) => {
            if (prev.month === 11) return { year: prev.year + 1, month: 0 };
            return { ...prev, month: prev.month + 1 };
        });
        setSelectedDay(null);
    }

    function handleTypeFilter(type: string | null) {
        setTypeFilter(type);
        setSidebarPage(1);
    }

    function handleJoin() {
        router.post(`/calendar/${calendar.uuid}/join`);
    }

    function handleLeave() {
        router.delete(`/calendar/${calendar.uuid}/leave`);
    }

    const handleCopyLink = useCallback(() => {
        const url = `${window.location.origin}/calendar/${calendar.uuid}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Link copiado!');
        }).catch(() => {
            toast.error('Erro ao copiar link');
        });
    }, [calendar.uuid]);

    const isPrivateLocked = calendar.visibility === 'private' && !isMember;

    const authRedirect = encodeURIComponent(`/calendar/${calendar.uuid}`);
    const loginUrl = `/login?redirect=${authRedirect}`;
    const registerUrl = `/register?redirect=${authRedirect}`;

    return (
        <AppLayout>
            <Head title={calendar.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold">{calendar.name}</h1>
                            <Badge variant={calendar.visibility === 'public' ? 'default' : 'outline'}>
                                {calendar.visibility === 'public' ? 'Público' : 'Privado'}
                            </Badge>
                        </div>
                        {calendar.description && (
                            <p className="mt-2 text-muted-foreground">{calendar.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            {calendar.owner && (
                                <span className="flex items-center gap-1.5">
                                    <Avatar className="size-5">
                                        <AvatarImage src={calendar.owner.avatar ? `/storage/${calendar.owner.avatar}` : undefined} alt={calendar.owner.name} />
                                        <AvatarFallback className="text-[10px]">{calendar.owner.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    Por {calendar.owner.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleCopyLink}>
                            <LinkIcon className="size-4" />
                            Copiar Link
                        </Button>
                        {!isLoggedIn ? (
                            <>
                                <Button
                                    variant="outline"
                                    nativeButton={false}
                                    render={<Link href={loginUrl} />}
                                >
                                    Faça login para participar
                                </Button>
                                <Button
                                    nativeButton={false}
                                    render={<Link href={registerUrl} />}
                                >
                                    Registrar
                                </Button>
                            </>
                        ) : isOwner ? (
                            <>
                                <Button nativeButton={false} render={<Link href={`/calendar/${calendar.uuid}/events/create${selectedDay ? `?date=${selectedDay}` : ''}`} />}>
                                    <PlusIcon className="size-4" />
                                    Criar Evento
                                </Button>
                                <Button
                                    variant="outline"
                                    nativeButton={false}
                                    render={<Link href={`/calendar/${calendar.uuid}/settings`} />}
                                >
                                    <SettingsIcon className="size-4" />
                                    Configurações
                                    {pendingRequestsCount > 0 && (
                                        <Badge variant="destructive" className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs bg-red-500 text-white dark:bg-red-600">
                                            {pendingRequestsCount}
                                        </Badge>
                                    )}
                                </Button>
                            </>
                        ) : isMember ? (
                            <Button variant="destructive" onClick={handleLeave}>
                                Sair do calendário
                            </Button>
                        ) : pendingRequest ? (
                            <Button disabled>
                                Solicitação enviada
                            </Button>
                        ) : (
                            <Button onClick={handleJoin}>
                                Solicitar participação
                            </Button>
                        )}
                    </div>
                </div>

                {isPrivateLocked ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center space-y-4">
                                <LockIcon className="mx-auto size-12 text-muted-foreground/50" />
                                <div>
                                    <h2 className="text-lg font-semibold">Calendário Privado</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Este calendário é privado. Solicite participação para acessar os eventos.
                                    </p>
                                </div>
                                {!isLoggedIn ? (
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            nativeButton={false}
                                            render={<Link href={loginUrl} />}
                                        >
                                            Faça login para solicitar
                                        </Button>
                                        <Button
                                            nativeButton={false}
                                            render={<Link href={registerUrl} />}
                                        >
                                            Registrar
                                        </Button>
                                    </div>
                                ) : pendingRequest ? (
                                    <Button disabled>
                                        Solicitação enviada
                                    </Button>
                                ) : (
                                    <Button onClick={handleJoin}>
                                        Solicitar participação
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                <>
                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleTypeFilter(null)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            typeFilter === null
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        Todos
                    </button>
                    {EVENT_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => handleTypeFilter(typeFilter === type ? null : type)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                typeFilter === type
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 min-w-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                                        <ChevronLeftIcon className="size-4" />
                                    </Button>
                                    <CardTitle>
                                        {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                                        <ChevronRightIcon className="size-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-px">
                                    {WEEKDAYS.map((day) => (
                                        <div
                                            key={day}
                                            className="py-2 text-center text-xs font-medium text-muted-foreground"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                    {calendarDays.map((day, idx) => {
                                        if (day === null) {
                                            return <div key={`empty-${idx}`} />;
                                        }
                                        const dateKey = formatDateKey(
                                            new Date(currentMonth.year, currentMonth.month, day)
                                        );
                                        const hasEvents = !!eventDateMap[dateKey]?.length;
                                        const isSelected = selectedDay === dateKey;
                                        const isToday =
                                            formatDateKey(new Date()) === dateKey;

                                        return (
                                            <button
                                                key={dateKey}
                                                onClick={() =>
                                                    setSelectedDay(isSelected ? null : dateKey)
                                                }
                                                className={`
                                                    relative flex flex-col items-center py-2 text-sm rounded-md transition-colors
                                                    ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                                                    ${isToday && !isSelected ? 'font-bold ring-1 ring-primary' : ''}
                                                `}
                                            >
                                                {day}
                                                {hasEvents && (
                                                    <span
                                                        className={`
                                                            mt-0.5 size-1.5 rounded-full
                                                            ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}
                                                        `}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Day Events */}
                        {selectedDay && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Eventos em{' '}
                                    {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR')}
                                </h3>
                                {selectedDayEvents.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-4 text-center">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Nenhum evento neste dia{typeFilter ? ` do tipo "${TYPE_LABELS[typeFilter]}"` : ''}.
                                        </p>
                                        {isLoggedIn && (isOwner || (calendar.allow_member_event_creation && isMember)) && (
                                            <Button size="sm" nativeButton={false} render={<Link href={`/calendar/${calendar.uuid}/events/create?date=${selectedDay}`} />}>
                                                <PlusIcon className="size-4" />
                                                Criar evento
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedDayEvents.map((event) => (
                                            <Link
                                                key={event.id}
                                                href={`/calendar/${calendar.uuid}/events/${event.id}`}
                                                className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{event.title}</span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={TYPE_COLORS[event.type] ?? TYPE_COLORS.other}
                                                    >
                                                        {TYPE_LABELS[event.type] ?? event.type}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {new Date(event.start_at).toLocaleTimeString('pt-BR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                    {event.end_at && (
                                                        <>
                                                            {' - '}
                                                            {new Date(event.end_at).toLocaleTimeString('pt-BR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </>
                                                    )}
                                                    {event.location && (
                                                        <span className="ml-2 inline-flex items-center gap-1">
                                                            <MapPinIcon className="size-3" />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Events Sidebar */}
                    <div className="min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Próximos eventos</h2>
                            {filteredUpcomingEvents.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {filteredUpcomingEvents.length} evento{filteredUpcomingEvents.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        {filteredUpcomingEvents.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center">
                                <CalendarIcon className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    {typeFilter
                                        ? `Nenhum evento do tipo "${TYPE_LABELS[typeFilter]}"`
                                        : 'Nenhum evento ainda'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {paginatedEvents.map((event) => {
                                        const attending =
                                            event.attendees?.filter((a) => a.pivot.status === 'attending')
                                                .length ?? 0;
                                        const maybe =
                                            event.attendees?.filter((a) => a.pivot.status === 'maybe')
                                                .length ?? 0;
                                        const notAttending =
                                            event.attendees?.filter(
                                                (a) => a.pivot.status === 'not_attending'
                                            ).length ?? 0;

                                        return (
                                            <Link
                                                key={event.id}
                                                href={`/calendar/${calendar.uuid}/events/${event.id}`}
                                                className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <span className="font-medium block truncate">
                                                            {event.title}
                                                        </span>
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            {new Date(event.start_at).toLocaleDateString(
                                                                'pt-BR'
                                                            )}{' '}
                                                            às{' '}
                                                            {new Date(event.start_at).toLocaleTimeString(
                                                                'pt-BR',
                                                                { hour: '2-digit', minute: '2-digit' }
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`shrink-0 ${TYPE_COLORS[event.type] ?? TYPE_COLORS.other}`}
                                                    >
                                                        {TYPE_LABELS[event.type] ?? event.type}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>✓ {attending}</span>
                                                    <span>? {maybe}</span>
                                                    <span>✕ {notAttending}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={sidebarPage === 1}
                                            onClick={() => setSidebarPage((p) => p - 1)}
                                        >
                                            <ChevronLeftIcon className="size-3" />
                                            Anterior
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            {sidebarPage} / {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={sidebarPage === totalPages}
                                            onClick={() => setSidebarPage((p) => p + 1)}
                                        >
                                            Próximo
                                            <ChevronRightIcon className="size-3" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                </>
                )}
            </div>
        </AppLayout>
    );
}
