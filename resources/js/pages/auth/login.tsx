import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import GuestLayout from '@/layouts/guest-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function Login() {
    const pageUrl = usePage<PageProps>().url;
    const redirect = new URL(pageUrl, 'http://localhost').searchParams.get('redirect') ?? '';

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
        redirect,
    });

    const { flash } = usePage<PageProps>().props as PageProps & {
        flash?: { error?: string };
    };

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/login');
    }

    const registerHref = redirect
        ? `/register?redirect=${encodeURIComponent(redirect)}`
        : '/register';

    return (
        <GuestLayout>
            <Head title="Login" />

            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="flex flex-col gap-4">
                        {flash?.error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                {flash.error}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData('remember', checked === true)
                                }
                            />
                            <Label htmlFor="remember" className="text-sm font-normal">
                                Remember me
                            </Label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Signing in...' : 'Sign in'}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                href={registerHref}
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                Register
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
