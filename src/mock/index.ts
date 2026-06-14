import type { Teacher, ClassInfo, Student, TestProject, StandardItem, TestRecord, ScoreLog } from "@/types";

export const mockTeachers: Teacher[] = [
  { id: "t1", name: "张建国", employeeNo: "T2021001", subject: "体育" },
  { id: "t2", name: "李美丽", employeeNo: "T2021002", subject: "体育" },
  { id: "t3", name: "王强", employeeNo: "T2021003", subject: "体育" },
];

export const mockClasses: ClassInfo[] = [
  { id: "c1", name: "高一(1)班", grade: "高一年级", studentCount: 45, teacherId: "t1" },
  { id: "c2", name: "高一(2)班", grade: "高一年级", studentCount: 42, teacherId: "t1" },
  { id: "c3", name: "高一(3)班", grade: "高一年级", studentCount: 44, teacherId: "t2" },
  { id: "c4", name: "高二(1)班", grade: "高二年级", studentCount: 46, teacherId: "t2" },
  { id: "c5", name: "高二(2)班", grade: "高二年级", studentCount: 43, teacherId: "t3" },
];

const avatarColors = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

const firstNames = [
  "伟",
  "芳",
  "娜",
  "敏",
  "静",
  "丽",
  "强",
  "磊",
  "军",
  "洋",
  "勇",
  "艳",
  "杰",
  "娟",
  "涛",
  "明",
  "超",
  "秀英",
  "霞",
  "平",
  "刚",
  "桂英",
];
const surnames = [
  "王",
  "李",
  "张",
  "刘",
  "陈",
  "杨",
  "赵",
  "黄",
  "周",
  "吴",
  "徐",
  "孙",
  "胡",
  "朱",
  "高",
  "林",
  "何",
  "郭",
  "马",
  "罗",
];

function generateStudents(classId: string, count: number, startIndex: number): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    const surname = surnames[idx % surnames.length];
    const firstName = firstNames[(idx * 3) % firstNames.length];
    const gender: "male" | "female" = idx % 3 === 0 ? "female" : "male";
    students.push({
      id: `s_${classId}_${i + 1}`,
      name: surname + firstName,
      studentNo: `2024${String(classId.replace("c", "")).padStart(2, "0")}${String(i + 1).padStart(2, "0")}`,
      gender,
      age: 16 + (idx % 2),
      height: gender === "male" ? 170 + (idx % 15) : 158 + (idx % 12),
      weight: gender === "male" ? 60 + (idx % 20) : 48 + (idx % 15),
      classId,
      qrCode: `QR${classId.toUpperCase()}${String(i + 1).padStart(4, "0")}`,
      attendanceStatus: i < count - 5 ? "present" : i < count - 2 ? "delayed" : i < count - 1 ? "absent" : "exempted",
      avatarColor: avatarColors[idx % avatarColors.length],
    });
  }
  return students;
}

export const mockStudents: Student[] = [
  ...generateStudents("c1", 45, 0),
  ...generateStudents("c2", 42, 50),
  ...generateStudents("c3", 44, 100),
  ...generateStudents("c4", 46, 150),
  ...generateStudents("c5", 43, 200),
];

export const mockProjects: TestProject[] = [
  {
    id: "p_50m",
    name: "50米跑",
    unit: "秒",
    type: "timing",
    icon: "Zap",
    gender: "both",
    description: "短距离爆发力测试",
    minValid: 5,
    maxValid: 20,
  },
  {
    id: "p_1000m",
    name: "1000米跑（男）",
    unit: "秒",
    type: "timing",
    icon: "Timer",
    gender: "male",
    description: "耐力跑测试",
    minValid: 180,
    maxValid: 360,
  },
  {
    id: "p_800m",
    name: "800米跑（女）",
    unit: "秒",
    type: "timing",
    icon: "Timer",
    gender: "female",
    description: "耐力跑测试",
    minValid: 150,
    maxValid: 320,
  },
  {
    id: "p_long_jump",
    name: "立定跳远",
    unit: "厘米",
    type: "measuring",
    icon: "MoveRight",
    gender: "both",
    description: "下肢爆发力测试",
    minValid: 100,
    maxValid: 300,
  },
  {
    id: "p_sit_up",
    name: "一分钟仰卧起坐",
    unit: "次",
    type: "counting",
    icon: "Activity",
    gender: "both",
    description: "腰腹肌力量测试",
    minValid: 0,
    maxValid: 80,
  },
  {
    id: "p_pull_up",
    name: "引体向上（男）",
    unit: "次",
    type: "counting",
    icon: "GitPullRequestArrow",
    gender: "male",
    description: "上肢力量测试",
    minValid: 0,
    maxValid: 30,
  },
  {
    id: "p_sit_reach",
    name: "坐位体前屈",
    unit: "厘米",
    type: "measuring",
    icon: "ArrowDownToLine",
    gender: "both",
    description: "柔韧素质测试",
    minValid: -20,
    maxValid: 40,
  },
  {
    id: "p_vital",
    name: "肺活量",
    unit: "毫升",
    type: "measuring",
    icon: "Wind",
    gender: "both",
    description: "肺通气功能测试",
    minValid: 1000,
    maxValid: 7000,
  },
  {
    id: "p_bmi",
    name: "身高体重BMI",
    unit: "kg/m²",
    type: "measuring",
    icon: "Scale",
    gender: "both",
    description: "身体形态指标",
    minValid: 14,
    maxValid: 35,
  },
];

export const mockStandards: StandardItem[] = [
  { projectId: "p_50m", gender: "male", ageRange: [15, 18], grade: "excellent", minScore: 0, maxScore: 7.3, points: 100 },
  { projectId: "p_50m", gender: "male", ageRange: [15, 18], grade: "good", minScore: 7.3, maxScore: 7.9, points: 85 },
  { projectId: "p_50m", gender: "male", ageRange: [15, 18], grade: "pass", minScore: 7.9, maxScore: 9.5, points: 70 },
  { projectId: "p_50m", gender: "male", ageRange: [15, 18], grade: "fail", minScore: 9.5, maxScore: 999, points: 50 },
  { projectId: "p_50m", gender: "female", ageRange: [15, 18], grade: "excellent", minScore: 0, maxScore: 7.9, points: 100 },
  { projectId: "p_50m", gender: "female", ageRange: [15, 18], grade: "good", minScore: 7.9, maxScore: 8.5, points: 85 },
  { projectId: "p_50m", gender: "female", ageRange: [15, 18], grade: "pass", minScore: 8.5, maxScore: 10.6, points: 70 },
  { projectId: "p_50m", gender: "female", ageRange: [15, 18], grade: "fail", minScore: 10.6, maxScore: 999, points: 50 },

  { projectId: "p_long_jump", gender: "male", ageRange: [15, 18], grade: "excellent", minScore: 230, maxScore: 999, points: 100 },
  { projectId: "p_long_jump", gender: "male", ageRange: [15, 18], grade: "good", minScore: 210, maxScore: 230, points: 85 },
  { projectId: "p_long_jump", gender: "male", ageRange: [15, 18], grade: "pass", minScore: 180, maxScore: 210, points: 70 },
  { projectId: "p_long_jump", gender: "male", ageRange: [15, 18], grade: "fail", minScore: 0, maxScore: 180, points: 50 },
  { projectId: "p_long_jump", gender: "female", ageRange: [15, 18], grade: "excellent", minScore: 190, maxScore: 999, points: 100 },
  { projectId: "p_long_jump", gender: "female", ageRange: [15, 18], grade: "good", minScore: 175, maxScore: 190, points: 85 },
  { projectId: "p_long_jump", gender: "female", ageRange: [15, 18], grade: "pass", minScore: 146, maxScore: 175, points: 70 },
  { projectId: "p_long_jump", gender: "female", ageRange: [15, 18], grade: "fail", minScore: 0, maxScore: 146, points: 50 },

  { projectId: "p_sit_up", gender: "male", ageRange: [15, 18], grade: "excellent", minScore: 45, maxScore: 999, points: 100 },
  { projectId: "p_sit_up", gender: "male", ageRange: [15, 18], grade: "good", minScore: 38, maxScore: 45, points: 85 },
  { projectId: "p_sit_up", gender: "male", ageRange: [15, 18], grade: "pass", minScore: 25, maxScore: 38, points: 70 },
  { projectId: "p_sit_up", gender: "male", ageRange: [15, 18], grade: "fail", minScore: 0, maxScore: 25, points: 50 },
  { projectId: "p_sit_up", gender: "female", ageRange: [15, 18], grade: "excellent", minScore: 42, maxScore: 999, points: 100 },
  { projectId: "p_sit_up", gender: "female", ageRange: [15, 18], grade: "good", minScore: 35, maxScore: 42, points: 85 },
  { projectId: "p_sit_up", gender: "female", ageRange: [15, 18], grade: "pass", minScore: 24, maxScore: 35, points: 70 },
  { projectId: "p_sit_up", gender: "female", ageRange: [15, 18], grade: "fail", minScore: 0, maxScore: 24, points: 50 },
];

function generateMockRecords(): TestRecord[] {
  const records: TestRecord[] = [];
  const c1Students = mockStudents.filter((s) => s.classId === "c1");
  const projects = ["p_50m", "p_long_jump", "p_sit_up"];
  let rid = 1;

  c1Students.forEach((student) => {
    projects.forEach((pid) => {
      if (Math.random() < 0.75) {
        const project = mockProjects.find((p) => p.id === pid)!;
        let score: number;
        if (pid === "p_50m") {
          score = student.gender === "male" ? 7 + Math.random() * 3 : 7.8 + Math.random() * 3;
          score = Math.round(score * 100) / 100;
        } else if (pid === "p_long_jump") {
          score = student.gender === "male" ? 180 + Math.random() * 60 : 145 + Math.random() * 60;
          score = Math.round(score);
        } else {
          score = student.gender === "male" ? 25 + Math.random() * 30 : 22 + Math.random() * 28;
          score = Math.round(score);
        }

        const isAbnormal = Math.random() < 0.08;
        records.push({
          id: `r${rid++}`,
          studentId: student.id,
          projectId: pid,
          teacherId: "t1",
          score,
          points: 60 + Math.round(Math.random() * 40),
          grade: isAbnormal ? "fail" : (["excellent", "good", "pass", "fail"][Math.floor(Math.random() * 4)] as any),
          status: isAbnormal ? "abnormal" : "normal",
          reviewed: Math.random() < 0.6,
          photos: [],
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  });

  return records;
}

export const mockRecords: TestRecord[] = generateMockRecords();

export const mockLogs: ScoreLog[] = mockRecords.slice(0, 30).map((r, i) => ({
  id: `log${i + 1}`,
  recordId: r.id,
  teacherId: i % 2 === 0 ? "t1" : "t2",
  teacherName: i % 2 === 0 ? "张建国" : "李美丽",
  oldScore: i % 3 === 0 ? null : r.score !== null ? r.score - 0.5 : null,
  newScore: r.score,
  action: i % 4 === 0 ? "review" : i % 3 === 0 ? "create" : "update",
  createdAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
}));
