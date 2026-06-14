import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  Eye,
  FileText,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Camera,
  FileSpreadsheet,
  File,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/Avatar";
import { GradeBadge } from "@/components/GradeBadge";
import { SessionSelector } from "@/components/SessionSelector";
import { StudentDetailModal } from "@/components/StudentDetailModal";
import {
  attendanceLabel,
  attendanceTextColor,
  formatDate,
  formatTime,
  genderLabel,
  gradeLabel,
  toFixedIfNeeded,
} from "@/utils";
import { cn } from "@/lib/utils";
import type { RecordStatus } from "@/types";
import { exportClassReport, exportStudentReportExcel, exportStudentReportPDF } from "@/services/export";

type FilterKey = "all" | "abnormal" | "absent" | "delayed" | "fail" | "unreviewed";

const filterOptions: { value: FilterKey; label: string; icon: any; color: string }[] = [
  { value: "all", label: "全部记录", icon: FileText, color: "bg-slate-500" },
  { value: "abnormal", label: "异常值", icon: AlertTriangle, color: "bg-danger" },
  { value: "unreviewed", label: "待复核", icon: Clock, color: "bg-amber-500" },
  { value: "absent", label: "缺测", icon: XCircle, color: "bg-rose-500" },
  { value: "delayed", label: "缓测", icon: Clock, color: "bg-orange-500" },
  { value: "fail", label: "不及格", icon: XCircle, color: "bg-rose-400" },
];

export default function ReviewPage() {
  const {
    classes,
    currentClassId,
    setCurrentClass,
    projects,
    currentProjectId,
    setCurrentProject,
    students,
    records,
    logs,
    selectedStudentIds,
    toggleStudentSelection,
    clearSelection,
    selectAll,
    batchReview,
    updateRecord,
    recalcGrade,
    currentTeacher,
    currentSessionId,
  } = useAppStore();

  const [filter, setFilter] = useState<FilterKey>("unreviewed");
  const [search, setSearch] = useState("");
  const [expandRec, setExpandRec] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<{ id: string; value: string } | null>(null);
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === currentClassId),
    [students, currentClassId]
  );

  const studentMap = useMemo(() => {
    const m: Record<string, typeof students[number]> = {};
    students.forEach((s) => (m[s.id] = s));
    return m;
  }, [students]);

  const projectMap = useMemo(() => {
    const m: Record<string, typeof projects[number]> = {};
    projects.forEach((p) => (m[p.id] = p));
    return m;
  }, [projects]);

  const classRecords = useMemo(() => {
    const ids = new Set(classStudents.map((s) => s.id));
    let list = records.filter((r) => ids.has(r.studentId));
    if (currentSessionId) list = list.filter((r) => r.sessionId === currentSessionId);
    if (currentProjectId) list = list.filter((r) => r.projectId === currentProjectId);
    if (filter === "abnormal") list = list.filter((r) => r.status === "abnormal");
    else if (filter === "absent") list = list.filter((r) => r.status === "absent");
    else if (filter === "delayed") list = list.filter((r) => r.status === "delayed");
    else if (filter === "fail") list = list.filter((r) => r.grade === "fail");
    else if (filter === "unreviewed") list = list.filter((r) => !r.reviewed);
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter((r) => {
        const s = studentMap[r.studentId];
        if (!s) return false;
        return (
          s.name.toLowerCase().includes(kw) ||
          s.studentNo.toLowerCase().includes(kw)
        );
      });
    }
    return list.sort((a, b) => {
      if (a.reviewed !== b.reviewed) return a.reviewed ? 1 : -1;
      if (a.status !== b.status) return a.status === "abnormal" ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [records, classStudents, currentSessionId, currentProjectId, filter, search, studentMap]);

  const logsForRecord = (rid: string) =>
    logs.filter((l) => l.recordId === rid).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const allSelected =
    classRecords.length > 0 &&
    classRecords.filter((r) => !r.reviewed).every((r) => selectedStudentIds.includes(r.studentId));

  const handleSelectAll = () => {
    if (allSelected) clearSelection();
    else {
      classRecords.filter((r) => !r.reviewed).forEach((r) => {
        if (!selectedStudentIds.includes(r.studentId)) toggleStudentSelection(r.studentId);
      });
    }
  };

  const handleBatchReview = () => {
    const ids = classRecords
      .filter((r) => selectedStudentIds.includes(r.studentId) && !r.reviewed)
      .map((r) => r.id);
    if (ids.length > 0) batchReview(ids);
    clearSelection();
  };

  const handleBatchStatus = (status: RecordStatus) => {
    classRecords
      .filter((r) => selectedStudentIds.includes(r.studentId))
      .forEach((r) => updateRecord(r.id, { status }));
    clearSelection();
  };

  const saveEditedScore = (rid: string) => {
    if (!editingScore || editingScore.id !== rid) return;
    const v = parseFloat(editingScore.value);
    if (!Number.isNaN(v)) {
      updateRecord(rid, { score: v, status: "normal" });
      recalcGrade(rid);
    }
    setEditingScore(null);
  };

  const currentClass = classes.find((c) => c.id === currentClassId);
  const abnormalCount = classRecords.filter((r) => r.status === "abnormal").length;
  const unreviewedCount = classRecords.filter((r) => !r.reviewed).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">成绩复核</h1>
            <div className="mt-0.5 text-sm text-slate-500">
              {currentClass?.name} · 共 {classRecords.length} 条记录，
              <span className="text-amber-600 font-medium">待复核 {unreviewedCount}</span>
              {" · "}
              <span className="text-danger font-medium">异常值 {abnormalCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={currentClassId}
              onChange={(e) => setCurrentClass(e.target.value)}
              className="input !w-40"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <SessionSelector className="!w-64" />
            <select
              value={currentProjectId || ""}
              onChange={(e) => setCurrentProject(e.target.value || null)}
              className="input !w-44"
            >
              <option value="">全部项目</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              className="btn-secondary"
              onClick={() => {
                if (currentClass) {
                  exportClassReport(currentClass, classStudents, projects, records, currentSessionId);
                }
              }}
            >
              <Download size={16} />
              导出班级成绩单
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-3 flex items-center justify-between gap-3 flex-wrap bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          {filterOptions.map((o) => {
            const Icon = o.icon;
            const active = filter === o.value;
            return (
              <button
                key={o.value}
                onClick={() => setFilter(o.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition",
                  active ? "bg-primary-500 text-white shadow-pop" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon size={14} />
                {o.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索学生姓名/学号"
              className="input !w-56 pl-9 !py-2"
            />
          </div>
        </div>
      </div>

      {selectedStudentIds.length > 0 && (
        <div className="px-6 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between animate-slide-in">
          <div className="text-sm text-primary-700 font-medium">
            已选择 {selectedStudentIds.length} 条记录
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleBatchReview} className="btn-success !py-2">
              <CheckCircle2 size={16} />
              批量通过复核
            </button>
            <button onClick={() => handleBatchStatus("abnormal")} className="btn-secondary !py-2">
              <AlertTriangle size={16} />
              标记异常
            </button>
            <button onClick={() => handleBatchStatus("absent")} className="btn-ghost text-rose-600 !py-2">
              <XCircle size={16} />
              批量缺测
            </button>
            <button onClick={clearSelection} className="btn-ghost !py-2">
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
        <div className="card h-full flex flex-col overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin flex-1">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="text-slate-600">
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">学生</th>
                  <th className="px-4 py-3 text-left font-medium">项目</th>
                  <th className="px-4 py-3 text-left font-medium">
                    <span className="inline-flex items-center gap-1">
                      成绩
                      <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">得分/等级</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">凭证</th>
                  <th className="px-4 py-3 text-left font-medium">更新时间</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {classRecords.map((r, idx) => {
                  const s = studentMap[r.studentId];
                  const p = projectMap[r.projectId];
                  if (!s || !p) return null;
                  const expanded = expandRec === r.id;
                  const isEditing = editingScore?.id === r.id;
                  const recLogs = logsForRecord(r.id);
                  const selected = selectedStudentIds.includes(r.studentId);
                  return (
                    <>
                      <tr
                        key={r.id}
                        className={cn(
                          "border-t border-slate-100 transition",
                          idx % 2 && "bg-slate-50/40",
                          r.status === "abnormal" && "bg-rose-50/50",
                          selected && "bg-primary-50"
                        )}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleStudentSelection(r.studentId)}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={s.name} color={s.avatarColor} size="sm" />
                            <div>
                              <div className="font-medium text-slate-900">{s.name}</div>
                              <div className="text-xs text-slate-500">
                                {s.studentNo} · {genderLabel(s.gender)}
                              </div>
                            </div>
                            {r.reviewed && (
                              <span className="tag bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1">
                                <CheckCircle2 size={10} />
                                已复核
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{p.name}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                autoFocus
                                value={editingScore.value}
                                onChange={(e) =>
                                  setEditingScore({ id: r.id, value: e.target.value })
                                }
                                onKeyDown={(e) => e.key === "Enter" && saveEditedScore(r.id)}
                                onBlur={() => saveEditedScore(r.id)}
                                className="input !py-1 !px-2 !w-28 font-mono"
                              />
                              <span className="text-xs text-slate-500">{p.unit}</span>
                            </div>
                          ) : r.score !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                                {p.type === "timing" ? formatTime(r.score) : toFixedIfNeeded(r.score)}
                              </span>
                              <span className="text-xs text-slate-400">{p.unit}</span>
                            </div>
                          ) : (
                            <span className={cn("tag border", attendanceTextColor(r.status))}>
                              {attendanceLabel(r.status)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.score !== null ? (
                            <GradeBadge grade={r.grade} points={r.points} size="sm" />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.status === "abnormal" ? (
                            <span className="tag bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle size={10} />
                              异常值
                            </span>
                          ) : r.status === "absent" ? (
                            <span className="tag bg-rose-50 text-rose-600 border border-rose-200">缺测</span>
                          ) : r.status === "delayed" ? (
                            <span className="tag bg-amber-50 text-amber-700 border border-amber-200">缓测</span>
                          ) : (
                            <span className="tag bg-emerald-50 text-emerald-700 border border-emerald-200">正常</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.photos.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {r.photos.slice(0, 2).map((ph, i) => (
                                <img
                                  key={i}
                                  src={ph}
                                  alt=""
                                  className="w-8 h-8 rounded border border-slate-200 object-cover"
                                />
                              ))}
                              {r.photos.length > 2 && (
                                <span className="text-xs text-slate-500">+{r.photos.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">无</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDate(r.updatedAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setDetailStudentId(r.studentId)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                              title="查看详情"
                            >
                              <Eye size={16} />
                            </button>
                            {!r.reviewed && (
                              <button
                                onClick={() => batchReview([r.id])}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                title="通过复核"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setEditingScore(
                                  isEditing ? null : { id: r.id, value: r.score !== null ? String(r.score) : "" }
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                              title="编辑成绩"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (currentClass) {
                                  exportStudentReportExcel(s, currentClass, projects, records);
                                }
                              }}
                              className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition"
                              title="导出个人成绩单（Excel）"
                            >
                              <FileSpreadsheet size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (currentClass) {
                                  exportStudentReportPDF(s, currentClass, projects, records);
                                }
                              }}
                              className="p-1.5 rounded-lg text-accent-600 hover:bg-accent-50 transition"
                              title="导出个人成绩单（PDF）"
                            >
                              <File size={16} />
                            </button>
                            <button
                              onClick={() => setExpandRec(expanded ? null : r.id)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                              title="查看历史"
                            >
                              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={r.id + "-exp"} className="bg-slate-50/70">
                          <td colSpan={9} className="px-10 py-3">
                            <div className="flex gap-8">
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-slate-700 mb-2">修改留痕</div>
                                <div className="space-y-2">
                                  {recLogs.length === 0 ? (
                                    <div className="text-xs text-slate-400">暂无修改记录</div>
                                  ) : (
                                    recLogs.map((l) => (
                                      <div
                                        key={l.id}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200 text-xs"
                                      >
                                        <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 font-medium">
                                          {l.action === "create" ? "创建" : l.action === "update" ? "修改" : "复核"}
                                        </span>
                                        <span className="text-slate-700">
                                          {l.teacherName}
                                        </span>
                                        <span className="text-slate-500">
                                          {l.oldScore !== null ? `${l.oldScore}` : "无"} → {l.newScore !== null ? `${l.newScore}` : "无"}
                                        </span>
                                        <span className="ml-auto text-slate-400">{formatDate(l.createdAt)}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                              {r.photos.length > 0 && (
                                <div className="w-80">
                                  <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Camera size={12} />
                                    现场照片（{r.photos.length}）
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {r.photos.map((ph, i) => (
                                      <img
                                        key={i}
                                        src={ph}
                                        alt=""
                                        className="w-full aspect-video rounded-lg object-cover border border-slate-200"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {classRecords.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <Eye size={40} className="mx-auto mb-2 opacity-30" />
                      <div className="text-sm">暂无符合条件的记录</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <StudentDetailModal
        open={detailStudentId !== null}
        studentId={detailStudentId}
        onClose={() => setDetailStudentId(null)}
      />
    </div>
  );
}
