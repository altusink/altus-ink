'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
}

export default function FileUpload({ onFilesSelected, maxFiles = 10 }: FileUploadProps) {
    const [previews, setPreviews] = useState<string[]>([])
    const [files, setFiles] = useState<File[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const totalFiles = files.length + newFiles.length

            if (totalFiles > maxFiles) {
                alert(`Maximum ${maxFiles} files allowed`)
                return
            }

            const updatedFiles = [...files, ...newFiles]
            setFiles(updatedFiles)
            onFilesSelected(updatedFiles)

            // Generate previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index)
        const updatedPreviews = previews.filter((_, i) => i !== index)

        setFiles(updatedFiles)
        setPreviews(updatedPreviews)
        onFilesSelected(updatedFiles)
    }

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-neon-green transition-colors cursor-pointer relative">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Upload de imagens"
                />
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-neon-green" />
                    <p className="text-text-secondary">Click or drag images here</p>
                    <p className="text-xs text-text-muted">Max {maxFiles} images</p>
                </div>
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5">
                            <Image 
                                src={preview} 
                                alt="preview" 
                                fill 
                                className="object-cover" 
                                unoptimized // Blob URLs don't need optimization
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                                aria-label="Remover imagem"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
