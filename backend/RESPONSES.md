# API response codes — magyarázat

Ez a fájl összegzi a backend által visszaadott HTTP státuszkódok jelentését és tipikus eseteket az alkalmazásban.

Általános formátum

- Sikeres válaszok: a body a várt erőforrást/adatot tartalmazza (JSON).
- Hibák: alapértelmezett egyszerű formátum: `{ "error": "<message>" }`. Később lehet kibővíteni: `{ error: { code, message, details } }`.

Gyakori státuszkódok és mikor használjuk

- 200 OK

  - Általános sikeres lekérdezés (pl. `GET /api/graphs/:id` sikeres visszaadása).

- 201 Created

  - Új erőforrás sikeres létrehozása (pl. `POST /api/users` vagy `POST /api/graphs`), a válasz visszaadhatja az új `id`-t.

- 204 No Content

  - Sikeres törlés vagy olyan művelet, ami nem ad vissza body-t (pl. `DELETE /api/graphs/:id`).

- 400 Bad Request

  - Hibás kliens-bemenet (hiányzó kötelező mező, rossz formátum). Válasz: `{ "error": "INVALID_INPUT" }` vagy részletesebb hibaüzenet.

- 401 Unauthorized

  - A kérés nem tartalmaz érvényes hitelesítést. Példák:
    - Nincs `Authorization` header a védett endpointhoz.
    - A token lejárt vagy érvénytelen. (Pl. a `auth` middleware 401-et ad vissza.)
  - Frontend viselkedés: ilyenkor a kliensnek kijelentkeztetést kell végrehajtania és átirányítani a bejelentkező oldalra.

- 403 Forbidden

  - A felhasználó hitelesített, de nincs jogosultsága a kérés végrehajtására (pl. egy graf módosítása amikor a felhasználó nem a tulajdonos).

- 404 Not Found

  - A keresett erőforrás nem létezik (pl. `GET /api/graphs/999` amikor nincs ilyen id).

- 409 Conflict

  - Konfliktus az adatokkal (pl. regisztrációkor már létező `username`). Példa: `POST /api/users` visszaad 409-et ha `username` már foglalt.

- 422 Unprocessable Entity

  - Opcionális: a szerver megérti a tartalmat, de az üzleti validáció miatt nem tudja feldolgozni (például összefüggő validációs hibák). Nem minden API használja.

- 500 Internal Server Error
  - Váratlan szerveroldali hiba; logolni kell a szerveren és általános hibaüzenetet adni vissza (ne szivárogtass érzékeny információt).

Példák a projektből

- `POST /api/users`

  - 201: sikeres regisztráció
  - 400: hiányzó username/password
  - 409: username már létezik

- `POST /api/auth/login`

  - 200: sikeres login + `{ accessToken, user }`
  - 400: hiányzó mezők
  - 401: rossz felhasználónév/jelszó

- Védett végpontok (`/api/graphs` POST/PUT/DELETE, `/api/auth/me`)
  - 401: hiányzó vagy érvénytelen token
  - 403: jogosultsági probléma (módosításnál, ha nem a tulajdonos)

Ajánlott hibaszerkezet (kiterjeszthető)

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "One or more fields are invalid",
    "details": { "username": "required" }
  }
}
```

Megjegyzések

- Frontend: a kliens oldali logika figyelje a 401 státuszt és kezelje automatikusan a kijelentkezést/átirányítást. A 4xx hibák megjelenítendők a felhasználónak.
- Backend: logold a 5xx hibákat részletesen, de a válaszban ne küldj érzékeny részleteket.
