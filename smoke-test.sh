#!/bin/bash

API_URL="https://survey-platform-api.nazeersoft.workers.dev"
FRONTEND_URL="https://survey-platform-web.pages.dev"

echo "🧪 Survey Platform - Smoke Tests"
echo "================================"
echo ""

# Test 1: API Health
echo "1. API Health Check..."
curl -s "$API_URL/api/health" | grep -q "ok" && echo "✅ PASS" || echo "❌ FAIL"

# Test 2: Admin Login
echo "2. Admin Login..."
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.org","password":"ChangeMe123!"}')
echo "$LOGIN" | grep -q "token" && echo "✅ PASS" || echo "❌ FAIL"

# Test 3: Invalid Login
echo "3. Invalid Credentials Protection..."
curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.org","password":"wrong"}' | grep -q "Unauthorized" && echo "✅ PASS" || echo "❌ FAIL"

# Test 4: Signup
echo "4. User Signup..."
TEST_EMAIL="test-$(date +%s)@example.org"
SIGNUP=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\",\"name\":\"Test\",\"role\":\"analyst\"}")
echo "$SIGNUP" | grep -q "token" && echo "✅ PASS" || echo "❌ FAIL"

# Test 5: Frontend
echo "5. Frontend Status..."
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$FRONTEND_URL" | grep -q "200\|301\|302" && echo "✅ PASS (deploying)" || echo "⏳ Still deploying"

echo ""
echo "================================"
echo "Frontend: $FRONTEND_URL"
echo "Login: admin@example.org / ChangeMe123!"
