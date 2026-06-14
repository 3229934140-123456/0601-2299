import { useState, useMemo } from "react";
import {
  X,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/utils";
import type { SyncStatus, TestRecord } from "@/types";

interface SyncCenterProps {
  open: boolean;
  onClose: () => void;
}

type TabKey = "pending" | "failed" | "synced";

const tabs: { key: TabKey; label: string; icon: typeof Clock }[] = [
  { key: "pending", label: "待同步", icon: Clock },
  { key: "failed", label: "同步失败", icon: AlertCircle },
  { key: "synced", label: "已同步", icon: CheckCircle2 },
];

export function SyncCenter({ open, onClose }: SyncCenterProps) {
  const { records, students, projects, isOnline, retrySync } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  const grouped = useMemo(() => {
    const pending = records.filter((r) => r.syncStatus === "pending");
    const failed = records.filter((r) => r.syncStatus === "failed");
    const synced = records.filter((r) => r.syncStatus === "synced");
    return { pending, failed, synced };
  }, [records]);

  const currentList = grouped[activeTab];

  const handleRetryAll = () => {
    const list = activeTab === "pending" ? grouped.pending : grouped.failed;
    list.forEach((r) => retrySync(r.id));
  };

  const getStudentName = (studentId: string) =>
    students.find((s) => s.id === studentId)?.name ?? "未知学生";

  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.name ?? "未知项目";

  const getProjectType = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.type ?? "counting";

  const formatScore = (record: TestRecord) => {
    if (record.score === null) return "-";
    const type = getProjectType(record.projectId);
    return type === "timing" ? formatTime(record.score) : String(record.score);
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white z-50 flex flex-col shadow-2xl animate-slide-in-right">
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">同步中心</h2>
            <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full", isOnline ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? "在线" : "离线"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-200 shrink-0">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative",
                activeTab === key
                  ? "text-primary-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={16} />
              {label}
              {grouped[key].length > 0 && (
                <span
                  className={cn(
                    "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                    activeTab === key
                      ? "bg-primary-100 text-primary-600"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  {grouped[key].length}
                </span>
              )}
              {activeTab === key && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {(activeTab === "pending" || activeTab === "failed") && currentList.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 shrink-0">
            <button
              onClick={handleRetryAll}
              className="btn-primary text-xs px-4 py-2"
            >
              <RefreshCw size={14} />
              全部重试
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <CheckCircle2 size={48} strokeWidth={1} />
              <p className="mt-3 text-sm">暂无{tabs.find((t) => t.key === activeTab)?.label}记录</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {currentList.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800 truncate">
                          {getStudentName(record.studentId)}
                        </span>
                        <span className="chip text-[11px]">
                          {getProjectName(record.projectId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>成绩: <span className="font-medium text-slate-700">{formatScore(record)}</span></span>
                        <span>得分: <span className="font-medium text-slate-700">{record.points}</span></span>
                      </div>
                      <div className="mt-1.5 text-[11px] text-slate-400">
                        {activeTab === "synced" && record.syncedAt
                          ? `同步时间: ${formatDate(record.syncedAt)}`
                          : `更新时间: ${formatDate(record.updatedAt)}`}
                      </div>
                    </div>
                    {activeTab === "failed" && (
                      <button
                        onClick={() => retrySync(record.id)}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                      >
                        <RefreshCw size={12} className="inline mr-1" />
                        重试
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-12 flex items-center justify-center gap-6 border-t border-slate-200 text-xs text-slate-400 shrink-0 bg-slate-50/50">
          <span>
            <span className="text-amber-500 font-bold">{grouped.pending.length}</span> 条待同步
          </span>
          <span className="text-slate-300">/</span>
          <span>
            <span className="text-red-500 font-bold">{grouped.failed.length}</span> 条失败
          </span>
          <span className="text-slate-300">/</span>
          <span>
            <span className="text-emerald-500 font-bold">{grouped.synced.length}</span> 条已同步
          </span>
        </div>
      </div>
    </>
  );
}
