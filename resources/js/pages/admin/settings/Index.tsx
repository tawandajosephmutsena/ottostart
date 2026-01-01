import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface SettingItem {
    id?: number;
    key: string;
    value: any;
    type: 'text' | 'json' | 'boolean' | 'number' | 'color';
    group_name: string;
}

interface Props {
    settings: Record<string, SettingItem[]>;
}

// Define the known settings structure to auto-generate default values if missing
const SETTINGS_STRUCT = {
    general: [
        { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'Avant-Garde CMS' },
        { key: 'site_description', label: 'Site Description', type: 'textarea', placeholder: 'A Digital Innovation Agency' },
        { key: 'support_email', label: 'Support Email', type: 'text', placeholder: 'hello@example.com' },
    ],
    contact: [
        { key: 'contact_phone', label: 'Phone Number', type: 'text', placeholder: '+1 (555) 000-0000' },
        { key: 'contact_address', label: 'Physical Address', type: 'textarea', placeholder: '123 Innovation Dr...' },
        { key: 'google_maps_url', label: 'Google Maps Embed URL', type: 'text', placeholder: 'https://maps.google.com...' },
    ],
    social: [
        { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'https://linkedin.com/company/...' },
        { key: 'social_twitter', label: 'Twitter / X URL', type: 'text', placeholder: 'https://x.com/...' },
        { key: 'social_github', label: 'GitHub URL', type: 'text', placeholder: 'https://github.com/...' },
        { key: 'social_instagram', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/...' },
    ],
    seo: [
        { key: 'default_meta_title', label: 'Default Meta Title', type: 'text', placeholder: 'Avant-Garde Experience' },
        { key: 'default_meta_description', label: 'Default Meta Description', type: 'textarea', placeholder: 'Default description for SEO...' },
        { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
    ],
    theme: [
        { key: 'primary_color', label: 'Primary Color', type: 'color', placeholder: '#000000' },
        { key: 'accent_color', label: 'Accent Color', type: 'color', placeholder: '#D0FD3E' },
        { key: 'font_heading', label: 'Heading Font', type: 'text', placeholder: 'Inter' },
        { key: 'font_body', label: 'Body Font', type: 'text', placeholder: 'Inter' },
    ]
};

export default function SettingsIndex({ settings }: Props) {
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
    const initialData = Object.entries(SETTINGS_STRUCT).reduce((acc, [group, items]) => {
        items.forEach(item => {
            acc[item.key] = getSettingValue(item.key);
        });
        return acc;
    }, {} as Record<string, any>);

    const { data, setData: _setData } = useForm(initialData);
    const setData = _setData as any;
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        
        // Transform data back to array format for backend
        const settingsToSave = Object.entries(data).map(([key, value]) => {
            // Find which group and type this key belongs to
            let group = 'general';
            
            for (const [g, items] of Object.entries(SETTINGS_STRUCT)) {
                const found = items.find(i => i.key === key);
                if (found) {
                    group = g;
                    break;
                }
            }

            return {
                key,
                value, // The backend handles array wrapping for simple text
                type: 'text',
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
                                        <CardTitle className="capitalize">{group} Settings</CardTitle>
                                        <CardDescription>
                                            Configure your {group} preferences.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {items.map((item) => (
                                            <div key={item.key} className="grid gap-2">
                                                <Label htmlFor={item.key}>{item.label}</Label>
                                                {item.type === 'textarea' ? (
                                                    <Textarea
                                                        id={item.key}
                                                        value={data[item.key]}
                                                        onChange={(e) => setData(item.key, e.target.value)}
                                                        placeholder={item.placeholder}
                                                    />
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id={item.key}
                                                            type={item.type === 'email' ? 'email' : item.type === 'color' ? 'color' : 'text'}
                                                            className={item.type === 'color' ? 'w-12 h-10 p-1 px-1' : ''}
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
                                            </div>
                                        ))}
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
