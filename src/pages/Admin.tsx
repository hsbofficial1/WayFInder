import React, { useState, useMemo, useEffect } from "react";
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
    SheetTrigger
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Plus,
    Trash2,
    Save,
    RotateCcw,
    ChevronUp,
    ChevronDown,
    Eye,
    MessageSquare,
    BarChart3,
    Layers,
    MapPin,
    Route as RouteIcon,
    Image as ImageIcon,
    MoreHorizontal,
    Search,
    GripVertical,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { LocationType } from "@/data/locations";
import { RouteStep, IconType } from "@/data/routes";
import { Badge } from "@/components/ui/badge";
import PanoramaViewer from "@/components/PanoramaViewer";
import { findGraphRoute } from "@/data/graphData";
import { cn } from "@/lib/utils";

const LOCATION_TYPES: LocationType[] = ["entry", "room", "lab", "office", "hotspot", "utility"];

export default function Admin() {
    const {
        locations, routes, floors, feedback, stats, floorMaps, edges,
        addLocation, updateLocation, deleteLocation,
        addRoute, updateRoute, deleteRoute,
        addFloor, updateFloor, deleteFloor,
        addEdge, updateEdge, deleteEdge,
        setFloorMap, resetToDefaults
    } = useNavigationContext();

    const [activeView, setActiveView] = useState<"dashboard" | "locations" | "routes" | "floors" | "feedback">("dashboard");
    const [searchTerm, setSearchTerm] = useState("");

    // --- STATE MANAGEMENT ---
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetMode, setSheetMode] = useState<"location" | "route" | "floor" | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form States
    // Location
    const [locForm, setLocForm] = useState({ name: "", floor: "0", type: "room" as LocationType, x: "", y: "", cue: "", image: "" });
    // Route
    const [routeForm, setRouteForm] = useState({ from: "", to: "", steps: [] as RouteStep[], isEnabled: true });
    // Floor
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
            <aside className="w-64 border-r bg-muted/30 flex flex-col shrink-0 z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <Layers size={18} />
                    </div>
                    <div>
                        <h1 className="font-bold tracking-tight">WayFinder</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <NavItem active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")} icon={<BarChart3 size={18} />} label="Overview" />
                    <NavItem active={activeView === "locations"} onClick={() => setActiveView("locations")} icon={<MapPin size={18} />} label="Locations" count={locations.length} />
                    <NavItem active={activeView === "routes"} onClick={() => setActiveView("routes")} icon={<RouteIcon size={18} />} label="Routes" count={routes.length} />
                    <NavItem active={activeView === "floors"} onClick={() => setActiveView("floors")} icon={<Layers size={18} />} label="Floors" count={floors.length} />
                    <NavItem active={activeView === "feedback"} onClick={() => setActiveView("feedback")} icon={<MessageSquare size={18} />} label="Feedback" count={feedback.length} />
                </nav>

                <div className="p-4 border-t bg-muted/10">
                    <Button variant="outline" className="w-full gap-2 justify-start" asChild>
                        <a href="/" target="_blank"><Eye size={16} /> Open Live App</a>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-background/50">
                {/* Top Bar */}
                <header className="h-16 border-b flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-lg font-semibold capitalize">{activeView}</h2>
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
                                                    <Badge variant="secondary" className="text-[10px] h-5">{route.id}</Badge>
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

                        {/* More sections for Floors/Feedback omitted for brevity but follow same pattern */}
                    </div>
                </ScrollArea>
            </main>

            {/* EDIT SHEET (Drawer) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl p-0 overflow-y-auto w-full">
                    <SheetHeader className="px-6 py-6 border-b bg-muted/10">
                        <SheetTitle>
                            {sheetMode === "location" && (editingItem ? "Edit Location" : "New Location")}
                            {sheetMode === "route" && (editingItem ? "Edit Route Sequence" : "New Route Sequence")}
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
                                    <Label>Panorama Image URL (Optional)</Label>
                                    <Input value={locForm.image} onChange={e => setLocForm({ ...locForm, image: e.target.value })} placeholder="https://..." />
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
                    </div>

                    <SheetFooter className="p-6 border-t bg-muted/10 absolute bottom-0 w-full">
                        <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20" onClick={handleSave}>
                            Save Changes
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

// Subcomponents
const NavItem = ({ active, onClick, icon, label, count }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all group",
            active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
    >
        <div className="flex items-center gap-3">
            {React.cloneElement(icon, { size: 18, className: active ? "text-primary" : "text-muted-foreground group-hover:text-foreground" })}
            <span>{label}</span>
        </div>
        {count !== undefined && (
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
