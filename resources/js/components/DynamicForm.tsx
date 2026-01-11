import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormField {
    type: 'text' | 'email' | 'number' | 'textarea' | 'tel' | 'city' | 'address';
    label: string;
    required: boolean;
    placeholder?: string;
    name: string;
}

interface DynamicFormProps {
    title?: string;
    description?: string;
    fields: FormField[];
    submitText?: string;
    successMessage?: string;
    className?: string;
}

export default function DynamicForm({
    title,
    description,
    fields = [],
    submitText = 'Submit',
    successMessage = 'Thank you for your submission!',
    className
}: DynamicFormProps) {
    const initialData: Record<string, string> = {};
    if (title) {
        initialData.form_title = title;
    }
    fields.forEach(field => {
        initialData[field.name || field.label.toLowerCase().replace(/\s+/g, '_')] = '';
    });

    const { data, setData, post, processing, reset, errors } = useForm(initialData);

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(successMessage);
                setSubmitted(true);
                reset();
            },
            onError: () => {
                toast.error('There was an error submitting the form. Please check the fields.');
            }
        });
    };

    if (submitted) {
        return (
            <div className={cn("text-center p-12 bg-agency-accent/5 rounded-3xl border border-agency-accent/20", className)}>
                <div className="size-16 bg-agency-accent rounded-full flex items-center justify-center mx-auto mb-6 text-agency-primary">
                    <Send className="size-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{successMessage}</h3>
                <p className="text-muted-foreground mb-8">We've received your information and will get back to you shortly.</p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Send another message</Button>
            </div>
        );
    }

    return (
        <div className={cn("bg-white dark:bg-agency-dark rounded-3xl border border-border p-8 md:p-12 shadow-2xl shadow-black/5", className)}>
            {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
            {description && <p className="text-muted-foreground mb-8">{description}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map((field, index) => {
                        const fieldName = field.name || field.label.toLowerCase().replace(/\s+/g, '_');
                        const isFullWidth = field.type === 'textarea' || field.type === 'address';

                        return (
                            <div key={index} className={cn("space-y-2", isFullWidth && "md:col-span-2")}>
                                <Label htmlFor={fieldName} className="text-xs uppercase tracking-widest font-bold opacity-70">
                                    {field.label} {field.required && <span className="text-agency-accent">*</span>}
                                </Label>
                                
                                {field.type === 'textarea' ? (
                                    <Textarea
                                        id={fieldName}
                                        value={data[fieldName]}
                                        onChange={e => setData(fieldName, e.target.value)}
                                        placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}...`}
                                        required={field.required}
                                        className="bg-muted/30 border-none min-h-[120px] focus-visible:ring-agency-accent"
                                    />
                                ) : (
                                    <Input
                                        id={fieldName}
                                        type={field.type === 'city' || field.type === 'address' ? 'text' : field.type}
                                        value={data[fieldName]}
                                        onChange={e => setData(fieldName, e.target.value)}
                                        placeholder={field.placeholder || `Your ${field.label.toLowerCase()}...`}
                                        required={field.required}
                                        className="bg-muted/30 border-none h-12 focus-visible:ring-agency-accent"
                                    />
                                )}
                                {errors[fieldName] && <p className="text-xs text-destructive">{errors[fieldName]}</p>}
                            </div>
                        );
                    })}
                </div>

                <Button 
                    type="submit" 
                    disabled={processing} 
                    className="w-full h-14 bg-agency-primary dark:bg-agency-accent text-white dark:text-agency-primary font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform"
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        submitText
                    )}
                </Button>
            </form>
        </div>
    );
}
