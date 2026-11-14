/** Rental OS controls are the sole backend presentation entry. Ant primitives
 * here are the unchanged compatibility primitives used by the source framework. */
import type { ReactNode } from 'react';
import { App as AntApp } from 'antd';
import { FeedbackProvider } from './admin-controls/runtime/apps/admin/src/components/ui/Feedback';
export { Form } from './admin-controls/runtime/apps/admin/src/components/ui/Form';
export { Button } from './admin-controls/runtime/apps/admin/src/components/ui/Button';
export { Table } from './admin-controls/runtime/apps/admin/src/components/ui/Table';
export { Input } from './admin-controls/runtime/apps/admin/src/components/ui/Input';
export { SearchField } from './admin-controls/runtime/apps/admin/src/components/ui/SearchField';
export { Select } from './admin-controls/runtime/apps/admin/src/components/ui/Select';
export { Segmented } from './admin-controls/runtime/apps/admin/src/components/ui/Segmented';
export { Modal } from './admin-controls/runtime/apps/admin/src/components/ui/Modal';
export { Tabs } from './admin-controls/runtime/apps/admin/src/components/ui/Tabs';
export {
  Tabs as TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './admin-controls/runtime/packages/ui-primitives/vendor/registry/components/tabs/tabs';
export { Alert } from './admin-controls/runtime/apps/admin/src/components/ui/Alert';
export { Empty } from './admin-controls/runtime/apps/admin/src/components/ui/Empty';
export { Result } from './admin-controls/runtime/apps/admin/src/components/ui/Result';
export { ResultPage } from './ResultPage';
export { Pagination } from './admin-controls/runtime/apps/admin/src/components/ui/Pagination';
export { Switch } from './admin-controls/runtime/apps/admin/src/components/ui/Switch';
export { Checkbox } from './admin-controls/runtime/apps/admin/src/components/ui/Checkbox';
export { Dropdown } from './admin-controls/runtime/apps/admin/src/components/ui/Dropdown';
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './admin-controls/runtime/packages/ui-primitives/vendor/registry/components/popover/popover';
export { DatePicker } from './admin-controls/runtime/apps/admin/src/components/ui/DatePicker';
export { TableRefreshProvider } from './admin-controls/runtime/apps/admin/src/components/ui/data-table/TableRefreshContext';
export { ListFilterItem } from './admin-controls/runtime/apps/admin/src/components/ui/ListFilterBar';
export { App } from './admin-controls/runtime/apps/admin/src/components/ui/App';
export { InputNumber, Tag, Descriptions, Card, Col, Row, Space, Typography } from 'antd';
export { LoadingState, LoadingStage } from './LoadingState';
export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  return (
    <AntApp component={false}>
      <FeedbackProvider>{children}</FeedbackProvider>
    </AntApp>
  );
}
