import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],

  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    // Target modern browsers only (smaller, faster output)
    target: ['es2020', 'chrome87', 'firefox78', 'safari14'],

    modulePreload: { polyfill: false }, // modern browsers don't need polyfill

    rollupOptions: {
      output: {
        // Granular manual chunk splitting for optimal caching
        manualChunks(id) {
          // Core React runtime — never changes
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // Router
          if (id.includes('react-router-dom')) return 'router';
          // Animation
          if (id.includes('framer-motion')) return 'framer';
          // Icons — large, but cache-stable
          if (id.includes('react-icons')) return 'icons';
          // Toast notifications
          if (id.includes('react-toastify') || id.includes('react-hot-toast')) return 'toasts';
          // HTTP
          if (id.includes('axios')) return 'axios';
          // Analytics — load last, non-critical
          if (id.includes('@vercel/analytics') || id.includes('@vercel/speed-insights')) return 'analytics';
          // All other node_modules go to vendor
          if (id.includes('node_modules')) return 'vendor';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Separate font files into their own folder for cache control
          if (/\.(woff2?|ttf|otf|eot)$/.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash].[ext]';
          }
          // Keep images identifiable
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/.test(assetInfo.name || '')) {
            return 'assets/img/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },

    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,          // Two-pass optimization
        unsafe_arrows: true,
        unsafe_methods: true,
      },
      mangle: { safari10: true },
      format: { comments: false },
    },

    // Warn only for very large chunks
    chunkSizeWarningLimit: 600,

    // Inline tiny assets (<4 KB) as base64 — saves HTTP requests
    assetsInlineLimit: 4096,
  },

  server: {
    historyApiFallback: true,
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'axios', 'framer-motion', 'react-icons/fi',
      'react-toastify',
    ],
  },
})
