const userService = require("../services/userService")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

// Token lifetimes (in milliseconds)
const ACCESS_TOKEN_AGE_MS = 1 * 5 * 60 * 1000 // 5 minutes
const REFRESH_TOKEN_AGE_MS = 24 * 60 * 60 * 1000 // 1 day

// ms -> s
const msToSeconds = (ms) => Math.floor(ms / 1000)

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
    if (!user) {
      return res.status(401).json({ error: "invalid credentials" })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" })
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: msToSeconds(ACCESS_TOKEN_AGE_MS),
    })
    const refreshToken = crypto.randomBytes(64).toString("hex")
    const expiresAt = new Date(Date.now() + 1 * 1 * 1 * 30 * 1000) // 7 days
    await userService.createRefreshToken(user.id, refreshToken, expiresAt)

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_AGE_MS,
    })
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_AGE_MS,
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

exports.refresh = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken
    if (!oldRefreshToken) {
      return res.status(401).json({ error: "no refresh token" })
    }

    const tokenData = await userService.findByRefreshToken(oldRefreshToken)
    if (!tokenData) {
      return res.status(401).json({ error: "invalid refresh token" })
    }

    // Töröljük a régi tokent
    await userService.deleteRefreshToken(oldRefreshToken)

    // Új tokenek generálása
    const newAccessToken = jwt.sign({ sub: tokenData.user_id }, process.env.JWT_SECRET, {
      expiresIn: msToSeconds(ACCESS_TOKEN_AGE_MS),
    })
    const newRefreshToken = crypto.randomBytes(64).toString("hex")
    const expiresAt = new Date(Date.now() + 1 * 1 * 1 * 30 * 1000)
    await userService.createRefreshToken(tokenData.user_id, newRefreshToken, expiresAt)

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_AGE_MS,
    })
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_AGE_MS,
    })
    res.json({ message: "token refreshed" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
      await userService.deleteRefreshToken(refreshToken)
    } else {
    }
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.json({ message: "logged out" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}
