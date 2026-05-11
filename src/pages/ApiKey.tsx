import { useState, useEffect } from 'react';
import { Button, Table, Form, Input, Modal, message, Popconfirm, Switch, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { adminRequest } from '../api';
import './ApiKey.css';

interface ApiKey {
  id: number;
  model: string;
  provider: string;
  apiKey: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

const ApiKey: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});

  // 获取API密钥列表
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const data = await adminRequest('/api/admin/api-keys');
      setApiKeys(data);
    } catch (error) {
      message.error('获取API密钥列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleShowPassword = (id: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'API密钥',
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (text: string, record: ApiKey) => (
        <div className="api-key-display">
          <span>{showPasswords[record.id] ? text : '••••••••••••••••••••••••'}</span>
          <Button
            icon={showPasswords[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => toggleShowPassword(record.id)}
            size="small"
          />
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: ApiKey) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updatedAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApiKey) => (
        <div className="action-buttons">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定要删除这个API密钥吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleStatusChange = async (id: number, checked: boolean) => {
    try {
      await adminRequest(`/api/admin/api-keys/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: checked })
      });
      message.success(`状态已切换为 ${checked ? '启用' : '禁用'}`);
      fetchApiKeys();
    } catch (error) {
      message.error('更新状态失败');
      console.error(error);
    }
  };

  const handleEdit = (record: ApiKey) => {
    form.setFieldsValue({
      model: record.model,
      provider: record.provider,
      apiKey: record.apiKey
    });
    setEditingKey(record.id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await adminRequest(`/api/admin/api-keys/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchApiKeys();
    } catch (error) {
      message.error('删除API密钥失败');
      console.error(error);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingKey(null);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingKey) {
        await adminRequest(`/api/admin/api-keys/${editingKey}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        })
        message.success('更新成功')
        setIsModalVisible(false)
        fetchApiKeys()
      } else {
        await adminRequest('/api/admin/api-keys', {
          method: 'POST',
          body: JSON.stringify(values),
        })
        message.success('添加成功')
        setIsModalVisible(false)
        fetchApiKeys()
      }
    } catch (error: any) {
      message.error(error?.message || '操作失败')
      console.error(error)
    }
  };

  return (
    <div className="api-key-management">
      <div className="header">
        <h2>API密钥管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加API密钥
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={apiKeys}
        rowKey="id"
        pagination={false}
        loading={loading}
      />

      <Modal
        title={editingKey ? '编辑API密钥' : '添加API密钥'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="model"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称!' }]}
          >
            <Select placeholder="选择模型">
              <Select.Option value="Kimi">Kimi (月之暗面)</Select.Option>
              <Select.Option value="Gemini">Gemini (Google)</Select.Option>
              <Select.Option value="Claude">Claude (Anthropic)</Select.Option>
              <Select.Option value="DeepSeek">DeepSeek</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="provider"
            label="提供商标识"
            rules={[{ required: true, message: '请选择提供商!' }]}
          >
            <Select placeholder="选择提供商">
              <Select.Option value="kimi">kimi</Select.Option>
              <Select.Option value="gemini">gemini</Select.Option>
              <Select.Option value="claude">claude</Select.Option>
              <Select.Option value="deepseek">deepseek</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥!' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiKey;
