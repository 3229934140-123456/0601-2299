import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  Award,
  Target,
  Download,
  FileSpreadsheet,
  Calendar,
  UserCheck,
  Clock,
  FileEdit,
  ChevronDown,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";
import { useAppStore } from "@/store";
import { exportClassReport } from "@/services/export";
import { Avatar } from "@/components/Avatar";
import { SessionSelector } from "@/components/SessionSelector";
import { cn } from "@/lib/utils";
import { gradeLabel, formatDateShort, formatTime, toFixedIfNeeded } from "@/utils";

const GRADE_COLORS = ["#10B981", "#0EA5E9", "#F59E0B", "#EF4444"];

export default function StatisticsPage() {
  const {
    classes,
    currentClassId,
    setCurrentClass,
    projects,
    students,
    records,
    logs,
    teachers,
    currentTeacher,
    currentSessionId,
  } = useAppStore();

  const currentClass = classes.find((c) => c.id === currentClassId);
  const classStudents = useMemo(
    () => students.filter((s) => s.classId === currentClassId),
    [students, currentClassId]
  );
  const classStudentIds = useMemo(() => new Set(classStudents.map((s) => s.id)), [classStudents]);
  const classRecords = useMemo(() => {
    let list = records.filter((r) => classStudentIds.has(r.studentId) && r.score !== null);
    if (currentSessionId) list = list.filter((r) => r.sessionId === currentSessionId);
    return list;
  }, [records, classStudentIds, currentSessionId]);

  const { stats, projectStats, gradeDistribution } = useMemo(() => {
    const studentAverages = new Map<string, number>();
    const perStudentProjects = new Map<string, { total: number; count: number }>();

    classRecords.forEach((r) => {
      const cur = perStudentProjects.get(r.studentId) || { total: 0, count: 0 };
      cur.total += r.points;
      cur.count += 1;
      perStudentProjects.set(r.studentId, cur);
    });

    perStudentProjects.forEach((v, k) => {
      if (v.count > 0) studentAverages.set(k, v.total / v.count);
    });

    let excellent = 0,
      good = 0,
      pass = 0,
      fail = 0;
    studentAverages.forEach((avg) => {
      if (avg >= 90) excellent++;
      else if (avg >= 80) good++;
      else if (avg >= 60) pass++;
      else fail++;
    });

    const testedStudents = studentAverages.size;
    const totalPass = testedStudents > 0 ? ((excellent + good + pass) / testedStudents) * 100 : 0;

    const projectStats = projects.map((p) => {
      const recs = classRecords.filter((r) => r.projectId === p.id);
      const scores = recs.map((r) => r.score!).filter((v) => v !== null && v !== undefined);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const passed = recs.filter((r) => r.grade && r.grade !== "fail").length;
      const excellentCnt = recs.filter((r) => r.grade === "excellent").length;
      const goodCnt = recs.filter((r) => r.grade === "good").length;
      const passCnt = recs.filter((r) => r.grade === "pass").length;
      const failCnt = recs.filter((r) => r.grade === "fail").length;
      return {
        projectId: p.id,
        projectName: p.name,
        unit: p.unit,
        type: p.type,
        testedCount: recs.length,
        avgScore,
        maxScore: scores.length > 0 ? Math.max(...scores) : 0,
        minScore: scores.length > 0 ? Math.min(...scores) : 0,
        passRate: recs.length > 0 ? (passed / recs.length) * 100 : 0,
        excellentCount: excellentCnt,
        goodCount: goodCnt,
        passCount: passCnt,
        failCount: failCnt,
      };
    });

    const avgPoints =
      testedStudents > 0
        ? Array.from(studentAverages.values()).reduce((a, b) => a + b, 0) / testedStudents
        : 0;

    return {
      stats: {
        totalStudents: classStudents.length,
        testedStudents,
        passRate: totalPass,
        excellentRate: testedStudents > 0 ? (excellent / testedStudents) * 100 : 0,
        goodRate: testedStudents > 0 ? (good / testedStudents) * 100 : 0,
        failRate: testedStudents > 0 ? (fail / testedStudents) * 100 : 0,
        avgPoints,
      },
      projectStats,
      gradeDistribution: [
        { name: "优秀", value: excellent, color: "#10B981" },
        { name: "良好", value: good, color: "#0EA5E9" },
        { name: "及格", value: pass, color: "#F59E0B" },
        { name: "不及格", value: fail, color: "#EF4444" },
      ],
    };
  }, [classStudents, classRecords, projects]);

  const radarData = useMemo(() => {
    const displayProjects = projectStats.filter((p) => p.testedCount > 0).slice(0, 8);
    return displayProjects.map((p) => ({
      subject: p.projectName.replace(/（.+）/, ""),
      达标率: Math.round(p.passRate),
      满分: 100,
    }));
  }, [projectStats]);

  const barData = useMemo(
    () =>
      projectStats.map((p) => ({
        name: p.projectName.replace(/（.+）/, ""),
        优秀: p.excellentCount,
        良好: p.goodCount,
        及格: p.passCount,
        不及格: p.failCount,
      })),
    [projectStats]
  );

  const teacherSummaries = useMemo(() => {
    return teachers.map((t) => {
      const tLogs = logs.filter((l) => l.teacherId === t.id);
      const creates = tLogs.filter((l) => l.action === "create").length;
      const updates = tLogs.filter((l) => l.action === "update").length;
      const reviews = tLogs.filter((l) => l.action === "review").length;
      const last = tLogs[0]?.createdAt;
      return {
        teacher: t,
        recordCount: creates,
        updateCount: updates,
        reviewCount: reviews,
        lastActiveTime: last,
      };
    });
  }, [teachers, logs]);

  const handleExport = () => {
    if (!currentClass) return;
    exportClassReport(currentClass, classStudents, projects, records.filter((r) => classStudentIds.has(r.studentId)));
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    suffix,
    hint,
    color,
  }: {
    icon: any;
    label: string;
    value: string | number;
    suffix?: string;
    hint?: string;
    color: string;
  }) => (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", color)}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{value}</span>
          {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
        </div>
        {hint && <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">统计分析</h1>
            <div className="mt-0.5 text-sm text-slate-500">
              {currentClass?.name} · 体测数据综合分析
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
            <button onClick={handleExport} className="btn-primary">
              <FileSpreadsheet size={16} />
              导出上报文件
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-6 space-y-6">
        <div className="grid grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            label="班级总人数"
            value={stats.totalStudents}
            suffix="人"
            hint={`已测试 ${stats.testedStudents} 人`}
            color="bg-primary-50 text-primary-600"
          />
          <StatCard
            icon={Target}
            label="总分达标率"
            value={stats.passRate.toFixed(1)}
            suffix="%"
            hint={`平均 ${stats.avgPoints.toFixed(1)} 分`}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Award}
            label="优秀率"
            value={stats.excellentRate.toFixed(1)}
            suffix="%"
            hint={`${gradeDistribution[0].value} 人达优秀`}
            color="bg-sky-50 text-sky-600"
          />
          <StatCard
            icon={TrendingUp}
            label="良好率"
            value={stats.goodRate.toFixed(1)}
            suffix="%"
            hint={`${gradeDistribution[1].value} 人达良好`}
            color="bg-violet-50 text-violet-600"
          />
          <StatCard
            icon={FileEdit}
            label="不及格率"
            value={stats.failRate.toFixed(1)}
            suffix="%"
            hint={`${gradeDistribution[3].value} 人不及格`}
            color="bg-rose-50 text-rose-600"
          />
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary-500" />
                <h3 className="font-semibold text-slate-800">各项目等级分布</h3>
              </div>
              <span className="text-xs text-slate-400">按人数统计</span>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                      fontSize: 12,
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="优秀" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="良好" stackId="a" fill="#0EA5E9" />
                  <Bar dataKey="及格" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="不及格" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-2 card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PieIcon size={18} className="text-accent-500" />
                <h3 className="font-semibold text-slate-800">总分等级分布</h3>
              </div>
            </div>
            <div className="flex-1 flex items-center">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {gradeDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      iconSize={10}
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs text-slate-500 pt-2">
              {gradeDistribution.map((g) => (
                <div key={g.name} className="flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  {g.name} {g.value}人
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-violet-500" />
                <h3 className="font-semibold text-slate-800">各项目达标率雷达图</h3>
              </div>
              <span className="text-xs text-slate-400">仅展示已有数据项目</span>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Radar
                    name="达标率(%)"
                    dataKey="达标率"
                    stroke="#1E6FFF"
                    fill="#1E6FFF"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-2 card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-emerald-500" />
                <h3 className="font-semibold text-slate-800">教师录入记录</h3>
              </div>
              <span className="text-xs text-slate-400">{logs.length} 条操作日志</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
              {teacherSummaries.map(({ teacher, recordCount, updateCount, reviewCount, lastActiveTime }) => (
                <div
                  key={teacher.id}
                  className={cn(
                    "p-3 rounded-xl border transition",
                    teacher.id === currentTeacher.id
                      ? "border-primary-200 bg-primary-50/40"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={teacher.name} color="#1E6FFF" size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{teacher.name}</span>
                        {teacher.id === currentTeacher.id && (
                          <span className="tag bg-primary-500 text-white">当前</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        工号 {teacher.employeeNo} · {teacher.subject}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 py-1.5">
                      <div className="text-sm font-bold text-slate-800 tabular-nums">{recordCount}</div>
                      <div className="text-[10px] text-slate-500">录入条数</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 py-1.5">
                      <div className="text-sm font-bold text-slate-800 tabular-nums">{updateCount}</div>
                      <div className="text-[10px] text-slate-500">修改次数</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 py-1.5">
                      <div className="text-sm font-bold text-slate-800 tabular-nums">{reviewCount}</div>
                      <div className="text-[10px] text-slate-500">复核条数</div>
                    </div>
                  </div>
                  {lastActiveTime && (
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} />
                      最近活动：{formatDateShort(lastActiveTime)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary-500" />
              <h3 className="font-semibold text-slate-800">各项目统计明细</h3>
            </div>
            <button onClick={handleExport} className="btn-secondary !py-1.5 !text-xs">
              <Download size={14} />
              导出此表
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">测试项目</th>
                  <th className="px-5 py-3 text-center font-medium">已测人数</th>
                  <th className="px-5 py-3 text-center font-medium">平均成绩</th>
                  <th className="px-5 py-3 text-center font-medium">最高成绩</th>
                  <th className="px-5 py-3 text-center font-medium">最低成绩</th>
                  <th className="px-5 py-3 text-center font-medium">达标率</th>
                  <th className="px-5 py-3 text-center font-medium">优秀/良好/及格/不及格</th>
                </tr>
              </thead>
              <tbody>
                {projectStats.map((p) => (
                  <tr key={p.projectId} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-800">{p.projectName}</td>
                    <td className="px-5 py-3 text-center text-slate-700 tabular-nums">
                      {p.testedCount}
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-slate-800 tabular-nums font-semibold">
                      {p.testedCount > 0
                        ? p.type === "timing"
                          ? formatTime(p.avgScore)
                          : toFixedIfNeeded(+p.avgScore.toFixed(2))
                        : "-"}
                      <span className="text-xs text-slate-400 ml-1">{p.unit}</span>
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-emerald-600 tabular-nums font-semibold">
                      {p.testedCount > 0
                        ? p.type === "timing"
                          ? formatTime(p.minScore)
                          : toFixedIfNeeded(p.maxScore)
                        : "-"}
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-rose-600 tabular-nums font-semibold">
                      {p.testedCount > 0
                        ? p.type === "timing"
                          ? formatTime(p.maxScore)
                          : toFixedIfNeeded(p.minScore)
                        : "-"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-success"
                            style={{ width: `${p.passRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-slate-700 tabular-nums text-xs w-10">
                          {p.passRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                          {p.excellentCount}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">
                          {p.goodCount}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">
                          {p.passCount}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                          {p.failCount}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
