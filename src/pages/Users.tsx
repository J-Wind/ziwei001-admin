import { useState, useEffect } from 'react'
import {
  Button, Table, Input, Modal, Form, InputNumber, message, Tag, Space,
  Select, Popconfirm, Descriptions, Tabs, Switch, Spin
} from 'antd'
import {
  SearchOutlined, EditOutlined, DeleteOutlined,
  KeyOutlined, EyeOutlined, UserAddOutlined, ReloadOutlined
} from '@ant-design/icons'
import { adminRequest } from '../api'
import dayjs from 'dayjs'

const { Option } = Select

interface User {
  id: number
  username: string
  phone: string | null
  email: string | null
  avatar_url: string | null
  role: string
  points: number
  status: string
  created_at: string
  updated_at: string
  last_login_at: string | null
  invite_code: string | null
  invited_by: string | null
}

interface PointsLog {
  id: number
  user_id: number
  amount: number
  type: string
  description: string
  created_at: string
}

interface OperationLog {
  id: number
  user_id: number
  username: string
  action: string
  detail: string
  ip: string
  created_at: string
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Detail data
  const [detailUser, setDetailUser] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailStats, setDetailStats] = useState<any>(null)
  const [detailPointsLog, setDetailPointsLog] = useState<PointsLog[]>([])
  const [detailOpLog, setDetailOpLog] = useState<OperationLog[]>([])

  const fetchUsers = async (s = '', page = 1, size = 20) => {
    setLoading(true)
    try {
      const offset = (page - 1) * size
      const params = new URLSearchParams()
      if (s) params.set('search', s)
      params.set('limit', String(size))
      params.set('offset', String(offset))
      const data = await adminRequest(`/api/admin/users?${params.toString()}`)
      setUsers(data.users)
      setTotal(data.total)
      setCurrentPage(page)
      setPageSize(size)
    } catch {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSearch = () => fetchUsers(search, 1, pageSize)
  const handleTableChange = (pagination: any) => fetchUsers(search, pagination.current, pagination.pageSize)

  const handleCreate = async (values: any) => {
    setCreating(true)
    try {
      await adminRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      message.success('创建成功')
      setShowCreateModal(false)
      fetchUsers(search, currentPage, pageSize)
    } catch (err: any) {
      message.error(err.message || '创建失败')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = async (values: any) => {
    if (!selectedUser) return
    setEditing(true)
    try {
      await adminRequest(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
      })
      message.success('编辑成功')
      setShowEditModal(false)
      fetchUsers(search, currentPage, pageSize)
    } catch (err: any) {
      message.error(err.message || '编辑失败')
    } finally {
      setEditing(false)
    }
  }

  const handleResetPwd = async (values: any) => {
    if (!selectedUser) return
    setResetting(true)
    try {
      await adminRequest(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword: values.newPassword }),
      })
      message.success('密码已重置')
      setShowPwdModal(false)
    } catch (err: any) {
      message.error(err.message || '重置失败')
    } finally {
      setResetting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await adminRequest(`/api/admin/users/${id}`, { method: 'DELETE' })
      message.success('已删除')
      fetchUsers(search, currentPage, pageSize)
    } catch (err: any) {
      message.error(err.message || '删除失败')
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'disabled' : 'active'
      await adminRequest(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })
      message.success(newStatus === 'active' ? '已启用' : '已禁用')
      fetchUsers(search, currentPage, pageSize)
    } catch (err: any) {
      message.error(err.message || '操作失败')
    }
  }

  const fetchUserDetail = async (user: User) => {
    setSelectedUser(user)
    setShowDetailModal(true)
    setDetailLoading(true)
    try {
      const data = await adminRequest(`/api/admin/users/${user.id}/detail`)
      setDetailUser(data.user)
      setDetailStats(data.stats)
      setDetailPointsLog(data.pointsLog)
      setDetailOpLog(data.operationLog)
    } catch {
      message.error('获取用户详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130, render: (p: string | null) => p || '-' },
    {
      title: '角色', dataIndex: 'role', key: 'role', width: 80,
      render: (r: string) => {
        const colors: Record<string, string> = { admin: 'red', user: 'blue', vip: 'purple' }
        const labels: Record<string, string> = { admin: '管理员', user: '用户', vip: 'VIP' }
        return <Tag color={colors[r] || 'default'}>{labels[r] || r}</Tag>
      },
    },
    {
      title: '积分', dataIndex: 'points', key: 'points', width: 80,
      render: (v: number) => <strong style={{ color: '#fa8c16' }}>{v}</strong>,
    },
    {
      title: '邀请码', dataIndex: 'invite_code', key: 'invite_code', width: 100,
      render: (c: string | null) => c || '-',
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string, r: User) => (
        <Switch
          checked={s === 'active'}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          size="small"
          onChange={() => handleToggleStatus(r)}
          disabled={r.role === 'admin'}
        />
      ),
    },
    {
      title: '最近登录', dataIndex: 'last_login_at', key: 'last_login_at', width: 150,
      render: (t: string | null) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '未登录',
    },
    {
      title: '注册时间', dataIndex: 'created_at', key: 'created_at', width: 150,
      render: (t: string) => t?.slice(0, 19),
    },
    {
      title: '操作', key: 'actions', width: 260, fixed: 'right' as const,
      render: (_: any, r: User) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => fetchUserDetail(r)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelectedUser(r); setShowEditModal(true) }}>编辑</Button>
          <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => { setSelectedUser(r); setShowPwdModal(true) }}>重置密码</Button>
          <Popconfirm title="确定删除该用户？" onConfirm={() => handleDelete(r.id)} disabled={r.role === 'admin'}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} disabled={r.role === 'admin'} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const statusColor = (type: string) => {
    if (type.includes('redeem') || type === 'register') return 'green'
    if (type.startsWith('ai_')) return 'red'
    return 'default'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>用户管理</h2>
        <Space>
          <Input
            placeholder="搜索用户名"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setShowCreateModal(true)}>
            创建用户
          </Button>
        </Space>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage, pageSize, total,
          showSizeChanger: true, showTotal: (t) => `共 ${t} 个用户`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        size="small"
        scroll={{ x: 1200 }}
      />

      {/* 创建用户 */}
      <Modal title="创建用户" open={showCreateModal} onCancel={() => setShowCreateModal(false)} footer={null}>
        <Form onFinish={handleCreate} layout="vertical" initialValues={{ role: 'user', points: 50 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, min: 2, max: 20 }]}>
            <Input placeholder="2-20个字符" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="至少6个字符" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="选填" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Option value="user">普通用户</Option>
              <Option value="vip">VIP用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item name="points" label="初始积分">
            <InputNumber min={0} max={99999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>创建</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户 */}
      <Modal title="编辑用户" open={showEditModal} onCancel={() => setShowEditModal(false)} footer={null}>
        <Form
          initialValues={{
            username: selectedUser?.username,
            email: selectedUser?.email,
            role: selectedUser?.role,
            points: selectedUser?.points,
          }}
          onFinish={handleEdit}
          layout="vertical"
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, min: 2, max: 20 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Option value="user">普通用户</Option>
              <Option value="vip">VIP用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item name="points" label="积分">
            <InputNumber min={0} max={99999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editing} block>保存修改</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码 */}
      <Modal title={`重置密码 - ${selectedUser?.username}`} open={showPwdModal} onCancel={() => setShowPwdModal(false)} footer={null}>
        <Form onFinish={handleResetPwd} layout="vertical">
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="至少6个字符" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={resetting} block icon={<ReloadOutlined />}>重置密码</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户详情 */}
      <Modal
        title={`用户详情 - ${selectedUser?.username}`}
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={800}
      >
        <Spin spinning={detailLoading}>
          {detailUser && (
            <>
              <Descriptions bordered size="small" column={3} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="ID">{detailUser.id}</Descriptions.Item>
                <Descriptions.Item label="用户名">{detailUser.username}</Descriptions.Item>
                <Descriptions.Item label="角色"><Tag>{detailUser.role}</Tag></Descriptions.Item>
                <Descriptions.Item label="积分">{detailUser.points}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={detailUser.status === 'active' ? 'green' : 'red'}>
                    {detailUser.status === 'active' ? '启用' : '禁用'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="注册时间">{detailUser.created_at?.slice(0, 19)}</Descriptions.Item>
              </Descriptions>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, background: '#f0f5ff', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{detailStats?.consumeCount || 0}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>消费次数</div>
                </div>
                <div style={{ flex: 1, background: '#fff7e6', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>{detailStats?.consumeTotal || 0}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>消耗积分</div>
                </div>
                <div style={{ flex: 1, background: '#f6ffed', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{detailStats?.rechargeCount || 0}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>充值次数</div>
                </div>
                <div style={{ flex: 1, background: '#f9f0ff', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>{detailStats?.rechargeTotal || 0}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>充值积分</div>
                </div>
              </div>

              <Tabs items={[
                {
                  key: 'points',
                  label: `积分流水 (${detailPointsLog.length})`,
                  children: (
                    <Table dataSource={detailPointsLog} rowKey="id" size="small" pagination={{ pageSize: 10 }}
                      columns={[
                        { title: '时间', dataIndex: 'created_at', width: 170, render: (t: string) => t?.slice(0, 19) },
                        { title: '类型', dataIndex: 'type', width: 120, render: (t: string) => <Tag color={statusColor(t)}>{t}</Tag> },
                        { title: '积分变动', dataIndex: 'amount', width: 100, render: (v: number) => <span style={{ color: v > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>{v > 0 ? '+' : ''}{v}</span> },
                        { title: '说明', dataIndex: 'description', ellipsis: true },
                      ]}
                    />
                  ),
                },
                {
                  key: 'ops',
                  label: `操作日志 (${detailOpLog.length})`,
                  children: (
                    <Table dataSource={detailOpLog} rowKey="id" size="small" pagination={{ pageSize: 10 }}
                      columns={[
                        { title: '时间', dataIndex: 'created_at', width: 170, render: (t: string) => t?.slice(0, 19) },
                        { title: '操作', dataIndex: 'action', width: 160 },
                        { title: '详情', dataIndex: 'detail', ellipsis: true },
                        { title: 'IP', dataIndex: 'ip', width: 130 },
                      ]}
                    />
                  ),
                },
              ]} />
            </>
          )}
        </Spin>
      </Modal>
    </div>
  )
}

export default UsersPage
