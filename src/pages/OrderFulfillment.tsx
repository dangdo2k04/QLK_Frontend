import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Tag, Button, Typography, Space, 
  message, Modal, Divider, Col, Row, Tooltip, Input, DatePicker 
} from 'antd';
import { 
  InboxOutlined, 
  RocketOutlined, 
  PrinterOutlined, 
  SearchOutlined,
  InfoCircleOutlined,
  TruckOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../config/axios';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';

const { Title, Text } = Typography;

// Định nghĩa Interface để đồng bộ dữ liệu
interface Order {
  _id: string;
  maDonHang: string;
  khachHang: { ten: string; email: string; soDienThoai: string; diaChi: string } | null;
  items: any[];
  tongTien: number;
  phuongThucThanhToan: string;
  trangThaiDonHang: string;
  ghiChu?: string;
  createdAt: string;
  diaChiGiaoHang?: string;
}

const OrderFulfillment: React.FC = () => {
  const [modal, contextHolder] = Modal.useModal();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // States cho bộ lọc giống OrderAdmin
  const [searchKey, setSearchKey] = useState<string>(''); 
  const [searchDate, setSearchDate] = useState<dayjs.Dayjs | null>(null);

  // 1. Lấy danh sách đơn hàng 'ChoXacNhan' từ hệ thống
  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('don-hang/he-thong/tat-ca?trangThaiDonHang=ChoXacNhan');
      // Giả sử API trả về { success: true, duLieu: [...] }
      const data = res.data.duLieu || [];
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      message.error('Không thể tải danh sách đơn hàng cần chuẩn bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  // 2. Logic lọc dữ liệu client-side (giống OrderAdmin)
  useEffect(() => {
    let filtered = orders;
    
    if (searchKey) {
      filtered = filtered.filter((order) =>
        order.maDonHang.toLowerCase().includes(searchKey.toLowerCase()) ||
        order.khachHang?.ten.toLowerCase().includes(searchKey.toLowerCase()) ||
        order.khachHang?.soDienThoai.includes(searchKey)
      );
    }
    
    if (searchDate) {
      const dateStr = searchDate.format('YYYY-MM-DD');
      filtered = filtered.filter((order) => dayjs(order.createdAt).format('YYYY-MM-DD') === dateStr);
    }
    
    setFilteredOrders(filtered);
  }, [searchKey, searchDate, orders]);

  // 3. Hàm xử lý xác nhận xuất kho
  const executeFulfillment = async (orderId: string, maDonHang: string) => {
  const hide = message.loading(`Đang xử lý xuất kho đơn ${maDonHang}...`, 0); //
  try {
    const res = await api.put(`/don-hang/${orderId}/trang-thai`, {
      trangThaiMoi: 'DangGiao' //
    });

    if (res.data.success) {
      message.success(`Đơn hàng ${maDonHang} đã xuất kho thành công!`); //
      fetchPendingOrders(); //
    }
  } catch (err: any) {
    console.error("Lỗi Network/Server:", err); //
    message.error(err.response?.data?.message || 'Lỗi kết nối hệ thống'); //
  } finally {
    hide(); //
  }
};

// Hàm hiển thị Modal sử dụng Hook
const handleConfirmFulfillment = (orderId: string, maDonHang: string) => {
  modal.confirm({ // Sử dụng modal từ hook
    title: `Xác nhận xuất kho đơn hàng ${maDonHang}?`,
    icon: <TruckOutlined style={{ color: '#1890ff' }} />, //
    content: (
      <div>
        <p>Hệ thống sẽ cập nhật trạng thái đơn hàng sang <b>"Đang giao"</b>.</p>
        <Text type="secondary">Kho sẽ được cập nhật trạng thái vận chuyển ngay lập tức.</Text>
      </div>
    ),
    okText: 'Xác nhận & Giao hàng',
    cancelText: 'Hủy',
    onOk: () => executeFulfillment(orderId, maDonHang), // Gọi hàm đã tách riêng
  });
};

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'maDonHang',
      key: 'maDonHang',
      width: 130,
      render: (text: string) => <Text code strong color="blue">{text}</Text>,
    },
    {
      title: 'Khách Hàng',
      key: 'customer',
      width: 180,
      render: (record: Order) => (
        <Tooltip title={`Địa chỉ: ${record.diaChiGiaoHang || 'Chưa cập nhật'}`}>
          <Space direction="vertical" size={0}>
            <Text strong>{record.khachHang?.ten || 'Khách vãng lai'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.khachHang?.soDienThoai}</Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Danh sách nhặt hàng (Pick-list)',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <Card size="small" styles={{ body: { padding: '8px 12px', background: '#fafafa' } }} variant="borderless">
          {items?.map((item: any, index: number) => (
            <div key={index} style={{ marginBottom: 4 }}>
              <Tag color="blue">x{item.soLuong}</Tag> 
              <Text strong>{item.sanPham?.tenSanPham}</Text>
            </div>
          ))}
        </Card>
      ),
    },
    {
      title: 'Tổng Tiền',
      key: 'payment',
      width: 140,
      render: (record: Order) => (
        <Space direction="vertical" size={0}>
          <Text type="danger" strong>{record.tongTien?.toLocaleString()}đ</Text>
          <Tag color={record.phuongThucThanhToan === 'ChuyenKhoan' ? 'purple' : 'orange'}>
            {record.phuongThucThanhToan || 'Tiền mặt'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (record: Order) => (
        <Space>
          <Button 
            size="small"
            icon={<PrinterOutlined />} 
            onClick={() => window.print()}
          >
            In Phiếu
          </Button>
          <Button 
            type="primary" 
            size="small"
            icon={<RocketOutlined />} 
            onClick={() => handleConfirmFulfillment(record._id, record.maDonHang)}
          >
            Xuất kho
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
    {contextHolder}
      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <InboxOutlined /> Chuẩn bị & Xuất kho
            </Title>
            <Text type="secondary">
              <InfoCircleOutlined /> Lọc đơn hàng chờ xác nhận để chuẩn bị hàng hóa.
            </Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchPendingOrders} loading={loading}>
              Làm mới
            </Button>
          </Col>
        </Row>
        
        <Divider />

        {/* Bộ lọc giống OrderAdmin */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={10}>
            <Input
              placeholder="Mã đơn, tên hoặc số điện thoại khách hàng"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={6}>
            <DatePicker
              placeholder="Lọc theo ngày đặt"
              onChange={(date) => setSearchDate(date)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 8, showTotal: (total) => `Tổng cộng ${total} đơn chờ xuất` }}
          scroll={{ x: 1100 }}
          locale={{ emptyText: 'Hiện tại không có đơn hàng nào cần xuất kho.' }}
          expandable={{
            expandedRowRender: (record: Order) => (
              <div style={{ padding: '8px 24px', background: '#fff' }}>
                <p style={{ margin: 0 }}><b>Địa chỉ giao hàng chi tiết:</b> {record.diaChiGiaoHang || 'Liên hệ khách hàng'}</p>
                {record.ghiChu && <p style={{ margin: '8px 0 0' }}><b>Ghi chú:</b> {record.ghiChu}</p>}
              </div>
            ),
          }}
        />
      </Card>
      
      <style>
        {`
          @media print {
            .ant-btn, .ant-table-pagination, .ant-layout-sider, .ant-layout-header, .ant-input-affix-wrapper, .ant-picker {
              display: none !important;
            }
            .ant-table-cell-fix-right {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OrderFulfillment;