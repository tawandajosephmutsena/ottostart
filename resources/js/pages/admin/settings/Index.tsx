import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Save, ImagePlus, X, RotateCcw, Check, Palette } from 'lucide-react';
import { toast } from 'sonner';
import MediaLibrary from '@/components/admin/MediaLibrary';
import { MediaAsset } from '@/types';
import { cn } from '@/lib/utils';

interface SettingItem {
    id?: number;
    key: string;
    value: string | string[] | null;
    type: 'text' | 'json' | 'boolean' | 'number' | 'color';
    group_name: string;
}

interface ThemeColors {
    background?: string;
    foreground?: string;
    primary?: string;
    'primary-foreground'?: string;
    secondary?: string;
    accent?: string;
    muted?: string;
    destructive?: string;
    border?: string;
    ring?: string;
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

interface Props {
    settings: Record<string, SettingItem[]>;
    themePresets?: ThemePresetsConfig;
}

// Define the known settings structure to auto-generate default values if missing
interface StructItem {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'color' | 'email';
    placeholder: string;
    description?: string;
}

const SETTINGS_STRUCT: Record<string, StructItem[]> = {
    general: [
        { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'Avant-Garde CMS' },
        { key: 'site_tagline', label: 'Site Tagline', type: 'text', placeholder: 'Digital Innovation Redefined' },
        { key: 'site_description', label: 'Site Description', type: 'textarea', placeholder: 'A Digital Innovation Agency' },
        { key: 'site_logo', label: 'Site Logo', type: 'image', placeholder: '/logo.svg' },
    ],
    contact: [
        { key: 'contact_email', label: 'Contact Email', type: 'text', placeholder: 'hello@example.com' },
        { key: 'contact_phone', label: 'Phone Number', type: 'text', placeholder: '+1 (555) 000-0000' },
        { key: 'contact_address', label: 'Physical Address', type: 'textarea', placeholder: '123 Innovation Dr...' },
        { key: 'google_maps_url', label: 'Google Maps Embed URL', type: 'text', placeholder: 'https://maps.google.com...' },
    ],
    social: [
        { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text', placeholder: 'https://linkedin.com/company/...' },
        { key: 'twitter_url', label: 'Twitter / X URL', type: 'text', placeholder: 'https://x.com/...' },
        { key: 'github_url', label: 'GitHub URL', type: 'text', placeholder: 'https://github.com/...' },
        { key: 'instagram_url', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/...' },
    ],
    seo: [
        { key: 'default_meta_title', label: 'Default Meta Title', type: 'text', placeholder: 'Avant-Garde Experience' },
        { key: 'default_meta_description', label: 'Default Meta Description', type: 'textarea', placeholder: 'Default description for SEO...' },
        { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
    ],
    theme: [
        { 
            key: 'brand_primary', 
            label: 'Primary Color', 
            type: 'color', 
            placeholder: '#1a1a1a',
            description: 'Used for main backgrounds, navigation bars, and footer content. It defines the core mood of your site.'
        },
        { 
            key: 'brand_secondary', 
            label: 'Secondary Color', 
            type: 'color', 
            placeholder: '#666666',
            description: 'Used for section separators, subtle backgrounds, and secondary UI elements like card borders.'
        },
        { 
            key: 'brand_accent', 
            label: 'Accent Color', 
            type: 'color', 
            placeholder: '#ff6b35',
            description: 'Used for buttons, links, icons, and highlight elements that need to stand out. This is your brand\'s "pop" color.'
        },
        { 
            key: 'brand_neutral', 
            label: 'Neutral Color', 
            type: 'color', 
            placeholder: '#f5f5f5',
            description: 'Used for light backgrounds, input fields, and subtle text contrast on dark backgrounds.'
        },
        { 
            key: 'brand_dark', 
            label: 'Dark Color', 
            type: 'color', 
            placeholder: '#0a0a0a',
            description: 'The foundation for themes with Dark Mode enabled. Affects body backgrounds and high-contrast text elements.'
        },
        { key: 'font_display', label: 'Display Font', type: 'text', placeholder: 'Inter', description: 'Used for headings and titles.' },
        { key: 'font_body', label: 'Body Font', type: 'text', placeholder: 'Inter', description: 'Used for body text and paragraphs.' },
        { key: 'theme_preset', label: 'Active Theme Preset', type: 'text', placeholder: 'ottostart_default' },
    ]
};

export default function SettingsIndex({ settings, themePresets }: Props) {
    // Flatten settings for easier access
    const flatSettings = Object.values(settings).flat();

    const getSettingValue = (key: string) => {
        const item = flatSettings.find(s => s.key === key);
        // If it's stored as an array (JSON cast), take the first item if it's text
        if (item) {
            if (Array.isArray(item.value)) return item.value[0] || '';
            return item.value || '';
        }
        return '';
    };

    // Initialize form data based on SETTINGS_STRUCT
    const initialData = Object.entries(SETTINGS_STRUCT).reduce((acc, [, items]) => {
        items.forEach(item => {
            acc[item.key] = getSettingValue(item.key);
        });
        // Add theme_preset to form data
        acc['theme_preset'] = getSettingValue('theme_preset') || themePresets?.default || 'ottostart_default';
        return acc;
    }, {} as Record<string, string>);

    const { data, setData: _setData } = useForm(initialData);
    const setData = _setData as (key: string, value: string | string[] | null) => void;
    const [processing, setProcessing] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>(initialData['theme_preset']);

    // Apply theme preview when preset changes - respects current dark/light mode
    useEffect(() => {
        if (!themePresets?.themes[selectedPreset]) return;
        
        const preset = themePresets.themes[selectedPreset];
        const root = document.documentElement;
        const isDarkMode = root.classList.contains('dark');
        
        // Choose colors based on current theme mode
        const colors = isDarkMode ? preset.dark : preset.light;
        
        // Store which keys we set so we can clean them up
        const setKeys: string[] = [];
        
        Object.entries(colors).forEach(([key, value]) => {
            if (value) {
                root.style.setProperty(`--${key}`, value);
                setKeys.push(key);
            }
        });
        root.style.setProperty('--radius', preset.radius);
        root.style.setProperty('--font-sans', `${preset.fonts.sans}, sans-serif`);
        
        return () => {
            // Reset inline styles on cleanup - removes ALL inline styles we set
            setKeys.forEach(key => {
                root.style.removeProperty(`--${key}`);
            });
            root.style.removeProperty('--radius');
            root.style.removeProperty('--font-sans');
        };
    }, [selectedPreset, themePresets]);


    const handlePresetSelect = (presetKey: string) => {
        setSelectedPreset(presetKey);
        setData('theme_preset', presetKey);
    };
    
    const handleReset = (group: keyof typeof SETTINGS_STRUCT) => {
        if (confirm(`Are you sure you want to reset ${group} settings to default values?`)) {
            const groupItems = SETTINGS_STRUCT[group];
            if (groupItems) {
                groupItems.forEach((item) => {
                    setData(item.key, item.placeholder);
                });
                toast.info(`${group.charAt(0).toUpperCase() + group.slice(1)} settings reset to defaults. Don't forget to save!`);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        
        // Transform data back to array format for backend
        const settingsToSave = Object.entries(data).map(([key, value]) => {
            // Find which group and type this key belongs to
            let group = 'general';
            let type = 'text';
            
            for (const [g, items] of Object.entries(SETTINGS_STRUCT)) {
                const found = items.find(i => i.key === key);
                if (found) {
                    group = g;
                    type = found.type === 'textarea' ? 'text' : found.type === 'image' ? 'text' : found.type;
                    break;
                }
            }

            return {
                key,
                value, // The backend handles array wrapping for simple text
                type: type === 'image' ? 'text' : type,
                group_name: group
            };
        });

        router.post('/admin/settings', {
            settings: settingsToSave,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Settings saved successfully");
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
                toast.error("Failed to save settings");
            }
        });
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Settings', href: '/admin/settings' },
    ];

    return (
        <AdminLayout title="Site Settings" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                     <p className="text-muted-foreground">Manage your global site configuration</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="contact">Contact Info</TabsTrigger>
                            <TabsTrigger value="social">Social Media</TabsTrigger>
                            <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
                            <TabsTrigger value="theme">Theme & Branding</TabsTrigger>
                        </TabsList>

                        {Object.entries(SETTINGS_STRUCT).map(([group, items]) => (
                            <TabsContent key={group} value={group}>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="capitalize">{group} Settings</CardTitle>
                                                <CardDescription>
                                                    {group === 'theme' 
                                                        ? "Customize your brand's visual identity. These settings are applied globally." 
                                                        : `Configure your ${group} preferences.`}
                                                </CardDescription>
                                            </div>
                                            {(group === 'theme') && (
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleReset(group)}
                                                    className="text-xs"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                                    Reset to Defaults
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Theme Presets Grid - only shown in theme tab */}
                                        {group === 'theme' && themePresets && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Palette className="w-5 h-5 text-primary" />
                                                    <Label className="text-base font-semibold">Choose a Theme Preset</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Select a pre-designed theme to instantly change your site's look. Changes preview immediately.
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {Object.entries(themePresets.themes).map(([key, preset]) => (
                                                        <button
                                                            key={key}
                                                            type="button"
                                                            onClick={() => handlePresetSelect(key)}
                                                            className={cn(
                                                                "relative rounded-lg border-2 p-3 text-left transition-all hover:shadow-md",
                                                                selectedPreset === key
                                                                    ? "border-primary ring-2 ring-primary/20 bg-accent/50"
                                                                    : "border-border hover:border-primary/50"
                                                            )}
                                                        >
                                                            {selectedPreset === key && (
                                                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                                                                    <Check className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                            {/* Color swatches */}
                                                            <div className="flex gap-1 mb-2">
                                                                <div 
                                                                    className="w-6 h-6 rounded-full border border-border/50"
                                                                    style={{ backgroundColor: preset.light.primary }}
                                                                    title="Primary"
                                                                />
                                                                <div 
                                                                    className="w-6 h-6 rounded-full border border-border/50"
                                                                    style={{ backgroundColor: preset.light.accent || preset.light.secondary }}
                                                                    title="Accent"
                                                                />
                                                                <div 
                                                                    className="w-6 h-6 rounded-full border border-border/50"
                                                                    style={{ backgroundColor: preset.light.background }}
                                                                    title="Background"
                                                                />
                                                            </div>
                                                            <p className="font-medium text-sm truncate">{preset.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                                <hr className="my-4" />
                                                <p className="text-xs text-muted-foreground italic">
                                                    Or customize individual colors below to create your own theme.
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Individual Settings Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {items.filter(i => i.key !== 'theme_preset').map((item) => (
                                            <div key={item.key} className={`grid gap-2 ${(item.type === 'textarea' || item.type === 'image') ? 'md:col-span-2' : ''}`}>
                                                <Label htmlFor={item.key} className="text-agency-accent font-medium">{item.label}</Label>
                                                {item.type === 'textarea' ? (
                                                    <Textarea
                                                        id={item.key}
                                                        value={data[item.key]}
                                                        onChange={(e) => setData(item.key, e.target.value)}
                                                        placeholder={item.placeholder}
                                                        className="min-h-[100px]"
                                                    />
                                                ) : item.type === 'image' ? (
                                                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
                                                        <MediaLibrary 
                                                            type="image"
                                                            onSelect={(asset: MediaAsset) => setData(item.key, asset.url)}
                                                            trigger={
                                                                <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted transition-colors relative overflow-hidden bg-background">
                                                                    {data[item.key] ? (
                                                                        <img src={data[item.key]} alt="Logo" className="w-full h-full object-contain p-2" />
                                                                    ) : (
                                                                        <ImagePlus className="w-8 h-8 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                            }
                                                        />
                                                        <div className="flex-1 space-y-2">
                                                            <Input 
                                                                value={data[item.key]} 
                                                                onChange={(e) => setData(item.key, e.target.value)}
                                                                placeholder="/logo.svg"
                                                            />
                                                            <p className="text-[10px] text-muted-foreground">Select from library or enter URL</p>
                                                        </div>
                                                        {data[item.key] && (
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => setData(item.key, '')}>
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id={item.key}
                                                            type={item.type === 'email' ? 'email' : item.type === 'color' ? 'color' : 'text'}
                                                            className={item.type === 'color' ? 'w-14 h-11 p-1 px-1 shrink-0' : ''}
                                                            value={data[item.key]}
                                                            onChange={(e) => setData(item.key, e.target.value)}
                                                            placeholder={item.placeholder}
                                                        />
                                                        {item.type === 'color' && (
                                                            <Input 
                                                                type="text" 
                                                                value={data[item.key]} 
                                                                onChange={(e) => setData(item.key, e.target.value)}
                                                                className="flex-1 font-mono uppercase"
                                                                placeholder={item.placeholder}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                {item.description && (
                                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={processing} size="lg">
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
