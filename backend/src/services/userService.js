const pool = require("../db")

const findByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE username = ? LIMIT 1", [username])
  return rows && rows.length ? rows[0] : null
}

const createUser = async ({ username, email, password_hash }) => {
  const [res] = await pool.query("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [
    username,
    email || null,
    password_hash,
  ])
  return { id: res.insertId, username, email }
}

const getUserById = async (id) => {
  const [rows] = await pool.query("SELECT id, username, email, created_at FROM users WHERE id = ? LIMIT 1", [
    id,
  ])
  return rows && rows.length ? rows[0] : null
}

module.exports = { findByUsername, createUser, getUserById }
