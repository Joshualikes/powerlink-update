#!/bin/bash

echo "🚀 Setting up PowerLink Admin Dashboard..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Please create .env.local file with your database configuration"
    echo "📝 See .env.local template for required variables"
else
    echo "✅ Environment file found"
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your .env.local file with database credentials"
echo "2. Run your database scripts from the /scripts folder"
echo "3. Start development server with: pnpm dev"
echo ""
echo "🌐 Your app will be available at: http://localhost:3000"
