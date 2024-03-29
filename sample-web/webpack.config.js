import { resolve } from 'path'

export default {
  entry: resolve(import.meta.dirname, 'src', 'index.js'),
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: resolve(import.meta.dirname, 'dist'),
  }
}
