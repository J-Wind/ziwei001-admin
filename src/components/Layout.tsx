import { useState } from 'react'
import { Layout, Menu, Button, Dropdown, Space } from 'antd'
import {
  HomeOutlined,
  KeyOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GiftOutlined,
  DollarOutlined,
  TeamOutlined,
  SafetyOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import './Layout.css'

const { Header, Sider, Content } = Layout

const LayoutComponent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const adminUser = (() => {
    try {
      const raw = localStorage.getItem('admin-user')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Dashboard', onClick: () => navigate('/') },
    { key: '/users', icon: <TeamOutlined />, label: '用户管理', onClick: () => navigate('/users') },
    { key: '/roles', icon: <SafetyOutlined />, label: '角色管理', onClick: () => navigate('/roles') },
    { key: '/api-key', icon: <KeyOutlined />, label: 'API密钥', onClick: () => navigate('/api-key') },
    { key: '/system-config', icon: <SettingOutlined />, label: '系统配置', onClick: () => navigate('/system-config') },
    { key: '/redeem-code', icon: <GiftOutlined />, label: '兑换码', onClick: () => navigate('/redeem-code') },
    { key: '/recharge-audit', icon: <WalletOutlined />, label: '充值审核', onClick: () => navigate('/recharge-audit') },
    { key: '/points-config', icon: <DollarOutlined />, label: '积分配置', onClick: () => navigate('/points-config') },
  ]

  const dropdownMenu = [
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: () => {
      localStorage.removeItem('admin-token')
      localStorage.removeItem('admin-user')
      navigate('/login')
    }},
  ]

  const selectedKey = menuItems.find(m => location.pathname === m.key)?.key || '/'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <h2 style={{ color: 'white', textAlign: 'center', marginTop: 16 }}>
            紫微卜运
          </h2>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 16, width: 64, height: 64 }} />
          <Space>
            <Dropdown menu={{ items: dropdownMenu }}>
              <Button type="text" icon={<UserOutlined />}>
                {adminUser?.username || '管理员'}
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content className="site-layout-background" style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: 'white', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutComponent
