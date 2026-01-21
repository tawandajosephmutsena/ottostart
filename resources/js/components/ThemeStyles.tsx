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
    [key: string]: unknown; // Index signature for Inertia PageProps compatibility
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

    // Get specific overrides
    const customPrimary = getSettingValue('brand_primary');
    const customAccent = getSettingValue('brand_accent');
    const customBackground = getSettingValue('brand_background');
    const customForeground = getSettingValue('brand_foreground');
    const customBorder = getSettingValue('brand_border');
    const customRing = getSettingValue('brand_ring');
    const customRadius = getSettingValue('border_radius');
    const customFontWeight = getSettingValue('font_weight');
    const customDisplayFont = getSettingValue('font_display');
    const customBodyFont = getSettingValue('font_body');

    // Debug logging (remove in production)
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).DEBUG_THEME) {
        console.log('[ThemeStyles] Custom overrides:', {
            customPrimary, customAccent, customBackground, customForeground,
            customBorder, customRing, customRadius, customFontWeight
        });
    }

    // Generate font loading URL for Bunny Fonts
    const generateFontUrl = () => {
        const fontFamilies = new Set<string>();
        if (customDisplayFont) fontFamilies.add(customDisplayFont);
        if (customBodyFont) fontFamilies.add(customBodyFont);
        if (preset.fonts.sans) fontFamilies.add(preset.fonts.sans);
        if (preset.fonts.serif) fontFamilies.add(preset.fonts.serif);
        if (preset.fonts.mono) fontFamilies.add(preset.fonts.mono);

        const systemFonts = ['serif', 'sans-serif', 'monospace', 'system-ui', 'Georgia', 'Arial', 'Times New Roman'];
        const fontsToLoad = Array.from(fontFamilies).filter(font => !systemFonts.includes(font));

        if (fontsToLoad.length === 0) return null;

        const formattedFonts = fontsToLoad.map(font => {
            const normalized = font.toLowerCase().replace(/\s+/g, '-');
            return `${normalized}:400,500,600,700`;
        }).join('|');

        return `https://fonts.bunny.net/css?family=${formattedFonts}&display=swap`;
    };

    const fontUrl = generateFontUrl();

    const generateCssVariables = (colors: ThemeColors, indent: string = '    '): string => {
        const baseColors = { ...colors };
        
        // Apply overrides if any
        if (customPrimary) baseColors.primary = customPrimary;
        if (customAccent) baseColors.accent = customAccent;
        if (customBackground) baseColors.background = customBackground;
        if (customForeground) baseColors.foreground = customForeground;
        if (customBorder) baseColors.border = customBorder;
        if (customRing) baseColors.ring = customRing;

        return Object.entries(baseColors)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => `${indent}--${key}: ${value};`)
            .join('\n');
    };

    return (
        <>
            {fontUrl && <link rel="stylesheet" href={fontUrl} />}
            <style id="theme-variables" dangerouslySetInnerHTML={{
                __html: `
                    :root {
                        ${generateCssVariables(preset.light, '                        ')}
                        --radius: ${customRadius || preset.radius || '0.5rem'};
                        --font-sans: "${customBodyFont || preset.fonts.sans || 'Inter'}", ui-sans-serif, system-ui, sans-serif;
                        --font-display: "${customDisplayFont || preset.fonts.sans || 'Inter'}", ui-sans-serif, system-ui, sans-serif;
                        --font-serif: "${preset.fonts.serif || 'Georgia'}", ui-serif, Georgia, serif;
                        --font-mono: "${preset.fonts.mono || 'monospace'}", ui-monospace, SFMono-Regular, monospace;
                        --font-weight-base: ${customFontWeight || '400'};
                        
                        /* Agency color mappings */
                        --agency-primary: var(--foreground);
                        --agency-secondary: var(--background);
                        --agency-accent: var(--primary);
                        --agency-accent-soft: var(--secondary);
                        --agency-neutral: var(--background);
                        --agency-dark: var(--foreground);
                    }
                    
                    .dark {
                        ${generateCssVariables(preset.dark, '                        ')}
                        --agency-primary: var(--foreground);
                        --agency-secondary: var(--background);
                        --agency-accent: var(--primary);
                        --agency-accent-soft: var(--secondary);
                        --agency-neutral: var(--muted);
                        --agency-dark: var(--background);
                    }

                    /* Global Font Applications */
                    body {
                        font-family: var(--font-sans);
                        font-weight: var(--font-weight-base);
                    }

                    h1, h2, h3, h4, h5, h6, .font-display {
                        font-family: var(--font-display);
                    }
                `
            }} />
        </>
    );
}
