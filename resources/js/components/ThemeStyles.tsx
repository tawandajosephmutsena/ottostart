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
    theme?: ThemeData & { preset?: string };
    themePresets?: ThemePresetsConfig;
    settings?: Record<string, Array<{ key: string; value: string | string[] | null }>>;
    [key: string]: unknown; // Index signature for Inertia PageProps compatibility
}


export default function ThemeStyles() {
    const props = usePage<PageProps>().props;
    const { themePresets, settings, theme } = props;

    // Get selected preset key from settings (fallback only)
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

    // Priority: 1) theme.preset from shared props (most reliable), 2) settings lookup, 3) default
    const selectedPresetKey = theme?.preset || getSettingValue('theme_preset') || themePresets?.default || 'ottostart_default';
    const preset = themePresets?.themes[selectedPresetKey];

    // Debug logging (remove in production)
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).DEBUG_THEME) {
        console.log('[ThemeStyles] Preset selection:', {
            fromThemeProp: theme?.preset,
            fromSettings: getSettingValue('theme_preset'),
            default: themePresets?.default,
            selected: selectedPresetKey,
            presetFound: !!preset
        });
    }

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
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).DEBUG_THEME) {
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

    /**
     * Generate fallback values for missing color tokens to ensure proper contrast.
     * This prevents undefined CSS variables that cause broken styling.
     */
    const generateFallbacks = (colors: ThemeColors, isDark: boolean): ThemeColors => {
        const bg = colors.background || (isDark ? 'oklch(0.15 0 0)' : 'oklch(0.98 0 0)');
        const fg = colors.foreground || (isDark ? 'oklch(0.95 0 0)' : 'oklch(0.25 0 0)');
        
        const lightDefaults: ThemeColors = {
            'card': bg,
            'card-foreground': fg,
            'popover': bg,
            'popover-foreground': fg,
            'secondary-foreground': 'oklch(0.25 0 0)',
            'muted-foreground': 'oklch(0.45 0 0)',
            'accent-foreground': 'oklch(0.25 0 0)',
            'destructive-foreground': 'oklch(1 0 0)',
            'input': colors.border,
        };
        
        const darkDefaults: ThemeColors = {
            'card': bg,
            'card-foreground': fg,
            'popover': bg,
            'popover-foreground': fg,
            'secondary-foreground': 'oklch(0.95 0 0)',
            'muted-foreground': 'oklch(0.70 0 0)',
            'accent-foreground': 'oklch(0.95 0 0)',
            'destructive-foreground': 'oklch(1 0 0)',
            'input': colors.border,
        };
        
        const defaults = isDark ? darkDefaults : lightDefaults;
        
        // Merge: theme values override defaults
        return { ...defaults, ...colors };
    };

    const generateCssVariables = (colors: ThemeColors, isDark: boolean, indent: string = '    '): string => {
        // First apply fallbacks for missing tokens
        const baseColors = generateFallbacks(colors, isDark);
        
        // Then apply user overrides ONLY if they are non-empty
        // Empty string means use preset colors
        if (customPrimary && customPrimary.trim()) baseColors.primary = customPrimary;
        if (customAccent && customAccent.trim()) baseColors.accent = customAccent;
        if (customBackground && customBackground.trim()) baseColors.background = customBackground;
        if (customForeground && customForeground.trim()) baseColors.foreground = customForeground;
        if (customBorder && customBorder.trim()) baseColors.border = customBorder;
        if (customRing && customRing.trim()) baseColors.ring = customRing;

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
                        ${generateCssVariables(preset.light, false, '                        ')}
                        --radius: ${customRadius || preset.radius || '0.5rem'};
                        --font-sans: "${customBodyFont || preset.fonts.sans || 'Inter'}", ui-sans-serif, system-ui, sans-serif;
                        --font-display: "${customDisplayFont || preset.fonts.sans || 'Inter'}", ui-sans-serif, system-ui, sans-serif;
                        --font-serif: "${preset.fonts.serif || 'Georgia'}", ui-serif, Georgia, serif;
                        --font-mono: "${preset.fonts.mono || 'monospace'}", ui-monospace, SFMono-Regular, monospace;
                        --font-weight-base: ${customFontWeight || '400'};
                        
                        /* Chart colors - derived from theme */
                        --chart-1: ${preset.light.primary || 'oklch(0.55 0.13 43)'};
                        --chart-2: ${preset.light.secondary || 'oklch(0.69 0.16 290)'};
                        --chart-3: ${preset.light.accent || 'oklch(0.88 0.03 93)'};
                        --chart-4: ${preset.light.muted || 'oklch(0.88 0.04 298)'};
                        --chart-5: ${preset.light.ring || 'oklch(0.56 0.13 42)'};
                        
                        /* Agency color mappings */
                        --agency-primary: var(--foreground);
                        --agency-secondary: var(--background);
                        --agency-accent: var(--primary);
                        --agency-accent-soft: var(--secondary);
                        --agency-neutral: var(--background);
                        --agency-dark: var(--foreground);
                        
                        /* Primary RGB for effects (approximate) */
                        --primary-rgb: 194, 94, 46;
                    }
                    
                    .dark {
                        ${generateCssVariables(preset.dark, true, '                        ')}
                        
                        /* Chart colors - dark mode variants */
                        --chart-1: ${preset.dark.primary || 'oklch(0.55 0.13 43)'};
                        --chart-2: ${preset.dark.secondary || 'oklch(0.69 0.16 290)'};
                        --chart-3: ${preset.dark.accent || 'oklch(0.21 0.01 95)'};
                        --chart-4: ${preset.dark.muted || 'oklch(0.31 0.05 289)'};
                        --chart-5: ${preset.dark.ring || 'oklch(0.56 0.13 42)'};
                        
                        /* Agency color mappings - dark mode */
                        --agency-primary: var(--foreground);
                        --agency-secondary: var(--background);
                        --agency-accent: var(--primary);
                        --agency-accent-soft: var(--secondary);
                        --agency-neutral: var(--muted);
                        --agency-dark: var(--background);
                        
                        /* Primary RGB for effects - dark mode */
                        --primary-rgb: 217, 116, 65;
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
