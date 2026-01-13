import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, Calendar, User, Trash2, Archive, CheckCircle, Globe, Clock, Building, Briefcase, FileText } from 'lucide-react';
import React from 'react';

interface ContactInquiry {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    metadata?: {
        all_fields?: Record<string, unknown>;
        ip_address?: string;
        user_agent?: string;
        submitted_at?: string;
        referer?: string;
    } | null;
    created_at: string;
}

interface Props {
    inquiry: ContactInquiry;
}

// Get an appropriate icon for a field name
const getFieldIcon = (fieldName: string) => {
    const lower = fieldName.toLowerCase();
    if (lower.includes('name') || lower.includes('full')) return User;
    if (lower.includes('email')) return Mail;
    if (lower.includes('company') || lower.includes('organization')) return Building;
    if (lower.includes('profession') || lower.includes('job') || lower.includes('role')) return Briefcase;
    if (lower.includes('date') || lower.includes('time')) return Clock;
    if (lower.includes('website') || lower.includes('url')) return Globe;
    return FileText;
};

// Format field name to readable label
const formatFieldName = (name: string): string => {
    return name
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, c => c.toUpperCase());
};

// Format field value for display
const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) {
        return value.map(v => String(v).replace(/-/g, ' ')).join(', ');
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
};

export default function ContactInquiryShow({ inquiry }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Inquiries', href: '/admin/contact-inquiries' },
        { title: inquiry.name, href: `/admin/contact-inquiries/${inquiry.id}` },
    ];

    const updateStatus = (status: string) => {
        router.put(`/admin/contact-inquiries/${inquiry.id}`, { status });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this inquiry?')) {
            router.delete(`/admin/contact-inquiries/${inquiry.id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge variant="destructive">New</Badge>;
            case 'read': return <Badge variant="secondary">Read</Badge>;
            case 'replied': return <Badge variant="default" className="bg-green-500">Replied</Badge>;
            case 'archived': return <Badge variant="outline">Archived</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Get all fields from metadata, or empty object
    const allFields = inquiry.metadata?.all_fields || {};
    const hasFields = Object.keys(allFields).length > 0;

    return (
        <AdminLayout title={`Inquiry from ${inquiry.name}`} breadcrumbs={breadcrumbs}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/contact-inquiries">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{inquiry.subject}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                {getStatusBadge(inquiry.status)}
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    {new Date(inquiry.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatus('replied')}
                            className={inquiry.status === 'replied' ? 'bg-green-50/50 text-green-600 border-green-200' : ''}
                        >
                            <CheckCircle className="size-4 mr-2" /> Replied
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatus('archived')}
                        >
                            <Archive className="size-4 mr-2" /> Archive
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={handleDelete}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Sender Info Bar */}
                <Card className="bg-gradient-to-r from-agency-accent/5 to-transparent border-agency-accent/20">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-agency-accent/20 flex items-center justify-center">
                                    <User className="size-6 text-agency-accent" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{inquiry.name}</p>
                                    <a 
                                        href={`mailto:${inquiry.email}`} 
                                        className="text-sm text-agency-accent hover:underline"
                                    >
                                        {inquiry.email}
                                    </a>
                                </div>
                            </div>
                            <Button asChild className="bg-agency-accent text-agency-primary hover:bg-agency-accent/90 rounded-full font-bold px-6">
                                <a href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}>
                                    <Mail className="size-4 mr-2" /> Reply via Email
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content: All Submitted Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {hasFields && (
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">Submission Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {Object.entries(allFields).map(([key, value]) => {
                                            const Icon = getFieldIcon(key);
                                            const isLongText = typeof value === 'string' && value.length > 100;
                                            
                                            return (
                                                <div 
                                                    key={key} 
                                                    className={`p-4 rounded-xl bg-muted/40 border border-muted hover:border-agency-accent/30 transition-colors ${isLongText ? 'sm:col-span-2' : ''}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="size-8 rounded-lg bg-agency-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Icon className="size-4 text-agency-accent" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                                                {formatFieldName(key)}
                                                            </p>
                                                            {Array.isArray(value) ? (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {(value as unknown[]).map((v, i) => (
                                                                        <Badge 
                                                                            key={i} 
                                                                            variant="secondary" 
                                                                            className="text-xs font-medium capitalize"
                                                                        >
                                                                            {String(v).replace(/-/g, ' ')}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm font-medium leading-relaxed break-words">
                                                                    {formatValue(value)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Fallback: Show message if no metadata fields */}
                        {!hasFields && inquiry.message && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Message</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-6 rounded-xl bg-muted/40 whitespace-pre-wrap leading-relaxed">
                                        {inquiry.message}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar: Technical Info */}
                    <div className="space-y-6">
                        {inquiry.metadata && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Technical Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-xs">
                                    {inquiry.metadata.submitted_at && (
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                                                <Clock className="size-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Submitted</p>
                                                <p className="font-medium">{inquiry.metadata.submitted_at}</p>
                                            </div>
                                        </div>
                                    )}
                                    {inquiry.metadata.ip_address && (
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                                                <Globe className="size-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">IP Address</p>
                                                <p className="font-mono font-medium">{inquiry.metadata.ip_address}</p>
                                            </div>
                                        </div>
                                    )}
                                    {inquiry.metadata.referer && (
                                        <div className="flex items-start gap-3">
                                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                <ArrowLeft className="size-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-muted-foreground">Source Page</p>
                                                <p className="font-medium truncate" title={inquiry.metadata.referer}>
                                                    {inquiry.metadata.referer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {inquiry.metadata.user_agent && (
                                        <div className="pt-3 border-t">
                                            <p className="text-muted-foreground mb-1">Browser</p>
                                            <p className="font-mono text-[10px] leading-relaxed break-all opacity-70">
                                                {inquiry.metadata.user_agent}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
