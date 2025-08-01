#!/bin/bash
echo "🏗️ Building Fantasy Football Draft Assistant Desktop App"
echo "=================================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend first
echo "🌐 Building React frontend..."
cd ../src/frontend
npm install
npm run build
cd ../../electron-app

# Copy built frontend
echo "📋 Copying frontend build..."
rm -rf frontend
mkdir -p frontend
cp -r ../src/frontend/build frontend/

# Copy backend
echo "📋 Copying backend..."
rm -rf backend
cp -r ../src/backend backend

# Build Electron app
echo "🚀 Building Electron application..."
npm run dist

echo ""
echo "✅ Build completed!"
echo "📦 Check the 'dist' folder for your application"