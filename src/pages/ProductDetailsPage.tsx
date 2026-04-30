import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { Row, Col, Carousel, Tag, InputNumber, Button, Typography, Divider, message, Card, Drawer, Space } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined, SafetyOutlined, DropboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Footer from '../components/layout/Footer';

const { Title, Text, Paragraph } = Typography;

interface Category {
  _id: string;
  tenDanhMuc: string;
  moTa: string;
}

interface Product {
  _id: string;
  maSanPham: string;
  tenSanPham: string;
  moTa: string;
  giaBan: number;
  tonKho: number;
  donViTinh: string;
  hinhAnh: string[];
  danhMuc: Category;
}

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionType, setActionType] = useState<'ADD' | 'BUY'>('ADD');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/san-pham/${id}`);
        const fetchedProduct = response.data.duLieu;
        setProduct(fetchedProduct);

        // Lấy sản phẩm cùng danh mục
        const similarRes = await api.get(`/san-pham/danh-muc/${fetchedProduct.danhMuc._id}`);
        const filtered = (similarRes.data.duLieu || []).filter((p: Product) => p._id !== id).slice(0, 4);
        setSimilarProducts(filtered);
      } catch (err) {
        message.error('Không tìm thấy sản phẩm!');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      message.warning('Vui lòng đăng nhập để thực hiện');
      return;
    }
    try {
      await api.post('/gio-hang', { sanPhamId: product?._id, soLuong: quantity });
      message.success('Đã thêm sản phẩm vào giỏ hàng!');
      setIsDrawerOpen(false); // Đóng form xác nhận
      setQuantity(1); // Reset số lượng
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
    }
  };

  const handleCheckout = () => {
    if (!token) {
      message.warning('Vui lòng đăng nhập để thanh toán');
      return;
    }
    if (product) {
      const itemsToOrder = [{ 
        sanPhamId: product._id, 
        soLuong: quantity 
      }];
      // Điều hướng thẳng tới trang checkout với dữ liệu tạm thời
      navigate('/checkout', { state: { items: itemsToOrder } });
    }
  };

  const showConfirmForm = (type: 'ADD' | 'BUY') => {
    setActionType(type);
    setIsDrawerOpen(true);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>Không có dữ liệu sản phẩm.</div>;

  return (
    <div style={{ background: '#f4f6f8', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[40, 40]}>
          {/* CỘT TRÁI: HÌNH ẢNH */}
          <Col xs={24} md={10}>
            <Card style={{ borderRadius: '15px', overflow: 'hidden' }} bodyStyle={{ padding: 10 }}>
              <Carousel autoplay arrows dots={true}>
                {product.hinhAnh.map((img, index) => (
                  <div key={index}>
                    <img 
                      src={img} 
                      alt={product.tenSanPham} 
                      style={{ width: '100%', height: '400px', objectFit: 'contain' }} 
                    />
                  </div>
                ))}
              </Carousel>
            </Card>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN */}
          <Col xs={24} md={14}>
            <div style={{ padding: '0 10px' }}>
              <Space>
                <Tag color="blue">{product.danhMuc.tenDanhMuc}</Tag>
                <Text type="secondary">Mã: {product.maSanPham}</Text>
              </Space>
              
              <Title level={1} style={{ marginTop: '10px', fontSize: '32px' }}>{product.tenSanPham}</Title>
              
              <div style={{ margin: '15px 0' }}>
                <Title level={2} style={{ color: '#f5222d', margin: 0 }}>
                  {product.giaBan.toLocaleString('vi-VN')} VNĐ
                </Title>
                <Text type="secondary">Đơn vị tính: {product.donViTinh}</Text>
              </div>

              <Divider />

              <Paragraph style={{ fontSize: '16px' }}>
                <DropboxOutlined /> <strong>Tình trạng:</strong> {product.tonKho > 0 ? `${product.tonKho} sản phẩm trong kho` : 'Hết hàng'}
              </Paragraph>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Text strong>Mô tả chi tiết:</Text>
                <p style={{ marginTop: '10px', color: '#595959' }}>{product.moTa}</p>
              </div>

              {/* NÚT BẤM CHÍNH */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <Button 
                  size="large" 
                  icon={<ShoppingCartOutlined />} 
                  onClick={() => showConfirmForm('ADD')}
                  style={{ flex: 1, height: '54px', borderRadius: '8px' }}
                >
                  Thêm vào giỏ
                </Button>
                <Button 
                  type="primary" 
                  danger 
                  size="large" 
                  icon={<CreditCardOutlined />} 
                  onClick={() => showConfirmForm('BUY')}
                  style={{ flex: 1, height: '54px', borderRadius: '8px', fontWeight: 'bold' }}
                >
                  Mua hàng ngay
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* DRAWER XÁC NHẬN (FORM CHỌN SỐ LƯỢNG) */}
        <Drawer
          title={actionType === 'ADD' ? "Thêm vào giỏ hàng" : "Xác nhận đặt hàng"}
          placement="bottom"
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
          height={380}
          headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <img 
              src={product.hinhAnh[0]} 
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #f0f0f0' }} 
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>{product.tenSanPham}</Title>
              <Text style={{ fontSize: '20px', color: '#f5222d', fontWeight: 'bold' }}>
                {product.giaBan.toLocaleString()} đ
              </Text>
              <div style={{ marginTop: 5 }}>
                 <Text type="secondary">Kho: {product.tonKho} | Đơn vị: {product.donViTinh}</Text>
              </div>
            </div>
          </div>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Số lượng muốn mua:</Text>
            <InputNumber 
              min={1} 
              max={product.tonKho} 
              value={quantity} 
              onChange={(val) => setQuantity(val || 1)} 
              size="large"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <Text strong>Tổng thanh toán:</Text>
            <Title level={3} style={{ color: '#f5222d', margin: 0 }}>
              {(product.giaBan * quantity).toLocaleString()} đ
            </Title>
          </div>

          <Button 
            type="primary" 
            block 
            size="large" 
            danger={actionType === 'BUY'}
            icon={actionType === 'ADD' ? <ShoppingCartOutlined /> : <CheckCircleOutlined />}
            style={{ height: '50px', marginTop: '20px', borderRadius: '8px', fontWeight: 'bold' }}
            onClick={actionType === 'ADD' ? handleAddToCart : handleCheckout}
          >
            {actionType === 'ADD' ? 'XÁC NHẬN THÊM' : 'THANH TOÁN NGAY'}
          </Button>
        </Drawer>

        {/* SẢN PHẨM TƯƠNG TỰ */}
        <div style={{ marginTop: '60px' }}>
          <Divider orientation="left"><Title level={3}>Sản phẩm cùng loại</Title></Divider>
          <Row gutter={[20, 20]}>
            {similarProducts.map((p) => (
              <Col xs={12} sm={8} md={6} key={p._id}>
                <Link to={`/product/${p._id}`}>
                  <Card
                    hoverable
                    cover={<img alt={p.tenSanPham} src={p.hinhAnh[0]} style={{ height: '180px', objectFit: 'cover' }} />}
                  >
                    <Card.Meta 
                      title={p.tenSanPham} 
                      description={<Text type="danger" strong>{p.giaBan.toLocaleString()} đ</Text>}
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;