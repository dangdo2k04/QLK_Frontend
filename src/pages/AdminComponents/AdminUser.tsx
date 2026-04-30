import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Spin, Alert, Button, Modal, Tag, Space, 
  Card, Select, Typography, message, Form, Input, Divider, 
  Row,
  Col
} from 'antd';
import { 
  DeleteOutlined, 
  UserOutlined, 
  FilterOutlined, 
  EditOutlined, 
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

// Định nghĩa Interface dựa trên Schema NguoiDung của bạn
interface User {
  _id: string;
  ten: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  vaiTro: 'admin' | 'nhanvien_kho' | 'nhanvien_banhang' | 'khachhang';
  createdAt: string;
}

const AdminUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string | undefined>(undefined);
  const { token } = useAuth();
  
  // States dành cho chức năng Sửa/Phân quyền
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // 1. Hàm lấy danh sách người dùng (Khớp API Backend)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API: GET /api/v1/nguoi-dung?vaiTro=...
      const url = filterRole ? `/nguoi-dung/quan-ly?vaiTro=${filterRole}` : '/nguoi-dung/quan-ly';
      const response = await api.get(url);
      
      // Backend của bạn trả về: { success: true, duLieu: [...] }
      setUsers(response.data.duLieu || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, filterRole]);

  // 2. Hàm xử lý Cập nhật / Phân quyền
  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;
    const hide = message.loading('Đang cập nhật...', 0);
    try {
      // Gọi API: PUT /api/v1/nguoi-dung/:id
      const response = await api.put(`/nguoi-dung/quan-ly/${editingUser._id}`, values);
      if (response.data.success) {
        message.success(`Cập nhật quyền hạn cho "${editingUser.ten}" thành công`);
        setIsEditModalOpen(false);
        fetchUsers(); // Tải lại danh sách
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi cập nhật người dùng');
    } finally {
      hide();
    }
  };

  // 3. Hàm xử lý Xóa người dùng
  const confirmDelete = (userId: string, userName: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa vĩnh viễn',
      icon: <DeleteOutlined style={{ color: 'red' }} />,
      content: `Hệ thống sẽ xóa người dùng "${userName}". Hành động này không thể hoàn tác!`,
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await api.delete(`/nguoi-dung/quan-ly/${userId}`);
          message.success('Đã xóa tài khoản thành công');
          fetchUsers();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi xóa người dùng');
        }
      },
    });
  };

  // Cấu hình hiển thị Tag vai trò
  const roleConfig: Record<string, { color: string; label: string }> = {
    admin: { color: 'volcano', label: 'Quản trị viên' },
    nhanvien_kho: { color: 'blue', label: 'Nhân viên kho' },
    nhanvien_banhang: { color: 'purple', label: 'Nhân viên bán hàng' },
    khachhang: { color: 'green', label: 'Khách hàng' },
  };

  const columns = [
    {
      title: 'Thông tin cơ bản',
      key: 'user_info',
      render: (record: User) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.ten}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <MailOutlined /> {record.email}
          </Text>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      render: (role: string) => (
        <Tag color={roleConfig[role]?.color || 'default'}>
          {(roleConfig[role]?.label || role).toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (record: User) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '13px' }}><PhoneOutlined /> {record.soDienThoai || 'Chưa có'}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }} ellipsis={{ tooltip: record.diaChi }}>
            {record.diaChi || 'Không có địa chỉ'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => <Text type="secondary">{new Date(date).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setIsEditModalOpen(true);
            }}
          >
            Phân quyền
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record._id, record.ten)}
            disabled={record.vaiTro === 'admin'} // Không cho phép xóa admin từ UI
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        variant="borderless"
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        title={
          <Space>
            <UserOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>Quản trị Người dùng & Cấp quyền</Title>
          </Space>
        }
        extra={
          <Space split={<Divider type="vertical" />}>
            <Space>
              <FilterOutlined style={{ color: '#8c8c8c' }} />
              <Select
                placeholder="Lọc theo quyền"
                style={{ width: 160 }}
                allowClear
                onChange={setFilterRole}
              >
                <Option value="admin">Quản trị viên</Option>
                <Option value="nhanvien_kho">Nhân viên kho</Option>
                <Option value="nhanvien_banhang">Nhân viên bán hàng</Option>
                <Option value="khachhang">Khách hàng</Option>
              </Select>
            </Space>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
              Làm mới
            </Button>
          </Space>
        }
      >
        {error && <Alert message="Thông báo" description={error} type="warning" showIcon closable style={{ marginBottom: 16 }} />}

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ 
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} tài khoản`
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Modal Phân Quyền & Sửa thông tin */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Chỉnh sửa quyền hạn: <Text type="danger">{editingUser?.ten}</Text></span>
          </Space>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => form.submit()}
        okText="Cập nhật ngay"
        cancelText="Bỏ qua"
        destroyOnClose
        centered
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleUpdateUser}
          style={{ marginTop: '16px' }}
        >
          <Form.Item 
            name="ten" 
            label={<Text strong>Họ và tên người dùng</Text>} 
            rules={[{ required: true, message: 'Không được để trống tên' }]}
          >
            <Input placeholder="Nhập tên đầy đủ" />
          </Form.Item>
          
          <Form.Item 
            name="vaiTro" 
            label={<Text strong>Cấp quyền hệ thống</Text>} 
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò mới">
              <Option value="khachhang">Khách hàng (Chỉ mua hàng)</Option>
              <Option value="nhanvien_kho">Nhân viên kho (Quản lý hàng/Xuất kho)</Option>
              <Option value="nhanvien_banhang">Nhân viên bán hàng (Xử lý đơn/Báo cáo)</Option>
              <Option value="admin">Quản trị viên (Toàn quyền hệ thống)</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="soDienThoai" label={<Text strong>Số điện thoại</Text>}>
                <Input placeholder="090..." />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="diaChi" label={<Text strong>Địa chỉ liên lạc</Text>}>
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ chi tiết" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUser;