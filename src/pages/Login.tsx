import { useState } from 'react'
import { Button, Form, Input, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const API_BASE = 'http://localhost:3001'

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // 已登录自动跳转
  if (localStorage.getItem('admin-token')) {
    navigate('/')
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
      <div className="login-form">
        <h2>紫微卜运 · 管理后台</h2>
        <Form name="login" onFinish={onFinish} initialValues={{ remember: true }}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="管理员用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input prefix={<LockOutlined />} type="password" placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login
