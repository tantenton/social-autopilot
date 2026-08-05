#!/bin/bash
# Phase 3 Verification Script

echo "=== Phase 3 Verification ==="

# 1. Check platform connectors exist
echo "Checking platform connectors..."
for platform in instagram tiktok youtube facebook; do
  if [ -f "src/lib/platforms/$platform.ts" ]; then
    echo "✓ $platform.ts exists"
  else
    echo "✗ $platform.ts missing"
  fi
done

# 2. Check video generation
echo -e "\nChecking video generation..."
[ -f "src/lib/ai/generateVideo.ts" ] && echo "✓ generateVideo.ts exists" || echo "✗ generateVideo.ts missing"
[ -f "workers/jobs/generateVideo.ts" ] && echo "✓ generateVideo worker exists" || echo "✗ generateVideo worker missing"

# 3. Check A/B testing
echo -e "\nChecking A/B testing..."
[ -f "src/lib/ab-testing.ts" ] && echo "✓ ab-testing.ts exists" || echo "✗ ab-testing.ts missing"
[ -f "src/app/api/content/ab-test/route.ts" ] && echo "✓ ab-test API exists" || echo "✗ ab-test API missing"

# 4. Check GitHub releases
echo -e "\nChecking GitHub releases..."
gh release list | head -3

# 5. TypeCheck
echo -e "\nRunning typecheck..."
pnpm typecheck

echo -e "\n=== Verification Complete ==="
