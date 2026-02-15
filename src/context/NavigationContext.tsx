import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode, type FC } from "react";
import { locations as initialLocations, Location } from "@/data/locations";
import { routes as initialRoutes, Route } from "@/data/routes";
import { floors as initialFloors, Floor } from "@/data/floors";
import { Feedback, UsageStats } from "@/data/feedback";

export interface Edge {
    from: string;
    to: string;
    weight: number;
    type: "walk" | "stairs" | "lift";
    bidirectional?: boolean;
}

interface NavigationContextType {
    locations: Location[];
    routes: Route[];
    floors: Floor[];
    feedback: Feedback[];
    stats: UsageStats;
    floorMaps: Record<number, string>;
    edges: Edge[];
    addLocation: (location: Location) => void;
    updateLocation: (id: string, location: Partial<Location>) => void;
    deleteLocation: (id: string) => void;
    addRoute: (route: Route) => void;
    updateRoute: (from: string, to: string, route: Route) => void;
    deleteRoute: (from: string, to: string) => void;
    addEdge: (edge: Edge) => void;
    updateEdge: (oldFrom: string, oldTo: string, edge: Edge) => void;
    deleteEdge: (from: string, to: string) => void;
    addFloor: (floor: Floor) => void;
    updateFloor: (id: string, floor: Partial<Floor>) => void;
    deleteFloor: (id: string) => void;
    setFloorMap: (floor: number, src: string) => void;
    addFeedback: (fb: Omit<Feedback, "id" | "timestamp">) => void;
    recordNavigation: (success: boolean, toId?: string) => void;
    resetToDefaults: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<UsageStats>({
        totalNavigations: 0,
        routesFound: 0,
        routesNotFound: 0,
        popularDestinations: {}
    });
    const [floorMaps, setFloorMaps] = useState<Record<number, string>>({});
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from LocalStorage or Defaults
    useEffect(() => {
        let active = true;
        try {
            const storedLocations = localStorage.getItem("locations_v2");
            const storedRoutes = localStorage.getItem("routes_v4");
            const storedFloors = localStorage.getItem("floors_v2");
            const storedFeedback = localStorage.getItem("feedback");
            const storedStats = localStorage.getItem("usageStats");
            const storedMaps = localStorage.getItem("floorMaps");
            const storedEdges = localStorage.getItem("edges_v2");

            if (active) {
                if (storedLocations) setLocations(JSON.parse(storedLocations));
                else setLocations(initialLocations);

                if (storedRoutes) setRoutes(JSON.parse(storedRoutes));
                else setRoutes(initialRoutes);

                if (storedFloors) setFloors(JSON.parse(storedFloors));
                else setFloors(initialFloors);

                if (storedFeedback) setFeedback(JSON.parse(storedFeedback));
                if (storedStats) setStats(JSON.parse(storedStats));
                if (storedMaps) setFloorMaps(JSON.parse(storedMaps));
                if (storedEdges) setEdges(JSON.parse(storedEdges));
                else setEdges([]);

                setIsInitialized(true);
            }
        } catch (e) {
            console.error("Failed to load state from localStorage:", e);
            if (active) {
                setLocations(initialLocations);
                setRoutes(initialRoutes);
                setFloors(initialFloors);
                setIsInitialized(true);
            }
        }
        return () => { active = false; };
    }, []);

    // CONSOLIDATED AND DEBOUNCED PERSISTENCE
    // This is much more efficient than 7 separate effects, 
    // especially for "App Not Responding" prevents.
    useEffect(() => {
        if (!isInitialized) return;

        const timer = setTimeout(() => {
            try {
                localStorage.setItem("locations_v2", JSON.stringify(locations));
                localStorage.setItem("routes_v4", JSON.stringify(routes));
                localStorage.setItem("floors_v2", JSON.stringify(floors));
                localStorage.setItem("feedback", JSON.stringify(feedback));
                localStorage.setItem("usageStats", JSON.stringify(stats));
                localStorage.setItem("floorMaps", JSON.stringify(floorMaps));
                localStorage.setItem("edges_v2", JSON.stringify(edges));
            } catch (e) {
                console.warn("Storage sync failed (likely quota exceeded or private mode):", e);
            }
        }, 1000); // 1s debounce for heavy JSON operations

        return () => clearTimeout(timer);
    }, [locations, routes, floors, feedback, stats, floorMaps, edges, isInitialized]);

    const addLocation = useCallback((location: Location) => {
        setLocations(prev => [...prev, location]);
    }, []);

    const updateLocation = useCallback((id: string, updates: Partial<Location>) => {
        setLocations(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }, []);

    const deleteLocation = useCallback((id: string) => {
        setLocations(prev => prev.filter(l => l.id !== id));
    }, []);

    const addRoute = useCallback((route: Route) => {
        setRoutes(prev => {
            const filtered = prev.filter(r => !(r.from === route.from && r.to === route.to));
            return [...filtered, route];
        });
    }, []);

    const updateRoute = useCallback((from: string, to: string, updatedRoute: Route) => {
        setRoutes(prev => prev.map(r => (r.from === from && r.to === to) ? updatedRoute : r));
    }, []);

    const deleteRoute = useCallback((from: string, to: string) => {
        setRoutes(prev => prev.filter(r => !(r.from === from && r.to === to)));
    }, []);

    const addEdge = useCallback((edge: Edge) => {
        setEdges(prev => [...prev, edge]);
    }, []);

    const updateEdge = useCallback((oldFrom: string, oldTo: string, updatedEdge: Edge) => {
        setEdges(prev => prev.map(e => (e.from === oldFrom && e.to === oldTo) ? updatedEdge : e));
    }, []);

    const deleteEdge = useCallback((from: string, to: string) => {
        setEdges(prev => prev.filter(e => !(e.from === from && e.to === to)));
    }, []);

    const addFloor = useCallback((floor: Floor) => {
        setFloors(prev => [...prev, floor]);
    }, []);

    const updateFloor = useCallback((id: string, updates: Partial<Floor>) => {
        setFloors(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    }, []);

    const deleteFloor = useCallback((id: string) => {
        setFloors(prev => prev.filter(f => f.id !== id));
    }, []);

    const setFloorMap = useCallback((floor: number, src: string) => {
        setFloorMaps(prev => ({ ...prev, [floor]: src }));
    }, []);

    const addFeedback = useCallback((fb: Omit<Feedback, "id" | "timestamp">) => {
        const newFb: Feedback = {
            ...fb,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };
        setFeedback(prev => [newFb, ...prev]);
    }, []);

    const recordNavigation = useCallback((success: boolean, toId?: string) => {
        setStats(prev => {
            const currentStats = prev || { totalNavigations: 0, routesFound: 0, routesNotFound: 0, popularDestinations: {} };
            const newStats = { ...currentStats };
            newStats.totalNavigations = (newStats.totalNavigations || 0) + 1;
            if (success) {
                newStats.routesFound = (newStats.routesFound || 0) + 1;
                if (toId) {
                    if (!newStats.popularDestinations) newStats.popularDestinations = {};
                    newStats.popularDestinations[toId] = (newStats.popularDestinations[toId] || 0) + 1;
                }
            } else {
                newStats.routesNotFound = (newStats.routesNotFound || 0) + 1;
            }
            return newStats;
        });
    }, []);

    const resetToDefaults = useCallback(() => {
        setLocations(initialLocations);
        setRoutes(initialRoutes);
        setFloors(initialFloors);
        setFeedback([]);
        setStats({
            totalNavigations: 0,
            routesFound: 0,
            routesNotFound: 0,
            popularDestinations: {}
        });
        setFloorMaps({});
        setEdges([]);
        localStorage.clear();
    }, []);

    const contextValue = useMemo(() => ({
        locations,
        routes,
        floors,
        feedback,
        stats,
        floorMaps,
        addLocation,
        updateLocation,
        deleteLocation,
        addRoute,
        updateRoute,
        deleteRoute,
        addFloor,
        updateFloor,
        deleteFloor,
        setFloorMap,
        addFeedback,
        recordNavigation,
        resetToDefaults,
        edges,
        addEdge,
        updateEdge,
        deleteEdge
    }), [
        locations, routes, floors, feedback, stats, floorMaps,
        addLocation, updateLocation, deleteLocation,
        addRoute, updateRoute, deleteRoute,
        addFloor, updateFloor, deleteFloor,
        setFloorMap, addFeedback, recordNavigation, resetToDefaults,
        edges, addEdge, updateEdge, deleteEdge
    ]);

    return (
        <NavigationContext.Provider value={contextValue}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationContext = () => {
    const context = useContext(NavigationContext);
    if (!context) throw new Error("useNavigationContext must be used within a NavigationProvider");
    return context;
};
