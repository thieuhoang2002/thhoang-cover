
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Music4
} from 'lucide-react';
import { songs } from './songs';
import { Song } from './types';

const App: React.FC = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSong = songs[currentSongIndex];

  // Logic handles
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = useCallback(() => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  }, []);

  const prevSong = useCallback(() => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (!isNaN(total)) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      audioRef.current.volume = nextMute ? 0 : volume;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentSongIndex, isPlaying]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-800/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/40 blur-[120px] rounded-full"></div>

      {/* Header */}
      <header className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center rounded-full text-zinc-950 transition-transform group-hover:scale-110">
            <Music4 size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-playfair text-xl font-bold tracking-tight">thhoang cover</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">Musical Portfolio</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPlaylist(!showPlaylist)}
          className={`p-3 rounded-full transition-all border ${showPlaylist ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-zinc-100'}`}
        >
          <ListMusic size={20} />
        </button>
      </header>

      {/* Main Player Container */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row gap-12 items-center justify-center z-10">
        
        {/* Left Side: Disc and Visualizer */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 border border-zinc-800/50 rounded-full"></div>
          
          {/* Spinning Disc */}
          <div className={`relative w-[85%] h-[85%] rounded-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-zinc-900 animate-spin-slow ${!isPlaying ? 'pause-animation' : ''}`}>
            <img 
              src={currentSong.coverUrl} 
              alt={currentSong.title} 
              className="w-full h-full object-cover select-none"
            />
            {/* Center Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-zinc-950 rounded-full border-4 border-zinc-900/50 flex items-center justify-center">
               <div className="w-2 h-2 bg-zinc-100 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Floating Decorative Rings */}
          <div className="absolute -inset-4 border border-white/5 rounded-full pointer-events-none"></div>
          <div className="absolute -inset-8 border border-white/5 rounded-full pointer-events-none scale-110 opacity-50"></div>
        </div>

        {/* Right Side: Controls and Info */}
        <div className="flex-1 w-full max-w-md lg:max-w-none bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[40px] shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-zinc-100 line-clamp-1">{currentSong.title}</h2>
              <p className="text-zinc-400 font-medium tracking-wide uppercase text-sm">{currentSong.artist}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                <Heart size={20} />
              </button>
              <button className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3 mb-10">
            <div className="relative h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden group">
              <input 
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="absolute top-0 left-0 h-full bg-zinc-100 transition-all duration-150 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-zinc-500 tracking-widest uppercase">
              <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-10">
            <button 
              onClick={prevSong}
              className="p-3 text-zinc-400 hover:text-zinc-100 transition-all hover:scale-110"
            >
              <SkipBack size={32} fill="currentColor" className="opacity-80" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="w-16 h-16 md:w-20 md:h-20 bg-zinc-100 text-zinc-950 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

            <button 
              onClick={nextSong}
              className="p-3 text-zinc-400 hover:text-zinc-100 transition-all hover:scale-110"
            >
              <SkipForward size={32} fill="currentColor" className="opacity-80" />
            </button>
          </div>

          {/* Volume and Actions */}
          <div className="flex items-center gap-4">
            <button onClick={toggleMute} className="text-zinc-500 hover:text-zinc-100 transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-zinc-800 rounded-full accent-zinc-100 appearance-none cursor-pointer"
            />
            <button className="text-zinc-500 hover:text-zinc-100 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextSong}
      />

      {/* Playlist Drawer (Mobile Overlay / Desktop Slide-in) */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-80 bg-zinc-950/95 backdrop-blur-3xl border-l border-white/10 z-50 transition-transform duration-500 ease-in-out ${showPlaylist ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-playfair text-2xl font-bold">Playlist</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-zinc-500 hover:text-zinc-100">
              <MoreHorizontal />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {songs.map((song, index) => (
              <button 
                key={song.id}
                onClick={() => {
                  setCurrentSongIndex(index);
                  setIsPlaying(true);
                }}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${currentSongIndex === index ? 'bg-white/10 text-white border border-white/10' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm line-clamp-1">{song.title}</p>
                  <p className="text-[10px] uppercase tracking-wider">{song.artist}</p>
                </div>
                <span className="text-[10px] font-mono">{song.duration}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800">
             <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 text-center font-bold">thhoang cover © 2025</p>
          </div>
        </div>
      </div>

      {/* Instructions for user interaction if browser blocks autoplay */}
      {!isPlaying && progress === 0 && (
         <div className="fixed bottom-8 text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-medium animate-pulse">
           Press play to begin your musical journey
         </div>
      )}
    </div>
  );
};

export default App;
