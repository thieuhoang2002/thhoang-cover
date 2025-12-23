
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
  Music4,
  Shuffle, Repeat, Download
} from 'lucide-react';
import { songs } from './songs';
import { Song } from './types';

// Hàm này giúp biến đổi "[00:12.50] Hello" thành { time: 12.5, text: "Hello" }
const parseLRC = (lrcString: string) => {
  const lines = lrcString.split('\n');
  const result = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);

      // Tính ra tổng số giây (VD: 12.5s)
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();

      if (text) {
        result.push({ time, text });
      }
    }
  }
  return result;
};

const App: React.FC = () => {
  // const [currentSongIndex, setCurrentSongIndex] = useState(0);
  // Khởi tạo index dựa trên URL nếu có
  const [currentSongIndex, setCurrentSongIndex] = useState(() => {
    // Lấy tham số ?id=... trên thanh địa chỉ
    const params = new URLSearchParams(window.location.search);
    const songId = params.get('id');

    // Tìm xem bài hát có id đó nằm ở vị trí số mấy trong danh sách
    const foundIndex = songs.findIndex(song => song.id === songId);

    // Nếu tìm thấy thì trả về index đó, không thì trả về 0 (bài đầu)
    return foundIndex !== -1 ? foundIndex : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  // --- THÊM STATE MỚI ---
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');

  // --- THÊM STATE CHO THÔNG BÁO COPY ---
  const [showToast, setShowToast] = useState(false);

  // --- LYRICS ---
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Thêm state để chứa lời bài hát sau khi đã parse
  const [parsedLyrics, setParsedLyrics] = useState<{ time: number, text: string }[]>([]);

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

  // const nextSong = useCallback(() => {
  //   setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  //   setIsPlaying(true);
  // }, []);

  const nextSong = useCallback(() => {
    if (repeatMode === 'one') {
      // Nếu đang lặp 1 bài: Tua lại từ đầu và phát tiếp
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex;
    if (isShuffle) {
      // Logic Random: Chọn số ngẫu nhiên khác bài hiện tại
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentSongIndex && songs.length > 1);
    } else {
      // Logic thường: Tăng 1, nếu hết thì quay về 0
      nextIndex = (currentSongIndex + 1) % songs.length;
    }

    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
  }, [currentSongIndex, isShuffle, repeatMode]); // Nhớ thêm dependencies

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const toggleRepeat = () => {
    // Chuyển chế độ: none -> all -> one -> none
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const handleShare = () => {
    // Lấy đường dẫn trang web hiện tại
    const link = window.location.href;

    // Copy vào bộ nhớ tạm
    navigator.clipboard.writeText(link).then(() => {
      // Hiện thông báo
      setShowToast(true);
      // Tự động ẩn sau 2 giây
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  // Update URL khi đổi bài hát
  useEffect(() => {
    const currentSongId = songs[currentSongIndex].id;

    // Tạo URL mới chứa tham số id
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('id', currentSongId);

    // Cập nhật thanh địa chỉ mà không reload trang
    window.history.replaceState({}, '', newUrl);
  }, [currentSongIndex]);

// Tự động cuộn lời bài hát (Phiên bản Fix lỗi kéo màn hình)
  useEffect(() => {
    if (lyricsContainerRef.current && activeLyricIndex !== -1) {
      // Lấy danh sách các thẻ <p> bên trong
      const lyricsList = lyricsContainerRef.current.children[0] as HTMLElement;
      const activeEl = lyricsList.children[activeLyricIndex] as HTMLElement;

      if (activeEl) {
        // TÍNH TOÁN VỊ TRÍ:
        // Lấy vị trí dòng hát (offsetTop)
        // Trừ đi một nửa chiều cao khung (để dòng hát nằm giữa)
        // Cộng thêm một nửa chiều cao dòng hát (để căn chỉnh chính xác tâm)
        const scrollPosition = activeEl.offsetTop - lyricsContainerRef.current.clientHeight / 2 + activeEl.clientHeight / 2;
        
        // Ra lệnh cho khung lyrics tự cuộn đến vị trí đó
        lyricsContainerRef.current.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [activeLyricIndex]);

  // --- THÊM USE EFFECT ĐỂ LOAD FILE LRC ---
  useEffect(() => {
    const lrcUrl = songs[currentSongIndex].lrcUrl;

    if (lrcUrl) {
      // Reset lyrics cũ để tránh hiện lời bài trước
      setParsedLyrics([]);

      // Gọi fetch để lấy nội dung file text
      fetch(lrcUrl)
        .then(response => response.text())
        .then(data => {
          const formattedLyrics = parseLRC(data);
          setParsedLyrics(formattedLyrics);
        })
        .catch(err => console.error("Lỗi tải lyrics:", err));
    } else {
      setParsedLyrics([]); // Bài nào không có link thì xóa lời
    }
  }, [currentSongIndex]);

  const prevSong = useCallback(() => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;

      // Update thanh tiến trình (Logic cũ)
      if (!isNaN(total)) {
        setProgress((current / total) * 100);
      }

      // --- LOGIC MỚI: TÌM CÂU HÁT HIỆN TẠI ---
      const lyrics = songs[currentSongIndex].lrcUrl ? parsedLyrics : null;
      if (lyrics) {

        let activeIdx = -1;
        for (let i = 0; i < lyrics.length; i++) {
          if (lyrics[i].time <= current) {
            activeIdx = i;
          } else {
            break;
          }
        }

        // SỬA LỖI: Chỉ set state khi index thay đổi (Tránh re-render liên tục gây giật)
        if (activeIdx !== activeLyricIndex) {
          setActiveLyricIndex(activeIdx);
        }
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
            <div className="flex gap-2 relative">
              <button className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                <Heart size={20} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
                title="Chia sẻ"
              >
                <Share2 size={20} />
              </button>

              {/* SỬA Ở ĐÂY: Thêm 'whitespace-nowrap' */}
              {showToast && (
                <div className="absolute top-[-40px] right-0 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce whitespace-nowrap z-50">
                  Đã copy link!
                </div>
              )}
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
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-10">
            {/* Nút Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2 transition-all hover:scale-110 ${isShuffle ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-100'}`}
              title="Phát ngẫu nhiên"
            >
              <Shuffle size={20} />
            </button>

            <button
              onClick={prevSong}
              className="p-3 text-zinc-400 hover:text-zinc-100 transition-all hover:scale-110"
            >
              <SkipBack size={28} fill="currentColor" className="opacity-80" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 md:w-20 md:h-20 bg-zinc-100 text-zinc-950 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ?
                <Pause size={32} fill="currentColor" /> :
                <Play size={32} fill="currentColor" className="ml-1" />
              }
            </button>

            <button
              onClick={nextSong}
              className="p-3 text-zinc-400 hover:text-zinc-100 transition-all hover:scale-110"
            >
              <SkipForward size={28} fill="currentColor" className="opacity-80" />
            </button>

            {/* Nút Repeat */}
            <button
              onClick={toggleRepeat}
              className={`p-2 transition-all hover:scale-110 ${repeatMode !== 'none' ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-100'} relative`}
              title="Lặp lại"
            >
              <Repeat size={20} />
              {/* Hiển thị số 1 nhỏ xíu nếu đang là repeat one */}
              {repeatMode === 'one' && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-green mt-[1px]">1</span>
              )}
            </button>
          </div>

          {/* Volume and Actions */}
          <div className="flex items-center gap-4 mb-6">
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
          {/* --- KHU VỰC HIỂN THỊ LYRICS MỚI --- */}
          {parsedLyrics.length > 0 ? (
            // Thêm 'relative' vào className
            <div className="w-full h-32 md:h-40 bg-black/20 rounded-2xl p-4 overflow-y-auto scroll-smooth no-scrollbar mask-gradient relative" ref={lyricsContainerRef}>
              <div className="space-y-4 text-center">
                {parsedLyrics.map((line, index) => (
                  <p
                    key={index}
                    className={`transition-all duration-500 ease-out cursor-pointer ${index === activeLyricIndex
                      ? 'text-white font-bold text-lg scale-105 opacity-100' // Câu đang hát
                      : 'text-zinc-500 text-sm opacity-60 hover:opacity-80'   // Câu chưa/đã hát
                      }`}
                    onClick={() => {
                      // Tính năng bonus: Bấm vào lời để tua nhạc đến đoạn đó
                      if (audioRef.current) {
                        audioRef.current.currentTime = line.time;
                        audioRef.current.play();
                        setIsPlaying(true);
                      }
                    }}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            // Nếu bài nào chưa có lời thì hiện thông báo chờ
            <div className="w-full h-20 flex items-center justify-center text-zinc-600 text-xs uppercase tracking-widest opacity-50">
              Lyrics coming soon...
            </div>
          )}
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
