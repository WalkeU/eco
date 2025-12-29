#!/bin/bash
# Build production images and save to .tar files

echo "🔨 Building production images..."

# Build frontend
echo "Building frontend..."
docker build -t eco-frontend:latest -f frontend/Dockerfile frontend

# Build backend
echo "Building backend..."
docker build -t eco-backend:latest -f backend/Dockerfile backend


echo ""
echo "💾 Saving images to .tar files..."

# Save images
docker save eco-frontend:latest -o eco-frontend.tar
docker save eco-backend:latest -o eco-backend.tar

# Extra step for MariaDB (commented out)
# echo "Pulling MariaDB..."
# docker pull mariadb:11
# docker save mariadb:11 -o mariadb.tar

echo ""
echo "✅ Done! Images saved:"
ls -lh *.tar

echo ""
echo "📦 Files ready for deployment:"
echo "  - eco-frontend.tar"
echo "  - eco-backend.tar"
echo "  - docker-compose.prod.yml"
echo "  - .env (create on target server)"
echo ""
echo "Note: MariaDB will be pulled directly on the server"
