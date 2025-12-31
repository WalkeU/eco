const userService = require("../services/userService")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

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
      console.log(`[LOGIN] Sikertelen: nincs ilyen user (${username})`)
      return res.status(401).json({ error: "invalid credentials" })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      console.log(`[LOGIN] Sikertelen: hibás jelszó (${username})`)
      return res.status(401).json({ error: "invalid credentials" })
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "12h" })
    const refreshToken = crypto.randomBytes(64).toString("hex")
    const expiresAt = new Date(Date.now() + 1 * 1 * 1 * 30 * 1000) // 7 days
    await userService.createRefreshToken(user.id, refreshToken, expiresAt)

    console.log(`[LOGIN] Sikeres: userId=${user.id}, username=${user.username}, refreshToken=${refreshToken}`)

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 1 * 5 * 1000, // 20 seconds
    })
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 1 * 1 * 30 * 1000, // 7 days
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
      console.log(`[REFRESH] Nincs refresh token a cookie-ban`)
      return res.status(401).json({ error: "no refresh token" })
    }

    const tokenData = await userService.findByRefreshToken(oldRefreshToken)
    if (!tokenData) {
      console.log(`[REFRESH] Hibás vagy lejárt refresh token: ${oldRefreshToken}`)
      return res.status(401).json({ error: "invalid refresh token" })
    }

    // Töröljük a régi tokent
    await userService.deleteRefreshToken(oldRefreshToken)

    // Új tokenek generálása
    const newAccessToken = jwt.sign({ sub: tokenData.user_id }, process.env.JWT_SECRET, { expiresIn: "12h" })
    const newRefreshToken = crypto.randomBytes(64).toString("hex")
    const expiresAt = new Date(Date.now() + 1 * 1 * 1 * 30 * 1000)
    await userService.createRefreshToken(tokenData.user_id, newRefreshToken, expiresAt)

    console.log(`[REFRESH] Sikeres: userId=${tokenData.user_id}, új refreshToken=${newRefreshToken}`)

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 1 * 5 * 1000, // 20 seconds
    })
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 1 * 1 * 30 * 1000, // 7 days
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
      console.log(`[LOGOUT] Refresh token törölve: ${refreshToken}`)
    } else {
      console.log(`[LOGOUT] Nem volt refresh token a cookie-ban`)
    }
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.json({ message: "logged out" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}
