'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    onSubmit: (file: File) => void;
    isLoading: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onSubmit, isLoading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleSubmit = () => {
        if (selectedFile) {
            onSubmit(selectedFile);
            clearFile();
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.div
                        key="upload-area"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md"
                    >
                        <div
                            className={cn(
                                "relative group cursor-pointer flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out",
                                dragActive
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]"
                                    : "border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleChange}
                            />

                            <div className="flex flex-col items-center text-center p-6 space-y-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                                    dragActive ? "bg-indigo-100 text-indigo-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20"
                                )}>
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
                                        Upload a math problem
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Drag & drop or click to browse
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview-area"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md space-y-6"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10 aspect-[4/3] bg-neutral-900">
                            <img
                                src={previewUrl!}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                            <button
                                onClick={clearFile}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                size="lg"
                                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 h-12 text-base font-medium"
                            >
                                {isLoading ? (
                                    "Analyzing..."
                                ) : (
                                    <>
                                        Solve Problem <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
