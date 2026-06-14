import { create } from "zustand";
import type {
  Teacher,
  ClassInfo,
  Student,
  TestProject,
  TestRecord,
  ScoreLog,
  TimerState,
  AttendanceStatus,
  RecordStatus,
  GradeLevel,
} from "@/types";
import {
  mockTeachers,
  mockClasses,
  mockStudents,
  mockProjects,
  mockRecords,
  mockLogs,
} from "@/mock";
import { calculateScore, generateId } from "@/utils";

(globalThis as any).__projects = mockProjects;

interface AppState {
  currentTeacher: Teacher;
  teachers: Teacher[];
  classes: ClassInfo[];
  projects: TestProject[];

  currentClassId: string;
  searchKeyword: string;
  attendanceFilter: AttendanceStatus | "all";
  students: Student[];

  currentProjectId: string | null;
  records: TestRecord[];
  logs: ScoreLog[];
  selectedStudentIds: string[];
  currentEntryStudentIndex: number;

  timer: TimerState;
  scanModalOpen: boolean;
  cameraModalOpen: boolean;
  currentPhotoStudentId: string | null;

  setCurrentClass: (classId: string) => void;
  setSearchKeyword: (kw: string) => void;
  setAttendanceFilter: (f: AttendanceStatus | "all") => void;
  updateStudentStatus: (studentId: string, status: AttendanceStatus) => void;
  batchUpdateStatus: (studentIds: string[], status: AttendanceStatus) => void;
  findStudentByQR: (qr: string) => Student | undefined;

  setCurrentProject: (projectId: string | null) => void;
  setCurrentEntryStudentIndex: (idx: number) => void;
  addOrUpdateRecord: (
    studentId: string,
    projectId: string,
    score: number | null,
    status: RecordStatus,
    photos?: string[],
    remark?: string
  ) => void;
  updateRecord: (recordId: string, data: Partial<TestRecord>) => void;
  batchReview: (recordIds: string[]) => void;
  addPhotoToRecord: (recordId: string, photo: string) => void;
  addLog: (log: Omit<ScoreLog, "id" | "createdAt">) => void;

  toggleStudentSelection: (studentId: string) => void;
  clearSelection: () => void;
  selectAll: () => void;

  startTimer: () => void;
  stopTimer: () => void;
  setTimerElapsed: (ms: number) => void;
  resetTimer: () => void;
  addTimerLap: (ms: number) => void;

  setScanModalOpen: (open: boolean) => void;
  setCameraModalOpen: (open: boolean, studentId?: string) => void;

  getFilteredStudents: () => Student[];
  getRecordsByClass: (classId: string) => TestRecord[];
  getRecordsByStudent: (studentId: string) => TestRecord[];
  getStudentRecordForProject: (studentId: string, projectId: string) => TestRecord | undefined;
  recalcGrade: (recordId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentTeacher: mockTeachers[0],
  teachers: mockTeachers,
  classes: mockClasses,
  projects: mockProjects,

  currentClassId: mockClasses[0].id,
  searchKeyword: "",
  attendanceFilter: "all",
  students: mockStudents,

  currentProjectId: null,
  records: mockRecords,
  logs: mockLogs,
  selectedStudentIds: [],
  currentEntryStudentIndex: 0,

  timer: {
    isRunning: false,
    elapsed: 0,
    laps: [],
    startTime: null,
  },
  scanModalOpen: false,
  cameraModalOpen: false,
  currentPhotoStudentId: null,

  setCurrentClass: (classId) => set({ currentClassId: classId, currentEntryStudentIndex: 0, selectedStudentIds: [] }),
  setSearchKeyword: (kw) => set({ searchKeyword: kw }),
  setAttendanceFilter: (f) => set({ attendanceFilter: f }),

  updateStudentStatus: (studentId, status) =>
    set((state) => ({
      students: state.students.map((s) => (s.id === studentId ? { ...s, attendanceStatus: status } : s)),
    })),

  batchUpdateStatus: (studentIds, status) =>
    set((state) => ({
      students: state.students.map((s) => (studentIds.includes(s.id) ? { ...s, attendanceStatus: status } : s)),
    })),

  findStudentByQR: (qr) => get().students.find((s) => s.qrCode === qr),

  setCurrentProject: (projectId) => set({ currentProjectId: projectId, currentEntryStudentIndex: 0 }),
  setCurrentEntryStudentIndex: (idx) => set({ currentEntryStudentIndex: idx }),

  addOrUpdateRecord: (studentId, projectId, score, status, photos = [], remark) => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return;

    const existing = state.records.find((r) => r.studentId === studentId && r.projectId === projectId);
    let points = 0;
    let grade: GradeLevel | null = null;
    let isAbnormal = false;

    if (score !== null) {
      const res = calculateScore(projectId, student.gender, student.age, score);
      points = res.points;
      grade = res.grade;
      isAbnormal = res.isAbnormal;
    }

    const now = new Date().toISOString();
    const finalStatus: RecordStatus = isAbnormal ? "abnormal" : status;

    if (existing) {
      set({
        records: state.records.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                score,
                points,
                grade,
                status: finalStatus,
                photos: photos.length ? [...r.photos, ...photos] : r.photos,
                remark: remark ?? r.remark,
                updatedAt: now,
              }
            : r
        ),
      });
      state.addLog({
        recordId: existing.id,
        teacherId: state.currentTeacher.id,
        teacherName: state.currentTeacher.name,
        oldScore: existing.score,
        newScore: score,
        action: "update",
      });
    } else {
      const newRecord: TestRecord = {
        id: generateId("r"),
        studentId,
        projectId,
        teacherId: state.currentTeacher.id,
        score,
        points,
        grade,
        status: finalStatus,
        reviewed: false,
        photos,
        createdAt: now,
        updatedAt: now,
        remark,
      };
      set({ records: [...state.records, newRecord] });
      state.addLog({
        recordId: newRecord.id,
        teacherId: state.currentTeacher.id,
        teacherName: state.currentTeacher.name,
        oldScore: null,
        newScore: score,
        action: "create",
      });
    }
  },

  updateRecord: (recordId, data) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === recordId ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      ),
    })),

  batchReview: (recordIds) => {
    const state = get();
    set({
      records: state.records.map((r) => (recordIds.includes(r.id) ? { ...r, reviewed: true } : r)),
    });
    recordIds.forEach((rid) => {
      state.addLog({
        recordId: rid,
        teacherId: state.currentTeacher.id,
        teacherName: state.currentTeacher.name,
        oldScore: null,
        newScore: null,
        action: "review",
      });
    });
  },

  addPhotoToRecord: (recordId, photo) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === recordId ? { ...r, photos: [...r.photos, photo] } : r
      ),
    })),

  addLog: (log) =>
    set((state) => ({
      logs: [
        { ...log, id: generateId("log"), createdAt: new Date().toISOString() },
        ...state.logs,
      ],
    })),

  toggleStudentSelection: (studentId) =>
    set((state) => ({
      selectedStudentIds: state.selectedStudentIds.includes(studentId)
        ? state.selectedStudentIds.filter((id) => id !== studentId)
        : [...state.selectedStudentIds, studentId],
    })),

  clearSelection: () => set({ selectedStudentIds: [] }),

  selectAll: () =>
    set((state) => ({
      selectedStudentIds: state.getFilteredStudents().map((s) => s.id),
    })),

  startTimer: () =>
    set({ timer: { ...get().timer, isRunning: true, startTime: Date.now() } }),

  stopTimer: () => {
    const t = get().timer;
    set({ timer: { ...t, isRunning: false, startTime: null } });
  },

  setTimerElapsed: (ms) => set({ timer: { ...get().timer, elapsed: ms } }),

  resetTimer: () =>
    set({
      timer: { isRunning: false, elapsed: 0, laps: [], startTime: null },
    }),

  addTimerLap: (ms) =>
    set({ timer: { ...get().timer, laps: [...get().timer.laps, ms] } }),

  setScanModalOpen: (open) => set({ scanModalOpen: open }),
  setCameraModalOpen: (open, studentId) =>
    set({ cameraModalOpen: open, currentPhotoStudentId: studentId ?? null }),

  getFilteredStudents: () => {
    const state = get();
    let list = state.students.filter((s) => s.classId === state.currentClassId);
    if (state.attendanceFilter !== "all") {
      list = list.filter((s) => s.attendanceStatus === state.attendanceFilter);
    }
    if (state.searchKeyword.trim()) {
      const kw = state.searchKeyword.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.studentNo.toLowerCase().includes(kw) ||
          s.qrCode.toLowerCase().includes(kw)
      );
    }
    return list.sort((a, b) => a.studentNo.localeCompare(b.studentNo));
  },

  getRecordsByClass: (classId) => {
    const state = get();
    const studentIds = state.students.filter((s) => s.classId === classId).map((s) => s.id);
    return state.records.filter((r) => studentIds.includes(r.studentId));
  },

  getRecordsByStudent: (studentId) => get().records.filter((r) => r.studentId === studentId),

  getStudentRecordForProject: (studentId, projectId) =>
    get().records.find((r) => r.studentId === studentId && r.projectId === projectId),

  recalcGrade: (recordId) => {
    const state = get();
    const rec = state.records.find((r) => r.id === recordId);
    if (!rec || rec.score === null) return;
    const student = state.students.find((s) => s.id === rec.studentId);
    if (!student) return;
    const res = calculateScore(rec.projectId, student.gender, student.age, rec.score);
    state.updateRecord(recordId, {
      points: res.points,
      grade: res.grade,
      status: res.isAbnormal ? "abnormal" : "normal",
    });
  },
}));
