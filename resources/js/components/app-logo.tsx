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
        <div ref={ref} className={cn("flex items-center", className)}>
            {site.logo && site.logo !== '/logo.svg' ? (
                <img 
                    src={site.logo} 
                    alt={site.name} 
                    className={cn("h-8 w-auto object-contain", logoClassName)} 
                />
            ) : (
                <div className={cn(
                    "flex aspect-square size-8 items-center justify-center rounded-lg bg-agency-accent text-agency-primary",
                    logoClassName
                )}>
                    <span className="text-lg font-black italic">{site.name?.charAt(0) || 'A'}</span>
                </div>
            )}
        </div>
    );
});

AppLogo.displayName = 'AppLogo';

export default AppLogo;

