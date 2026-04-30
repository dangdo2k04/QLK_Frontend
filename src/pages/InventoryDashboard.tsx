import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Statistic, Tag, Input, 
  Button, Space, Typography, Badge, Modal, Form, 
  InputNumber, Select, message, Divider, Tooltip 
} from 'antd';
import { 
  DatabaseOutlined, PlusOutlined, HistoryOutlined, 
  SearchOutlined, ImportOutlined, BoxPlotOutlined,
  WarningOutlined, DollarOutlined, InfoCircleOutlined,
  FolderAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';

const { Title, Text } = Typography;

// Định nghĩa Interface khớp 100% với Schema Backend
interface Product {
  _id: string;
  maSanPham: string;
  tenSanPham: string;
  moTa: string;
  danhMuc: { _id: string; tenDanhMuc: string };
  giaBan: number;
  giaVon: number;
  tonKho: number;
  nguongThongBao: number;
  donViTinh: string;
  hinhAnh: string[];
  trangThai: 'DangBan' | 'NgungKinhDoanh';
}

const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  
  // States dữ liệu
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // States UI
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // 1. Lấy dữ liệu sản phẩm và danh mục từ Backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get('/san-pham?gioiHan=200'),
        api.get('/danh-muc')
      ]);
      setProducts(productRes.data.duLieu);
      setCategories(categoryRes.data.duLieu);
    } catch (err) {
      message.error('Không thể kết nối với máy chủ để lấy dữ liệu kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  // 2. Xử lý tạo danh mục mới (Hàm taoDanhMuc ở Backend)
  const handleCreateCategory = async (values: any) => {
    setActionLoading(true);
    try {
      const res = await api.post('/danh-muc', values);
      if (res.data.success) {
        message.success('Thêm danh mục mới thành công');
        setIsCategoryModalOpen(false);
        categoryForm.resetFields();
        fetchData(); // Cập nhật lại danh sách danh mục cho Modal Sản phẩm
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo danh mục');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Xử lý khai báo sản phẩm mới (Hàm taoSanPham ở Backend)
  const handleCreateProduct = async (values: any) => {
    setSubmitLoading(true);
    try {
      const response = await api.post('/san-pham', values);
      if (response.data.success) {
        message.success('Khai báo mặt hàng mới thành công!');
        setIsModalOpen(false);
        form.resetFields();
        fetchData(); // Tải lại danh sách
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo sản phẩm');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Tính toán số liệu thống kê nhanh
  const lowStockProducts = products.filter(p => p.tonKho <= p.nguongThongBao);
  const totalStockValue = products.reduce((sum, p) => sum + (p.tonKho * p.giaVon), 0);

  // 4. Cấu hình các cột hiển thị trong bảng
  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'maSanPham',
      key: 'maSanPham',
      width: 120,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Sản Phẩm',
      key: 'productInfo',
      render: (record: Product) => (
        <Space>
          <img 
            src={record.hinhAnh?.[0] || 'https://via.placeholder.com/50'} 
            style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: '6px' }} 
            alt="product"
          />
          <div>
            <Text strong style={{ fontSize: '15px' }}>{record.tenSanPham}</Text>
            <br />
            <Tag color="cyan">{record.danhMuc?.tenDanhMuc}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Giá Vốn / Bán',
      key: 'pricing',
      render: (record: Product) => (
        <div>
          <Text type="secondary" style={{ fontSize: '14px' }}>Vốn: {record.giaVon.toLocaleString()}đ</Text>
          <br />
          <Text strong style={{ color: '#f5222d' }}>Bán: {record.giaBan.toLocaleString()}đ</Text>
        </div>
      ),
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'tonKho',
      key: 'tonKho',
      sorter: (a: Product, b: Product) => a.tonKho - b.tonKho,
      render: (val: number, record: Product) => (
        <Space>
          <Tag 
            color={val <= record.nguongThongBao ? 'red' : 'green'} 
            style={{ fontSize: '14px', fontWeight: 'bold' }}
          >
            {val} {record.donViTinh}
          </Tag>
          {val <= record.nguongThongBao && (
            <Tooltip title="Sắp hết hàng - Cần nhập thêm">
              <WarningOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status: string) => (
        <Badge 
          status={status === 'DangBan' ? 'success' : 'error'} 
          text={status === 'DangBan' ? 'Đang bán' : 'Ngừng bán'} 
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (record: Product) => (
        <Button size="small" icon={<InfoCircleOutlined />} onClick={() => navigate(`/san-pham/${record._id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      
      {/* KHỐI THỐNG KÊ NHANH */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={6}>
          <Card variant="borderless">
            <Statistic title="Tổng mặt hàng" value={products.length} prefix={<BoxPlotOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card variant="borderless">
            <Statistic 
              title="Giá trị kho hàng" 
              value={totalStockValue} 
              prefix={<DollarOutlined />} 
              suffix="đ" 
              precision={0} 
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card variant="borderless">
            <Statistic 
              title="Sắp hết hàng" 
              value={lowStockProducts.length} 
              valueStyle={{ color: '#faad14' }} 
              prefix={<WarningOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card variant="borderless" bodyStyle={{ padding: '15px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<ImportOutlined />} onClick={() => navigate('/nhap-kho')}>
                NHẬP HÀNG (PHIẾU)
              </Button>
              <Button block icon={<FolderAddOutlined />} onClick={() => setIsCategoryModalOpen(true)}>Thêm Danh Mục</Button>
              <Button block icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                Khai báo SP mới
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* BẢNG DANH SÁCH SẢN PHẨM */}
      <Card 
        variant="borderless" 
        title={<><DatabaseOutlined /> Danh sách tồn kho thực tế</>}
        extra={<Button icon={<HistoryOutlined />} onClick={() => navigate('/nhat-ky-kho')}>Nhật ký biến động</Button>}
      >
        <Input 
          placeholder="Tìm kiếm sản phẩm theo tên hoặc mã SP..." 
          prefix={<SearchOutlined />} 
          style={{ width: 400, marginBottom: 20 }} 
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Table 
          columns={columns} 
          dataSource={products.filter(p => 
            p.tenSanPham.toLowerCase().includes(searchText.toLowerCase()) || 
            p.maSanPham.toLowerCase().includes(searchText.toLowerCase())
          )} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng cộng ${total} sản phẩm` }}
        />
      </Card>
      {/* --- MODAL THÊM DANH MỤC --- */}
      <Modal
        title="Thêm danh mục sản phẩm mới"
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        onOk={() => categoryForm.submit()}
        confirmLoading={actionLoading}
        destroyOnClose
      >
        <Form form={categoryForm} layout="vertical" onFinish={handleCreateCategory}>
          <Form.Item name="tenDanhMuc" label="Tên danh mục" rules={[{ required: true, message: 'Không được để trống' }]}>
            <Input placeholder="Ví dụ: Mô hình xe tải, Linh kiện..." />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả ngắn">
            <Input.TextArea placeholder="Mô tả về nhóm sản phẩm này" rows={3} />
          </Form.Item>
          <Form.Item name="hinhAnh" label="Đường dẫn ảnh (URL)">
            <Select mode="tags" placeholder="Dán link ảnh và nhấn Enter" />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL KHAI BÁO SẢN PHẨM MỚI */}
      <Modal
        title={<Title level={4}><PlusOutlined /> Khai báo mặt hàng mới</Title>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateProduct} initialValues={{ donViTinh: 'Cái', nguongThongBao: 5, trangThai: 'DangBan' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maSanPham" label="Mã Sản Phẩm (SKU)" rules={[{ required: true, message: 'Mã SP là bắt buộc' }]}>
                <Input placeholder="Ví dụ: XE-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tenSanPham" label="Tên Sản Phẩm" rules={[{ required: true, message: 'Tên SP là bắt buộc' }]}>
                <Input placeholder="Tên mô hình xe..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="danhMuc" label="Danh mục sản phẩm" rules={[{ required: true }]}>
                <Select placeholder="Chọn nhóm sản phẩm">
                  {categories.map(c => <Select.Option key={c._id} value={c._id}>{c.tenDanhMuc}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="donViTinh" label="Đơn vị tính">
                <Input placeholder="Cái, Chiếc, Bộ..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="giaVon" label="Giá nhập dự kiến" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="giaBan" label="Giá bán niêm yết" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nguongThongBao" label="Ngưỡng báo kho (Min)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="hinhAnh" label="Đường dẫn ảnh (URL)">
            <Select mode="tags" placeholder="Dán link ảnh và nhấn Enter" />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả tóm tắt">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" loading={submitLoading} icon={<PlusOutlined />}>
                XÁC NHẬN TẠO
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryDashboard;