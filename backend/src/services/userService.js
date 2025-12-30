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

const createRefreshToken = async (userId, token, expiresAt) => {
  const [res] = await pool.query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [
    userId,
    token,
    expiresAt,
  ])
  return { id: res.insertId, userId, token, expiresAt }
}

const findByRefreshToken = async (token) => {
  const [rows] = await pool.query(
    "SELECT rt.*, u.id as user_id, u.username, u.email FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id WHERE rt.token = ? AND rt.expires_at > NOW() LIMIT 1",
    [token]
  )
  return rows && rows.length ? rows[0] : null
}

const deleteRefreshToken = async (token) => {
  await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [token])
}

const deleteUserRefreshTokens = async (userId) => {
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId])
}

module.exports = {
  findByUsername,
  createUser,
  getUserById,
  createRefreshToken,
  findByRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens,
}
