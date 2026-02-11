import { MoveUp, MoveLeft, MoveRight, ArrowUp, ArrowDown, MapPin, Navigation } from "lucide-react";
import type { IconType } from "@/data/routes";

interface DirectionIconProps {
  type: IconType;
  size?: number;
  className?: string;
}

const iconMap: Record<IconType, React.ElementType> = {
  straight: MoveUp,
  left: MoveLeft,
  right: MoveRight,
  "stairs-up": ArrowUp,
  "stairs-down": ArrowDown,
  "lift-up": ArrowUp,
  "lift-down": ArrowDown,
  destination: MapPin,
  start: Navigation,
};

const labelMap: Record<IconType, string> = {
  straight: "Go Straight",
  left: "Turn Left",
  right: "Turn Right",
  "stairs-up": "Stairs Up",
  "stairs-down": "Stairs Down",
  "lift-up": "Lift Up",
  "lift-down": "Lift Down",
  destination: "Destination",
  start: "Start",
};

const DirectionIcon = ({ type, size = 32, className = "" }: DirectionIconProps) => {
  const Icon = iconMap[type];
  const isDestination = type === "destination";
  const isStart = type === "start";

  return (
    <div
      className={`flex flex-col items-center gap-1 ${className}`}
      aria-label={labelMap[type]}
    >
      <div
        className={`rounded-2xl p-3 ${
          isDestination
            ? "bg-success text-success-foreground"
            : isStart
            ? "bg-accent text-accent-foreground"
            : "bg-direction-bg text-direction-active"
        }`}
      >
        <Icon size={size} strokeWidth={2.5} />
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {labelMap[type]}
      </span>
    </div>
  );
};

export default DirectionIcon;
