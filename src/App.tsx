import { Routes, Route } from 'react-router-dom'
import { Box, CssBaseline } from '@mui/material'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Categories from './pages/Categories'
import Checklist from './pages/Checklist'
import ChecklistForm from './pages/ChecklistForm'
import InspectionDashboard from './pages/InspectionDashboard'
import Camera from './pages/Camera'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories/:truckId" element={<Categories />} />
          <Route path="/checklist/:truckId/:categoryId" element={<Checklist />} />
          <Route path="/checklist-form/:truckId" element={<ChecklistForm />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/dashboard" element={<InspectionDashboard />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App