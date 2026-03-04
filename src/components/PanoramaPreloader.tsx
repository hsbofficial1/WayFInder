
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

        // Strategy: Preload sequentially with a delay to avoid blocking active navigation
        const preloadImages = async () => {
            // Prioritize Entry points and main junctions
            const prioritized = allImages.sort((a, b) => {
                const isAPrio = a.toLowerCase().includes('gate') || a.toLowerCase().includes('reception') || a.toLowerCase().includes('j1');
                const isBPrio = b.toLowerCase().includes('gate') || b.toLowerCase().includes('reception') || b.toLowerCase().includes('j1');
                if (isAPrio && !isBPrio) return -1;
                if (!isAPrio && isBPrio) return 1;
                return 0;
            });

            for (const src of prioritized) {
                if (preloadedRef.current.has(src)) continue;

                try {
                    await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.src = src;
                        img.onload = resolve;
                        img.onerror = resolve; // Continue even if one fails
                        // Cleanup after 30s timeout
                        setTimeout(resolve, 30000);
                    });

                    preloadedRef.current.add(src);
                    setPreloadedCount(c => c + 1);

                    // Wait 2 seconds before starting next background load
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (e) {
                    console.warn("Preload failed for", src);
                }
            }
        };

        // Start preloading after things settle down
        const timeout = setTimeout(() => {
            preloadImages();
        }, 5000);

        return () => clearTimeout(timeout);
    }, [graphNodes]);

    return null; // Silent component
};
