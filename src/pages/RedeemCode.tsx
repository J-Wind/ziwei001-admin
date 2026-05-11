import { useState, useEffect } from 'react'
import { Button, Table, InputNumber, Modal, Form, message, Popconfirm, Tag, Tabs, Space } from 'antd'
import { PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import { adminRequest } from '../api'

interface RedeemCode {
  id: number
  code: string
  points: number
  status: string
  batch_id: string
  created_by: string
  created_at: string
  expires_at: string | null
  used_by: number | null
  used_at: string | null
}

const statusTag: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '未使用' },
  used: { color: 'blue', text: '已使用' },
  expired: { color: 'red', text: '已过期' },
}

const RedeemCodePage: React.FC = () => {
  const [codes, setCodes] = useState<RedeemCode[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const fetchCodes = async (status?: string) => {
    setLoading(true)
    try {
      const params = status && status !== 'all' ? `?status=${status}` : ''
      const data = await adminRequest(`/api/admin/redeem-codes${params}`)
      setCodes(data.codes)
      setTotal(data.total)
    } catch {
      message.error('获取兑换码列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes(activeTab)
  }, [activeTab])

  const handleGenerate = async (values: { count: number; points: number; expires_days?: number }) => {
    setGenerating(true)
    try {
      const body: any = { count: values.count, points: values.points }
      if (values.expires_days && values.expires_days > 0) {
        const d = new Date()
        d.setDate(d.getDate() + values.expires_days)
        body.expires_at = d.toISOString()
      }
      const data = await adminRequest('/api/admin/redeem-codes', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      message.success(`成功生成 ${data.count} 个兑换码！`)
      setShowModal(false)
      Modal.info({
        title: '生成成功',
        width: 500,
        content: (
          <div>
            <p>批量ID：{data.batchId}</p>
            <p>单码积分：{data.points}</p>
            <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
              {data.codes.join('\n')}
            </pre>
          </div>
        ),
      })
      fetchCodes(activeTab)
    } catch {
      message.error('生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await adminRequest(`/api/admin/redeem-codes/${id}`, { method: 'DELETE' })
      message.success('已删除')
      fetchCodes(activeTab)
    } catch (err: any) {
      message.error(err.message || '删除失败')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => message.success('已复制: ' + code))
  }

  const copyAll = () => {
    const text = codes.filter(c => c.status === 'active').map(c => c.code).join('\n')
    navigator.clipboard.writeText(text).then(() => message.success('已复制到剪贴板'))
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '兑换码', dataIndex: 'code', key: 'code', width: 200,
      render: (text: string, r: RedeemCode) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <code style={{ fontSize: 12, background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{text}</code>
          {r.status === 'active' && (
            <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyCode(text)} />
          )}
        </div>
      ),
    },
    { title: '积分', dataIndex: 'points', key: 'points', width: 80 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => <Tag color={statusTag[s]?.color}>{statusTag[s]?.text || s}</Tag>,
    },
    { title: '批次', dataIndex: 'batch_id', key: 'batch_id', width: 140 },
    { title: '创建者', dataIndex: 'created_by', key: 'created_by', width: 100 },
    {
      title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160,
      render: (t: string) => t?.slice(0, 19),
    },
    {
      title: '有效期至', dataIndex: 'expires_at', key: 'expires_at', width: 160,
      render: (t: string | null) => t ? t.slice(0, 19) : '永久',
    },
    {
      title: '使用者', key: 'used_by', width: 100,
      render: (_: any, r: RedeemCode) => r.used_by ? `UID:${r.used_by}` : '-',
    },
    {
      title: '使用时间', key: 'used_at', width: 160,
      render: (_: any, r: RedeemCode) => r.used_at ? r.used_at.slice(0, 19) : '-',
    },
    {
      title: '操作', key: 'actions', width: 80,
      render: (_: any, r: RedeemCode) => (
        <Popconfirm
          title="确定删除？"
          onConfirm={() => handleDelete(r.id)}
          disabled={r.status !== 'active'}
        >
          <Button danger icon={<DeleteOutlined />} size="small" disabled={r.status !== 'active'} />
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>兑换码管理</h2>
        <Space>
          <Button icon={<CopyOutlined />} onClick={copyAll} disabled={codes.filter(c => c.status === 'active').length === 0}>
            复制所有未使用
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>
            生成兑换码
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        { key: 'all', label: `全部 (${total})` },
        { key: 'active', label: '未使用' },
        { key: 'used', label: '已使用' },
        { key: 'expired', label: '已过期' },
      ]} />

      <Table dataSource={codes} columns={columns} rowKey="id" loading={loading} size="small" />

      <Modal open={showModal} onCancel={() => setShowModal(false)} title="生成兑换码" footer={null}>
        <Form onFinish={handleGenerate} layout="vertical" initialValues={{ count: 10, points: 100 }}>
          <Form.Item name="count" label="生成数量" rules={[{ required: true }]}>
            <InputNumber min={1} max={500} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="points" label="单码积分" rules={[{ required: true }]}>
            <InputNumber min={1} max={99999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expires_days" label="有效期（天，留空永久有效）">
            <InputNumber min={1} max={3650} style={{ width: '100%' }} placeholder="留空则永久有效" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={generating} block>
              生成
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RedeemCodePage
