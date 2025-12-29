const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const auth = require("../middlewares/auth")

router.post("/users", authController.register)
router.post("/auth/login", authController.login)
router.get("/auth/me", auth, authController.me)

module.exports = router
