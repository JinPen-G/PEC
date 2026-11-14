/** Adapted from Preview vehicle-group prototype. Source and hashes are recorded in the example source manifest. */
/** Portable React view services; Preview injects its fixed controls and authorized navigation. */
import { createContext, useContext, useMemo, useState } from 'react';
import * as antd from 'antd';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bell,
  BookOpen,
  Brush,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Clock,
  Compass,
  Cpu,
  CreditCard,
  Download,
  FileCheck,
  FileText,
  Gauge,
  Grid2X2,
  Home,
  Image,
  Info,
  Key,
  Layers3,
  List,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Monitor,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Sun,
  Ticket,
  Timer,
  Trash2,
  TriangleAlert,
  Truck,
  Unlock,
  Upload,
  User,
  Wallet,
  Wrench,
  X,
  Building2,
  Coins,
  Send,
  Edit,
  ChartNoAxesCombined,
} from 'lucide-react';
import './rimo-elements.css';
import './rimo-business.css';

export const rimoIcons = {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDownBold: ArrowDown,
  ArrowUpBold: ArrowUp,
  ArrowRightBold: ArrowRight,
  Back: ArrowLeft,
  Right: ArrowRight,
  Top: ArrowUp,
  Bottom: ArrowDown,
  TopRight: ArrowRight,
  Sort: ArrowUpDown,
  Refresh: RefreshCw,
  RefreshRight: RefreshCw,
  Search,
  Plus,
  Minus,
  Download,
  Upload,
  UploadFilled: Upload,
  Delete: Trash2,
  Edit,
  Close: X,
  User,
  UserFilled: User,
  Avatar: User,
  Phone,
  PhoneFilled: Phone,
  Iphone: Smartphone,
  House: Home,
  OfficeBuilding: Building2,
  Shop: Store,
  Van: Car,
  Bicycle: Car,
  Odometer: Gauge,
  Timer,
  Clock,
  Calendar,
  Lock,
  Unlock,
  Key,
  Wallet,
  Money: Coins,
  Coin: Coins,
  CreditCard,
  Ticket,
  Tickets: Ticket,
  Receipt,
  Goods: ShoppingBag,
  Document: FileText,
  DocumentChecked: FileCheck,
  DocumentDelete: FileText,
  Picture: Image,
  PictureFilled: Image,
  PictureRounded: Image,
  Check,
  CircleCheck,
  CircleCheckFilled: CircleCheck,
  Warning: TriangleAlert,
  WarningFilled: TriangleAlert,
  InfoFilled: Info,
  QuestionFilled: CircleHelp,
  Connection: Layers3,
  Operation: Menu,
  Grid: Grid2X2,
  List,
  Guide: BookOpen,
  Setting: Settings,
  Tools: Wrench,
  CollectionTag: Ticket,
  Message: MessageSquare,
  Bell,
  Monitor,
  Cpu,
  Position: MapPin,
  Location: MapPin,
  Compass,
  Sunny: Sun,
  MagicStick: Sparkles,
  Lightning: Sparkles,
  Star,
  Medal: ShieldCheck,
  Brush,
  Promotion: Send,
  Stamp: Receipt,
  DataLine: ChartNoAxesCombined,
  Histogram: ChartNoAxesCombined,
  Switch: ArrowUpDown,
  CaretRight: ChevronRight,
  ChevronDown,
  Truck,
};

function PortableTable({ toolbar, toolbarNote, ...props }) {
  return (
    <>
      {(toolbar || toolbarNote) && (
        <div className="rimo-portable-toolbar">
          {toolbar}
          {toolbarNote && <span className="rimo-toolbar-count">{toolbarNote}</span>}
        </div>
      )}
      <antd.Table {...props} />
    </>
  );
}

function PortableSearchField({ label, onValueChange, ...props }) {
  return (
    <antd.Input
      {...props}
      type="search"
      aria-label={label}
      prefix={<Search size={15} />}
      allowClear
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  );
}

const defaults = {
  controls: { ...antd, Table: PortableTable, SearchField: PortableSearchField },
  text: (value) => (typeof value === 'string' ? value : String(value ?? '')),
  navigate: () => {},
  search: '',
  asset: (path) => path,
  notify: (type, message) =>
    antd.message[
      type === 'loading' ? 'loading' : type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
    ](message),
  confirm: (message, title) =>
    new Promise((resolve, reject) =>
      antd.Modal.confirm({
        title: title ?? '确认操作',
        content: message,
        onOk: () => resolve(true),
        onCancel: () => reject(new Error('cancel')),
      }),
    ),
};
const Environment = createContext(defaults);
const PageScope = createContext('');
export function RimoEnvironmentProvider({
  controls,
  text,
  navigate,
  search,
  asset,
  notify,
  confirm,
  children,
}) {
  const value = useMemo(
    () => ({
      ...defaults,
      controls: controls ?? defaults.controls,
      text: text ?? defaults.text,
      navigate: navigate ?? defaults.navigate,
      search: search ?? '',
      asset: asset ?? defaults.asset,
      notify: notify ?? defaults.notify,
      confirm: confirm ?? defaults.confirm,
    }),
    [controls, text, navigate, search, asset, notify, confirm],
  );
  return <Environment.Provider value={value}>{children}</Environment.Provider>;
}
export const useRimoEnvironment = () => useContext(Environment);
export const useRimoPageKey = () => useContext(PageScope);
export function RimoRoot({ model, pageKey, assets = {}, children }) {
  const { asset } = useRimoEnvironment();
  const style = Object.fromEntries(
    Object.entries(assets).map(([variable, path]) => {
      const resolved = asset(path);
      return [variable, resolved ? `url(${JSON.stringify(resolved)})` : 'none'];
    }),
  );
  const { navigate } = useRimoEnvironment();
  return (
    <PageScope.Provider value={pageKey}>
      <div
        className="rimo-business-page"
        data-rimo-page={pageKey}
        style={style}
        ref={(element) => model.setRoot(element)}
        onClick={(event) => {
          const link = event.target.closest?.('a[href]');
          const href = link?.getAttribute('href');
          if (href && !/^(https?:|mailto:|tel:|data:|blob:|#)/i.test(href)) {
            event.preventDefault();
            navigate(href);
          }
        }}
      >
        {children}
      </div>
    </PageScope.Provider>
  );
}
export function RimoIcon({ name, size = 16 }) {
  const Component =
    typeof name === 'function' || (name && typeof name === 'object')
      ? name
      : (rimoIcons[name] ??
        rimoIcons[String(name).replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase())] ??
        FileText);
  return <Component size={size} aria-hidden="true" />;
}
export function RimoImage({ src, alt = '', ...props }) {
  const { asset } = useRimoEnvironment();
  const [failed, setFailed] = useState('');
  const url = src ? asset(src) : '';
  return url && failed !== url ? (
    <img {...props} src={url} alt={alt} onError={() => setFailed(url)} />
  ) : (
    <span
      className={`rimo-icon-placeholder ${props.className ?? ''}`}
      role="img"
      aria-label={alt || '图片暂不可用'}
    >
      <RimoIcon name="Picture" />
    </span>
  );
}
