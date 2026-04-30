import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from "../../config/axios";
import { Badge, Dropdown, Avatar, Typography, message, Space } from "antd";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  LogoutOutlined,
  DashboardOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import NotificationDropdown from './NotificationDropdown'; // Import Component con

const { Text } = Typography;

const Header: React.FC = () => {
  const { user, logout, token } = useAuth();
  const [totalQuantity, setTotalQuantity] = useState(0);
  const navigate = useNavigate();

  // 1. Logic đăng xuất
  const handleLogout = () => {
    logout();
    message.success("Hẹn gặp lại bạn!");
    navigate('/login');
  };

  // 2. Lấy số lượng giỏ hàng từ Backend
  useEffect(() => {
    const fetchCart = async () => {
      if (!token || !user) {
        setTotalQuantity(0);
        return;
      }
      try {
        const res = await api.get("/gio-hang/");
        if (res.data.success) {
          // Backend trả về: duLieu: { tongSoLuong: X }
          setTotalQuantity(res.data.tongSoLuong || 0);
        }
      } catch (err) {
        console.error("Lỗi đồng bộ giỏ hàng:", err);
      }
    };
    fetchCart();
  }, [token, user]);

  return (
    <header style={headerStyle}>
      {/* --- PHẦN TRÁI: LOGO --- */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/">
          <img 
            src="https://theme.hstatic.net/200000726533/1001318947/14/logo_large.png?v=976" 
            alt="Tiệm nhà Đăng" 
            style={{ height: '50px', objectFit: 'contain' }} 
          />
        </Link>
      </div>

      {/* --- PHẦN GIỮA: ĐIỀU HƯỚNG CHÍNH --- */}
      {/* <nav>
        <ul style={navUlStyle}>
          <li><Link to="/" style={navLinkStyle}>Trang chủ</Link></li>
          <li><Link to="/category" style={navLinkStyle}>Danh mục</Link></li>
          <li><Link to="/about" style={navLinkStyle}>Giới thiệu</Link></li>
        </ul>
      </nav> */}

      {/* --- PHẦN PHẢI: USER ACTION --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        {!user ? (
          <Space size="middle">
            <Link to="/register" style={navLinkStyle}>Đăng ký</Link>
            <Link to="/login" style={loginButtonStyle}>Đăng nhập</Link>
          </Space>
        ) : (
          <ul style={navUlStyle}>
            {/* 1. Nếu là Admin hoặc Nhân viên kho */}
            {(user.vaiTro === 'admin') && (
              <li>
                <Link to="/admin" style={{ ...navLinkStyle, color: '#0400ff' }}>
                  <DashboardOutlined /> Quản trị
                </Link>
              </li>
            )}
            {(user.vaiTro === 'admin' || user.vaiTro === 'nhanvien_kho') && (
              <li>
                <Link to="/nhap-kho" style={{ ...navLinkStyle, color: '#ffc107' }}>
                  <DashboardOutlined /> Tạo phiếu nhập
                </Link>
                <Link to="/xuat-kho" style={{ ...navLinkStyle, color: '#26ff00', marginLeft: '15px' }}>
                  <DashboardOutlined /> Tạo phiếu xuất
                </Link>
                <Link to="/quan-ly-kho" style={{ ...navLinkStyle, color: '#ff0000', marginLeft: '15px' }}>
                  <DashboardOutlined /> Kho
                </Link>
              </li>
            )}

            {/* 2. Giỏ hàng */}
            <li>
              <Link to="/cart">
                <Badge count={totalQuantity} size="small" offset={[5, 0]}>
                  <ShoppingCartOutlined style={iconStyle} />
                </Badge>
              </Link>
            </li>

            {/* 3. CHUÔNG THÔNG BÁO (Dropdown thả xuống) */}
            <li>
              <NotificationDropdown />
            </li>

            {/* 4. Tài khoản người dùng */}
            <li style={userSectionStyle}>
              <Dropdown
                menu={{
                  items: [
                    { key: '1', label: <Link to="/profile">Thông tin cá nhân</Link>, icon: <UserOutlined /> },
                    { key: '2', label: <Link to="/my-orders">Đơn hàng của tôi</Link>, icon: <HistoryOutlined /> },
                    { type: 'divider' },
                    { 
                      key: '3', 
                      label: 'Đăng xuất', 
                      icon: <LogoutOutlined />, 
                      danger: true,
                      onClick: handleLogout 
                    },
                  ]
                }}
                placement="bottomRight"
                arrow
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                  <Text style={{ color: '#fff', fontWeight: 600 }}>{user.ten}</Text>
                </Space>
              </Dropdown>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
};

// --- HỆ THỐNG STYLES (Inline) ---

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 50px',
  height: '75px',
  backgroundColor: '#0a293c', // Màu xanh đậm thương hiệu của bạn
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
};

const navUlStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '20px'
};

const navLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '15px',
  transition: '0.3s ease',
};

const loginButtonStyle: React.CSSProperties = {
  ...navLinkStyle,
  backgroundColor: '#1890ff',
  padding: '8px 22px',
  borderRadius: '6px',
};

const iconStyle: React.CSSProperties = {
  fontSize: '20px',
  color: '#fff',
  marginRight: '6px'
};

const userSectionStyle: React.CSSProperties = {
  marginLeft: '15px',
  paddingLeft: '15px',
  borderLeft: '1px solid rgba(255,255,255,0.1)'
};

export default Header;