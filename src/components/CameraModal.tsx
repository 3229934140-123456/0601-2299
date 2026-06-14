import { useEffect, useState } from "react";
import { X, Camera as CameraIcon, RotateCcw, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store";
import { useCamera } from "@/hooks";
import { Avatar } from "@/components/Avatar";

export function CameraModal() {
  const { cameraModalOpen, setCameraModalOpen, currentPhotoStudentId, students, addOrUpdateRecord, currentProjectId, currentTeacher } =
    useAppStore();
  const { videoRef, canvasRef, error, ready, start, stop, capture } = useCamera();
  const [captured, setCaptured] = useState<string | null>(null);

  const student = students.find((s) => s.id === currentPhotoStudentId);

  useEffect(() => {
    if (cameraModalOpen) {
      setCaptured(null);
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [cameraModalOpen, start, stop]);

  if (!cameraModalOpen) return null;

  const handleCapture = () => {
    const data = capture();
    if (data) setCaptured(data);
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const handleConfirm = () => {
    if (!captured || !currentPhotoStudentId || !currentProjectId) return;
    const existing = useAppStore.getState().getStudentRecordForProject(currentPhotoStudentId, currentProjectId);
    if (existing) {
      useAppStore.getState().addPhotoToRecord(existing.id, captured);
    } else {
      addOrUpdateRecord(currentPhotoStudentId, currentProjectId, null, "normal", [captured]);
    }
    setCameraModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in">
      <div className="bg-slate-900 rounded-3xl overflow-hidden w-[720px] max-w-[92vw] shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <CameraIcon size={20} />
            </div>
            <div>
              <div className="text-white font-semibold">拍照留证</div>
              <div className="text-white/50 text-xs">
                {student ? `${student.name} · ${student.studentNo}` : "未选择学生"}
              </div>
            </div>
          </div>
          {student && <Avatar name={student.name} color={student.avatarColor} size="md" />}
          <button
            onClick={() => setCameraModalOpen(false)}
            className="w-9 h-9 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative bg-black aspect-video">
          {captured ? (
            <img src={captured} alt="" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
          {!ready && !captured && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white/60">
              正在启动相机...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-2">
              <CameraIcon size={48} opacity={0.3} />
              <div>{error}</div>
              <div className="text-sm text-white/40">请检查相机权限</div>
            </div>
          )}
          {ready && !captured && (
            <div className="absolute inset-4 border-2 border-white/30 rounded-2xl pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent-500 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent-500 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-500 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent-500 rounded-br-xl" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-5 px-5 py-5 bg-slate-900">
          {captured ? (
            <>
              <button
                onClick={handleRetake}
                className="btn-secondary text-white bg-white/10 border-white/20 hover:bg-white/20"
              >
                <RotateCcw size={18} />
                重新拍摄
              </button>
              <button onClick={handleConfirm} className="btn-success">
                <CheckCircle2 size={18} />
                确认使用
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!ready}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-105 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 rounded-full bg-accent-500 border-4 border-white" />
            </button>
          )}
        </div>
        <div className="text-white/40 text-xs text-center pb-4 px-5">
          照片将关联至学生测试成绩作为现场凭证，仅本校可查看
        </div>
      </div>
    </div>
  );
}
