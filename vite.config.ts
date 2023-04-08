import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve:{
    alias:{
      '@assets' : path.resolve(__dirname, './src/assets'),
      '@atoms' : path.resolve(__dirname, './src/components/atoms'),
      '@common' : path.resolve(__dirname, './src/components/common'),
      '@drawers' : path.resolve(__dirname, './src/components/drawers'),
      '@nav' : path.resolve(__dirname, './src/components/nav'),
      '@pages' : path.resolve(__dirname, './src/components/pages'),
      '@modals' : path.resolve(__dirname, './src/components/modals'),
      '@constants' : path.resolve(__dirname, './src/constants'),
      '@contexts' : path.resolve(__dirname, './src/contexts'),
      '@utils' : path.resolve(__dirname, './src/utils'),
      '@auth' : path.resolve(__dirname, './src/auth'),
    },
  },
  plugins: [react()],
})
