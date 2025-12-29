#!/bin/bash
# Copy deployment files to Ubuntu server via SCP

SERVER_USER="piros"
SERVER_IP="192.168.0.142"
SERVER_PATH="/home/piros/apps/eco"
SERVER="${SERVER_USER}@${SERVER_IP}"
DEPLOY_DIR="deploy"

echo "[COPY] Preparing deployment package..."
echo ""

# Check if .tar files exist
if [ ! -f "eco-frontend.tar" ]; then
    echo "[ERROR] eco-frontend.tar not found! Run build-images.sh first."
    exit 1
fi

if [ ! -f "eco-backend.tar" ]; then
    echo "[ERROR] eco-backend.tar not found! Run build-images.sh first."
    exit 1
fi

# Create temporary deploy directory
echo "[INFO] Creating deploy directory..."
rm -rf ${DEPLOY_DIR}
mkdir -p ${DEPLOY_DIR}

# Copy all files to deploy directory
echo "[INFO] Copying files to deploy directory..."
cp eco-frontend.tar ${DEPLOY_DIR}/
cp eco-backend.tar ${DEPLOY_DIR}/
cp docker-compose.prod.yml ${DEPLOY_DIR}/
cp .env.prod ${DEPLOY_DIR}/.env
cp -r scripts ${DEPLOY_DIR}/

# Create remote directory and copy everything at once
echo "[INFO] Creating remote directory..."
ssh ${SERVER} "mkdir -p ${SERVER_PATH}"

echo ""
echo "[COPY] Copying deploy directory to server (one password prompt)..."
scp -r ${DEPLOY_DIR}/* "${SERVER}:${SERVER_PATH}/"

echo ""
echo "[CLEANUP] Removing local deploy directory..."
rm -rf ${DEPLOY_DIR}

echo ""
echo "[SUCCESS] All files copied successfully!"
echo ""
echo "Next steps on the server:"
echo "  ssh ${SERVER}"
echo "  cd ${SERVER_PATH}"
echo "  chmod +x scripts/*.sh"
echo "  ./scripts/deploy-fresh.sh"
