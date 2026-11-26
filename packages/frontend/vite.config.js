import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function serveBahanVideo() {
  const videoRoot = path.resolve(__dirname, '../../Bahan_Video')

  const middleware = (req, res, next) => {
    if (!req.url || !req.url.startsWith('/videos/')) {
      return next()
    }

    const relPath = decodeURIComponent(req.url.slice('/videos/'.length).split('?')[0])
    const filePath = path.resolve(videoRoot, relPath)

    if (!filePath.startsWith(videoRoot) || !fs.existsSync(filePath)) {
      res.statusCode = 404
      res.end('Not found')
      return
    }

    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = req.headers.range

    res.setHeader('Content-Type', 'video/mp4')
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Cache-Control', 'public, max-age=86400')

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = end - start + 1

      res.statusCode = 206
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`)
      res.setHeader('Content-Length', chunkSize)
      const stream = fs.createReadStream(filePath, { start, end })
      req.on('close', () => stream.destroy())
      stream.pipe(res)
    } else {
      res.statusCode = 200
      res.setHeader('Content-Length', fileSize)
      const stream = fs.createReadStream(filePath)
      req.on('close', () => stream.destroy())
      stream.pipe(res)
    }
  }

  return {
    name: 'serve-bahan-video',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), serveBahanVideo()],
  server: {
    host: true,
    allowedHosts: true,
  },
  optimizeDeps: {
    include: ['lucide-react', 'react-router-dom'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
