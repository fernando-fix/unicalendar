import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function ServerError() {
    return (
        <>
            <Head title="Erro no servidor" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
                <p className="text-7xl font-bold text-muted-foreground/30">500</p>
                <h1 className="mt-4 text-2xl font-bold">Erro no servidor</h1>
                <p className="mt-2 text-muted-foreground">
                    Algo deu errado. Por favor, tente novamente mais tarde.
                </p>
                <Button className="mt-6" nativeButton={false} render={<Link href="/" />}>
                    Voltar ao início
                </Button>
            </div>
        </>
    );
}
