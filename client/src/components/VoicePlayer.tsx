import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";

export function VoicePlayer({ url, isOwn = true }: { url: string, isOwn?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: isOwn ? "rgba(255,255,255,0.4)" : "rgba(34,197,94,0.3)",
      progressColor: isOwn ? "#ffffff" : "#22C55E",
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 24,
      url,
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [url, isOwn]);

  return (
    <div className="flex items-center gap-2 min-w-[120px] w-full max-w-[200px]">
      <button
        onClick={() => wavesurferRef.current?.playPause()}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isOwn ? "bg-white/20" : "bg-[#22C55E]/10"}`}
      >
        {isPlaying ? (
          <Pause className={`w-4 h-4 ${isOwn ? "text-white fill-white" : "text-[#22C55E] fill-[#22C55E]"}`} />
        ) : (
          <Play className={`w-4 h-4 ml-0.5 ${isOwn ? "text-white fill-white" : "text-[#22C55E] fill-[#22C55E]"}`} />
        )}
      </button>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
