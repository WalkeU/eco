import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Editor from "./pages/Editor"
import Home from "./pages/Home"
import Upload from "./pages/Upload"
import Auth from "./pages/Auth"
import Test from "./pages/Test"
import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  )
}

export default App
