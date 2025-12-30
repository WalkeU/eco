import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Editor from "./pages/Editor"
import Home from "./pages/Home"
import Upload from "./pages/Upload"
import Auth from "./pages/Auth"
import Test from "./pages/Test"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  )
}

export default App
