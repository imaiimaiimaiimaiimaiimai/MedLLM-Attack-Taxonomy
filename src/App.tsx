import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Explorer from './pages/Explorer'
import References from './pages/References'
import Comparison from './pages/Comparison'
import Header from './components/layout/Header'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/references" element={<References />} />
          <Route path="/comparison" element={<Comparison />} />
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: '',
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
