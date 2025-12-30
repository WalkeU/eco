const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const auth = require("../middlewares/auth")

router.post("/user/register", authController.register)
router.post("/user/login", authController.login)
router.post("/user/refresh", authController.refresh)
router.post("/user/logout", authController.logout)
router.get("/user/me", auth, authController.me)

module.exports = router
