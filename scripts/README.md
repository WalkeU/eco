# Deployment Scripts

Ez a mappa deployment script-eket tartalmaz bash és PowerShell verzióban.

## 📦 1. Build Images (Fejlesztői gépen)

**Bash:**

```bash
chmod +x scripts/build-images.sh
./scripts/build-images.sh
```

**PowerShell:**

```powershell
.\scripts\build-images.ps1
```

**Mit csinál:**

- Build-eli a frontend és backend production image-eket
- Letölti a MariaDB image-et
- Menti őket .tar fájlokba
- Létrehozza: `todo-frontend.tar`, `todo-backend.tar`, `mariadb.tar`

---

## 📤 2. Copy to Server (Fájlok átmásolása szerverre)

**Bash:**

```bash
chmod +x scripts/copy-to-server.sh
./scripts/copy-to-server.sh
```

**PowerShell:**

```powershell
.\scripts\copy-to-server.ps1
```

**Mit csinál:**

- Ellenőrzi, hogy léteznek-e a .tar fájlok
- Létrehozza a célmappát a szerveren: `/home/piros/apps/eco`
- SCP-vel átmásolja:
  - `todo-frontend.tar`
  - `todo-backend.tar`
  - `mariadb.tar`
  - `docker-compose.prod.yml`
  - `.env.prod` → `.env` néven
  - `scripts/` mappa

**Konfiguráció:** Szerkeszd a script elejét ha más szerver/mappa kell:

```bash
SERVER_USER="piros"
SERVER_IP="192.168.0.142"
SERVER_PATH="/home/piros/apps/eco"
```

---

## 🚀 3. Fresh Install (Célszerveren - ELSŐ telepítés)

**Bash:**

```bash
chmod +x scripts/deploy-fresh.sh
./scripts/deploy-fresh.sh
```

**PowerShell:**

```powershell
.\scripts\deploy-fresh.ps1
```

**Mikor használd:**

- ✅ Első telepítés
- ✅ Teljes reset kell (töröld az összes adatot)
- ⚠️ **FIGYELEM:** Törli a DB volume-ot, minden adat elvész!

**Mit csinál:**

- `docker-compose down -v` - Törli a konténereket ÉS volume-okat
- Betölti az image-eket
- Elindítja a szolgáltatásokat tiszta állapotban

---

## 🔄 4. Update Deploy (Célszerveren - FRISSÍTÉS)

**Bash:**

```bash
chmod +x scripts/deploy-update.sh
./scripts/deploy-update.sh
```

**PowerShell:**

```powershell
.\scripts\deploy-update.ps1
```

**Mikor használd:**

- ✅ Alkalmazás frissítés
- ✅ Új funkció deploy
- ✅ Bug fix
- ✅ **DB adatok MEGMARADNAK**

**Mit csinál:**

- `docker-compose down` - Törli a konténereket, DE volume-ok megmaradnak
- Betölti az ÚJ frontend és backend image-eket
- NEM tölti be újra a MariaDB-t (meglévőt használja)
- Elindítja a frissített szolgáltatásokat

---

## 📋 Deployment Workflow

### Fejlesztői gépen:

```bash
# 1. Build images
./scripts/build-images.sh

# 2. Másold át a szerverre
./scripts/copy-to-server.sh
```

### Célszerveren (első alkalommal):

```bash
# 3. Fresh install
./scripts/deploy-fresh.sh
```

### Célszerveren (frissítésnél):

```bash
# 3. Update (DB adatok megmaradnak)
./scripts/deploy-update.sh
```

---

## 🔍 Hasznos parancsok

```bash
# Szolgáltatások állapota
docker-compose -f docker-compose.prod.yml ps

# Logok nézése
docker logs todo-frontend-prod
docker logs todo-backend-prod
docker logs todo-mariadb-prod

# Leállítás (adatok megmaradnak)
docker-compose -f docker-compose.prod.yml down

# Leállítás + adatok törlése
docker-compose -f docker-compose.prod.yml down -v

# Image-ek listázása
docker images | grep todo
```

---

## ⚠️ Fontos megjegyzések

1. **Fresh install törli az összes adatot!** Csak akkor használd, ha biztos vagy benne.
2. **Update megőrzi a DB adatokat**, de ajánlott backup készítése előtte.
3. Győződj meg róla, hogy a `.env` fájl a célszerveren megfelelően van beállítva.
4. Windows-on használd a `.ps1`, Linux/Mac-en a `.sh` fájlokat.

---

## 🗄️ Adatbázis backup (ajánlott update előtt)

```bash
# Backup
docker exec todo-mariadb-prod mysqldump -u root -ppassword todo_db > backup.sql

# Restore (ha kell)
docker exec -i todo-mariadb-prod mysql -u root -ppassword todo_db < backup.sql
```
