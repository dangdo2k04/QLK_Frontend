import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Table, Select, Card, 
  Typography, InputNumber, Divider, message, Row, Col, 
  notification
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  DatabaseOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

interface Product {
  _id: string;
  tenSanPham: string;
  maSanPham: string;
  giaBan: number;
}

const InventoryImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý danh sách sản phẩm đang nhập trong phiếu
  const [importItems, setImportItems] = useState<any[]>([]);

  // 1. Lấy danh sách sản phẩm để chọn
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/san-pham?gioiHan=100');
        setProducts(res.data.duLieu);
      } catch (err) {
        message.error('Không thể tải danh sách sản phẩm');
      }
    };
    fetchProducts();
  }, []);

  // 2. Hàm thêm dòng mới vào phiếu nhập
  const addItem = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    // Kiểm tra nếu sản phẩm đã có trong danh sách thì không thêm dòng mới mà báo lỗi
    if (importItems.find(item => item.sanPham === productId)) {
      message.warning('Sản phẩm này đã có trong phiếu nhập');
      return;
    }

    setImportItems([...importItems, {
      key: Date.now(),
      sanPham: product._id,
      tenSanPham: product.tenSanPham,
      maSanPham: product.maSanPham,
      soLuong: 1,
      giaNhap: 0
    }]);
  };

  // 3. Xử lý thay đổi số lượng hoặc giá trên từng dòng
  const updateItem = (key: number, field: string, value: number) => {
    const newData = importItems.map(item => {
      if (item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setImportItems(newData);
  };

  // 4. Xóa dòng
  const removeItem = (key: number) => {
    setImportItems(importItems.filter(item => item.key !== key));
  };

  // 5. Tính tổng tiền phiếu
  const totalAmount = importItems.reduce((sum, item) => sum + (item.soLuong * item.giaNhap), 0);

  // 6. Gửi dữ liệu về Backend (Gọi hàm taoPhieuNhap)
  const onFinish = async (values: any) => {
    if (importItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm để nhập kho');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nhaCungCap: values.nhaCungCap,
        ghiChu: values.ghiChu,
        chiTietNhap: importItems.map(item => ({
          sanPham: item.sanPham,
          soLuong: item.soLuong,
          giaNhap: item.giaNhap
        }))
      };

      const response = await api.post('/phieu-nhap', payload);
      if (response.data.success) {
      // HIỆU ỨNG THÔNG BÁO MỚI
      notification.success({
        message: 'Hoàn tất nhập kho',
        description: `Mã phiếu ${response.data.duLieu.maPhieu} đã được lưu và cập nhật vào hệ thống thông báo.`,
        placement: 'topRight',
        duration: 5,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });

      // Tùy chọn: Phát một sự kiện để Header cập nhật số lượng thông báo mới ngay lập tức
      window.dispatchEvent(new CustomEvent('fetchNotifications'));

      navigate('/quan-ly-kho'); 
    }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'tenSanPham',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.maSanPham}</Text>
        </div>
      )
    },
    {
      title: 'Số Lượng',
      dataIndex: 'soLuong',
      width: 150,
      render: (val: number, record: any) => (
        <InputNumber 
          min={1} 
          value={val} 
          onChange={(v) => updateItem(record.key, 'soLuong', v || 0)} 
        />
      )
    },
    {
      title: 'Giá Nhập (VNĐ)',
      dataIndex: 'giaNhap',
      width: 200,
      render: (val: number, record: any) => (
        <InputNumber 
          min={0} 
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          value={val} 
          onChange={(v) => updateItem(record.key, 'giaNhap', v || 0)} 
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Thành Tiền',
      render: (record: any) => (
        <Text strong color="red">
          {(record.soLuong * record.giaNhap).toLocaleString()} đ
        </Text>
      )
    },
    {
      title: 'Xóa',
      render: (record: any) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} />
      )
    }
  ];

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card bordered={false} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <Title level={2}><DatabaseOutlined /> Tạo Phiếu Nhập Kho</Title>
        <Divider />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="nhaCungCap" label="Nhà Cung Cấp" rules={[{ required: true, message: 'Vui lòng nhập nhà cung cấp' }]}>
                <Input placeholder="Nhập tên đơn vị cung cấp hàng..." size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ghiChu" label="Ghi chú">
                <Input placeholder="Ghi chú thêm (Số hóa đơn, xe giao...)" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <Text strong>Chọn sản phẩm nhập kho:</Text>
            <Row gutter={16} style={{ marginTop: '10px' }}>
              <Col span={18}>
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Tìm theo tên hoặc mã sản phẩm..."
                  optionFilterProp="children"
                  onChange={addItem}
                  value={null} // Để Select luôn trống sau khi chọn xong
                >
                  {products.map(p => (
                    <Option key={p._id} value={p._id}>{p.tenSanPham} - {p.maSanPham}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Button type="dashed" block icon={<PlusOutlined />}>Thêm sản phẩm mới</Button>
              </Col>
            </Row>
          </div>

          <Table 
            dataSource={importItems} 
            columns={columns} 
            pagination={false} 
            locale={{ emptyText: 'Chưa có sản phẩm nào được chọn' }}
          />

          <Divider />

          <Row justify="end" style={{ textAlign: 'right' }}>
            <Col span={8}>
              <div style={{ marginBottom: '20px' }}>
                <Text style={{ fontSize: '18px' }}>Tổng số mặt hàng: </Text>
                <Text strong style={{ fontSize: '18px' }}>{importItems.length}</Text>
                <br />
                <Text style={{ fontSize: '20px' }}>Tổng tiền nhập: </Text>
                <Title level={2} style={{ color: '#f5222d', marginTop: '5px' }}>
                  {totalAmount.toLocaleString()} VNĐ
                </Title>
              </div>
              <Button 
                type="primary" 
                size="large" 
                icon={<SaveOutlined />} 
                htmlType="submit" 
                loading={loading}
                block
                style={{ height: '50px', borderRadius: '8px' }}
              >
                XÁC NHẬN NHẬP KHO
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default InventoryImportPage;