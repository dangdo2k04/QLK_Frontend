import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Tag, Button, Typography, Space, 
  message, Modal, Col, Row, Tooltip, Input, Badge 
} from 'antd';
import { 
  InboxOutlined, 
  FileExcelOutlined,  
  SearchOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  ReloadOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import api from '../config/axios';

const { Title, Text } = Typography;

// Đồng bộ Interface với Schema PhieuXuat
interface PickingList {
  _id: string;
  maPhieu: string;
  donHang: { 
    maDonHang: string; 
    khachHang: { ten: string; soDienThoai: string };
    diaChiGiaoHang: string;
    ghiChu: string;
  };
  chiTietXuat: any[];
  trangThai: string;
  createdAt: string;
}

const OrderFulfillment: React.FC = () => {
  const [modal, contextHolder] = Modal.useModal();
  const [pickingLists, setPickingLists] = useState<PickingList[]>([]);
  const [filteredLists, setFilteredLists] = useState<PickingList[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState<string>(''); 

  // 1. Lấy danh sách PHIẾU XUẤT đang chờ nhặt hàng
  const fetchPickingLists = async () => {
    setLoading(true);
    try {
      // API này lấy từ Schema PhieuXuat
      const res = await api.get('/xuat-kho/');
      const data = res.data.duLieu || [];
      setPickingLists(data);
      setFilteredLists(data);
    } catch (err) {
      message.error('Không thể tải danh sách phiếu chuẩn bị hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickingLists();
  }, []);

  // 2. Lọc nhanh theo mã phiếu hoặc mã đơn
  useEffect(() => {
    const filtered = pickingLists.filter((item) =>
      item.maPhieu.toLowerCase().includes(searchKey.toLowerCase()) ||
      item.donHang?.maDonHang.toLowerCase().includes(searchKey.toLowerCase()) ||
      item.donHang?.khachHang?.ten.toLowerCase().includes(searchKey.toLowerCase())
    );
    setFilteredLists(filtered);
  }, [searchKey, pickingLists]);

  // 3. Hàm gọi API xuất file Excel nhặt hàng (Picking List)
const handleExportExcel = async (phieuId: string, maPhieu: string) => {
  const hide = message.loading(`Đang khởi tạo file cho phiếu ${maPhieu}...`, 0);
  try {
    const response = await api.get(`/don-hang/xuat-picking/${phieuId}`, {
      responseType: 'blob', // QUAN TRỌNG: Để nhận dữ liệu nhị phân của file Excel
    });

    // 1. Tạo một URL từ dữ liệu nhị phân (Blob)
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // 2. Tạo một thẻ <a> ẩn để kích hoạt download
    const link = document.createElement('a');
    link.href = url;
    
    // Đặt tên file khi tải về
    link.setAttribute('download', `PickingList-${maPhieu}.xlsx`);
    
    // 3. Gắn vào DOM, click và dọn dẹp
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Giải phóng bộ nhớ

    message.success(`Đã tải xong phiếu ${maPhieu}`);
  } catch (err: any) {
    console.error("Lỗi xuất file:", err);
    message.error('Không thể xuất file Excel. Vui lòng kiểm tra quyền hạn!');
  } finally {
    hide(); // Đóng loading message
  }
};

  // 4. Xác nhận đã nhặt xong hàng và xuất kho thực tế
  const confirmFulfillment = async (phieuId: string) => {
    try {
      setLoading(true);
      // API cập nhật trạng thái phiếu xuất sang DaXuatKho
      const res = await api.put(`/phieu-xuat/${phieuId}/xac-nhan`, {
        trangThai: 'DaXuatKho'
      });

      if (res.data.success) {
        message.success('Xác nhận xuất kho thành công!');
        fetchPickingLists();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi xác nhận');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmModal = (record: PickingList) => {
    modal.confirm({
      title: `Hoàn tất nhặt hàng cho phiếu ${record.maPhieu}?`,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: 'Sau khi xác nhận, tồn kho sẽ chính thức được trừ và đơn hàng chuyển sang trạng thái vận chuyển.',
      okText: 'Xác nhận xuất kho',
      cancelText: 'Để sau',
      onOk: () => confirmFulfillment(record._id),
    });
  };

  const columns = [
    {
      title: 'Phiếu Xuất / Đơn Hàng',
      key: 'codes',
      width: 200,
      render: (record: PickingList) => (
        <Space direction="vertical" size={0}>
          <Text strong><BarcodeOutlined /> {record.maPhieu}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>Đơn: {record.donHang?.maDonHang}</Text>
        </Space>
      ),
    },
    {
      title: 'Thông tin nhặt hàng',
      dataIndex: 'chiTietXuat',
      key: 'items',
      render: (items: any[]) => (
        <div style={{ background: '#f9f9f9', padding: '8px', borderRadius: '8px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 4 }}>
              <Badge count={item.soLuongYeuCau} showZero color="#108ee9" style={{ marginRight: 8 }} />
              <Text>{item.sanPham?.tenSanPham}</Text>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: () => <Tag color="processing" icon={<ReloadOutlined spin />}>Đang chuẩn bị</Tag>,
    },
    {
      title: 'Thao Tác Kho',
      key: 'action',
      width: 250,
      fixed: 'right' as const,
      render: (record: PickingList) => (
        <Space>
          <Tooltip title="In danh sách cho thủ kho cầm đi nhặt hàng">
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={() => handleExportExcel(record._id, record.maPhieu)}
              style={{ color: '#1f7a1f', borderColor: '#1f7a1f' }}
            >
              Picking List
            </Button>
          </Tooltip>
          <Button 
            type="primary" 
            icon={<TruckOutlined />} 
            onClick={() => showConfirmModal(record)}
          >
            Xác nhận xuất
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {contextHolder}
      <Card variant="borderless" style={{ borderRadius: '12px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}><InboxOutlined /> Quản Lý Nhặt Hàng & Xuất Kho</Title>
            <Text type="secondary">In Picking List và xác nhận thực xuất từ kho</Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchPickingLists} loading={loading}>Làm mới</Button>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <Input
              placeholder="Tìm theo mã phiếu, mã đơn hoặc tên khách..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
            />
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={filteredLists} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '10px 40px' }}>
                <Text strong>Khách hàng: </Text> {record.donHang?.khachHang?.ten} - {record.donHang?.khachHang?.soDienThoai} <br/>
                <Text strong>Địa chỉ giao: </Text> {record.donHang?.diaChiGiaoHang} <br/>
                <Text strong>Ghi chú: </Text> <Text type="danger">{record.donHang?.ghiChu || 'Không có'}</Text>
              </div>
            )
          }}
        />
      </Card>
    </div>
  );
};

export default OrderFulfillment;