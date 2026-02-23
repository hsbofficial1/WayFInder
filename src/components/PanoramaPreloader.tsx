
import { useEffect, useState, useRef } from "react";
import { useNavigationContext } from "@/context/NavigationContext";

/**
 * Global component to pre-cache panorama images in the background.
 * This significantly speeds up transitions during navigation.
 */
export const PanoramaPreloader = () => {
    const { graphNodes } = useNavigationContext();
    const preloadedRef = useRef<Set<string>>(new Set());
    const [preloadedCount, setPreloadedCount] = useState(0);

    useEffect(() => {
        if (!graphNodes || graphNodes.length === 0) return;

        // Get all unique panorama images from nodes
        const allImages = Array.from(new Set(
            graphNodes
                .map(node => node.image)
                .filter(Boolean) as string[]
        ));

        // Strategy: Preload in chunks to avoid slamming the network
        const preloadImages = async () => {
            for (const src of allImages) {
                if (preloadedRef.current.has(src)) continue;

                // Create a low priority image object to trigger browser cache
                const img = new Image();
                img.src = src;

                // We don't necessarily need to wait for each one to finish, 
                // but we update state to track progress if needed later
                img.onload = () => {
                    preloadedRef.current.add(src);
                    setPreloadedCount(c => c + 1);
                };
            }
        };

        // Delay preloading slightly so it doesn't compete with initial page load
        const timeout = setTimeout(() => {
            preloadImages();
        }, 3000);

        return () => clearTimeout(timeout);
    }, [graphNodes]);

    return null; // Silent component
};
