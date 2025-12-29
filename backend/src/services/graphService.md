## graphService.js — rövid dokumentáció

**Leírás**

- Ez a fájl egyszerű SQLite szolgáltatást biztosít gráfokhoz: `graphs`, `nodes`, `edges` táblák létrehozása, lekérdezése, beszúrása, frissítése és törlése a `better-sqlite3` használatával.

**Adatbázis sémák (ami itt létrejön)**

- `graphs`: `id`, `name`, `description`, `created_by`, `created_at`, `updated_at`
- `nodes`: `id`, `graph_id`, `client_id` (TEXT), `label`, `x`, `y`, `icon`, `data` (JSON text)
- `edges`: `id`, `graph_id`, `from_node_id`, `to_node_id`, `data` (JSON text)

Mindhárom táblahoz vannak `CREATE TABLE IF NOT EXISTS` parancsok a fájl elején, és a kapcsolatok `ON DELETE CASCADE`-szal vannak beállítva.

**Exportált függvények és használatuk**

- `createGraph(payload)`

  - Bemenet: `{ name, description?, nodes?: [], edges?: [], created_by }`
  - `nodes` elemek tipikus alakja: `{ client_id?, label?, x?, y?, icon?, data? }` (a `data` objektumot a service JSON-stringgé alakítja)
  - `edges` elemek tipikus alakja: `{ from_client_id? | from?, to_client_id? | to?, data? }`
  - Működés: tranzakcióban létrehozza a gráfot, beszúrja a node-okat és az éleket. A node-ok beszúrásakor egy `idMap`-et épít, ahol a kulcs a `client_id` (stringként). Az élek beszúrása ekkor a `idMap`-et használja a `from_node_id` / `to_node_id` feltöltéséhez.
  - Visszatér: a teljes gráf objektum (a `getGraphById` eredménye).

- `getGraphById(id)`

  - Bemenet: numerikus `id`
  - Visszatér: `{ id, name, description, created_by, created_at, updated_at, nodes: [...], edges: [...] }` vagy `null`. A `nodes.data` és `edges.data` JSON-parszolt objektumként kerül visszaadásra.

- `getRawGraph(id)`

  - Egyszerű `SELECT * FROM graphs WHERE id = ?` — metaadatok ellenőrzésére használatos (pl. jogosultságvizsgálathoz).

- `listGraphs({ created_by } = {})`

  - Ha `created_by` meg van adva, az adott felhasználó gráfjait adja vissza; különben minden gráfot listáz (metaadatok, nem tartalmaz nodes/edges tömböket).

- `updateGraph(id, payload)`

  - Bemenet: `id`, és `{ name, description, nodes?, edges? }`
  - Működés: tranzakcióban felülírja a gráfot: frissíti a metaadatokat, kitörli az adott gráf összes node/edge sorát, majd újból beszúrja a `nodes`-okat és `edges`-eket ugyanazzal a `client_id` alapú `idMap` logikával.
  - Fontos: a frissítés teljes felülírást végez — részleges frissítést nem csinál.

- `deleteGraph(id)`
  - Törli a `graphs` sort; a cascade miatt a kapcsolódó node-ok és élek is törlődnek.

**Fontos megjegyzések / tippek**

- A jelenlegi implementáció az élek összekötéséhez a node-ok `client_id` mezőjét használja kulcsként. Ha a frontend numerikus `id`-t ad meg (pl. `id: 1` a komponensben), akkor a frontendnek érdemes a `client_id` értéket is elküldeni, vagy a backend módosítása szükséges, hogy `n.id`-t is elfogadja `client_id` fallbackként.
- A backend most frissítve lett: automatikusan elfogadja a frontend `id` mezőjét is `client_id` helyett.
- Gyakorlatban ez azt jelenti, hogy a `nodes` lehetnek formában `{"id": 1, ...}` (vagy továbbra is `client_id`), és az `edges`-ben használhatod a `from`/`to` numerikus mezőket (pl. `{ from: 1, to: 2 }`) — a backend ezeket stringként kezeli belső `idMap` kulcsként és helyesen leképezi az adatbázis `from_node_id` / `to_node_id` értékeire.
- `data` mezőket a service `JSON.stringify`-vel menti, és `JSON.parse`-szal olvassa vissza — így tetszőleges kis JSON-objektum tárolható.
- `createGraph` és `updateGraph` tranzakciósan futnak: ha bármely beszúrás hibázik, az egész művelet rollbackel.

**Példa bemenet (frontendből küldhető JSON a `createGraph`-hoz)**

```json
{
  "name": "Példa gráf (frontend formátum)",
  "description": "nodes.jsx / edges.jsx alapján",
  "nodes": [
    { "id": 1, "label": "Factory", "x": 200, "y": 200, "data": { "type": "factory" } },
    { "id": 2, "label": "Solar Panel", "x": 500, "y": 200, "data": { "type": "solar" } },
    { "id": 3, "label": "Warehouse", "x": 350, "y": 400, "data": { "type": "warehouse" } }
  ],
  "edges": [
    { "from": 1, "to": 2 },
    { "from": 2, "to": 3 }
  ],
  "created_by": 1
}
```

Ha szeretnéd, elkészítek rögtön egy rövid módosítást a backendben, hogy a frontend `id` mezőjét (`n.id`) automatikusan elfogadja `client_id` helyett (így a `nodes.jsx`-ben lévő `id` mező használható lesz).

**_ Vége _**
