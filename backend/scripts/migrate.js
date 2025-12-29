// scripts/migrate.js
require("dotenv").config()
const fs = require("fs")
const mysql = require("mysql2/promise")

async function run() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_PORT) {
    console.error("Missing DB env vars")
    process.exit(1)
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  async function waitForDb(attempts = 30, delay = 2000) {
    for (let i = 0; i < attempts; i++) {
      try {
        const c = await mysql.createConnection({
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASSWORD,
          port: Number(DB_PORT),
        })
        await c.end()
        return
      } catch (err) {
        console.log(`Waiting for MySQL (${i + 1}/${attempts})...`)
        await sleep(delay)
      }
    }
    throw new Error("Timed out waiting for MySQL")
  }

  // wait for MySQL to accept connections
  await waitForDb()

  // connect to server (no DB) to ensure DB exists
  const serverConn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
    multipleStatements: true,
  })

  const sqlFile = "./migrations/001_init.sql"
  if (!fs.existsSync(sqlFile)) {
    console.error("Migrations file not found:", sqlFile)
    process.exit(1)
  }
  const sql = fs.readFileSync(sqlFile, "utf8")
  // split into statements and execute sequentially so we can handle idempotent errors
  const statements = sql
    .split(/;/)
    .map((s) => s.trim())
    .filter((s) => s.length)

  try {
    for (const stmt of statements) {
      try {
        await serverConn.query(stmt)
      } catch (err) {
        // Ignore duplicate index/key errors to make migrations idempotent
        if (err && (err.errno === 1061 || /Duplicate key name/i.test(err.message))) {
          console.log("Ignored duplicate index/key:", err.message)
          continue
        }
        console.error("Failed to apply statement:", stmt.slice(0, 120), err.message)
        throw err
      }
    }
    console.log("Migrations applied")
  } catch (err) {
    console.error("Failed to apply migrations:", err.message)
    process.exit(1)
  } finally {
    await serverConn.end()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
