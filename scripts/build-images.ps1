# PowerShell script
# Build production images and save to .tar files

Write-Host "[BUILD] Building production images..." -ForegroundColor Cyan

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
docker build -t eco-frontend:latest -f frontend/Dockerfile frontend

# Build backend
Write-Host "Building backend..." -ForegroundColor Yellow
docker build -t eco-backend:latest -f backend/Dockerfile backend


Write-Host ""
Write-Host "[SAVE] Saving images to .tar files..." -ForegroundColor Cyan

# Save images
docker save eco-frontend:latest -o eco-frontend.tar
docker save eco-backend:latest -o eco-backend.tar

# Extra step for MariaDB (commented out)
# Write-Host "Pulling MariaDB..." -ForegroundColor Yellow
# docker pull mariadb:11
# docker save mariadb:11 -o mariadb.tar

Write-Host ""
Write-Host "[DONE] Images saved successfully!" -ForegroundColor Green
Get-ChildItem *.tar | Format-Table Name, @{Label="Size (MB)"; Expression={[math]::Round($_.Length/1MB, 2)}}

Write-Host ""
Write-Host "[DEPLOY] Files ready for deployment:" -ForegroundColor Cyan
Write-Host "  - eco-frontend.tar"
Write-Host "  - eco-backend.tar"
Write-Host "  - docker-compose.prod.yml"
Write-Host "  - .env (create on target server)"
Write-Host ""
Write-Host "Note: MariaDB will be pulled directly on the server" -ForegroundColor Yellow
