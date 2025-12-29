#!/bin/bash
# UPDATE DEPLOYMENT - Updates app while keeping database data
# Database data will be PRESERVED

echo "🔄 Update Deployment - Keeping database data"
echo ""

echo "🛑 Stopping existing containers (keeping volumes)..."
docker compose -f docker-compose.prod.yml down

echo ""
echo "📥 Loading new images from .tar files..."
docker load -i eco-frontend.tar
docker load -i eco-backend.tar
# Note: Not loading mariadb.tar - using existing DB

echo ""
echo "🚀 Starting services with existing data..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "📊 Service status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Update complete! Database data preserved."
echo "🌐 Application: http://localhost"
echo ""
echo "📝 Check logs:"
echo "  docker logs eco-frontend-prod"
echo "  docker logs eco-backend-prod"
echo "  docker logs eco-mariadb-prod"
