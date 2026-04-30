import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Checkbox, InputNumber, message, Empty, Spin, Typography, Divider, Row, Col, Alert,  } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowLeftOutlined, BulbOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;

interface Product {
  _id: string;
  tenSanPham: string;
  giaBan: number;
  hinhAnh: string[];
}

interface CartItem {
  _id: string;
  sanPham: Product;
  soLuong: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const { token } = useAuth();
  const navigate = useNavigate();

  const [paymentDetail, setPaymentDetail] = useState({
    tamTinh: 0,
    phiVanChuyen: 0,
    khuyenMai: 0,
    tongThanhToan: 0
  });

  const fetchCartItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/gio-hang'); 
      if (response.data.success) {
        setCartItems(response.data.duLieu.items || []);
        if (response.data.chiTietThanhToan) {
          setPaymentDetail(response.data.chiTietThanhToan);
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        message.error('Không thể đồng bộ dữ liệu giỏ hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [token]);

  const handleUpdateQuantity = async (itemId: string, moiSoLuong: number) => {
    if (moiSoLuong < 1) return;
    try {
      // SỬA: Nối itemId (item._id) vào URL theo đúng req.params của Backend
      const response = await api.put(`/gio-hang/${itemId}`, { 
        soLuong: moiSoLuong 
      });
      
      if (response.data.success) {
        // Cập nhật lại danh sách items và chi tiết thanh toán từ response
        setCartItems(response.data.duLieu.items);
        setPaymentDetail(response.data.chiTietThanhToan);
        message.success('Đã cập nhật số lượng');
      }
    } catch (err: any) {
      // Hiển thị lỗi tồn kho từ Backend (số lượng vượt quá...)
      message.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };


  const handleRemoveItem = async (sanPhamId: string) => {
    try {
      const response = await api.delete(`/gio-hang/${sanPhamId}`);
      if (response.data.success) {
        message.success('Đã xóa sản phẩm');
        fetchCartItems();
      }
    } catch (err) {
      message.error('Lỗi khi xóa sản phẩm');
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#1890ff' }}><ArrowLeftOutlined /> Tiếp tục mua sắm</Link>
      </div>
      
      <Title level={2} style={{ marginBottom: '30px' }}>
        <ShoppingCartOutlined /> Giỏ hàng ({cartItems.length})
      </Title>
      
      <Spin spinning={loading} tip="Đang tải giỏ hàng...">
        {cartItems.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_DEFAULT}
            description="Giỏ hàng của bạn đang trống" 
          >
            <Button type="primary" onClick={() => navigate('/')}>Mua sắm ngay</Button>
          </Empty>
        ) : (
          <Row gutter={30}>
            <Alert
              message={<Text strong>Mẹo tiết kiệm cho bạn!</Text>}
              description={
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>
                    Mua thêm <Text strong color="red">{(1000000 - paymentDetail.tamTinh > 0) ? (1000000 - paymentDetail.tamTinh).toLocaleString() : 0} đ</Text> để được <Text strong style={{color: '#52c41a'}}>Miễn phí vận chuyển</Text> (áp dụng đơn từ 1tr).
                  </li>
                  <li>
                    Đơn hàng trên <Text strong>1.000.000 đ</Text> sẽ được giảm ngay <Text strong style={{color: '#52c41a'}}>50.000 đ</Text> trực tiếp vào hóa đơn.
                  </li>
                </ul>
              }
              type="info"
              showIcon
              icon={<BulbOutlined />}
              style={{ marginBottom: '20px', borderRadius: '10px' }}
            />
            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <Col xs={24} lg={16}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {cartItems.map((item) => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Checkbox 
                      checked={selectedItems.has(item._id)} 
                      onChange={() => {
                        const newSet = new Set(selectedItems);
                        newSet.has(item._id) ? newSet.delete(item._id) : newSet.add(item._id);
                        setSelectedItems(newSet);
                      }} 
                    />
                    
                    <img 
                      src={item.sanPham.hinhAnh[0]} 
                      alt={item.sanPham.tenSanPham} 
                      style={{ width: '90px', height: '90px', objectFit: 'cover', margin: '0 20px', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                    />

                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: '16px', display: 'block' }}>{item.sanPham.tenSanPham}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Mã SP: {item.sanPham._id.substring(0,8).toUpperCase()}</Text>
                      <div style={{ color: '#f5222d', fontWeight: 'bold', fontSize: '16px', marginTop: '5px' }}>
                        {item.sanPham.giaBan.toLocaleString()} đ
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <InputNumber 
                        min={1} 
                        value={item.soLuong} 
                        onChange={(val) => handleUpdateQuantity(item._id, val || 1)} 
                      />
                      <Button 
                        type="text"
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleRemoveItem(item._id)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            {/* CỘT PHẢI: TÓM TẮT THANH TOÁN */}
            <Col xs={24} lg={8}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
                <Title level={4} style={{ marginBottom: '20px' }}>Tóm tắt đơn hàng</Title>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text type="secondary">Tạm tính</Text>
                  <Text strong>{paymentDetail.tamTinh.toLocaleString()} đ</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text type="secondary">Phí vận chuyển</Text>
                  <Text strong>{paymentDetail.phiVanChuyen === 0 ? 'Miễn phí' : `${paymentDetail.phiVanChuyen.toLocaleString()} đ`}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text type="secondary">Khuyến mãi</Text>
                  <Text strong style={{ color: '#52c41a' }}>- {paymentDetail.khuyenMai.toLocaleString()} đ</Text>
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <Text strong>Tổng cộng</Text>
                  <Text style={{ fontSize: '20px', color: '#f5222d', fontWeight: 'bold' }}>
                    {paymentDetail.tongThanhToan.toLocaleString()} đ
                  </Text>
                </div>

                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  style={{ height: '50px', fontSize: '16px', borderRadius: '8px', fontWeight: 'bold' }}
                  onClick={() => navigate('/checkout')}
                >
                  THANH TOÁN NGAY
                </Button>
                
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Sẵn sàng để sở hữu những mô hình xe đẳng cấp nhất?
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default CartPage;