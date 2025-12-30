const userService = require("../services/userService")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !password) return res.status(400).json({ error: "username and password required" })

    const existing = await userService.findByUsername(username)
    if (existing) return res.status(409).json({ error: "username already exists" })

    const password_hash = await bcrypt.hash(password, 10)
    const user = await userService.createUser({ username, email, password_hash })
    res.status(201).json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: "username and password required" })

    const user = await userService.findByUsername(username)
    if (!user) return res.status(401).json({ error: "invalid credentials" })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: "invalid credentials" })

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "12h" })
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 1000,
    })
    res.json({
      user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.me = async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: "unauthorized" })
    const user = await userService.getUserById(userId)
    if (!user) return res.status(404).json({ error: "not found" })
    // only return safe fields
    res.json({ id: user.id, username: user.username, email: user.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}
