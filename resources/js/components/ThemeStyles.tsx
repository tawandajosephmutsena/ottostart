import { usePage } from '@inertiajs/react';

interface ThemeColors {
    background?: string;
    foreground?: string;
    card?: string;
    'card-foreground'?: string;
    popover?: string;
    'popover-foreground'?: string;
    primary?: string;
    'primary-foreground'?: string;
    secondary?: string;
    'secondary-foreground'?: string;
    muted?: string;
    'muted-foreground'?: string;
    accent?: string;
    'accent-foreground'?: string;
    destructive?: string;
    'destructive-foreground'?: string;
    border?: string;
    input?: string;
    ring?: string;
    sidebar?: string;
    'sidebar-foreground'?: string;
    'sidebar-primary'?: string;
    'sidebar-primary-foreground'?: string;
    'sidebar-accent'?: string;
    'sidebar-accent-foreground'?: string;
    'sidebar-border'?: string;
    'sidebar-ring'?: string;
    [key: string]: string | undefined;
}

interface ThemePreset {
    name: string;
    description: string;
    fonts: { sans: string; serif: string; mono: string };
    radius: string;
    light: ThemeColors;
    dark: ThemeColors;
}

interface ThemePresetsConfig {
    default: string;
    themes: Record<string, ThemePreset>;
}

interface ThemeData {
    preset?: ThemePreset;
    presetKey?: string;
}

interface PageProps {
    theme?: ThemeData;
    themePresets?: ThemePresetsConfig;
    settings?: Record<string, Array<{ key: string; value: string | string[] | null }>>;
}

export default function ThemeStyles() {
    const props = usePage<PageProps>().props;
    const { themePresets, settings } = props;

    // Get selected preset key from settings
    const getSettingValue = (key: string): string | null => {
        if (!settings) return null;
        const flatSettings = Object.values(settings).flat();
        const item = flatSettings.find(s => s.key === key);
        if (item) {
            if (Array.isArray(item.value)) return item.value[0] || null;
            return item.value;
        }
        return null;
    };

    const selectedPresetKey = getSettingValue('theme_preset') || themePresets?.default || 'ottostart_default';
    const preset = themePresets?.themes[selectedPresetKey];

    if (!preset) return null;

    const generateCssVariables = (colors: ThemeColors, indent: string = '    '): string => {
        return Object.entries(colors)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => `${indent}--${key}: ${value};`)
            .join('\n');
    };

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
                :root {
${generateCssVariables(preset.light, '                    ')}
                    --radius: ${preset.radius};
                    --font-sans: ${preset.fonts.sans}, sans-serif;
                    --font-serif: ${preset.fonts.serif}, serif;
                    --font-mono: ${preset.fonts.mono}, monospace;
                    
                    /* Agency color mappings */
                    --agency-primary: var(--foreground);
                    --agency-secondary: var(--background);
                    --agency-accent: var(--primary);
                    --agency-accent-soft: var(--secondary);
                    --agency-neutral: var(--background);
                    --agency-dark: var(--foreground);
                }
                
                .dark {
${generateCssVariables(preset.dark, '                    ')}
                    --agency-primary: var(--foreground);
                    --agency-secondary: var(--background);
                    --agency-accent: var(--primary);
                    --agency-accent-soft: var(--secondary);
                    --agency-neutral: var(--muted);
                    --agency-dark: var(--background);
                }
            `
        }} />
    );
}
