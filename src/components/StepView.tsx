import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, HelpCircle, XCircle, ArrowLeft } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

      {/* Immersive Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={onRestart}
          className="pointer-events-auto w-10 h-10 rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Exit Navigation"
        >
          <XCircle size={20} />
        </button>

        <div className="pointer-events-auto bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
          Step {currentStep + 1}/{total}
        </div>
      </div>

      {/* Main Visual Generation Area */}
      <div className="relative flex-1 bg-muted/20 w-full overflow-hidden flex flex-col">
        {step?.landmarkImage ? (
          <PanoramaViewer
            key={step.landmarkImage}
            imageSrc={step.landmarkImage}
            className="w-full h-full absolute inset-0"
            initialZoom={100}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/5 relative overflow-hidden">
            {/* Decorative background circles */}
            <div className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse" />

            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-50 duration-500">
              <div className="p-8 rounded-[3rem] bg-card shadow-2xl shadow-primary/10 border border-white/20">
                <DirectionIcon type={(step?.icon_type || step?.icon || "straight") as IconType} size={84} />
              </div>
              {step?.floor !== undefined && (
                <div className="mt-6 px-4 py-2 bg-background/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground border border-border/50">
                  {getFloorLabel(step.floor)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      </div>

      {/* Instruction Card & Navigation */}
      <div className="relative z-20 bg-background rounded-t-[2.5rem] -mt-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border-t border-border/50 flex flex-col">
        {/* Handle bar for visual cue */}
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-2 opacity-50" />

        <div className="px-6 pb-2 text-center">
          <h2 className="text-2xl font-bold leading-tight text-foreground text-balance animate-in slide-in-from-bottom-2 duration-500 key={currentStep}">
            {getInstruction(step)}
          </h2>
        </div>

        {/* Navigation Controls */}
        <div className="p-6 pt-4 flex gap-4 items-center">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all active:scale-95",
              isFirst
                ? "border-muted text-muted-foreground opacity-30 cursor-not-allowed"
                : "border-border hover:bg-secondary text-foreground shadow-sm"
            )}
            aria-label="Previous step"
          >
            <ArrowLeft size={24} />
          </button>

          {!isLast ? (
            <button
              onClick={handleNext}
              className="flex-1 h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Next Step</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => setShowFeedback(true)}
              className="flex-1 h-16 rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 animate-pulse"
            >
              <span>Arrived!</span>
              <CheckCircle2 size={24} />
            </button>
          )}
        </div>

        <div className="px-6 pb-6 pt-0 flex justify-center">
          <button
            onClick={onLost}
            className="text-xs font-medium text-amber-600 hover:underline flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full"
          >
            <HelpCircle size={12} />
            I'm lost, update route
          </button>
        </div>
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
              className="w-full min-h-[100px] p-4 rounded-2xl border bg-secondary/30 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
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
