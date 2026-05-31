import { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Statistic, Button, Skeleton, Tag, message } from 'antd'
import {
  ApiOutlined,
  UserOutlined,
  BarChartOutlined,
  GiftOutlined,
  ReloadOutlined,
  TeamOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { adminRequest } from '../api'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

interface DashboardStats {
  apiCalls: number
  userCount: number
  todayNewUsers: number
  totalRecharge: number
  systemStatus: string
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    apiCalls: 0,
    userCount: 0,
    todayNewUsers: 0,
    totalRecharge: 0,
    systemStatus: '检测中...',
  })
  const navigate = useNavigate()

  const fetchStats = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await adminRequest('/api/admin/stats')
      setStats(data)
      message.success('数据刷新成功')
    } catch (err) {
      setError('获取统计数据失败')
      message.error('获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    
    const timer = setInterval(() => {
      fetchStats()
    }, 60000)

    return () => clearInterval(timer)
  }, [fetchStats])

  const handleRetry = () => {
    fetchStats()
  }

  const formatValue = (value: number): string | number => {
    if (value === 0 || value === undefined || value === null) {
      return '暂无数据'
    }
    return value
  }

  if (loading && !stats.apiCalls && !stats.userCount) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 数据概览</h2>
        </div>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card className="stat-card">
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 数据概览</h2>
        <div className="header-actions">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRetry}
            loading={loading}
            type="primary"
            ghost
          >
            刷新数据
          </Button>
          <span className="last-update">最后更新: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {error ? (
        <Card className="error-card">
          <div className="error-content">
            <p>{error}</p>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetry}>
              重试
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]} className="stat-cards-row">
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card stat-card-blue" hoverable>
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper stat-icon-blue">
                    <ApiOutlined />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">
                      <Statistic
                        title="AI 调用次数"
                        value={formatValue(stats.apiCalls)}
                        valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 600 }}
                      />
                    </div>
                    <div className="stat-trend trend-up">
                      <Tag color="success">↑ 12.5%</Tag>
                      <span className="trend-desc">较昨日</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card stat-card-green" hoverable>
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper stat-icon-green">
                    <UserOutlined />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">
                      <Statistic
                        title="用户总数"
                        value={formatValue(stats.userCount)}
                        valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                      />
                    </div>
                    <div className="stat-trend trend-up">
                      <Tag color="success">↑ 8.3%</Tag>
                      <span className="trend-desc">较上周</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card stat-card-orange" hoverable>
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper stat-icon-orange">
                    <UserOutlined />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">
                      <Statistic
                        title="当天新增用户"
                        value={formatValue(stats.todayNewUsers || 0)}
                        valueStyle={{ color: '#f5c842', fontSize: '28px', fontWeight: 600 }}
                      />
                    </div>
                    <div className="stat-trend">
                      <Tag color="warning">今日</Tag>
                      <span className="trend-desc">新增注册</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card stat-card-purple" hoverable>
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper stat-icon-purple">
                    <BarChartOutlined />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">
                      <Statistic
                        title="用户充值总额"
                        value={formatValue(stats.totalRecharge || 0)}
                        prefix="¥"
                        precision={2}
                        valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 600 }}
                      />
                    </div>
                    <div className="stat-trend">
                      <Tag color="purple">累计</Tag>
                      <span className="trend-desc">充值金额</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card className="quick-actions-card" title={
                <span><TeamOutlined /> 快捷操作</span>
              }>
                <div className="quick-actions-grid">
                  <div className="quick-action-item" onClick={() => navigate('/users')}>
                    <div className="action-icon action-icon-blue">
                      <TeamOutlined />
                    </div>
                    <div className="action-info">
                      <h4>用户管理</h4>
                      <p>管理平台用户</p>
                    </div>
                  </div>
                  <div className="quick-action-item" onClick={() => navigate('/recharge-audit')}>
                    <div className="action-icon action-icon-green">
                      <AuditOutlined />
                    </div>
                    <div className="action-info">
                      <h4>充值审核</h4>
                      <p>审核充值请求</p>
                    </div>
                  </div>
                  <div className="quick-action-item" onClick={() => navigate('/redeem-code')}>
                    <div className="action-icon action-icon-purple">
                      <GiftOutlined />
                    </div>
                    <div className="action-info">
                      <h4>兑换码管理</h4>
                      <p>生成和管理码</p>
                    </div>
                  </div>
                  <div className="quick-action-item" onClick={() => navigate('/system-config')}>
                    <div className="action-icon action-icon-orange">
                      <SafetyCertificateOutlined />
                    </div>
                    <div className="action-info">
                      <h4>系统配置</h4>
                      <p>系统参数设置</p>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card className="system-info-card" title={
                <span><SafetyCertificateOutlined /> 系统通知</span>
              }>
                <div className="system-status-list">
                  <div className="status-item">
                    <div className={`status-indicator status-${stats.systemStatus === '运行正常' ? 'success' : stats.systemStatus === '检测中...' ? 'warning' : 'error'}`}></div>
                    <div className="status-text">
                      <span className="status-label">系统状态:</span>
                      <span className="status-value">{stats.systemStatus}</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator status-success"></div>
                    <div className="status-text">
                      <span className="status-label">数据库:</span>
                      <span className="status-value">SQLite</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator status-success"></div>
                    <div className="status-text">
                      <span className="status-label">鉴权方式:</span>
                      <span className="status-value">JWT Token</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator status-success"></div>
                    <div className="status-text">
                      <span className="status-label">后端服务:</span>
                      <span className="status-value">{window.location.origin}</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator status-success"></div>
                    <div className="status-text">
                      <span className="status-label">积分系统:</span>
                      <span className="status-value">已启用</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator status-success"></div>
                    <div className="status-text">
                      <span className="status-label">兑换码系统:</span>
                      <span className="status-value">已启用</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}

export default Dashboard
