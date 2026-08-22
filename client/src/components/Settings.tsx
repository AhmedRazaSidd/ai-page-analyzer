import {
  ArrowLeft,
  X,
} from "lucide-react";
import { useAssistantStore } from "../store/assistantStore";

function Settings() {
  const {
    isSettingsOpen,
    setSettingsOpen,
    isContextActive,
    setContextActive,
  } = useAssistantStore();

  if (!isSettingsOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 bg-[#080d17]">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setSettingsOpen(false)
            }
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={17} />
          </button>

          <h2 className="text-sm font-semibold text-white">
            Settings
          </h2>
        </div>

        <button
          onClick={() =>
            setSettingsOpen(false)
          }
          className="text-gray-500 hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="px-4 py-5">
        <section>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            General
          </p>

          <div className="space-y-1">
            <SettingRow
              title="Auto-detect page changes"
              enabled={true}
              onToggle={() => {}}
            />

            <SettingRow
              title="Show context status in footer"
              enabled={isContextActive}
              onToggle={() =>
                setContextActive(
                  !isContextActive
                )
              }
            />

            <SettingRow
              title="Suggest questions"
              enabled={true}
              onToggle={() => {}}
            />
          </div>
        </section>

        <section className="mt-7">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Appearance
          </p>

          <div className="rounded-xl border border-white/5 bg-[#101521] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">
                Theme
              </span>

              <span className="rounded-lg bg-[#171d2a] px-3 py-1.5 text-[10px] text-gray-400">
                Dark
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-300">
                Font size
              </span>

              <span className="rounded-lg bg-[#171d2a] px-3 py-1.5 text-[10px] text-gray-400">
                Medium
              </span>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            About
          </p>

          <div className="rounded-xl border border-white/5 bg-[#101521] p-3">
            <p className="text-xs text-gray-300">
              AI Page Assistant
            </p>

            <p className="mt-1 text-[10px] text-gray-600">
              Version 0.1.0 (BETA)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

interface SettingRowProps {
  title: string;
  enabled: boolean;
  onToggle: () => void;
}

function SettingRow({
  title,
  enabled,
  onToggle,
}: SettingRowProps) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-left hover:bg-white/[0.03]"
    >
      <span className="text-xs text-gray-400">
        {title}
      </span>

      <span
        className={`relative h-5 w-9 rounded-full transition ${
          enabled
            ? "bg-violet-600"
            : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            enabled
              ? "left-[18px]"
              : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default Settings;