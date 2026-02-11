
import { useState } from "react";
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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Upload, Map as MapIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { LocationType } from "@/data/locations";
import { RouteStep } from "@/data/routes";

const LOCATION_TYPES: LocationType[] = ["entry", "room", "lab", "office", "hotspot", "utility"];
const ICON_TYPES = ["straight", "left", "right", "stairs-up", "stairs-down", "lift-up", "lift-down", "destination", "start"];

export default function Admin() {
    const { locations, routes, floorMaps, addLocation, deleteLocation, addRoute, deleteRoute, setFloorMap, resetToDefaults } = useNavigationContext();

    // Location Form State
    const [locName, setLocName] = useState("");
    const [locFloor, setLocFloor] = useState("0");
    const [locType, setLocType] = useState<LocationType>("room");
    const [isLocDialogOpen, setIsLocDialogOpen] = useState(false);

    // Route Form State
    const [routeFrom, setRouteFrom] = useState("");
    const [routeTo, setRouteTo] = useState("");
    const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);

    // Map Upload State
    const [uploadFloor, setUploadFloor] = useState("0");

    const handleAddLocation = () => {
        if (!locName) return;
        const id = locName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        addLocation({
            id,
            name: locName,
            floor: parseInt(locFloor),
            type: locType,
        });
        setLocName("");
        setIsLocDialogOpen(false);
        toast.success("Location added");
    };

    const handleAddRoute = () => {
        if (!routeFrom || !routeTo || routeSteps.length === 0) {
            toast.error("Please fill all fields");
            return;
        }
        addRoute({
            from: routeFrom,
            to: routeTo,
            steps: routeSteps,
        });
        setRouteFrom("");
        setRouteTo("");
        setRouteSteps([]);
        setIsRouteDialogOpen(false);
        toast.success("Route added");
    };

    const addStep = () => {
        setRouteSteps([...routeSteps, { instruction: "", icon: "straight", floor: 0 }]);
    };

    const updateStep = (index: number, field: keyof RouteStep, value: any) => {
        const newSteps = [...routeSteps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setRouteSteps(newSteps);
    };

    const removeStep = (index: number) => {
        const newSteps = [...routeSteps];
        newSteps.splice(index, 1);
        setRouteSteps(newSteps);
    };

    const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFloorMap(parseInt(uploadFloor), reader.result as string);
                toast.success(`Map for Floor ${uploadFloor} updated`);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">WayFinder Admin</h1>
                <Button variant="destructive" size="sm" onClick={() => {
                    if (confirm("Are you sure you want to reset everything to defaults?")) {
                        resetToDefaults();
                        toast.success("Reset complete");
                    }
                }}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset Data
                </Button>
            </div>

            <Tabs defaultValue="locations" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="routes">Routes</TabsTrigger>
                    <TabsTrigger value="maps">Floor Maps</TabsTrigger>
                </TabsList>

                {/* LOCATIONS TAB */}
                <TabsContent value="locations">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Manage Locations</CardTitle>
                            <Dialog open={isLocDialogOpen} onOpenChange={setIsLocDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Add Location</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Location</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input value={locName} onChange={(e) => setLocName(e.target.value)} placeholder="e.g. Science Lab" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Floor</Label>
                                            <Select value={locFloor} onValueChange={setLocFloor}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">Ground (0)</SelectItem>
                                                    <SelectItem value="1">First (1)</SelectItem>
                                                    <SelectItem value="2">Second (2)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select value={locType} onValueChange={(v) => setLocType(v as LocationType)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {LOCATION_TYPES.map(t => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleAddLocation} className="w-full">Save Location</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Floor</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.map((loc) => (
                                        <TableRow key={loc.id}>
                                            <TableCell className="font-medium">{loc.name}</TableCell>
                                            <TableCell>{loc.floor}</TableCell>
                                            <TableCell>{loc.type}</TableCell>
                                            <TableCell>
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

                {/* ROUTES TAB */}
                <TabsContent value="routes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Manage Routes</CardTitle>
                            <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Add Route</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Add New Route</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>From</Label>
                                                <Select value={routeFrom} onValueChange={setRouteFrom}>
                                                    <SelectTrigger><SelectValue placeholder="Select Origin" /></SelectTrigger>
                                                    <SelectContent>
                                                        {locations.map(l => (
                                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>To</Label>
                                                <Select value={routeTo} onValueChange={setRouteTo}>
                                                    <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                                                    <SelectContent>
                                                        {locations.map(l => (
                                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label>Steps</Label>
                                                <Button size="sm" variant="outline" onClick={addStep}><Plus className="h-3 w-3 mr-1" /> Add Step</Button>
                                            </div>
                                            {routeSteps.map((step, idx) => (
                                                <div key={idx} className="p-4 border rounded-lg space-y-3 bg-muted/50">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-bold">Step {idx + 1}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStep(idx)}>
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                    <Input
                                                        placeholder="Instruction (e.g. Turn right...)"
                                                        value={step.instruction}
                                                        onChange={(e) => updateStep(idx, "instruction", e.target.value)}
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Select value={step.icon} onValueChange={(v) => updateStep(idx, "icon", v)}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {ICON_TYPES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <Select value={step.floor?.toString()} onValueChange={(v) => updateStep(idx, "floor", parseInt(v))}>
                                                            <SelectTrigger><SelectValue placeholder="Floor" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="0">Floor 0</SelectItem>
                                                                <SelectItem value="1">Floor 1</SelectItem>
                                                                <SelectItem value="2">Floor 2</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Button onClick={handleAddRoute} className="w-full">Save Route</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Origin</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Steps</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {routes.map((r, i) => (
                                        <TableRow key={`${r.from}-${r.to}-${i}`}>
                                            <TableCell>{locations.find(l => l.id === r.from)?.name || r.from}</TableCell>
                                            <TableCell>{locations.find(l => l.id === r.to)?.name || r.to}</TableCell>
                                            <TableCell>{r.steps.length}</TableCell>
                                            <TableCell>
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

                {/* MAPS TAB */}
                <TabsContent value="maps">
                    <Card>
                        <CardHeader>
                            <CardTitle>Floor Map Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <Label>Select Floor to Upload</Label>
                                    <Select value={uploadFloor} onValueChange={setUploadFloor}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Ground Floor</SelectItem>
                                            <SelectItem value="1">First Floor</SelectItem>
                                            <SelectItem value="2">Second Floor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="map-upload">Upload Image</Label>
                                        <Input id="map-upload" type="file" accept="image/*" onChange={handleMapUpload} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
