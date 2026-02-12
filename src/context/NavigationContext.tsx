import React from "react";
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

const NavigationContext = React.createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locations, setLocations] = React.useState<Location[]>([]);
    const [routes, setRoutes] = React.useState<Route[]>([]);
    const [floors, setFloors] = React.useState<Floor[]>([]);
    const [feedback, setFeedback] = React.useState<Feedback[]>([]);
    const [stats, setStats] = React.useState<UsageStats>({
        totalNavigations: 0,
        routesFound: 0,
        routesNotFound: 0,
        popularDestinations: {}
    });
    const [floorMaps, setFloorMaps] = React.useState<Record<number, string>>({});
    const [edges, setEdges] = React.useState<Edge[]>([]);

    // Initialize from LocalStorage or Defaults
    React.useEffect(() => {
        const storedLocations = localStorage.getItem("locations");
        const storedRoutes = localStorage.getItem("routes_v3");
        const storedFloors = localStorage.getItem("floors");
        const storedFeedback = localStorage.getItem("feedback");
        const storedStats = localStorage.getItem("usageStats");
        const storedMaps = localStorage.getItem("floorMaps");
        const storedEdges = localStorage.getItem("edges");

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
    }, []);

    // Persistence Effects
    React.useEffect(() => {
        if (locations.length > 0) localStorage.setItem("locations", JSON.stringify(locations));
    }, [locations]);

    React.useEffect(() => {
        if (routes.length > 0) localStorage.setItem("routes_v3", JSON.stringify(routes));
    }, [routes]);

    React.useEffect(() => {
        if (floors.length > 0) localStorage.setItem("floors", JSON.stringify(floors));
    }, [floors]);

    React.useEffect(() => {
        localStorage.setItem("feedback", JSON.stringify(feedback));
    }, [feedback]);

    React.useEffect(() => {
        localStorage.setItem("usageStats", JSON.stringify(stats));
    }, [stats]);

    React.useEffect(() => {
        if (Object.keys(floorMaps).length > 0) localStorage.setItem("floorMaps", JSON.stringify(floorMaps));
    }, [floorMaps]);

    React.useEffect(() => {
        localStorage.setItem("edges", JSON.stringify(edges));
    }, [edges]);

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

    const addEdge = (edge: Edge) => {
        setEdges(prev => [...prev, edge]);
    };

    const updateEdge = (oldFrom: string, oldTo: string, updatedEdge: Edge) => {
        setEdges(prev => prev.map(e => (e.from === oldFrom && e.to === oldTo) ? updatedEdge : e));
    };

    const deleteEdge = (from: string, to: string) => {
        setEdges(prev => prev.filter(e => !(e.from === from && e.to === to)));
    };

    const addFloor = (floor: Floor) => {
        setFloors(prev => [...prev, floor]);
    };

    const updateFloor = (id: string, updates: Partial<Floor>) => {
        setFloors(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const deleteFloor = (id: string) => {
        setFloors(prev => prev.filter(f => f.id !== id));
    };

    const setFloorMap = (floor: number, src: string) => {
        setFloorMaps(prev => ({ ...prev, [floor]: src }));
    };

    const addFeedback = (fb: Omit<Feedback, "id" | "timestamp">) => {
        const newFb: Feedback = {
            ...fb,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };
        setFeedback(prev => [newFb, ...prev]);
    };

    const recordNavigation = (success: boolean, toId?: string) => {
        setStats(prev => {
            const newStats = { ...prev };
            newStats.totalNavigations += 1;
            if (success) {
                newStats.routesFound += 1;
                if (toId) {
                    newStats.popularDestinations[toId] = (newStats.popularDestinations[toId] || 0) + 1;
                }
            } else {
                newStats.routesNotFound += 1;
            }
            return newStats;
        });
    };

    const resetToDefaults = () => {
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
    };

    return (
        <NavigationContext.Provider value={{
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
        }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationContext = () => {
    const context = React.useContext(NavigationContext);
    if (!context) throw new Error("useNavigationContext must be used within a NavigationProvider");
    return context;
};
