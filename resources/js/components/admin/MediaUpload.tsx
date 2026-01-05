import React, { useState, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Upload, 
    X, 
    FileText, 
    Image as ImageIcon, 
    CheckCircle2, 
    AlertCircle,
    Tag,
    FolderPlus,
    Loader2
} from 'lucide-react';
import { MediaAsset } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    folder?: string;
    onSuccess?: (files: MediaAsset[]) => void;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    acceptedTypes?: string[];
    enableTagging?: boolean;
    enableFolders?: boolean;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    tags?: string[];
    folder?: string;
}

export default function MediaUpload({ 
    folder = 'uploads', 
    onSuccess,
    maxFiles = 20,
    maxFileSize = 200,
    acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
    enableTagging = true,
    enableFolders = true
}: Props) {
    const [files, setFiles] = useState<UploadingFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [globalTags, setGlobalTags] = useState<string[]>([]);
    const [globalFolder, setGlobalFolder] = useState(folder);
    const [newTag, setNewTag] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): string | null => {
        // Check file size
        console.log(`Validating file: ${file.name}, Size: ${file.size}, Max: ${maxFileSize}`);
        if (file.size > maxFileSize * 1024 * 1024) {
            return `File size exceeds ${maxFileSize}MB limit`;
        }

        // Check file type
        const isValidType = acceptedTypes.some(type => {
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.slice(0, -1));
            }
            return file.type === type;
        });

        if (!isValidType) {
            // Fallback: Check extension for common video files if video/* is accepted
            const ext = file.name.split('.').pop()?.toLowerCase();
            const videoAccepted = acceptedTypes.some(t => t.startsWith('video/'));
            
            if (videoAccepted && (ext === 'mp4' || ext === 'mov' || ext === 'webm')) {
                console.log(`MIME check failed (${file.type}) but extension .${ext} is allowed.`);
                return null;
            }

            console.error(`File type validation failed. File: ${file.name}, Type: ${file.type}, Accepted: ${acceptedTypes.join(', ')}`);
            return `File type ${file.type} is not supported`;
        }

        return null;
    }, [maxFileSize, acceptedTypes]);

    const processFiles = useCallback((fileList: FileList | File[]) => {
        const newFiles: UploadingFile[] = [];
        const errors: string[] = [];

        Array.from(fileList).forEach(file => {
            if (files.length + newFiles.length >= maxFiles) {
                errors.push(`Maximum ${maxFiles} files allowed`);
                return;
            }

            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
                return;
            }

            newFiles.push({
                file,
                progress: 0,
                status: 'pending',
                tags: [...globalTags],
                folder: globalFolder
            });
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        if (newFiles.length > 0) {
            setFiles(prev => [...prev, ...newFiles]);
        }
    }, [files.length, maxFiles, validateFile, globalTags, globalFolder]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // const updateFileTags = (index: number, tags: string[]) => {
    //     setFiles(prev => prev.map((f, i) => i === index ? { ...f, tags } : f));
    // };

    const updateFileFolder = (index: number, folder: string) => {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, folder } : f));
    };

    const addGlobalTag = () => {
        if (newTag && !globalTags.includes(newTag)) {
            const updatedTags = [...globalTags, newTag];
            setGlobalTags(updatedTags);
            // Apply to all pending files
            setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, tags: updatedTags } : f));
            setNewTag('');
        }
    };

    const removeGlobalTag = (tag: string) => {
        const updatedTags = globalTags.filter(t => t !== tag);
        setGlobalTags(updatedTags);
        // Update all pending files
        setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, tags: updatedTags } : f));
    };

    const { props } = usePage();
    const csrfToken = props.csrf_token as string;

    const startUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);

        // Upload files in batches of 5
        const batchSize = 5;
        const batches = [];
        for (let i = 0; i < files.length; i += batchSize) {
            batches.push(files.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            await Promise.all(batch.map((fileData) => {
                const globalIndex = files.indexOf(fileData);
                return uploadSingleFile(fileData, globalIndex, csrfToken);
            }));
        }

        setUploading(false);
    };

    const uploadSingleFile = async (fileData: UploadingFile, index: number, token: string): Promise<void> => {
        if (fileData.status !== 'pending') return;

        const formData = new FormData();
        formData.append('files[]', fileData.file);
        formData.append('folder', fileData.folder || globalFolder);
        
        if (fileData.tags && fileData.tags.length > 0) {
            fileData.tags.forEach(tag => {
                formData.append('tags[]', tag);
            });
        }

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/admin/media', true);
            
            if (token) xhr.setRequestHeader('X-CSRF-TOKEN', token);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setFiles(prev => prev.map((f, i) => 
                        i === index ? { ...f, progress, status: 'uploading' } : f
                    ));
                }
            };

            xhr.onload = () => {
                let response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch {
                    // console.error('Failed to parse response:', e);
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    setFiles(prev => prev.map((f, i) => 
                        i === index ? { ...f, status: 'success', progress: 100 } : f
                    ));
                    
                    if (onSuccess && response && response.file) {
                        onSuccess([response.file]);
                    } else if (onSuccess && response && response.files) {
                        // Handle multiple files response if needed, although we upload one by one here
                        onSuccess(response.files);
                    }
                } else {
                    const errorMessage = response?.message || response?.error || `Upload failed (${xhr.status})`;
                    setFiles(prev => prev.map((f, i) => 
                        i === index ? { ...f, status: 'error', error: errorMessage } : f
                    ));
                }
                resolve();
            };

            xhr.onerror = () => {
                setFiles(prev => prev.map((f, i) => 
                    i === index ? { ...f, status: 'error', error: 'Network error' } : f
                ));
                resolve();
            };

            xhr.send(formData);
        });
    };

    return (
        <div className="space-y-6">
            {/* Global Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enableFolders && (
                    <div>
                        <Label htmlFor="global-folder">Upload Folder</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                id="global-folder"
                                value={globalFolder}
                                onChange={(e) => setGlobalFolder(e.target.value)}
                                placeholder="uploads"
                            />
                            <Button variant="outline" size="icon">
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {enableTagging && (
                    <div>
                        <Label htmlFor="global-tags">Global Tags</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                id="global-tags"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add tag..."
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGlobalTag())}
                            />
                            <Button variant="outline" onClick={addGlobalTag}>
                                Add
                            </Button>
                        </div>
                        {globalTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {globalTags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => removeGlobalTag(tag)} 
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Drop Zone */}
            <div 
                className={cn(
                    "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors relative cursor-pointer",
                    dragActive 
                        ? "border-agency-accent bg-agency-accent/10" 
                        : "border-muted-foreground/25 bg-muted/20 hover:bg-muted/40"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={onFileChange}
                    accept={acceptedTypes.join(',')}
                    title="Upload files"
                />
                <div className={cn(
                    "size-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                    dragActive 
                        ? "bg-agency-accent text-agency-primary" 
                        : "bg-agency-accent/10 text-agency-accent"
                )}>
                    <Upload className="size-8" />
                </div>
                <h3 className="text-lg font-bold">
                    {dragActive ? 'Drop files here' : 'Click or drag files to upload'}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                    {acceptedTypes.join(', ')} (Max {maxFileSize}MB per file, {maxFiles} files max)
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Files to Upload ({files.length})</h4>
                            <div className="flex gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setFiles([])} 
                                    disabled={uploading}
                                >
                                    Clear All
                                </Button>
                                <Button 
                                    onClick={startUpload} 
                                    disabled={uploading || files.every(f => f.status === 'success')}
                                    size="sm"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Start Upload'
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {files.map((f, i) => (
                                <div key={i} className="border rounded-lg p-3">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded border bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                                            {f.file.type.startsWith('image/') ? (
                                                <ImageIcon className="size-6" />
                                            ) : (
                                                <FileText className="size-6" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium truncate">{f.file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(f.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {f.status === 'success' && (
                                                        <CheckCircle2 className="size-4 text-green-500" />
                                                    )}
                                                    {f.status === 'error' && (
                                                        <AlertCircle 
                                                            className="size-4 text-destructive" 
                                                        />
                                                    )}
                                                    {f.status === 'pending' && !uploading && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeFile(i)}
                                                            className="h-6 w-6"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {(f.status === 'uploading' || f.status === 'success') && (
                                                <Progress value={f.progress} className="h-1" />
                                            )}

                                            {f.status === 'error' && f.error && (
                                                <p className="text-xs text-destructive">{f.error}</p>
                                            )}

                                            {/* Individual file settings */}
                                            {f.status === 'pending' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t">
                                                    {enableFolders && (
                                                        <div>
                                                            <Label className="text-xs">Folder</Label>
                                                            <Input
                                                                value={f.folder || ''}
                                                                onChange={(e) => updateFileFolder(i, e.target.value)}
                                                                placeholder="uploads"
                                                                className="h-7 text-xs"
                                                            />
                                                        </div>
                                                    )}
                                                    {enableTagging && (
                                                        <div>
                                                            <Label className="text-xs">Tags</Label>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {f.tags?.map(tag => (
                                                                    <Badge key={tag} variant="secondary" className="text-xs h-5">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
