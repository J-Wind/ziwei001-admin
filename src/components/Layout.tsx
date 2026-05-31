import { useState } from 'react'
import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd'
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
  ShoppingOutlined,
  OrderedListOutlined,
  StarFilled,
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
    { key: '/recharge-orders', icon: <OrderedListOutlined />, label: '充值订单', onClick: () => navigate('/recharge-orders') },
    { key: '/recharge-config', icon: <ShoppingOutlined />, label: '充值套餐', onClick: () => navigate('/recharge-config') },
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
    <Layout className="main-layout" style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="sidebar"
        width={240}
      >
        <div className="logo-container">
          <div className="logo-icon">
            <StarFilled />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <h2>紫微卜运</h2>
              <span className="logo-subtitle">AI 命理工具</span>
            </div>
          )}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[selectedKey]} 
          items={menuItems}
          className="sidebar-menu"
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-header">
          <Button 
            type="text" 
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
            onClick={() => setCollapsed(!collapsed)} 
            className="collapse-btn"
          />
          <Space className="header-right">
            <Dropdown menu={{ items: dropdownMenu }} placement="bottomRight">
              <div className="user-avatar-wrapper">
                <Avatar 
                  size={36} 
                  icon={<UserOutlined />}
                  className="user-avatar"
                  style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}
                />
                <span className="username">{adminUser?.username || '管理员'}</span>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content className="site-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutComponent
