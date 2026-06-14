import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  TestSession,
  SyncStatus,
} from "@/types";
import {
  mockTeachers,
  mockClasses,
  mockStudents,
  mockProjects,
  mockSessions,
} from "@/mock";
import { calculateScore, generateId } from "@/utils";
import { getThresholds } from "@/utils/scoring";

(globalThis as any).__projects = mockProjects;
void getThresholds;

interface AppState {
  currentTeacher: Teacher;
  teachers: Teacher[];
  classes: ClassInfo[];
  projects: TestProject[];
  sessions: TestSession[];
  currentSessionId: string | null;
  isOnline: boolean;

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
  ) => TestRecord | undefined;
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

  setCurrentSession: (sessionId: string) => void;
  createSession: (session: Omit<TestSession, "id">) => void;
  setIsOnline: (online: boolean) => void;
  syncPendingRecords: () => void;
  retrySync: (recordId: string) => void;
  markSyncFailed: (recordId: string) => void;
  getRecordsBySession: (sessionId: string) => TestRecord[];

  getFilteredStudents: () => Student[];
  getRecordsByClass: (classId: string) => TestRecord[];
  getRecordsByStudent: (studentId: string) => TestRecord[];
  getStudentRecordForProject: (studentId: string, projectId: string) => TestRecord | undefined;
  getStudentAllRecordsForProject: (studentId: string, projectId: string) => TestRecord[];
  locateStudentInEntry: (studentId: string) => boolean;
  recalcGrade: (recordId: string) => void;

  resetAll: () => void;
}

const STATIC_STATE = {
  currentTeacher: mockTeachers[0],
  teachers: mockTeachers,
  classes: mockClasses,
  projects: mockProjects,
  students: mockStudents,
  sessions: mockSessions,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...STATIC_STATE,

      currentSessionId: mockSessions[0].id,
      isOnline: true,

      currentClassId: mockClasses[0].id,
      searchKeyword: "",
      attendanceFilter: "all",

      currentProjectId: null,
      records: [],
      logs: [],
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

      setCurrentClass: (classId) =>
        set({ currentClassId: classId, currentEntryStudentIndex: 0, selectedStudentIds: [] }),
      setSearchKeyword: (kw) => set({ searchKeyword: kw }),
      setAttendanceFilter: (f) => set({ attendanceFilter: f }),

      updateStudentStatus: (studentId, status) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === studentId ? { ...s, attendanceStatus: status } : s
          ),
        })),

      batchUpdateStatus: (studentIds, status) =>
        set((state) => ({
          students: state.students.map((s) =>
            studentIds.includes(s.id) ? { ...s, attendanceStatus: status } : s
          ),
        })),

      findStudentByQR: (qr) => get().students.find((s) => s.qrCode === qr),

      setCurrentProject: (projectId) =>
        set({ currentProjectId: projectId, currentEntryStudentIndex: 0 }),
      setCurrentEntryStudentIndex: (idx) => set({ currentEntryStudentIndex: idx }),

      addOrUpdateRecord: (studentId, projectId, score, status, photos = [], remark) => {
        const state = get();
        const student = state.students.find((s) => s.id === studentId);
        const project = state.projects.find((p) => p.id === projectId);
        if (!student) return undefined;

        const existing = state.records.find(
          (r) => r.studentId === studentId && r.projectId === projectId && r.sessionId === state.currentSessionId
        );
        let points = 0;
        let grade: GradeLevel | null = null;
        let isAbnormal = false;

        if (score !== null) {
          const res = calculateScore(projectId, student.gender, student.age, score, project);
          points = res.points;
          grade = res.grade;
          isAbnormal = res.isAbnormal;
        }

        const now = new Date().toISOString();
        const finalStatus: RecordStatus =
          status === "normal" && isAbnormal ? "abnormal" : status;

        if (existing) {
          const updated: TestRecord = {
            ...existing,
            score,
            points,
            grade,
            status: finalStatus,
            photos: photos.length ? [...existing.photos, ...photos] : existing.photos,
            remark: remark ?? existing.remark,
            updatedAt: now,
            syncStatus: state.isOnline ? "synced" : "pending",
            syncedAt: state.isOnline ? now : existing.syncedAt,
          };
          set({
            records: state.records.map((r) => (r.id === existing.id ? updated : r)),
          });
          state.addLog({
            recordId: existing.id,
            teacherId: state.currentTeacher.id,
            teacherName: state.currentTeacher.name,
            oldScore: existing.score,
            newScore: score,
            action: "update",
          });
          return updated;
        } else {
          const newRecord: TestRecord = {
            id: generateId("r"),
            studentId,
            projectId,
            teacherId: state.currentTeacher.id,
            sessionId: state.currentSessionId,
            score,
            points,
            grade,
            status: finalStatus,
            reviewed: false,
            photos,
            syncStatus: state.isOnline ? "synced" : "pending",
            createdAt: now,
            updatedAt: now,
            syncedAt: state.isOnline ? now : undefined,
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
          return newRecord;
        }
      },

      updateRecord: (recordId, data) => {
        const state = get();
        const now = new Date().toISOString();
        set({
          records: state.records.map((r) =>
            r.id === recordId
              ? {
                  ...r,
                  ...data,
                  updatedAt: now,
                  syncStatus: state.isOnline ? "synced" : "pending",
                  syncedAt: state.isOnline ? now : r.syncedAt,
                }
              : r
          ),
        });
      },

      batchReview: (recordIds) => {
        const state = get();
        set({
          records: state.records.map((r) =>
            recordIds.includes(r.id) ? { ...r, reviewed: true } : r
          ),
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

      setCurrentSession: (sessionId) =>
        set({ currentSessionId: sessionId }),

      createSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, { ...session, id: generateId("sess") }],
        })),

      setIsOnline: (online) => set({ isOnline: online }),

      syncPendingRecords: () => {
        const state = get();
        if (!state.isOnline) return;
        const now = new Date().toISOString();
        set({
          records: state.records.map((r) =>
            r.syncStatus === "pending"
              ? { ...r, syncStatus: "synced" as SyncStatus, syncedAt: now }
              : r
          ),
        });
      },

      retrySync: (recordId) => {
        const state = get();
        const now = new Date().toISOString();
        set({
          records: state.records.map((r) =>
            r.id === recordId
              ? { ...r, syncStatus: "synced" as SyncStatus, syncedAt: now }
              : r
          ),
        });
      },

      markSyncFailed: (recordId) => {
        const state = get();
        set({
          records: state.records.map((r) =>
            r.id === recordId
              ? { ...r, syncStatus: "failed" as SyncStatus }
              : r
          ),
        });
      },

      getRecordsBySession: (sessionId) =>
        get().records.filter((r) => r.sessionId === sessionId),

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
        const studentIds = state.students
          .filter((s) => s.classId === classId)
          .map((s) => s.id);
        return state.records.filter((r) => studentIds.includes(r.studentId));
      },

      getRecordsByStudent: (studentId) =>
        get().records.filter((r) => r.studentId === studentId),

      getStudentRecordForProject: (studentId, projectId) =>
        get().records.find(
          (r) => r.studentId === studentId && r.projectId === projectId && r.sessionId === get().currentSessionId
        ),

      getStudentAllRecordsForProject: (studentId, projectId) =>
        get().records.filter(
          (r) => r.studentId === studentId && r.projectId === projectId
        ),

      locateStudentInEntry: (studentId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === state.currentProjectId);
        const filtered = state.students.filter(
          (s) =>
            s.classId === state.currentClassId &&
            s.attendanceStatus === "present" &&
            (!project || project.gender === "both" || s.gender === project.gender)
        );
        const idx = filtered.findIndex((s) => s.id === studentId);
        if (idx >= 0) {
          set({ currentEntryStudentIndex: idx });
          return true;
        }
        return false;
      },

      recalcGrade: (recordId) => {
        const state = get();
        const rec = state.records.find((r) => r.id === recordId);
        if (!rec || rec.score === null) return;
        const student = state.students.find((s) => s.id === rec.studentId);
        const project = state.projects.find((p) => p.id === rec.projectId);
        if (!student) return;
        const res = calculateScore(
          rec.projectId,
          student.gender,
          student.age,
          rec.score,
          project
        );
        state.updateRecord(recordId, {
          points: res.points,
          grade: res.grade,
          status: res.isAbnormal ? "abnormal" : rec.status === "abnormal" ? "normal" : rec.status,
        });
      },

      resetAll: () => {
        set({
          records: [],
          logs: [],
          selectedStudentIds: [],
          currentEntryStudentIndex: 0,
          timer: { isRunning: false, elapsed: 0, laps: [], startTime: null },
          students: STATIC_STATE.students,
          searchKeyword: "",
          attendanceFilter: "all",
        });
      },
    }),
    {
      name: "sports-pe-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        students: state.students,
        records: state.records,
        logs: state.logs,
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        isOnline: state.isOnline,
        currentClassId: state.currentClassId,
        currentProjectId: state.currentProjectId,
        currentTeacherId: state.currentTeacher.id,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const persisted: any = state;
        if (persisted.currentTeacherId) {
          const t = STATIC_STATE.teachers.find((x) => x.id === persisted.currentTeacherId);
          if (t) (state as any).currentTeacher = t;
        }
      },
      version: 1,
    }
  )
);
