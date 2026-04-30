import React, { useEffect, useState } from 'react';
import { Badge, Dropdown, List, Avatar, Typography, Empty, Spin } from 'antd';
import { BellOutlined, ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { token } = useAuth(); 

  const fetchNotifications = async () => {
    // KHẮC PHỤC LỖI 401: Chỉ gọi API khi thực sự có Token
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get('/thong-bao/');
      if (res.data.success) {
        setNotifications(res.data.duLieu);
        const unread = res.data.duLieu.filter((n: any) => !n.daXem).length;
        setUnreadCount(unread);
      }
    } catch (err: any) {
      if (err.response?.status !== 401) console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const handleItemClick = async (item: any) => {
    try {
      if (!item.daXem) {
        await api.put(`/thong-bao/${item._id}/da-xem`);
        fetchNotifications();
      }
      if (item.duongDan) navigate(item.duongDan);
    } catch (err) { console.error(err); }
  };

  // Nội dung thông báo
  const renderContent = () => (
    <div style={{ backgroundColor: '#fff', width: '360px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold' }}>Thông báo mới</div>
      
      {/* KHẮC PHỤC LỖI Spin: Bọc nội dung bên trong Spin */}
      <Spin spinning={loading}>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <List
            dataSource={notifications}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Trống" /> }}
            renderItem={(item: any) => (
              <List.Item 
                onClick={() => handleItemClick(item)}
                style={{ padding: '12px', cursor: 'pointer', backgroundColor: item.daXem ? '#fff' : '#f0faff' }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={item.loaiThongBao === 'TonKho' ? <InfoCircleOutlined /> : <ShoppingCartOutlined />} />}
                  title={<Text strong={!item.daXem}>{item.tieuDe}</Text>}
                  description={<Text type="secondary" style={{ fontSize: '12px' }}>{item.noiDung}</Text>}
                />
              </List.Item>
            )}
          />
        </div>
      </Spin>
    </div>
  );

  return (
    <Dropdown 
      menu={{ items: [] }} // Antd v5 yêu cầu menu object, nhưng ta dùng popupRender để tùy biến
      popupRender={() => renderContent()} // Nếu popupRender chưa hỗ trợ ổn định, dropdownRender vẫn dùng được nhưng hãy check kỹ ver Antd
      trigger={['click']}
    >
      <Badge count={unreadCount} size="small">
        <BellOutlined style={{ fontSize: '22px', color: '#fff', cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;