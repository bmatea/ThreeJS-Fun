import images from '@rollup-plugin-image-files';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'js/app.js',
  output: {
    folder: 'build',
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [commonjs(),
            images()]
};