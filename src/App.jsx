import { Navigate, Route, Routes } from 'react-router-dom'

import CustomerApp from './pages/CustomerApp'
import AdminApp from './pages/AdminApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerApp />} />
      <Route path="/yonetim" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
