/** Deterministic synthetic orders. This module has no platform or rental API. */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: '软预占',
  reserved: '已确认',
  pickup_overdue: '待确认爽约',
  ready_for_pickup: '待交付',
  renting: '租赁中',
  return_inspection: '归还检查',
  settling: '待结算',
  completed: '已关闭',
  cancelled: '已取消',
  no_show: '已爽约',
};
export interface DemoOrder {
  id: string;
  orderNo: string;
  customerName: string;
  company: string;
  item: string;
  quantity: number;
  startAt: string;
  endAt: string;
  status: string;
  payableAmount: number;
  currency: string;
  createdAt: string;
}
export function createDemoOrders(): DemoOrder[] {
  const statuses = Object.keys(ORDER_STATUS_LABELS);
  return Array.from({ length: 64 }, (_, index) => {
    const start = new Date(Date.UTC(2026, 10, 1 + (index % 28), 9));
    return {
      id: `demo-order-${String(index + 1).padStart(3, '0')}`,
      orderNo: `DEMO-202611-${String(index + 1).padStart(4, '0')}`,
      customerName: `示例使用人 ${index + 1}`,
      company: index % 3 ? '个人租赁' : `示例企业 ${(index % 5) + 1}`,
      item: ['摄影机套装', '镜头套装', '灯光设备', '录音设备'][index % 4],
      quantity: (index % 3) + 1,
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + ((index % 6) + 1) * 86400000).toISOString(),
      status: statuses[index % statuses.length],
      payableAmount: ((index % 9) + 1) * 180,
      currency: 'CNY',
      createdAt: new Date(start.getTime() - 2 * 86400000).toISOString(),
    };
  });
}
export function queryDemoOrders(
  rows: DemoOrder[],
  {
    keyword = '',
    status = '',
    from = '',
    to = '',
  }: { keyword?: string; status?: string; from?: string; to?: string },
) {
  return rows.filter(
    (row) =>
      (!keyword ||
        `${row.orderNo} ${row.customerName} ${row.company}`
          .toLocaleLowerCase()
          .includes(keyword.toLocaleLowerCase())) &&
      (!status || row.status === status) &&
      (!from || row.endAt.slice(0, 10) >= from) &&
      (!to || row.startAt.slice(0, 10) <= to),
  );
}
