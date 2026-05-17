import type { PipelineStage } from "@/lib/types";

interface StatusMessageProps {
  stage: PipelineStage | null;
  isLoading: boolean;
}

export default function StatusMessage({ stage, isLoading }: StatusMessageProps) {
  if (!isLoading || !stage) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
      paddingBottom: 16,
      borderBottom: "1px solid var(--border)",
    }}>
      <div className="spinner" />
      <div className="font-mono" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
        {stage}
      </div>
    </div>
  );
}
