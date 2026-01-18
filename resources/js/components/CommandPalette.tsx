import React, { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { 
    Search, 
    Sparkles, 
    Briefcase, 
    Newspaper, 
    FileText, 
    ArrowRight,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { gsap } from 'gsap';

interface SearchResult {
    id: number;
    title: string;
    type: 'Service' | 'Project' | 'Insight' | 'Page';
    url: string;
    icon: string;
}

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    // Toggle the menu on Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // GSAP Animation for opening
    useEffect(() => {
        if (open) {
            gsap.fromTo('.cmdk-dialog',
                { opacity: 0, scale: 0.95, y: -20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out' }
            );
        }
    }, [open]);

    // Debounced search
    useEffect(() => {
        if (search.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
                const data = await response.json();
                setResults(data.results);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const onSelect = useCallback((url: string) => {
        setOpen(false);
        router.visit(url);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'Service': return <Sparkles className="mr-2 h-4 w-4 text-blue-500" />;
            case 'Project': return <Briefcase className="mr-2 h-4 w-4 text-purple-500" />;
            case 'Insight': return <Newspaper className="mr-2 h-4 w-4 text-green-500" />;
            default: return <FileText className="mr-2 h-4 w-4 text-gray-500" />;
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setOpen(false)} />
            
            <Command 
                className={cn(
                    "cmdk-dialog relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-2xl",
                    "dark:border-white/10 dark:bg-zinc-900/90"
                )}
                shouldFilter={false} // We handle filtering on backend
            >
                <div className="flex items-center border-b px-4 dark:border-white/10">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Command.Input
                        autoFocus
                        placeholder="Search for services, projects, or insights..."
                        value={search}
                        onValueChange={setSearch}
                        className="flex h-14 w-full bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {loading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">ESC</span>
                    </kbd>
                </div>

                <Command.List className="max-h-[350px] overflow-y-auto overflow-x-hidden p-2">
                    <Command.Empty className="py-12 text-center text-sm">
                        {search.length < 2 ? 'Type at least 2 characters to search...' : 'No results found.'}
                    </Command.Empty>

                    {results.length > 0 && (
                        <Command.Group heading="Suggestions" className="px-2 py-3 text-xs font-medium text-muted-foreground">
                            {results.map((item) => (
                                <Command.Item
                                    key={`${item.type}-${item.id}`}
                                    onSelect={() => onSelect(item.url)}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-xl px-3 py-4 text-sm outline-none",
                                        "transition-all duration-200",
                                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                        "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    {getIcon(item.type)}
                                    <span className="flex-1 font-medium">{item.title}</span>
                                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                                        {item.type}
                                    </span>
                                    <ArrowRight className="ml-2 h-3 w-3 opacity-0 transition-opacity aria-selected:opacity-100" />
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}
                </Command.List>

                <div className="flex items-center justify-between border-t px-4 py-3 text-[10px] text-muted-foreground dark:border-white/10">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border bg-muted px-1.2 py-0.5 font-sans">↑↓</kbd> to navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border bg-muted px-1.2 py-0.5 font-sans">↵</kbd> to select
                        </span>
                    </div>
                    <div className="opacity-50">Global Search v1.0</div>
                </div>
            </Command>
        </div>
    );
};
