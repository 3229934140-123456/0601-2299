import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, ScanLine, CheckCircle2, Search, AlertCircle } from "lucide-react";
import jsQR from "jsqr";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/Avatar";
import { genderLabel } from "@/utils";

export function ScanModal() {
  const location = useLocation();
  const {
    scanModalOpen,
    setScanModalOpen,
    students,
    classes,
    setCurrentClass,
    setSearchKeyword,
    setCurrentProject,
    setCurrentEntryStudentIndex,
    getFilteredStudents,
  } = useAppStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const foundRef = useRef(false);
  const autoCloseTimerRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<ReturnType<typeof findStudentAnyClass> | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [scanning, setScanning] = useState(false);

  function findStudentAnyClass(code: string) {
    const kw = code.trim().toLowerCase();
    let s = students.find(
      (x) =>
        x.qrCode.toLowerCase() === kw ||
        x.studentNo.toLowerCase() === kw ||
        x.name === code.trim()
    );
    if (!s) {
      s = students.find(
        (x) =>
          x.name.includes(code.trim()) ||
          x.studentNo.includes(code.trim().toUpperCase()) ||
          x.qrCode.toLowerCase().includes(kw)
      );
    }
    return s || undefined;
  }

  const isDataEntryPage = location.pathname.includes("/data-entry");

  const handleNavigate = useCallback(
    (student: NonNullable<typeof found>) => {
      if (isDataEntryPage) {
        setCurrentClass(student.classId);
        setSearchKeyword("");
        setTimeout(() => {
          useAppStore.getState().locateStudentInEntry(student.id);
        }, 50);
      } else {
        setCurrentClass(student.classId);
        setSearchKeyword(student.studentNo);
        setCurrentProject(null);
      }
      setScanModalOpen(false);
    },
    [isDataEntryPage, setCurrentClass, setSearchKeyword, setCurrentProject, setScanModalOpen]
  );

  useEffect(() => {
    if (!scanModalOpen) return;
    setFound(null);
    setError(null);
    setManualInput("");
    setMode("scan");
    setScanning(false);
    foundRef.current = false;

    let stopped = false;
    const start = async () => {
      try {
        setScanning(true);
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (stopped) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
          setTimeout(loop, 300);
        }
      } catch (e: any) {
        setError(e?.message || "无法打开相机");
        setScanning(false);
        setMode("manual");
      }
    };
    start();

    const loop = () => {
      if (foundRef.current || stopped) return;
      if (!videoRef.current || !canvasRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const v = videoRef.current;
      const c = canvasRef.current;
      if (v.readyState === v.HAVE_ENOUGH_DATA) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(v, 0, 0, c.width, c.height);
          try {
            const imageData = ctx.getImageData(0, 0, c.width, c.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });
            if (code && code.data && !foundRef.current) {
              foundRef.current = true;
              const stu = findStudentAnyClass(code.data);
              if (stu) {
                setFound(stu);
                setScanning(false);
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((t) => t.stop());
                }
                return;
              } else {
                setTimeout(() => {
                  foundRef.current = false;
                }, 1500);
              }
            }
          } catch {
            // ignore decode errors
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [scanModalOpen]);

  useEffect(() => {
    if (!found || !scanModalOpen) return;
    autoCloseTimerRef.current = window.setTimeout(() => {
      handleNavigate(found);
    }, 700);
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [found, scanModalOpen]);

  if (!scanModalOpen) return null;

  const handleSearchManual = () => {
    if (!manualInput.trim()) return;
    const s = findStudentAnyClass(manualInput);
    if (s) setFound(s);
    else setError("未找到匹配的学生，请检查输入");
  };

  const className = found ? classes.find((c) => c.id === found.classId)?.name : "";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden w-[580px] max-w-[92vw] shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <ScanLine size={20} />
            </div>
            <div>
              <div className="text-slate-900 font-semibold">扫码识别学生</div>
              <div className="text-slate-500 text-xs">对准学生二维码自动识别，支持跨班定位</div>
            </div>
          </div>
          <button
            onClick={() => setScanModalOpen(false)}
            className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100">
          <button
            onClick={() => {
              setMode("scan");
              setError(null);
              setFound(null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === "scan" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            扫码识别
          </button>
          <button
            onClick={() => {
              setMode("manual");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            手动搜索
          </button>
        </div>

        {mode === "scan" ? (
          <div className="relative bg-black aspect-[4/3] overflow-hidden">
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {!error && !found && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-60 h-60">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-accent-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-accent-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-accent-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-accent-500 rounded-br-xl" />
                  <div className="absolute left-2 right-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-500 to-transparent shadow-lg shadow-accent-500/60 animate-[scanline_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {scanning && !found && !error && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm flex items-center justify-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                </span>
                正在扫描二维码...
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3 px-6 text-center bg-black/60">
                <AlertCircle size={40} opacity={0.5} />
                <div className="text-sm">{error}</div>
                <button onClick={() => setMode("manual")} className="btn-primary mt-2">
                  切换手动搜索
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchManual()}
                  placeholder="输入学号、姓名、二维码编号"
                  className="input pl-10"
                  autoFocus
                />
              </div>
              <button onClick={handleSearchManual} className="btn-primary">
                搜索
              </button>
            </div>
            {error && <div className="text-sm text-danger flex items-center gap-1"><AlertCircle size={14}/>{error}</div>}
            <div className="text-xs text-slate-500">示例：20240101、王芳、QRC10003</div>
          </div>
        )}

        {found && (
          <div className="p-4 bg-emerald-50 border-t border-emerald-100 animate-slide-in">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={found.name} color={found.avatarColor} size="xl" />
                <div className="absolute -right-1 -bottom-1 w-7 h-7 rounded-full bg-success text-white flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-lg font-bold text-slate-900">{found.name}</div>
                  <span className="tag bg-white border border-slate-200 text-slate-600">
                    {className}
                  </span>
                </div>
                <div className="mt-0.5 text-sm text-slate-600">
                  学号 {found.studentNo} · {genderLabel(found.gender)} · {found.age}岁
                </div>
                {found.classId !== useAppStore.getState().currentClassId && (
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
                    <AlertCircle size={12} />
                    检测为其他班级学生，将自动切换至 {className}
                  </div>
                )}
                <div className="mt-2 text-xs text-success font-medium flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  识别成功，即将自动跳转...
                </div>
              </div>
            </div>
          </div>
        )}

        {!found && (
          <div className="px-5 py-4 border-t border-slate-100 text-center text-xs text-slate-400">
            对准学生证件/手环上的二维码即可自动识别；支持跨班定位，会自动切换到对应班级
          </div>
        )}
      </div>
      <style>{`@keyframes scanline { 0% { transform: translateY(0); } 50% { transform: translateY(240px); } 100% { transform: translateY(0); } }`}</style>
    </div>
  );
}
