import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row, Typography, Spin, Alert } from 'antd';
const { Title } = Typography;
import api from '../config/axios';

// Interface cho Category
interface Category {
  _id: string;
  name: string;
  image: string;
  description?: string; // Thêm tùy chọn nếu backend trả về
}

const Category: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/v1/categories');
        if (!response.data.success) throw new Error('Failed to fetch categories');
        setCategories(response.data.data || []); 
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh mục');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>Chọn Hãng Xe Yêu Thích Của Bạn</Title>
      <Row gutter={[16, 16]} justify="center">
        {categories.map((category) => (
          <Col key={category._id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <Link to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <Card
                hoverable
                style={{ width: '100%', textAlign: 'center' }}
                cover={<img alt={category.name} src={category.image} style={{ height: 120, objectFit: 'contain', padding: '10px' }} />}
                bodyStyle={{ padding: '10px 5px' }}
              >
                <Title level={4} style={{ margin: 0 }}>{category.name}</Title>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Category;