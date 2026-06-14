export type AttendanceStatus = "present" | "absent" | "delayed" | "exempted";
export type ProjectType = "timing" | "counting" | "measuring";
export type RecordStatus = "normal" | "abnormal" | "absent" | "delayed";
export type GradeLevel = "excellent" | "good" | "pass" | "fail";
export type Gender = "male" | "female";
export type SyncStatus = "synced" | "pending" | "failed";

export interface TestSession {
  id: string;
  name: string;
  type: "formal" | "makeup" | "other";
  startTime: string;
  endTime?: string;
  classId: string;
  teacherId: string;
  remark?: string;
}

export interface Teacher {
  id: string;
  name: string;
  employeeNo: string;
  subject: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  studentCount: number;
  teacherId: string;
}

export interface Student {
  id: string;
  name: string;
  studentNo: string;
  gender: Gender;
  age: number;
  height?: number;
  weight?: number;
  classId: string;
  qrCode: string;
  attendanceStatus: AttendanceStatus;
  avatarColor: string;
}

export interface TestProject {
  id: string;
  name: string;
  unit: string;
  type: ProjectType;
  icon: string;
  gender: Gender | "both";
  description: string;
  minValid: number;
  maxValid: number;
}

export interface TestRecord {
  id: string;
  studentId: string;
  projectId: string;
  teacherId: string;
  sessionId: string | null;
  score: number | null;
  points: number;
  grade: GradeLevel | null;
  status: RecordStatus;
  reviewed: boolean;
  photos: string[];
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  remark?: string;
}

export interface StandardItem {
  projectId: string;
  gender: Gender;
  ageRange: [number, number];
  grade: GradeLevel;
  minScore: number;
  maxScore: number;
  points: number;
}

export interface ScoreLog {
  id: string;
  recordId: string;
  teacherId: string;
  teacherName: string;
  oldScore: number | null;
  newScore: number | null;
  action: "create" | "update" | "review";
  createdAt: string;
}

export interface TimerState {
  isRunning: boolean;
  elapsed: number;
  laps: number[];
  startTime: number | null;
}

export interface ProjectStat {
  projectId: string;
  projectName: string;
  avgScore: number;
  maxScore: number;
  minScore: number;
  passRate: number;
  testedCount: number;
  excellentCount: number;
  goodCount: number;
  passCount: number;
  failCount: number;
}

export interface Statistics {
  classId: string;
  totalStudents: number;
  testedStudents: number;
  passRate: number;
  excellentRate: number;
  goodRate: number;
  failRate: number;
  avgPoints: number;
  projectStats: ProjectStat[];
}

export interface TeacherLogSummary {
  teacherId: string;
  teacherName: string;
  recordCount: number;
  updateCount: number;
  reviewCount: number;
  lastActiveTime: string;
}
