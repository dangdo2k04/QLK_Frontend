import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Tag, Space, Typography, Select, 
  DatePicker, Button, Row, Col, message
} from 'antd';
import { 
  HistoryOutlined, 
  SearchOutlined, 
  SwapOutlined, 
  ArrowLeftOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StockHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  // States cho bộ lọc
  const [loaiBienDong, setLoaiBienDong] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (loaiBienDong) params.loaiBienDong = loaiBienDong;
      if (dateRange) {
        params.tuNgay = dateRange[0].format('YYYY-MM-DD');
        params.denNgay = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await api.get('/nhat-ky-kho', { params });
      setData(res.data.duLieu);
    } catch (err) {
      message.error('Không thể tải nhật ký kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [loaiBienDong, dateRange]);

  const columns = [
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Sản Phẩm',
      dataIndex: 'sanPham',
      key: 'sanPham',
      render: (sp: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{sp?.tenSanPham}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{sp?.maSanPham}</Text>
        </Space>
      ),
    },
    {
      title: 'Loại Biến Động',
      dataIndex: 'loaiBienDong',
      key: 'loaiBienDong',
      render: (type: string) => {
        const config: any = {
          NhapKho: { color: 'blue', text: 'Nhập Kho' },
          BanHang: { color: 'green', text: 'Bán Hàng' },
          HoanTra: { color: 'orange', text: 'Hoàn Trả' },
          KiemKe: { color: 'purple', text: 'Kiểm Kê' },
        };
        const item = config[type] || { color: 'default', text: type };
        return <Tag color={item.color}>{item.text.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Thay Đổi',
      dataIndex: 'soLuongThayDoi',
      key: 'soLuongThayDoi',
      align: 'center' as const,
      render: (val: number) => (
        <Text strong style={{ color: val > 0 ? '#52c41a' : '#ff4d4f' }}>
          {val > 0 ? `+${val}` : val}
        </Text>
      ),
    },
    {
      title: 'Tồn Kho (Trước -> Sau)',
      key: 'stockChange',
      render: (record: any) => (
        <Space>
          <Text type="secondary">{record.tonKhoTruoc}</Text>
          <SwapOutlined style={{ color: '#bfbfbf' }} />
          <Text strong>{record.tonKhoSau}</Text>
        </Space>
      ),
    },
    {
      title: 'Mã Tham Chiếu',
      dataIndex: 'maThamChieu',
      key: 'maThamChieu',
      render: (text: string) => <Text code>{text || 'N/A'}</Text>,
    },
    {
      title: 'Người Thực Hiện',
      dataIndex: 'nguoiThucHien',
      key: 'nguoiThucHien',
      render: (user: any) => <Tag icon={<HistoryOutlined />}>{user?.ten}</Tag>,
    },
  ];

  return (
    <div style={{ padding: '25px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '25px' }}>
          <Col>
            <Space size="middle">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/quan-ly-kho')} />
              <Title level={2} style={{ margin: 0 }}><HistoryOutlined /> Nhật Ký Biến Động Kho</Title>
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={fetchLogs}>Làm mới</Button>
          </Col>
        </Row>

        {/* BỘ LỌC */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Text strong>Loại biến động:</Text>
              <Select 
                placeholder="Tất cả loại" 
                style={{ width: '100%', marginTop: '5px' }} 
                allowClear
                onChange={(val) => setLoaiBienDong(val)}
              >
                <Select.Option value="NhapKho">Nhập Kho</Select.Option>
                <Select.Option value="BanHang">Bán Hàng</Select.Option>
                <Select.Option value="HoanTra">Hoàn Trả</Select.Option>
                <Select.Option value="KiemKe">Kiểm Kê</Select.Option>
              </Select>
            </Col>
            <Col span={8}>
              <Text strong>Khoảng thời gian:</Text>
              <RangePicker 
                style={{ width: '100%', marginTop: '5px' }} 
                onChange={(dates) => setDateRange(dates)}
              />
            </Col>
            <Col span={10} style={{ textAlign: 'right', paddingTop: '20px' }}>
              <Text type="secondary"><FileSearchOutlined /> Hiển thị tối đa 100 biến động gần nhất</Text>
            </Col>
          </Row>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 15 }}
          scroll={{ x: 1000 }} // Hỗ trợ xem trên màn hình nhỏ
        />
      </Card>
    </div>
  );
};

export default StockHistoryPage;