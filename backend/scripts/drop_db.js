require("dotenv").config()
const mysql = require("mysql2/promise")

const DB_NAME = process.env.DB_NAME
const HOST = process.env.DB_HOST
const PORT = Number(process.env.DB_PORT)

const ROOT_USER = process.env.DB_ROOT_USER
const ROOT_PASS = process.env.DB_ROOT_PASSWORD
const USER = process.env.DB_USER
const PASS = process.env.DB_PASSWORD

const recreate = process.argv.includes("--recreate")

if (!DB_NAME) {
  console.error("DB_NAME is not set in environment")
  process.exit(1)
}

async function tryDrop() {
  const candidates = [
    { user: ROOT_USER, pass: ROOT_PASS, desc: "root" },
    { user: USER, pass: PASS, desc: "db user" },
  ]

  for (const c of candidates) {
    if (!c.user) continue
    try {
      const conn = await mysql.createConnection({
        host: HOST,
        user: c.user,
        password: c.pass,
        port: PORT,
        multipleStatements: true,
      })
      await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``)
      if (recreate) {
        await conn.query(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
      }
      await conn.end()
      console.log(`${c.desc} succeeded: dropped database ${DB_NAME}${recreate ? " and recreated it" : ""}`)
      return
    } catch (err) {
      console.warn(`${c.desc} failed: ${err.message}`)
    }
  }
  throw new Error("All attempts to drop the database failed")
}

tryDrop().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
