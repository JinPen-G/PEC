/** Native conversion of RIMO vehicle_groups.html. Changes are local prototype
 * state, never platform or rental-service mutations. */
import { Fragment, useState, type ComponentType, type ReactNode } from 'react';
import { Car, Plus, Search, X } from 'lucide-react';
import './vehicle-groups.css';
type VehicleType = 'car' | 'motorcycle' | 'microElectric';
interface Group {
  id: string;
  brand: string;
  model: string;
  year: string;
  vehicleType: VehicleType;
  originType: string;
  seatCount: number;
  displacement: string;
  fuelTankCapacity: number;
  trunkCapacity: number;
  features: string[];
}
const initialGroups: Group[] = [
  {
    id: 'G1',
    brand: 'Tesla',
    model: 'Model 3',
    year: '2023',
    vehicleType: 'car',
    originType: 'imported',
    seatCount: 5,
    displacement: '純電',
    fuelTankCapacity: 0,
    trunkCapacity: 425,
    features: ['純電動', '自動輔助駕駛', '全景天窗'],
  },
  {
    id: 'G2',
    brand: 'Hyundai',
    model: 'IONIQ 5',
    year: '2024',
    vehicleType: 'car',
    originType: 'imported',
    seatCount: 5,
    displacement: '純電',
    fuelTankCapacity: 0,
    trunkCapacity: 527,
    features: ['800V快充', 'V2L外放', '雙12.3寸屏'],
  },
  {
    id: 'G3',
    brand: 'BMW',
    model: 'R 1250 GS',
    year: '2023',
    vehicleType: 'motorcycle',
    originType: 'imported',
    seatCount: 2,
    displacement: '1254cc',
    fuelTankCapacity: 20,
    trunkCapacity: 0,
    features: ['ABS', '加熱把手', '電子懸掛'],
  },
  {
    id: 'G4',
    brand: 'Honda',
    model: 'Rebel 500',
    year: '2022',
    vehicleType: 'motorcycle',
    originType: 'imported',
    seatCount: 2,
    displacement: '471cc',
    fuelTankCapacity: 11,
    trunkCapacity: 0,
    features: ['低座高', '復古風格'],
  },
  {
    id: 'G5',
    brand: 'RIMO',
    model: 'Mini EV',
    year: '2024',
    vehicleType: 'microElectric',
    originType: 'domestic',
    seatCount: 2,
    displacement: '純電',
    fuelTankCapacity: 0,
    trunkCapacity: 80,
    features: ['城市通勤', '輕巧靈活'],
  },
];
const labels = { car: '汽車', motorcycle: '摩托車', microElectric: '微電車' };
const brands: Record<VehicleType, string[]> = {
  car: ['Tesla', 'Hyundai', 'Toyota', 'BMW', 'Honda'],
  motorcycle: ['BMW', 'Honda', 'Yamaha'],
  microElectric: ['RIMO', 'Gogoro'],
};
const empty = (): Group => ({
  id: `G-${crypto.randomUUID()}`,
  brand: '',
  model: '',
  year: '2026',
  vehicleType: 'car',
  originType: 'imported',
  seatCount: 5,
  displacement: '',
  fuelTankCapacity: 0,
  trunkCapacity: 0,
  features: [],
});
export default function VehicleGroupsBlock({
  renderContent: Content = Fragment,
}: { renderContent?: ComponentType<{ children: ReactNode }> } = {}) {
  const [groups, setGroups] = useState(initialGroups),
    [keyword, setKeyword] = useState(''),
    [editing, setEditing] = useState<Group | null>(null),
    [deleting, setDeleting] = useState<Group | null>(null),
    [notice, setNotice] = useState(''),
    [featureText, setFeatureText] = useState('');
  const open = (group?: Group) => {
    setEditing(group ? structuredClone(group) : empty());
    setFeatureText(group?.features.join('，') ?? '');
    setNotice('');
  };
  const update = (field: keyof Group, value: string | number) =>
    setEditing((current) => (current ? { ...current, [field]: value } : null));
  const save = () => {
    if (!editing?.brand.trim() || !editing.model.trim()) {
      setNotice('請先選擇載具類型，並填寫廠牌和型號');
      return;
    }
    const next = {
      ...editing,
      features: featureText
        .split(/[,，]/)
        .map((value) => value.trim())
        .filter(Boolean),
    };
    setGroups((current) =>
      current.some((group) => group.id === next.id)
        ? current.map((group) => (group.id === next.id ? next : group))
        : [...current, next],
    );
    setEditing(null);
    setNotice('保存成功');
  };
  const filtered = groups.filter((group) =>
    `${group.brand} ${group.model}`.toLowerCase().includes(keyword.toLowerCase()),
  );
  return (
    <Content>
      <section className="rimo-groups" data-prototype-canvas>
        <header className="rimo-groups-heading">
          <div>
            <h1>車型組管理</h1>
            <p>管理車型組的基本資料、載具類型和車輛特性。</p>
          </div>
          <button className="rimo-primary" onClick={() => open()}>
            <Plus size={16} />
            新增車型組
          </button>
        </header>
        <div className="rimo-table-panel">
          <div className="rimo-filter">
            <Search size={16} />
            <input
              aria-label="搜索品牌或型號"
              placeholder="搜索品牌 / 型號"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <span>{filtered.length} 個車型組</span>
          </div>
          <div className="rimo-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>照片</th>
                  <th>品牌 / 型號</th>
                  <th>載具類型</th>
                  <th>特性標籤</th>
                  <th className="rimo-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <div className="rimo-vehicle-photo" aria-label={`${group.model}照片佔位`}>
                        <Car size={27} />
                      </div>
                    </td>
                    <td>
                      <strong>
                        {group.brand} {group.model}
                      </strong>
                      <small>{group.year}款</small>
                    </td>
                    <td>
                      <span className={`rimo-tag ${group.vehicleType}`}>{labels[group.vehicleType]}</span>
                    </td>
                    <td>
                      <div className="rimo-features">
                        {group.features.map((feature) => (
                          <span key={feature} className="rimo-tag neutral">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="rimo-right">
                      <button className="rimo-link" onClick={() => open(group)}>
                        編輯
                      </button>
                      <button className="rimo-link danger" onClick={() => setDeleting(group)}>
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <p className="rimo-empty">暫無符合條件的車型組</p>}
          </div>
        </div>
        {notice && (
          <p role="status" className="rimo-notice">
            {notice}
          </p>
        )}
        {editing && (
          <div
            className="rimo-dialog-backdrop"
            onKeyDown={(event) => {
              if (event.key === 'Escape') setEditing(null);
            }}
          >
            <section
              className="rimo-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="group-dialog-title"
            >
              <header>
                <h2 id="group-dialog-title">
                  {groups.some((group) => group.id === editing.id) ? '編輯車型組' : '新增車型組'}
                </h2>
                <button className="rimo-icon" aria-label="關閉編輯" onClick={() => setEditing(null)}>
                  <X size={18} />
                </button>
              </header>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  save();
                }}
              >
                <div className="rimo-form-grid">
                  <label>
                    載具類型
                    <select
                      autoFocus
                      value={editing.vehicleType}
                      onChange={(event) => {
                        const type = event.target.value as VehicleType;
                        setEditing({
                          ...editing,
                          vehicleType: type,
                          brand: brands[type].includes(editing.brand) ? editing.brand : '',
                        });
                      }}
                    >
                      {Object.entries(labels).map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <small>先選擇載具類型，再選擇對應可用的廠牌。</small>
                  </label>
                  <label>
                    品牌
                    <select
                      required
                      value={editing.brand}
                      onChange={(event) => update('brand', event.target.value)}
                    >
                      <option value="">請選擇品牌</option>
                      {brands[editing.vehicleType].map((brand) => (
                        <option key={brand}>{brand}</option>
                      ))}
                    </select>
                    <small>僅顯示支持當前所選載具類型的品牌</small>
                  </label>
                  <label>
                    型號
                    <input
                      required
                      value={editing.model}
                      placeholder="例如: Model 3"
                      onChange={(event) => update('model', event.target.value)}
                    />
                  </label>
                  <label>
                    年款
                    <input value={editing.year} onChange={(event) => update('year', event.target.value)} />
                  </label>
                  <label>
                    所屬類型
                    <select
                      value={editing.originType}
                      onChange={(event) => update('originType', event.target.value)}
                    >
                      <option value="domestic">國產</option>
                      <option value="imported">進口</option>
                    </select>
                  </label>
                  <label>
                    座位數
                    <input
                      type="number"
                      min="1"
                      value={editing.seatCount}
                      onChange={(event) => update('seatCount', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    排量
                    <input
                      value={editing.displacement}
                      onChange={(event) => update('displacement', event.target.value)}
                    />
                  </label>
                  <label>
                    油箱容量 (L)
                    <input
                      type="number"
                      min="0"
                      value={editing.fuelTankCapacity}
                      onChange={(event) => update('fuelTankCapacity', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    行李廂容量 (L)
                    <input
                      type="number"
                      min="0"
                      value={editing.trunkCapacity}
                      onChange={(event) => update('trunkCapacity', Number(event.target.value))}
                    />
                  </label>
                  <label className="rimo-form-wide">
                    特性標籤
                    <input
                      value={featureText}
                      placeholder="以逗號分隔特性"
                      onChange={(event) => setFeatureText(event.target.value)}
                    />
                  </label>
                </div>
                <footer>
                  <button type="button" className="rimo-secondary" onClick={() => setEditing(null)}>
                    取消
                  </button>
                  <button className="rimo-primary" type="submit">
                    保存
                  </button>
                </footer>
              </form>
            </section>
          </div>
        )}
        {deleting && (
          <div className="rimo-dialog-backdrop">
            <section
              className="rimo-dialog compact"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-title"
            >
              <h2 id="delete-title">確定要刪除該車型組嗎？</h2>
              <p>
                {deleting.brand} {deleting.model}
              </p>
              <footer>
                <button autoFocus className="rimo-secondary" onClick={() => setDeleting(null)}>
                  取消
                </button>
                <button
                  className="rimo-primary"
                  onClick={() => {
                    setGroups(groups.filter((group) => group.id !== deleting.id));
                    setDeleting(null);
                    setNotice('刪除成功');
                  }}
                >
                  確認刪除
                </button>
              </footer>
            </section>
          </div>
        )}
      </section>
    </Content>
  );
}
