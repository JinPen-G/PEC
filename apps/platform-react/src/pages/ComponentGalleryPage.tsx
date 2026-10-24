import { useState } from 'react';

import {
  Alert,
  Button,
  Descriptions,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from '@/ui/ant';
import {
  CheckCircleFilled,
  ExperimentOutlined,
  FormOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  TableOutlined,
} from '@/ui/ant/icons';
import { PlatformPage } from '@/ui/platform/PlatformPage';
import { Surface } from '@/ui/platform/Surface';

const { Text, Title } = Typography;

const componentRows = [
  {
    name: '項目包狀態',
    area: '數據管理',
    status: '穩定',
    statusColor: 'success',
    use: '項目清單、異常狀態與編輯入口',
  },
  {
    name: '路由菜單管理',
    area: '配置管理',
    status: '穩定',
    statusColor: 'success',
    use: '分組、排序、頁面關聯與備份',
  },
  {
    name: 'AI 上下文中心',
    area: '交付協作',
    status: '迭代中',
    statusColor: 'warning',
    use: 'PRD 覆蓋、影響分析與上下文導出',
  },
];

export function ComponentGalleryPage() {
  const [status, setStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const visibleRows = componentRows.filter((item) => status === 'all' || item.status === status);

  return (
    <PlatformPage
      title="組件規範"
      description="React 平臺的公共控件統一基於 Ant Design；項目業務頁面與項目包內容不在此修改。"
      actions={
        <Button type="primary" icon={<ExperimentOutlined />} onClick={() => setDialogOpen(true)}>
          查看交互範例
        </Button>
      }
    >
      <Alert
        showIcon
        type="info"
        title="單一組件來源"
        description="表單、表格、彈窗、反饋與導航控件均從平臺 Ant 適配層使用，避免同類交互出現多套樣式。"
      />
      <Descriptions
        className="gallery-overview"
        bordered
        column={{ xs: 1, sm: 1, md: 3 }}
        items={[
          {
            key: 'source',
            label: '組件來源',
            children: (
              <>
                <CheckCircleFilled /> Ant Design 適配層
              </>
            ),
          },
          {
            key: 'form',
            label: '表單規範',
            children: (
              <>
                <FormOutlined /> 統一校驗與操作位置
              </>
            ),
          },
          {
            key: 'data',
            label: '數據展示',
            children: (
              <>
                <TableOutlined /> 緊湊表格優先
              </>
            ),
          },
        ]}
      />
      <Surface className="gallery-surface">
        <header className="surface-heading">
          <div>
            <Title level={3}>操作與狀態</Title>
            <Text type="secondary">主操作明確、危險操作可辨認，狀態只表達當前業務含義。</Text>
          </div>
          <ExperimentOutlined className="surface-heading__icon" />
        </header>
        <div className="gallery-action-row">
          <div>
            <Text>操作層級</Text>
            <Space wrap size={[10, 10]}>
              <Button type="primary">保存變更</Button>
              <Button>取消</Button>
              <Button icon={<SettingOutlined />}>工具操作</Button>
              <Button danger>刪除</Button>
            </Space>
          </div>
          <div>
            <Text>業務狀態</Text>
            <Space wrap size={[8, 8]}>
              <Tag color="success">可用</Tag>
              <Tag color="processing">處理中</Tag>
              <Tag color="warning">待確認</Tag>
              <Tag color="error">異常</Tag>
            </Space>
          </div>
        </div>
      </Surface>
      <Surface className="gallery-surface">
        <header className="surface-heading">
          <div>
            <Title level={3}>表單與配置</Title>
            <Text type="secondary">字段標籤、輔助說明和開關狀態保持同一閱讀順序。</Text>
          </div>
          <FormOutlined className="surface-heading__icon" />
        </header>
        <Form className="gallery-form" layout="vertical" requiredMark={false}>
          <Form.Item label="名稱" required extra="給使用者能直接理解的名稱。">
            <Input defaultValue="RIMO Rental" />
          </Form.Item>
          <Form.Item label="狀態">
            <Select
              defaultValue="published"
              options={[
                { value: 'published', label: '已發佈' },
                { value: 'draft', label: '草稿' },
              ]}
            />
          </Form.Item>
          <div className="gallery-switch-row">
            <div>
              <strong>在入口中顯示</strong>
              <Text type="secondary">關閉後，該內容不會在默認入口展示。</Text>
            </div>
            <Switch checked={enabled} onChange={setEnabled} />
          </div>
        </Form>
      </Surface>
      <Surface className="gallery-surface">
        <header className="surface-heading">
          <div>
            <Title level={3}>數據表格</Title>
            <Text type="secondary">清單型任務以表格爲主；篩選、狀態和行操作在同一工作區完成。</Text>
          </div>
        </header>
        <Flex className="gallery-table-toolbar" gap={12} wrap="wrap">
          <Input.Search className="gallery-search" placeholder="搜索公共頁面或控件" />
          <Select
            value={status}
            onChange={setStatus}
            options={[
              { label: '全部狀態', value: 'all' },
              { label: '穩定', value: '穩定' },
              { label: '受控', value: '受控' },
              { label: '迭代中', value: '迭代中' },
            ]}
          />
        </Flex>
        <Table
          rowKey="name"
          pagination={false}
          columns={[
            { title: '頁面', dataIndex: 'name' },
            { title: '區域', dataIndex: 'area' },
            { title: '推薦用法', dataIndex: 'use', responsive: ['md'] },
            {
              title: '狀態',
              dataIndex: 'status',
              width: 110,
              render: (value, row) => <Tag color={row.statusColor}>{value}</Tag>,
            },
            { title: '操作', render: () => <Button type="link">查看</Button> },
          ]}
          dataSource={visibleRows}
        />
      </Surface>
      <Modal
        title="交互範例"
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onOk={() => setDialogOpen(false)}
        okText="確認"
        cancelText="取消"
      >
        <Space direction="vertical" size={12}>
          <Flex align="center" gap={10}>
            <InfoCircleOutlined className="gallery-dialog-icon" />
            <Text>彈窗用於需要用戶確認或集中完成的小範圍配置。</Text>
          </Flex>
          <Text type="secondary">
            複雜項目配置使用固定頭部、可滾動內容區和穩定底部操作，避免按鈕隨內容漂移。
          </Text>
        </Space>
      </Modal>
    </PlatformPage>
  );
}
