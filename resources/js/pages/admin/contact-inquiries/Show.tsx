import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, Calendar, User, MessageSquare, Trash2, Archive, CheckCircle } from 'lucide-react';
import React from 'react';

interface ContactInquiry {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    metadata?: Record<string, unknown> | null;
    created_at: string;
}

interface Props {
    inquiry: ContactInquiry;
}

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

    return (
        <AdminLayout title={`Inquiry from ${inquiry.name}`} breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/contact-inquiries">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">View Inquiry</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(inquiry.status)}
                                <span className="text-xs text-muted-foreground">Received on {new Date(inquiry.created_at).toLocaleString()}</span>
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
                            <CheckCircle className="size-4 mr-2" /> Mark as Replied
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
                            <Trash2 className="size-4 mr-2" /> Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <MessageSquare className="size-5 text-agency-accent" />
                                    {inquiry.subject}
                                </CardTitle>
                                <CardDescription>Message content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    try {
                                        const isJson = inquiry.message?.trim().startsWith('{') || inquiry.message?.trim().startsWith('[');
                                        const data = isJson ? JSON.parse(inquiry.message) : null;
                                        
                                        if (data && typeof data === 'object') {
                                            return (
                                                <div className="grid gap-4">
                                                    {Object.entries(data).map(([key, value]) => (
                                                        <div key={key} className="p-4 rounded-xl bg-muted/30 border border-muted/50">
                                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                                {key.replace(/field_\d+/, '').replace(/_/g, ' ').trim() || key}
                                                            </p>
                                                            <div className="text-sm font-medium leading-relaxed">
                                                                {Array.isArray(value) ? (
                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                        {value.map((v, i) => (
                                                                            <Badge key={i} variant="outline" className="bg-agency-accent/5 font-bold uppercase text-[10px]">
                                                                                {String(v)}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    String(value)
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                    } catch (e) {
                                        // Not JSON, fall back to default rendering
                                    }

                                    return (
                                        <div className="p-6 rounded-2xl bg-muted/30 whitespace-pre-wrap leading-relaxed">
                                            {inquiry.message}
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        <div className="flex justify-center">
                            <Button asChild className="bg-agency-accent text-agency-primary hover:bg-agency-accent/90 px-8 h-12 rounded-full font-bold">
                                <a href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}>
                                    <Mail className="size-4 mr-2" /> Reply via Email
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Sender Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-agency-accent/10 flex items-center justify-center">
                                        <User className="size-5 text-agency-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{inquiry.name}</p>
                                        <p className="text-xs text-muted-foreground">Name</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-agency-accent/10 flex items-center justify-center">
                                        <Mail className="size-5 text-agency-accent" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold truncate">{inquiry.email}</p>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-agency-accent/10 flex items-center justify-center">
                                        <Calendar className="size-5 text-agency-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs text-muted-foreground">Date Received</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {inquiry.metadata && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Technical Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-xs">
                                    {Object.entries(inquiry.metadata || {}).map(([key, value]) => (
                                        <div key={key} className="flex justify-between py-1 border-b border-muted last:border-0">
                                            <span className="text-muted-foreground uppercase font-medium">{key.replace('_', ' ')}</span>
                                            <span className="font-mono text-right truncate max-w-[150px]">{String(value)}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
