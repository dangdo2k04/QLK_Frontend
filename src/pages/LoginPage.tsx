import React, { useState } from 'react';
import api from '../config/axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // values chứa { email, matKhau } gửi lên Backend
      const response = await api.post('/nguoi-dung/dang-nhap', values);
      
      if (response.data.success) {
        // DỮ LIỆU THỰC TẾ: Token nằm ở response.data.token
        // Thông tin user nằm ở response.data.duLieu
        login(response.data.duLieu, response.data.token); 
        
        message.success('Đăng nhập thành công! Chào ' + response.data.duLieu.ten);
        navigate('/');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>

      {/* Nút quay lại trang chủ */}
      <Link to="/" style={backHomeStyle}>
        <ArrowLeftOutlined /> Quay lại trang chủ
      </Link>

      <Card style={cardStyle} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '10px' }}>ĐĂNG NHẬP</Title>
          <Text type="secondary">Hệ thống quản lý mô hình xe A90</Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Email của bạn" 
            />
          </Form.Item>

          <Form.Item
            name="matKhau"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Mật khẩu" 
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/forgot-password" style={{ fontSize: '13px' }}>Quên mật khẩu?</Link>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              icon={<LoginOutlined />} 
              loading={loading}
              style={{ height: '45px', borderRadius: '6px', fontWeight: 'bold' }}
            >
              ĐĂNG NHẬP NGAY
            </Button>
          </Form.Item>

          <Divider plain><Text type="secondary" style={{ fontSize: '12px' }}>Hoặc</Text></Divider>

          <div style={{ textAlign: 'center' }}>
            <Text>Chưa có tài khoản? </Text>
            <Link to="/register" style={{ fontWeight: 'bold' }}>Đăng ký thành viên</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

// --- STYLES ---

const containerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
};

const videoStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: 0,
  opacity: 0.6,
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  zIndex: 1,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  padding: '10px',
};

const backHomeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  zIndex: 2,
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textShadow: '1px 1px 2px #000',
};

export default LoginPage;