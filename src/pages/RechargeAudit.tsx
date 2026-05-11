import { useState, useEffect } from 'react'
import { Button, Table, Modal, Form, message, Tag, Tabs, Space, Input, Select } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import { adminRequest } from '../api'

interface RechargeOrder {
  id: number
  user_id: number
  username: string
  amount: number
  points: number
  payment_method: string
  status: string
  voucher_url: string | null
  voucher_note: string | null
  admin_note: string | null
  processed_by: string | null
  processed_at: string | null
  created_at: string
}

const statusTag: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待审核' },
  approved: { color: 'green', text: '已通过' },
  rejected: { color: 'red', text: '已拒绝' },
}

const paymentMap: Record<string, string> = {
  wechat: '微信',
  alipay: '支付宝',
}

const RechargeAuditPage: React.FC = () => {
  const [orders, setOrders] = useState<RechargeOrder[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [auditModal, setAuditModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<RechargeOrder | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [auditing, setAuditing] = useState(false)

  const fetchOrders = async (status?: string) => {
    setLoading(true)
    try {
      const params = status && status !== 'all' ? `?status=${status}` : ''
      const data = await adminRequest(`/api/admin/recharge/orders${params}`)
      setOrders(data.orders)
      setTotal(data.total)
    } catch {
      message.error('获取充值订单失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(activeTab)
  }, [activeTab])

  const handleAudit = async (action: 'approve' | 'reject') => {
    if (!currentOrder) return
    setAuditing(true)
    try {
      await adminRequest('/api/admin/recharge/audit', {
        method: 'POST',
        body: JSON.stringify({
          order_id: currentOrder.id,
          action,
          admin_note: adminNote,
        }),
      })
      message.success(action === 'approve' ? '已通过' : '已拒绝')
      setAuditModal(false)
      setAdminNote('')
      fetchOrders(activeTab)
    } catch {
      message.error('审核失败')
    } finally {
      setAuditing(false)
    }
  }

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (text: string, record: RechargeOrder) => `${text} (${record.user_id})`,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (val: number) => `¥${val}`,
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 100,
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 100,
      render: (val: string) => paymentMap[val] || val,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: string) => {
        const tag = statusTag[val] || { color: 'default', text: val }
        return <Tag color={tag.color}>{tag.text}</Tag>
      },
    },
    {
      title: '备注',
      dataIndex: 'voucher_note',
      key: 'voucher_note',
      width: 150,
      ellipsis: true,
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (val: string) => val?.slice(0, 16),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: RechargeOrder) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentOrder(record)
              setDetailModal(true)
            }}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => {
                setCurrentOrder(record)
                setAdminNote('')
                setAuditModal(true)
              }}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    { key: 'pending', label: `待审核 (${orders.filter(o => o.status === 'pending').length})` },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已拒绝' },
    { key: 'all', label: '全部' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>充值审核</h2>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
      />

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <Modal
        title="审核充值订单"
        open={auditModal}
        onCancel={() => {
          setAuditModal(false)
          setAdminNote('')
        }}
        footer={null}
      >
        {currentOrder && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>用户：</strong>{currentOrder.username} (ID: {currentOrder.user_id})</p>
              <p><strong>金额：</strong>¥{currentOrder.amount}</p>
              <p><strong>积分：</strong>{currentOrder.points}</p>
              <p><strong>支付方式：</strong>{paymentMap[currentOrder.payment_method]}</p>
              {currentOrder.voucher_note && (
                <p><strong>用户备注：</strong>{currentOrder.voucher_note}</p>
              )}
            </div>

            <Form.Item label="管理员备注">
              <Input.TextArea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="选填"
                rows={3}
              />
            </Form.Item>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                danger
                icon={<CloseOutlined />}
                loading={auditing}
                onClick={() => handleAudit('reject')}
              >
                拒绝
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={auditing}
                onClick={() => handleAudit('approve')}
              >
                通过
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="订单详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
      >
        {currentOrder && (
          <div>
            <p><strong>订单ID：</strong>{currentOrder.id}</p>
            <p><strong>用户：</strong>{currentOrder.username} (ID: {currentOrder.user_id})</p>
            <p><strong>金额：</strong>¥{currentOrder.amount}</p>
            <p><strong>积分：</strong>{currentOrder.points}</p>
            <p><strong>支付方式：</strong>{paymentMap[currentOrder.payment_method]}</p>
            <p><strong>状态：</strong>
              <Tag color={statusTag[currentOrder.status]?.color}>
                {statusTag[currentOrder.status]?.text}
              </Tag>
            </p>
            {currentOrder.voucher_note && (
              <p><strong>用户备注：</strong>{currentOrder.voucher_note}</p>
            )}
            {currentOrder.admin_note && (
              <p><strong>管理员备注：</strong>{currentOrder.admin_note}</p>
            )}
            {currentOrder.processed_by && (
              <p><strong>处理人：</strong>{currentOrder.processed_by}</p>
            )}
            {currentOrder.processed_at && (
              <p><strong>处理时间：</strong>{currentOrder.processed_at.slice(0, 16)}</p>
            )}
            <p><strong>申请时间：</strong>{currentOrder.created_at.slice(0, 16)}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RechargeAuditPage
