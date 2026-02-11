import React, { useRef, useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
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
    const [zoomLevel, setZoomLevel] = useState(initialZoom); // Percentage, 100% = fit height

    // Calculate movement sensitivity based on zoom
    const sensitivity = 0.5;

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX - currentX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartX(e.touches[0].clientX - currentX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX - startX;
        setCurrentX(x);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        // Prevent default to stop scrolling the page while panning the image
        // e.preventDefault(); // Note: might need passive implementation for touch
        const x = e.touches[0].clientX - startX;
        setCurrentX(x);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Handle zoom
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 20, 300)); // Max 300%
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 20, 100)); // Min 100%
    };

    // Reset when image changes
    useEffect(() => {
        setCurrentX(0);
        setZoomLevel(initialZoom);
    }, [imageSrc, initialZoom]);

    // Clean up global events
    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-xl border-2 border-border/50 bg-black/5 select-none touch-none group ${className}`}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            {/* The Panorama Image Layer */}
            <div
                className="w-full h-full absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                    backgroundImage: `url(${imageSrc})`,
                    backgroundPosition: `${currentX}px center`,
                    backgroundSize: `auto ${zoomLevel}%`,
                    backgroundRepeat: 'repeat-x', // Key for continuous "rotation"
                }}
                role="img"
                aria-label="360 Panorama View"
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                    variant="secondary"
                    size="icon"
                    className="bg-black/50 text-white hover:bg-black/70 w-8 h-8 rounded-full backdrop-blur-sm"
                    onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                    disabled={zoomLevel <= 100}
                >
                    <ZoomOut size={16} />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    className="bg-black/50 text-white hover:bg-black/70 w-8 h-8 rounded-full backdrop-blur-sm"
                    onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                    disabled={zoomLevel >= 300}
                >
                    <ZoomIn size={16} />
                </Button>
            </div>

            {/* Hint Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                <div className="bg-black/30 backdrop-blur-[2px] text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 opacity-70">
                    <Move size={14} />
                    Drag to rotate
                </div>
            </div>
        </div>
    );
};

export default PanoramaViewer;
