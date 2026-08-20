import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import {
    CalendarIcon,
    PlusIcon,
    UsersIcon,
    CalendarClockIcon,
    UploadIcon,
} from 'lucide-react';
import type { Calendar } from '@/types';

type CalendarsListProps = {
    ownedCalendars: Calendar[];
    memberCalendars: Calendar[];
};

function CalendarCard({ calendar }: { calendar: Calendar }) {
    const ownerInitials = calendar.owner?.name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? '??';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    <Link
                        href={`/calendar/${calendar.slug}`}
                        className="hover:underline"
                    >
                        {calendar.name}
                    </Link>
                </CardTitle>
                {calendar.description && (
                    <CardDescription>{calendar.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CalendarClockIcon className="size-3.5" />
                            {calendar.upcoming_events_count ?? 0} eventos
                        </span>
                        <span className="flex items-center gap-1">
                            <UsersIcon className="size-3.5" />
                            {calendar.members_count ?? 0} membros
                        </span>
                    </div>
                    {calendar.owner && (
                        <Avatar className="size-6">
                            <AvatarImage src={calendar.owner.avatar ? `/storage/${calendar.owner.avatar}` : undefined} alt={calendar.owner.name} />
                            <AvatarFallback className="text-[10px]">{ownerInitials}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/calendar/${calendar.slug}`} />}
                >
                    Abrir
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function CalendarsList({ ownedCalendars, memberCalendars }: CalendarsListProps) {
    return (
        <AppLayout>
            <Head title="Meus Calendários" />

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Meus Calendários</h1>
                <div className="flex gap-2">
                    <Button variant="outline" render={<Link href="/calendar/import" />}>
                        <UploadIcon className="size-4" />
                        Importar ICS
                    </Button>
                    <Button render={<Link href="/calendar/create" />}>
                        <PlusIcon className="size-4" />
                        Novo Calendário
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-lg font-semibold mb-4">Calendários que administro</h2>
                    {ownedCalendars.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <CalendarIcon className="mx-auto size-10 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">
                                Você ainda não possui calendários.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                render={<Link href="/calendar/create" />}
                            >
                                Criar primeiro calendário
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {ownedCalendars.map((calendar) => (
                                <CalendarCard key={calendar.id} calendar={calendar} />
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-4">Calendários dos quais participo</h2>
                    {memberCalendars.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <UsersIcon className="mx-auto size-10 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">
                                Você ainda não participa de nenhum calendário.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {memberCalendars.map((calendar) => (
                                <CalendarCard key={calendar.id} calendar={calendar} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
