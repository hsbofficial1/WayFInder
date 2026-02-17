import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode, type FC } from "react";
import { locations as initialLocations, Location } from "@/data/locations";
import { routes as initialRoutes, Route } from "@/data/routes";
import { floors as initialFloors, Floor } from "@/data/floors";
import { Feedback, UsageStats } from "@/data/feedback";

import { supabase } from "@/integrations/supabase/client";
import { BuildingNode, BuildingEdge } from "@/types/building";

export interface Edge {
    id?: string;
    from: string;
    to: string;
    weight: number;
    type: "walk" | "stairs" | "lift";
    bidirectional?: boolean;
    // Extra fields to match BuildingEdge
    distance_steps?: number;
    instruction?: string;
    edge_type?: string;
    turn?: string;
    floor_id?: string;
}

interface NavigationContextType {
    locations: Location[];
    routes: Route[];
    floors: Floor[];
    feedback: Feedback[];
    stats: UsageStats;
    floorMaps: Record<number, string>;
    graphNodes: BuildingNode[];
    graphEdges: BuildingEdge[];
    edges: Edge[]; // Keeping for backward compatibility if needed, but we should prefer graphEdges
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
    // Graph Methods
    fetchGraphData: () => Promise<void>;
    addGraphNode: (node: BuildingNode) => Promise<void>;
    updateGraphNode: (id: string, updates: Partial<BuildingNode>) => Promise<void>;
    deleteGraphNode: (id: string) => Promise<void>;
    addGraphEdge: (edge: BuildingEdge) => Promise<void>;
    updateGraphEdge: (id: string, updates: Partial<BuildingEdge>) => Promise<void>;
    deleteGraphEdge: (id: string) => Promise<void>;
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

    // Graph State
    const [graphNodes, setGraphNodes] = useState<BuildingNode[]>([]);
    const [graphEdges, setGraphEdges] = useState<BuildingEdge[]>([]);

    const [isInitialized, setIsInitialized] = useState(false);

    // Fetch Graph Data from Supabase
    const fetchGraphData = useCallback(async () => {
        try {
            // @ts-ignore
            const { data: nodes, error: nodeErr } = await supabase.from('building_nodes').select('*');
            if (nodeErr) throw nodeErr;

            // @ts-ignore
            const { data: edgesData, error: edgeErr } = await supabase.from('building_edges').select('*');
            if (edgeErr) throw edgeErr;

            if (nodes) {
                // Map DB snake_case to Camel/Local types if needed
                // Our schema matches BuildingNode interface except for extra fields which are optional
                const mappedNodes = (nodes as any[]).map(n => ({
                    ...n,
                    node_id: n.id, // DB 'id' -> App 'node_id' 
                    floor: n.floor_id, // DB 'floor_id' -> App 'floor'
                }));
                // @ts-ignore
                setGraphNodes(mappedNodes as BuildingNode[]);
            }

            if (edgesData) {
                const mappedEdges = (edgesData as any[]).map(e => ({
                    ...e,
                    from: e.from_node_id, // DB 'from_node_id' -> App 'from'
                    to: e.to_node_id, // DB 'to_node_id' -> App 'to'
                }));
                // @ts-ignore
                setGraphEdges(mappedEdges as BuildingEdge[]);
            }

        } catch (error) {
            console.error("Error fetching graph data:", error);
        }
    }, []);

    // Initialize from LocalStorage or Defaults
    useEffect(() => {
        let active = true;
        try {
            const storedLocations = localStorage.getItem("locations_v5");
            const storedRoutes = localStorage.getItem("routes_v7");
            const storedFloors = localStorage.getItem("floors_v5");
            const storedFeedback = localStorage.getItem("feedback");
            const storedStats = localStorage.getItem("usageStats");
            const storedMaps = localStorage.getItem("floorMaps");
            const storedEdges = localStorage.getItem("edges_v5");

            if (active) {
                if (storedLocations) setLocations(JSON.parse(storedLocations));
                else {
                    console.log("Loading initial locations from file:", initialLocations.length);
                    setLocations(initialLocations); // Fallback to file
                }

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
                fetchGraphData(); // Fetch from Supabase
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
    }, [fetchGraphData]);

    // CONSOLIDATED AND DEBOUNCED PERSISTENCE
    useEffect(() => {
        if (!isInitialized) return;

        const timer = setTimeout(() => {
            try {
                localStorage.setItem("locations_v5", JSON.stringify(locations));
                localStorage.setItem("routes_v7", JSON.stringify(routes));
                localStorage.setItem("floors_v5", JSON.stringify(floors));
                localStorage.setItem("feedback", JSON.stringify(feedback));
                localStorage.setItem("usageStats", JSON.stringify(stats));
                localStorage.setItem("floorMaps", JSON.stringify(floorMaps));
                localStorage.setItem("edges_v5", JSON.stringify(edges));
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
        setGraphNodes([]); // Or reset to building_data.ts
        setGraphEdges([]);
    }, []);

    // Graph Actions (Supabase)
    const addGraphNode = useCallback(async (node: BuildingNode) => {
        // @ts-ignore
        const { error } = await supabase.from('building_nodes').insert({
            id: node.node_id,
            node_type: node.node_type,
            name: node.name,
            floor_id: node.floor,
            junction_id: node.junction_id,
            x: node.x,
            y: node.y,
            image: node.image,
            cue: node.cue,
            is_unavailable: node.is_unavailable
        });
        if (error) throw error;
        setGraphNodes(prev => [...prev, node]);
    }, []);

    const updateGraphNode = useCallback(async (id: string, updates: Partial<BuildingNode>) => {
        // @ts-ignore
        const { error } = await supabase.from('building_nodes').update({
            // Map updates to DB columns if necessary
            ...(updates.name && { name: updates.name }),
            ...(updates.node_type && { node_type: updates.node_type }),
            ...(updates.floor && { floor_id: updates.floor }),
            ...(updates.junction_id && { junction_id: updates.junction_id }),
            ...(updates.x !== undefined && { x: updates.x }),
            ...(updates.y !== undefined && { y: updates.y }),
            ...(updates.image !== undefined && { image: updates.image }),
            ...(updates.cue !== undefined && { cue: updates.cue }),
            ...(updates.is_unavailable !== undefined && { is_unavailable: updates.is_unavailable }),
        }).eq('id', id);

        if (error) throw error;
        setGraphNodes(prev => prev.map(n => n.node_id === id ? { ...n, ...updates } : n));
    }, []);

    const deleteGraphNode = useCallback(async (id: string) => {
        // @ts-ignore
        const { error } = await supabase.from('building_nodes').delete().eq('id', id);
        if (error) throw error;
        setGraphNodes(prev => prev.filter(n => n.node_id !== id));
    }, []);

    const addGraphEdge = useCallback(async (edge: BuildingEdge) => {
        // @ts-ignore
        const { data, error } = await supabase.from('building_edges').insert({
            floor_id: edge.floor_id,
            from_node_id: edge.from,
            to_node_id: edge.to,
            distance_steps: edge.distance_steps,
            instruction: edge.instruction,
            edge_type: edge.edge_type,
            turn: edge.turn
        } as any).select().single();

        if (error) throw error;
        setGraphEdges(prev => [...prev, { ...edge, id: data.id }]);
    }, []);

    const updateGraphEdge = useCallback(async (id: string, updates: Partial<BuildingEdge>) => {
        // @ts-ignore
        const { error } = await supabase.from('building_edges').update({
            ...(updates.distance_steps && { distance_steps: updates.distance_steps }),
            ...(updates.instruction && { instruction: updates.instruction }),
            ...(updates.edge_type && { edge_type: updates.edge_type }),
            ...(updates.turn && { turn: updates.turn }),
            ...(updates.from && { from_node_id: updates.from }),
            ...(updates.to && { to_node_id: updates.to }),
        }).eq('id', id);

        if (error) throw error;
        setGraphEdges(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    }, []);

    const deleteGraphEdge = useCallback(async (id: string) => {
        // @ts-ignore
        const { error } = await supabase.from('building_edges').delete().eq('id', id);
        if (error) throw error;
        setGraphEdges(prev => prev.filter(e => e.id !== id));
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
        deleteEdge,
        graphNodes,
        graphEdges,
        fetchGraphData,
        addGraphNode,
        updateGraphNode,
        deleteGraphNode,
        addGraphEdge,
        updateGraphEdge,
        deleteGraphEdge
    }), [
        locations, routes, floors, feedback, stats, floorMaps,
        addLocation, updateLocation, deleteLocation,
        addRoute, updateRoute, deleteRoute,
        addFloor, updateFloor, deleteFloor,
        setFloorMap, addFeedback, recordNavigation, resetToDefaults,
        edges, addEdge, updateEdge, deleteEdge,
        graphNodes, graphEdges, fetchGraphData,
        addGraphNode, updateGraphNode, deleteGraphNode,
        addGraphEdge, updateGraphEdge, deleteGraphEdge
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
