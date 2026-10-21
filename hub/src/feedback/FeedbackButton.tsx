import { useFeedback } from "./FeedbackProvider";

export function FeedbackButton({ className = "" }: { className?: string }) {
  const feedback = useFeedback();
  if (!feedback) return null;
  return (
    <button
      type="button"
      onClick={() => feedback.open()}
      className={`rounded border border-line px-2 py-1 font-mono text-xs text-muted hover:border-accent hover:text-accent ${className}`}
    >
      Feedback
    </button>
  );
}
