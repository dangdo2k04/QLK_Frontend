// src/utils/renderDeliveryInfo.ts
export interface OrderLike {
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export const renderDeliveryInfo = (order: OrderLike): string => {
  if (order.status === "pending") {
    const expectedDate = new Date(order.createdAt);
    expectedDate.setDate(expectedDate.getDate() + 2);
    return `Ngày giao dự kiến: ${expectedDate.toLocaleDateString("vi-VN")}`;
  }

  if (order.status === "shipped" && order.updatedAt) {
    return `Đã giao hàng: ${new Date(order.updatedAt).toLocaleDateString("vi-VN")}`;
  }

  if (order.status === "cancelled") {
    return "Đơn hàng đã bị hủy";
  }

  return "Trạng thái không xác định";
};
