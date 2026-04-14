'use client';

import { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/src/components/shadcn/input';
import { Button } from '@/src/components/shadcn/button';
import { Search, Loader2, X } from 'lucide-react';

interface DebouncedSearchInputProps {
    onSearch: (value: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    delay?: number;
    className?: string;
}

export function DebouncedSearchInput({
                                         onSearch,
                                         isLoading = false,
                                         placeholder = 'Search...',
                                         delay = 300,
                                         className = '',
                                     }: DebouncedSearchInputProps) {
    const [value, setValue] = useState('');

    const debouncedOnSearch = useDebouncedCallback((v: string) => {
        onSearch(v);
    }, delay);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        debouncedOnSearch(v);
    };

    const handleClear = () => {
        setValue('');
        onSearch('');
    };

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className="h-8 w-[220px] rounded-lg bg-white/[0.04] border-white/[0.12] text-sm text-foreground placeholder:text-muted-foreground/40 pl-8 pr-8"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                ) : value ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="h-5 w-5 rounded-lg text-muted-foreground hover:text-foreground p-0"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                ) : null}
            </div>
        </div>
    );
}