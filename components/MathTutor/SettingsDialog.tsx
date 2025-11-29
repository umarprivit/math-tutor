'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface SettingsDialogProps {
    onUrlChange: (url: string) => void;
    currentUrl: string;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ onUrlChange, currentUrl }) => {
    const [url, setUrl] = useState(currentUrl);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setUrl(currentUrl);
    }, [currentUrl]);

    const handleSave = () => {
        // Basic validation to remove trailing slash
        const cleanUrl = url.replace(/\/$/, '');
        onUrlChange(cleanUrl);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Backend Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right">
                            API URL
                        </Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://xxxx.ngrok-free.app"
                            className="col-span-3"
                        />
                    </div>
                    <p className="text-xs text-neutral-500 ml-auto col-span-4 text-right">
                        Enter the Ngrok URL from your Colab notebook.
                    </p>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
