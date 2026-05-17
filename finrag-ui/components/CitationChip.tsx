import type { Citation } from "@/lib/types";

interface CitationChipProps {
  citation: Citation;
  onClick: () => void;
  index: number;
}

export default function CitationChip({ citation, onClick, index }: CitationChipProps) {
  return (
    <button
      onClick={onClick}
      title={`${citation.ticker} · ${citation.filing_type} · ${citation.section} · p.${citation.page}`}
      className="inline-flex items-center justify-center relative -top-[0.2em] ml-1 px-1 py-0.5 rounded text-[10px] font-mono font-medium leading-none text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
    >
      {index}
    </button>
  );
}
