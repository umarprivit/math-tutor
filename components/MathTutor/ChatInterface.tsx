'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Message } from '@/lib/mockBackend';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    isLoading,
    onSendMessage,
}) => {
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto overflow-x-hidden"
                style={{ maxHeight: 'calc(100vh - 280px)' }}
            >
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-neutral-400 dark:text-neutral-500 mt-10 text-sm">
                            <p>Upload an image or draw a problem to start.</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-3 max-w-[90%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
                            )}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            <div className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                msg.role === 'user'
                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                    : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-neutral-100 dark:border-neutral-700"
                            )}>
                                {msg.type === 'image' && msg.imageUrl ? (
                                    <div className="mb-2 rounded-lg overflow-hidden">
                                        <img src={msg.imageUrl} alt="Uploaded problem" className="max-w-full h-auto" />
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert text-sm max-w-none break-words">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 mr-auto max-w-[80%]"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white dark:bg-neutral-800 p-3 rounded-2xl rounded-tl-none border border-neutral-100 dark:border-neutral-700 flex items-center gap-1">
                                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            <div className="p-4 bg-white/50 dark:bg-neutral-900/20 border-t border-neutral-100 dark:border-neutral-700/50">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus-visible:ring-indigo-500 rounded-xl"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!inputValue.trim() || isLoading}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};
