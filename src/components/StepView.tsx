import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DirectionIcon from "@/components/DirectionIcon";
import { getFloorLabel, type RouteWithSteps } from "@/hooks/useNavigation";
import { useNavigationContext } from "@/context/NavigationContext";
import { useLocations } from "@/hooks/useNavigation";
import type { IconType } from "@/data/routes";
import PanoramaViewer from "@/components/PanoramaViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StepViewProps {
  route: RouteWithSteps;
  onRestart: () => void;
  onLost: () => void;
}

const StepView = ({ route, onRestart, onLost }: StepViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { language, t } = useLanguage();
  const { data: locations } = useLocations();
  const { addFeedback } = useNavigationContext();
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // Safeguard: Early exit if route is invalid
  if (!route || !route.steps || route.steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
        <p className="text-muted-foreground mb-4">Route information missing or invalid.</p>
        <Button onClick={onRestart} className="rounded-xl">Go Back</Button>
      </div>
    );
  }

  const step = route.steps[currentStep];
  const total = route.steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === total - 1;

  const fromLocation = useMemo(() => locations?.find((l) => l.id === route.from), [locations, route.from]);
  const toLocation = useMemo(() => locations?.find((l) => l.id === route.to), [locations, route.to]);

  // Scroll to top on step change - throttled
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 10);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setCurrentStep((s) => Math.min(s + 1, total - 1));
  }, [total]);

  const handlePrev = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const submitFeedback = useCallback(() => {
    addFeedback({
      rating,
      comment,
      from: route.from,
      to: route.to
    });
    toast.success("Thank you for your feedback!");
    setShowFeedback(false);
    onRestart();
  }, [addFeedback, rating, comment, route.from, route.to, onRestart]);

  const getName = (loc: any) => {
    if (!loc) return "";
    if (language === 'ml') return loc.name_ml || loc.name;
    if (language === 'kn') return loc.name_kn || loc.name;
    return loc.name;
  };

  const getInstruction = (s: any) => {
    if (!s) return "";
    if (language === 'ml') return s.instruction_ml || s.instruction;
    if (language === 'kn') return s.instruction_kn || s.instruction;
    return s.instruction;
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background" ref={topRef}>
      {/* Header */}
      <div className="px-5 pt-6 pb-2 bg-background/95 backdrop-blur-sm z-20 border-b border-border/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onRestart}
            className="text-muted-foreground p-2 -ml-2 hover:bg-muted/50 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center flex-1 mx-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider line-clamp-1">
              {getName(fromLocation) || route.from} → {getName(toLocation) || route.to}
            </p>
          </div>
          <div className="w-8" />
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 h-2 my-2">
          {route.steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-300 ${i === currentStep
                ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                : i < currentStep
                  ? "bg-primary/60"
                  : "bg-secondary"
                }`}
            />
          ))}
        </div>

        <div className="text-center mt-1">
          <p className="text-sm font-semibold text-primary">
            {t('step_counter') || 'Step'} {currentStep + 1} <span className="text-muted-foreground font-normal ml-1">{t('of') || 'of'} {total}</span>
          </p>
        </div>
      </div>

      {/* Step content */}
      <div
        key={currentStep}
        className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-6 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto"
      >
        <div className="text-center space-y-6 w-full max-w-sm mx-auto flex flex-col items-center py-4">
          {/* Floor indicator */}
          {step?.floor !== null && step?.floor !== undefined && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest shadow-sm shrink-0">
              {getFloorLabel(step.floor)}
            </div>
          )}

          {/* Direction icon */}
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/30 transition-colors" />
            <div className="relative bg-card p-6 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-border/50">
              <DirectionIcon type={(step?.icon_type || step?.icon || "straight") as IconType} size={72} />
            </div>
          </div>

          {/* Instruction */}
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground px-2 shrink-0">
            {getInstruction(step)}
          </h2>

          {/* Landmark Panorama/Image */}
          {step?.landmarkImage && (
            <div className="w-full min-h-[180px] max-h-[300px] aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-border/40 bg-muted/30 relative shrink-0">
              <PanoramaViewer
                key={step.landmarkImage}
                imageSrc={step.landmarkImage}
                className="w-full h-full"
                initialZoom={110}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/60 backdrop-blur-md text-[10px] text-center text-muted-foreground font-medium border-t border-border/40 uppercase tracking-wider">
                Move device or drag to explore
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div
        className="px-5 pb-8 pt-4 space-y-4 bg-background border-t border-border/50 shrink-0 z-20"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {isLast ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-2 text-success font-semibold py-4 bg-success/10 rounded-2xl border border-success/20">
              <CheckCircle2 size={32} />
              <span className="text-lg uppercase tracking-wider">{t('arrived')}</span>
            </div>
            <Button
              onClick={() => setShowFeedback(true)}
              className="w-full h-16 text-lg rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 bg-emerald-600 hover:bg-emerald-700"
            >
              Share Feedback
            </Button>
            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full h-16 text-lg rounded-2xl gap-2 font-semibold shadow-sm hover:bg-secondary/80"
            >
              <RotateCcw size={20} />
              {t('navigate_elsewhere')}
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`h-16 px-6 rounded-2xl border-2 transition-all flex items-center justify-center ${isFirst ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:bg-secondary/50 active:scale-95 border-border shadow-sm'}`}
              aria-label="Previous step"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={handleNext}
              className="flex-1 h-16 text-lg rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground flex items-center justify-center active:scale-[0.98] transition-all"
              aria-label="Next step"
            >
              <span className="flex items-center gap-2">
                {t('next_step')}
                <ChevronRight size={28} />
              </span>
            </button>
          </div>
        )}

        {/* Secondary Actions */}
        {!isLast && (
          <div className="flex gap-4 px-2">
            <button
              onClick={onLost}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-amber-600 bg-amber-50/50 hover:bg-amber-100/50 rounded-xl transition-colors"
            >
              <HelpCircle size={16} />
              I'm Lost
            </button>
            <button
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
            >
              <XCircle size={16} />
              Restart
            </button>
          </div>
        )}
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="sm:max-w-md rounded-3xl" aria-describedby="feedback-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">How was your journey?</DialogTitle>
            <DialogDescription id="feedback-description" className="text-center">
              Your feedback help us improve building navigation for everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all ${star <= rating ? "text-amber-400 scale-110" : "text-slate-200"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="w-full min-h-[100px] p-4 rounded-2xl border bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Any comments to help us improve?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="ghost" onClick={() => setShowFeedback(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={submitFeedback} className="rounded-xl px-8 shadow-lg shadow-primary/20">Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StepView;
