import { Play, Pause, RotateCcw, Flag, Timer as TimerIcon } from "lucide-react";
import { useTimer } from "@/hooks";
import { formatTimerDisplay } from "@/utils";
import { cn } from "@/lib/utils";

interface TimerProps {
  onStop?: (ms: number) => void;
  onLap?: (ms: number) => void;
  compact?: boolean;
}

export function Timer({ onStop, onLap, compact = false }: TimerProps) {
  const { isRunning, elapsed, laps, start, stop, reset, lap } = useTimer();

  const handleStop = () => {
    stop();
    onStop?.(elapsed);
  };

  const handleLap = () => {
    lap();
    onLap?.(elapsed);
  };

  if (compact) {
    return (
      <div className="card p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
          <TimerIcon size={20} />
        </div>
        <div className="flex-1">
          <div className="font-mono text-3xl font-bold text-slate-800 tabular-nums tracking-tight">
            {formatTimerDisplay(elapsed)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {isRunning ? "计时中..." : laps.length ? `${laps.length} 条记录` : "准备就绪"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={start}
              className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center shadow-lg shadow-success/30 hover:bg-emerald-600 transition active:scale-95"
            >
              <Play size={22} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-12 h-12 rounded-full bg-danger text-white flex items-center justify-center shadow-lg shadow-danger/30 hover:bg-red-600 transition active:scale-95"
            >
              <Pause size={22} fill="currentColor" />
            </button>
          )}
          <button
            onClick={reset}
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition active:scale-95"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="text-center mb-6">
        <div
          className={cn(
            "font-mono font-bold tabular-nums tracking-tighter text-slate-900 transition",
            isRunning && "text-primary-600 animate-pulse"
          )}
          style={{ fontSize: "72px", lineHeight: 1 }}
        >
          {formatTimerDisplay(elapsed)}
        </div>
        <div className="mt-2 text-sm text-slate-500">
          {isRunning ? "计时中" : elapsed > 0 ? "已暂停" : "点击开始按钮启动计时"}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-5">
        {!isRunning ? (
          <button
            onClick={start}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-success to-emerald-600 text-white flex items-center justify-center shadow-xl shadow-success/30 hover:shadow-success/50 transition-all active:scale-95"
          >
            <Play size={36} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-danger to-red-600 text-white flex items-center justify-center shadow-xl shadow-danger/30 hover:shadow-danger/50 transition-all active:scale-95"
          >
            <Pause size={36} fill="currentColor" />
          </button>
        )}
        <button
          onClick={handleLap}
          disabled={!isRunning}
          className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Flag size={26} />
        </button>
        <button
          onClick={reset}
          className="w-16 h-16 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition active:scale-95"
        >
          <RotateCcw size={22} />
        </button>
      </div>

      {laps.length > 0 && (
        <div className="max-h-32 overflow-y-auto scrollbar-thin border-t border-slate-100 pt-3">
          <div className="space-y-1">
            {laps.map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 text-sm"
              >
                <span className="text-slate-500">第 {laps.length - i} 次</span>
                <span className="font-mono font-semibold text-slate-800 tabular-nums">
                  {formatTimerDisplay(l)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
