// src/types.ts
export interface LyricLine {
  time: number;
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration?: string;
  lrcUrl?: string; // <-- Đổi từ lyrics[] thành đường dẫn file .lrc
}

export interface PlayerState {
  isPlaying: boolean;
  currentSongIndex: number;
  progress: number;
  duration: number;
  volume: number;
}
