import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunks for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-progress'
          ],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
          'icons': ['lucide-react'],
          'editor': ['react-quill'],
          'charts': ['recharts'],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns'],
          // Bible and AI components (separate chunks for code splitting)
          'bible-components': [
            './src/components/EnhancedAIChat',
            './src/components/AIAnalysis',
            './src/lib/ai-bible-system'
          ],
                      'pages-main': [
              './src/pages/Home',
              './src/pages/Dashboard',
              './src/pages/Bible'
            ],
          'pages-features': [
            './src/pages/Journal',
            './src/pages/Sermons'
          ]
        }
      }
    },
    // Set chunk size warning limit (temporary while optimizing)
    chunkSizeWarningLimit: 800,
    // Enable minification
    minify: 'esbuild',
    // Enable source maps for production debugging (can be disabled for smaller builds)
    sourcemap: mode !== 'production',
    // Optimize CSS
    cssMinify: true,
    // Target modern browsers for smaller bundle
    target: 'es2020'
  },
  // Performance optimizations
  esbuild: {
    // Remove console logs in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  }
}));
