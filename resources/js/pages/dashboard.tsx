import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import {
    PlusIcon,
    CalendarClockIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MapPinIcon,
} from 'lucide-react';
import type { Calendar, Event } from '@/types';

type DashboardProps = {
    ownedCalendars: Calendar[];
    memberCalendars: Calendar[];
    upcomingEvents: Event[];
    allEvents: Event[];
    allCalendars: (Calendar & { color: string; active: boolean })[];
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const TYPE_LABELS: Record<string, string> = {
    meeting: 'Reunião',
    deadline: 'Prazo',
    exam: 'Prova',
    presentation: 'Apresentação',
    event: 'Evento',
    other: 'Outro',
};

const TYPE_COLORS: Record<string, string> = {
    meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    deadline: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    exam: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    presentation: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const CALENDAR_DOT_COLORS: Record<string, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500',
};

const CALENDAR_BADGE_COLORS: Record<string, string> = {
    blue: 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300',
    emerald: 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300',
    purple: 'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300',
    amber: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300',
    rose: 'border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-300',
    cyan: 'border-cyan-300 text-cyan-700 dark:border-cyan-700 dark:text-cyan-300',
    orange: 'border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300',
    indigo: 'border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300',
};

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function formatDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function EventListItem({ event }: { event: Event }) {
    return (
        <Link
            href={`/calendar/${event.calendar?.uuid}/events/${event.id}`}
            className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{event.title}</span>
                    <Badge
                        variant="secondary"
                        className={TYPE_COLORS[event.type] ?? TYPE_COLORS.other}
                    >
                        {TYPE_LABELS[event.type] ?? event.type}
                    </Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(event.start_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(event.start_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    {event.calendar && (
                        <span className="ml-2">· {event.calendar.name}</span>
                    )}
                </div>
            </div>
            {event.attendees && (
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {event.attendees.filter((a) => a.pivot.status === 'attending').length} confirmados
                </div>
            )}
        </Link>
    );
}

export default function Dashboard({
    upcomingEvents,
    allEvents,
    allCalendars,
}: DashboardProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [activeCalendars, setActiveCalendars] = useState<Record<number, boolean>>(() => {
        const initial: Record<number, boolean> = {};
        for (const cal of allCalendars) {
            initial[cal.id] = true;
        }
        return initial;
    });

    const calendarColorMap = useMemo(() => {
        const map: Record<number, string> = {};
        for (const cal of allCalendars) {
            map[cal.id] = cal.color;
        }
        return map;
    }, [allCalendars]);

    const eventDateMap = useMemo(() => {
        const map: Record<string, { event: Event; color: string }[]> = {};
        for (const event of allEvents) {
            if (!activeCalendars[event.calendar_id]) continue;
            const key = formatDateKey(new Date(event.start_at));
            if (!map[key]) map[key] = [];
            map[key].push({ event, color: calendarColorMap[event.calendar_id] ?? 'gray' });
        }
        return map;
    }, [allEvents, activeCalendars, calendarColorMap]);

    const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
    const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);

    const calendarDays = useMemo(() => {
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    }, [firstDay, daysInMonth]);

    const selectedDayEvents = useMemo(() => {
        if (!selectedDay) return [];
        return eventDateMap[selectedDay] ?? [];
    }, [selectedDay, eventDateMap]);

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

    function toggleCalendar(id: number) {
        setActiveCalendars((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Button
                    render={<Link href={selectedDay ? `/events/create?date=${selectedDay}` : '/events/create'} />}
                    nativeButton={false}
                    disabled={!selectedDay}
                    variant={selectedDay ? 'default' : 'outline'}
                >
                    <PlusIcon className="size-4" />
                    Criar Evento
                </Button>
            </div>

            {/* Unified Calendar Grid */}
            {allCalendars.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-3 mb-8">
                    <div className="lg:col-span-2">
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
                                        const dayEvents = eventDateMap[dateKey] ?? [];
                                        const uniqueColors = [...new Set(dayEvents.map((e) => e.color))];
                                        const isSelected = selectedDay === dateKey;
                                        const isToday = formatDateKey(new Date()) === dateKey;

                                        return (
                                            <button
                                                key={dateKey}
                                                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                                                className={`
                                                    relative flex flex-col items-center py-2 text-sm rounded-md transition-colors
                                                    ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                                                    ${isToday && !isSelected ? 'font-bold ring-1 ring-primary' : ''}
                                                `}
                                            >
                                                {day}
                                                {uniqueColors.length > 0 && (
                                                    <span className="mt-0.5 flex gap-0.5">
                                                        {uniqueColors.slice(0, 3).map((color) => (
                                                            <span
                                                                key={color}
                                                                className={`size-1.5 rounded-full ${
                                                                    isSelected ? 'bg-primary-foreground' : CALENDAR_DOT_COLORS[color] ?? 'bg-gray-500'
                                                                }`}
                                                            />
                                                        ))}
                                                    </span>
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
                                        <p className="text-sm text-muted-foreground">
                                            Nenhum evento neste dia.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedDayEvents.map(({ event, color }) => (
                                            <Link
                                                key={event.id}
                                                href={`/calendar/${event.calendar?.uuid}/events/${event.id}`}
                                                className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={CALENDAR_BADGE_COLORS[color] ?? ''}
                                                    >
                                                        {event.calendar?.name}
                                                    </Badge>
                                                    <span className="font-medium">{event.title}</span>
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

                    {/* Sidebar */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Calendários</h2>
                        <div className="space-y-2">
                            {allCalendars.map((cal) => (
                                <label
                                    key={cal.id}
                                    className="flex items-center gap-2 cursor-pointer rounded-lg border p-2 transition-colors hover:bg-muted/50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={activeCalendars[cal.id] ?? true}
                                        onChange={() => toggleCalendar(cal.id)}
                                        className="size-4 rounded border-gray-300"
                                    />
                                    <span className={`size-3 rounded-full ${CALENDAR_DOT_COLORS[cal.color] ?? 'bg-gray-500'}`} />
                                    <Link
                                        href={`/calendar/${cal.uuid}`}
                                        className="text-sm font-medium hover:underline truncate"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {cal.name}
                                    </Link>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                <section>
                    <h2 className="text-lg font-semibold mb-4">Próximos eventos</h2>
                    {upcomingEvents.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <CalendarClockIcon className="mx-auto size-10 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">
                                Nenhum evento programado.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {upcomingEvents.map((event) => (
                                <EventListItem key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
