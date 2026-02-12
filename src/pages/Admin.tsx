import React, { useState, useMemo, useEffect } from "react";
import { useNavigationContext } from "@/context/NavigationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Plus,
    Trash2,
    Save,
    Upload,
    Map as MapIcon,
    RotateCcw,
    ChevronUp,
    ChevronDown,
    ChevronRight,
    Eye,
    MessageSquare,
    BarChart3,
    Layers,
    MapPin,
    Route as RouteIcon,
    AlertTriangle,
    CheckCircle2,
    Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { LocationType } from "@/data/locations";
import { RouteStep, IconType } from "@/data/routes";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import PanoramaViewer from "@/components/PanoramaViewer";

import { findGraphRoute } from "@/data/graphData";

const LOCATION_TYPES: LocationType[] = ["entry", "room", "lab", "office", "hotspot", "utility"];
const ICON_TYPES: IconType[] = ["straight", "left", "right", "stairs-up", "stairs-down", "lift-up", "lift-down", "destination", "start"];

export default function Admin() {
    const {
        locations, routes, floors, feedback, stats, floorMaps, edges,
        addLocation, updateLocation, deleteLocation,
        addRoute, updateRoute, deleteRoute,
        addFloor, updateFloor, deleteFloor,
        addEdge, updateEdge, deleteEdge,
        setFloorMap, resetToDefaults
    } = useNavigationContext();

    const [activeTab, setActiveTab] = useState("overview");

    // --- FLOOR MANAGEMENT ---
    const [isFloorDialogOpen, setIsFloorDialogOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState<any>(null);
    const [floorLabel, setFloorLabel] = useState("");
    const [floorNumber, setFloorNumber] = useState("0");

    const handleSaveFloor = () => {
        if (!floorLabel) return;
        const floorData = {
            id: editingFloor?.id || `floor-${floorNumber}`,
            number: parseInt(floorNumber),
            label: floorLabel,
            isUnavailable: editingFloor?.isUnavailable || false
        } as any;

        if (editingFloor) {
            updateFloor(editingFloor.id, floorData);
            toast.success("Floor updated");
        } else {
            addFloor(floorData);
            toast.success("Floor added");
        }
        setIsFloorDialogOpen(false);
        setEditingFloor(null);
        setFloorLabel("");
    };

    // --- LOCATION MANAGEMENT ---
    const [isLocDialogOpen, setIsLocDialogOpen] = useState(false);
    const [editingLoc, setEditingLoc] = useState<any>(null);
    const [locName, setLocName] = useState("");
    const [locFloor, setLocFloor] = useState("0");
    const [locType, setLocType] = useState<LocationType>("room");
    const [locX, setLocX] = useState("");
    const [locY, setLocY] = useState("");
    const [locCue, setLocCue] = useState("");
    const [locImage, setLocImage] = useState("");
    const [isPickingPoint, setIsPickingPoint] = useState(false);

    const handleSaveLocation = () => {
        if (!locName) return;
        const locId = editingLoc?.id || locName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const locData = {
            id: locId,
            name: locName,
            floor: parseInt(locFloor),
            type: locType,
            isUnavailable: editingLoc?.isUnavailable || false,
            x: locX ? parseFloat(locX) : undefined,
            y: locY ? parseFloat(locY) : undefined,
            cue: locCue,
            image: locImage
        } as any;

        if (editingLoc) {
            updateLocation(editingLoc.id, locData);
            toast.success("Location updated");
        } else {
            addLocation(locData);
            toast.success("Location added");
        }
        setIsLocDialogOpen(false);
        setEditingLoc(null);
        setLocName("");
        setLocX("");
        setLocY("");
        setLocCue("");
        setLocImage("");
    };

    // --- ROUTE MANAGEMENT ---
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<any>(null);
    const [routeFrom, setRouteFrom] = useState("");
    const [routeTo, setRouteTo] = useState("");
    const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
    const [routeEnabled, setRouteEnabled] = useState(true);

    const handleSaveRoute = () => {
        if (!routeFrom || !routeTo || routeSteps.length === 0) {
            toast.error("Please fill all fields");
            return;
        }
        const routeData = {
            from: routeFrom,
            to: routeTo,
            steps: routeSteps,
            isEnabled: routeEnabled
        };

        if (editingRoute) {
            updateRoute(editingRoute.from, editingRoute.to, routeData);
            toast.success("Route updated");
        } else {
            addRoute(routeData);
            toast.success("Route added");
        }
        setIsRouteDialogOpen(false);
        setEditingRoute(null);
        setRouteFrom("");
        setRouteTo("");
        setRouteSteps([]);
    };

    const addStep = () => {
        setRouteSteps([...routeSteps, { instruction: "", icon: "straight", floor: 0 }]);
    };

    const updateStep = (index: number, field: keyof RouteStep, value: any) => {
        const newSteps = [...routeSteps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setRouteSteps(newSteps);
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...routeSteps];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < newSteps.length) {
            [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
            setRouteSteps(newSteps);
        }
    };

    const removeStep = (index: number) => {
        const newSteps = [...routeSteps];
        newSteps.splice(index, 1);
        setRouteSteps(newSteps);
    };

    const handleAutoGenerate = () => {
        if (!routeFrom || !routeTo) {
            toast.error("Please select start and destination first");
            return;
        }

        const result = findGraphRoute(routeFrom, routeTo, locations, edges);
        if (result) {
            const mappedSteps: RouteStep[] = result.steps.map(s => ({
                instruction: s.instruction,
                instruction_ml: s.instruction_ml,
                instruction_kn: s.instruction_kn,
                icon: s.icon_type as any,
                floor: s.floor || 0,
                landmarkImage: s.landmarkImage
            }));
            setRouteSteps(mappedSteps);
            toast.success("Route steps generated from graph");
        } else {
            toast.error("No path found between these locations in the graph");
        }
    };

    const handleBulkGenerate = () => {
        const count = locations.length;
        if (count < 2) return;

        if (!confirm(`This will attempt to generate routes for all possible ${count * (count - 1)} combinations. Existing routes will be skipped. Continue?`)) {
            return;
        }

        let added = 0;
        let skipped = 0;
        let failed = 0;

        locations.forEach(fromLoc => {
            locations.forEach(toLoc => {
                if (fromLoc.id === toLoc.id) return;

                const exists = routes.some(r => r.from === fromLoc.id && r.to === toLoc.id);
                if (exists) {
                    skipped++;
                    return;
                }

                const result = findGraphRoute(fromLoc.id, toLoc.id, locations, edges);
                if (result) {
                    const routeData = {
                        from: fromLoc.id,
                        to: toLoc.id,
                        steps: result.steps.map(s => ({
                            instruction: s.instruction,
                            instruction_ml: s.instruction_ml,
                            instruction_kn: s.instruction_kn,
                            icon: s.icon_type as any,
                            floor: s.floor || 0,
                            landmarkImage: s.landmarkImage
                        })),
                        isEnabled: true
                    };
                    addRoute(routeData);
                    added++;
                } else {
                    failed++;
                }
            });
        });

        toast.success(`Bulk generation complete: ${added} added, ${skipped} skipped, ${failed} failed.`);
    };

    // --- EDGE MANAGEMENT ---
    const [isEdgeDialogOpen, setIsEdgeDialogOpen] = useState(false);
    const [editingEdge, setEditingEdge] = useState<any>(null);
    const [edgeFrom, setEdgeFrom] = useState("");
    const [edgeTo, setEdgeTo] = useState("");
    const [edgeWeight, setEdgeWeight] = useState("10");
    const [edgeType, setEdgeType] = useState<any>("walk");
    const [edgeBidirectional, setEdgeBidirectional] = useState(true);

    const handleSaveEdge = () => {
        if (!edgeFrom || !edgeTo) return;
        const edgeData = {
            from: edgeFrom,
            to: edgeTo,
            weight: parseFloat(edgeWeight),
            type: edgeType,
            bidirectional: edgeBidirectional
        };

        if (editingEdge) {
            updateEdge(editingEdge.from, editingEdge.to, edgeData);
            toast.success("Connection updated");
        } else {
            addEdge(edgeData);
            toast.success("Connection added");
        }
        setIsEdgeDialogOpen(false);
        setEditingEdge(null);
        setEdgeFrom("");
        setEdgeTo("");
    };

    const topDestinations = useMemo(() => {
        return Object.entries(stats.popularDestinations)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    }, [stats.popularDestinations]);

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
                            <Layers className="text-primary h-8 w-8" />
                            WayFinder <span className="text-primary/60 font-medium">| Control Center</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Manage indoor intelligence, navigation paths, and user feedback</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => window.location.href = "/"} className="rounded-xl">
                            <Eye className="mr-2 h-4 w-4" /> Live Site
                        </Button>
                        <Button variant="destructive" onClick={resetToDefaults} className="rounded-xl shadow-lg shadow-destructive/10">
                            <RotateCcw className="mr-2 h-4 w-4" /> Factory Reset
                        </Button>
                    </div>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white dark:bg-slate-900 border p-1 rounded-xl shadow-sm overflow-x-auto flex-nowrap w-full justify-start h-auto">
                        <TabsTrigger value="overview" className="rounded-lg py-2.5 px-6"><BarChart3 className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
                        <TabsTrigger value="floors" className="rounded-lg py-2.5 px-6"><MapIcon className="h-4 w-4 mr-2" /> Floors</TabsTrigger>
                        <TabsTrigger value="locations" className="rounded-lg py-2.5 px-6"><MapPin className="h-4 w-4 mr-2" /> Locations</TabsTrigger>
                        <TabsTrigger value="edges" className="rounded-lg py-2.5 px-6"><Plus className="h-4 w-4 mr-2" /> Connections</TabsTrigger>
                        <TabsTrigger value="routes" className="rounded-lg py-2.5 px-6"><RouteIcon className="h-4 w-4 mr-2" /> Routes</TabsTrigger>
                        <TabsTrigger value="feedback" className="rounded-lg py-2.5 px-6"><MessageSquare className="h-4 w-4 mr-2" /> Feedback</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatsCard title="Total Navigations" value={stats.totalNavigations} icon={<NavigationIcon className="h-5 w-5" />} color="blue" description="All time unique sessions" />
                            <StatsCard title="Pathfinding Success" value={`${Math.round((stats.routesFound / (stats.totalNavigations || 1)) * 100)}%`} icon={<CheckCircle2 className="h-5 w-5" />} color="emerald" description={`${stats.routesFound} routes calculated`} />
                            <StatsCard title="Total Locations" value={locations.length} icon={<MapPin className="h-5 w-5" />} color="primary" description="POIs in the building" />
                            <StatsCard title="Support Rating" value="4.8/5" icon={<MessageSquare className="h-5 w-5" />} color="amber" description="From user feedback" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="shadow-sm">
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-lg">Popular Destinations</CardTitle>
                                    <CardDescription>Most searched points of interest</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {topDestinations.length > 0 ? topDestinations.map(([id, count]) => {
                                            const loc = locations.find(l => l.id === id);
                                            return (
                                                <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                            {loc?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{loc?.name || id}</span>
                                                            <span className="text-xs text-slate-500 capitalize">{loc?.type || 'POI'}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="px-3 py-1">{count} hits</Badge>
                                                </div>
                                            );
                                        }) : (
                                            <div className="text-center py-12 text-slate-400">
                                                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                                <p>No navigation data yet</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                    <CardDescription>Common administrative tasks</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <ActionBtn icon={<Plus className="h-5 w-5" />} label="New Location" onClick={() => { setEditingLoc(null); setLocName(""); setIsLocDialogOpen(true); }} />
                                        <ActionBtn icon={<RouteIcon className="h-5 w-5" />} label="Design Route" onClick={() => { setEditingRoute(null); setRouteFrom(""); setRouteTo(""); setRouteSteps([]); setIsRouteDialogOpen(true); }} />
                                        <ActionBtn icon={<RotateCcw className="h-5 w-5" />} label="Bulk Generate" onClick={handleBulkGenerate} />
                                        <ActionBtn icon={<MessageSquare className="h-5 w-5" />} label="View Feedback" onClick={() => setActiveTab("feedback")} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="floors">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                                <div>
                                    <CardTitle>Floor Management</CardTitle>
                                    <CardDescription>Configure physical building levels</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingFloor(null); setFloorLabel(""); setFloorNumber("0"); setIsFloorDialogOpen(true); }}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Floor
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead>Number</TableHead>
                                            <TableHead>Display Label</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Map Image</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {floors.map(floor => (
                                            <TableRow key={floor.id}>
                                                <TableCell className="font-bold">{floor.number}</TableCell>
                                                <TableCell className="font-medium">{floor.label}</TableCell>
                                                <TableCell>
                                                    <Badge variant={floor.isUnavailable ? "destructive" : "outline"} className="rounded-full">
                                                        {floor.isUnavailable ? "Closed" : "Active"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {floorMaps[floor.number] ? (
                                                        <div className="flex items-center gap-2 text-primary font-medium">
                                                            <ImageIcon className="h-4 w-4" /> Uploaded
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">None</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <label className="cursor-pointer">
                                                            <Input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setFloorMap(floor.number, reader.result as string);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }} />
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <span><Upload className="h-4 w-4" /></span>
                                                            </Button>
                                                        </label>
                                                        <Button variant="ghost" size="icon" onClick={() => {
                                                            setEditingFloor(floor);
                                                            setFloorLabel(floor.label);
                                                            setFloorNumber(floor.number.toString());
                                                            setIsFloorDialogOpen(true);
                                                        }}><Save className="h-4 w-4 text-primary" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteFloor(floor.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="locations">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                                <div>
                                    <CardTitle>Physical Locations</CardTitle>
                                    <CardDescription>Points of interest and rooms in the building</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingLoc(null); setLocName(""); setIsLocDialogOpen(true); }}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Location
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Floor</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Coordinates</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {locations.map(loc => (
                                            <TableRow key={loc.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{loc.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono uppercase">{loc.id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{floors.find(f => f.number === loc.floor)?.label || `Lvl ${loc.floor}`}</TableCell>
                                                <TableCell><Badge variant="secondary" className="capitalize">{loc.type}</Badge></TableCell>
                                                <TableCell>
                                                    {loc.image ? (
                                                        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 gap-1">
                                                            <ImageIcon size={10} /> 360
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {loc.x !== undefined ? (
                                                        <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{loc.x}%, {loc.y}%</code>
                                                    ) : <span className="text-slate-400 text-xs italic">Not pinned</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingLoc(loc);
                                                        setLocName(loc.name);
                                                        setLocFloor(loc.floor.toString());
                                                        setLocType(loc.type);
                                                        setLocX(loc.x?.toString() || "");
                                                        setLocY(loc.y?.toString() || "");
                                                        setLocCue(loc.cue || "");
                                                        setLocImage(loc.image || "");
                                                        setIsLocDialogOpen(true);
                                                    }}><Save className="h-4 w-4 text-primary" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteLocation(loc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="edges">
                        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                                <div>
                                    <CardTitle>Graph Connections</CardTitle>
                                    <CardDescription>Define how locations are physically connected</CardDescription>
                                </div>
                                <Button onClick={() => {
                                    setEditingEdge(null);
                                    setEdgeFrom("");
                                    setEdgeTo("");
                                    setEdgeWeight("10");
                                    setEdgeType("walk");
                                    setEdgeBidirectional(true);
                                    setIsEdgeDialogOpen(true);
                                }}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Connection
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableHead>From</TableHead>
                                            <TableHead></TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {edges.map((edge, i) => (
                                            <TableRow key={`${edge.from}-${edge.to}-${i}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                                                <TableCell className="font-medium">
                                                    {locations.find(l => l.id === edge.from)?.name || edge.from}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-slate-300">
                                                        <ChevronRight className="h-4 w-4" />
                                                        {edge.bidirectional !== false && <ChevronRight className="h-4 w-4 -ml-2 rotate-180" />}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {locations.find(l => l.id === edge.to)?.name || edge.to}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">{edge.type}</Badge>
                                                </TableCell>
                                                <TableCell>{edge.weight}s</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingEdge(edge);
                                                        setEdgeFrom(edge.from);
                                                        setEdgeTo(edge.to);
                                                        setEdgeWeight(edge.weight.toString());
                                                        setEdgeType(edge.type);
                                                        setEdgeBidirectional(edge.bidirectional !== false);
                                                        setIsEdgeDialogOpen(true);
                                                    }}>
                                                        <Save className="h-4 w-4 text-primary" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteEdge(edge.from, edge.to)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="routes">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-6 text-left">
                                <div>
                                    <CardTitle>Manual Route Overrides</CardTitle>
                                    <CardDescription>Custom paths that override graph auto-generation</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleBulkGenerate}>
                                        <RotateCcw className="mr-2 h-4 w-4 text-primary" /> Bulk Generate
                                    </Button>
                                    <Button onClick={() => { setEditingRoute(null); setRouteFrom(""); setRouteTo(""); setRouteSteps([]); setIsRouteDialogOpen(true); }}>
                                        <Plus className="mr-2 h-4 w-4" /> Design Route
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead>From → To</TableHead>
                                            <TableHead>Steps</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {routes.map((route, i) => (
                                            <TableRow key={`${route.from}-${route.to}-${i}`}>
                                                <TableCell className="font-bold">
                                                    {locations.find(l => l.id === route.from)?.name || route.from}
                                                    <span className="mx-2 text-primary">→</span>
                                                    {locations.find(l => l.id === route.to)?.name || route.to}
                                                </TableCell>
                                                <TableCell>{route.steps.length} segments</TableCell>
                                                <TableCell>
                                                    <Badge variant={route.isEnabled ? "default" : "secondary"}>{route.isEnabled ? "Enabled" : "Draft"}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingRoute(route);
                                                        setRouteFrom(route.from);
                                                        setRouteTo(route.to);
                                                        setRouteSteps(route.steps);
                                                        setRouteEnabled(route.isEnabled);
                                                        setIsRouteDialogOpen(true);
                                                    }}><Save className="h-4 w-4 text-primary" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteRoute(route.from, route.to)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="feedback">
                        <Card className="shadow-sm">
                            <CardHeader className="border-b">
                                <CardTitle>User Sentiments</CardTitle>
                                <CardDescription>Ratings and comments from visitors</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 text-left">
                                <div className="space-y-4">
                                    {feedback.length > 0 ? feedback.map(fb => (
                                        <div key={fb.id} className="p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm">
                                            <div className="flex justify-between items-start mb-3 text-left">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 italic">
                                                        {fb.rating}★
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 font-mono tracking-tight">{new Date(fb.timestamp).toLocaleString()}</span>
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                            {fb.from ? `${fb.from} to ${fb.to}` : "General Feedback"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">ID: {fb.id}</Badge>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-1">"{fb.comment}"</p>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 text-slate-300">
                                            <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                                            <p className="font-medium text-lg">Silence is golden. No feedback yet.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* --- MODALS --- */}
                {/* Floor Modal */}
                <Dialog open={isFloorDialogOpen} onOpenChange={setIsFloorDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingFloor ? "Edit Building Level" : "Construct New Floor"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fnum" className="text-right">Level #</Label>
                                <Input id="fnum" type="number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fname" className="text-right">Label</Label>
                                <Input id="fname" value={floorLabel} onChange={(e) => setFloorLabel(e.target.value)} placeholder="e.g. Ground Floor" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFloorDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveFloor}>Establish Level</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Location Modal */}
                <Dialog open={isLocDialogOpen} onOpenChange={setIsLocDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingLoc ? `Relocate: ${editingLoc.name}` : "Architect New Location"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="locName">Location Title</Label>
                                <Input id="locName" value={locName} onChange={(e) => setLocName(e.target.value)} placeholder="e.g. Server Room A" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Floor Level</Label>
                                    <Select value={locFloor} onValueChange={setLocFloor}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {floors.sort((a, b) => a.number - b.number).map(f => (
                                                <SelectItem key={f.id} value={f.number.toString()}>{f.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select value={locType} onValueChange={(v) => setLocType(v as LocationType)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {LOCATION_TYPES.map(t => (
                                                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Human-Friendly Cue (Hint)</Label>
                                <Input value={locCue} onChange={(e) => setLocCue(e.target.value)} placeholder="e.g. near the large wooden door" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    Panorama / Landmark Image URL
                                    <Badge variant="outline" className="text-[10px] uppercase">360 Support</Badge>
                                </Label>
                                <Input value={locImage} onChange={(e) => setLocImage(e.target.value)} placeholder="https://example.com/panorama.jpg" />
                                {locImage && (
                                    <div className="mt-2 h-32 rounded-lg overflow-hidden border">
                                        <PanoramaViewer imageSrc={locImage} className="w-full h-full" />
                                    </div>
                                )}
                            </div>
                            <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="font-bold text-slate-900">Map Coordinates (XY)</Label>
                                    <Button size="sm" variant={isPickingPoint ? "destructive" : "outline"} onClick={() => setIsPickingPoint(!isPickingPoint)}>
                                        {isPickingPoint ? "Cancel Picking" : "Pick on Floor Map"}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="locX" className="text-xs text-slate-500">X Position (%)</Label>
                                        <Input id="locX" type="number" value={locX} onChange={(e) => setLocX(e.target.value)} placeholder="0" />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="locY" className="text-xs text-slate-500">Y Position (%)</Label>
                                        <Input id="locY" type="number" value={locY} onChange={(e) => setLocY(e.target.value)} placeholder="0" />
                                    </div>
                                </div>
                                {isPickingPoint && (
                                    <div className="relative border-2 border-primary/20 rounded-lg overflow-hidden cursor-crosshair group mt-2 bg-slate-200">
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 group-hover:hidden italic text-xs pointer-events-none">
                                            {floorMaps[parseInt(locFloor)] ? "Click anywhere on the map" : "No map uploaded for this floor"}
                                        </div>
                                        {floorMaps[parseInt(locFloor)] ? (
                                            <img
                                                src={floorMaps[parseInt(locFloor)]}
                                                className="w-full h-auto opacity-70 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                                    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                                                    setLocX(x.toString());
                                                    setLocY(y.toString());
                                                    setIsPickingPoint(false);
                                                    toast.success(`Point selected: ${x}, ${y}`);
                                                }}
                                            />
                                        ) : (
                                            <div className="h-40 flex items-center justify-center text-slate-400">
                                                Please upload a floor map first.
                                            </div>
                                        )}
                                        {locX && locY && (
                                            <div
                                                className="absolute w-4 h-4 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg ring-2 ring-white z-10"
                                                style={{ left: `${locX}%`, top: `${locY}%` }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsLocDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveLocation}>Commit Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edge/Connection Modal */}
                <Dialog open={isEdgeDialogOpen} onOpenChange={setIsEdgeDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingEdge ? "Edit Connection" : "Add Graph Link"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>From Location</Label>
                                    <Select value={edgeFrom} onValueChange={setEdgeFrom}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>
                                            {locations.map(l => (
                                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>To Location</Label>
                                    <Select value={edgeTo} onValueChange={setEdgeTo}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>
                                            {locations.map(l => (
                                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Walking Time (seconds)</Label>
                                    <Input type="number" value={edgeWeight} onChange={(e) => setEdgeWeight(e.target.value)} placeholder="e.g. 30" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Connection Type</Label>
                                    <Select value={edgeType} onValueChange={(v) => setEdgeType(v)}>
                                        <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="walk">Walk</SelectItem>
                                            <SelectItem value="stairs">Stairs</SelectItem>
                                            <SelectItem value="lift">Lift</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border p-3 rounded-lg bg-slate-50">
                                <Switch checked={edgeBidirectional} onCheckedChange={setEdgeBidirectional} id="bidir" />
                                <Label htmlFor="bidir">Bidirectional (Both Ways)</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEdgeDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveEdge}>Save Connection</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Route Editor Modal */}
                <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden gap-0">
                        <DialogHeader className="p-6 pb-0 mb-4">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-left">
                                <RouteIcon className="h-6 w-6 text-primary" />
                                {editingRoute ? "Edit Optimized Route" : "Design New Navigation Chain"}
                            </DialogTitle>
                            <CardDescription className="text-left">Chain multiple steps to guide users from A to B with visual cues.</CardDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden flex flex-col px-6">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2 text-left">
                                    <Label className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Origin Point</Label>
                                    <Select value={routeFrom} onValueChange={setRouteFrom} disabled={!!editingRoute}>
                                        <SelectTrigger className="h-12 border-2"><SelectValue placeholder="Select starting location" /></SelectTrigger>
                                        <SelectContent>
                                            {locations.map(l => (
                                                <SelectItem key={l.id} value={l.id}>{l.name} (Lvl {l.floor})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Arrival Destination</Label>
                                    <Select value={routeTo} onValueChange={setRouteTo} disabled={!!editingRoute}>
                                        <SelectTrigger className="h-12 border-2"><SelectValue placeholder="Select target location" /></SelectTrigger>
                                        <SelectContent>
                                            {locations.map(l => (
                                                <SelectItem key={l.id} value={l.id}>{l.name} (Lvl {l.floor})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    Navigational Steps
                                    <Badge variant="secondary" className="rounded-full">{routeSteps.length}</Badge>
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs font-medium cursor-pointer" htmlFor="route-live">LIVE STATUS</Label>
                                        <Switch id="route-live" checked={routeEnabled} onCheckedChange={setRouteEnabled} />
                                    </div>
                                    <Button size="sm" variant="outline" onClick={handleAutoGenerate} className="shadow-sm">
                                        <RotateCcw className="h-4 w-4 mr-1" /> Auto-Generate
                                    </Button>
                                    <Button size="sm" variant="default" onClick={addStep} className="shadow-sm">
                                        <Plus className="h-4 w-4 mr-1" /> Add Step
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 border rounded-xl bg-slate-50/30 p-4 mb-6">
                                <div className="space-y-4">
                                    {routeSteps.map((step, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm group hover:border-primary/50 transition-all text-left">
                                            <div className="flex justify-between items-center mb-4 text-left">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-4 ring-primary/10">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="font-bold text-slate-700">Movement Instruction</span>
                                                </div>
                                                <div className="flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveStep(idx, 'up')} disabled={idx === 0}>
                                                        <ChevronUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveStep(idx, 'down')} disabled={idx === routeSteps.length - 1}>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeStep(idx)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="md:col-span-2 space-y-2">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-400">English Instruction</Label>
                                                        <Input placeholder="e.g. Turn right at the water fountain..." value={step.instruction} onChange={(e) => updateStep(idx, "instruction", e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Visual Icon</Label>
                                                        <Select value={step.icon} onValueChange={(v) => updateStep(idx, "icon", v)}>
                                                            <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {ICON_TYPES.map(i => <SelectItem key={i} value={i} className="capitalize">{i.replace('-', ' ')}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Floor</Label>
                                                        <Select value={step.floor?.toString()} onValueChange={(v) => updateStep(idx, "floor", parseInt(v))}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {floors.sort((a, b) => a.number - b.number).map(f => (
                                                                    <SelectItem key={f.id} value={f.number.toString()}>{f.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2 md:col-span-1">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Malayalam</Label>
                                                        <Input placeholder="മലയാളം" value={step.instruction_ml} onChange={(e) => updateStep(idx, "instruction_ml", e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-1">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Kannada</Label>
                                                        <Input placeholder="ಕನ್ನಡ" value={step.instruction_kn} onChange={(e) => updateStep(idx, "instruction_kn", e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-1">
                                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Step Image Override</Label>
                                                        <Input placeholder="Image URL" value={step.landmarkImage} onChange={(e) => updateStep(idx, "landmarkImage", e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {routeSteps.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                            <div className="p-4 rounded-full bg-slate-100 mb-4"><Plus size={32} /></div>
                                            <p className="font-medium">No steps defined. Add a step to begin.</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        <DialogFooter className="p-6 border-t bg-slate-50 dark:bg-slate-900/50 text-right">
                            <Button variant="outline" onClick={() => setIsRouteDialogOpen(false)}>Cancel Editor</Button>
                            <Button onClick={handleSaveRoute} className="px-8 shadow-lg shadow-primary/20">
                                <Save className="h-4 w-4 mr-2" />
                                {editingRoute ? "Propagate Changes" : "Save New Route"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, description, color = "primary" }: any) {
    const colorClasses: any = {
        primary: "text-primary bg-primary/10 border-primary/20",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        blue: "text-blue-600 bg-blue-50 border-blue-100",
    };

    return (
        <Card className="hover:shadow-md transition-shadow text-left">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                    <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
                        {icon && typeof icon === 'object' ? icon : <Plus className="h-4 w-4" />}
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function NavigationIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
    )
}

function ActionBtn({ icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-95 border-slate-200 dark:border-slate-800"
        >
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                {icon}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{label}</span>
        </button>
    );
}
