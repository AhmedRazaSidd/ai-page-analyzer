import {
  ArrowLeft,
  RotateCw,
  Star,
  Sparkles,
  MoreVertical,
} from "lucide-react";

interface WelcomeScreenProps {
  onOpenAssistant: () => void;
}

interface LegendItem {
  label: string;
  color: string;
}

const legend: LegendItem[] = [
  { label: "User Action", color: "bg-primary" },
  { label: "AI Response", color: "bg-info" },
  { label: "System/Status", color: "bg-success" },
];

function WelcomeScreen({ onOpenAssistant }: WelcomeScreenProps) {
  return (
    <main className="flex h-162.5 w-105 flex-col overflow-hidden bg-background px-6 pb-8 pt-10 text-foreground">
      {/* Heading */}
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
        AI Page Assistant
      </h1>
      <h2 className="mb-4 bg-primary-gradient bg-clip-text text-3xl font-extrabold leading-tight tracking-tight text-transparent">
        Complete Flow
      </h2>

      <p className="mb-6 text-sm leading-relaxed text-muted">
        Smart AI assistant to understand any web page instantly.
      </p>

      {/* Legend */}
      <ul className="mb-8 space-y-2.5">
        {legend.map(({ label, color }) => (
          <li
            key={label}
            className="flex items-center gap-2.5 text-sm text-foreground"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {label}
          </li>
        ))}
      </ul>

      {/* Mock browser toolbar */}
      <div className="mb-2 flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3">
        <div className="flex items-center gap-3 text-muted">
          <ArrowLeft size={16} />
          <RotateCw size={15} />
        </div>

        <div className="flex items-center gap-3">
          <Star size={16} className="text-muted" />
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-gradient ">
            <Sparkles size={14} className="text-white" />
          </div>
          <MoreVertical size={16} className="text-muted" />
        </div>
      </div>

      {/* Dashed connector */}
      <div className="ml-[calc(100%-52px)] h-8 w-px border-l border-dashed border-primary-border" />

      {/* Assistant card */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-gradient ">
            <Sparkles size={18} className="text-white" />
          </div>

          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              AI Page Assistant
            </h3>
            <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
              BETA
            </span>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted">
          Understand any web page with AI
        </p>

        <button
          onClick={onOpenAssistant}
          className="w-full rounded-xl bg-primary-gradient py-3 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
        >
          Open Assistant
        </button>
      </div>

      <p className="mt-6 text-center text-sm leading-relaxed text-muted">
        Click the extension icon
        <br />
        to open the assistant
      </p>
    </main>
  );
}

export default WelcomeScreen;
