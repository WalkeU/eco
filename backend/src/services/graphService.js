const pool = require("../db")

const createGraph = async (payload) => {
  const { name, description, tag, nodes = [], edges = [], created_by } = payload
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [gRes] = await conn.query(
      "INSERT INTO graphs (name, description, tag, created_by) VALUES (?, ?, ?, ?)",
      [name, description || null, tag || null, created_by]
    )
    const graphId = gRes.insertId

    const idMap = {}
    for (const n of nodes) {
      const dataStr = n.data ? JSON.stringify(n.data) : null
      const [nRes] = await conn.query(
        "INSERT INTO nodes (graph_id, client_id, label, x, y, icon, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [graphId, n.client_id || null, n.label || null, n.x || null, n.y || null, n.icon || null, dataStr]
      )
      idMap[String(n.client_id)] = nRes.insertId
    }

    for (const e of edges) {
      const fromId = idMap[String(e.from_client_id || e.from)]
      const toId = idMap[String(e.to_client_id || e.to)]
      if (!fromId || !toId) throw new Error("edge references unknown node client_id")
      const dataStr = e.data ? JSON.stringify(e.data) : null
      await conn.query("INSERT INTO edges (graph_id, from_node_id, to_node_id, data) VALUES (?, ?, ?, ?)", [
        graphId,
        fromId,
        toId,
        dataStr,
      ])
    }

    await conn.commit()
    return await getGraphById(graphId)
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

// ez arra kell hogy amikor csak a metaadatokat kell ellenorizni (pl. jogosultsag)
const getRawGraph = async (id) => {
  const [rows] = await pool.query("SELECT * FROM graphs WHERE id = ? LIMIT 1", [id])
  return rows && rows.length ? rows[0] : null
}

const listGraphs = async ({ created_by } = {}) => {
  // ATMENETILEG AZ OSSZUES USER HOZZAFER AZ OSSZES GRAFHOZ
  const [rows] = await pool.query(
    "SELECT id, name, description, tag, created_by, created_at, updated_at FROM graphs"
  )
  return rows
}

const getGraphById = async (id) => {
  const [gRows] = await pool.query(
    "SELECT id, name, description, tag, created_by, created_at, updated_at FROM graphs WHERE id = ? LIMIT 1",
    [id]
  )
  if (!gRows || !gRows.length) return null
  const graph = gRows[0]
  const [nodesRows] = await pool.query(
    "SELECT id, client_id, label, x, y, icon, data FROM nodes WHERE graph_id = ?",
    [id]
  )
  const nodes = nodesRows.map((n) => ({ ...n, data: n.data ? JSON.parse(n.data) : null }))
  const [edgesRows] = await pool.query(
    "SELECT id, from_node_id, to_node_id, data FROM edges WHERE graph_id = ?",
    [id]
  )
  const edges = edgesRows.map((e) => ({
    id: e.id,
    from: e.from_node_id,
    to: e.to_node_id,
    data: e.data ? JSON.parse(e.data) : null,
  }))
  return { ...graph, nodes, edges }
}

const updateGraph = async (id, payload) => {
  const { name, description, tag, nodes = [], edges = [] } = payload
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(
      "UPDATE graphs SET name = ?, description = ?, tag = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, description || null, tag || null, id]
    )
    await conn.query("DELETE FROM edges WHERE graph_id = ?", [id])
    await conn.query("DELETE FROM nodes WHERE graph_id = ?", [id])

    const idMap = {}
    for (const n of nodes) {
      const dataStr = n.data ? JSON.stringify(n.data) : null
      const [nRes] = await conn.query(
        "INSERT INTO nodes (graph_id, client_id, label, x, y, icon, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, n.client_id || null, n.label || null, n.x || null, n.y || null, n.icon || null, dataStr]
      )
      idMap[String(n.client_id)] = nRes.insertId
    }

    for (const e of edges) {
      const fromId = idMap[String(e.from_client_id || e.from)]
      const toId = idMap[String(e.to_client_id || e.to)]
      if (!fromId || !toId) throw new Error("edge references unknown node client_id")
      const dataStr = e.data ? JSON.stringify(e.data) : null
      await conn.query("INSERT INTO edges (graph_id, from_node_id, to_node_id, data) VALUES (?, ?, ?, ?)", [
        id,
        fromId,
        toId,
        dataStr,
      ])
    }

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

const deleteGraph = async (id) => {
  await pool.query("DELETE FROM graphs WHERE id = ?", [id])
}

module.exports = { createGraph, getGraphById, listGraphs, updateGraph, deleteGraph, getRawGraph }
