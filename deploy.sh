#!/usr/bin/env bash
set -e

echo "=== Masters Pool 2026 — Deploy ==="

# Init git if needed
if [ ! -d .git ]; then
  git init
  git add -A
  git commit -m "Initial commit: Masters Pool 2026"
fi

# Create GitHub repo and push
echo "Creating GitHub repo..."
if ! gh repo view masters-pool-2026 &>/dev/null; then
  gh repo create masters-pool-2026 --public --source=. --push
else
  echo "Repo already exists — pushing..."
  git push origin main 2>/dev/null || git push -u origin main
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
if ! command -v vercel &>/dev/null; then
  echo "Installing Vercel CLI..."
  npm i -g vercel
fi

vercel --prod --yes

# Set environment variable
echo ""
echo "Setting OPENAI_API_KEY on Vercel..."
if [ -f .env.local ]; then
  OPENAI_KEY=$(grep OPENAI_API_KEY .env.local | cut -d= -f2)
  if [ "$OPENAI_KEY" != "your_key_here" ] && [ -n "$OPENAI_KEY" ]; then
    echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY production --yes 2>/dev/null || echo "Env var may already exist — update manually in Vercel dashboard if needed"
  else
    echo "WARNING: No valid OPENAI_API_KEY in .env.local — set it in Vercel dashboard"
  fi
fi

echo ""
echo "=== Deploy complete ==="
echo "Your live URL is printed above by Vercel."
