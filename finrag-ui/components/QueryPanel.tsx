"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import PipelineProgress from "./PipelineProgress";
import CitationChip from "./CitationChip";
import DeclineState from "./DeclineState";
import type { Citation, QueryFilters } from "@/lib/types";

// Note: `ConfidenceBadge` functionality and backend status was requested to be simplified
// and cleanly integrated. We can add a simple confidence display in the header or alongside the answer.

interface FinRAGStateProps {
  submit: (query: string, filters: QueryFilters) => void;
  reset: () => void;
  answer: string;
  citations: Citation[];
  isLoading: boolean;
  currentStage: any;
  declined: boolean;
  declineReason: string | null;
  error: string | null;
  hasResult: boolean;
  confidence: number | null;
}

interface QueryPanelProps {
  filters: QueryFilters;
  onCitationClick: (citation: Citation) => void;
  pendingQuery?: string;
  onPendingQueryConsumed?: () => void;
  finragState: FinRAGStateProps;
}

function formatPeriodLabel(period: string): string {
  if (!period) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    try {
      const d = new Date(period + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch { return period; }
  }
  return period;
}

function renderAnswerWithCitations(
  answer: string,
  citations: Citation[],
  onCitationClick: (c: Citation) => void,
  isLoading: boolean
): React.ReactNode {
  if (!answer) return null;
  const parts = answer.split(/(\[\d+\])/g);
  return (
    <span className={isLoading ? "cursor-blink" : ""}>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          const citation = citations[idx - 1];
          if (citation) {
            return (
              <CitationChip
                key={i}
                citation={citation}
                index={idx}
                onClick={() => onCitationClick(citation)}
              />
            );
          }
          return <span key={i} className="text-primary font-medium">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function QueryPanel({
  filters, onCitationClick, pendingQuery, onPendingQueryConsumed, finragState
}: QueryPanelProps) {
  const {
    submit, reset, answer, citations,
    isLoading, currentStage, declined, declineReason, error, hasResult, confidence
  } = finragState;

  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingQuery) {
      setQuery(pendingQuery);
      onPendingQueryConsumed?.();
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [pendingQuery, onPendingQueryConsumed]);

  useEffect(() => {
    if (answerRef.current && isLoading) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer, isLoading]);

  const handleSubmit = useCallback(() => {
    if (!query.trim() || isLoading) return;
    submit(query.trim(), filters);
  }, [query, isLoading, submit, filters]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    reset();
    setQuery("");
    textareaRef.current?.focus();
  };

  const periodLabel = formatPeriodLabel(filters.fiscal_period);
  const hasFirstToken = answer.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full relative bg-background">
      
      {/* Scrollable Content Area */}
      <div 
        ref={answerRef} 
        className="flex-1 overflow-y-auto px-4 sm:px-8 pt-8 pb-32 flex flex-col items-center"
      >
        <div className="w-full max-w-3xl mx-auto flex flex-col justify-center h-full min-h-[400px]">
          
          {/* Empty State */}
          {!hasResult && !isLoading && !error && (
            <div className="animate-fade-in w-full flex flex-col items-center justify-center space-y-8 h-full pb-12">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  How can I help you research?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Ask a question about {filters.ticker} {filters.filing_type} filings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                {[
                  { q: "What was total revenue and net income?", icon: "📊" },
                  { q: "What AI-related risk factors were disclosed?", icon: "🛡️" },
                  { q: "How did operating margin change YoY?", icon: "📈" },
                  { q: "What did management say about future guidance?", icon: "🔮" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(item.q)}
                    className="flex items-start gap-3 p-4 text-left border border-border rounded-xl bg-background hover:bg-muted/40 transition-colors shadow-sm"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium text-foreground leading-snug">{item.q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Query / Answer State */}
          {(isLoading || hasResult || error) && (
            <div className="w-full space-y-8 animate-fade-in pb-12">
              
              {/* User Query Bubble */}
              <div className="flex flex-col items-end w-full">
                <div className="bg-muted px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%]">
                  <p className="text-foreground">{query || "..."}</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-900 rounded-xl dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
                  <h4 className="font-semibold mb-1">Error processing request</h4>
                  <p className="text-sm">{error}</p>
                  <button onClick={handleReset} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    Try Again
                  </button>
                </div>
              )}

              {/* Pipeline Progress */}
              <PipelineProgress
                currentStage={currentStage}
                isLoading={isLoading}
                hasFirstToken={hasFirstToken}
              />

              {/* Decline State */}
              {declined && (
                <DeclineState
                  ticker={filters.ticker}
                  filingType={filters.filing_type}
                  period={periodLabel}
                  declineReason={declineReason}
                  onReset={handleReset}
                />
              )}

              {/* Answer Content */}
              {!declined && (answer || isLoading) && (
                <div className="flex flex-col items-start w-full gap-4">
                  
                  {/* Assistant Icon & Meta */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                        <path d="M22 12a10 10 0 0 0-10-10v10h10z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-foreground">FinRAG</span>
                    {confidence !== null && !isLoading && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        confidence > 0.8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        confidence > 0.5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {(confidence * 100).toFixed(0)}% Confidence
                      </span>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                    {renderAnswerWithCitations(answer, citations, onCitationClick, isLoading)}
                  </div>

                  {/* Sources List */}
                  {!isLoading && citations.length > 0 && (
                    <div className="w-full mt-6 space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sources</h4>
                      <div className="flex flex-wrap gap-2">
                        {citations.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => onCitationClick(c)}
                            className="flex items-center gap-2 px-3 py-2 text-xs border border-border bg-background hover:bg-muted/50 rounded-lg transition-colors text-left max-w-sm overflow-hidden"
                          >
                            <span className="text-primary font-mono flex-shrink-0">[{i + 1}]</span>
                            <span className="font-medium truncate">{c.section}</span>
                            {c.page && <span className="text-muted-foreground flex-shrink-0">p.{c.page}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-background via-background to-transparent pt-12">
        <div className="max-w-3xl mx-auto relative">
          
          <div className="relative shadow-sm border border-border rounded-2xl bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${filters.ticker}...`}
              disabled={isLoading}
              rows={1}
              className="w-full max-h-[150px] resize-none bg-transparent border-0 py-4 pl-4 pr-16 text-sm placeholder:text-muted-foreground focus:ring-0 disabled:opacity-50"
            />
            
            <div className="absolute right-2 bottom-2">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !query.trim()}
                className={`
                  p-2 rounded-xl flex items-center justify-center transition-all
                  ${query.trim() && !isLoading ? 'bg-primary text-primary-foreground shadow-sm hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'}
                `}
                aria-label="Submit query"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-2">
            <span className="text-[11px] text-muted-foreground font-medium">
              FinRAG grounds answers in verified SEC filings.
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
