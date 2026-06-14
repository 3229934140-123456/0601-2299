import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { Zap, Timer, MoveRight, Activity, GitPullRequestArrow, ArrowDownToLine, Wind, Scale, ChevronRight, Users, Settings, BarChart3, PlayCircle } from "lucide-react";
import { useAppStore } from "@/store";
import { Timer as TimerComp } from "@/components/Timer";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Zap,
  Timer,
  MoveRight,
  Activity,
  GitPullRequestArrow,
  ArrowDownToLine,
  Wind,
  Scale,
};

export default function ProjectTestPage() {
  const navigate = useNavigate();
  const {
    classes,
    currentClassId,
    projects,
    currentProjectId,
    setCurrentProject,
    getFilteredStudents,
    records,
    students,
  } = useAppStore();

  const currentClass = classes.find((c) => c.id === currentClassId);
  const classStudents = getFilteredStudents();
  const presentStudents = classStudents.filter((s) => s.attendanceStatus === "present");

  const projectStats = useMemo(() => {
    const classStudentIds = students.filter((s) => s.classId === currentClassId).map((s) => s.id);
    return projects.map((p) => {
      const tested = records.filter(
        (r) => r.projectId === p.id && classStudentIds.includes(r.studentId) && r.score !== null
      ).length;
      const total = p.gender === "both"
        ? presentStudents.length
        : presentStudents.filter((s) => s.gender === p.gender).length;
      const progress = total > 0 ? (tested / total) * 100 : 0;
      return { project: p, tested, total, progress };
    });
  }, [projects, records, presentStudents, students, currentClassId]);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const goEntry = () => {
    if (currentProjectId) navigate("/data-entry");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">项目测试</h1>
            <div className="mt-0.5 text-sm text-slate-500">
              {currentClass?.name} · 实到 {presentStudents.length} 人 / 应到 {currentClass?.studentCount} 人
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary">
              <Settings size={18} />
              项目配置
            </button>
            <button
              onClick={goEntry}
              disabled={!currentProjectId}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayCircle size={18} />
              开始录入
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-6 space-y-6">
        {currentProject && (
          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-3 space-y-4">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                      {(() => {
                        const Ic = iconMap[currentProject.icon] || Zap;
                        return <Ic size={24} />;
                      })()}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{currentProject.name}</div>
                      <div className="text-xs text-slate-500">{currentProject.description}</div>
                    </div>
                  </div>
                  <span className="chip">
                    <BarChart3 size={12} />
                    单位：{currentProject.unit}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  适用性别：{currentProject.gender === "both" ? "全体" : currentProject.gender === "male" ? "男生" : "女生"}
                  {" · "}合理范围 {currentProject.minValid} ~ {currentProject.maxValid} {currentProject.unit}
                </div>
              </div>
              <TimerComp />
            </div>

            <div className="col-span-2 card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-800">测试分组</div>
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  重新分组
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                {[1, 2, 3, 4].map((g) => {
                  const grp = presentStudents.filter((s) =>
                    currentProject.gender === "both" ? true : s.gender === currentProject.gender
                  ).slice((g - 1) * 6, g * 6);
                  if (grp.length === 0) return null;
                  return (
                    <div key={g} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-slate-700">第 {g} 组</div>
                        <div className="text-[11px] text-slate-400">{grp.length} 人</div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {grp.map((s) => (
                          <div
                            key={s.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: s.avatarColor }}
                            />
                            {s.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <Users size={12} />
                系统按学号自动分组，可手动拖拽调整
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">选择测试项目</h2>
            <div className="text-xs text-slate-500">共 {projects.length} 个项目</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {projectStats.map(({ project, tested, total, progress }) => {
              const Icon = iconMap[project.icon] || Zap;
              const active = currentProjectId === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => setCurrentProject(active ? null : project.id)}
                  className={cn(
                    "card p-4 text-left transition-all hover:shadow-card-hover",
                    active && "ring-2 ring-primary-500 shadow-pop"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition",
                        active
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <Icon size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900 truncate">{project.name}</div>
                        {project.gender !== "both" && (
                          <span className={cn(
                            "tag",
                            project.gender === "male" ? "bg-sky-50 text-sky-700" : "bg-pink-50 text-pink-700"
                          )}>
                            {project.gender === "male" ? "男生" : "女生"}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">{project.description}</div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">进度</span>
                          <span className="font-semibold text-slate-700">
                            {tested}/{total}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              progress >= 100
                                ? "bg-success"
                                : active
                                ? "bg-gradient-to-r from-primary-400 to-primary-600"
                                : "bg-primary-300"
                            )}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
