import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { MediaAsset } from '@/types';

interface Props {
    folder?: string;
    onSuccess?: (files: MediaAsset[]) => void;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export default function MediaUpload({ folder = 'uploads', onSuccess }: Props) {
    const [files, setFiles] = useState<UploadingFile[]>([]);
    const [uploading, setUploading] = useState(false);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                progress: 0,
                status: 'pending' as const
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const startUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);

        const formData = new FormData();
        files.forEach((f, i) => {
            if (f.status === 'pending') {
                formData.append(`files[${i}]`, f.file);
            }
        });
        formData.append('folder', folder);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/admin/media', true);
        
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) xhr.setRequestHeader('X-CSRF-TOKEN', token);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setFiles(prev => prev.map(f => f.status === 'pending' || f.status === 'uploading' ? { ...f, progress, status: 'uploading' } : f));
            }
        };

        xhr.onload = () => {
            setUploading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                setFiles(prev => prev.map(f => ({ ...f, status: 'success', progress: 100 })));
                if (onSuccess) onSuccess(response.files);
                setTimeout(() => setFiles([]), 3000);
            } else {
                setFiles(prev => prev.map(f => ({ ...f, status: 'error', error: 'Upload failed' })));
            }
        };

        xhr.onerror = () => {
            setUploading(false);
            setFiles(prev => prev.map(f => ({ ...f, status: 'error', error: 'Network error' })));
        };

        xhr.send(formData);
    };

    return (
        <div className="space-y-4">
            <div 
                className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors relative cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                <input 
                    id="file-upload"
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={onFileChange}
                    accept="image/*,video/*,application/pdf"
                    title="Upload files"
                />
                <div className="size-16 rounded-full bg-agency-accent/10 flex items-center justify-center mb-4 text-agency-accent">
                    <Upload className="size-8" />
                </div>
                <h3 className="text-lg font-bold">Click or drag files to upload</h3>
                <p className="text-sm text-muted-foreground">Images, Videos, PDFs (Max 50MB per file)</p>
            </div>

            {files.length > 0 && (
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="size-10 rounded border bg-muted flex items-center justify-center text-muted-foreground">
                                    {f.file.type.startsWith('image/') ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium truncate">{f.file.name}</span>
                                        <div className="flex items-center gap-2">
                                            {f.status === 'success' && <CheckCircle2 className="size-3.5 text-green-500" />}
                                            {f.status === 'error' && <AlertCircle className="size-3.5 text-destructive" title={f.error} />}
                                            {f.status === 'pending' && !uploading && (
                                                <X className="size-3.5 cursor-pointer hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeFile(i); }} />
                                            )}
                                        </div>
                                    </div>
                                    {(f.status === 'uploading' || f.status === 'success') && <Progress value={f.progress} className="h-1" />}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setFiles([])} disabled={uploading}>Clear All</Button>
                            <Button onClick={startUpload} disabled={uploading || files.every(f => f.status === 'success')}>
                                {uploading ? 'Uploading...' : 'Start Upload'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
