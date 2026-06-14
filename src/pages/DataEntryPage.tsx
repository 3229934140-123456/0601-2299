import { useMemo, useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Plus,
  Minus,
  Save,
  SkipForward,
  UserCheck,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/Avatar";
import { GradeBadge } from "@/components/GradeBadge";
import { Timer as TimerComp } from "@/components/Timer";
import { CameraModal } from "@/components/CameraModal";
import { ScanModal } from "@/components/ScanModal";
import {
  attendanceLabel,
  attendanceTextColor,
  calculateScore,
  formatTime,
  genderLabel,
} from "@/utils";
import { cn } from "@/lib/utils";
import type { RecordStatus } from "@/types";

export default function DataEntryPage() {
  const {
    classes,
    currentClassId,
    projects,
    currentProjectId,
    setCurrentProject,
    getFilteredStudents,
    getStudentRecordForProject,
    addOrUpdateRecord,
    currentEntryStudentIndex,
    setCurrentEntryStudentIndex,
    setCameraModalOpen,
    setScanModalOpen,
  } = useAppStore();

  const students = useMemo(() => getFilteredStudents(), [getFilteredStudents]);
  const currentClass = classes.find((c) => c.id === currentClassId);
  const currentProject = projects.find((p) => p.id === currentProjectId);

  const presentStudents = useMemo(
    () => students.filter((s) => s.attendanceStatus === "present"),
    [students]
  );

  const applicableStudents = useMemo(() => {
    if (!currentProject) return presentStudents;
    if (currentProject.gender === "both") return presentStudents;
    return presentStudents.filter((s) => s.gender === currentProject.gender);
  }, [presentStudents, currentProject]);

  const clampedIndex = Math.min(currentEntryStudentIndex, Math.max(0, applicableStudents.length - 1));
  const currentStudent = applicableStudents[clampedIndex];
  const existingRecord = currentStudent && currentProject
    ? getStudentRecordForProject(currentStudent.id, currentProject.id)
    : undefined;

  const [inputValue, setInputValue] = useState<string>("");
  const [savedPulse, setSavedPulse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingRecord && existingRecord.score !== null) {
      setInputValue(String(existingRecord.score));
    } else {
      setInputValue("");
    }
  }, [currentStudent?.id, currentProjectId, existingRecord?.score]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [clampedIndex, currentProjectId]);

  const computed = useMemo(() => {
    if (!currentStudent || !currentProject || !inputValue) return null;
    const v = parseFloat(inputValue);
    if (Number.isNaN(v)) return null;
    return calculateScore(currentProject.id, currentStudent.gender, currentStudent.age, v);
  }, [inputValue, currentStudent, currentProject]);

  const showWarning = computed?.isAbnormal;

  const goPrev = () => {
    if (clampedIndex > 0) setCurrentEntryStudentIndex(clampedIndex - 1);
  };
  const goNext = () => {
    if (clampedIndex < applicableStudents.length - 1) setCurrentEntryStudentIndex(clampedIndex + 1);
  };

  const handleSave = (confirmAbnormal = false) => {
    if (!currentStudent || !currentProject) return;
    const v = parseFloat(inputValue);
    if (Number.isNaN(v)) return;
    if (!confirmAbnormal && computed?.isAbnormal) return;
    const status: RecordStatus = computed?.isAbnormal ? "abnormal" : "normal";
    addOrUpdateRecord(currentStudent.id, currentProject.id, v, status);
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 400);
  };

  const handleMark = (status: RecordStatus) => {
    if (!currentStudent || !currentProject) return;
    addOrUpdateRecord(currentStudent.id, currentProject.id, null, status);
    goNext();
  };

  const handleStep = (delta: number) => {
    const cur = parseFloat(inputValue) || 0;
    const step = currentProject?.type === "timing" ? 0.01 : currentProject?.type === "measuring" ? 0.1 : 1;
    const next = Math.max(0, +(cur + delta * step).toFixed(3));
    setInputValue(String(next));
  };

  const handleTimerStop = (ms: number) => {
    const seconds = +(ms / 1000).toFixed(2);
    setInputValue(String(seconds));
  };

  const handleOpenCamera = () => {
    if (currentStudent) setCameraModalOpen(true, currentStudent.id);
  };

  const photos = existingRecord?.photos || [];
  const recordedCount = applicableStudents.filter(
    (s) => !!getStudentRecordForProject(s.id, currentProjectId || "") && getStudentRecordForProject(s.id, currentProjectId || "")?.score !== null
  ).length;
  const progress = applicableStudents.length > 0 ? (recordedCount / applicableStudents.length) * 100 : 0;

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <Zap size={64} className="text-slate-300" />
        <div className="mt-4 text-lg font-semibold text-slate-700">请先选择测试项目</div>
        <div className="mt-1 text-sm text-slate-500">前往「项目测试」页面选择要录入的项目</div>
        <button
          onClick={() => setCurrentProject(projects[0].id)}
          className="mt-6 btn-primary"
        >
          快速选择：{projects[0].name}
        </button>
      </div>
    );
  }

  if (applicableStudents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <UserCheck size={64} className="text-slate-300" />
        <div className="mt-4 text-lg font-semibold text-slate-700">暂无可用学生</div>
        <div className="mt-1 text-sm text-slate-500">
          当前班级没有符合「{currentProject.name}」性别条件且已签到的学生
        </div>
      </div>
    );
  }

  const numpad = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    ["0", ".", "⌫"],
  ];

  const pressKey = (k: string) => {
    if (k === "⌫") {
      setInputValue((v) => v.slice(0, -1));
    } else {
      setInputValue((v) => v + k);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">现场录入</h1>
              <span className="tag bg-primary-50 text-primary-700 border border-primary-200">
                {currentProject.name}
              </span>
            </div>
            <div className="mt-0.5 text-sm text-slate-500">
              {currentClass?.name} · 已录入 {recordedCount}/{applicableStudents.length}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={currentProjectId || ""}
              onChange={(e) => setCurrentProject(e.target.value)}
              className="input !w-48"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button onClick={() => setScanModalOpen(true)} className="btn-secondary">
              扫码定位
            </button>
          </div>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-success rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        <div className="col-span-3 card overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">学生队列</div>
            <div className="text-xs text-slate-500">{applicableStudents.length} 人</div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
            {applicableStudents.map((s, i) => {
              const active = i === clampedIndex;
              const rec = getStudentRecordForProject(s.id, currentProjectId!);
              const done = rec && rec.score !== null;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentEntryStudentIndex(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all",
                    active
                      ? "bg-primary-50 border-l-4 border-primary-500"
                      : "hover:bg-slate-50 border-l-4 border-transparent"
                  )}
                >
                  <div className="relative">
                    <Avatar name={s.name} color={s.avatarColor} size="sm" />
                    {done && (
                      <div className="absolute -right-0.5 -bottom-0.5 w-4 h-4 rounded-full bg-success text-white flex items-center justify-center border-2 border-white">
                        <CheckCircle2 size={10} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-sm font-medium truncate", active ? "text-primary-700" : "text-slate-800")}>
                        {s.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{genderLabel(s.gender)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{s.studentNo}</div>
                  </div>
                  {done && rec?.score !== null && (
                    <span className="font-mono text-sm font-semibold text-slate-700 tabular-nums">
                      {currentProject.type === "timing" ? formatTime(rec.score) : rec.score}
                    </span>
                  )}
                  {!done && rec && rec.status !== "normal" && (
                    <span className={cn("text-[11px] px-1.5 py-0.5 rounded", attendanceTextColor(rec.status))}>
                      {attendanceLabel(rec.status)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-6 flex flex-col gap-4">
          <div className={cn("card p-6 flex-1 flex flex-col", savedPulse && "animate-bounce-soft")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={currentStudent.name} color={currentStudent.avatarColor} size="xl" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{currentStudent.name}</div>
                  <div className="text-sm text-slate-500">
                    学号 {currentStudent.studentNo} · {genderLabel(currentStudent.gender)} · {currentStudent.age}岁
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn("tag border", attendanceTextColor(currentStudent.attendanceStatus))}>
                      {attendanceLabel(currentStudent.attendanceStatus)}
                    </span>
                    <span className="text-xs text-slate-500">
                      第 {clampedIndex + 1} / {applicableStudents.length} 位
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={clampedIndex === 0}
                  className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition active:scale-95 disabled:opacity-40"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={goNext}
                  disabled={clampedIndex === applicableStudents.length - 1}
                  className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition active:scale-95 disabled:opacity-40"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex-1 flex flex-col items-center justify-center">
              <div className="text-sm text-slate-500 mb-2">
                {currentProject.name}成绩（{currentProject.unit}）
              </div>
              <div className="relative">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.]/g, ""))}
                  className={cn(
                    "font-mono font-bold text-center tabular-nums tracking-tighter bg-transparent border-none outline-none focus:ring-0 w-[420px]",
                    showWarning ? "text-danger" : "text-slate-900"
                  )}
                  style={{ fontSize: "96px", lineHeight: 1 }}
                  placeholder="0.00"
                />
                {showWarning && (
                  <div className="absolute -top-3 -right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 text-danger text-xs font-medium">
                    <AlertTriangle size={12} />
                    异常值
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm text-slate-400">合理范围 {currentProject.minValid} ~ {currentProject.maxValid} {currentProject.unit}</div>

              <div className="mt-6 flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleStep(1)}
                    className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition active:scale-95"
                  >
                    <Plus size={22} />
                  </button>
                  <button
                    onClick={() => handleStep(-1)}
                    className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition active:scale-95"
                  >
                    <Minus size={22} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {numpad.flat().map((k) => (
                    <button
                      key={k}
                      onClick={() => pressKey(k)}
                      className={cn(
                        "w-16 h-14 rounded-2xl font-mono text-2xl font-semibold transition active:scale-95",
                        k === "⌫"
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {computed && (
                <div className="mt-6 flex items-center gap-4 animate-fade-in">
                  <GradeBadge grade={computed.grade} points={computed.points} />
                  {showWarning ? (
                    <button onClick={() => handleSave(true)} className="btn-danger">
                      <AlertTriangle size={16} />
                      确认保存异常值
                    </button>
                  ) : (
                    <button onClick={() => handleSave()} className="btn-success">
                      <Save size={16} />
                      保存并下一位
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCamera}
                  className="btn-secondary"
                >
                  <Camera size={16} />
                  拍照留证
                  {photos.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-primary-500 text-white text-[10px]">
                      {photos.length}
                    </span>
                  )}
                </button>
                {photos.length > 0 && (
                  <div className="flex items-center gap-1">
                    {photos.slice(0, 4).map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleMark("absent")} className="btn-ghost text-rose-600 hover:bg-rose-50">
                  <XCircle size={16} />
                  缺测
                </button>
                <button onClick={() => handleMark("delayed")} className="btn-ghost text-amber-600 hover:bg-amber-50">
                  <Clock size={16} />
                  缓测
                </button>
                <button onClick={goNext} className="btn-secondary">
                  <SkipForward size={16} />
                  跳过
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4">
          <TimerComp compact onStop={handleTimerStop} />
          <div className="card p-4 flex-1 flex flex-col">
            <div className="text-sm font-semibold text-slate-700 mb-3">评分标准参考</div>
            <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin text-sm">
              {[
                { grade: "excellent", label: "优秀", range: "90 ~ 100 分", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                { grade: "good", label: "良好", range: "80 ~ 89 分", color: "text-sky-700 bg-sky-50 border-sky-200" },
                { grade: "pass", label: "及格", range: "60 ~ 79 分", color: "text-amber-700 bg-amber-50 border-amber-200" },
                { grade: "fail", label: "不及格", range: "< 60 分", color: "text-rose-700 bg-rose-50 border-rose-200" },
              ].map((g) => (
                <div key={g.grade} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className={cn("tag border font-medium", g.color)}>{g.label}</span>
                  <span className="text-slate-600">{g.range}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              系统依据《国家学生体质健康标准》自动计算，异常值高亮提醒
            </div>
          </div>
        </div>
      </div>

      <CameraModal />
      <ScanModal />
    </div>
  );
}
