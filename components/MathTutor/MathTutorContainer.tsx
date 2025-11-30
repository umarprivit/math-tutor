'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, sendMessage, sendImage } from '@/lib/api';
import { ChatInterface } from '@/components/MathTutor/ChatInterface';
import { ImageUpload } from '@/components/MathTutor/ImageUpload';
import { CanvasBoard } from '@/components/MathTutor/CanvasBoard';
import { SettingsDialog } from './SettingsDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Upload, PenTool, MessageSquare } from 'lucide-react';

export const MathTutorContainer = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [mode, setMode] = useState<'upload' | 'canvas'>('upload');
    const [isLoading, setIsLoading] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');

    // Load URL from local storage and server config on mount
    useEffect(() => {
        const savedUrl = localStorage.getItem('math_tutor_api_url');
        if (savedUrl) {
            setBaseUrl(savedUrl);
        }

        // Fetch config from server
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.backendUrl && data.backendUrl !== savedUrl) {
                    console.log('Loaded config from server:', data.backendUrl);
                    setBaseUrl(data.backendUrl);
                    localStorage.setItem('math_tutor_api_url', data.backendUrl);
                }
            })
            .catch(err => console.error('Failed to load config:', err));
    }, []);

    const handleUrlChange = (newUrl: string) => {
        setBaseUrl(newUrl);
        localStorage.setItem('math_tutor_api_url', newUrl);
    };

    const handleInputSubmit = async (input: string | File) => {
        if (!baseUrl) {
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Please set the Backend API URL in the settings (gear icon) first.",
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
            return;
        }

        setIsLoading(true);

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input instanceof File ? 'Uploaded an image' : input,
            type: input instanceof File ? 'image' : 'text',
            imageUrl: input instanceof File ? URL.createObjectURL(input) : undefined,
            timestamp: Date.now(),
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);

        // Get backend response
        let response: Message;
        if (input instanceof File) {
            response = await sendImage(input, "Solve this problem", baseUrl);
        } else {
            response = await sendMessage(input, baseUrl);
        }

        setMessages((prev) => [...prev, response]);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-8 font-sans text-neutral-900 dark:text-neutral-100">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        {/* <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white dark:text-black font-bold text-xl font-mono">M</span>
                        </div> */}
                        <div className="flex items-center text-2xl font-bold tracking-tight">
                            <span className="text-black dark:text-white mr-0.5">Math</span>
                            <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-md text-xl">Tutor</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <SettingsDialog currentUrl={baseUrl} onUrlChange={handleUrlChange} />
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <MessageSquare className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                    {/* Left Panel: Input Area */}
                    <Card className="lg:col-span-2 p-1 overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 rounded-3xl flex flex-col">
                        <Tabs defaultValue="upload" className="w-full flex-1 flex flex-col" onValueChange={(v) => setMode(v as 'upload' | 'canvas')}>
                            <div className="px-6 pt-6 pb-2">
                                <TabsList className="grid w-full grid-cols-2 bg-neutral-100 dark:bg-neutral-900/50 p-1 rounded-2xl">
                                    <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm transition-all duration-300">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Image
                                    </TabsTrigger>
                                    <TabsTrigger value="canvas" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm transition-all duration-300">
                                        <PenTool className="w-4 h-4 mr-2" />
                                        Draw Problem
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {mode === 'upload' ? (
                                        <motion.div
                                            key="upload"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full p-6"
                                        >
                                            <ImageUpload onSubmit={handleInputSubmit} isLoading={isLoading} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="canvas"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full p-6"
                                        >
                                            <CanvasBoard onSubmit={handleInputSubmit} isLoading={isLoading} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Tabs>
                    </Card>

                    {/* Right Panel: Chat Interface */}
                    <Card className="lg:col-span-1 border-0 shadow-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 rounded-3xl overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-700/50 bg-white/50 dark:bg-neutral-900/20">
                            <h2 className="font-semibold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Tutor Chat</h2>
                        </div>
                        <ChatInterface
                            messages={messages}
                            isLoading={isLoading}
                            onSendMessage={handleInputSubmit}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};
