const express = require("express")
const router = express.Router()
const graphsController = require("../controllers/graphsController")
const auth = require("../middlewares/auth")

router.post("/", auth, graphsController.createGraph)
router.get("/", auth, graphsController.listGraphs)
router.get("/:id", auth, graphsController.getGraph)
router.put("/:id", auth, graphsController.updateGraph)
router.delete("/:id", auth, graphsController.deleteGraph)

module.exports = router
