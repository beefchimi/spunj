import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'spunj',
      fileName: (format) => `spunj.${format}.js`,
    },
    minify: false,
  },
  plugins: [dts()],
});
