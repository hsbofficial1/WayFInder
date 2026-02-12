import React, { useRef, useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Move, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PanoramaViewerProps {
    imageSrc: string;
    className?: string;
    initialZoom?: number;
}

const PanoramaViewer = ({ imageSrc, className = "", initialZoom = 100 }: PanoramaViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(initialZoom);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    // Image Preloader
    useEffect(() => {
        setIsLoading(true);
        setIsError(false);

        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            setIsLoading(false);
        };

        img.onerror = () => {
            setIsLoading(false);
            setIsError(true);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [imageSrc]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isLoading || isError) return;
        setIsDragging(true);
        setStartX(e.clientX - currentX);
    }, [currentX, isLoading, isError]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (isLoading || isError) return;
        setIsDragging(true);
        setStartX(e.touches[0].clientX - currentX);
    }, [currentX, isLoading, isError]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        const x = e.clientX - startX;
        setCurrentX(x);
    }, [isDragging, startX]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const x = e.touches[0].clientX - startX;
        setCurrentX(x);
    }, [isDragging, startX]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleZoomIn = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(prev => Math.min(prev + 20, 300));
    }, []);

    const handleZoomOut = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(prev => Math.max(prev - 20, 100));
    }, []);

    useEffect(() => {
        setCurrentX(0);
        setZoomLevel(initialZoom);
    }, [imageSrc, initialZoom]);

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden bg-muted/20 select-none touch-none group ${className}`}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 backdrop-blur-sm z-10 transition-opacity">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Loading Panorama...</span>
                </div>
            )}

            {/* Error Overlay */}
            {isError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/5 text-destructive z-10 p-6 text-center">
                    <p className="text-sm font-bold">Image failed to load</p>
                    <p className="text-xs opacity-70">Check your network connection</p>
                </div>
            )}

            {/* The Panorama Image Layer */}
            {!isLoading && !isError && (
                <div
                    className="w-full h-full absolute inset-0 transition-opacity duration-500"
                    style={{
                        backgroundImage: `url("${imageSrc}")`,
                        backgroundPosition: `${currentX}px center`,
                        backgroundSize: `auto ${zoomLevel}%`,
                        backgroundRepeat: 'repeat-x',
                        opacity: isLoading ? 0 : 1
                    }}
                    role="img"
                    aria-label="360 Panorama View"
                />
            )}

            {/* Controls Overlay */}
            {!isLoading && !isError && (
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="bg-black/60 text-white hover:bg-black/80 w-10 h-10 rounded-full backdrop-blur-md border-none shadow-xl"
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 100}
                    >
                        <ZoomOut size={20} />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="bg-black/60 text-white hover:bg-black/80 w-10 h-10 rounded-full backdrop-blur-md border-none shadow-xl"
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 300}
                    >
                        <ZoomIn size={20} />
                    </Button>
                </div>
            )}

            {/* Hint Overlay */}
            {!isLoading && !isError && !isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700">
                    <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-3 shadow-2xl animate-pulse">
                        <Move size={16} />
                        DRAG TO ROTATE
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanoramaViewer;
