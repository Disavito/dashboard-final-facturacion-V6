import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Crea chunks separados para las dependencias más grandes
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'vendor_recharts';
            }
            if (id.includes('@tanstack/react-table')) {
              return 'vendor_react-table';
            }
            if (id.includes('react-router-dom') || id.includes('react-router')) {
              return 'vendor_react-router';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor_react';
            }
             if (id.includes('@supabase')) {
              return 'vendor_supabase';
            }
            // Agrupa el resto de vendors en un chunk genérico
            return 'vendor';
          }
        },
      },
    },
  },
})
