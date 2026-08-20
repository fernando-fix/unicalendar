import { Link } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { CalendarIcon } from 'lucide-react';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <Toaster />
            <div className="mb-8 flex flex-col items-center gap-2">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <CalendarIcon className="size-8" />
                    <span className="text-2xl">UniCalendar</span>
                </Link>
            </div>
            <div className="w-full max-w-md">{children}</div>
        </div>
    );
}
