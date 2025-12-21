import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Dòng này phải chuẩn như cũ

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    base: '/', // Mặc định chạy trên máy tính (localhost)
    server: {
      port: 3000, // Giữ lại port 3000 quen thuộc của bạn
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    }
  };

  // Logic thông minh: Nếu lệnh chạy KHÔNG phải là 'serve' (tức là lệnh build)
  // thì mới đổi đường dẫn thành tên repo để up lên Github
  if (command !== 'serve') {
    config.base = '/thhoang-cover/';
  }

  return config;
});