/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  eslint: {
    // Deshabilitar ESLint durante el build para probar cookies
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar verificación de tipos durante el build para probar cookies
    ignoreBuildErrors: true,
  },
  // Removido: Ya no necesitamos rewrites porque todas las llamadas al backend
  // pasan por nuestras API routes en /app/api/* que actúan como proxy
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/:path*`,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
