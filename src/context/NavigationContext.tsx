
import React, { createContext, useContext, useEffect, useState } from "react";
import { locations as initialLocations, Location } from "@/data/locations";
import { routes as initialRoutes, Route } from "@/data/routes";
// Import default maps to initialize if needed, though usually we can't easily "read" them as data URIs without fetching.
// So we will just use the paths as strings. If user uploads, we use Data URI strings.

interface NavigationContextType {
    locations: Location[];
    routes: Route[];
    floorMaps: Record<number, string>;
    addLocation: (location: Location) => void;
    updateLocation: (id: string, location: Partial<Location>) => void;
    deleteLocation: (id: string) => void;
    addRoute: (route: Route) => void;
    updateRoute: (from: string, to: string, route: Route) => void;
    deleteRoute: (from: string, to: string) => void;
    setFloorMap: (floor: number, src: string) => void;
    resetToDefaults: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [floorMaps, setFloorMaps] = useState<Record<number, string>>({});

    // Initialize from LocalStorage or Defaults
    useEffect(() => {
        const storedLocations = localStorage.getItem("locations");
        const storedRoutes = localStorage.getItem("routes_v2");
        const storedMaps = localStorage.getItem("floorMaps");

        if (storedLocations) {
            setLocations(JSON.parse(storedLocations));
        } else {
            setLocations(initialLocations);
        }

        if (storedRoutes) {
            setRoutes(JSON.parse(storedRoutes));
        } else {
            setRoutes(initialRoutes);
        }

        if (storedMaps) {
            setFloorMaps(JSON.parse(storedMaps));
        }
        // Note: We don't have default maps as Data URIs easily accessible without fetch, 
        // so we assume the component handles the default "asset" imports if map is missing in context.
    }, []);

    // Persistence Effects
    useEffect(() => {
        if (locations.length > 0) localStorage.setItem("locations", JSON.stringify(locations));
    }, [locations]);

    useEffect(() => {
        if (routes.length > 0) localStorage.setItem("routes_v2", JSON.stringify(routes));
    }, [routes]);

    useEffect(() => {
        if (Object.keys(floorMaps).length > 0) localStorage.setItem("floorMaps", JSON.stringify(floorMaps));
    }, [floorMaps]);

    const addLocation = (location: Location) => {
        setLocations(prev => [...prev, location]);
    };

    const updateLocation = (id: string, updates: Partial<Location>) => {
        setLocations(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const deleteLocation = (id: string) => {
        setLocations(prev => prev.filter(l => l.id !== id));
    };

    const addRoute = (route: Route) => {
        setRoutes(prev => {
            // Remove existing route if any
            const filtered = prev.filter(r => !(r.from === route.from && r.to === route.to));
            return [...filtered, route];
        });
    };

    const updateRoute = (from: string, to: string, updatedRoute: Route) => {
        setRoutes(prev => prev.map(r => (r.from === from && r.to === to) ? updatedRoute : r));
    };

    const deleteRoute = (from: string, to: string) => {
        setRoutes(prev => prev.filter(r => !(r.from === from && r.to === to)));
    };

    const setFloorMap = (floor: number, src: string) => {
        setFloorMaps(prev => ({ ...prev, [floor]: src }));
    };

    const resetToDefaults = () => {
        setLocations(initialLocations);
        setRoutes(initialRoutes);
        setFloorMaps({});
        localStorage.removeItem("locations");
        localStorage.removeItem("routes");
        localStorage.removeItem("floorMaps");
    };

    return (
        <NavigationContext.Provider value={{
            locations,
            routes,
            floorMaps,
            addLocation,
            updateLocation,
            deleteLocation,
            addRoute,
            updateRoute,
            deleteRoute,
            setFloorMap,
            resetToDefaults
        }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationContext = () => {
    const context = useContext(NavigationContext);
    if (!context) throw new Error("useNavigationContext must be used within a NavigationProvider");
    return context;
};
