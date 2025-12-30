const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  const token = req.cookies && req.cookies.accessToken
  if (!token) return res.status(401).json({ error: "missing token" })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub }
    return next()
  } catch (err) {
    return res.status(401).json({ error: "invalid token" })
  }
}
