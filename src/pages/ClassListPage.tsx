import { useMemo, useState } from "react";
import { Search, ScanLine, Users, CheckSquare, CalendarDays, Filter, ChevronDown, XCircle, Clock, ShieldCheck, UserCheck } from "lucide-react";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/Avatar";
import { ScanModal } from "@/components/ScanModal";
import { attendanceLabel, attendanceTextColor, genderLabel } from "@/utils";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

const attendanceOptions: { value: AttendanceStatus | "all"; label: string; icon: any; color: string }[] = [
  { value: "all", label: "全部", icon: Users, color: "text-slate-600 bg-slate-100" },
  { value: "present", label: "已到", icon: UserCheck, color: "text-emerald-700 bg-emerald-50" },
  { value: "absent", label: "缺测", icon: XCircle, color: "text-rose-700 bg-rose-50" },
  { value: "delayed", label: "缓测", icon: Clock, color: "text-amber-700 bg-amber-50" },
  { value: "exempted", label: "免测", icon: ShieldCheck, color: "text-slate-700 bg-slate-100" },
];

const statusActions: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "present", label: "标记已到", color: "bg-emerald-500 hover:bg-emerald-600" },
  { value: "absent", label: "标记缺测", color: "bg-rose-500 hover:bg-rose-600" },
  { value: "delayed", label: "标记缓测", color: "bg-amber-500 hover:bg-amber-600" },
  { value: "exempted", label: "标记免测", color: "bg-slate-500 hover:bg-slate-600" },
];

export default function ClassListPage() {
  const {
    classes,
    currentClassId,
    setCurrentClass,
    searchKeyword,
    setSearchKeyword,
    attendanceFilter,
    setAttendanceFilter,
    getFilteredStudents,
    updateStudentStatus,
    batchUpdateStatus,
    selectedStudentIds,
    toggleStudentSelection,
    selectAll,
    clearSelection,
    setScanModalOpen,
  } = useAppStore();

  const students = useMemo(() => getFilteredStudents(), [getFilteredStudents]);
  const currentClass = classes.find((c) => c.id === currentClassId);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);

  const grades = Array.from(new Set(classes.map((c) => c.grade)));
  const currentGrade = currentClass?.grade;
  const gradeClasses = classes.filter((c) => c.grade === currentGrade);

  const presentCount = students.filter((s) => s.attendanceStatus === "present").length;
  const absentCount = students.filter((s) => s.attendanceStatus === "absent").length;
  const delayedCount = students.filter((s) => s.attendanceStatus === "delayed").length;
  const exemptedCount = students.filter((s) => s.attendanceStatus === "exempted").length;

  const allSelected = students.length > 0 && students.every((s) => selectedStudentIds.includes(s.id));

  const handleBatchStatus = (status: AttendanceStatus) => {
    if (selectedStudentIds.length === 0) return;
    batchUpdateStatus(selectedStudentIds, status);
    clearSelection();
  };

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGradeOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold transition"
              >
                <CalendarDays size={18} className="text-primary-500" />
                {currentGrade || "选择年级"}
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              {gradeOpen && (
                <div className="fixed z-40 mt-2 w-40 bg-white rounded-xl shadow-card-hover border border-slate-200 overflow-hidden animate-scale-in">
                  {grades.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        const cls = classes.find((c) => c.grade === g);
                        if (cls) setCurrentClass(cls.id);
                        setGradeOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition",
                        g === currentGrade ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setClassOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-700 font-semibold transition"
              >
                <Users size={18} />
                {currentClass?.name || "选择班级"}
                <ChevronDown size={16} className="opacity-60" />
              </button>
              {classOpen && (
                <div className="fixed z-40 mt-2 w-44 bg-white rounded-xl shadow-card-hover border border-slate-200 overflow-hidden animate-scale-in">
                  {gradeClasses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCurrentClass(c.id);
                        setClassOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition",
                        c.id === currentClassId ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{c.name}</span>
                        <span className="text-xs text-slate-400">{c.studentCount}人</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm text-slate-500">
              共 <span className="font-semibold text-slate-800">{currentClass?.studentCount || 0}</span> 人
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索姓名、学号、二维码..."
                className="input w-72 pl-10"
              />
            </div>
            <button
              onClick={() => setScanModalOpen(true)}
              className="btn-accent"
            >
              <ScanLine size={18} />
              扫码识别
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          {attendanceOptions.map((opt) => {
            const Icon = opt.icon;
            const active = attendanceFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setAttendanceFilter(opt.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-primary-500 text-white shadow-pop"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                )}
              >
                <Icon size={16} />
                {opt.label}
                <span className={cn("text-xs px-1.5 py-0.5 rounded-md", active ? "bg-white/20" : opt.color)}>
                  {opt.value === "all"
                    ? students.length
                    : opt.value === "present"
                    ? presentCount
                    : opt.value === "absent"
                    ? absentCount
                    : opt.value === "delayed"
                    ? delayedCount
                    : exemptedCount}
                </span>
              </button>
            );
          })}
        </div>

        {selectedStudentIds.length > 0 && (
          <div className="flex items-center gap-2 animate-slide-in">
            <div className="px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium">
              已选 {selectedStudentIds.length} 人
            </div>
            {statusActions.map((a) => (
              <button
                key={a.value}
                onClick={() => handleBatchStatus(a.value)}
                className={cn("px-3 py-1.5 rounded-xl text-white text-sm font-medium transition", a.color)}
              >
                {a.label}
              </button>
            ))}
            <button onClick={clearSelection} className="btn-ghost">
              取消
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
        <div className="card h-full overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => (allSelected ? clearSelection() : selectAll())}
                  className="w-5 h-5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-slate-700">全选</span>
              </label>
              <CheckSquare size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">点击学生行可切换签到状态</span>
            </div>
            <div className="text-xs text-slate-400">
              显示 {students.length} 条结果
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
              {students.map((s) => {
                const selected = selectedStudentIds.includes(s.id);
                const StatusBadge = attendanceOptions.find((o) => o.value === s.attendanceStatus);
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "group relative rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-card-hover",
                      selected
                        ? "border-primary-400 bg-primary-50/60 shadow-pop"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleStudentSelection(s.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-5 h-5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Avatar name={s.name} color={s.avatarColor} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                          <span className={cn("tag border", attendanceTextColor(s.attendanceStatus))}>
                            {attendanceLabel(s.attendanceStatus)}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {s.studentNo} · {genderLabel(s.gender)} · {s.age}岁
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span className="chip">{s.height ? s.height + "cm" : "未录身高"}</span>
                          <span className="chip">{s.weight ? s.weight + "kg" : "未录体重"}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {statusActions.slice(0, 4).map((a) => (
                        <button
                          key={a.value}
                          onClick={() => updateStudentStatus(s.id, a.value)}
                          className={cn(
                            "py-1.5 rounded-lg text-[11px] font-medium text-white transition",
                            s.attendanceStatus === a.value ? a.color : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          {a.label.replace("标记", "")}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {students.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                  <Users size={48} opacity={0.3} />
                  <div className="mt-2 text-sm">暂无符合条件的学生</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScanModal />
    </div>
  );
}
