import { Song } from './types';

export const songs: Song[] = [
  {
    id: '1',
    title: 'Anh Vẫn Như Vậy',
    artist: 'thhoang cover',
    coverUrl: 'https://picsum.photos/seed/cover1/600/600', // Ảnh bìa ngẫu nhiên
    audioUrl: 'music/anh-van-nhu-vay.wav',
    duration: '02:02' // Thời gian ước lượng, code sẽ tự cập nhật khi phát
  },
  {
    id: '2',
    title: 'Bản Nhạc Cuối Cho Em',
    artist: 'thhoang cover',
    coverUrl: 'https://picsum.photos/seed/cover2/600/600',
    audioUrl: 'music/ban-nhac-cuoi-cho-em.wav',
    duration: '03:13'
  },
  {
    id: '3',
    title: 'Chẳng Phải Tình Đầu Sao Đau Đến Thế',
    artist: 'thhoang cover',
    coverUrl: 'https://picsum.photos/seed/cover3/600/600',
    audioUrl: 'music/chang-phai-tinh-dau-sao-dau-den-the.wav',
    duration: '01:16'
  },
  {
    id: '4',
    title: 'Đom Đóm',
    artist: 'thhoang cover',
    coverUrl: 'https://picsum.photos/seed/cover4/600/600',
    audioUrl: 'music/dom-dom.wav',
    duration: '00:23'
  },
  {
    id: '5',
    title: 'Feel At Home',
    artist: 'thhoang cover',
    coverUrl: 'https://picsum.photos/seed/cover5/600/600',
    audioUrl: 'music/feel-at-home.wav',
    duration: '01:53'
  },
  {
    id: '6',
    title: 'Hoa Vô Sắc',
    artist: 'thhoang cover',
    coverUrl: 'https://picsum.photos/seed/cover6/600/600',
    audioUrl: 'music/hoa-vo-sac.wav',
    duration: '00:50'
  },
  {
    id: '7',
    title: 'Nợ Lòng Đồng Ý', // Mình đoán tên bài từ tên file
    artist: 'thhoang cover',
    coverUrl: 'https://picsum.photos/seed/cover7/600/600',
    audioUrl: 'music/no-long-dong-y.wav',
    duration: '00:36'
  },
  {
    id: '8',
    title: 'Vùng An Toàn',
    artist: 'thhoang cover',
    coverUrl: 'https://picsum.photos/seed/cover8/600/600',
    audioUrl: 'music/vung-an-toan.wav',
    duration: '00:51'
  }
];