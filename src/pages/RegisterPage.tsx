import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined, 
  UserAddOutlined 
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/axios';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Backend của bạn mong đợi: { ten, email, matKhau, soDienThoai, diaChi }
      const response = await api.post('/nguoi-dung/dang-ky', {
        ten: values.ten,
        email: values.email,
        matKhau: values.matKhau,
        soDienThoai: values.soDienThoai,
        diaChi: values.diaChi
      });

      if (response.data.success) {
        message.success('Đăng ký tài khoản thành công!');
        
        // Tùy chọn: Đăng nhập luôn hoặc chuyển về trang Login
        // login(response.data.duLieu, response.data.token); 
        navigate('/login');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: '#f0f2f5', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px' 
    }}>
      <Card 
        style={{ width: '100%', maxWidth: '500px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <UserAddOutlined style={{ fontSize: '40px', color: '#1890ff' }} />
          <Title level={2} style={{ marginTop: '10px' }}>Tạo tài khoản mới</Title>
          <Text type="secondary">Tham gia cùng Tiệm nhà Đăng ngay hôm nay</Text>
        </div>

        <Form
          name="register_form"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* HỌ TÊN */}
          <Form.Item
            name="ten"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên của bạn!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>

          {/* EMAIL */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="email@example.com" />
          </Form.Item>

          {/* SỐ ĐIỆN THOẠI */}
          <Form.Item
            name="soDienThoai"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="0987xxxxxx" />
          </Form.Item>

          <Form.Item
            name="diaChi"
            label="Địa chỉ giao hàng"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea placeholder="Số nhà, tên đường, phường/xã..." rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              {/* MẬT KHẨU */}
              <Form.Item
                name="matKhau"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu phải từ 6 ký tự!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="******" />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* XÁC NHẬN MẬT KHẨU */}
              <Form.Item
                name="confirm"
                label="Xác nhận"
                dependencies={['matKhau']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('matKhau') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="******" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              loading={loading}
              style={{ borderRadius: '8px', height: '45px', marginTop: '10px' }}
            >
              ĐĂNG KÝ NGAY
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;