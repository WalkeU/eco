const express = require("express")
const dotenv = require("dotenv")
const helmet = require("helmet")
const cors = require("cors")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")

dotenv.config()

const app = express()

const frontendOrigin = process.env.FRONTEND_ORIGIN || `http://localhost:${process.env.FRONTEND_PORT || 5173}`

app.use(helmet())
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))

const authRoutes = require("./routes/auth")
const graphsRoutes = require("./routes/graphs")
const { me } = require("./controllers/authController")

app.use("/api", authRoutes)
app.use("/api/graphs", graphsRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString(), message: "Backend is running" })
})

const PORT = process.env.PORT || 3000
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`))
}

module.exports = app
