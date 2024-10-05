import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

export default ({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '../'));
  process.env = {...process.env, ...env};
  const serverUrl = process.env.VITE_SERVER_URL

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': serverUrl,
      },
    },
  })
}
