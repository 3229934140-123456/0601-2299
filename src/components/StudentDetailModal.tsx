import { useMemo, useState } from "react";
import {
  X,
  FileSpreadsheet,
  File,
  User,
  Calendar,
  Ruler,
  Scale,
  Hash,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  History,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/Avatar";
import { GradeBadge } from "@/components/GradeBadge";
import {
  formatDate,
  formatTime,
  genderLabel,
  toFixedIfNeeded,
} from "@/utils";
import { cn } from "@/lib/utils";
import { exportStudentReportExcel, exportStudentReportPDF } from "@/services/export";
import type { TestRecord, ScoreLog } from "@/types";

interface StudentDetailModalProps {
  open: boolean;
  studentId: string | null;
  onClose: () => void;
}

export function StudentDetailModal({ open, studentId, onClose }: StudentDetailModalProps) {
  const { students, classes, projects, records, logs, sessions } = useAppStore();
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const student = useMemo(
    () => students.find((s) => s.id === studentId),
    [students, studentId]
  );

  const classInfo = useMemo(
    () => classes.find((c) => c.id === student?.classId),
    [classes, student]
  );

  const studentRecords = useMemo(() => {
    if (!studentId) return [];
    return records
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [records, studentId]);

  const allPhotos = useMemo(() => {
    return studentRecords.flatMap((r) => r.photos.map((p) => ({ photo: p, recordId: r.id })));
  }, [studentRecords]);

  const studentLogs = useMemo(() => {
    if (!studentId) return [];
    const recordIds = new Set(studentRecords.map((r) => r.id));
    return logs
      .filter((l) => recordIds.has(l.recordId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [logs, studentRecords, studentId]);

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || "-";
  };

  const getProjectUnit = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.unit || "";
  };

  const getProjectType = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.type || "measuring";
  };

  const getSessionName = (sessionId: string | null) => {
    if (!sessionId) return "-";
    return sessions.find((s) => s.id === sessionId)?.name || "-";
  };

  const formatScore = (record: TestRecord) => {
    if (record.score === null) return "-";
    const type = getProjectType(record.projectId);
    return type === "timing" ? formatTime(record.score) : toFixedIfNeeded(record.score);
  };

  const handleExportExcel = () => {
    if (student && classInfo) {
      exportStudentReportExcel(student, classInfo, projects, records);
    }
  };

  const handleExportPDF = () => {
    if (student && classInfo) {
      exportStudentReportPDF(student, classInfo, projects, records);
    }
  };

  const openPhotoViewer = (index: number) => {
    setCurrentPhotoIndex(index);
    setPhotoViewerOpen(true);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "abnormal":
        return (
          <span className="tag bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={10} />
            异常值
          </span>
        );
      case "absent":
        return (
          <span className="tag bg-rose-50 text-rose-600 border border-rose-200">缺测</span>
        );
      case "delayed":
        return (
          <span className="tag bg-amber-50 text-amber-700 border border-amber-200">缓测</span>
        );
      default:
        return (
          <span className="tag bg-emerald-50 text-emerald-700 border border-emerald-200">正常</span>
        );
    }
  };

  const getActionLabel = (action: ScoreLog["action"]) => {
    const map = {
      create: "创建",
      update: "修改",
      review: "复核",
    };
    return map[action];
  };

  const getActionColor = (action: ScoreLog["action"]) => {
    const map = {
      create: "bg-emerald-50 text-emerald-700",
      update: "bg-primary-50 text-primary-700",
      review: "bg-amber-50 text-amber-700",
    };
    return map[action];
  };

  if (!open || !student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden w-[900px] max-w-[92vw] max-h-[85vh] shadow-2xl animate-scale-in flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} color={student.avatarColor} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                <span className="tag bg-primary-50 text-primary-700 border border-primary-200">
                  {classInfo?.name}
                </span>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                学号 {student.studentNo} · {genderLabel(student.gender)} · {student.age}岁
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <User size={16} className="text-primary-500" />
                  基本信息
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Hash size={14} />
                      学号
                    </span>
                    <span className="text-slate-900 font-medium">{student.studentNo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User size={14} />
                      姓名
                    </span>
                    <span className="text-slate-900 font-medium">{student.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User size={14} />
                      性别
                    </span>
                    <span className="text-slate-900 font-medium">{genderLabel(student.gender)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar size={14} />
                      年龄
                    </span>
                    <span className="text-slate-900 font-medium">{student.age} 岁</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User size={14} />
                      班级
                    </span>
                    <span className="text-slate-900 font-medium">{classInfo?.name || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Ruler size={14} />
                      身高
                    </span>
                    <span className="text-slate-900 font-medium">
                      {student.height ? `${student.height} cm` : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Scale size={14} />
                      体重
                    </span>
                    <span className="text-slate-900 font-medium">
                      {student.weight ? `${student.weight} kg` : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Camera size={16} className="text-accent-500" />
                  现场照片
                  {allPhotos.length > 0 && (
                    <span className="text-xs text-slate-400 font-normal">
                      共 {allPhotos.length} 张
                    </span>
                  )}
                </div>
                {allPhotos.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {allPhotos.slice(0, 8).map((item, index) => (
                      <div
                        key={index}
                        onClick={() => openPhotoViewer(index)}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border border-slate-200"
                      >
                        <img
                          src={item.photo}
                          alt=""
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <ZoomIn size={20} className="text-white" />
                        </div>
                      </div>
                    ))}
                    {allPhotos.length > 8 && (
                      <div
                        onClick={() => openPhotoViewer(8)}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-slate-100 flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition"
                      >
                        <span className="text-slate-500 text-sm font-medium">
                          +{allPhotos.length - 8}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Camera size={32} opacity={0.3} />
                    <span className="text-xs mt-2">暂无现场照片</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-primary-500" />
                  历史成绩
                </div>
                <span className="text-xs text-slate-400">
                  共 {studentRecords.length} 条记录
                </span>
              </div>
              <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr className="text-slate-600">
                      <th className="px-4 py-2.5 text-left font-medium">项目</th>
                      <th className="px-4 py-2.5 text-left font-medium">成绩</th>
                      <th className="px-4 py-2.5 text-left font-medium">得分</th>
                      <th className="px-4 py-2.5 text-left font-medium">等级</th>
                      <th className="px-4 py-2.5 text-left font-medium">状态</th>
                      <th className="px-4 py-2.5 text-left font-medium">场次</th>
                      <th className="px-4 py-2.5 text-left font-medium">同步</th>
                      <th className="px-4 py-2.5 text-left font-medium">更新时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRecords.map((record, idx) => (
                      <tr
                        key={record.id}
                        className={cn(
                          "border-t border-slate-100 transition",
                          idx % 2 && "bg-slate-50/40",
                          record.status === "abnormal" && "bg-rose-50/50"
                        )}
                      >
                        <td className="px-4 py-3 text-slate-700">
                          {getProjectName(record.projectId)}
                        </td>
                        <td className="px-4 py-3">
                          {record.score !== null ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                                {formatScore(record)}
                              </span>
                              <span className="text-xs text-slate-400">
                                {getProjectUnit(record.projectId)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {record.score !== null ? (
                            <span className="text-slate-900 font-medium">{record.points} 分</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <GradeBadge grade={record.grade} size="sm" />
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {getSessionName(record.sessionId)}
                        </td>
                        <td className="px-4 py-3">
                          {record.syncStatus === "synced" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle2 size={12} />
                              已同步
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <Clock size={12} />
                              待同步
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDate(record.updatedAt)}
                        </td>
                      </tr>
                    ))}
                    {studentRecords.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <FileSpreadsheet size={32} className="mx-auto mb-2 opacity-30" />
                          <div className="text-sm">暂无成绩记录</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <History size={16} className="text-amber-500" />
                  复核留痕 / 修改记录
                </div>
                <span className="text-xs text-slate-400">
                  共 {studentLogs.length} 条记录
                </span>
              </div>
              <div className="p-4 max-h-[240px] overflow-y-auto scrollbar-thin">
                {studentLogs.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-3 top-1 bottom-1 w-px bg-slate-200" />
                    <div className="space-y-3">
                      {studentLogs.map((log) => (
                        <div key={log.id} className="relative pl-8">
                          <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary-400" />
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded text-xs font-medium",
                                    getActionColor(log.action)
                                  )}
                                >
                                  {getActionLabel(log.action)}
                                </span>
                                <span className="text-sm text-slate-900 font-medium">
                                  {log.teacherName}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {getProjectName(
                                    studentRecords.find((r) => r.id === log.recordId)?.projectId || ""
                                  )}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">
                                {formatDate(log.createdAt)}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600">
                              <span className="text-slate-400">成绩变更：</span>
                              <span>
                                {log.oldScore !== null ? log.oldScore : "无"} →{" "}
                                {log.newScore !== null ? log.newScore : "无"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <History size={32} opacity={0.3} />
                    <span className="text-xs mt-2">暂无修改记录</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="btn-secondary">
            关闭
          </button>
          <button onClick={handleExportExcel} className="btn-primary">
            <FileSpreadsheet size={18} />
            导出 Excel 成绩单
          </button>
          <button onClick={handleExportPDF} className="btn-accent">
            <File size={18} />
            导出 PDF 成绩单
          </button>
        </div>
      </div>

      {photoViewerOpen && allPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setPhotoViewerOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPhotoViewerOpen(false);
            }}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
          >
            <X size={24} />
          </button>

          {allPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          <div className="max-w-[85vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={allPhotos[currentPhotoIndex].photo}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {allPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {allPhotos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {allPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex(index);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentPhotoIndex
                      ? "bg-white w-6"
                      : "bg-white/40 hover:bg-white/60"
                  )}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-6 right-6 text-white/60 text-sm">
            {currentPhotoIndex + 1} / {allPhotos.length}
          </div>
        </div>
      )}
    </div>
  );
}
