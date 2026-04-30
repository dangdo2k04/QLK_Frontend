import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Card, Tag, Button, Modal, Form, Input, 
  InputNumber, Select, Row, Col, Space, Image, 
  Typography, Switch, Badge, message, Tooltip 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, WarningOutlined, EyeOutlined,
  DollarOutlined, InboxOutlined
} from '@ant-design/icons';
import api from '../../config/axios';

const { Title, Text } = Typography;

// Khai báo Interface chuẩn theo Backend của bạn
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Các state lọc (Khớp với req.query của Backend)
  const [queryParams, setQueryParams] = useState({
    tenSanPham: '',
    danhMuc: 'all',
    trang: 1,
    gioiHan: 10
  });
  const fetchCategories = async () => {
    try {
      const response = await api.get('/danh-muc/'); // Đảm bảo đường dẫn này khớp với Backend
      if (response.data.success) {
        setCategories(response.data.duLieu || []); // 'duLieu' khớp với cấu trúc API của bạn
      }
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/san-pham/', { params: queryParams });
      setData(res.data.duLieu);
    } catch (err) {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData();fetchCategories(); }, [queryParams]);


  // Xử lý Thêm/Sửa
  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await api.put(`/san-pham/${editingId}`, values);
        message.success("Cập nhật thành công");
      } else {
        await api.post('/san-pham/', values);
        message.success("Tạo sản phẩm thành công");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
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
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      render: (status: string, record: SanPham) => (
        <Switch 
          checked={status === 'DangBan'} 
          onChange={async (checked) => {
            await api.put(`/api/v1/san-pham/${record._id}`, { 
              trangThai: checked ? 'DangBan' : 'NgungKinhDoanh' 
            });
            fetchData();
          }}
        />
      )
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
              content: record.tonKho > 0 ? 'Sản phẩm còn tồn kho, không thể xóa!' : 'Bạn có chắc chắn muốn xóa sản phẩm này?',
              onOk: () => record.tonKho === 0 && api.delete(`/api/v1/san-pham/${record._id}`).then(fetchData)
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
              onChange={(e) => setQueryParams({...queryParams, tenSanPham: e.target.value})}
            />
          </Col>
          <Col span={6}>
            <Select 
              style={{ width: '100%' }}
              placeholder="Lọc theo danh mục"
              onChange={(value) => setQueryParams({...queryParams, danhMuc: value})}
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

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="_id" 
          loading={loading}
          pagination={{
            current: queryParams.trang,
            pageSize: queryParams.gioiHan,
            onChange: (trang) => setQueryParams({...queryParams, trang})
          }}
        />
      </Card>

      <Modal
        title={editingId ? "Cập nhật sản phẩm" : "Khai báo sản phẩm mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="maSanPham" label="Mã sản phẩm (SKU)" rules={[{required: true}]}>
                <Input placeholder="Nhập mã định danh" disabled={!!editingId} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="tenSanPham" label="Tên sản phẩm" rules={[{required: true}]}>
                <Input placeholder="Tên hiển thị trên hóa đơn" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="giaVon" label="Giá vốn (đ)" rules={[{required: true}]}>
                <InputNumber style={{width: '100%'}} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="giaBan" label="Giá bán (đ)" rules={[{required: true}]}>
                <InputNumber style={{width: '100%'}} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="nguongThongBao" label="Ngưỡng báo tồn">
                <InputNumber style={{width: '100%'}} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="donViTinh" label="Đơn vị tính">
                <Input placeholder="Cái, Bộ, kg..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="danhMuc" label="Danh mục" rules={[{ required: true }]}>
                <Select placeholder="Chọn nhóm hàng">
                  {categories.map((cat) => (
                    <Select.Option key={cat._id} value={cat._id}>
                      {cat.tenDanhMuc}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="hinhAnh" label="Link hình ảnh (URLs)">
            <Select mode="tags" style={{ width: '100%' }} placeholder="Dán link ảnh và Enter" />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả chi tiết">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProduct;