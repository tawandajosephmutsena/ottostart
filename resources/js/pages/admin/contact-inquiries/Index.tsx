import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { MessageSquare, Eye, Trash2, Mail, Calendar } from 'lucide-react';
import React from 'react';
import { PaginatedData } from '@/types';
import { cn } from '@/lib/utils';

interface ContactInquiry {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    created_at: string;
}

interface Props {
    inquiries: PaginatedData<ContactInquiry>;
}

export default function ContactInquiriesIndex({ inquiries }: Props) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Inquiries', href: '/admin/contact-inquiries' },
    ];

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this inquiry?')) {
            router.delete(`/admin/contact-inquiries/${id}`);
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
        <AdminLayout title="Contact Inquiries" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contact Inquiries</h1>
                        <p className="text-muted-foreground">
                            Manage and respond to messages from your website visitors.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="p-4 font-bold">Contact</th>
                                        <th className="p-4 font-bold">Subject</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 font-bold">Date</th>
                                        <th className="p-4 text-right font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inquiries.data.length > 0 ? (
                                        inquiries.data.map((inquiry) => (
                                            <tr key={inquiry.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold">{inquiry.name}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="size-3" /> {inquiry.email}
                                                    </div>
                                                </td>
                                                <td className="p-4 max-w-xs truncate font-medium">
                                                    {inquiry.subject}
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(inquiry.status)}
                                                </td>
                                                <td className="p-4 text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="size-3" /> {new Date(inquiry.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/admin/contact-inquiries/${inquiry.id}`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Eye className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(inquiry.id)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <MessageSquare className="size-8 opacity-20" />
                                                    <p>No inquiries found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {inquiries.links.length > 3 && (
                    <div className="flex justify-center gap-1">
                        {inquiries.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={cn(
                                    "px-4 py-2 text-sm rounded-md transition-colors",
                                    link.active ? "bg-agency-accent text-agency-primary font-bold" : "bg-muted hover:bg-muted/80 text-muted-foreground",
                                    !link.url && "opacity-50 cursor-not-allowed"
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

