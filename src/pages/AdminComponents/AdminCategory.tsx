import React, { useState, useEffect, useMemo } from 'react';
import { Table, Spin, Alert, Button, Modal, Form, Input, Card, Space, Typography, Image, Tag, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface Category {
  _id: string;
  tenDanhMuc: string; // Đã đổi theo Backend
  moTa?: string;      // Đã đổi theo Backend
  hinhAnh: string;    // Đã đổi theo Backend
}

const AdminCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError('Bạn cần đăng nhập để quản lý danh mục.');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await api.get('/danh-muc', config); // Đổi endpoint
      
      if (response.data.success) {
        setCategories(response.data.duLieu || []); // Khớp với key duLieu của bạn
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lấy danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, [token]);

  // 2. Logic tìm kiếm tối ưu bằng useMemo
  const filteredData = useMemo(() => {
    return categories.filter((cat) =>
      cat.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, categories]);

  const showModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue(category);
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingCategory) {
        await api.put(`/danh-muc/${editingCategory._id}`, values, config);
        Modal.success({ content: 'Cập nhật danh mục thành công' });
      } else {
        await api.post('/danh-muc', values, config);
        Modal.success({ content: 'Thêm danh mục mới thành công' });
      }
      setIsModalOpen(false);
      fetchCategories(); // Reload lại dữ liệu từ server
    } catch (err: any) {
      Modal.error({ content: err.response?.data?.message || 'Lỗi khi lưu danh mục' });
    }
  };

  const confirmDelete = (categoryId: string, categoryName: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa vĩnh viễn',
      content: `Bạn có chắc chắn muốn xóa danh mục "${categoryName}"? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`,
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          await api.delete(`/danh-muc/${categoryId}`, config);
          Modal.success({ content: 'Đã xóa danh mục thành công' });
          fetchCategories();
        } catch (err: any) {
          Modal.error({ content: err.response?.data?.message || 'Lỗi khi xóa' });
        }
      },
    });
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'hinhAnh',
      key: 'hinhAnh',
      width: 100,
      render: (url: string) => (
        <Image
          src={url}
          alt="category"
          width={60}
          height={60}
          style={{ borderRadius: 8, objectFit: 'cover' }}
          fallback="https://via.placeholder.com/60"
        />
      ),
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'tenDanhMuc',
      key: 'tenDanhMuc',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'moTa',
      key: 'moTa',
      ellipsis: true,
      render: (text: string) => text || <Text type="secondary">Không có mô tả</Text>,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record._id, record.tenDanhMuc)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Quản lý danh mục</Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchCategories}>Làm mới</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                Thêm danh mục
              </Button>
            </Space>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <Input
            placeholder="Tìm kiếm danh mục theo tên..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 400, borderRadius: '8px' }}
            allowClear
          />

          {error && <Alert message={error} type="error" showIcon closable />}

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8, showTotal: (total) => `Tổng cộng ${total} danh mục` }}
            style={{ borderRadius: '8px' }}
          />
        </Space>
      </Card>

      <Modal
        title={editingCategory ? <Text strong>Cập nhật danh mục</Text> : <Text strong>Thêm danh mục mới</Text>}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText={editingCategory ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnClose
        centered
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical" style={{ marginTop: '12px' }}>
          <Form.Item
            name="tenDanhMuc"
            label={<Text strong>Tên danh mục</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Ví dụ: Điện thoại, Laptop..." />
          </Form.Item>
          <Form.Item
            name="moTa"
            label={<Text strong>Mô tả</Text>}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn gọn về danh mục này" />
          </Form.Item>
          <Form.Item
            name="hinhAnh"
            label={<Text strong>URL hình ảnh đại diện</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh' }]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategory;