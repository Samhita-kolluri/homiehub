#!/bin/bash

# HomieHub Frontend Setup Script

echo "🏠 Setting up HomieHub Frontend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 You can now run the development server with:"
echo "   npm run dev"
echo ""
echo "📖 For more information, see README.md and QUICKSTART.md"
echo ""
echo "Happy coding! 🎉"
