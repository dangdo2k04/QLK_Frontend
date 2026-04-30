import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext'; 
import { Card, Steps, Tag, Typography, Divider, Button, Row, Col, Spin, Alert, Empty } from 'antd';
import { ShoppingOutlined, UserOutlined, HomeOutlined, ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, CarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Định nghĩa lại Interface khớp với JSON thực tế
interface OrderDetails {
  _id: string;
  maDonHang: string;
  khachHang: {
    ten: string;
    email: string;
    soDienThoai: string;
    diaChi: string;
  };
  items: {
    _id: string;
    sanPham: {
      _id: string;
      tenSanPham: string;
      hinhAnh: string[];
    };
    soLuong: number;
    giaLucBan: number;
  }[];
  tongTien: number;
  phuongThucThanhToan: string;
  trangThaiDonHang: string;
  ghiChu: string;
  createdAt: string;
}

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Lưu ý: URL khớp với Route backend của bạn
        const response = await api.get(`/don-hang/${id}`);
        setOrder(response.data.duLieu);
        console.log("Dữ liệu nhận về:", response.data.duLieu);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi tải chi tiết đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id, token]);

  // Hàm xác định vị trí của Steps dựa trên trạng thái
  const getStepStatus = (status: string) => {
    switch (status) {
      case 'ChoXacNhan': return 0;
      case 'DaXacNhan': return 1;
      case 'DangGiao': return 2;
      case 'DaHoanThanh': return 3;
      default: return 0;
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tải chi tiết..." /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon action={<Button onClick={() => navigate('/my-orders')}>Quay lại</Button>} />;
  if (!order) return <Empty description="Không tìm thấy đơn hàng" />;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/my-orders')} style={{ marginBottom: 20 }}>
        Quay lại danh sách
      </Button>

      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Đơn hàng: {order.maDonHang}</Title>
            <Text type="secondary">Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
          </Col>
          <Col>
            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
              {order.trangThaiDonHang.toUpperCase()}
            </Tag>
          </Col>
        </Row>

        <Divider />

        {/* Tiến trình đơn hàng */}
        <Steps
          current={getStepStatus(order.trangThaiDonHang)}
          items={[
            { title: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
            { title: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
            { title: 'Đang giao', icon: <CarOutlined /> },
            { title: 'Hoàn thành', icon: <CheckCircleOutlined /> },
          ]}
          style={{ padding: '20px 0' }}
        />

        <Divider />

        <Row gutter={32}>
          {/* Thông tin khách hàng */}
          <Col xs={24} md={12}>
            <Title level={5}><UserOutlined /> Thông tin khách hàng</Title>
            <p><strong>Họ tên:</strong> {order.khachHang.ten}</p>
            <p><strong>Số điện thoại:</strong> {order.khachHang.soDienThoai}</p>
            <p><strong>Email:</strong> {order.khachHang.email}</p>
          </Col>
          {/* Thông tin giao hàng */}
          <Col xs={24} md={12}>
            <Title level={5}><HomeOutlined /> Địa chỉ giao hàng</Title>
            <p><Text copyable>{order.khachHang.diaChi}</Text></p>
            <p><strong>Ghi chú:</strong> {order.ghiChu || 'Không có'}</p>
            <p><strong>Thanh toán:</strong> <Tag color="green">{order.phuongThucThanhToan}</Tag></p>
          </Col>
        </Row>

        <Divider />

        {/* Bảng sản phẩm */}
        <Title level={5}><ShoppingOutlined /> Danh sách sản phẩm</Title>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Sản phẩm</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Số lượng</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Đơn giá</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={item.sanPham.hinhAnh[0]} alt="" style={{ width: 50, height: 50, borderRadius: 4, objectFit: 'cover' }} />
                      <Text strong>{item.sanPham.tenSanPham}</Text>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{item.soLuong}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{item.giaLucBan.toLocaleString()} đ</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{(item.giaLucBan * item.soLuong).toLocaleString()} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <Title level={4}>Tổng cộng: <span style={{ color: '#f5222d' }}>{order.tongTien.toLocaleString()} đ</span></Title>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;