import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Card, Tabs, Form, Input, Button, message, 
  Descriptions, Tag, Divider, Typography, Spin, Alert 
} from 'antd';
import { 
  UserOutlined, LockOutlined, EditOutlined, 
  MailOutlined, PhoneOutlined, HomeOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Định nghĩa kiểu dữ liệu khớp 100% với Backend
interface UserProfile {
  _id: string;
  ten: string;
  email: string;
  soDienThoai: string;
  diaChi?: string;
  vaiTro: 'admin' | 'nhanvien_kho' | 'nhanvien_banhang' | 'khachhang';
}

const ProfilePage: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 1. Fetch dữ liệu từ API /auth/me
  const fetchProfile = async () => {
    try {
      if (!token) return;
      const response = await api.get('/nguoi-dung/me'); 
      // Backend của bạn trả về: response.data.duLieu
      const userData = response.data.duLieu;
      setProfile(userData);
      form.setFieldsValue(userData); // Đổ dữ liệu vào form chỉnh sửa
    } catch (err: any) {
      message.error('Lỗi khi tải hồ sơ người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // 2. Cập nhật hồ sơ (Tên, SĐT, Địa chỉ)
  const handleUpdateProfile = async (values: any) => {
    try {
      setUpdating(true);
      const response = await api.put('/nguoi-dung/me', values);
      if (response.data.success) {
        message.success('Cập nhật thông tin thành công!');
        setProfile(response.data.duLieu);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setUpdating(false);
    }
  };

  // 3. Đổi mật khẩu
  const onPasswordChange = async (values: any) => {
    try {
      setUpdating(true);

      // Chuyển đổi tên trường để khớp với Backend
      const payload = {
        matKhauCu: values.matKhauHienTai, // Map từ Form sang Backend
        matKhauMoi: values.matKhauMoi
      };

      const response = await api.put('/nguoi-dung/doi-mat-khau', payload);
      
      if (response.data.success) {
        message.success('Đổi mật khẩu thành công!');
        passwordForm.resetFields();
      }
    } catch (err: any) {
      // Hiển thị chính xác lỗi từ Backend (ví dụ: "Mật khẩu hiện tại không đúng")
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  const renderRoleTag = (role: string) => {
    const roles: any = {
      admin: { color: 'magenta', label: 'Quản trị viên' },
      nhanvien_kho: { color: 'blue', label: 'Nhân viên kho' },
      nhanvien_banhang: { color: 'green', label: 'Nhân viên bán hàng' },
      khachhang: { color: 'gold', label: 'Khách hàng' }
    };
    const r = roles[role] || { color: 'default', label: role };
    return <Tag color={r.color}>{r.label.toUpperCase()}</Tag>;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  if (!profile) return <Alert message="Lỗi" description="Không tìm thấy thông tin người dùng" type="error" showIcon />;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <Card bordered={false} className="profile-card" style={{ borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e6f7ff', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserOutlined style={{ fontSize: '50px', color: '#1890ff' }} />
          </div>
          <Title level={2} style={{ margin: 0 }}>{profile.ten}</Title>
          <div style={{ marginTop: '10px' }}>{renderRoleTag(profile.vaiTro)}</div>
        </div>

        <Tabs defaultActiveKey="1" centered size="large">
          {/* TAB 1: THÔNG TIN CHI TIẾT */}
          <Tabs.TabPane tab="Thông tin tài khoản" key="1">
            <Descriptions bordered column={1} style={{ marginTop: '20px' }}>
              <Descriptions.Item label={<span><MailOutlined /> Email</span>}>{profile.email}</Descriptions.Item>
              <Descriptions.Item label={<span><PhoneOutlined /> Số điện thoại</span>}>{profile.soDienThoai}</Descriptions.Item>
              <Descriptions.Item label={<span><HomeOutlined /> Địa chỉ</span>}>{profile.diaChi || 'Chưa cập nhật'}</Descriptions.Item>
            </Descriptions>
          </Tabs.TabPane>

          {/* TAB 2: CHỈNH SỬA HỒ SƠ */}
          <Tabs.TabPane tab="Chỉnh sửa hồ sơ" key="2">
            <Form form={form} layout="vertical" onFinish={handleUpdateProfile} style={{ marginTop: '20px' }}>
              <Form.Item name="ten" label="Họ và tên" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item name="soDienThoai" label="Số điện thoại" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              <Form.Item name="diaChi" label="Địa chỉ">
                <Input.TextArea rows={2} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={updating} icon={<EditOutlined />} block>
                Lưu thay đổi
              </Button>
            </Form>
          </Tabs.TabPane>

          {/* TAB 3: ĐỔI MẬT KHẨU */}
          <Tabs.TabPane tab="Bảo mật" key="3">
            <Form form={passwordForm} layout="vertical" onFinish={onPasswordChange} style={{ marginTop: '20px' }}>
              <Form.Item name="matKhauHienTai" label="Mật khẩu hiện tại" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Divider />
              <Form.Item name="matKhauMoi" label="Mật khẩu mới" rules={[{ required: true, min: 6 }]}>
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item 
                name="xacNhanMatKhau" 
                label="Xác nhận mật khẩu mới" 
                dependencies={['matKhauMoi']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('matKhauMoi') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Button type="primary" danger htmlType="submit" loading={updating} block>
                Đổi mật khẩu
              </Button>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfilePage;