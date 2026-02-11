import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DirectionIcon from "@/components/DirectionIcon";
import FloorMap from "@/components/FloorMap";
import { getFloorLabel, type RouteWithSteps } from "@/hooks/useNavigation";
import { useLocations } from "@/hooks/useNavigation";
import type { IconType } from "@/data/routes";

interface StepViewProps {
  route: RouteWithSteps;
  onRestart: () => void;
  onLost: () => void;
}

const StepView = ({ route, onRestart, onLost }: StepViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { language, t } = useLanguage();
  const { data: locations } = useLocations();
  const step = route.steps[currentStep];
  const total = route.steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === total - 1;
  const fromLocation = locations?.find((l) => l.id === route.from);
  const toLocation = locations?.find((l) => l.id === route.to);

  const getName = (loc: any) => {
    if (!loc) return "";
    if (language === 'ml') return loc.name_ml || loc.name;
    if (language === 'kn') return loc.name_kn || loc.name;
    return loc.name;
  };

  const getInstruction = (s: any) => {
    if (language === 'ml') return s.instruction_ml || s.instruction;
    if (language === 'kn') return s.instruction_kn || s.instruction;
    return s.instruction;
  };

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
              {getName(fromLocation) || route.from} → {getName(toLocation) || route.to}
            </p>
          </div>
          <div className="w-8" />
        </div>
        {/* Progress bar */}
        <div className="flex gap-1 mt-2">
          {route.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= currentStep ? "bg-primary" : "bg-direction-connector"
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
            <DirectionIcon type={step.icon as IconType} size={48} />
          </div>

          {/* Step counter */}
          <p className="text-sm font-semibold text-primary">
            {t('step_counter')} {currentStep + 1} {t('of')} {total}
          </p>

          {/* Instruction */}
          <p className="text-xl font-bold leading-relaxed text-foreground max-w-xs mx-auto">
            {getInstruction(step)}
          </p>

          {/* Landmark Panorama/Image */}
          {step.landmarkImage && (
            <div className="w-full rounded-lg overflow-hidden shadow-md my-2 border border-border/50">
              <img
                src={step.landmarkImage}
                alt="Landmark view"
                className="w-full h-48 object-cover transition-transform hover:scale-105 duration-500"
              />
            </div>
          )}

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
              <span>{t('arrived')}</span>
            </div>
            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full h-14 text-base rounded-xl gap-2"
            >
              <RotateCcw size={18} />
              {t('navigate_elsewhere')}
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
              {t('back')}
            </Button>
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="flex-1 h-14 text-base rounded-xl font-semibold gap-2"
            >
              {t('next_step')}
              <ChevronRight size={20} />
            </Button>
          </div>
        )}

        {/* Secondary Actions */}
        {!isLast && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onLost}
              variant="secondary"
              className="flex-1 h-12 text-sm rounded-xl font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200"
            >
              <HelpCircle size={18} className="mr-2" />
              I'm Lost
            </Button>
            <Button
              onClick={onRestart}
              variant="ghost"
              className="flex-1 h-12 text-sm rounded-xl font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <XCircle size={18} className="mr-2" />
              Restart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepView;
