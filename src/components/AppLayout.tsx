import { useState } from "react";
import { Outlet } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SyncCenter } from "@/components/SyncCenter";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const [syncOpen, setSyncOpen] = useState(false);
  const records = useAppStore((s) => s.records);
  const pendingCount = records.filter((r) => r.syncStatus === "pending" || r.syncStatus === "failed").length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="h-14 flex items-center justify-end px-5 border-b border-slate-200 bg-white shrink-0">
          <button
            onClick={() => setSyncOpen(true)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              pendingCount > 0
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            )}
          >
            <RefreshCw size={16} className={pendingCount > 0 ? "animate-spin" : ""} style={pendingCount > 0 ? { animationDuration: "3s" } : undefined} />
            同步中心
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
        <Outlet />
      </main>
      <SyncCenter open={syncOpen} onClose={() => setSyncOpen(false)} />
    </div>
  );
}
