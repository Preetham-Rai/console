#!/usr/bin/env bash
# start.sh — starts all microservices and the Go API gateway
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "═══════════════════════════════════════════════"
echo "  Microservices Startup"
echo "═══════════════════════════════════════════════"

# ── Install Node.js dependencies ─────────────────────────────────────────────
for svc in user-service; do
  dir="$ROOT/services/$svc"
  if [ ! -d "$dir/node_modules" ]; then
    echo "► Installing deps for $svc..."
    (cd "$dir" && npm install --silent)
  fi
done

# ── Install Go dependencies ───────────────────────────────────────────────────
echo "► Tidying Go modules..."
(cd "$ROOT/gateway" && go mod tidy)

# ── Launch Node.js services in background ─────────────────────────────────────
echo ""
echo "► Starting Node.js services..."
node "$ROOT/services/user-service/index.js"    &  USER_PID=$!
# node "$ROOT/services/product-service/index.js" &  PRODUCT_PID=$!
# node "$ROOT/services/order-service/index.js"   &  ORDER_PID=$!

echo "  user-service    PID=$USER_PID"
# echo "  product-service PID=$PRODUCT_PID"
# echo "  order-service   PID=$ORDER_PID"

# Give services a moment to bind their ports
sleep 1

# ── Launch Go gateway ─────────────────────────────────────────────────────────
echo ""
echo "► Starting Go API Gateway..."
(cd "$ROOT/gateway" && go run . -config ../config.yaml) &
GATEWAY_PID=$!
echo "  gateway         PID=$GATEWAY_PID"

echo ""
echo "═══════════════════════════════════════════════"
echo "  All services running!"
echo ""
echo "  Gateway   → http://localhost:8080"
echo "  Users     → http://localhost:8080/users"
# echo "  Products  → http://localhost:8080/products"
# echo "  Orders    → http://localhost:8080/orders"
echo "  Health    → http://localhost:8080/health"
echo "  Routes    → http://localhost:8080/routes"
echo "═══════════════════════════════════════════════"
echo ""
echo "  Press Ctrl+C to stop everything."
echo ""

# ── Graceful teardown on Ctrl+C ───────────────────────────────────────────────
cleanup() {
  echo ""
  echo "► Shutting down..."
  kill $USER_PID $PRODUCT_PID $ORDER_PID $GATEWAY_PID 2>/dev/null || true
  wait 2>/dev/null
  echo "  All processes stopped."
}
trap cleanup INT TERM

# Keep script alive waiting for background processes
wait