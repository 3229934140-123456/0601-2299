import type { GradeLevel, Gender, TestProject } from "@/types";

export * from "@/utils/scoring";

export function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(2);
    return `${m}'${s.padStart(5, "0")}"`;
  }
  return seconds.toFixed(2) + '"';
}

export function formatTimerDisplay(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function gradeLabel(grade: GradeLevel | null): string {
  const map: Record<GradeLevel, string> = {
    excellent: "优秀",
    good: "良好",
    pass: "及格",
    fail: "不及格",
  };
  return grade ? map[grade] : "-";
}

export function gradeColor(grade: GradeLevel | null): string {
  const map: Record<GradeLevel, string> = {
    excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    good: "bg-sky-50 text-sky-700 border-sky-200",
    pass: "bg-amber-50 text-amber-700 border-amber-200",
    fail: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return grade ? map[grade] : "bg-slate-100 text-slate-500 border-slate-200";
}

export function genderLabel(g: Gender): string {
  return g === "male" ? "男" : "女";
}

export function attendanceLabel(s: string): string {
  const map: Record<string, string> = {
    present: "已到",
    absent: "缺测",
    delayed: "缓测",
    exempted: "免测",
  };
  return map[s] || s;
}

export function attendanceColor(s: string): string {
  const map: Record<string, string> = {
    present: "bg-emerald-500",
    absent: "bg-rose-500",
    delayed: "bg-amber-500",
    exempted: "bg-slate-400",
  };
  return map[s] || "bg-slate-300";
}

export function attendanceTextColor(s: string): string {
  const map: Record<string, string> = {
    present: "text-emerald-700 bg-emerald-50",
    absent: "text-rose-700 bg-rose-50",
    delayed: "text-amber-700 bg-amber-50",
    exempted: "text-slate-700 bg-slate-100",
  };
  return map[s] || "text-slate-600 bg-slate-100";
}

export function initials(name: string): string {
  if (!name) return "?";
  if (name.length <= 2) return name;
  return name.slice(0, 1);
}

export function toFixedIfNeeded(v: number, digits = 2): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(digits).replace(/\.?0+$/, "");
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
