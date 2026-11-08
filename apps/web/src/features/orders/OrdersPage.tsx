import { SearchField } from '@preview/ui/admin';
/** Order list adapted from the fixed RentalOrdersPage/column layout; only local
 * filters and a stable read-only detail layer are retained for this example. */
import { useState, type Key, type ReactNode } from 'react';
import { DatePicker, Descriptions, Modal, Select, Tag, Table, ListFilterItem } from '@preview/ui/admin';
import type { Dayjs } from 'dayjs';
import { Button } from '@preview/ui/admin';
import { PageHeading } from '@/features/platform/PageLayout';
import { createDemoOrders, ORDER_STATUS_LABELS, queryDemoOrders, type DemoOrder } from './order-data';
import styles from '../../../../../packages/preview-ui/upstream/rental-admin/apps/admin/src/features/rental-core/RentalOrdersPage.module.css';
import { usePresentation } from '@/features/platform/CollaborationRoom';
type OrderColumn = {
  key: string;
  title: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  sorter?: (a: DemoOrder, b: DemoOrder) => number;
  render: (_: unknown, row: DemoOrder) => ReactNode;
};

export default function OrdersPage() {
  const [keyword, setKeyword] = useState(''),
    [status, setStatus] = useState('');
  const [period, setPeriod] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selected, setSelected] = useState<Key[]>([]),
    [detail, setDetail] = useState<string | null>(null);
  const presentation = usePresentation();
  const openDetail = (id: string | null) => {
    if (presentation) {
      if (!presentation.following) presentation.setDialog(id);
    } else setDetail(id);
  };
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState(createDemoOrders);
  const visible = queryDemoOrders(rows, {
    keyword,
    status,
    from: period?.[0]?.format('YYYY-MM-DD'),
    to: period?.[1]?.format('YYYY-MM-DD'),
  });
  const current = rows.find((row) => row.id === (presentation ? presentation.dialog : detail));
  const date = (value: string) =>
    new Date(value).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  const columns: OrderColumn[] = [
    {
      key: 'orderNo',
      title: '订单',
      width: 180,
      sorter: (a, b) => a.orderNo.localeCompare(b.orderNo),
      render: (_, row) => (
        <Button type="text" className={styles.orderLink} onClick={() => openDetail(row.id)}>
          {row.orderNo}
        </Button>
      ),
    },
    {
      key: 'customerName',
      title: '使用人 / 主体',
      width: 176,
      render: (_, row) => (
        <div className={styles.identityCopy}>
          <strong className={styles.customerName}>{row.customerName}</strong>
          <span className={styles.secondary}>{row.company}</span>
        </div>
      ),
    },
    {
      key: 'items',
      title: '商品',
      width: 216,
      render: (_, row) => (
        <div className={styles.itemList}>
          <span className={styles.itemName}>{row.item}</span>
          <span className={styles.itemQuantity}>× {row.quantity}</span>
        </div>
      ),
    },
    {
      key: 'startAt',
      title: '计划领取',
      width: 176,
      render: (_, row) => date(row.startAt),
      sorter: (a, b) => a.startAt.localeCompare(b.startAt),
    },
    {
      key: 'endAt',
      title: '计划归还',
      width: 176,
      render: (_, row) => date(row.endAt),
      sorter: (a, b) => a.endAt.localeCompare(b.endAt),
    },
    {
      key: 'status',
      title: '状态',
      width: 155,
      render: (_, row) => <Tag>{ORDER_STATUS_LABELS[row.status]}</Tag>,
    },
    {
      key: 'payableAmount',
      title: '应付',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.payableAmount - b.payableAmount,
      render: (_, row) => (
        <span className="native-money">
          {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: row.currency }).format(
            row.payableAmount,
          )}
        </span>
      ),
    },
    { key: 'createdAt', title: '创建时间', width: 176, render: (_, row) => date(row.createdAt) },
    {
      key: 'actions',
      title: '操作',
      fixed: 'right',
      width: 110,
      render: (_, row) => (
        <Button size="small" onClick={() => openDetail(row.id)}>
          查看详情
        </Button>
      ),
    },
  ];
  const reset = () => {
    setKeyword('');
    setStatus('');
    setPeriod(null);
    setPage(1);
    setSelected([]);
    openDetail(null);
    setRows(createDemoOrders());
  };
  return (
    <section className={`native-page ${styles.page}`} data-prototype-canvas>
      <PageHeading
        title="租赁订单"
        actions={
          <div className="native-actions">
            <span className="text-meta">合成数据 · 本地交互</span>
            <Button onClick={reset}>刷新</Button>
          </div>
        }
      />
      <Table<DemoOrder>
        rowKey="id"
        caption="租赁订单"
        columns={columns}
        dataSource={visible}
        toolbar={
          <>
            <SearchField
              label="搜索订单"
              placeholder="搜索订单号、使用人或企业"
              value={keyword}
              onValueChange={(event) => {
                setKeyword(event);
                setPage(1);
                setSelected([]);
              }}
            />
            <Select
              aria-label="订单状态"
              value={status}
              options={[
                { value: '', label: '全部状态' },
                ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
              ]}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
                setSelected([]);
              }}
            />
            <DatePicker.RangePicker
              aria-label="租赁日期"
              value={period}
              onChange={(value) => {
                setPeriod(value);
                setPage(1);
                setSelected([]);
              }}
            />
            <ListFilterItem kind="action" label="重置">
              <Button onClick={reset}>重置</Button>
            </ListFilterItem>
          </>
        }
        onRefresh={reset}
        locale={{ emptyText: '没有匹配的示例订单' }}
        rowSelection={{ selectedRowKeys: selected, onChange: (keys) => setSelected(keys) }}
        pagination={{
          current: page,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (total) => `共 ${total} 条示例订单`,
          onChange: (next, size) => {
            setPage(size !== pageSize ? 1 : next);
            setPageSize(size);
            setSelected([]);
          },
        }}
      />
      <Modal
        title={current ? `订单详情 · ${current.orderNo}` : '订单详情'}
        open={Boolean(current)}
        onCancel={() => openDetail(null)}
        footer={
          presentation?.following ? (
            <Button onClick={presentation.exitFollow}>退出跟随</Button>
          ) : (
            <Button onClick={() => openDetail(null)}>关闭</Button>
          )
        }
        destroyOnHidden
        data-demo-dialog="order-detail"
      >
        {current && (
          <>
            <Tag>只读示例</Tag>
            <Descriptions
              column={1}
              items={[
                { key: 'order', label: '订单号', children: current.orderNo },
                { key: 'customer', label: '使用人', children: current.customerName },
                { key: 'item', label: '商品', children: `${current.item} × ${current.quantity}` },
                { key: 'status', label: '状态', children: ORDER_STATUS_LABELS[current.status] },
                {
                  key: 'period',
                  label: '租期',
                  children: `${date(current.startAt)} — ${date(current.endAt)}`,
                },
                {
                  key: 'money',
                  label: '应付',
                  children: `${current.currency} ${current.payableAmount.toFixed(2)}`,
                },
              ]}
            />
            <p className="text-meta">此示例不提供新建、支付、押金、分配或结算操作。</p>
          </>
        )}
      </Modal>
    </section>
  );
}
