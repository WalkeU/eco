# Backend architecture plan — SQLite3 (kezdeti terv)

Ez a dokumentum egy kezdeti, ipari szabványokat követő architektúra-tervet ír le egy egyszerű Node.js/Express backendhez, ami SQLite3-at használ adatbázisként. A cél: felhasználók kezelése (regisztráció, belépés) és grafok tárolása (node-ok + edge-ek), valamint a szükséges API-hívások megtervezése. Ez egy terv — nem futtatható kód.

## Célok

- Egyszerű, jól strukturált backend, amely: felhasználókat kezel (create/login), grafokat eltárol, lekérdez, frissít.
- SQLite3 használata egyszerűsített telepítéshez.
- REST API, JSON payloadokkal. Hitelesítés: JWT.

## High-level architektúra

- HTTP API (Express)
- Adatbázis: SQLite3 fájl (`data/db.sqlite3`)
- Rétegek:
  - `routes/` — endpoint definíciók
  - `controllers/` — kérés-feldolgozás logikája
  - `services/` — üzleti logika, DB hívások
  - `db/` — DB connection, migrációs SQL
  - `middlewares/` — auth, validáció, error handling
  - `models/` (opcionális) — SQL lekérdezéseket összegző wrapper

## Ajánlott csomagok

- runtime: `express`, `sqlite3` vagy `better-sqlite3` (szinkron, egyszerű) vagy `knex` (query builder + migrációk)
- auth: `bcrypt` (jelszó hash), `jsonwebtoken` (JWT)
- validáció: `express-validator` vagy `joi`
- segéd: `dotenv`, `helmet`, `cors`, `morgan`

Példa package.json dev/cmds: `start`, `dev` (nodemon), `migrate` (knex/migration), `seed`.

## DB tervezés (SQL)

Megfontolás: normalizált séma (külön `nodes` és `edges` tábla) jobb query-khez és részleges frissítésekhez. Alternatív megoldás: `graphs` táblában JSON mezők `nodes`/`edges`, egyszerűbb, de kevésbé rugalmas.

Példa SQL (SQLite kompatibilis):

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE graphs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  graph_id INTEGER NOT NULL,
  client_id TEXT, -- eredeti frontend id, opcionális
  label TEXT,
  x REAL,
  y REAL,
  icon TEXT,
  data TEXT, -- JSON string a többi mezőhöz
  FOREIGN KEY (graph_id) REFERENCES graphs(id) ON DELETE CASCADE
);

CREATE TABLE edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  graph_id INTEGER NOT NULL,
  from_node_id INTEGER NOT NULL,
  to_node_id INTEGER NOT NULL,
  data TEXT, -- JSON string a többi mezőhöz
  FOREIGN KEY (graph_id) REFERENCES graphs(id) ON DELETE CASCADE,
  FOREIGN KEY (from_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (to_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- Indexek javasoltak
CREATE INDEX idx_graphs_created_by ON graphs(created_by);
CREATE INDEX idx_nodes_graph ON nodes(graph_id);
CREATE INDEX idx_edges_graph ON edges(graph_id);
```

Megjegyzések:

- `data` oszlopok JSON stringként tárolnak extra mezőket (például `capacity`, `status`). Ha SQLite verzió támogatja, lehet `JSON` típus vagy JSON1 extension.
- Alternatíva: ha a frontend jelenleg ID-ként numerikusokat használ (például `1,2,3`), akkor a backend legyen képes translációra: frontend `client_id` mező megtartása, belső `id` autoincrement.

## Hitelesítés és jelszókezelés

- Jelszó: `bcrypt` (salt + hash) — soha ne tárolj plain text jelszót.
- Login válasza: `accessToken` (JWT) és opcionálisan `refreshToken`.
- JWT payload: `sub: userId`, `iat`, `exp` (pl. 1h). Titkos kulcs a `.env`-ben (`JWT_SECRET`).
- Middleware `auth` ellenőrzi a `Authorization: Bearer <token>` header-t.

## REST API (javasolt végpontok és payloadok)

Alap útvonal: `/api`

- POST `/api/users` — regisztráció

  - Request: { "username": "anna", "email": "a@b.c", "password": "..." }
  - Response: 201 { "id": 1, "username": "anna", "email": "a@b.c", "created_at": "..." }

- POST `/api/auth/login` — bejelentkezés

  - Request: { "username": "anna", "password": "..." } vagy email-alapú
  - Response: 200 { "accessToken": "...", "user": { "id": 1, "username": "anna" } }

- GET `/api/users/:id` — felhasználó lekérése (auth required vagy csak public adatok)

- POST `/api/graphs` — új graf létrehozása (auth required)

  - Request: {
    "name": "My Graph",
    "description": "...",
    "nodes": [ {"client_id": "1","label":"Factory", "x":200, "y":200, "icon":"...", "data": {...} }, ... ],
    "edges": [ {"from_client_id":"1","to_client_id":"2","data":{}} , ...]
    }
  - Response: 201 { "id": 10, "name": "My Graph", "created_at": "..." }

  Implementációs megjegyzés: Mappold be a `nodes`-t és `edges`-t tranzakcióban — először insert `graphs`, majd insert `nodes` és `edges` kapcsolatokkal.

- GET `/api/graphs` — lista (opcionális szűrés: created_by, page, limit)

  - Response: 200 [ { "id":1, "name":"...", "nodesCount": 5, ... } ]

- GET `/api/graphs/:id` — egy graf részletesen

  - Response: 200 { "id":1, "name":"...", "nodes": [...], "edges": [...] }

- PUT `/api/graphs/:id` — teljes frissítés vagy PATCH részleges frissítés

  - Request lehet teljes `nodes`+`edges` rekonstrukció (egyszerűbb), vagy külön végpontok `nodes` és `edges` frissítésére.

- DELETE `/api/graphs/:id` — törlés (auth + jogosultság ellenőrzés)

Opciók részletezése:

- Node/edge update stratégia: ha a frontend gyakran küld teljes állapotot, legegyszerűbb a PUT ami törli a régit és beinserteli az újat tranzakcióban. Ha finom update kell, készíts külön `PATCH /api/graphs/:id/nodes` és `/edges` végpontokat.

## Validáció és hibakezelés

- Mindig validáld a bemenetet (`express-validator` vagy `joi`).
- Hibaválaszok szabványosítva: { "error": { "code": "INVALID_INPUT", "message": "...", "details": {...} } }
- Status kódok: 400 (bad request), 401 (unauth), 403 (forbidden), 404 (not found), 500 (server error).

## SQLite specifikus megfontolások

- Használj WAL mode-ot (`PRAGMA journal_mode=WAL;`) jobb egyidejű olvasáshoz/íráshoz.
- Connection pooling korlátozott SQLite-nál — ha sok párhuzamos kérés várható, fontold meg PostgreSQL-re váltást.
- Használj tranzakciókat írásnál (`BEGIN; ... COMMIT;`) különösen graph + nodes + edges műveleteknél.

## Migrációk és seed-ek

- Javasolt használni `knex` migrációs rendszerét vagy egyszerű SQL fájlokat `db/migrations/*.sql` alatt.
- Seed példa: hozz létre egy admin usert és egy demo graph-ot JSON node/edge adatokkal.

## Projekt struktúra javaslat (backend/)

```
backend/
├─ src/
│  ├─ index.js           # app entry (Express setup)
│  ├─ config/            # env config, constants
│  ├─ db/                # db init, migrációs SQL, helper
│  ├─ routes/            # express route definitions
│  ├─ controllers/       # controllers (kérések kezelése)
│  ├─ services/          # üzleti logika, DB access
│  ├─ middlewares/       # auth, error handler, validation
│  ├─ models/            # optional: SQL wrappers
│  └─ utils/             # helper functions
├─ data/                 # sqlite fájl: db.sqlite3 (gitignore!)
├─ migrations/           # SQL migrációk vagy knex migrációs állományok
├─ seeds/                # seed JSON/SQL
└─ package.json
```

## Biztonság és best practice

- Soha ne commitáld a `data/db.sqlite3` fájlt a `git`-be (különösen éles adatokkal).
- Környezeti változók `.env`-ben (`JWT_SECRET`, `NODE_ENV`, `DB_PATH`).
- Használj `helmet` és `cors` megfelelő konfigurációt frontend originnel.
- Limitáld a jelszó és token élettartamokat, naplózd a bejelentkezési hibákat, és monitorozd a rate limit-et (pl. `express-rate-limit`).

## Kliens/front integráció (jegyzet)

- A frontend jelenleg `src/components/data/nodes.jsx` és `edges.jsx`-ben konstansként tárolja az adatokat.
- A backend API azt mondja: a frontend küldje el a `nodes` és `edges` tömböket a `POST /api/graphs`-nak. A backend visszaadja az új `graph.id`-t.
- A frontendnek érdemes megtartani `client_id` mezőt (string), amit a backend `nodes.client_id`-ként tárolhat, így könnyű a kapcsolat felépítése a POST során.

## Példa munkafolyamat (új graf létrehozása)

1. Felhasználó bejelentkezik → kap `accessToken`.
2. Frontend összeállítja `nodes` és `edges` tömböt, elküldi `POST /api/graphs` (Authorization header-rel).
3. Backend: transaction indítása
   - Insert `graphs` → `graph_id`
   - Insert minden `nodes` (kapcsolja `graph_id`-hez; visszatartja a `client_id`-t)
   - Insert minden `edges` — oldja fel `from_client_id`/`to_client_id` → belső node.id értékekre
   - Commit
4. Válasz: 201 + `graph.id`

## Következő lépések (javaslatok)

- A) Készítsem el a scaffold-ot (Express app + DB init + egyszerű `POST /api/users` és `POST /api/auth/login` implementáció), vagy
- B) Készítsem el csak a migrációs SQL + seed fájlokat, hogy a DB készen álljon, vagy
- C) Elég ez a terv, és szeretnél további részletes terveket (pl. E2E folyamat, CI, Dockerfile a backendhez).

Készen állok, hogy implementáljam a scaffoldot vagy a migrációs fájlokat — melyik opciót szeretnéd?

---

_Ez a fájl csak tervet tartalmaz — nincs benne futtatható kód. Ha szeretnéd, lépésenként leimplementálom a scaffoldot és a migrációkat._
