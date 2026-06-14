import { useEffect, useRef, useState } from "react";
import { X, ScanLine, CheckCircle2, Search } from "lucide-react";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/Avatar";

export function ScanModal() {
  const { scanModalOpen, setScanModalOpen, findStudentByQR, students, setSearchKeyword, currentClassId, setCurrentClass } =
    useAppStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<ReturnType<typeof findStudentByQR> | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");

  useEffect(() => {
    if (!scanModalOpen) return;
    setFound(null);
    setError(null);
    setManualInput("");
    setMode("scan");

    let stopped = false;
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 640, height: 480 },
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
          loop();
        }
      } catch (e: any) {
        setError(e?.message || "无法打开相机");
        setMode("manual");
      }
    };
    start();

    const loop = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const v = videoRef.current;
      const c = canvasRef.current;
      if (v.readyState === v.HAVE_ENOUGH_DATA) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        if (ctx) ctx.drawImage(v, 0, 0);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [scanModalOpen]);

  if (!scanModalOpen) return null;

  const handleSearchManual = () => {
    if (!manualInput.trim()) return;
    const kw = manualInput.trim().toLowerCase();
    const cls = useAppStore.getState().classes;
    let s = students.find(
      (x) =>
        x.qrCode.toLowerCase() === kw ||
        x.studentNo.toLowerCase() === kw ||
        x.name === manualInput.trim()
    );
    if (!s) {
      s = students.find(
        (x) =>
          x.name.includes(manualInput.trim()) ||
          x.studentNo.includes(manualInput)
      );
    }
    if (s) {
      if (s.classId !== currentClassId) setCurrentClass(s.classId);
      setFound(s);
    } else {
      setError("未找到匹配的学生，请检查输入");
      if (!cls.some((c) => c.id === currentClassId)) {
        // ignore
      }
    }
  };

  const handleSimulateScan = () => {
    const pool = students.filter((s) => s.classId === currentClassId);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) setFound(pick);
  };

  const handleConfirm = () => {
    if (!found) return;
    setSearchKeyword(found.studentNo);
    setScanModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden w-[560px] max-w-[92vw] shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <ScanLine size={20} />
            </div>
            <div>
              <div className="text-slate-900 font-semibold">扫码识别学生</div>
              <div className="text-slate-500 text-xs">扫描学生二维码或手动输入学号/姓名</div>
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
            onClick={() => setMode("scan")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === "scan" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            扫码识别
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            手动搜索
          </button>
        </div>

        {mode === "scan" ? (
          <div className="relative bg-black aspect-[4/3]">
            <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {!error && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-56 h-56">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-accent-500 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-accent-500 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-accent-500 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-accent-500 rounded-br-xl" />
                    <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-accent-500/80 shadow-lg shadow-accent-500/50 animate-pulse" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-0 right-0 text-center text-white/80 text-xs">
                  将学生二维码放入扫描框内
                </div>
              </>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3 px-6 text-center">
                <ScanLine size={40} opacity={0.3} />
                <div className="text-sm">{error}</div>
                <button onClick={() => setMode("manual")} className="btn-primary">
                  切换手动搜索
                </button>
              </div>
            )}
            {!error && (
              <button
                onClick={handleSimulateScan}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur text-white/80 text-xs hover:bg-white/25 transition border border-white/20"
              >
                模拟扫码 (演示)
              </button>
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
                  placeholder="输入学号、姓名或二维码编号"
                  className="input pl-10"
                  autoFocus
                />
              </div>
              <button onClick={handleSearchManual} className="btn-primary">
                搜索
              </button>
            </div>
            {error && <div className="text-sm text-danger">{error}</div>}
            <div className="text-xs text-slate-500">
              示例：20240101、王芳、QRC10003
            </div>
          </div>
        )}

        {found && (
          <div className="p-4 bg-emerald-50 border-t border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={found.name} color={found.avatarColor} size="lg" />
                <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full bg-success text-white flex items-center justify-center border-2 border-white">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-slate-900">{found.name}</div>
                <div className="text-xs text-slate-500">
                  学号 {found.studentNo} · {found.gender === "male" ? "男" : "女"} · {found.age}岁
                </div>
              </div>
              <button onClick={handleConfirm} className="btn-success">
                确认定位
              </button>
            </div>
          </div>
        )}

        {!found && (
          <div className="px-5 py-4 border-t border-slate-100 text-center text-xs text-slate-400">
            支持扫描二维码/条形码识别，也可手动输入学号定位学生
          </div>
        )}
      </div>
    </div>
  );
}
