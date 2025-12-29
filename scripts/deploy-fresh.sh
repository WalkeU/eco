#!/bin/bash
# FRESH INSTALL - First deployment or complete reset
# WARNING: This will DELETE all database data!

echo "🚀 Fresh Install - This will create a new installation"
echo "⚠️  WARNING: This will DELETE ALL existing data!"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🛑 Stopping and removing existing containers and volumes..."
docker compose -f docker-compose.prod.yml down -v

echo ""
echo "📥 Loading images from .tar files..."
docker load -i eco-frontend.tar
docker load -i eco-backend.tar
docker load -i mariadb.tar

echo ""
echo "🚀 Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "📊 Service status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Fresh installation complete!"
echo "🌐 Application: http://localhost"
echo ""
echo "📝 Check logs:"
echo "  docker logs eco-frontend-prod"
echo "  docker logs eco-backend-prod"
echo "  docker logs eco-mariadb-prod"
