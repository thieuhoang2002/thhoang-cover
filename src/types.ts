
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSongIndex: number;
  progress: number;
  duration: number;
  volume: number;
}
