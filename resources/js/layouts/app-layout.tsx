import { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { type PageProps, type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import {
    MenuIcon,
    SunIcon,
    MoonIcon,
    LogOutIcon,
    SettingsIcon,
    LayoutDashboardIcon,
    CalendarIcon,
    UserIcon,
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth, totalPendingRequests } = usePage<SharedData>().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    function toggleDark() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    function handleLogout() {
        router.post('/logout');
    }

    const initials = auth.user?.name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? '??';

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
        { href: '/calendars', label: 'Calendários', icon: CalendarIcon },
        { href: '/settings/profile', label: 'Perfil', icon: UserIcon },
        { href: '/settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Toaster />
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <CalendarIcon className="size-5" />
                            <span className="hidden sm:inline">UniCalendar</span>
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex">
                            {navLinks.map((link) => (
                                <Button
                                    key={link.href}
                                    variant="ghost"
                                    size="sm"
                                    nativeButton={false}
                                    render={
                                        <Link href={link.href} />
                                    }
                                >
                                    <link.icon className="size-4" />
                                    {link.label}
                                    {link.href === '/calendars' && totalPendingRequests > 0 && (
                                        <Badge variant="destructive" className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs bg-red-500 text-white dark:bg-red-600">
                                            {totalPendingRequests}
                                        </Badge>
                                    )}
                                </Button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleDark}
                            aria-label="Toggle dark mode"
                        >
                            <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="sm" className="gap-2" />
                                }
                            >
                                <Avatar className="size-6">
                                    <AvatarImage
                                        src={auth.user?.avatar ? `/storage/${auth.user.avatar}` : undefined}
                                        alt={auth.user?.name ?? ''}
                                    />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline">
                                    {auth.user?.name}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem render={<Link href="/settings" />}>
                                    <SettingsIcon className="mr-2 size-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOutIcon className="mr-2 size-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden"
                                    />
                                }
                            >
                                <MenuIcon className="size-5" />
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <CalendarIcon className="size-5" />
                                        UniCalendar
                                    </SheetTitle>
                                </SheetHeader>
                                <Separator className="my-4" />
                                <nav className="flex flex-col gap-1">
                                    {navLinks.map((link) => (
                                        <Button
                                            key={link.href}
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start"
                                            render={
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setMobileOpen(false)}
                                                />
                                            }
                                        >
                                            <link.icon className="mr-2 size-4" />
                                            {link.label}
                                            {link.href === '/calendars' && totalPendingRequests > 0 && (
                                                <Badge variant="destructive" className="ml-auto h-5 min-w-5 rounded-full px-1 text-xs bg-red-500 text-white dark:bg-red-600">
                                                    {totalPendingRequests}
                                                </Badge>
                                            )}
                                        </Button>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}
