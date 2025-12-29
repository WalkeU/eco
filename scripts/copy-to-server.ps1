# PowerShell script
# Copy deployment files to Ubuntu server via SCP

$SERVER_USER = "piros"
$SERVER_IP = "192.168.0.142"
$SERVER_PATH = "/home/piros/apps/eco"
$SERVER = "${SERVER_USER}@${SERVER_IP}"

Write-Host "[COPY] Copying files to $SERVER..." -ForegroundColor Cyan
Write-Host ""

# Check if .tar files exist
if (-not (Test-Path "eco-frontend.tar")) {
    Write-Host "[ERROR] eco-frontend.tar not found! Run build-images.ps1 first." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "eco-backend.tar")) {
    Write-Host "[ERROR] eco-backend.tar not found! Run build-images.ps1 first." -ForegroundColor Red
    exit 1
}

# MariaDB will be pulled directly on server
# if (-not (Test-Path "mariadb.tar")) {
#     Write-Host "[ERROR] mariadb.tar not found! Run build-images.ps1 first." -ForegroundColor Red
#     exit 1
# }

Write-Host "[INFO] Creating remote directory..." -ForegroundColor Yellow
ssh ${SERVER} "mkdir -p ${SERVER_PATH}"

Write-Host ""
Write-Host "[1/5] Copying eco-frontend.tar..." -ForegroundColor Yellow
scp eco-frontend.tar "${SERVER}:${SERVER_PATH}/"

Write-Host "[2/5] Copying eco-backend.tar..." -ForegroundColor Yellow
scp eco-backend.tar "${SERVER}:${SERVER_PATH}/"

Write-Host "[3/5] Copying docker-compose.prod.yml..." -ForegroundColor Yellow
scp docker-compose.prod.yml "${SERVER}:${SERVER_PATH}/"

Write-Host "[4/5] Copying .env.prod as .env..." -ForegroundColor Yellow
scp .env.prod "${SERVER}:${SERVER_PATH}/.env"

Write-Host "[5/5] Copying scripts folder..." -ForegroundColor Yellow
scp -r scripts "${SERVER}:${SERVER_PATH}/"

# Write-Host "[EXTRA] Copying mariadb.tar..." -ForegroundColor Yellow
# scp mariadb.tar "${SERVER}:${SERVER_PATH}/"

Write-Host ""
Write-Host "[SUCCESS] All files copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps on the server:" -ForegroundColor Cyan
Write-Host "  ssh ${SERVER}"
Write-Host "  cd ${SERVER_PATH}"
Write-Host "  chmod +x scripts/*.sh"
Write-Host "  ./scripts/deploy-fresh.sh"
