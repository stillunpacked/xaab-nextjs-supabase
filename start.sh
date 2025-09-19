#!/bin/bash

echo "🚀 Starting XAAB Website..."

# Navigate to project directory
cd /Users/ranit/develop/codes/My_websites/xaab

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Start the Next.js development server
echo "🌐 Starting Next.js server on port 3000..."
npm run dev &

# Wait a moment for Next.js to start
sleep 3

# Start the backend server
echo "🖥️ Starting backend server on port 5000..."
npm run server &

echo "✅ XAAB Website is now running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🖥️ Backend: http://localhost:5000"
echo "📊 API Health: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
