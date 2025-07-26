import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import cdn from 'vite-plugin-cdn-import';

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      publicPath: 'vs',
    }),
    cdn({
      modules: [
        {
          name: 'mermaid',
          var: 'mermaid',
          path: 'dist/mermaid.min.js',
        },
        {
          name: '@supabase/supabase-js',
          var: 'supabase',
          path: 'dist/umd/supabase.min.js',
        },
        {
          name: 'svg2roughjs',
          var: 'svg2roughjs',
          path: 'dist/svg2roughjs.umd.min.js',
        },
      ],
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  define: {
    'process.env': {},
  },
  worker: {
    format: 'es',
  },
});
