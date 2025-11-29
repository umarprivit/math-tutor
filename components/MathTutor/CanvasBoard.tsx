'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Check, RotateCcw, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasBoardProps {
    onSubmit: (file: File) => void;
    isLoading: boolean;
}

export const CanvasBoard: React.FC<CanvasBoardProps> = ({ onSubmit, isLoading }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawing, setHasDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    // Refs to access current state inside event listeners without triggering re-renders
    const toolRef = useRef(tool);
    const colorRef = useRef(color);

    useEffect(() => {
        toolRef.current = tool;
        colorRef.current = color;

        // Apply settings immediately when state changes
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = tool === 'eraser' ? 20 : 3;
                ctx.strokeStyle = color;
                ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
            }
        }
    }, [tool, color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Save current content
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.drawImage(canvas, 0, 0);
                }

                // Set new dimensions
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;

                // Restore content
                ctx.drawImage(tempCanvas, 0, 0);

                // Restore context settings (they are lost on resize)
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = toolRef.current === 'eraser' ? 20 : 3;
                ctx.strokeStyle = colorRef.current;
                ctx.globalCompositeOperation = toolRef.current === 'eraser' ? 'destination-out' : 'source-over';
            }
        };

        // Initial resize
        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []); // Run once on mount

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        if (tool === 'pen') {
            setHasDrawing(true);
        }

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = canvas.getBoundingClientRect();
        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top,
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawing(false);
    };

    const handleSubmit = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a temporary canvas to composite with white background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
            // Fill white background
            tempCtx.fillStyle = '#FFFFFF';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            // Draw original canvas on top
            tempCtx.drawImage(canvas, 0, 0);

            tempCanvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'drawing.png', { type: 'image/png' });
                    onSubmit(file);
                }
            });
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg mr-2">
                        <Button
                            variant={tool === 'pen' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setTool('pen')}
                            className={cn("w-8 h-8 rounded-md", tool === 'pen' && "bg-white dark:bg-neutral-700 text-indigo-600 shadow-sm")}
                        >
                            <PenTool className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={tool === 'eraser' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setTool('eraser')}
                            className={cn("w-8 h-8 rounded-md", tool === 'eraser' && "bg-white dark:bg-neutral-700 text-indigo-600 shadow-sm")}
                        >
                            <Eraser className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className={cn("flex gap-2 transition-opacity duration-200", tool === 'eraser' ? "opacity-50 pointer-events-none" : "opacity-100")}>
                        <Button
                            variant={color === '#000000' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setColor('#000000')}
                            className={cn("w-8 h-8 rounded-full", color === '#000000' && "bg-black hover:bg-neutral-800")}
                        >
                            <div className="w-3 h-3 rounded-full bg-white" />
                        </Button>
                        <Button
                            variant={color === '#ef4444' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setColor('#ef4444')}
                            className={cn("w-8 h-8 rounded-full border-red-500 text-red-500", color === '#ef4444' && "bg-red-500 hover:bg-red-600 text-white border-transparent")}
                        >
                            <div className="w-3 h-3 rounded-full bg-current" />
                        </Button>
                        <Button
                            variant={color === '#3b82f6' ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setColor('#3b82f6')}
                            className={cn("w-8 h-8 rounded-full border-blue-500 text-blue-500", color === '#3b82f6' && "bg-blue-500 hover:bg-blue-600 text-white border-transparent")}
                        >
                            <div className="w-3 h-3 rounded-full bg-current" />
                        </Button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCanvas}
                        className="text-neutral-500 hover:text-red-500"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-inner cursor-crosshair touch-none">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full"
                />
                {!hasDrawing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-300 dark:text-neutral-700">
                        <div className="flex flex-col items-center gap-2">
                            <PenTool className="w-8 h-8 opacity-50" />
                            <span className="text-sm font-medium">Start drawing here</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={!hasDrawing || isLoading}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 px-8"
                >
                    {isLoading ? "Processing..." : "Done"} <Check className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};
