import { useState, useRef, useEffect } from "react";
import { Calendar, Plus, ChevronDown, X, Check } from "lucide-react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/utils";
import type { TestSession } from "@/types";

interface SessionSelectorProps {
  className?: string;
  compact?: boolean;
}

type SessionType = "formal" | "makeup" | "other";

const sessionTypeLabels: Record<SessionType, string> = {
  formal: "正式",
  makeup: "补测",
  other: "其他",
};

const sessionTypeColors: Record<SessionType, string> = {
  formal: "bg-sky-50 text-sky-700 border-sky-200",
  makeup: "bg-amber-50 text-amber-700 border-amber-200",
  other: "bg-slate-100 text-slate-600 border-slate-200",
};

export function SessionSelector({ className, compact = false }: SessionSelectorProps) {
  const {
    sessions,
    currentSessionId,
    setCurrentSession,
    createSession,
    records,
    getRecordsBySession,
    currentClassId,
    currentTeacher,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionType, setNewSessionType] = useState<SessionType>("formal");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const currentSessionRecords = currentSessionId ? getRecordsBySession(currentSessionId) : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    setIsOpen(false);
  };

  const handleCreateSession = () => {
    if (!newSessionName.trim()) return;
    createSession({
      name: newSessionName.trim(),
      type: newSessionType,
      startTime: new Date().toISOString(),
      classId: currentClassId,
      teacherId: currentTeacher.id,
    });
    setNewSessionName("");
    setNewSessionType("formal");
    setShowCreateModal(false);
  };

  const getSessionRecordCount = (sessionId: string) => {
    return records.filter((r) => r.sessionId === sessionId).length;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 rounded-xl border bg-white text-left transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400",
          compact ? "px-3 py-2 text-sm" : "px-4 py-2.5",
          isOpen ? "border-primary-400 ring-2 ring-primary-100" : "border-slate-200"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-lg",
            compact ? "w-7 h-7 bg-primary-50 text-primary-600" : "w-9 h-9 bg-primary-50 text-primary-600"
          )}
        >
          <Calendar size={compact ? 16 : 18} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "font-semibold text-slate-800 truncate",
              compact ? "text-sm" : "text-sm"
            )}
          >
            {currentSession?.name || "请选择场次"}
          </div>
          {!compact && (
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span
                className={cn(
                  "tag border",
                  sessionTypeColors[currentSession?.type || "other"]
                )}
              >
                {sessionTypeLabels[currentSession?.type || "other"]}
              </span>
              <span>已录入 {currentSessionRecords.length} 条</span>
            </div>
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-slate-400 transition-transform shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[320px] bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">选择场次</div>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowCreateModal(true);
              }}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Plus size={14} />
              新建场次
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin py-1">
            {sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const recordCount = getSessionRecordCount(session.id);
              return (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-slate-50",
                    isActive && "bg-primary-50/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      isActive
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium truncate",
                          isActive ? "text-primary-700" : "text-slate-800"
                        )}
                      >
                        {session.name}
                      </span>
                      <span
                        className={cn(
                          "tag border shrink-0",
                          sessionTypeColors[session.type]
                        )}
                      >
                        {sessionTypeLabels[session.type]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{formatDateShort(session.startTime)}</span>
                      <span className="text-slate-300">·</span>
                      <span>{recordCount} 条记录</span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
            {sessions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                暂无场次，点击上方按钮新建
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl w-[420px] max-w-[92vw] shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">新建场次</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  场次名称
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="例如：上午第一组正式测试"
                  className="input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSession();
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  场次类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "formal", label: "正式", color: "sky" },
                      { value: "makeup", label: "补测", color: "amber" },
                      { value: "other", label: "其他", color: "slate" },
                    ] as const
                  ).map((type) => {
                    const isSelected = newSessionType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewSessionType(type.value)}
                        className={cn(
                          "py-2.5 rounded-xl text-sm font-medium border transition-all",
                          isSelected
                            ? type.color === "sky"
                              ? "bg-sky-50 border-sky-300 text-sky-700"
                              : type.color === "amber"
                              ? "bg-amber-50 border-amber-300 text-amber-700"
                              : "bg-slate-100 border-slate-300 text-slate-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/60">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                创建场次
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
