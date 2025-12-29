const graphService = require("../services/graphService")

exports.createGraph = async (req, res) => {
  try {
    const payload = req.body
    const created_by = req.user && req.user.id
    if (!created_by) return res.status(401).json({ error: "unauthorized" })

    const graph = await graphService.createGraph({ ...payload, created_by })
    res.status(201).json(graph)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.listGraphs = async (req, res) => {
  try {
    const created_by = req.query.created_by
    const list = await graphService.listGraphs({ created_by })
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.getGraph = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const graph = await graphService.getGraphById(id)
    if (!graph) return res.status(404).json({ error: "not found" })
    res.json(graph)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.updateGraph = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const userId = req.user && req.user.id
    const graphMeta = await graphService.getRawGraph(id)
    if (!graphMeta) return res.status(404).json({ error: "not found" })
    if (graphMeta.created_by !== userId) return res.status(403).json({ error: "forbidden" })

    await graphService.updateGraph(id, req.body)
    const updated = await graphService.getGraphById(id)
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.deleteGraph = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const userId = req.user && req.user.id
    const graphMeta = await graphService.getRawGraph(id)
    if (!graphMeta) return res.status(404).json({ error: "not found" })
    if (graphMeta.created_by !== userId) return res.status(403).json({ error: "forbidden" })

    await graphService.deleteGraph(id)
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "server error" })
  }
}
