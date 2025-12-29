const express = require("express")
const dotenv = require("dotenv")
const helmet = require("helmet")
const cors = require("cors")
const morgan = require("morgan")

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
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
