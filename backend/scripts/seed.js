require("dotenv").config()
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcrypt")
const pool = require("../src/db")

async function seed() {
  // If sample graph already exists, nothing to do
  const [graphExists] = await pool.query("SELECT id FROM graphs WHERE name = ? LIMIT 1", ["Sample Graph"])
  if (graphExists && graphExists.length) {
    console.log("Sample data already exists. Graph id:", graphExists[0].id)
    process.exit(0)
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Ensure user exists (idempotent): reuse existing 'test' user if present
    const passwordPlain = "test"
    const [existingUserRows] = await conn.query("SELECT id FROM users WHERE username = ? LIMIT 1", ["test"])
    let userId
    if (existingUserRows && existingUserRows.length) {
      userId = existingUserRows[0].id
      console.log("Reusing existing user id:", userId)
    } else {
      const passwordHash = await bcrypt.hash(passwordPlain, 10)
      const [uRes] = await conn.query("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [
        "test",
        "test@test.test",
        passwordHash,
      ])
      userId = uRes.insertId
    }

    const [gRes] = await conn.query(
      "INSERT INTO graphs (name, description, tag, created_by) VALUES (?, ?, ?, ?)",
      ["Sample Graph", "This is a seeded example graph", "test", userId]
    )
    const graphId = gRes.insertId

    const nodes = [
      {
        client_id: "1",
        label: "Factory",
        x: 200,
        y: 200,
        icon: "assets/svg/factory.svg",
        data: { type: "factory", capacity: 1000, workers: 50, status: "active" },
      },
      {
        client_id: "2",
        label: "Solar Panel",
        x: 500,
        y: 200,
        icon: "assets/svg/solar.svg",
        data: { type: "solar", capacity: 300, efficiency: 0.85, status: "online" },
      },
      {
        client_id: "3",
        label: "Warehouse",
        x: 350,
        y: 400,
        icon: "assets/svg/building.svg",
        data: { type: "warehouse", storage: 5000, temperature: "controlled", status: "operational" },
      },
      {
        client_id: "4",
        label: "Battery",
        x: 600,
        y: 400,
        icon: "assets/svg/battery.svg",
        data: { type: "battery", capacity: 2000, chargeLevel: 0.6, status: "charging" },
      },
      {
        client_id: "5",
        label: "Substation",
        x: 800,
        y: 300,
        icon: "assets/svg/substation.svg",
        data: { type: "substation", capacity: 1200, status: "online" },
      },
      {
        client_id: "6",
        label: "Nuclear",
        x: 1000,
        y: 200,
        icon: "assets/svg/nuclear.svg",
        data: { type: "nuclear", output: 5000, safetyLevel: "high", status: "active" },
      },
    ]

    const idMap = {}
    for (const n of nodes) {
      const [res] = await conn.query(
        "INSERT INTO nodes (graph_id, client_id, label, x, y, icon, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [graphId, n.client_id, n.label, n.x, n.y, n.icon || null, n.data ? JSON.stringify(n.data) : null]
      )
      idMap[n.client_id] = res.insertId
    }

    const edges = [
      { from: "1", to: "2" },
      { from: "2", to: "3" },
      { from: "3", to: "4" },
      { from: "4", to: "5" },
      { from: "5", to: "6" },
      { from: "1", to: "3" },
    ]

    for (const e of edges) {
      await conn.query("INSERT INTO edges (graph_id, from_node_id, to_node_id, data) VALUES (?, ?, ?, ?)", [
        graphId,
        idMap[e.from],
        idMap[e.to],
        null,
      ])
    }

    await conn.commit()
    console.log("Inserted sample graph with id:", graphId)
    process.exit(0)
  } catch (err) {
    await conn.rollback()
    console.error("Seeding failed:", err.message)
    process.exit(1)
  } finally {
    conn.release()
  }
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
