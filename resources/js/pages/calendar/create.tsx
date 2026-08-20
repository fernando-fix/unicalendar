import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon } from 'lucide-react';

export default function CalendarCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        visibility: 'public' as 'public' | 'private',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/calendar');
    }

    return (
        <AppLayout>
            <Head title="Criar Calendário" />

            <div className="mx-auto max-w-xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeftIcon className="size-4" />
                    Voltar ao Dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-6">Criar Calendário</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nome do calendário"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Descrição opcional"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="visibility">Visibilidade</Label>
                        <select
                            id="visibility"
                            value={data.visibility}
                            onChange={(e) =>
                                setData('visibility', e.target.value as 'public' | 'private')
                            }
                            className="flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                        >
                            <option value="public">Público</option>
                            <option value="private">Privado</option>
                        </select>
                        {errors.visibility && (
                            <p className="text-sm text-destructive">{errors.visibility}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Criando...' : 'Criar Calendário'}
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            render={<Link href="/dashboard" />}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
