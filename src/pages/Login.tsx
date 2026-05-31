import { useState } from 'react'
import { Button, Form, Input, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const API_BASE = import.meta.env?.VITE_API_BASE || ''

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (localStorage.getItem('admin-token')) {
    navigate('/')
    return null
  }

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: values.username, password: values.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '登录失败')
      if (data.user.role !== 'admin') throw new Error('需要管理员账号')

      localStorage.setItem('admin-token', data.token)
      localStorage.setItem('admin-user', JSON.stringify(data.user))
      message.success('登录成功')
      navigate('/')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="geometric-pattern"></div>
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-icon">
            <img src="/logo.svg" alt="Logo" style={{ width: '64px', height: '64px' }} />
          </div>
          <h1>紫微卜运</h1>
          <p className="login-subtitle">AI 命理工具 · 管理后台</p>
          <div className="golden-line"></div>
        </div>

        <Form name="login" onFinish={onFinish} initialValues={{ remember: true }} className="login-form">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input 
              prefix={<UserOutlined className="input-prefix-icon" />} 
              placeholder="管理员用户名" 
              size="large"
              className="login-input"
            />
          </Form.Item>
          
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password 
              prefix={<LockOutlined className="input-prefix-icon" />} 
              placeholder="密码" 
              size="large"
              className="login-input"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="login-button" 
              loading={loading}
              block
              size="large"
            >
              登录系统
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <p>© 2024 紫微卜运 · AI命理工具</p>
        </div>
      </div>
    </div>
  )
}

export default Login
