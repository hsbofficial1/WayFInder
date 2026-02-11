import { useLocations, locationTypeLabels, getFloorLabel } from "@/hooks/useNavigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  excludeId?: string;
}

const LocationSelector = ({
  value,
  onChange,
  label,
  placeholder,
  excludeId,
}: LocationSelectorProps) => {
  const { data: locations, isLoading } = useLocations();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  const filtered = (locations || []).filter((l) => {
    if (excludeId && l.id === excludeId) return false;
    return true;
  });

  const floors = [...new Set(filtered.map((l) => l.floor))].sort();

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-14 text-base rounded-xl border-2 border-border bg-card focus:border-primary">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {floors.map((floor) => (
            <SelectGroup key={floor}>
              <SelectLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {getFloorLabel(floor)}
              </SelectLabel>
              {filtered
                .filter((l) => l.floor === floor)
                .map((location) => (
                  <SelectItem
                    key={location.id}
                    value={location.id}
                    className="text-base py-3"
                  >
                    <span className="flex items-center gap-2">
                      <span>{location.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {locationTypeLabels[location.type] || location.type}
                      </span>
                    </span>
                  </SelectItem>
                ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationSelector;
