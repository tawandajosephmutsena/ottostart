import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import React from 'react';

interface AppLogoProps {
    className?: string;
    logoClassName?: string;
}

const AppLogo = React.forwardRef<HTMLDivElement, AppLogoProps>(({ className, logoClassName }, ref) => {
    const { props } = usePage<SharedData>();
    const site = props.site || { name: 'Avant-Garde', logo: '', tagline: 'Premium Agency' };
    
    return (
        <div 
            ref={ref} 
            className={cn("flex items-center justify-start overflow-hidden shrink-0", className)}
            style={{ height: '32px', maxWidth: '180px', minWidth: '32px' }}
        >
            {site.logo ? (
                <img 
                    src={site.logo} 
                    alt={site.name} 
                    className={cn(
                        "h-full w-auto object-contain block",
                        // Ensure SVGs have at least some width if w-auto is failing
                        site.logo.endsWith('.svg') && "min-w-[120px]",
                        logoClassName
                    )} 
                    loading="eager"
                    decoding="async"
                    data-critical="true"
                    onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                    }}
                />
            ) : null}
            {!site.logo || site.logo === '' ? (
                <div className={cn(
                    "flex aspect-square h-full items-center justify-center rounded-lg bg-agency-accent text-agency-primary shadow-sm shrink-0",
                    logoClassName
                )}>
                    <span className="text-xs font-black italic leading-none">{site.name?.charAt(0) || 'A'}</span>
                </div>
            ) : null}
        </div>
    );
});

AppLogo.displayName = 'AppLogo';

export default AppLogo;

