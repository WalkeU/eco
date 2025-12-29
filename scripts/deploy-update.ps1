# PowerShell script
# UPDATE DEPLOYMENT - Updates app while keeping database data
# Database data will be PRESERVED

Write-Host "[UPDATE] Update Deployment - Keeping database data" -ForegroundColor Cyan
Write-Host ""

Write-Host "[STOP] Stopping existing containers (keeping volumes)..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml down

Write-Host ""
Write-Host "[LOAD] Loading new images from .tar files..." -ForegroundColor Cyan
docker load -i eco-frontend.tar
docker load -i eco-backend.tar
# Note: Not loading mariadb.tar - using existing DB

Write-Host ""
Write-Host "[START] Starting services with existing data..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml up -d

Write-Host ""
Write-Host "[WAIT] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[STATUS] Service status:" -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "[SUCCESS] Update complete! Database data preserved." -ForegroundColor Green
Write-Host "Application: http://localhost" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check logs:" -ForegroundColor Yellow
Write-Host "  docker logs eco-frontend-prod"
Write-Host "  docker logs eco-backend-prod"
Write-Host "  docker logs eco-mariadb-prod"
