import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLocations, locationTypeLabels, getFloorLabel } from "@/hooks/useNavigation";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  excludeId?: string;
  icon?: React.ReactNode;
}

const LocationSelector = ({
  value,
  onChange,
  label,
  placeholder,
  excludeId,
  icon,
}: LocationSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: locations, isLoading } = useLocations();

  const selectedLocation = locations?.find((l) => l.id === value);

  // Filter and group locations
  const filteredLocations = useMemo(() => {
    if (!locations) return [];

    let filtered = locations.filter((l) => {
      if (excludeId && l.id === excludeId) return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(query) ||
          locationTypeLabels[l.type].toLowerCase().includes(query)
        );
      }
      return true;
    });

    return filtered;
  }, [locations, excludeId, search]);

  const groupedLocations = useMemo(() => {
    const groups: Record<number, typeof filteredLocations> = {};
    filteredLocations.forEach((l) => {
      if (!groups[l.floor]) {
        groups[l.floor] = [];
      }
      groups[l.floor].push(l);
    });
    return groups;
  }, [filteredLocations]);

  const sortedFloors = Object.keys(groupedLocations)
    .map(Number)
    .sort((a, b) => a - b);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground ml-1">{label}</label>
        <div className="h-16 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground ml-1">{label}</label>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-20 text-left justify-start px-4 rounded-xl border-2 hover:bg-accent/5 hover:border-primary/50 transition-all",
              !value && "text-muted-foreground",
              value && "border-primary/20 bg-primary/5"
            )}
          >
            <div className="flex items-center gap-4 w-full">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {icon || <MapPin size={20} />}
              </div>

              <div className="flex-1 overflow-hidden">
                {selectedLocation ? (
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold truncate leading-tight">
                      {selectedLocation.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {getFloorLabel(selectedLocation.floor)} • {locationTypeLabels[selectedLocation.type]}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg text-muted-foreground">{placeholder}</span>
                )}
              </div>

              <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
            </div>
          </Button>
        </DrawerTrigger>

        <DrawerContent className="h-[85vh] max-h-[85vh] flex flex-col rounded-t-3xl">
          <DrawerHeader className="px-6 pt-6 pb-2 shrink-0 text-left">
            <DrawerTitle className="text-2xl font-bold">{placeholder}</DrawerTitle>
          </DrawerHeader>

          <div className="px-6 py-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search places..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-10 rounded-xl text-base bg-muted/50 border-none focus-visible:ring-1"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-muted-foreground p-0.5 hover:bg-background rounded-full"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 pb-8 pt-2">
            {sortedFloors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No locations found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedFloors.map((floor) => (
                  <div key={floor} className="space-y-3">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                      {getFloorLabel(floor)}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {groupedLocations[floor].map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleSelect(location.id)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                            value === location.id
                              ? "bg-primary/10 border-primary shadow-sm"
                              : "bg-card border-border hover:border-primary/50 active:scale-[0.98]"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                            value === location.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}>
                            <MapPin size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg">{location.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {locationTypeLabels[location.type]}
                            </div>
                          </div>
                          {value === location.id && (
                            <Check className="h-6 w-6 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DrawerClose className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted" asChild>
            <Button variant="ghost" size="icon">
              <X className="h-6 w-6" />
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default LocationSelector;
