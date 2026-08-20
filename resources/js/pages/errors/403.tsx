import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
    return (
        <>
            <Head title="Acesso negado" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
                <p className="text-7xl font-bold text-muted-foreground/30">403</p>
                <h1 className="mt-4 text-2xl font-bold">Acesso negado</h1>
                <p className="mt-2 text-muted-foreground">
                    Você não tem permissão para acessar esta página.
                </p>
                <Button className="mt-6" render={<Link href="/" />}>
                    Voltar
                </Button>
            </div>
        </>
    );
}
