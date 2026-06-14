import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import type { Student, TestRecord, TestProject, ClassInfo } from "@/types";
import { formatTime, genderLabel, gradeLabel, toFixedIfNeeded } from "@/utils";

export function exportClassReport(
  classInfo: ClassInfo,
  students: Student[],
  projects: TestProject[],
  records: TestRecord[],
  sessionId?: string | null
) {
  const wb = XLSX.utils.book_new();

  const filteredRecords = sessionId ? records.filter(r => r.sessionId === sessionId) : records;

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
      const rec = filteredRecords.find((r) => r.studentId === s.id && r.projectId === p.id);
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

  const fileName = `${classInfo.name}_${sessionId ? "场次_" + sessionId.slice(-4) + "_" : ""}体测成绩_${new Date().toISOString().slice(0, 10)}.xlsx`;
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

export function exportStudentReportExcel(
  student: Student,
  classInfo: ClassInfo,
  projects: TestProject[],
  records: TestRecord[]
) {
  const wb = XLSX.utils.book_new();

  const basicData = [
    ["学生体测成绩单"],
    [],
    ["学号", student.studentNo],
    ["姓名", student.name],
    ["性别", genderLabel(student.gender)],
    ["年龄", `${student.age}岁`],
    ["班级", classInfo.name],
    ["身高", student.height ? `${student.height} cm` : "-"],
    ["体重", student.weight ? `${student.weight} kg` : "-"],
    ["导出时间", new Date().toLocaleString("zh-CN")],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(basicData);
  XLSX.utils.book_append_sheet(wb, ws1, "基本信息");

  const scoreHeader = ["项目", "单位", "成绩", "得分", "等级", "状态", "测试时间"];
  const scoreData: (string | number)[][] = [scoreHeader];
  let totalPts = 0;
  let testedCount = 0;
  projects.forEach((p) => {
    const rec = records.find((r) => r.studentId === student.id && r.projectId === p.id);
    const row: (string | number)[] = [p.name, p.unit];
    if (rec && rec.score !== null) {
      const displayScore = p.type === "timing" ? formatTime(rec.score) : toFixedIfNeeded(rec.score);
      row.push(displayScore);
      row.push(rec.points);
      row.push(gradeLabel(rec.grade));
      totalPts += rec.points;
      testedCount++;
    } else {
      row.push(rec ? (rec.status === "absent" ? "缺测" : rec.status === "delayed" ? "缓测" : "-") : "-");
      row.push("-");
      row.push("-");
    }
    const statusLabel =
      rec?.status === "abnormal" ? "异常值" :
      rec?.status === "absent" ? "缺测" :
      rec?.status === "delayed" ? "缓测" : rec ? "正常" : "未测";
    row.push(statusLabel);
    row.push(rec ? rec.updatedAt.slice(0, 10) : "-");
    scoreData.push(row);
  });

  const avg = testedCount > 0 ? Math.round(totalPts / testedCount) : 0;
  let gl = "-";
  if (testedCount > 0) {
    if (avg >= 90) gl = "优秀";
    else if (avg >= 80) gl = "良好";
    else if (avg >= 60) gl = "及格";
    else gl = "不及格";
  }
  scoreData.push([]);
  scoreData.push(["统计", "", "", "", "", "", ""]);
  scoreData.push(["已测项目数", testedCount, "总分", totalPts, "", "", ""]);
  scoreData.push(["平均分", avg, "总评等级", gl, "", "", ""]);
  scoreData.push(["达标率", testedCount > 0 ? `${Math.round(records.filter(r => r.studentId === student.id && r.grade && r.grade !== "fail").length / testedCount * 100)}%` : "-", "", "", "", "", ""]);

  const ws2 = XLSX.utils.aoa_to_sheet(scoreData);
  XLSX.utils.book_append_sheet(wb, ws2, "详细成绩");

  const fileName = `${classInfo.name}_${student.name}_体测成绩单_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportStudentReportPDF(
  student: Student,
  classInfo: ClassInfo,
  projects: TestProject[],
  records: TestRecord[]
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginL = 15;
  let y = 20;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("学生体质健康测试成绩单", pageW / 2, y, { align: "center" });
  y += 12;

  doc.setDrawColor(30, 111, 255);
  doc.setLineWidth(0.8);
  doc.line(marginL, y, pageW - marginL, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const info: [string, string][] = [
    ["学号：", student.studentNo],
    ["姓名：", student.name],
    ["性别：", genderLabel(student.gender)],
    ["年龄：", `${student.age} 岁`],
    ["班级：", classInfo.name],
    ["身高：", student.height ? `${student.height} cm` : "-"],
    ["体重：", student.weight ? `${student.weight} kg` : "-"],
  ];
  info.forEach(([k, v], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = marginL + col * ((pageW - marginL * 2) / 3);
    const yy = y + row * 8;
    doc.setFont("helvetica", "bold");
    doc.text(k, x, yy);
    doc.setFont("helvetica", "normal");
    doc.text(v, x + 16, yy);
  });
  y += 8 * Math.ceil(info.length / 3) + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("项目成绩明细", marginL, y);
  y += 7;

  const colX = [marginL, marginL + 55, marginL + 75, marginL + 100, marginL + 125, marginL + 150];
  const headers = ["项目", "单位", "成绩", "得分", "等级", "状态"];
  doc.setFillColor(30, 111, 255);
  doc.setTextColor(255, 255, 255);
  doc.rect(marginL, y - 5, pageW - marginL * 2, 7, "F");
  headers.forEach((h, i) => {
    doc.text(h, colX[i], y);
  });
  doc.setTextColor(0, 0, 0);
  y += 8;

  let totalPts = 0;
  let testedCount = 0;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  projects.forEach((p) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    const rec = records.find((r) => r.studentId === student.id && r.projectId === p.id);
    let scoreStr = "-";
    let ptsStr = "-";
    let gradeStr = "-";
    let statusStr = "未测";
    if (rec) {
      if (rec.score !== null) {
        scoreStr = p.type === "timing" ? formatTime(rec.score) : String(toFixedIfNeeded(rec.score));
        ptsStr = String(rec.points);
        gradeStr = gradeLabel(rec.grade);
        totalPts += rec.points;
        testedCount++;
      }
      statusStr =
        rec.status === "abnormal" ? "异常值" :
        rec.status === "absent" ? "缺测" :
        rec.status === "delayed" ? "缓测" : "正常";
    }
    const row: [string, string, string, string, string, string] = [
      p.name, p.unit, scoreStr, ptsStr, gradeStr, statusStr
    ];
    row.forEach((v, i) => doc.text(v, colX[i], y));
    y += 6.5;
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("综合评定", marginL, y);
  y += 7;

  const avg = testedCount > 0 ? Math.round(totalPts / testedCount) : 0;
  let gl = "-";
  if (testedCount > 0) {
    if (avg >= 90) gl = "优秀";
    else if (avg >= 80) gl = "良好";
    else if (avg >= 60) gl = "及格";
    else gl = "不及格";
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`已测项目数：${testedCount} / ${projects.length}`, marginL, y);
  doc.text(`总分：${totalPts} 分`, marginL + 60, y);
  doc.text(`平均分：${avg} 分`, marginL + 110, y);
  y += 6;
  doc.text(`总评等级：${gl}`, marginL, y);
  doc.text(`导出时间：${new Date().toLocaleString("zh-CN")}`, marginL + 80, y);

  y += 15;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("本成绩单由智慧体育体测系统自动生成 · 仅供参考", pageW / 2, 285, { align: "center" });

  const fileName = `${classInfo.name}_${student.name}_体测成绩单_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
