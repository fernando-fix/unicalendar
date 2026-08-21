import { Head, Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { CalendarIcon, UsersIcon, BellIcon } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Welcome" />
            <Toaster />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2 font-semibold">
                        <CalendarIcon className="size-6" />
                        <span className="text-lg">UniCalendar</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Button nativeButton={false} render={<Link href="/dashboard" />}>
                                Dashboard
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                                    Log in
                                </Button>
                                <Button nativeButton={false} render={<Link href="/register" />}>
                                    Register
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
                    <div className="mx-auto max-w-2xl">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                            <CalendarIcon className="size-4" />
                            Calendários compartilhados para estudantes
                        </div>

                        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            UniCalendar
                        </h1>

                        <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                            Organize seus estudos, provas e reuniões em um calendário
                            compartilhado com sua equipe. Mantenha todos sincronizados e
                            nunca mais perca um compromisso.
                        </p>

                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            {auth.user ? (
                                <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
                                    Ir para o Dashboard
                                </Button>
                            ) : (
                                <>
                                    <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
                                        Começar
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        nativeButton={false}
                                        render={<Link href="/login" />}
                                    >
                                        Já tenho conta
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-24 grid max-w-4xl gap-8 sm:grid-cols-3">
                        <div className="flex flex-col items-center gap-3 rounded-xl border p-6">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <CalendarIcon className="size-6" />
                            </div>
                            <h3 className="font-semibold">Calendários compartilhados</h3>
                            <p className="text-sm text-muted-foreground">
                                Crie e compartilhe calendários com sua equipe ou turma.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-3 rounded-xl border p-6">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UsersIcon className="size-6" />
                            </div>
                            <h3 className="font-semibold">Colaboração em equipe</h3>
                            <p className="text-sm text-muted-foreground">
                                Convide membros, atribua papéis e gerencie eventos juntos.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-3 rounded-xl border p-6">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <BellIcon className="size-6" />
                            </div>
                            <h3 className="font-semibold">Notificações inteligentes</h3>
                            <p className="text-sm text-muted-foreground">
                                Receba lembretes e atualizações sobre os eventos que importam.
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
                    UniCalendar
                </footer>
            </div>
        </>
    );
}
