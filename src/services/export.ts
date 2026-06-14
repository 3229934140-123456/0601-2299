import * as XLSX from "xlsx";
import type { Student, TestRecord, TestProject, ClassInfo } from "@/types";
import { gradeLabel } from "@/utils";

export function exportClassReport(
  classInfo: ClassInfo,
  students: Student[],
  projects: TestProject[],
  records: TestRecord[]
) {
  const wb = XLSX.utils.book_new();

  const basicData = [
    ["学号", "姓名", "性别", "年龄", "身高(cm)", "体重(kg)", "班级"],
    ...students.map((s) => [
      s.studentNo,
      s.name,
      s.gender === "male" ? "男" : "女",
      s.age,
      s.height ?? "",
      s.weight ?? "",
      classInfo.name,
    ]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(basicData);
  XLSX.utils.book_append_sheet(wb, ws1, "学生名单");

  const header: string[] = ["学号", "姓名", "性别"];
  projects.forEach((p) => {
    header.push(`${p.name}(${p.unit})`);
    header.push(`${p.name}-得分`);
    header.push(`${p.name}-等级`);
  });
  header.push("总分", "总等级");

  const scoreData: (string | number)[][] = [header];
  students.forEach((s) => {
    const row: (string | number)[] = [s.studentNo, s.name, s.gender === "male" ? "男" : "女"];
    let totalPts = 0;
    let cnt = 0;
    projects.forEach((p) => {
      const rec = records.find((r) => r.studentId === s.id && r.projectId === p.id);
      if (rec && rec.score !== null) {
        row.push(rec.score);
        row.push(rec.points);
        row.push(gradeLabel(rec.grade));
        totalPts += rec.points;
        cnt++;
      } else {
        row.push(rec ? rec.status : "未测");
        row.push("");
        row.push("");
      }
    });
    const avg = cnt > 0 ? Math.round(totalPts / cnt) : 0;
    row.push(avg);
    let gl = "不及格";
    if (avg >= 90) gl = "优秀";
    else if (avg >= 80) gl = "良好";
    else if (avg >= 60) gl = "及格";
    row.push(gl);
    scoreData.push(row);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(scoreData);
  XLSX.utils.book_append_sheet(wb, ws2, "体测成绩");

  const fileName = `${classInfo.name}_体测成绩_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportCSV<T extends Record<string, any>>(data: T[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
