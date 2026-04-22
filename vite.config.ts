import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      legacy({
        targets: ['ios >= 4.2', 'safari >= 4', 'ie >= 8'],
        renderLegacyChunks: true,
        // Exclude fetch polyfill as we use XMLHttpRequest specifically for compatibility
        // and reassigning window.fetch can cause errors in some restricted environments
        polyfills: [
          'es.array.from',
          'es.array.iterator',
          'es.array.find',
          'es.array.fill',
          'es.array.includes',
          'es.array.for-each',
          'es.array.filter',
          'es.array.map',
          'es.array.some',
          'es.array.every',
          'es.array.reduce',
          'es.array.reduce-right',
          'es.object.assign',
          'es.object.values',
          'es.object.entries',
          'es.object.keys',
          'es.object.get-own-property-descriptor',
          'es.object.get-own-property-descriptors',
          'es.object.define-property',
          'es.object.define-properties',
          'es.object.set-prototype-of',
          'es.object.create',
          'es.object.from-entries',
          'es.promise',
          'es.promise.finally',
          'es.symbol',
          'es.symbol.iterator',
          'es.symbol.description',
          'es.string.starts-with',
          'es.string.includes',
          'es.string.trim',
          'es.array.flat',
          'es.array.flat-map',
          'es.map',
          'es.set',
          'es.weak-map',
          'es.weak-set',
          'es.number.is-nan',
          'es.number.is-finite',
          'es.function.name',
          'es.function.bind',
          'web.dom-collections.for-each',
          'web.timers',
          'web.immediate',
        ],
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      target: 'es5',
      cssTarget: 'safari4',
      minify: 'terser',
      terserOptions: {
        ie8: true,
        safari10: true,
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
