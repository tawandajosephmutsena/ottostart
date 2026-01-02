import { usePage } from '@inertiajs/react';
import React from 'react';

export default function ThemeStyles() {
    const { theme } = usePage<any>().props;

    if (!theme || !theme.colors) return null;

    const { colors, fonts } = theme;

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
                :root {
                    --agency-primary: ${colors.primary};
                    --agency-accent: ${colors.accent};
                    --agency-accent-soft: ${colors.secondary};
                    --agency-neutral: ${colors.neutral};
                    --agency-dark: ${colors.dark};
                    
                    --primary: ${colors.primary};
                    --accent: ${colors.accent};
                    --secondary: ${colors.secondary};
                    --ring: ${colors.accent};
                    
                    ${fonts?.display ? `--font-display: '${fonts.display}', sans-serif;` : ''}
                    ${fonts?.body ? `--font-sans: '${fonts.body}', sans-serif;` : ''}
                }
                
                .dark {
                    --agency-primary: ${colors.neutral};
                    --agency-secondary: ${colors.dark};
                    --background: ${colors.dark};
                    --foreground: ${colors.neutral};
                }
            `
        }} />
    );
}
