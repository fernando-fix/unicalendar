import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, UploadIcon, FileIcon, XIcon } from 'lucide-react';

export default function CalendarImport() {
    const { data, setData, post, processing, errors } = useForm<{
        ics_file: File | null;
        name: string;
        visibility: 'public' | 'private';
    }>({
        ics_file: null,
        name: '',
        visibility: 'public',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('ics_file', file);
        setFileName(file?.name ?? null);
    }

    function handleRemoveFile() {
        setData('ics_file', null);
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/calendar/import');
    }

    return (
        <AppLayout>
            <Head title="Importar Calendário" />

            <div className="mx-auto max-w-xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeftIcon className="size-4" />
                    Voltar ao Dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-2">Importar Calendário</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Importe um arquivo ICS do Google Calendar, Outlook ou Apple Calendar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="ics_file">Arquivo ICS</Label>
                        <div
                            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                                fileName
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                            }`}
                        >
                            {fileName ? (
                                <div className="flex items-center gap-3">
                                    <FileIcon className="size-8 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{fileName}</p>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="text-xs text-destructive hover:underline"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <UploadIcon className="size-8 text-muted-foreground/50 mb-2" />
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Clique para selecionar ou arraste um arquivo
                                    </p>
                                    <p className="text-xs text-muted-foreground/70">
                                        Formatos: .ics, .ical, .ifb (máx. 5MB)
                                    </p>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                id="ics_file"
                                type="file"
                                accept=".ics,.ical,.ifb"
                                onChange={handleFileChange}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                        </div>
                        {errors.ics_file && (
                            <p className="text-sm text-destructive">{errors.ics_file}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do calendário (opcional)</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Se omitido, será extraído do arquivo"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
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
                        <Button type="submit" disabled={processing || !data.ics_file}>
                            {processing ? 'Importando...' : 'Importar Calendário'}
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            nativeButton={false}
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
