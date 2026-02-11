import floor0 from "@/assets/floor-0.png";
import floor1 from "@/assets/floor-1.png";
import floor2 from "@/assets/floor-2.png";
import { useNavigationContext } from "@/context/NavigationContext";

const defaultFloorMaps: Record<number, string> = {
  0: floor0,
  1: floor1,
  2: floor2,
};

interface FloorMapProps {
  floor: number;
}

const FloorMap = ({ floor }: FloorMapProps) => {
  const { floorMaps } = useNavigationContext();

  // Use uploaded map if available, otherwise default
  const src = floorMaps[floor] || defaultFloorMaps[floor];

  if (!src) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      <img
        src={src}
        alt={`Floor ${floor} map`}
        className="w-full h-auto"
        loading="lazy"
      />
    </div>
  );
};

export default FloorMap;
