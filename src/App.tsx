import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './App.css'

import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ApiKey from './pages/ApiKey'
import SystemConfig from './pages/SystemConfig'
import RedeemCode from './pages/RedeemCode'
import PointsConfig from './pages/PointsConfig'
import Users from './pages/Users'
import Roles from './pages/Roles'
import RechargeAudit from './pages/RechargeAudit'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin-token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="api-key" element={<ApiKey />} />
            <Route path="system-config" element={<SystemConfig />} />
            <Route path="redeem-code" element={<RedeemCode />} />
            <Route path="points-config" element={<PointsConfig />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="recharge-audit" element={<RechargeAudit />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App
