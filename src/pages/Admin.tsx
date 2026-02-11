import React, { useState, useMemo } from "react";
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

const LOCATION_TYPES: LocationType[] = ["entry", "room", "lab", "office", "hotspot", "utility"];
const ICON_TYPES: IconType[] = ["straight", "left", "right", "stairs-up", "stairs-down", "lift-up", "lift-down", "destination", "start"];

export default function Admin() {
    const {
        locations, routes, floors, feedback, stats, floorMaps,
        addLocation, updateLocation, deleteLocation,
        addRoute, updateRoute, deleteRoute,
        addFloor, updateFloor, deleteFloor,
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
        };

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

    const handleSaveLocation = () => {
        if (!locName) return;
        const locId = editingLoc?.id || locName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const locData = {
            id: locId,
            name: locName,
            floor: parseInt(locFloor),
            type: locType,
            isUnavailable: editingLoc?.isUnavailable || false
        };

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

    // --- MAP UPLOAD ---
    const handleMapUpload = (floorNum: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFloorMap(floorNum, reader.result as string);
                toast.success(`Map for Floor ${floorNum} updated`);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- STATS COMPUTATION ---
    const topDestinations = useMemo(() => {
        return Object.entries(stats.popularDestinations)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    }, [stats.popularDestinations]);

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
            <div className="container mx-auto py-10 px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            <Layers className="h-10 w-10 text-primary" />
                            WayFinder Admin
                        </h1>
                        <p className="text-slate-500 mt-1">Management portal for indoor wayfinding and analytics.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
                            <Eye className="mr-2 h-4 w-4" /> Live Preview
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => {
                            if (confirm("DANGER: This will delete ALL custom data. Continue?")) {
                                resetToDefaults();
                                toast.success("System reset to defaults");
                            }
                        }}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Hard Reset
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white dark:bg-slate-900 border shadow-sm p-1 rounded-xl w-full md:w-auto h-auto grid grid-cols-2 md:inline-flex">
                        <TabsTrigger value="overview" className="gap-2 px-4 py-2"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
                        <TabsTrigger value="floors" className="gap-2 px-4 py-2"><Layers className="h-4 w-4" /> Floors</TabsTrigger>
                        <TabsTrigger value="locations" className="gap-2 px-4 py-2"><MapPin className="h-4 w-4" /> Locations</TabsTrigger>
                        <TabsTrigger value="routes" className="gap-2 px-4 py-2"><RouteIcon className="h-4 w-4" /> Routes</TabsTrigger>
                        <TabsTrigger value="feedback" className="gap-2 px-4 py-2"><MessageSquare className="h-4 w-4" /> Feedback</TabsTrigger>
                    </TabsList>

                    {/* --- OVERVIEW TAB --- */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatsCard title="Total Navigations" value={stats.totalNavigations} icon={<RouteIcon />} description="All time across all users" />
                            <StatsCard title="Success Rate" value={`${stats.totalNavigations ? Math.round((stats.routesFound / stats.totalNavigations) * 100) : 0}%`} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
                            <StatsCard title="Failed Routes" value={stats.routesNotFound} icon={<AlertTriangle className="text-amber-500" />} color="amber" />
                            <StatsCard title="Feedback" value={feedback.length} icon={<MessageSquare className="text-blue-500" />} color="blue" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="shadow-lg border-primary/10">
                                <CardHeader>
                                    <CardTitle>Popular Destinations</CardTitle>
                                    <CardDescription>Most searched locations by users</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topDestinations.length > 0 ? topDestinations.map(([id, count]) => {
                                            const loc = locations.find(l => l.id === id);
                                            return (
                                                <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">{count}</Badge>
                                                        <span className="font-medium">{loc?.name || id}</span>
                                                    </div>
                                                    <Badge>{loc?.type || 'unknown'}</Badge>
                                                </div>
                                            );
                                        }) : <p className="text-center py-8 text-slate-400 italic">No usage data yet</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-primary/10">
                                <CardHeader>
                                    <CardTitle>Recent Feedback</CardTitle>
                                    <CardDescription>Latest comments from users</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {feedback.slice(0, 3).map(fb => (
                                            <div key={fb.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <span key={i} className={i <= fb.rating ? "text-amber-400" : "text-slate-300"}>★</span>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-slate-400">{new Date(fb.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm italic text-slate-600 dark:text-slate-400 line-clamp-2">"{fb.comment}"</p>
                                            </div>
                                        ))}
                                        {feedback.length === 0 && <p className="text-center py-8 text-slate-400 italic">No feedback received</p>}
                                        {feedback.length > 0 && (
                                            <Button variant="link" className="w-full text-primary" onClick={() => setActiveTab('feedback')}>View all feedback</Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* --- FLOORS TAB --- */}
                    <TabsContent value="floors">
                        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                                <div>
                                    <CardTitle>Floor Management</CardTitle>
                                    <CardDescription>Manage building levels and upload map plans</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingFloor(null); setFloorLabel(""); setFloorNumber("0"); setIsFloorDialogOpen(true); }}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Floor
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableHead className="w-[100px]">Level</TableHead>
                                            <TableHead>Label</TableHead>
                                            <TableHead>Map Status</TableHead>
                                            <TableHead>Availability</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {floors.sort((a, b) => a.number - b.number).map((f) => (
                                            <TableRow key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                                                <TableCell className="font-bold text-lg">{f.number}</TableCell>
                                                <TableCell className="font-medium">{f.label}</TableCell>
                                                <TableCell>
                                                    {floorMaps[f.number] ? (
                                                        <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                                            <ImageIcon className="h-3 w-3 mr-1" /> Map Uploaded
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-400 italic font-normal">No Map</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch checked={!f.isUnavailable} onCheckedChange={(val) => updateFloor(f.id, { isUnavailable: !val })} />
                                                        <span className="text-sm text-slate-500">{f.isUnavailable ? "Locked" : "Open"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <div className="flex justify-end gap-2">
                                                        <Label htmlFor={`upload-${f.number}`} className="cursor-pointer">
                                                            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 border border-slate-200 hover:bg-slate-100 transition-colors">
                                                                <Upload className="h-4 w-4" />
                                                            </div>
                                                            <Input id={`upload-${f.number}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleMapUpload(f.number, e)} />
                                                        </Label>
                                                        <Button variant="ghost" size="icon" onClick={() => { setEditingFloor(f); setFloorLabel(f.label); setFloorNumber(f.number.toString()); setIsFloorDialogOpen(true); }}>
                                                            <Save className="h-4 w-4 text-primary" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteFloor(f.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- LOCATIONS TAB --- */}
                    <TabsContent value="locations">
                        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                                <div>
                                    <CardTitle>Points of Interest</CardTitle>
                                    <CardDescription>Manage rooms, facilities, and hotspots</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingLoc(null); setLocName(""); setIsLocDialogOpen(true); }}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Location
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableHead>Identifier</TableHead>
                                            <TableHead>Display Name</TableHead>
                                            <TableHead>Floor</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Availability</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {locations.map((loc) => (
                                            <TableRow key={loc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                                                <TableCell className="font-mono text-xs text-slate-400">{loc.id}</TableCell>
                                                <TableCell className="font-semibold">{loc.name}</TableCell>
                                                <TableCell><Badge variant="outline">Lvl {loc.floor}</Badge></TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">{loc.type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch checked={!loc.isUnavailable} onCheckedChange={(val) => updateLocation(loc.id, { isUnavailable: !val })} />
                                                        <span className="text-sm font-medium">{loc.isUnavailable ? "Maintenance" : "Active"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingLoc(loc);
                                                        setLocName(loc.name);
                                                        setLocFloor(loc.floor.toString());
                                                        setLocType(loc.type);
                                                        setIsLocDialogOpen(true);
                                                    }}>
                                                        <Save className="h-4 w-4 text-primary" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteLocation(loc.id)}>
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

                    {/* --- ROUTES TAB --- */}
                    <TabsContent value="routes">
                        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                                <div>
                                    <CardTitle>Route Management</CardTitle>
                                    <CardDescription>Design fixed paths or overrides between areas</CardDescription>
                                </div>
                                <Button onClick={() => {
                                    setEditingRoute(null);
                                    setRouteFrom("");
                                    setRouteTo("");
                                    setRouteSteps([]);
                                    setRouteEnabled(true);
                                    setIsRouteDialogOpen(true);
                                }}>
                                    <Plus className="mr-2 h-4 w-4" /> Design Route
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableHead>From/To</TableHead>
                                            <TableHead>Complexity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {routes.map((r, i) => (
                                            <TableRow key={`${r.from}-${r.to}-${i}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                                                <TableCell>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <span className="text-slate-900">{locations.find(l => l.id === r.from)?.name || r.from}</span>
                                                        <ChevronRight className="h-3 w-3 text-slate-400" />
                                                        <span className="text-primary">{locations.find(l => l.id === r.to)?.name || r.to}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{r.steps.length} Steps</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={r.isEnabled ? "success" : "destructive"}>
                                                        {r.isEnabled ? "Live" : "Disabled"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingRoute(r);
                                                        setRouteFrom(r.from);
                                                        setRouteTo(r.to);
                                                        setRouteSteps(r.steps);
                                                        setRouteEnabled(r.isEnabled);
                                                        setIsRouteDialogOpen(true);
                                                    }}>
                                                        <Eye className="h-4 w-4 text-primary" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteRoute(r.from, r.to)}>
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

                    {/* --- FEEDBACK TAB --- */}
                    <TabsContent value="feedback">
                        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>User Feedback</CardTitle>
                                <CardDescription>Reviews and reports from visitors</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {feedback.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {feedback.map(fb => (
                                            <Card key={fb.id} className="bg-white dark:bg-slate-900 overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-900 pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <span key={i} className={i <= fb.rating ? "text-amber-400 text-lg" : "text-slate-200 dark:text-slate-800 text-lg"}>★</span>
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-400">{new Date(fb.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-4">
                                                    <p className="text-sm font-medium italic text-slate-700 dark:text-slate-300">"{fb.comment}"</p>
                                                    {(fb.from || fb.to) && (
                                                        <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                                                            <Badge variant="outline" className="text-[10px] uppercase">{fb.from} → {fb.to}</Badge>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-dashed text-slate-400">
                                        <MessageSquare size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium">No feedback entries yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* --- MODALS --- */}

                {/* Floor Modal */}
                <Dialog open={isFloorDialogOpen} onOpenChange={setIsFloorDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingFloor ? "Edit Floor" : "Add New Floor"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="floorNumber">Floor Number (Level)</Label>
                                <Input id="floorNumber" type="number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} placeholder="0 for Ground, 1 for First..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="floorLabel">Display Name</Label>
                                <Input id="floorLabel" value={floorLabel} onChange={(e) => setFloorLabel(e.target.value)} placeholder="e.g. Ground Floor" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFloorDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveFloor}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Location Modal */}
                <Dialog open={isLocDialogOpen} onOpenChange={setIsLocDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingLoc ? "Edit Location" : "Create New Location"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label>Location Name</Label>
                                <Input value={locName} onChange={(e) => setLocName(e.target.value)} placeholder="Room 302, Principal's Office..." />
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
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsLocDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveLocation}>Commit Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Route Editor Modal */}
                <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden gap-0">
                        <DialogHeader className="p-6 pb-0 mb-4">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <RouteIcon className="h-6 w-6 text-primary" />
                                {editingRoute ? "Edit Optimized Route" : "Design New Navigation Chain"}
                            </DialogTitle>
                            <CardDescription>Chain multiple steps to guide users from A to B with visual cues.</CardDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden flex flex-col px-6">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
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
                                <div className="space-y-2">
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
                                    <Button size="sm" variant="default" onClick={addStep} className="shadow-sm">
                                        <Plus className="h-4 w-4 mr-1" /> Add Step
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 border rounded-xl bg-slate-50/30 p-4 mb-6">
                                <div className="space-y-4">
                                    {routeSteps.map((step, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm group hover:border-primary/50 transition-all">
                                            <div className="flex justify-between items-center mb-4">
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
                                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Panorama (URL/Base64)</Label>
                                                        <Input placeholder="Image..." value={step.panoramaImage} onChange={(e) => updateStep(idx, "panoramaImage", e.target.value)} />
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

                        <DialogFooter className="p-6 border-t bg-slate-50 dark:bg-slate-900/50">
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
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                    <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
                        {icon && typeof icon === 'object' ? icon : <Plus className="h-4 w-4" />}
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                </div>
                {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}
