import { resolve } from 'path'

export default {
  name: 'ts-rustify',
  targets: ['x64'],
  platform: process.platform,
  artifacts: ['index.node', 'index.d.ts'],
  binaryName: 'index',
  root: resolve(__dirname, '..'),
} 