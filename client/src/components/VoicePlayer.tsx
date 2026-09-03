import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "@/lib/icons";

export function VoicePlayer({ url, isOwn = true }: { url: string, isOwn?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  // Generate 26 static bars for the waveform
  const bars = Array.from({ length: 26 }).map((_, i) => {
    const isPassed = (i / 26) * 100 <= progress;
    // create a realistic looking wave profile using sine waves
    const height = 4 + Math.abs(Math.sin(i * 0.4) * 10) + Math.abs(Math.cos(i * 1.2) * 6);
    return (
      <div
        key={i}
        className={`w-[3px] rounded-full transition-colors duration-100 ${isPlaying ? 'animate-playback-wave' : ''}`}
        style={{
          height: isPlaying ? undefined : `${Math.max(4, height)}px`,
          backgroundColor: isPassed 
            ? (isOwn ? '#ffffff' : '#22C55E') 
            : (isOwn ? 'rgba(255,255,255,0.4)' : 'rgba(34,197,94,0.3)'),
          animationDelay: `${(i % 6) * 0.15}s`,
        }}
      />
    );
  });

  return (
    <div className="flex items-center gap-3 min-w-[160px] w-full max-w-[240px]">
      <audio ref={audioRef} src={url} preload="metadata" />
      <button
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 ${isOwn ? "bg-white/20 text-white" : "bg-green-100 text-green-600"}`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 ml-0.5 fill-current" />
        )}
      </button>
      <div className="flex-1 flex items-center justify-between h-8 gap-0.5 relative">
        {bars}
        {/* Progress scrub overlay */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress || 0}
          onChange={(e) => {
            if (audioRef.current && audioRef.current.duration) {
              audioRef.current.currentTime = (Number(e.target.value) / 100) * audioRef.current.duration;
              setProgress(Number(e.target.value));
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
