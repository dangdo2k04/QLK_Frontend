import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Form, Input, Button, Card, Typography, Divider, Select, message, Spin } from 'antd';
import { CarOutlined, GiftOutlined, ShoppingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CheckoutPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Lấy dữ liệu thanh toán từ Backend (Để có phí ship và KM chính xác)
  const fetchCheckoutData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.get('/gio-hang');
      if (response.data.success) {
        setCartData(response.data);
        
        // Điền thông tin mặc định vào form
        form.setFieldsValue({
          name: user?.ten || '',
          email: user?.email || '',
          soDienThoai: user?.soDienThoai || '', // Giả định user có phone
          address: user?.diaChi || '',
          paymentMethod: 'COD'
        });
      }
    } catch (err) {
      message.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, [token]);

  // 2. Hàm xác nhận đặt hàng
  const handleConfirmOrder = async (values: any) => {
    try {
      setSubmitting(true);
      
      // 1. Map đúng cấu trúc items: sanPhamId và soLuong
      const orderItems = cartData.duLieu.items.map((item: any) => ({
        sanPhamId: item.sanPham._id,
        soLuong: item.soLuong
      }));

      // 2. Map đúng các Key mà Backend đã chạy thành công trên Postman
      const payload = {
        items: orderItems,
        phuongThucThanhToan: values.paymentMethod === 'cash' ? 'TienMat' : 'ChuyenKhoan', // Khớp với "TienMat"
        diaChiGiaoHang: values.address, // Khớp với "diaChiGiaoHang"
        ghiChu: values.ghiChu || "Giao giờ hành chính"
      };

      // 3. Gọi API
      const response = await api.post('/don-hang', payload);

      if (response.data.success) {
        message.success('🎉 Đặt hàng thành công!');
        navigate('/my-orders');
      }
    } catch (err: any) {
      // Hiển thị lỗi chi tiết từ Backend nếu có (ví dụ: hết hàng)
      message.error(err.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang chuẩn bị đơn hàng..." /></div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '30px' }}><ShoppingOutlined /> Xác nhận đơn hàng</Title>
      
      <Form form={form} layout="vertical" onFinish={handleConfirmOrder}>
        <Row gutter={32}>
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
          <Col xs={24} lg={14}>
            <Card title="Thông tin người nhận" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Tên khách hàng">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                <Input placeholder="Nhập số điện thoại liên lạc" />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ giao hàng" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chính xác!' }]}>
                <Input.TextArea rows={3} placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." />
              </Form.Item>

              <Form.Item name="ghiChu" label="Ghi chú thêm">
                <Input placeholder="Ví dụ: Giao giờ hành chính..." />
              </Form.Item>

              <Form.Item name="paymentMethod" label="Phương thức thanh toán">
                <Select size="large">
                  <Select.Option value="COD">Thanh toán khi nhận hàng (COD)</Select.Option>
                  <Select.Option value="BANK">Chuyển khoản ngân hàng</Select.Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* CỘT PHẢI: TÓM TẮT CHI PHÍ */}
          <Col xs={24} lg={10}>
            <Card 
              title="Chi tiết thanh toán" 
              style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: '#fafafa' }}
            >
              {cartData?.duLieu.items.map((item: any) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <img src={item.sanPham.hinhAnh[0]} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    <Text>{item.sanPham.tenSanPham} <br/> <small>x {item.soLuong}</small></Text>
                  </div>
                  <Text strong>{(item.sanPham.giaBan * item.soLuong).toLocaleString()} đ</Text>
                </div>
              ))}
              
              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Text type="secondary">Tạm tính:</Text>
                <Text>{cartData?.chiTietThanhToan.tamTinh.toLocaleString()} đ</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Text type="secondary"><CarOutlined /> Phí vận chuyển:</Text>
                <Text>{cartData?.chiTietThanhToan.phiVanChuyen === 0 ? 'Miễn phí' : `${cartData?.chiTietThanhToan.phiVanChuyen.toLocaleString()} đ`}</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Text type="secondary"><GiftOutlined /> Giảm giá:</Text>
                <Text style={{ color: '#52c41a' }}>- {cartData?.chiTietThanhToan.khuyenMai.toLocaleString()} đ</Text>
              </div>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <Title level={4}>Tổng cộng:</Title>
                <Title level={4} style={{ color: '#f5222d', margin: 0 }}>
                  {cartData?.chiTietThanhToan.tongThanhToan.toLocaleString()} đ
                </Title>
              </div>

              <Button 
                type="primary" 
                block 
                size="large" 
                htmlType="submit" 
                loading={submitting}
                style={{ height: '54px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }}
              >
                XÁC NHẬN ĐẶT HÀNG
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CheckoutPage;