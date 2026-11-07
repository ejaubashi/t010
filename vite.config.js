import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base: './', plugins:[react()],server:{hmr:{port:Number(process.env.PORT || 3000)+21678}}});
