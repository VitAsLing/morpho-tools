import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Web3Provider } from './providers/Web3Provider'
import { Layout } from './components/layout/Layout'
import { ToastContainer } from './components/ui/Toast'
import { Markets } from './pages/Markets'
import { Positions } from './pages/Positions'
import { Rewards } from './pages/Rewards'

export function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Markets />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/rewards" element={<Rewards />} />
          </Routes>
        </Layout>
        <ToastContainer />
      </BrowserRouter>
    </Web3Provider>
  )
}
