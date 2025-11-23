import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    strictPort: false, // Allow Vite to use next available port if 5174 is busy
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production (smaller build)
    minify: 'esbuild', // Fast minification
    cssMinify: true, // Minify CSS
    chunkSizeWarningLimit: 1000, // Warn if chunk exceeds 1MB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor chunks for better caching
          if (!id.includes('node_modules')) return undefined;
          
          // React and React DOM
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Stripe libraries
          if (id.includes('@stripe')) {
            return 'stripe-vendor';
          }
          
          // Three.js and Vanta (3D graphics)
          if (id.includes('three') || id.includes('vanta')) {
            return 'graphics-vendor';
          }
          
          // Other large dependencies
          if (id.includes('axios') || id.includes('react-router')) {
            return 'utils-vendor';
          }
          
          // Default vendor chunk
          return 'vendor';
        },
        // Optimize chunk file names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Production optimizations
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@stripe/stripe-js', '@stripe/react-stripe-js']
  }
})
