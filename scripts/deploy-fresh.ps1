# PowerShell script
# FRESH INSTALL - First deployment or complete reset
# WARNING: This will DELETE all database data!

Write-Host "[FRESH INSTALL] This will create a new installation" -ForegroundColor Cyan
Write-Host "WARNING: This will DELETE ALL existing data!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Are you sure? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "[CANCELLED]" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[STOP] Stopping and removing existing containers and volumes..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml down -v

Write-Host ""
Write-Host "[LOAD] Loading images from .tar files..." -ForegroundColor Cyan
docker load -i eco-frontend.tar
docker load -i eco-backend.tar
docker load -i mariadb.tar

Write-Host ""
Write-Host "[START] Starting services..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml up -d

Write-Host ""
Write-Host "[WAIT] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[STATUS] Service status:" -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "[SUCCESS] Fresh installation complete!" -ForegroundColor Green
Write-Host "Application: http://localhost" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check logs:" -ForegroundColor Yellow
Write-Host "  docker logs eco-frontend-prod"
Write-Host "  docker logs eco-backend-prod"
Write-Host "  docker logs eco-mariadb-prod"
