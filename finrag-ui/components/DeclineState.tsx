"use client";

interface DeclineStateProps {
  ticker: string;
  filingType: string;
  period: string;
  declineReason: string | null;
  onReset: () => void;
}

export default function DeclineState({
  ticker, filingType, period, declineReason, onReset,
}: DeclineStateProps) {
  return (
    <div className="w-full max-w-2xl animate-fade-in mx-auto">
      <div className="border border-border bg-background shadow-sm rounded-2xl p-6 md:p-8 text-center space-y-6">
        
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Insufficient Evidence
          </h3>
          <p className="text-muted-foreground">
            FinRAG could not find reliable evidence in the <strong>{ticker} {filingType} ({period})</strong> filing to answer this query.
          </p>
        </div>

        {declineReason && (
          <div className="bg-muted text-muted-foreground text-sm p-4 rounded-xl text-left border border-border">
            {declineReason}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onReset}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            Try Another Query
          </button>
        </div>
      </div>
    </div>
  );
}
