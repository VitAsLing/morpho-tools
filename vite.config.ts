import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import obfuscatorPlugin from 'vite-plugin-bundle-obfuscator'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    mode === 'production' && obfuscatorPlugin({
      enable: true,
      log: true,
      autoExcludeNodeModules: true,
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: false,
        shuffleStringArray: true,
        splitStrings: false,
        stringArray: true,
        stringArrayEncoding: ['none'],
        stringArrayThreshold: 0.5,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      },
    }),
  ].filter(Boolean),
  build: {
    outDir: 'dist',
    // Production security settings
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        // Obfuscate chunk names in production
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          'query-vendor': ['@tanstack/react-query', 'graphql', 'graphql-request'],
        },
      },
    },
  },
  esbuild: {
    // Remove console and debugger in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Security headers for dev server
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
}))
