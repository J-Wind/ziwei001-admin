import { useState, useEffect } from 'react'
import { Button, InputNumber, Form, message, Card, Divider } from 'antd'
import { adminRequest } from '../api'

interface PointConfig {
  key: string
  name: string
  cost: number
}

const PointsConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<PointConfig[]>([])
  const [newUserPoints, setNewUserPoints] = useState(50)
  const [invitePoints, setInvitePoints] = useState(500)
  const [loading, setLoading] = useState(false)

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const data = await adminRequest('/api/admin/points-config')
      setConfigs(data.configs)
      setNewUserPoints(data.newUserPoints)
      setInvitePoints(data.invitePoints || 500)
    } catch {
      message.error('获取配置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  const handleSave = async () => {
    try {
      setLoading(true)
      await adminRequest('/api/admin/points-config', {
        method: 'PUT',
        body: JSON.stringify({ configs, newUserPoints, invitePoints }),
      })
      message.success('配置已保存')
    } catch {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>积分配置</h2>

      <Card title="AI 操作消耗积分" style={{ marginBottom: 24, marginTop: 16 }}>
        {configs.map((c) => (
          <Form.Item key={c.key} label={c.name} style={{ marginBottom: 12 }}>
            <InputNumber
              value={c.cost}
              onChange={(v) => setConfigs(prev => prev.map(p => p.key === c.key ? { ...p, cost: v || 0 } : p))}
              min={0}
              max={999}
              addonAfter="积分/次"
            />
          </Form.Item>
        ))}
      </Card>

      <Card title="新人注册赠送" style={{ marginBottom: 24 }}>
        <Form.Item label="注册即送积分">
          <InputNumber
            value={newUserPoints}
            onChange={(v) => setNewUserPoints(v || 0)}
            min={0}
            max={9999}
            addonAfter="积分"
          />
        </Form.Item>
      </Card>

      <Card title="邀请奖励" style={{ marginBottom: 24 }}>
        <Form.Item label="邀请积分（被邀请人+邀请人各得）">
          <InputNumber
            value={invitePoints}
            onChange={(v) => setInvitePoints(v || 0)}
            min={0}
            max={9999}
            addonAfter="积分"
          />
          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
            使用邀请码注册时，被邀请人和邀请人各自获得的积分
          </div>
        </Form.Item>
      </Card>

      <Divider />
      <Button type="primary" onClick={handleSave} loading={loading} size="large">
        保存全部配置
      </Button>
    </div>
  )
}

export default PointsConfigPage
