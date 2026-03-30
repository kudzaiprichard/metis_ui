'use client';

import { useState } from 'react';
import { Check, Copy, Mail, Wand2 } from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';
import { useToast } from '@/src/components/shared/ui/toast';
import { User } from '../../api/auth.types';

interface QuickActionsCardProps {
    user: User;
}

type CopyKey = 'email' | 'id';

export function QuickActionsCard({ user }: QuickActionsCardProps) {
    const { showToast } = useToast();
    const [copied, setCopied] = useState<CopyKey | null>(null);

    const copy = async (key: CopyKey, value: string, label: string) => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            showToast('Copy unavailable', 'Clipboard access is not supported here.', 'error');
            return;
        }
        try {
            await navigator.clipboard.writeText(value);
            setCopied(key);
            window.setTimeout(() => setCopied(null), 1500);
            showToast('Copied', `${label} copied to clipboard.`, 'success');
        } catch {
            showToast('Copy failed', 'Could not access the clipboard.', 'error');
        }
    };

    return (
        <section
            aria-labelledby="quick-actions-heading"
            className="flex flex-col gap-2 rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-4"
        >
            <header className="flex items-center gap-2 mb-1">
                <Wand2 className="h-3.5 w-3.5 text-primary" />
                <h3
                    id="quick-actions-heading"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                    Quick actions
                </h3>
            </header>

            <Button
                type="button"
                variant="ghost"
                onClick={() => copy('email', user.email, 'Email')}
                className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground/85 hover:bg-white/[0.06] hover:text-foreground text-sm font-medium justify-start"
            >
                {copied === 'email' ? (
                    <>
                        <Check className="h-3.5 w-3.5 mr-2 text-primary" />
                        Email copied
                    </>
                ) : (
                    <>
                        <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Copy email address
                    </>
                )}
            </Button>

            <Button
                type="button"
                variant="ghost"
                onClick={() => copy('id', user.id, 'User ID')}
                className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground/85 hover:bg-white/[0.06] hover:text-foreground text-sm font-medium justify-start"
            >
                {copied === 'id' ? (
                    <>
                        <Check className="h-3.5 w-3.5 mr-2 text-primary" />
                        ID copied
                    </>
                ) : (
                    <>
                        <Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Copy user ID
                    </>
                )}
            </Button>
        </section>
    );
}
