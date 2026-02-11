import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DirectionIcon from "@/components/DirectionIcon";
import FloorMap from "@/components/FloorMap";
import { getFloorLabel, type RouteWithSteps } from "@/hooks/useNavigation";
import { useLocations } from "@/hooks/useNavigation";
import type { IconType } from "@/data/routes";

interface StepViewProps {
  route: RouteWithSteps;
  onRestart: () => void;
}

const StepView = ({ route, onRestart }: StepViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { data: locations } = useLocations();
  const step = route.steps[currentStep];
  const total = route.steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === total - 1;
  const fromLocation = locations?.find((l) => l.id === route.from);
  const toLocation = locations?.find((l) => l.id === route.to);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onRestart} className="text-muted-foreground p-1" aria-label="Go back">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">
              {fromLocation?.name || route.from} → {toLocation?.name || route.to}
            </p>
          </div>
          <div className="w-8" />
        </div>
        {/* Progress bar */}
        <div className="flex gap-1 mt-2">
          {route.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= currentStep ? "bg-primary" : "bg-direction-connector"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-4">
        <div className="text-center space-y-5 w-full max-w-sm">
          {/* Floor indicator */}
          {step.floor !== null && step.floor !== undefined && (
            <div className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              {getFloorLabel(step.floor)}
            </div>
          )}

          {/* Direction icon */}
          <div className="flex justify-center">
            <DirectionIcon type={step.icon_type as IconType} size={48} />
          </div>

          {/* Step counter */}
          <p className="text-sm font-semibold text-primary">
            Step {currentStep + 1} of {total}
          </p>

          {/* Instruction */}
          <p className="text-xl font-bold leading-relaxed text-foreground max-w-xs mx-auto">
            {step.instruction}
          </p>

          {/* Floor map */}
          {step.floor !== null && step.floor !== undefined && (
            <FloorMap floor={step.floor} />
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="px-4 pb-6 safe-bottom space-y-3">
        {isLast ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-success font-semibold py-3">
              <CheckCircle2 size={24} />
              <span>You've arrived!</span>
            </div>
            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full h-14 text-base rounded-xl gap-2"
            >
              <RotateCcw size={18} />
              Navigate Somewhere Else
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={isFirst}
              variant="outline"
              className="h-14 px-6 text-base rounded-xl"
            >
              <ChevronLeft size={20} />
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="flex-1 h-14 text-base rounded-xl font-semibold gap-2"
            >
              Next Step
              <ChevronRight size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepView;
