import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert } from 'antd';
//const { Title } = Typography;
import api from '../config/axios';
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldprice: number;
  images: { url: string }[];
  category: string;
}

const ProductList: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const normalizedCategory = category?.replace(/-/g, ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const response = await api.get(`/category/${normalizedCategory}`);
        setProducts(response.data.data || []);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Lỗi khi tải sản phẩm theo danh mục';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const hideProductName = (name: string, lengthToShow = 20) => {
    if (!name || name.length <= lengthToShow) {
      return name;
    }
    return `${name.substring(0, lengthToShow)}...`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Danh sách Sản phẩm hãng {category} </h1>
            {loading ? (
        <Spin tip="Đang tải..." style={{ display: 'block', textAlign: 'center' }} />
      ) : error ? (
        <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: '16px' }} />
      ) : products.length === 0 ? (
        <Alert message="Thông báo" description="Không có sản phẩm trong danh mục này" type="info" showIcon style={{ marginBottom: '16px' }} />
      ) : (
        <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        padding: '20px 0',
      }}>
        {products.map(product => (
          <Link
            to={`/product/${product._id}`}
            key={product._id}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              border: '2px solid #000c0fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 5px 5px rgba(10, 10, 0, 0)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              backgroundColor: '#ffffffff'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <img
                src={product.images[0]?.url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                }}
              />
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.2em', marginBottom: '10px', color: '#333' }}>{hideProductName(product.name)}</h2>
                <p style={{ color: '#ff5722', fontWeight: 'bold' }}><del>{product.oldprice.toLocaleString()} VNĐ</del></p>
                <p style={{ color: '#ff5722', fontWeight: 'bold' }}>Giảm còn {product.price.toLocaleString()} VNĐ</p>
                <button style={{
                  background: '#ff5722',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  marginTop: '15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1em'
                }}>Xem chi tiết</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
};

export default ProductList;