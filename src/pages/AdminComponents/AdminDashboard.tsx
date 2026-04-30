import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Spin, Alert, Statistic, Typography, 
  Button, Space, Divider, Table, Tag, Empty, 
  message
} from 'antd';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import {
  UserOutlined, ShoppingOutlined, DollarCircleOutlined,
  InboxOutlined, ReloadOutlined, FileExcelOutlined,
  WarningOutlined, ArrowUpOutlined
} from '@ant-design/icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const { Title: AntTitle, Text } = Typography;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // State cho thống kê tổng quan
  const [overview, setOverview] = useState({
    soLuongSanPham: 0,
    soLuongDonHang: 0,
    tongDoanhThu: 0,
    soLuongNguoiDung: 0,
    danhSachSapHetHang: [] as any[]
  });

  // State cho biểu đồ
  const [chartData, setChartData] = useState({
    bieuDoDoanhThu: [] as any[],
    bieuDoDanhMuc: [] as any[]
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi song song 2 API mới của bạn
      const [overviewRes, chartRes] = await Promise.all([
        api.get('/bao-cao/tong-quan'),
        api.get('/bao-cao/bieu-do')
      ]);

      if (overviewRes.data.success) setOverview(overviewRes.data.duLieu);
      if (chartRes.data.success) setChartData(chartRes.data.duLieu);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Xử lý xuất Excel
  const handleExportExcel = async () => {
    try {
      message.loading('Đang chuẩn bị file...');
      const response = await api.get('/bao-cao/xuat-excel-kho', {
        responseType: 'blob', // Quan trọng để nhận file binary
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao-Cao-Kho-${new Date().toLocaleDateString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      message.success('Tải báo cáo thành công');
    } catch (err) {
      message.error('Không thể xuất Excel');
    }
  };

  // Cấu hình Biểu đồ Đường (Doanh thu 7 ngày)
  const lineChartData = {
    labels: chartData.bieuDoDoanhThu.map(i => i._id),
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: chartData.bieuDoDoanhThu.map(i => i.tongDoanhThu),
      fill: true,
      backgroundColor: 'rgba(24, 144, 255, 0.1)',
      borderColor: '#1890ff',
      tension: 0.4,
    }]
  };

  // Cấu hình Biểu đồ Tròn (Tỷ trọng danh mục)
  const doughnutChartData = {
    labels: chartData.bieuDoDanhMuc.map(i => i._id || 'Chưa phân loại'),
    datasets: [{
      data: chartData.bieuDoDanhMuc.map(i => i.soLuong),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }]
  };

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <AntTitle level={2} style={{ margin: 0 }}>Dashboard Quản Trị</AntTitle>
          <Text type="secondary">Phân tích kinh doanh và quản lý kho hàng</Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
            <Button type="primary" danger icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              Xuất báo cáo kho
            </Button>
          </Space>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

        {/* Khối Thống kê số lượng */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable bordered={false}>
              <Statistic title="Tổng khách hàng" value={overview.soLuongNguoiDung} prefix={<UserOutlined color="#1890ff" />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable bordered={false}>
              <Statistic title="Đơn hàng" value={overview.soLuongDonHang} prefix={<ShoppingOutlined color="#52c41a" />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable bordered={false}>
              <Statistic title="Sản phẩm trong kho" value={overview.soLuongSanPham} prefix={<InboxOutlined color="#faad14" />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable bordered={false}>
              <Statistic 
                title="Tổng doanh thu" 
                value={overview.tongDoanhThu} 
                suffix="₫" 
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarCircleOutlined />} 
              />
            </Card>
          </Col>
        </Row>

        {/* Khối Biểu đồ */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card title="Doanh thu 7 ngày gần nhất" bordered={false}>
              <div style={{ height: 350 }}>
                {chartData.bieuDoDoanhThu.length > 0 ? (
                  <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                ) : <Empty />}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Tỷ trọng danh mục" bordered={false}>
              <div style={{ height: 350, display: 'flex', alignItems: 'center' }}>
                {chartData.bieuDoDanhMuc.length > 0 ? (
                  <Doughnut data={doughnutChartData} options={{ maintainAspectRatio: false }} />
                ) : <Empty />}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Sản phẩm sắp hết hàng */}
        <Card title={<Space><WarningOutlined style={{color: '#ff4d4f'}} /> Sản phẩm cảnh báo tồn kho</Space>} style={{ marginTop: 24 }} bordered={false}>
          <Table 
            dataSource={overview.danhSachSapHetHang} 
            rowKey="_id"
            pagination={false}
            size="middle"
            columns={[
              { title: 'Mã SP', dataIndex: 'maSanPham', key: 'maSanPham' },
              { title: 'Tên Sản Phẩm', dataIndex: 'tenSanPham', key: 'tenSanPham' },
              { 
                title: 'Tồn Kho', 
                dataIndex: 'tonKho', 
                key: 'tonKho',
                render: (val, record) => <Tag color="error">{val} {record.donViTinh}</Tag>
              },
              { title: 'Ngưỡng báo', dataIndex: 'nguongThongBao', key: 'nguongThongBao' },
            ]}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default AdminDashboard;