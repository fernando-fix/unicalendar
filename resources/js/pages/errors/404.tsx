import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <>
            <Head title="Página não encontrada" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
                <p className="text-7xl font-bold text-muted-foreground/30">404</p>
                <h1 className="mt-4 text-2xl font-bold">Página não encontrada</h1>
                <p className="mt-2 text-muted-foreground">
                    A página que você procura não existe ou foi movida.
                </p>
                <Button className="mt-6" render={<Link href="/" />}>
                    Voltar ao início
                </Button>
            </div>
        </>
    );
}
