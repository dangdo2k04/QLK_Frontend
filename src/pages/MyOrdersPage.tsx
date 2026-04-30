import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { Card, Col, Row, Tag, Spin, Typography, Button, Empty, Divider } from 'antd';
import { ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, CarOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// 1. Định nghĩa Interface khớp với Backend
interface OrderItem {
  _id: string;
  sanPham: {
    tenSanPham: string;
    hinhAnh: string[];
    giaBan: number;
  };
  soLuong: number;
  giaLucDat: number;
}

interface Order {
  _id: string;
  maDonHang: string;
  tongTien: number;
  trangThaiDonHang: 'ChoXacNhan' | 'DangGiao' | 'DaHoanThanh' | 'DaHuy';
  phuongThucThanhToan: string;
  chiTietDonHang: OrderItem[]; // Đổi từ items sang chiTietDonHang cho khớp Logic Backend
  createdAt: string;
}

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // 2. Hàm lấy danh sách đơn hàng (Fix Route 404)
  const fetchMyOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Gọi đúng route Backend: baseURL đã có /api/v1 nên chỉ cần /don-hang/me
      const response = await api.get('/don-hang/lich-su-mua-hang'); 
      if (response.data.success) {
        setOrders(response.data.duLieu);
      }
    } catch (err: any) {
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [token]);

  // 3. Hàm render Tag trạng thái cho chuyên nghiệp
  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'ChoXacNhan': return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ xác nhận</Tag>;
      case 'DangGiao': return <Tag icon={<CarOutlined />} color="processing">Đang giao hàng</Tag>;
      case 'DaHoanThanh': return <Tag icon={<CheckCircleOutlined />} color="success">Đã hoàn thành</Tag>;
      case 'DaHuy': return <Tag icon={<CloseCircleOutlined />} color="error">Đã hủy</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tải đơn hàng..." /></div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}><ShoppingOutlined /> Đơn hàng của tôi</Title>
      <Divider />

      {orders.length === 0 ? (
        <Empty description="Bạn chưa có đơn hàng nào" children={<Button type="primary" onClick={() => window.location.href='/'}>Mua sắm ngay</Button>} />
      ) : (
        <Row gutter={[20, 20]}>
          {orders.map((order) => (
            <Col key={order._id} span={24}>
              <Card 
                hoverable
                style={{ borderRadius: '12px', borderLeft: '5px solid #1890ff' }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Mã đơn: {order.maDonHang}</Text>
                    {renderStatusTag(order.trangThaiDonHang)}
                  </div>
                }
              >
                <Row gutter={20}>
                  <Col xs={24} md={16}>
                    <div style={{ marginBottom: '10px' }}>
                      <Text type="secondary">Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
                    </div>
                    
                    {/* Hiển thị tóm tắt sản phẩm */}
                    {order.chiTietDonHang?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <img 
                          src={item.sanPham?.hinhAnh[0]} 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                          alt="product"
                        />
                        <Text>{item.sanPham?.tenSanPham} <Text type="secondary">x{item.soLuong}</Text></Text>
                      </div>
                    ))}
                  </Col>
                  
                  <Col xs={24} md={8} style={{ textAlign: 'right', borderLeft: '1px solid #f0f0f0' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <Text type="secondary">Tổng thanh toán:</Text>
                      <div style={{ fontSize: '20px', color: '#f5222d', fontWeight: 'bold' }}>
                        {order.tongTien.toLocaleString()} đ
                      </div>
                    </div>
                    <Button type="primary" ghost onClick={() => window.location.href=`/don-hang/${order._id}`}>
                      Xem chi tiết đơn
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyOrdersPage;