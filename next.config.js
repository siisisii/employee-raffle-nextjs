/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: 'dist',
  // อนุญาตให้เข้าถึงจาก IP อื่นได้
  allowedDevOrigins: ['172.17.165.89', 'localhost', '127.0.0.1'],
}

module.exports = nextConfig
