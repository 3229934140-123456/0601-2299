import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/store";

export function useTimer() {
  const { timer, startTimer, stopTimer, setTimerElapsed, resetTimer, addTimerLap } = useAppStore();
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);

  useEffect(() => {
    if (timer.isRunning) {
      startRef.current = Date.now();
      baseRef.current = timer.elapsed;
      const tick = () => {
        const now = Date.now();
        setTimerElapsed(baseRef.current + (now - startRef.current));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [timer.isRunning, setTimerElapsed, timer.elapsed]);

  const lap = useCallback(() => {
    addTimerLap(timer.elapsed);
  }, [timer.elapsed, addTimerLap]);

  return {
    isRunning: timer.isRunning,
    elapsed: timer.elapsed,
    laps: timer.laps,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
    lap,
  };
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const start = useCallback(async () => {
    try {
      setError(null);
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (e: any) {
      setError(e?.message || "无法访问相机");
    }
  }, []);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      setReady(false);
    }
  }, [stream]);

  const capture = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || !ready) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, [ready]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { videoRef, canvasRef, error, ready, start, stop, capture };
}
