import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { props } = usePage<SharedData>();
    const site = props.site || { name: 'Avant-Garde', logo: '', tagline: 'Premium Agency' };
    
    return (
        <div className="flex items-center justify-center">
            {site.logo && site.logo !== '/logo.svg' ? (
                <img src={site.logo} alt={site.name} className="h-8 w-auto object-contain" />
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-agency-accent text-agency-primary">
                    <span className="text-lg font-black italic">{site.name?.charAt(0) || 'A'}</span>
                </div>
            )}
        </div>
    );
}

