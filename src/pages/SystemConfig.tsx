import { useState, useEffect } from 'react'
import { Form, Select, Switch, Button, message, Card, Divider } from 'antd'
import { adminRequest } from '../api'
import './SystemConfig.css'

const SystemConfig: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const fetchConfig = async () => {
    try {
      setFetching(true)
      const data = await adminRequest('/api/admin/config')
      form.setFieldsValue({
        defaultProvider: data.defaultProvider,
        enableWebSearch: data.enableWebSearch,
        enableThinking: data.enableThinking,
      })
    } catch (error) {
      message.error('获取配置失败')
      console.error(error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      await adminRequest('/api/admin/config', {
        method: 'PUT',
        body: JSON.stringify(values),
      })
      message.success('配置已保存')
    } catch (error: any) {
      message.error(error?.message || '保存配置失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="system-config">
      <h2>系统配置</h2>
      <Card title="模型配置" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ enableWebSearch: false, enableThinking: false }}>
          <Form.Item name="defaultProvider" label="默认模型" rules={[{ required: true, message: '请选择默认模型' }]}>
            <Select placeholder="请选择默认模型">
              <Select.Option value="kimi">Kimi (月之暗面)</Select.Option>
              <Select.Option value="gemini">Gemini (Google)</Select.Option>
              <Select.Option value="claude">Claude (Anthropic)</Select.Option>
              <Select.Option value="deepseek">DeepSeek</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="enableWebSearch" label="启用联网搜索" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="enableThinking" label="启用深度思考" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Divider />
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading || fetching}>保存配置</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default SystemConfig
