#!/bin/bash
# 로컬에서 배포환경과 동일한 Docker 테스트

echo "🐳 Building Docker image locally..."
docker build -t patrol-test .

echo "🚀 Running container on port 3001..."
docker run -d \
  --name patrol-test \
  --rm \
  -p 3001:3000 \
  -e NODE_ENV=production \
  -e DATABASE_HOST=localhost \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=postgres \
  -e DATABASE_NAME=patrol \
  -e JWT_SECRET=your-test-secret-key-32-characters-long \
  -e ADMIN_EMAIL=admin@test.com \
  -e ADMIN_PASSWORD=testpassword \
  -e ADMIN_NICKNAME=TestAdmin \
  -e BASE_URL=http://localhost:3001 \
  -e FRONTEND_URL=http://localhost:3001 \
  patrol-test

echo "✅ Test server running at http://localhost:3001"
echo "🔍 To see logs: docker logs -f patrol-test"
echo "🛑 To stop: docker stop patrol-test"