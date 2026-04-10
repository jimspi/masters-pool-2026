#!/usr/bin/env bash
set -e

echo "=== Masters Pool 2026 — Setup ==="

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js 18+ required. Current: $(node -v 2>/dev/null || echo 'not installed')"
  exit 1
fi
echo "Node $(node -v) — OK"

# Check GitHub CLI
if ! command -v gh &>/dev/null; then
  echo "WARNING: GitHub CLI (gh) not found — deploy.sh will not work"
else
  echo "GitHub CLI — OK"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup env
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo ""
  echo "Created .env.local from template."
  read -p "Enter your OpenAI API key (or press Enter to skip): " OPENAI_KEY
  if [ -n "$OPENAI_KEY" ]; then
    sed -i "s/your_key_here/$OPENAI_KEY/" .env.local
    echo "API key saved to .env.local"
  else
    echo "Skipped — edit .env.local later to add your key"
  fi
else
  echo ".env.local already exists — skipping"
fi

echo ""
echo "=== Setup complete ==="
echo "Run: npm run dev"
echo "Open: http://localhost:3000"
