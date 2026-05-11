import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, message } from 'antd'
import { ApiOutlined, UserOutlined, BarChartOutlined, GiftOutlined } from '@ant-design/icons'
import { adminRequest } from '../api'
import './Dashboard.css'

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    apiCalls: 0,
    userCount: 0,
    activeModels: 0,
    activeCodes: 0,
    systemStatus: '加载中',
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await adminRequest('/api/admin/stats')
        setStats(data)
      } catch {
        message.error('获取统计数据失败')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic title="AI 调用次数" value={stats.apiCalls} prefix={<ApiOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="用户数量" value={stats.userCount} prefix={<UserOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="活跃模型" value={stats.activeModels} prefix={<BarChartOutlined />} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="可用兑换码" value={stats.activeCodes} prefix={<GiftOutlined />} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="系统信息">
              <div className="system-info">
                <div className="info-item"><span className="info-label">后端服务:</span><span className="info-value">http://localhost:3001</span></div>
                <div className="info-item"><span className="info-label">前端应用:</span><span className="info-value">http://localhost:5173</span></div>
                <div className="info-item"><span className="info-label">管理后台:</span><span className="info-value">http://localhost:5174</span></div>
                <div className="info-item"><span className="info-label">数据库:</span><span className="info-value">SQLite (data.db)</span></div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="系统状态">
              <div className="system-info">
                <div className="info-item">
                  <span className="info-label">运行状态:</span>
                  <span className="info-value" style={{ color: '#52c41a' }}>● {stats.systemStatus}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">鉴权方式:</span>
                  <span className="info-value">JWT Token</span>
                </div>
                <div className="info-item">
                  <span className="info-label">积分系统:</span>
                  <span className="info-value">已启用</span>
                </div>
                <div className="info-item">
                  <span className="info-label">兑换码系统:</span>
                  <span className="info-value">已启用</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default Dashboard
