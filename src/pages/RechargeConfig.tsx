import { useState, useEffect } from 'react'
import { Button, InputNumber, Form, message, Card, Table, Space, Popconfirm, Divider } from 'antd'
import { adminRequest } from '../api'

interface RechargePackage {
  amount: number
  points: number
  label: string
  original_price?: number
  bonus?: number
  limited?: boolean
}

const RechargeConfigPage: React.FC = () => {
  const [packages, setPackages] = useState<RechargePackage[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const data = await adminRequest('/api/admin/recharge/config')
      setPackages(data.packages || [])
    } catch {
      message.error('获取配置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleAddPackage = () => {
    setPackages(prev => [...prev, { amount: 0, points: 0, label: '新套餐' }])
  }

  const handleUpdatePackage = (index: number, field: keyof RechargePackage, value: any) => {
    setPackages(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const handleRemovePackage = (index: number) => {
    setPackages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await adminRequest('/api/admin/recharge/config', {
        method: 'PUT',
        body: JSON.stringify({ packages }),
      })
      message.success('配置已保存')
    } catch {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '套餐名称',
      dataIndex: 'label',
      key: 'label',
      width: 120,
      render: (text: string, record: RechargePackage, index: number) => (
        <input
          value={text}
          onChange={(e) => handleUpdatePackage(index, 'label', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded"
          placeholder="如：体验包、超值包"
        />
      )
    },
    {
      title: '现价 (¥)',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (value: number, _: RechargePackage, index: number) => (
        <InputNumber
          value={value}
          onChange={(v) => handleUpdatePackage(index, 'amount', v || 0)}
          min={0.01}
          step={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '原价 (¥)',
      dataIndex: 'original_price',
      key: 'original_price',
      width: 100,
      render: (value: number | undefined, _: RechargePackage, index: number) => (
        <InputNumber
          value={value}
          onChange={(v) => handleUpdatePackage(index, 'original_price', v || undefined)}
          min={0.01}
          step={0.01}
          precision={2}
          placeholder="选填，用于显示划线价"
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '获得积分',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (value: number, _: RechargePackage, index: number) => (
        <InputNumber
          value={value}
          onChange={(v) => handleUpdatePackage(index, 'points', v || 0)}
          min={1}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '赠送积分',
      dataIndex: 'bonus',
      key: 'bonus',
      width: 100,
      render: (value: number | undefined, _: RechargePackage, index: number) => (
        <InputNumber
          value={value}
          onChange={(v) => handleUpdatePackage(index, 'bonus', v || undefined)}
          min={0}
          placeholder="选填"
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '限时标签',
      dataIndex: 'limited',
      key: 'limited',
      width: 80,
      render: (value: boolean, _: RechargePackage, index: number) => (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => handleUpdatePackage(index, 'limited', e.target.checked)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (record: any, rowData: RechargePackage, index: number) => {
        return (
          <Popconfirm
            title="确定删除此套餐？"
            onConfirm={() => handleRemovePackage(index)}
            okText="删除"
            cancelText="取消"
          >
            <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        )
      }
    }
  ]

  return (
    <div>
      <h2>充值套餐配置</h2>

      <Card style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
          配置用户可购买的充值套餐。现价为必填项，原价为选填项（填写后会显示划线价效果）。
        </div>

        <Table
          dataSource={packages.map((pkg, idx) => ({ ...pkg, key: idx }))}
          columns={columns}
          pagination={false}
          loading={loading}
          size="small"
          bordered
        />

        <div style={{ marginTop: 12 }}>
          <Button onClick={handleAddPackage} type="dashed" block>
            + 添加套餐
          </Button>
        </div>

        <Divider />

        <Space>
          <Button type="primary" onClick={handleSave} loading={loading} size="large">
            保存套餐配置
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default RechargeConfigPage
