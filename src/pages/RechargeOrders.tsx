import { useState, useEffect } from 'react'
import {
  Button,
  Table,
  Card,
  Statistic,
  Tag,
  Modal,
  Space,
  Select,
  DatePicker,
  message,
} from 'antd'
import { EyeOutlined, ReloadOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { adminRequest } from '../api'

const { RangePicker } = DatePicker

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

interface UserOption {
  id: number
  username: string
  display_name?: string
}

interface StatsData {
  totalOrders: number
  totalAmount: number
  pendingCount: number
  todayAmount: number
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

const RechargeOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<RechargeOrder[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<RechargeOrder | null>(null)

  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [amountSum, setAmountSum] = useState(0)
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    totalAmount: 0,
    pendingCount: 0,
    todayAmount: 0,
  })

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
  })

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [pagination.current, pagination.pageSize])

  const fetchUsers = async () => {
    try {
      const data = await adminRequest('/api/admin/users?limit=1000')
      setUsers(data.users || [])
    } catch (err) {
      console.error('获取用户列表失败:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD')
      const allData = await adminRequest('/api/admin/recharge/orders?limit=1&offset=0')
      const pendingData = await adminRequest('/api/admin/recharge/orders?status=pending&limit=1&offset=0')
      const todayData = await adminRequest(`/api/admin/recharge/orders?start_date=${today}&end_date=${today}&limit=1&offset=0`)

      setStats({
        totalOrders: allData.total || 0,
        totalAmount: allData.amountSum || 0,
        pendingCount: pendingData.total || 0,
        todayAmount: todayData.amountSum || 0,
      })
    } catch (err) {
      console.error('获取统计数据失败:', err)
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let params = `?limit=${pagination.pageSize}&offset=${(pagination.current - 1) * pagination.pageSize}`

      if (selectedUserId) {
        params += `&user_id=${selectedUserId}`
      }

      if (selectedStatus && selectedStatus !== 'all') {
        params += `&status=${selectedStatus}`
      }

      if (dateRange && dateRange[0] && dateRange[1]) {
        params += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`
      }

      const data = await adminRequest(`/api/admin/recharge/orders${params}`)
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      setAmountSum(data.amountSum || 0)
    } catch {
      message.error('获取充值订单失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 })
    fetchOrders()
  }

  const handleReset = () => {
    setSelectedUserId(undefined)
    setSelectedStatus('all')
    setDateRange(null)
    setPagination({ ...pagination, current: 1 })
    setTimeout(() => fetchOrders(), 0)
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
      width: 140,
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
      width: 100,
      render: (_: any, record: RechargeOrder) => (
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
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>充值订单列表</h2>
      </div>

      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <Card>
          <Statistic title="总订单数" value={stats.totalOrders} />
        </Card>
        <Card>
          <Statistic title="总金额(已通过)" value={stats.totalAmount} precision={2} prefix="¥" />
        </Card>
        <Card>
          <Statistic title="待审核数" value={stats.pendingCount} valueStyle={{ color: '#fa8c16' }} />
        </Card>
        <Card>
          <Statistic title="今日金额" value={stats.todayAmount} precision={2} prefix="¥" />
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%' }}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['开始日期', '结束日期']}
          />

          <Select
            style={{ width: 180 }}
            placeholder="选择用户"
            allowClear
            showSearch
            optionFilterProp="label"
            value={selectedUserId}
            onChange={(value) => setSelectedUserId(value)}
            options={[
              { label: '全部用户', value: undefined },
              ...users.map((u) => ({
                label: `${u.display_name || u.username} (${u.id})`,
                value: u.id,
              })),
            ]}
          />

          <Select
            style={{ width: 140 }}
            placeholder="状态筛选"
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            options={[
              { label: '全部', value: 'all' },
              { label: '待审核', value: 'pending' },
              { label: '已通过', value: 'approved' },
              { label: '已拒绝', value: 'rejected' },
            ]}
          />

          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>

          <Button icon={<ClearOutlined />} onClick={handleReset}>
            重置
          </Button>

          <Button icon={<ReloadOutlined />} onClick={() => fetchOrders()}>
            刷新
          </Button>
        </Space>
      </Card>

      {(dateRange || selectedUserId) && (
        <Card style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
          <strong style={{ color: '#52c41a' }}>
            所选时间段内充值金额总和：¥{amountSum.toFixed(2)}
          </strong>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize })
          },
        }}
      />

      <Modal
        title="订单详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={600}
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

export default RechargeOrdersPage
