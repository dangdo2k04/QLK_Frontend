import React from 'react';
import { Menu } from 'antd';
import { UserOutlined, CarOutlined, ShoppingCartOutlined, DashboardOutlined, AppstoreOutlined } from '@ant-design/icons';
import { NavLink, Routes, Route, useLocation } from 'react-router-dom';
import AdminUser from './AdminComponents/AdminUser';
import AdminProduct from './AdminComponents/AdminProduct';
import AdminOrder from './AdminComponents/AdminOrder';
import AdminDashboard from './AdminComponents/AdminDashboard';
import AdminCategory from './AdminComponents/AdminCategory';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  console.log('Current user:', user); // Debug user object
  if (user?.vaiTro !== 'admin') {
    return <div>Bạn không có quyền truy cập trang này</div>;
  }

  const location = useLocation();
  console.log('Current location:', location.pathname); // Debug current route

  const getItem = (
    label: string,
    key: string,
    icon?: React.ReactNode,
    path?: string
  ) => ({
    key,
    icon,
    label: <NavLink to={path || '/admin'} style={{ color: 'inherit', textDecoration: 'none' }}>{label}</NavLink>,
  });

  const items = [
    getItem('Quản lý người dùng', 'users', <UserOutlined />, '/admin/users'),
    getItem('Quản lý kho', 'products', <CarOutlined />, '/admin/products'),
    getItem('Quản lý đơn hàng', 'orders', <ShoppingCartOutlined />, '/admin/orders'),
    getItem('Thống kê', 'dashboard', <DashboardOutlined />, '/admin/dashboard'),
    getItem('Quản lý danh mục', 'categories', <AppstoreOutlined />, '/admin/categories')
  ];

  // Xác định key được chọn dựa trên route hiện tại
  const selectedKey = location.pathname.split('/').pop() || 'users';

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Menu
        selectedKeys={[selectedKey]}
        style={{ width: 256, boxShadow: '1px 1px 2px #ccc' }}
        mode="vertical"
        items={items}
      />
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
        <h1>Trang Quản Trị</h1>
        <Routes>
          <Route path="/users" element={<AdminUser />} />
          <Route path="/products" element={<AdminProduct />} />
          <Route path="/orders" element={<AdminOrder />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/categories" element={<AdminCategory />} />
          <Route path="/" element={<AdminUser />} /> {/* Mặc định hiển thị AdminUser khi truy cập /admin */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminPage;