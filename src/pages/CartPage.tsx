import React, { useState, useEffect, useMemo } from 'react';
import api from '../config/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Checkbox, InputNumber, message, Empty, Spin, Typography, Divider, Row, Col, Alert, Tooltip } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowLeftOutlined, BulbOutlined, CheckCircleOutlined } from '@ant-design/icons';

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

  const fetchCartItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/gio-hang'); 
      if (response.data.success) {
        const items = response.data.duLieu.items || [];
        setCartItems(items);
        // Mặc định chọn tất cả sản phẩm khi mới vào giỏ hàng
        setSelectedItems(new Set(items.map((i: any) => i._id)));
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

  // LOGIC TÍNH TOÁN DỰA TRÊN CÁC MÓN ĐÃ CHỌN
  const checkoutSummary = useMemo(() => {
    const selectedList = cartItems.filter(item => selectedItems.has(item._id));
    const tamTinh = selectedList.reduce((sum, item) => sum + (item.sanPham.giaBan * item.soLuong), 0);
    const phiVanChuyen = (tamTinh >= 1000000 || tamTinh === 0) ? 0 : 30000;
    const khuyenMai = tamTinh >= 2000000 ? 50000 : 0;
    const tongThanhToan = tamTinh + phiVanChuyen - khuyenMai;

    return { tamTinh, phiVanChuyen, khuyenMai, tongThanhToan, selectedList };
  }, [cartItems, selectedItems]);

  const handleUpdateQuantity = async (itemId: string, moiSoLuong: number) => {
    if (moiSoLuong < 1) return;
    try {
      const response = await api.put(`/gio-hang/${itemId}`, { soLuong: moiSoLuong });
      if (response.data.success) {
        setCartItems(response.data.duLieu.items);
        message.success('Đã cập nhật số lượng');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await api.delete(`/gio-hang/${itemId}`);
      if (response.data.success) {
        message.success('Đã xóa sản phẩm');
        fetchCartItems();
      }
    } catch (err) {
      message.error('Lỗi khi xóa sản phẩm');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(i => i._id)));
    }
  };

  // HÀM CHUYỂN SANG THANH TOÁN
  const handleGoToCheckout = () => {
    if (selectedItems.size === 0) {
      return message.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
    }

    // Đóng gói dữ liệu những món đã chọn để gửi sang trang Checkout
    const dataToCheckout = cartItems
      .filter(item => selectedItems.has(item._id))
      .map(item => ({
        sanPham: item.sanPham._id,
        tenSanPham: item.sanPham.tenSanPham,
        soLuong: item.soLuong,
        gia: item.sanPham.giaBan,
        hinhAnh: item.sanPham.hinhAnh[0]
      }));

    navigate('/checkout', { state: { checkoutItems: dataToCheckout } });
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
          <Empty description="Giỏ hàng của bạn đang trống">
            <Button type="primary" onClick={() => navigate('/')}>Mua sắm ngay</Button>
          </Empty>
        ) : (
          <Row gutter={30}>
            <Col span={24}>
               <Alert
                message={<Text strong>Mẹo tiết kiệm cho bạn!</Text>}
                description={
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li>Miễn phí vận chuyển cho đơn hàng từ <Text strong color="green">1.000.000 đ</Text></li>
                    <li>Giảm trực tiếp <Text strong color="green">50.000 đ</Text> cho đơn từ 2.000.000 đ</li>
                  </ul>
                }
                type="info"
                showIcon
                icon={<BulbOutlined />}
                style={{ marginBottom: '20px', borderRadius: '10px' }}
              />
            </Col>

            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <Col xs={24} lg={16}>
              <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Checkbox 
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0} 
                  onChange={toggleSelectAll}
                >
                  Chọn tất cả ({cartItems.length})
                </Checkbox>
              </div>

              <div style={{ background: '#fff', padding: '0 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
                      style={{ width: '80px', height: '80px', objectFit: 'cover', margin: '0 20px', borderRadius: '8px' }}
                    />

                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: '15px' }}>{item.sanPham.tenSanPham}</Text>
                      <div style={{ color: '#f5222d', fontWeight: 'bold' }}>
                        {item.sanPham.giaBan.toLocaleString()} đ
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <InputNumber 
                        min={1} 
                        value={item.soLuong} 
                        onChange={(val) => handleUpdateQuantity(item._id, val || 1)} 
                      />
                      <Tooltip title="Xóa khỏi giỏ">
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleRemoveItem(item._id)} 
                        />
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            {/* CỘT PHẢI: TÓM TẮT THANH TOÁN */}
            <Col xs={24} lg={8}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
                <Title level={4} style={{ marginBottom: '20px' }}>Tóm tắt thanh toán</Title>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text type="secondary">Sản phẩm đã chọn</Text>
                  <Text strong>{selectedItems.size}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text type="secondary">Tạm tính</Text>
                  <Text strong>{checkoutSummary.tamTinh.toLocaleString()} đ</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text type="secondary">Phí vận chuyển</Text>
                  <Text strong>{checkoutSummary.phiVanChuyen === 0 ? 'Miễn phí' : `${checkoutSummary.phiVanChuyen.toLocaleString()} đ`}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text type="secondary">Khuyến mãi</Text>
                  <Text strong style={{ color: '#52c41a' }}>- {checkoutSummary.khuyenMai.toLocaleString()} đ</Text>
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <Text strong>Tổng thanh toán</Text>
                  <Text style={{ fontSize: '22px', color: '#f5222d', fontWeight: 'bold' }}>
                    {checkoutSummary.tongThanhToan.toLocaleString()} đ
                  </Text>
                </div>

                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  icon={<CheckCircleOutlined />}
                  style={{ height: '50px', fontSize: '16px', borderRadius: '8px', fontWeight: 'bold' }}
                  onClick={handleGoToCheckout}
                  disabled={selectedItems.size === 0}
                >
                  THANH TOÁN ({selectedItems.size})
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default CartPage;