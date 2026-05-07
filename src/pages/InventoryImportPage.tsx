import React, { useState, useEffect } from 'react';
import { 
  Table, Form, Input, Button, Select, Card, Typography, InputNumber, 
  message, Row, Col, notification, Tabs, Tag, Modal, Badge,
  Space
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, SaveOutlined, DatabaseOutlined, 
  CheckCircleOutlined, HistoryOutlined, EyeOutlined, UserOutlined,
  ShopOutlined, CalendarOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import api from '../config/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Product {
  _id: string;
  tenSanPham: string;
  maSanPham: string;
}

const InventoryImportPage: React.FC = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  
  // States cho Lập phiếu
  const [products, setProducts] = useState<Product[]>([]);
  const [importItems, setImportItems] = useState<any[]>([]);

  // States cho Quản lý danh sách phiếu
  const [history, setHistory] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPhieu, setSelectedPhieu] = useState<any>(null);

  // 1. Fetch dữ liệu ban đầu
  const fetchProducts = async () => {
    try {
      const res = await api.get('/san-pham?gioiHan=1000');
      setProducts(res.data.duLieu);
    } catch (err) { message.error('Không thể tải danh sách sản phẩm'); }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/phieu-nhap'); // Gọi layTatCaPhieuNhap
      setHistory(res.data.duLieu);
    } catch (err) { message.error('Không thể tải lịch sử nhập kho'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    if (activeTab === '2') fetchHistory();
  }, [activeTab]);

  // --- LOGIC LẬP PHIẾU NHẬP ---
  const addItem = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    if (importItems.find(item => item.sanPham === productId)) {
      message.warning('Sản phẩm này đã có trong phiếu');
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

  const updateItem = (key: number, field: string, value: number) => {
    setImportItems(importItems.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const onFinish = async (values: any) => {
    if (importItems.length === 0) return message.error('Vui lòng chọn sản phẩm');
    setLoading(true);
    try {
      const payload = {
        ...values,
        chiTietNhap: importItems.map(item => ({
          sanPham: item.sanPham,
          soLuong: item.soLuong,
          giaNhap: item.giaNhap
        }))
      };
      const res = await api.post('/phieu-nhap', payload);
      if (res.data.success) {
        notification.success({
          message: 'Nhập kho thành công',
          description: `Mã phiếu: ${res.data.duLieu.maPhieu}`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
        form.resetFields();
        setImportItems([]);
        setActiveTab('2'); // Chuyển sang lịch sử sau khi nhập xong
      }
    } catch (err: any) { message.error(err.response?.data?.message || 'Lỗi hệ thống'); }
    finally { setLoading(false); }
  };

  const totalAmount = importItems.reduce((sum, item) => sum + (item.soLuong * item.giaNhap), 0);

  // --- LOGIC XEM CHI TIẾT ---
  const showDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/phieu-nhap/${id}`); // Gọi layChiTietPhieuNhap
      setSelectedPhieu(res.data.duLieu);
      setIsDetailOpen(true);
    } catch (err) { message.error('Không thể lấy chi tiết phiếu'); }
    finally { setLoading(false); }
  };

  const historyColumns = [
    { title: 'Mã Phiếu', dataIndex: 'maPhieu', key: 'maPhieu', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: 'Nhà Cung Cấp', dataIndex: 'nhaCungCap', key: 'nhaCungCap' },
    { title: 'Ngày Nhập', dataIndex: 'createdAt', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
    { title: 'Tổng Tiền', dataIndex: 'tongTien', render: (val: number) => <Text strong type="danger">{val?.toLocaleString()}đ</Text> },
    { title: 'Nhân Viên', dataIndex: ['nhanVienNhap', 'ten'], key: 'nhanVien' },
    {
      title: 'Thao tác',
      render: (record: any) => (
        <Button icon={<EyeOutlined />} onClick={() => showDetail(record._id)}>Chi tiết</Button>
      )
    }
  ];
  const handleExportPhieuExcel = async (id: string, maPhieu: string) => {
  if (!id) return message.error("ID phiếu không hợp lệ");
  
  const closeLoading = message.loading(`Đang khởi tạo file cho phiếu ${maPhieu}...`, 0);
  
  try {
    const response = await api.get(`/phieu-nhap/${id}/xuat-excel`, {
      responseType: 'blob', // Giữ nguyên
      // Không cần ép Header Content-Type vì đây là request GET
    });

    // CÁCH KIỂM TRA LỖI MỚI: 
    // Nếu Backend trả về lỗi nhưng Axios vẫn nhận (do responseType: blob)
    // thường Blob sẽ rất nhỏ (chứa chuỗi JSON lỗi)
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const errorJson = JSON.parse(text);
      throw new Error(errorJson.message || "Server báo lỗi không tìm thấy file");
    }

    // Xử lý tải file thành công
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PhieuNhap_${maPhieu}.xlsx`);
    
    document.body.appendChild(link);
    link.click();

    // Dọn dẹp bộ nhớ
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    message.success('Tải phiếu nhập thành công');
  } catch (err: any) {
    console.error("Lỗi xuất file chi tiết:", err);
    
    // Đọc thông tin lỗi nếu có thể
    let errorMsg = "Không thể xuất file. Vui lòng kiểm tra lại ID phiếu hoặc thứ tự Route Backend.";
    if (err.response?.status === 404) {
      errorMsg = "Lỗi 404: Không tìm thấy đường dẫn xuất Excel. Kiểm tra lại Backend Route!";
    }
    
    message.error(errorMsg);
  } finally {
    closeLoading();
  }
};

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card variant="borderless" style={{ borderRadius: '12px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          
          {/* TAB 1: LẬP PHIẾU NHẬP */}
          <TabPane tab={<span><PlusOutlined />Lập Phiếu Nhập Kho</span>} key="1">
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={24}>
                <Col span={10}>
                  <Form.Item name="nhaCungCap" label="Nhà Cung Cấp" rules={[{ required: true }]}>
                    <Input prefix={<ShopOutlined />} placeholder="Nhập tên nhà cung cấp..." />
                  </Form.Item>
                </Col>
                <Col span={14}>
                  <Form.Item name="ghiChu" label="Ghi chú">
                    <Input placeholder="Ghi chú thêm..." />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <Row gutter={16} align="middle">
                  <Col span={18}>
                    <Select showSearch style={{ width: '100%' }} placeholder="Tìm sản phẩm để thêm vào phiếu..." 
                            optionFilterProp="children" onChange={addItem} value={null}>
                      {products.map(p => <Option key={p._id} value={p._id}>{p.tenSanPham} ({p.maSanPham})</Option>)}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Text type="secondary">Chọn sản phẩm từ danh sách để nhập số lượng & giá</Text>
                  </Col>
                </Row>
              </div>

              <Table 
                dataSource={importItems} 
                pagination={false}
                locale={{ emptyText: 'Chưa có sản phẩm nào được chọn' }}
                columns={[
                  { title: 'Sản Phẩm', render: (record) => <><Text strong>{record.tenSanPham}</Text><br/><Text type="secondary">{record.maSanPham}</Text></> },
                  { title: 'Số Lượng', render: ( record) => <InputNumber min={1} value={record.soLuong} onChange={(v) => updateItem(record.key, 'soLuong', v || 0)} /> },
                  { title: 'Giá Nhập', render: ( record) => <InputNumber min={0} style={{width: '100%'}} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} value={record.giaNhap} onChange={(v) => updateItem(record.key, 'giaNhap', v || 0)} /> },
                  { title: 'Thành Tiền', render: (record) => <Text strong>{(record.soLuong * record.giaNhap).toLocaleString()}đ</Text> },
                  { title: '', render: (record) => <Button danger icon={<DeleteOutlined />} onClick={() => setImportItems(importItems.filter(i => i.key !== record.key))} /> }
                ]}
              />

              <Row justify="end" style={{ marginTop: 24 }}>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Title level={4}>Tổng cộng: <Text type="danger">{totalAmount.toLocaleString()} VNĐ</Text></Title>
                  <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit" loading={loading} block style={{ height: 50 }}>
                    XÁC NHẬN NHẬP KHO
                  </Button>
                </Col>
              </Row>
            </Form>
          </TabPane>

          {/* TAB 2: QUẢN LÝ LỊCH SỬ */}
          <TabPane tab={<span><HistoryOutlined />Lịch sử Nhập kho</span>} key="2">
            <Table 
              columns={historyColumns} 
              dataSource={history} 
              rowKey="_id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

        </Tabs>
      </Card>

      {/* MODAL CHI TIẾT PHIẾU NHẬP */}
      <Modal
        title={<Title level={4}><DatabaseOutlined /> Chi tiết Phiếu Nhập: {selectedPhieu?.maPhieu}</Title>}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={[
          <><Button key="close" onClick={() => setIsDetailOpen(false)}>Đóng</Button><Button
            key="export"
            type="primary"
            danger
            icon={<FileExcelOutlined />}
            onClick={() => handleExportPhieuExcel(selectedPhieu._id, selectedPhieu.maPhieu)}
          >
            Xuất Excel
          </Button></>
        ]}
        width={800}
      >
        {selectedPhieu && (
          <div>
            <Row gutter={24} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <Space direction="vertical">
                  <Text><ShopOutlined /> <b>Nhà cung cấp:</b> {selectedPhieu.nhaCungCap}</Text>
                  <Text><UserOutlined /> <b>Người nhập:</b> {selectedPhieu.nhanVienNhap?.ten}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical">
                  <Text><CalendarOutlined /> <b>Thời gian:</b> {dayjs(selectedPhieu.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                  <Text><b>Ghi chú:</b> {selectedPhieu.ghiChu || 'Không có'}</Text>
                </Space>
              </Col>
            </Row>
            
            <Table 
              dataSource={selectedPhieu.chiTietNhap}
              pagination={false}
              bordered
              columns={[
                { title: 'Tên Sản Phẩm', dataIndex: ['sanPham', 'tenSanPham'] },
                { title: 'Mã SP', dataIndex: ['sanPham', 'maSanPham'] },
                { title: 'Số Lượng', dataIndex: 'soLuong', render: (val) => <Badge count={val} color="blue" /> },
                { title: 'Giá Nhập', dataIndex: 'giaNhap', render: (val) => `${val?.toLocaleString()}đ` },
                { title: 'Thành Tiền', render: (record) => <Text strong>{(record.soLuong * record.giaNhap).toLocaleString()}đ</Text> }
              ]}
            />
            
            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <Title level={3}>Tổng tiền: <Text type="danger">{selectedPhieu.tongTien?.toLocaleString()} VNĐ</Text></Title>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryImportPage;