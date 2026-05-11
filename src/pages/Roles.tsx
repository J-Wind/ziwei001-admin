import { useState, useEffect } from 'react'
import {
  Button, Table, Modal, Form, Input, message, Tag, Space, Popconfirm,
  Tree, Spin
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import { adminRequest } from '../api'

interface Role {
  id: number
  name: string
  code: string
  description: string
  status: number
  user_count: number
  perm_count: number
  created_at: string
  updated_at: string
}

interface Permission {
  id: number
  name: string
  code: string
  type: string
  parent_id: number | null
  path: string
  icon: string
  sort_order: number
  status: number
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPermModal, setShowPermModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<number[]>([])
  const [permLoading, setPermLoading] = useState(false)
  const [savingPerms, setSavingPerms] = useState(false)

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const data = await adminRequest('/api/admin/roles')
      setRoles(data.roles)
    } catch {
      message.error('获取角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoles() }, [])

  const fetchPermissions = async (roleId: number) => {
    setPermLoading(true)
    try {
      const [allPerms, rolePerms] = await Promise.all([
        adminRequest('/api/admin/permissions'),
        adminRequest(`/api/admin/roles/${roleId}/permissions`),
      ])
      setPermissions(allPerms.permissions)
      setRolePermissions(rolePerms.permissions.map((p: Permission) => p.id))
    } catch {
      message.error('获取权限失败')
    } finally {
      setPermLoading(false)
    }
  }

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      if (editingRole) {
        await adminRequest(`/api/admin/roles/${editingRole.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        })
        message.success('编辑成功')
      } else {
        await adminRequest('/api/admin/roles', {
          method: 'POST',
          body: JSON.stringify(values),
        })
        message.success('创建成功')
      }
      setShowModal(false)
      fetchRoles()
    } catch (err: any) {
      message.error(err.message || '操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role: Role) => {
    try {
      await adminRequest(`/api/admin/roles/${role.id}`, { method: 'DELETE' })
      message.success('已删除')
      fetchRoles()
    } catch (err: any) {
      message.error(err.message || '删除失败')
    }
  }

  const openPermModal = async (role: Role) => {
    setEditingRole(role)
    setShowPermModal(true)
    await fetchPermissions(role.id)
  }

  const handleSavePerms = async () => {
    if (!editingRole) return
    setSavingPerms(true)
    try {
      await adminRequest(`/api/admin/roles/${editingRole.id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permission_ids: rolePermissions }),
      })
      message.success('权限分配成功')
      setShowPermModal(false)
      fetchRoles()
    } catch (err: any) {
      message.error(err.message || '操作失败')
    } finally {
      setSavingPerms(false)
    }
  }

  const buildTreeData = (perms: Permission[]) => {
    const map = new Map<number, any>()
    const roots: any[] = []

    perms.forEach(p => {
      map.set(p.id, { key: p.id, title: `${p.name} (${p.code})`, disabled: p.type === 'menu' && perms.some(pp => pp.parent_id === p.id && p.id !== 1) })
    })

    perms.forEach(p => {
      const node = map.get(p.id)
      if (p.parent_id === null || !map.has(p.parent_id)) {
        roots.push(node)
      } else {
        const parent = map.get(p.parent_id)
        if (!parent.children) parent.children = []
        parent.children.push(node)
      }
    })

    return roots
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '角色名称', dataIndex: 'name', key: 'name', width: 140 },
    { title: '角色编码', dataIndex: 'code', key: 'code', width: 120, render: (v: string) => <code>{v}</code> },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: number) => <Tag color={s === 1 ? 'green' : 'red'}>{s === 1 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '用户数', dataIndex: 'user_count', key: 'user_count', width: 80,
      render: (v: number) => <Tag icon={<TeamOutlined />}>{v}</Tag>,
    },
    {
      title: '权限数', dataIndex: 'perm_count', key: 'perm_count', width: 80,
      render: (v: number) => <Tag icon={<SafetyOutlined />}>{v}</Tag>,
    },
    {
      title: '操作', key: 'actions', width: 260,
      render: (_: any, r: Role) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<SafetyOutlined />} onClick={() => openPermModal(r)} disabled={r.code === 'admin'}>
            分配权限
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditingRole(r); setShowModal(true) }} disabled={r.code === 'admin'}>
            编辑
          </Button>
          <Popconfirm title="确定删除该角色？" onConfirm={() => handleDelete(r)} disabled={r.code === 'admin'}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} disabled={r.code === 'admin'}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>角色管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRole(null); setShowModal(true) }}>
          创建角色
        </Button>
      </div>

      <Table
        dataSource={roles}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={false}
      />

      {/* 创建/编辑角色 */}
      <Modal
        title={editingRole ? '编辑角色' : '创建角色'}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
      >
        <Form
          onFinish={handleSave}
          layout="vertical"
          initialValues={{
            name: editingRole?.name,
            code: editingRole?.code,
            description: editingRole?.description,
            status: editingRole?.status ?? 1,
          }}
        >
          <Form.Item name="name" label="角色名称" rules={[{ required: true, max: 50 }]}>
            <Input placeholder="如：普通用户" />
          </Form.Item>
          <Form.Item name="code" label="角色编码" rules={[{ required: true, max: 50, pattern: /^[a-z_]+$/ }]}>
            <Input placeholder="如：user（仅小写字母和下划线）" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="角色描述" />
          </Form.Item>
          {!editingRole && (
            <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
              <Input type="hidden" />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving} block>
              {editingRole ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 分配权限 */}
      <Modal
        title={`分配权限 - ${editingRole?.name}`}
        open={showPermModal}
        onCancel={() => setShowPermModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowPermModal(false)}>取消</Button>,
          <Button key="save" type="primary" loading={savingPerms} onClick={handleSavePerms}>
            保存权限
          </Button>,
        ]}
        width={600}
      >
        <Spin spinning={permLoading}>
          <Tree
            checkable
            checkedKeys={rolePermissions}
            onCheck={(keys) => setRolePermissions(keys as number[])}
            treeData={buildTreeData(permissions)}
            defaultExpandAll
            style={{ maxHeight: 500, overflow: 'auto' }}
          />
        </Spin>
      </Modal>
    </div>
  )
}

export default RolesPage
