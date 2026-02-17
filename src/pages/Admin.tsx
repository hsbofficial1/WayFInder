import React, { useState, useMemo } from "react";
import { useNavigationContext } from "@/context/NavigationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Plus,
    Trash2,
    BarChart3,
    Layers,
    MapPin,
    Route as RouteIcon,
    MessageSquare,
    Image as ImageIcon,
    MoreHorizontal,
    Search,
    GripVertical,
    ArrowRight,
    PanelLeftClose,
    PanelLeftOpen,
    Share2,
    ArrowUpRight,
    Eye,
    Edit,
    Trash
} from "lucide-react";
import { toast } from "sonner";
import { LocationType } from "@/data/locations";
import { RouteStep, IconType } from "@/data/routes";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buildingData } from "@/data/building_data";
import { seedGraphData } from "@/lib/graph-seed";

const LOCATION_TYPES: LocationType[] = ["entry", "room", "lab", "office", "hotspot", "utility"];

// Subcomponents
const NavItem = ({ active, onClick, icon, label, count, collapsed }: any) => (
    <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={cn(
            "w-full flex items-center p-3 rounded-lg text-sm font-medium transition-all group",
            active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed ? "justify-center" : "justify-between"
        )}
    >
        <div className="flex items-center gap-3">
            {React.cloneElement(icon, { size: 18, className: active ? "text-primary" : "text-muted-foreground group-hover:text-foreground" })}
            <span className={cn("transition-all duration-300 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>{label}</span>
        </div>
        {count !== undefined && !collapsed && (
            <span className="bg-background border px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">{count}</span>
        )}
    </button>
);

const StatCard = ({ title, value, icon }: any) => (
    <div className="p-5 rounded-xl border bg-card shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="p-2 bg-muted/30 rounded-lg">{icon}</div>
    </div>
);

export default function Admin() {
    const {
        locations, routes, floors, feedback, stats,
        graphNodes, graphEdges, fetchGraphData,
        addLocation, updateLocation, deleteLocation,
        addRoute, updateRoute, deleteRoute,
        addFloor, updateFloor, deleteFloor,
        addGraphNode, updateGraphNode, deleteGraphNode,
        addGraphEdge, updateGraphEdge, deleteGraphEdge
    } = useNavigationContext();

    // Node Dialog State
    const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<any | null>(null);
    const [nodeForm, setNodeForm] = useState<Partial<any>>({
        node_id: "",
        node_type: "room",
        name: "",
        floor: "G",
        junction_id: "",
        x: 0,
        y: 0
    });

    const openAddNode = () => {
        setEditingNode(null);
        setNodeForm({
            node_id: "",
            node_type: "room",
            name: "",
            floor: "G",
            junction_id: "",
            x: 0,
            y: 0
        });
        setIsNodeDialogOpen(true);
    };

    const openEditNode = (node: any) => {
        setEditingNode(node);
        setNodeForm({ ...node });
        setIsNodeDialogOpen(true);
    };

    const handleSaveNode = async () => {
        try {
            if (!nodeForm.node_id || !nodeForm.name) {
                toast.error("ID and Name are required");
                return;
            }

            if (editingNode) {
                await updateGraphNode(editingNode.node_id, nodeForm);
                toast.success("Node updated successfully");
            } else {
                // Check for duplicate ID
                if (graphNodes.some(n => n.node_id === nodeForm.node_id)) {
                    toast.error("Node ID already exists!");
                    return;
                }
                await addGraphNode(nodeForm as any);
                toast.success("Node added successfully");
            }
            setIsNodeDialogOpen(false);
        } catch (error: any) {
            toast.error("Failed to save node: " + error.message);
        }
    };

    const handleDeleteNode = async (id: string) => {
        if (confirm("Are you sure you want to delete this node? This might break edges connected to it.")) {
            try {
                await deleteGraphNode(id);
                toast.success("Node deleted");
            } catch (error: any) {
                toast.error("Failed to delete: " + error.message);
            }
        }
    };

    // Edge Dialog State
    const [isEdgeDialogOpen, setIsEdgeDialogOpen] = useState(false);
    const [editingEdge, setEditingEdge] = useState<any | null>(null);
    const [edgeForm, setEdgeForm] = useState<Partial<any>>({
        from: "",
        to: "",
        distance_steps: 5,
        instruction: "",
        edge_type: "corridor",
        turn: "straight",
        floor_id: "G"
    });

    const openAddEdge = (floorId: string) => {
        setEditingEdge(null);
        setEdgeForm({
            from: "",
            to: "",
            distance_steps: 5,
            instruction: "Walk straight",
            edge_type: "corridor",
            turn: "straight",
            floor_id: floorId
        });
        setIsEdgeDialogOpen(true);
    };

    const openEditEdge = (edge: any) => {
        setEditingEdge(edge);
        setEdgeForm({ ...edge });
        setIsEdgeDialogOpen(true);
    };

    const handleSaveEdge = async () => {
        try {
            if (!edgeForm.from || !edgeForm.to || !edgeForm.floor_id) {
                toast.error("From, To, and Floor are required");
                return;
            }
            if (edgeForm.from === edgeForm.to) {
                toast.error("From and To nodes cannot be the same");
                return;
            }

            if (editingEdge) {
                await updateGraphEdge(editingEdge.id, edgeForm);
                toast.success("Edge updated successfully");
            } else {
                await addGraphEdge(edgeForm as any);
                toast.success("Edge added successfully");
            }
            setIsEdgeDialogOpen(false);
        } catch (error: any) {
            toast.error("Failed to save edge: " + error.message);
        }
    };

    const handleDeleteEdge = async (id: string) => {
        if (confirm("Are you sure you want to delete this edge?")) {
            try {
                await deleteGraphEdge(id);
                toast.success("Edge deleted");
            } catch (error: any) {
                toast.error("Failed to delete edge: " + error.message);
            }
        }
    };

    const [activeView, setActiveView] = useState<"dashboard" | "locations" | "routes" | "floors" | "feedback" | "graph">("dashboard");
    const [searchTerm, setSearchTerm] = useState("");

    // --- STATE MANAGEMENT ---
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetMode, setSheetMode] = useState<"location" | "route" | "floor" | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form States
    const [locForm, setLocForm] = useState({ name: "", floor: "0", type: "room" as LocationType, x: "", y: "", cue: "", image: "" });
    const [routeForm, setRouteForm] = useState({ from: "", to: "", steps: [] as RouteStep[], isEnabled: true });
    const [floorForm, setFloorForm] = useState({ number: "0", label: "" });

    // --- HANDLERS ---
    const openSheet = (mode: "location" | "route" | "floor", item: any = null) => {
        setSheetMode(mode);
        setEditingItem(item);

        if (mode === "location") {
            setLocForm({
                name: item?.name || "",
                floor: item?.floor?.toString() || "0",
                type: item?.type || "room",
                x: item?.x?.toString() || "",
                y: item?.y?.toString() || "",
                cue: item?.cue || "",
                image: item?.image || ""
            });
        } else if (mode === "route") {
            setRouteForm({
                from: item?.from || "",
                to: item?.to || "",
                steps: item?.steps || [],
                isEnabled: item?.isEnabled ?? true
            });
        } else if (mode === "floor") {
            setFloorForm({
                number: item?.number?.toString() || "0",
                label: item?.label || ""
            });
        }
        setIsSheetOpen(true);
    };

    const handleSave = () => {
        if (sheetMode === "location") {
            if (!locForm.name) return;
            const id = editingItem?.id || locForm.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
            const data = {
                id,
                name: locForm.name,
                floor: parseInt(locForm.floor),
                type: locForm.type,
                x: locForm.x ? parseFloat(locForm.x) : undefined,
                y: locForm.y ? parseFloat(locForm.y) : undefined,
                cue: locForm.cue,
                image: locForm.image
            };
            editingItem ? updateLocation(id, data) : addLocation(data);
            toast.success(`Location ${editingItem ? 'updated' : 'created'}`);
        } else if (sheetMode === "route") {
            if (!routeForm.from || !routeForm.to) return;
            const data = { ...routeForm };
            editingItem ? updateRoute(routeForm.from, routeForm.to, data) : addRoute(data);
            toast.success(`Route ${editingItem ? 'updated' : 'created'}`);
        } else if (sheetMode === "floor") {
            const data = {
                id: editingItem?.id || `floor-${floorForm.number}`,
                number: parseInt(floorForm.number),
                label: floorForm.label
            };
            editingItem ? updateFloor(data.id, data) : addFloor(data);
            toast.success(`Floor saved`);
        }
        setIsSheetOpen(false);
    };

    // Filtered Views
    const filteredLocations = useMemo(() => {
        return locations.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [locations, searchTerm]);

    return (
        <div className="h-screen w-full bg-background flex overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={cn(
                "border-r bg-muted/30 flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "w-[70px]" : "w-64"
            )}>
                <div className={cn("p-6 flex items-center gap-3 relative", isSidebarCollapsed && "justify-center px-2")}>
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                        <Layers size={18} />
                    </div>

                    <div className={cn("overflow-hidden transition-all duration-300", isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                        <h1 className="font-bold tracking-tight whitespace-nowrap">WayFinder</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold whitespace-nowrap">Admin Panel</p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("absolute -right-3 top-7 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-accent z-30 flex", isSidebarCollapsed && "-right-3")}
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        {isSidebarCollapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
                    </Button>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-2">
                    <NavItem active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")} icon={<BarChart3 size={18} />} label="Overview" collapsed={isSidebarCollapsed} />
                    <NavItem active={activeView === "locations"} onClick={() => setActiveView("locations")} icon={<MapPin size={18} />} label="Locations" count={locations.length} collapsed={isSidebarCollapsed} />
                    <NavItem active={activeView === "graph"} onClick={() => setActiveView("graph")} icon={<Share2 size={18} />} label="Graph Nodes" collapsed={isSidebarCollapsed} />
                    <NavItem active={activeView === "routes"} onClick={() => setActiveView("routes")} icon={<RouteIcon size={18} />} label="Manual Routes" count={routes.length} collapsed={isSidebarCollapsed} />
                    <NavItem active={activeView === "floors"} onClick={() => setActiveView("floors")} icon={<Layers size={18} />} label="Floors" count={floors.length} collapsed={isSidebarCollapsed} />
                    <NavItem active={activeView === "feedback"} onClick={() => setActiveView("feedback")} icon={<MessageSquare size={18} />} label="Feedback" count={feedback.length} collapsed={isSidebarCollapsed} />
                </nav>

                <div className="p-4 border-t bg-muted/10">
                    <Button variant="outline" className={cn("w-full gap-2 transition-all", isSidebarCollapsed ? "justify-center px-0" : "justify-start")} asChild>
                        <a href="/" target="_blank" title="Open Live App">
                            <Eye size={16} />
                            <span className={cn("transition-all duration-300 overflow-hidden", isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-1")}>
                                Live App
                            </span>
                        </a>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-background/50">
                {/* Top Bar */}
                <header className="h-16 border-b flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-lg font-semibold capitalize">{activeView.replace('graph', 'Graph Data')}</h2>
                    <div className="flex items-center gap-4">
                        {activeView === "locations" && (
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search locations..."
                                    className="pl-9 h-9 w-64 bg-secondary/50 border-transparent hover:bg-secondary transition-colors focus:bg-background focus:border-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                        {activeView !== "dashboard" && activeView !== "graph" && (
                            <Button
                                className="h-9 gap-2 shadow-sm"
                                onClick={() => {
                                    if (activeView === "locations") openSheet("location");
                                    if (activeView === "routes") openSheet("route");
                                    if (activeView === "floors") openSheet("floor");
                                }}
                            >
                                <Plus size={16} />
                                Add New
                            </Button>
                        )}
                    </div>
                </header>

                {/* Content View */}
                <ScrollArea className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto space-y-6 pb-20">
                        {activeView === "dashboard" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Navigations" value={stats.totalNavigations} icon={<RouteIcon className="text-blue-500" />} />
                                <StatCard title="Success Rate" value={`${Math.round((stats.routesFound / (stats.totalNavigations || 1)) * 100)}%`} icon={<Badge className="bg-emerald-500 rounded-full w-2 h-2 p-0" />} />
                                <StatCard title="Active Locations" value={locations.length} icon={<MapPin className="text-orange-500" />} />
                                <StatCard title="Feedback Score" value="4.8" icon={<MessageSquare className="text-purple-500" />} />
                            </div>
                        )}

                        {activeView === "graph" && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between bg-muted/20 p-4 rounded-lg border">
                                    <div className="text-sm">
                                        {graphNodes.length > 0 ? (
                                            <span className="flex items-center gap-2 text-emerald-600 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Live Database Mode
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-amber-600 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                Read-Only File Mode (Sync to Edit)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={openAddNode}>
                                            <Plus size={16} className="mr-2" />
                                            Add Node
                                        </Button>
                                        {graphNodes.length === 0 && (
                                            <Button size="sm" variant="default" onClick={async () => {
                                                const success = await seedGraphData();
                                                if (success) fetchGraphData();
                                            }}>
                                                Sync File to DB
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => fetchGraphData()}>
                                            Refresh Data
                                        </Button>
                                    </div>
                                </div>

                                {graphNodes.length > 0 ? (
                                    // DATABASE VIEW
                                    ['G', 'F1', 'F2'].map((fid) => {
                                        const floorNodes = graphNodes.filter(n => n.floor === fid);
                                        const floorEdges = graphEdges.filter(e => e.floor_id === fid);
                                        if (floorNodes.length === 0) return null;

                                        return (
                                            <div key={fid} className="space-y-4">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <Layers size={20} className="text-primary" />
                                                    {fid === 'G' ? 'Ground Floor' : `Floor ${fid}`} <span className="text-muted-foreground text-sm font-normal">({fid})</span>
                                                </h3>

                                                {/* Nodes Table */}
                                                <div className="bg-card border rounded-xl overflow-hidden">
                                                    <div className="px-4 py-3 border-b bg-muted/20 font-medium text-sm flex justify-between">
                                                        <span>Nodes ({floorNodes.length})</span>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead className="text-left bg-muted/10 text-muted-foreground">
                                                                <tr>
                                                                    <th className="p-3 font-medium">ID</th>
                                                                    <th className="p-3 font-medium">Type</th>
                                                                    <th className="p-3 font-medium">Name</th>
                                                                    <th className="p-3 font-medium">Link</th>
                                                                    <th className="p-3 font-medium text-right">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y">
                                                                {floorNodes.map(node => (
                                                                    <tr key={node.node_id} className="hover:bg-muted/10 group">
                                                                        <td className="p-3 font-mono text-xs">{node.node_id}</td>
                                                                        <td className="p-3"><Badge variant="outline">{node.node_type}</Badge></td>
                                                                        <td className="p-3 font-medium">{node.name}</td>
                                                                        <td className="p-3 text-muted-foreground">{node.junction_id || '-'}</td>
                                                                        <td className="p-3 text-right">
                                                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => openEditNode(node)}>
                                                                                    <Edit size={14} />
                                                                                </Button>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteNode(node.node_id)}>
                                                                                    <Trash size={14} />
                                                                                </Button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Edges Table */}
                                                <div className="bg-card border rounded-xl overflow-hidden">
                                                    <div className="px-4 py-3 border-b bg-muted/20 font-medium text-sm flex justify-between items-center">
                                                        <span>Edges ({floorEdges.length})</span>
                                                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openAddEdge(fid)}>
                                                            <Plus size={14} className="mr-1" /> Add Edge
                                                        </Button>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead className="text-left bg-muted/10 text-muted-foreground">
                                                                <tr>
                                                                    <th className="p-3 font-medium">From</th>
                                                                    <th className="p-3 font-medium">To</th>
                                                                    <th className="p-3 font-medium">Steps</th>
                                                                    <th className="p-3 font-medium">Inst.</th>
                                                                    <th className="p-3 font-medium text-right">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y">
                                                                {floorEdges.map((edge: any, i) => (
                                                                    <tr key={edge.id || i} className="hover:bg-muted/10">
                                                                        <td className="p-3 font-mono text-xs text-muted-foreground">{edge.from}</td>
                                                                        <td className="p-3 font-mono text-xs text-muted-foreground">{edge.to}</td>
                                                                        <td className="p-3">{edge.distance_steps}</td>
                                                                        <td className="p-3 italic text-muted-foreground truncate max-w-[200px]">{edge.instruction}</td>
                                                                        <td className="p-3 text-right">
                                                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => openEditEdge(edge)}>
                                                                                    <Edit size={14} />
                                                                                </Button>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteEdge(edge.id)}>
                                                                                    <Trash size={14} />
                                                                                </Button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    // FALLBACK TO STATIC FILE
                                    buildingData.building.floors.map((floor) => (
                                        <div key={floor.floor_id} className="space-y-4 opacity-75 grayscale-[0.5]">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Layers size={20} className="text-primary" />
                                                {floor.floor_name} <span className="text-muted-foreground text-sm font-normal">({floor.floor_id})</span>
                                            </h3>
                                            <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                                                Static Data Loaded. Sync to Database to enable editing.
                                            </div>
                                        </div>
                                    ))
                                )}

                                <Dialog open={isNodeDialogOpen} onOpenChange={setIsNodeDialogOpen}>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>{editingNode ? 'Edit Node' : 'Add New Node'}</DialogTitle>
                                            <DialogDescription>
                                                Fill in the details for the navigation node. ID must be unique.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="node_id" className="text-right">ID</Label>
                                                <Input
                                                    id="node_id"
                                                    value={nodeForm.node_id}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, node_id: e.target.value })}
                                                    className="col-span-3"
                                                    disabled={!!editingNode}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={nodeForm.name}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, name: e.target.value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="type" className="text-right">Type</Label>
                                                <Select
                                                    value={nodeForm.node_type}
                                                    onValueChange={(val) => setNodeForm({ ...nodeForm, node_type: val })}
                                                >
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="room">Room</SelectItem>
                                                        <SelectItem value="junction">Junction</SelectItem>
                                                        <SelectItem value="entry">Entry</SelectItem>
                                                        <SelectItem value="exit">Exit</SelectItem>
                                                        <SelectItem value="stairs">Stairs</SelectItem>
                                                        <SelectItem value="lift">Lift</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="floor" className="text-right">Floor</Label>
                                                <Select
                                                    value={nodeForm.floor}
                                                    onValueChange={(val) => setNodeForm({ ...nodeForm, floor: val })}
                                                >
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Select floor" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="G">Ground</SelectItem>
                                                        <SelectItem value="F1">First Floor</SelectItem>
                                                        <SelectItem value="F2">Second Floor</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="junction_id" className="text-right">Link to</Label>
                                                <Input
                                                    id="junction_id"
                                                    placeholder="Optional (e.g. J1_G)"
                                                    value={nodeForm.junction_id || ""}
                                                    onChange={(e) => setNodeForm({ ...nodeForm, junction_id: e.target.value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleSaveNode}>Save changes</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isEdgeDialogOpen} onOpenChange={setIsEdgeDialogOpen}>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>{editingEdge ? 'Edit Edge' : 'Add New Edge'}</DialogTitle>
                                            <DialogDescription>
                                                Define the connection between two nodes.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="from_node" className="text-right">From Node</Label>
                                                <Select
                                                    value={edgeForm.from}
                                                    onValueChange={(val) => setEdgeForm({ ...edgeForm, from: val })}
                                                    disabled={!!editingEdge}
                                                >
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Select start node" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {graphNodes.filter(n => n.floor === edgeForm.floor_id).map(node => (
                                                            <SelectItem key={node.node_id} value={node.node_id}>{node.name} ({node.node_id})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="to_node" className="text-right">To Node</Label>
                                                <Select
                                                    value={edgeForm.to}
                                                    onValueChange={(val) => setEdgeForm({ ...edgeForm, to: val })}
                                                    disabled={!!editingEdge}
                                                >
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Select end node" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {graphNodes.filter(n => n.floor === edgeForm.floor_id).map(node => (
                                                            <SelectItem key={node.node_id} value={node.node_id}>{node.name} ({node.node_id})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="distance_steps" className="text-right">Steps</Label>
                                                <Input
                                                    id="distance_steps"
                                                    type="number"
                                                    value={edgeForm.distance_steps}
                                                    onChange={(e) => setEdgeForm({ ...edgeForm, distance_steps: parseInt(e.target.value) || 0 })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="instruction" className="text-right">Instruction</Label>
                                                <Input
                                                    id="instruction"
                                                    placeholder="e.g. Go straight, turn left"
                                                    value={edgeForm.instruction || ""}
                                                    onChange={(e) => setEdgeForm({ ...edgeForm, instruction: e.target.value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleSaveEdge}>Save changes</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}

                        {activeView === "locations" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredLocations.map(loc => (
                                    <div
                                        key={loc.id}
                                        className="group relative bg-card border border-border/60 rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                                        onClick={() => openSheet("location", loc)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
                                                {loc.name.charAt(0)}
                                            </div>
                                            <Badge variant="outline" className="opacity-50 group-hover:opacity-100 transition-opacity capitalize">
                                                {loc.type}
                                            </Badge>
                                        </div>
                                        <h3 className="font-semibold truncate pr-2">{loc.name}</h3>
                                        <p className="text-sm text-muted-foreground">Floor {loc.floor}</p>
                                        {loc.image && (
                                            <div className="absolute bottom-4 right-4 text-emerald-500 bg-emerald-50 p-1 rounded-md">
                                                <ImageIcon size={14} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeView === "routes" && (
                            <div className="space-y-4">
                                {routes.map((route, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <div className="w-0.5 h-8 bg-border" />
                                                <div className="w-2 h-2 rounded-full border border-destructive bg-background" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <span>{locations.find(l => l.id === route.from)?.name || route.from}</span>
                                                    <ArrowRight size={14} className="text-muted-foreground" />
                                                    <span>{locations.find(l => l.id === route.to)?.name || route.to}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground flex gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px] h-5">Manual</Badge>
                                                    <span>{route.steps.length} steps defined</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => openSheet("route", route)}>
                                                <MoreHorizontal size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteRoute(route.from, route.to)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeView === "floors" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {floors.map(floor => (
                                    <div
                                        key={floor.id}
                                        className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:shadow-sm transition-all group cursor-pointer"
                                        onClick={() => openSheet("floor", floor)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                                                {floor.number}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{floor.label}</h3>
                                                <p className="text-sm text-muted-foreground">ID: {floor.id}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); deleteFloor(floor.id); }}>
                                            <Trash2 size={16} className="text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeView === "feedback" && (
                            <div className="space-y-4">
                                {feedback.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">No feedback received yet.</div>
                                ) : (
                                    feedback.map((item: any, i: number) => (
                                        <div key={i} className="p-4 bg-card border border-border/60 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star} className={`text-lg ${star <= item.rating ? "text-amber-400" : "text-muted/30"}`}>★</span>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-medium mb-3">"{item.comment || "No comment"}"</p>
                                            <div className="flex gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg inline-flex">
                                                <span>From: <b>{locations.find(l => l.id === item.from)?.name || item.from}</b></span>
                                                <span>→</span>
                                                <span>To: <b>{locations.find(l => l.id === item.to)?.name || item.to}</b></span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </main>

            {/* EDIT SHEET */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl p-0 overflow-y-auto w-full">
                    <SheetHeader className="px-6 py-6 border-b bg-muted/10">
                        <SheetTitle>
                            {sheetMode === "location" && (editingItem ? "Edit Location" : "New Location")}
                            {sheetMode === "route" && (editingItem ? "Edit Route Sequence" : "New Route Sequence")}
                            {sheetMode === "floor" && (editingItem ? "Edit Floor" : "New Floor")}
                        </SheetTitle>
                        <SheetDescription>
                            Configure the details below. Changes are saved locally.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="p-6 space-y-6">
                        {sheetMode === "location" && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Name</Label>
                                    <Input value={locForm.name} onChange={e => setLocForm({ ...locForm, name: e.target.value })} placeholder="e.g. Conference Room A" className="h-12" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Type</Label>
                                        <Select value={locForm.type} onValueChange={(v) => setLocForm({ ...locForm, type: v as LocationType })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{LOCATION_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Floor</Label>
                                        <Input type="number" value={locForm.floor} onChange={e => setLocForm({ ...locForm, floor: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Panorama Image</Label>
                                    <div className="space-y-3">
                                        {/* Image Preview */}
                                        {locForm.image && (
                                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border/50 group">
                                                <img src={locForm.image} alt="Panorama Preview" className="w-full h-full object-cover" />
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => setLocForm({ ...locForm, image: "" })}
                                                >
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="col-span-1">
                                                <Label htmlFor="image-upload" className="sr-only">Upload</Label>
                                                <div className="relative">
                                                    <Button variant="outline" className="w-full gap-2 cursor-pointer" asChild>
                                                        <label htmlFor="image-upload">
                                                            <ImageIcon size={14} />
                                                            Upload from Device
                                                        </label>
                                                    </Button>
                                                    <Input
                                                        id="image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setLocForm({ ...locForm, image: reader.result as string });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-1">
                                                <Input
                                                    value={locForm.image}
                                                    onChange={e => setLocForm({ ...locForm, image: e.target.value })}
                                                    placeholder="Or paste image URL..."
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Supports JPG, PNG, WEBP. For best results, use equirectangular panorama images.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {sheetMode === "route" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl">
                                    <div className="grid gap-2">
                                        <Label>From</Label>
                                        <Select value={routeForm.from} onValueChange={v => setRouteForm({ ...routeForm, from: v })}>
                                            <SelectTrigger className="bg-background"><SelectValue placeholder="Origin" /></SelectTrigger>
                                            <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>To</Label>
                                        <Select value={routeForm.to} onValueChange={v => setRouteForm({ ...routeForm, to: v })}>
                                            <SelectTrigger className="bg-background"><SelectValue placeholder="Destination" /></SelectTrigger>
                                            <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Steps Sequence</Label>
                                        <Button size="sm" variant="outline" onClick={() => setRouteForm({ ...routeForm, steps: [...routeForm.steps, { instruction: "", icon: "straight", floor: 0 }] })}>
                                            <Plus size={14} className="mr-1" /> Add Step
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {routeForm.steps.map((step, idx) => (
                                            <div key={idx} className="flex gap-2 items-start p-3 bg-muted/20 rounded-lg group hover:bg-muted/30 transition-colors">
                                                <div className="mt-3 text-muted-foreground mr-1 cursor-grab active:cursor-grabbing hover:text-foreground">
                                                    <GripVertical size={16} />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={step.instruction}
                                                        onChange={(e) => {
                                                            const newSteps = [...routeForm.steps];
                                                            newSteps[idx].instruction = e.target.value;
                                                            setRouteForm({ ...routeForm, steps: newSteps });
                                                        }}
                                                        placeholder="e.g. Turn left at the corridor..."
                                                        className="bg-background h-9"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Select value={step.icon as string} onValueChange={(v) => {
                                                            const newSteps = [...routeForm.steps];
                                                            newSteps[idx].icon = v as IconType;
                                                            setRouteForm({ ...routeForm, steps: newSteps });
                                                        }}>
                                                            <SelectTrigger className="h-7 text-xs bg-background w-32"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {["straight", "left", "right", "stairs-up", "stairs-down", "lift-up", "lift-down", "destination"].map(i => (
                                                                    <SelectItem key={i} value={i}>{i}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                                                    const newSteps = [...routeForm.steps];
                                                    newSteps.splice(idx, 1);
                                                    setRouteForm({ ...routeForm, steps: newSteps });
                                                }}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {sheetMode === "floor" && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Floor Number</Label>
                                    <Input type="number" value={floorForm.number} onChange={e => setFloorForm({ ...floorForm, number: e.target.value })} placeholder="0" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Label</Label>
                                    <Input value={floorForm.label} onChange={e => setFloorForm({ ...floorForm, label: e.target.value })} placeholder="e.g. Ground Floor" />
                                </div>
                            </div>
                        )}
                    </div>

                    <SheetFooter className="p-6 border-t bg-muted/10 absolute bottom-0 w-full">
                        <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20" onClick={handleSave}>
                            Save Changes
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div >
    );
}
