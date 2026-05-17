"use client";

import { useEffect, useState } from "react";
import type { PipelineStage } from "@/lib/types";

interface PipelineProgressProps {
  currentStage: PipelineStage | null;
  isLoading: boolean;
  hasFirstToken: boolean;
}

const STAGES: { key: PipelineStage; label: string; }[] = [
  { key: "Encoding query...",              label: "Encoding" },
  { key: "Retrieving candidate chunks...", label: "Retrieving" },
  { key: "Reranking with cross-encoder...",label: "Reranking" },
  { key: "Enforcing citations...",         label: "Grounding" },
  { key: "Generating grounded answer...",  label: "Generating" },
];

export default function PipelineProgress({ currentStage, isLoading, hasFirstToken }: PipelineProgressProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (hasFirstToken) {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    } else {
      setVisible(true);
    }
  }, [hasFirstToken]);

  if (!isLoading && !currentStage) return null;

  return (
    <div className={`transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
      
      {/* Animated Loading Pill */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border border-border rounded-full">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {currentStage || "Thinking..."}
          </span>
        </div>

        {/* Mini progress steps */}
        <div className="flex items-center gap-2">
          {STAGES.map((stage, i) => {
            const currentIdx = STAGES.findIndex((s) => s.key === currentStage);
            const isComplete = i < currentIdx;
            const isActive = i === currentIdx;
            
            return (
              <div key={stage.key} className="flex items-center gap-2">
                <div 
                  className={`
                    w-2 h-2 rounded-full transition-colors duration-300
                    ${isComplete ? 'bg-green-500' : isActive ? 'bg-primary' : 'bg-muted-foreground/30'}
                  `}
                  title={stage.label}
                />
                {i < STAGES.length - 1 && (
                  <div className={`w-4 h-[2px] rounded-full transition-colors duration-300 ${isComplete ? 'bg-green-500/50' : 'bg-muted-foreground/20'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
