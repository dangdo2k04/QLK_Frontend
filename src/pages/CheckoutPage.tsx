import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Form, Input, Button, Card, Typography, Divider, Select, message, Result, Spin, Skeleton } from 'antd';
import { CarOutlined, GiftOutlined, ShoppingOutlined, ArrowLeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverOrderData, setServerOrderData] = useState<any>(null);

  // 1. Lấy dữ liệu thô từ location state
  const rawItems = (location.state as any)?.checkoutItems || [];

  // 2. Hàm gọi Server để xác minh dữ liệu đơn hàng (Giá, tồn kho, phí ship)
  const syncOrderWithServer = async () => {
    if (rawItems.length === 0) return;
    
    try {
      setLoading(true);
      // Giả sử bạn có endpoint POST /don-hang/pre-check hoặc xử lý trực tiếp
      // Ở đây chúng ta gửi danh sách ID và số lượng để Server tính toán lại
      const payload = {
        items: rawItems.map((item: any) => ({
          sanPhamId: item.sanPham,
          soLuong: item.soLuong
        }))
      };

      // Gọi API để lấy thông tin đơn hàng "xịn" từ Server
      const response = await api.post('/don-hang/kiem-tra', payload);
      
      if (response.data.success) {
        setServerOrderData(response.data.duLieu);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xác minh thông tin sản phẩm');
      // Nếu lỗi nghiêm trọng (hết hàng), có thể điều hướng về giỏ hàng
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncOrderWithServer();
    if (user) {
      form.setFieldsValue({
        name: user.ten || '',
        email: user.email || '',
        phone: user.soDienThoai || '',
        address: user.diaChi || '',
        paymentMethod: 'TienMat'
      });
    }
  }, [user, form]);

  // 3. Hàm xác nhận đặt hàng thực tế
  const handleConfirmOrder = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Sử dụng dữ liệu đã được Server xác minh ở bước trước
      const payload = {
        items: serverOrderData.items.map((item: any) => ({
          sanPhamId: item.sanPham._id,
          soLuong: item.soLuong
        })),
        phuongThucThanhToan: values.paymentMethod,
        diaChiGiaoHang: values.address,
        ghiChu: values.ghiChu || "Giao giờ hành chính"
      };

      const response = await api.post('/don-hang', payload);

      if (response.data.success) {
        message.success('🎉 Đặt hàng thành công!');
        navigate('/my-orders');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (rawItems.length === 0) {
    return (
      <Result
        status="warning"
        title="Thông tin thanh toán đã hết hạn"
        extra={<Button type="primary" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</Button>}
      />
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/cart')} style={{ marginBottom: 20, padding: 0 }}>
        Quay lại giỏ hàng
      </Button>

      <Title level={2} style={{ marginBottom: '30px' }}><ShoppingOutlined /> Xác nhận đơn hàng</Title>
      
      <Form form={form} layout="vertical" onFinish={handleConfirmOrder}>
        <Row gutter={32}>
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
          <Col xs={24} lg={14}>
            <Card title={<span><SafetyCertificateOutlined style={{ color: '#52c41a' }} /> Thông tin người nhận</span>} bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Skeleton loading={loading} active>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="name" label="Tên khách hàng"><Input disabled /></Form.Item></Col>
                  <Col span={12}><Form.Item name="email" label="Email"><Input disabled /></Form.Item></Col>
                </Row>
                <Form.Item name="phone" label="Số điện thoại nhận hàng" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}><Input placeholder="Số điện thoại shipper liên lạc" /></Form.Item>
                <Form.Item name="address" label="Địa chỉ giao hàng thực tế" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chính xác!' }]}><Input.TextArea rows={3} placeholder="Số nhà, tên đường, Phường/Xã..." /></Form.Item>
                <Form.Item name="paymentMethod" label="Phương thức thanh toán"><Select size="large"><Select.Option value="TienMat">COD - Tiền mặt</Select.Option><Select.Option value="ChuyenKhoan">Chuyển khoản</Select.Option></Select></Form.Item>
              </Skeleton>
            </Card>
          </Col>

          {/* CỘT PHẢI: CHI TIẾT TỪ SERVER */}
          <Col xs={24} lg={10}>
            <Card title="Tóm tắt đơn hàng" bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: '#fafafa' }}>
              <Spin spinning={loading}>
                {serverOrderData?.items.map((item: any) => (
                  <div key={item.sanPham._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <img src={item.sanPham.hinhAnh?.[0]} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} alt="" />
                      <div>
                        <Text strong style={{ display: 'block' }}>{item.sanPham.tenSanPham}</Text>
                        <Text type="secondary">x {item.soLuong}</Text>
                      </div>
                    </div>
                    <Text strong>{(item.sanPham.giaBan * item.soLuong).toLocaleString()} đ</Text>
                  </div>
                ))}
                
                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text type="secondary">Tạm tính:</Text>
                  <Text>{serverOrderData?.tamTinh.toLocaleString()} đ</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text type="secondary"><CarOutlined /> Phí vận chuyển:</Text>
                  <Text>{serverOrderData?.phiVanChuyen === 0 ? 'Miễn phí' : `${serverOrderData?.phiVanChuyen.toLocaleString()} đ`}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text type="secondary"><GiftOutlined /> Giảm giá:</Text>
                  <Text style={{ color: '#52c41a' }}>- {serverOrderData?.khuyenMai.toLocaleString()} đ</Text>
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                  <Title level={4}>Tổng cộng:</Title>
                  <Title level={4} style={{ color: '#f5222d', margin: 0 }}>
                    {serverOrderData?.tongThanhToan.toLocaleString()} đ
                  </Title>
                </div>

                <Button type="primary" block size="large" htmlType="submit" loading={submitting} disabled={loading} style={{ height: '54px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }}>
                  XÁC NHẬN ĐẶT HÀNG
                </Button>
              </Spin>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CheckoutPage;