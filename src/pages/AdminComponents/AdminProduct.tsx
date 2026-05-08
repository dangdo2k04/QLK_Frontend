import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Tag, Button, Modal, Form, Input, 
   Select, Row, Col, Space, Image, 
  Typography, Badge, message, Tooltip 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, WarningOutlined, InboxOutlined
} from '@ant-design/icons';
import api from '../../config/axios';

const { Title, Text } = Typography;

interface SanPham {
  _id: string;
  maSanPham: string;
  tenSanPham: string;
  moTa: string;
  danhMuc: { _id: string, tenDanhMuc: string };
  giaBan: number;
  giaVon: number;
  tonKho: number;
  nguongThongBao: number;
  donViTinh: string;
  hinhAnh: string[];
  trangThai: 'DangBan' | 'NgungKinhDoanh';
}

const AdminProduct: React.FC = () => {
  const [data, setData] = useState<SanPham[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; tenDanhMuc: string }>>([]);
  const [loading, setLoading] = useState(false);
  
  // 1. QUAN TRỌNG: State lưu tổng số bản ghi từ Backend để hiển thị số trang
  const [totalRecords, setTotalRecords] = useState(0);

  const [, setIsModalOpen] = useState(false);
  const [, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [queryParams, setQueryParams] = useState({
    tenSanPham: '',
    danhMuc: 'all',
    trang: 1,
    gioiHan: 10
  });

  // Lấy danh mục (Chỉ chạy 1 lần khi mount)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/danh-muc/');
        if (response.data.success) {
          setCategories(response.data.duLieu || []);
        }
      } catch (err) {
        console.error('Lỗi lấy danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  // 2. QUAN TRỌNG: Hàm fetch dữ liệu theo queryParams (bao gồm trang và giới hạn)
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/san-pham/', { params: queryParams });
      setData(res.data.duLieu);
      // Giả sử Backend trả về tổng số sản phẩm trong trường 'tongSo'
      setTotalRecords(res.data.tongSo || 0); 
    } catch (err) {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [queryParams]);

  // Xử lý khi người dùng đổi trang hoặc đổi số lượng bản ghi trên trang
  const handleTableChange = (pagination: any) => {
    setQueryParams(prev => ({
      ...prev,
      trang: pagination.current,
      gioiHan: pagination.pageSize
    }));
  };

  const columns = [
    {
      title: 'Thông tin sản phẩm',
      key: 'info',
      width: 250,
      render: (record: SanPham) => (
        <Space>
          <Image
            width={50}
            src={record.hinhAnh[0] || 'https://via.placeholder.com/50'}
            fallback="https://via.placeholder.com/50"
          />
          <div>
            <Text strong>{record.tenSanPham}</Text><br/>
            <Tag color="blue">{record.maSanPham}</Tag>
          </div>
        </Space>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: ['danhMuc', 'tenDanhMuc'],
      key: 'category',
    },
    {
      title: 'Giá (Vốn / Bán)',
      key: 'pricing',
      render: (record: SanPham) => (
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Vốn: {record.giaVon.toLocaleString()}đ</Text><br/>
          <Text strong style={{ color: 'green' }}>Bán: {record.giaBan.toLocaleString()}đ</Text>
        </div>
      )
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      render: (record: SanPham) => {
        const isLow = record.tonKho <= record.nguongThongBao;
        return (
          <Tooltip title={isLow ? "Sắp hết hàng!" : ""}>
            <Badge count={isLow ? <WarningOutlined style={{ color: '#f5222d' }} /> : 0} offset={[5, 0]}>
              <Tag color={isLow ? 'red' : 'green'} style={{ fontSize: '14px' }}>
                {record.tonKho} {record.donViTinh}
              </Tag>
            </Badge>
          </Tooltip>
        );
      }
    },
    {
        title: 'Thao tác',
        key: 'action',
        render: (record: SanPham) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => {
              setEditingId(record._id);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }} />
            <Button danger icon={<DeleteOutlined />} onClick={() => {
              Modal.confirm({
                title: 'Xác nhận xóa?',
                content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
                onOk: () => api.delete(`/san-pham/${record._id}`).then(fetchData)
              });
            }} />
          </Space>
        )
      }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card variant="borderless">
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col><Title level={3}><InboxOutlined /> Quản lý kho sản phẩm</Title></Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setEditingId(null);
              form.resetFields();
              setIsModalOpen(true);
            }}>
              Khai báo SP mới
            </Button>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="Tìm tên sản phẩm..." 
              // Khi tìm kiếm, reset về trang 1
              onChange={(e) => setQueryParams({...queryParams, tenSanPham: e.target.value, trang: 1})}
            />
          </Col>
          <Col span={6}>
            <Select 
              style={{ width: '100%' }}
              placeholder="Lọc theo danh mục"
              // Khi lọc danh mục, reset về trang 1
              onChange={(value) => setQueryParams({...queryParams, danhMuc: value || 'all', trang: 1})}
              allowClear
            >
              <Select.Option value="all">Tất cả danh mục</Select.Option>
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.tenDanhMuc}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* 3. PHẦN QUAN TRỌNG: Cấu hình Table để hỗ trợ phân trang */}
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="_id" 
          loading={loading}
          pagination={{
            current: queryParams.trang,   // Trang hiện tại
            pageSize: queryParams.gioiHan, // Số bản ghi mỗi trang
            total: totalRecords,           // Tổng số bản ghi (từ API)
            showSizeChanger: true,         // Cho phép đổi số lượng bản ghi mỗi trang
            pageSizeOptions: ['5', '10', '20', '50'],
            position: ['bottomCenter'],
          }}
          onChange={handleTableChange} // Hàm bắt sự kiện khi click chuyển trang
        />
      </Card>

      {/* Modal giữ nguyên... */}
    </div>
  );
};

export default AdminProduct;