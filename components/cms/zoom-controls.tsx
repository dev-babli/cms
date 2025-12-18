"use client";

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
    zoom: number;
    onZoomChange: (zoom: number) => void;
}

export function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
    const zoomIn = () => {
        onZoomChange(Math.min(200, zoom + 10));
    };

    const zoomOut = () => {
        onZoomChange(Math.max(50, zoom - 10));
    };

    const zoomFit = () => {
        onZoomChange(100);
    };

    return (
        <div className="flex items-center gap-2 border-l border-border pl-3">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                className="h-8 w-8 p-0"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[50px] text-center">{zoom}%</span>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                className="h-8 w-8 p-0"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={zoomFit}
                className="h-8 px-2 text-xs"
                title="Fit to Page"
            >
                <Maximize2 className="w-3 h-3 mr-1" />
                Fit
            </Button>
        </div>
    );
}


