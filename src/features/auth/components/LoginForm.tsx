'use client';

import { useState, FormEvent } from 'react';
import { useLogin } from '../hooks/useAuth';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { Input } from '@/src/components/shadcn/input';
import { Button } from '@/src/components/shadcn/button';
import { Label } from '@/src/components/shadcn/label';
import { Checkbox } from '@/src/components/shadcn/checkbox';
import { Card, CardContent, CardHeader } from '@/src/components/shadcn/card';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const login = useLogin();
    const { showToast } = useToast();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            showToast('Validation Error', 'Please fill in all fields', 'error');
            return;
        }

        login.mutate(
            { email, password },
            {
                onError: (error: ApiError) => {
                    showToast('Login Failed', error.getMessage(), 'error');
                },
            }
        );
    };

    return (
        <Card className="w-[400px] rounded-none border-border bg-card shadow-2xl">
            <CardHeader className="space-y-4 pb-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-none bg-primary">
                        <Activity className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-foreground">
                            Metis
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Diabetes Treatment Optimization
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    <h2 className="text-sm font-medium text-foreground">Sign in to your account</h2>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs text-muted-foreground">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={login.isPending}
                                className="h-9 rounded-none bg-input pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs text-muted-foreground">
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={login.isPending}
                                className="h-9 rounded-none bg-input pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                disabled={login.isPending}
                                className="h-3.5 w-3.5 rounded-none border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                                Remember me
                            </Label>
                        </div>
                        <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                            Forgot password?
                        </a>
                    </div>

                    <Button
                        type="submit"
                        disabled={login.isPending}
                        className="w-full h-9 rounded-none bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        {login.isPending ? (
                            'Signing in...'
                        ) : (
                            <span className="flex items-center gap-2">
                                Sign In
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="mt-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                        Contact Administrator
                    </a>
                </p>
            </CardContent>
        </Card>
    );
}