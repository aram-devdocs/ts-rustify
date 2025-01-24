#!/bin/bash
# Build Rust
cargo build --release

# Build TypeScript
npx tsc

# Copy worker.js to dist
cp dist/worker.js dist/ 