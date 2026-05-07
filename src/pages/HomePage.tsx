import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { Image, Row, Col, Select, Button, Spin, Empty, Badge, Tag, Typography, Divider, Card, Space } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined,
  ShoppingCartOutlined,
  FireOutlined,
  AppstoreOutlined,
  FilterOutlined
} from '@ant-design/icons';

// Assets
import slideshow_1 from '../assets/images/slideshow_1.png';

import slideshow_3 from '../assets/images/slideshow_3.png';

// CSS
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Footer from '../components/layout/Footer';

const { Title, Text } = Typography;

// Interfaces
interface Category {
  _id: string;
  tenDanhMuc: string;
}

interface Product {
  _id: string;
  tenSanPham: string;
  giaBan: number;
  tonKho: number;
  hinhAnh: string[];
  maSanPham: string;
}

const arrImages = [slideshow_1, slideshow_3];

// Component Slider
const SliderComponent: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true
  };

  return (
    <div style={{ width: '100%', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <Slider {...settings}>
        {arrImages.map((image, index) => (
          <Image
            key={index}
            src={image}
            preview={false}
            width="100%"
            height="450px"
            style={{ objectFit: 'cover' }}
          />
        ))}
      </Slider>
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('createdAt,desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 12;

  // 1. Lấy danh sách danh mục khi load trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/danh-muc');
        if (response.data.success) setCategories(response.data.duLieu);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Lấy danh sách sản phẩm theo bộ lọc và phân trang
  // Thêm useEffect để reset trang về 1 khi lọc
useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory, sortOrder]); // Mỗi khi đổi loại hoặc sắp xếp, về trang 1

useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/san-pham', {
        params: {
          trang: currentPage,
          gioiHan: itemsPerPage,
          sapXep: sortOrder,
          // Nếu Backend nhận ID, đảm bảo selectedCategory là ID
          danhMuc: selectedCategory === 'all' ? undefined : selectedCategory
        }
      });

      if (response.data.success) {
        setProducts(response.data.duLieu);
        // Kiểm tra đúng tên trường trả về từ Backend (của bạn là soLuong)
        setTotalItems(response.data.soLuong || 0); 
      }
    } catch (err) {
      console.error('Lỗi lấy sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
  // Bổ sung itemsPerPage vào đây
}, [sortOrder, currentPage, selectedCategory, itemsPerPage]); 

const handlePageChange = (newPage: number) => {
  setCurrentPage(newPage);
  // Cuộn lên đầu danh sách sản phẩm thay vì số cứng 500
  const productListTop = document.getElementById('product-list')?.offsetTop || 500;
  window.scrollTo({ top: productListTop - 100, behavior: 'smooth' });
};

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
        
        <SliderComponent />

        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <Title level={1} style={{ color: '#df5dcb', fontSize: '3.5rem', marginBottom: '0' }}>
            ĐĂNG ĐÔ <span style={{ color: '#df5dcb' }}>BRICK</span>
          </Title>
          <Text style={{ fontSize: '1.2rem', color: '#595959' }}>Mô hình lắp ghép thông minh - Giá rẻ vô đối</Text>
        </div>

        <Row gutter={[30, 30]}>
          {/* SIDEBAR FILTER */}
          <Col xs={24} lg={6}>
            <Card 
              style={{ borderRadius: '15px', position: 'sticky', top: '20px', boxShadow: '0 4px 12px rgba(247, 86, 233, 0.05)' }}
              title={<span><FilterOutlined /> BỘ LỌC TÌM KIẾM</span>}
            >
              <div style={{ marginBottom: '25px' }}>
                <Text strong><AppstoreOutlined /> Theo danh mục</Text>
                <Select
                  value={selectedCategory}
                  style={{ width: '100%', marginTop: '10px' }}
                  onChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
                >
                  <Select.Option value="all">Tất cả sản phẩm</Select.Option>
                  {categories.map((cat) => (
                    <Select.Option key={cat._id} value={cat._id}>{cat.tenDanhMuc}</Select.Option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <Text strong><FireOutlined /> Sắp xếp theo giá</Text>
                <Select
                  value={sortOrder}
                  style={{ width: '100%', marginTop: '10px' }}
                  onChange={(val) => setSortOrder(val)}
                  options={[
                    { value: 'createdAt,desc', label: 'Mới cập nhật' },
                    { value: 'giaBan,asc', label: 'Giá thấp đến cao ↑' },
                    { value: 'giaBan,desc', label: 'Giá cao đến thấp ↓' },
                  ]}
                />
              </div>

              <Divider />
              <div style={{ background: '#e6f7ff', padding: '15px', borderRadius: '8px' }}>
                <Text type="secondary">Hotline hỗ trợ:</Text>
                <Title level={5} style={{ margin: 0, color: '#1890ff' }}>0367 688 688</Title>
              </div>
            </Card>
          </Col>

          {/* PRODUCT GRID */}
          <Col xs={24} lg={18}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tìm xe xịn cho bạn..." /></div>
            ) : products.length === 0 ? (
              <Empty description="Không có sản phẩm nào trong mục này" />
            ) : (
              <>
                <Row gutter={[20, 25]}>
                  {products.map((product) => (
                    <Col xs={12} sm={12} md={8} key={product._id}>
                      <Badge.Ribbon 
                        text={product.tonKho > 0 ? "Sẵn hàng" : "Hết hàng"} 
                        color={product.tonKho > 0 ? "#52c41a" : "#d9d9d9"}
                      >
                        <Card
                          hoverable
                          className="product-card"
                          onClick={() => navigate(`/san-pham/${product._id}`)}
                          style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0' }}
                          cover={
                            <div style={{ height: '220px', overflow: 'hidden' }}>
                              <img
                                alt={product.tenSanPham}
                                src={product.hinhAnh?.[0]}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          }
                        >
                          <div style={{ height: '50px', marginBottom: '10px', overflow: 'hidden' }}>
                            <Text strong style={{ fontSize: '16px' }}>{product.tenSanPham}</Text>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="danger" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                              {product.giaBan.toLocaleString()} đ
                            </Text>
                            <Tag color={product.tonKho > 5 ? "blue" : "orange"}>Kho: {product.tonKho}</Tag>
                          </div>

                          <Button 
                            type="primary" 
                            block 
                            icon={<ShoppingCartOutlined />}
                            style={{ marginTop: '15px', borderRadius: '6px' }}
                            disabled={product.tonKho <= 0}
                          >
                            Xem chi tiết
                          </Button>
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  ))}
                </Row>

                {/* PHÂN TRANG */}
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                  <Space>
                    <Button 
                      icon={<LeftOutlined />} 
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                    <Text strong>Trang {currentPage} / {Math.ceil(totalItems / itemsPerPage) || 1}</Text>
                    <Button 
                      icon={<RightOutlined />} 
                      disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </Space>
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
      
      <Footer />

      <style>{`
        .product-card { transition: all 0.3s ease; }
        .product-card:hover { 
          transform: translateY(-10px); 
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
          border-color: #df5dcb !important;
        }
      `}</style>
    </div>
  );
};

export default HomePage;