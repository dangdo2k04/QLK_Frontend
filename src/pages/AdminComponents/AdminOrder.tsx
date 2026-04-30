import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, Modal, Select, Row, Col, Input, DatePicker, Tag, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

// 1. Interface chuẩn hóa theo Model MongoDB mới
interface OrderItem {
  sanPham: { _id: string; tenSanPham: string; giaBan: number };
  soLuong: number;
  giaLucBan: number;
}

interface Order {
  _id: string;
  maDonHang: string;
  khachHang: { ten: string; email: string; soDienThoai: string; diaChi: string } | null;
  items: OrderItem[];
  tongTien: number;
  phuongThucThanhToan: 'TienMat' | 'ChuyenKhoan' | 'ViDienTu';
  trangThaiDonHang: 'ChoXacNhan' | 'DangGiao' | 'DaHoanThanh' | 'DaHuy';
  ghiChu?: string;
  createdAt: string;
}

const AdminOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const navigate = useNavigate();

  // Search States
  const [searchKey, setSearchKey] = useState<string>(''); // Theo mã đơn hoặc tên
  const [searchDate, setSearchDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  // 2. Lấy đơn hàng từ hệ thống
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Cập nhật endpoint khớp với Route: router.get('/he-thong/tat-ca', layTatCaDonHang);
      const response = await api.get('/don-hang/he-thong/tat-ca');
      setOrders(response.data.duLieu); // Giả sử controller trả về duLieu
      setFilteredOrders(response.data.duLieu);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 3. Logic lọc dữ liệu client-side
  useEffect(() => {
    let filtered = orders;
    if (searchKey) {
      filtered = filtered.filter((order) =>
        order.maDonHang.toLowerCase().includes(searchKey.toLowerCase()) ||
        order.khachHang?.ten.toLowerCase().includes(searchKey.toLowerCase())
      );
    }
    if (searchDate) {
      const dateStr = searchDate.format('YYYY-MM-DD');
      filtered = filtered.filter((order) => dayjs(order.createdAt).format('YYYY-MM-DD') === dateStr);
    }
    if (selectedStatus) {
      filtered = filtered.filter((order) => order.trangThaiDonHang === selectedStatus);
    }
    setFilteredOrders(filtered);
  }, [searchKey, searchDate, selectedStatus, orders]);

  // 4. Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async () => {
    if (!editingOrder) return;
    try {
      // Endpoint khớp với: router.put('/:id/trang-thai', capNhatTrangThai);
      await api.put(`/don-hang/${editingOrder._id}/trang-thai`, { 
        trangThaiMoi: newStatus 
      });
      
      message.success('Cập nhật trạng thái thành công');
      setIsModalOpen(false);
      fetchOrders(); // Tải lại dữ liệu
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật');
    }
  };

  const statusTags: Record<string, { color: string; label: string }> = {
    ChoXacNhan: { color: 'orange', label: 'Chờ xác nhận' },
    DangGiao: { color: 'blue', label: 'Đang giao hàng' },
    DaHoanThanh: { color: 'green', label: 'Hoàn thành' },
    DaHuy: { color: 'red', label: 'Đã hủy' },
  };

  const columns = [
    { 
      title: 'Mã đơn', 
      dataIndex: 'maDonHang', 
      key: 'maDonHang',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Khách hàng',
      key: 'khachHang',
      render: (record: Order) => (
        <div>
          <div>{record.khachHang?.ten || 'N/A'}</div>
          <Text type="secondary">{record.khachHang?.soDienThoai}</Text>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      width: 250,
      render: (items: OrderItem[]) => 
        items.map(item => `${item.sanPham?.tenSanPham} (x${item.soLuong})`).join(', ')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTien',
      key: 'tongTien',
      render: (val: number) => <Text type="danger">{val?.toLocaleString()}đ</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThaiDonHang',
      key: 'trangThaiDonHang',
      render: (status: string) => (
        <Tag color={statusTags[status]?.color}>{statusTags[status]?.label || status}</Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/don-hang/${record._id}`)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingOrder(record);
              setNewStatus(record.trangThaiDonHang);
              setIsModalOpen(true);
            }}
          />
          <Button
            icon={<PrinterOutlined />}
            onClick={() => window.open(`/export/invoice/${record._id}`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Quản lý đơn hàng hệ thống</Title>
      
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Input
            placeholder="Mã đơn hàng hoặc tên khách hàng"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span={6}>
          <DatePicker
            placeholder="Lọc theo ngày"
            onChange={(date) => setSearchDate(date)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Lọc trạng thái"
            style={{ width: '100%' }}
            allowClear
            onChange={setSelectedStatus}
          >
            {Object.keys(statusTags).map(key => (
              <Select.Option key={key} value={key}>{statusTags[key].label}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Button type="default" icon={<ReloadOutlined />} onClick={fetchOrders} block>
            Làm mới
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {error ? (
          <Alert message={error} type="error" showIcon />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="_id"
            bordered
            size="middle"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Spin>

      <Modal
        title="Cập nhật tiến độ đơn hàng"
        open={isModalOpen}
        onOk={handleUpdateStatus}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu thay đổi"
      >
        <div style={{ marginBottom: 10 }}>
          Mã đơn: <Text code>{editingOrder?.maDonHang}</Text>
        </div>
        <Select
          style={{ width: '100%' }}
          value={newStatus}
          onChange={setNewStatus}
        >
          <Select.Option value="ChoXacNhan">Chờ xác nhận</Select.Option>
          <Select.Option value="DangGiao">Đang giao hàng</Select.Option>
          <Select.Option value="DaHoanThanh">Hoàn thành</Select.Option>
          <Select.Option value="DaHuy">Đã hủy đơn</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};

// Component con giả lập Space nếu chưa import
const Space: React.FC<{ children: React.ReactNode; size?: string }> = ({ children }) => (
  <div style={{ display: 'flex', gap: '8px' }}>{children}</div>
);

const ReloadOutlined = () => <span>🔄</span>;

export default AdminOrder;