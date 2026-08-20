import { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeftIcon, CameraIcon, TrashIcon } from 'lucide-react';

type ProfileProps = {
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
};

export default function ProfileShow({ user }: ProfileProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const profileForm = useForm({
        name: user.name,
        email: user.email,
        current_password: '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const avatarForm = useForm<{ avatar: File | null }>({
        avatar: null,
    });

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const displayAvatar = preview ?? (user.avatar ? `/storage/${user.avatar}` : null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setPreview(URL.createObjectURL(file));
            avatarForm.setData('avatar', file);
            avatarForm.post('/settings/profile/avatar', {
                onSuccess: () => setPreview(null),
                onError: () => setPreview(null),
            });
        }
    }

    function handleRemoveAvatar() {
        router.delete('/settings/profile/avatar', {
            onSuccess: () => setPreview(null),
        });
    }

    function handleProfileSubmit(e: React.FormEvent) {
        e.preventDefault();
        profileForm.put('/settings/profile', {
            onSuccess: () => profileForm.setData('current_password', ''),
        });
    }

    function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            onSuccess: () =>
                passwordForm.setData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                }),
        });
    }

    return (
        <AppLayout>
            <Head title="Perfil" />

            <div className="mx-auto max-w-xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeftIcon className="size-4" />
                    Voltar ao Dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-6">Perfil</h1>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <Avatar className="size-20">
                            <AvatarImage src={displayAvatar ?? undefined} alt={user.name} />
                            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                            <CameraIcon className="size-3.5" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {avatarForm.processing && (
                            <p className="text-xs text-muted-foreground mt-1">Enviando...</p>
                        )}
                        {avatarForm.errors.avatar && (
                            <p className="text-xs text-destructive mt-1">{avatarForm.errors.avatar}</p>
                        )}
                    </div>
                    {user.avatar && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto text-destructive hover:text-destructive"
                            onClick={handleRemoveAvatar}
                        >
                            <TrashIcon className="size-4" />
                        </Button>
                    )}
                </div>

                <Separator className="mb-6" />

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            value={profileForm.data.name}
                            onChange={(e) => profileForm.setData('name', e.target.value)}
                        />
                        {profileForm.errors.name && (
                            <p className="text-sm text-destructive">{profileForm.errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={profileForm.data.email}
                            onChange={(e) => profileForm.setData('email', e.target.value)}
                        />
                        {profileForm.errors.email && (
                            <p className="text-sm text-destructive">{profileForm.errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="current_password">Senha atual</Label>
                        <Input
                            id="current_password"
                            type="password"
                            value={profileForm.data.current_password}
                            onChange={(e) => profileForm.setData('current_password', e.target.value)}
                            placeholder="Necessária para salvar as alterações"
                        />
                        {profileForm.errors.current_password && (
                            <p className="text-sm text-destructive">{profileForm.errors.current_password}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={profileForm.processing}>
                        {profileForm.processing ? 'Salvando...' : 'Salvar Perfil'}
                    </Button>
                </form>

                <Separator className="my-8" />

                <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pw_current">Senha atual</Label>
                        <Input
                            id="pw_current"
                            type="password"
                            value={passwordForm.data.current_password}
                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                        />
                        {passwordForm.errors.current_password && (
                            <p className="text-sm text-destructive">{passwordForm.errors.current_password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pw_new">Nova senha</Label>
                        <Input
                            id="pw_new"
                            type="password"
                            value={passwordForm.data.password}
                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                        />
                        {passwordForm.errors.password && (
                            <p className="text-sm text-destructive">{passwordForm.errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pw_confirm">Confirmar nova senha</Label>
                        <Input
                            id="pw_confirm"
                            type="password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={passwordForm.processing}>
                        {passwordForm.processing ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
