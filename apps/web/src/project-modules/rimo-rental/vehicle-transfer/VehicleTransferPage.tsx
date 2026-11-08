/** RIMO vehicle_transfer.html converted to React. Dispatch only changes
 * synthetic in-memory vehicles; no real command is sent. */
import { useState } from 'react';
import { ArrowRight, Car, Check, RefreshCw, X } from 'lucide-react';
import './vehicle-transfer.css';
import { LocalizedView } from '@/features/showcase/showcase-locale';
interface Vehicle {
  id: number;
  licensePlate: string;
  model: string;
  currentStationId: string;
  currentServiceType: string;
  status: string;
}
interface Transfer {
  vehicle: Vehicle;
  targetStationId: string;
  targetServiceType: string;
}
const stations = [
  { id: 's-1', name: '臺北車站門市 (所有)' },
  { id: 's-2', name: '松山機場門市 (單向)' },
  { id: 's-3', name: '信義CBD網點 (同站)' },
  { id: 's-4', name: '左營高鐵站門市' },
  { id: 's-5', name: '駁二藝術特區中心' },
];
const services: Record<string, string> = {
  SHARING_SAME: '同站租還',
  SHARING_ONE_WAY: '甲租乙還',
  STORE_STANDARD: '門市租賃',
  STORE_24H: '24H門市',
};
const initial: Vehicle[] = [
  {
    id: 1,
    licensePlate: 'RAB-1234',
    model: 'Model 3',
    currentStationId: 's-1',
    currentServiceType: 'SHARING_SAME',
    status: 'IDLE',
  },
  {
    id: 2,
    licensePlate: 'RDZ-5566',
    model: 'Model 3',
    currentStationId: 's-3',
    currentServiceType: 'SHARING_SAME',
    status: 'IDLE',
  },
  {
    id: 3,
    licensePlate: 'TCD-9900',
    model: 'Toyota Alphard',
    currentStationId: 's-2',
    currentServiceType: 'SHARING_ONE_WAY',
    status: 'IDLE',
  },
  {
    id: 4,
    licensePlate: 'REN-8888',
    model: 'Porsche Macan',
    currentStationId: 's-4',
    currentServiceType: 'STORE_STANDARD',
    status: 'USED',
  },
  {
    id: 5,
    licensePlate: 'EAB-1234',
    model: 'Model Y',
    currentStationId: 's-5',
    currentServiceType: 'SHARING_SAME',
    status: 'IDLE',
  },
];
export default function VehicleTransferPage() {
  const [vehicles, setVehicles] = useState(initial),
    [keyword, setKeyword] = useState(''),
    [station, setStation] = useState(''),
    [service, setService] = useState(''),
    [selected, setSelected] = useState<number[]>([]),
    [transfers, setTransfers] = useState<Transfer[]>([]),
    [bulkStation, setBulkStation] = useState(''),
    [bulkService, setBulkService] = useState(''),
    [notice, setNotice] = useState('');
  const visible = vehicles.filter(
    (vehicle) =>
      `${vehicle.licensePlate} ${vehicle.model}`.toLowerCase().includes(keyword.toLowerCase()) &&
      (!station || vehicle.currentStationId === station) &&
      (!service || vehicle.currentServiceType === service),
  );
  const open = (items: Vehicle[]) => {
    setTransfers(
      items.map((vehicle) => ({
        vehicle,
        targetStationId: vehicle.currentStationId,
        targetServiceType: vehicle.currentServiceType,
      })),
    );
    setBulkStation('');
    setBulkService('');
  };
  const changes = transfers.filter(
    (item) =>
      item.targetStationId !== item.vehicle.currentStationId ||
      item.targetServiceType !== item.vehicle.currentServiceType,
  );
  const stationName = (id: string) => stations.find((item) => item.id === id)?.name ?? '未知站點';
  const update = (id: number, field: 'targetStationId' | 'targetServiceType', value: string) =>
    setTransfers((current) =>
      current.map((item) => (item.vehicle.id === id ? { ...item, [field]: value } : item)),
    );
  const submit = () => {
    setVehicles((current) =>
      current.map((vehicle) => {
        const item = changes.find((item) => item.vehicle.id === vehicle.id);
        return item
          ? { ...vehicle, currentStationId: item.targetStationId, currentServiceType: item.targetServiceType }
          : vehicle;
      }),
    );
    setNotice(`成功執行調撥任務，共 ${changes.length} 輛車`);
    setTransfers([]);
    setSelected([]);
  };
  return (
    <LocalizedView>
      <section className="rimo-transfer" data-prototype-canvas>
        <header className="rimo-transfer-heading">
          <div>
            <h1>車輛調撥管理</h1>
            <p>負責修改同業務站點分佈或執行跨業務線服務切換操作，支持單發及批量調度。</p>
          </div>
          <button
            className="transfer-primary"
            disabled={!selected.length}
            onClick={() =>
              open(vehicles.filter((vehicle) => selected.includes(vehicle.id) && vehicle.status === 'IDLE'))
            }
          >
            批量調撥 ({selected.length})
          </button>
        </header>
        <div className="transfer-panel">
          <div className="transfer-filters">
            <input
              aria-label="搜索車牌號或車型"
              placeholder="搜索車牌號/車型"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <select
              aria-label="當前所在站點"
              value={station}
              onChange={(event) => setStation(event.target.value)}
            >
              <option value="">當前所在站點</option>
              {stations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              aria-label="當前服務類型"
              value={service}
              onChange={(event) => setService(event.target.value)}
            >
              <option value="">當前服務類型</option>
              {Object.entries(services).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              className="transfer-icon"
              aria-label="重置篩選"
              onClick={() => {
                setKeyword('');
                setStation('');
                setService('');
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="transfer-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      aria-label="選取所有空閒車輛"
                      checked={
                        visible.filter((vehicle) => vehicle.status === 'IDLE').length > 0 &&
                        visible
                          .filter((vehicle) => vehicle.status === 'IDLE')
                          .every((vehicle) => selected.includes(vehicle.id))
                      }
                      onChange={(event) =>
                        setSelected(
                          event.target.checked
                            ? visible
                                .filter((vehicle) => vehicle.status === 'IDLE')
                                .map((vehicle) => vehicle.id)
                            : [],
                        )
                      }
                    />
                    <span className="transfer-mobile-select-label">選取所有空閒車輛</span>
                  </th>
                  <th>車輛信息</th>
                  <th>當前站點</th>
                  <th>當前服務類型</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`選取${vehicle.licensePlate}`}
                        checked={selected.includes(vehicle.id)}
                        disabled={vehicle.status !== 'IDLE'}
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? [...selected, vehicle.id]
                              : selected.filter((id) => id !== vehicle.id),
                          )
                        }
                      />
                    </td>
                    <td>
                      <div className="transfer-vehicle">
                        <span>
                          <Car size={22} />
                        </span>
                        <div>
                          <strong>{vehicle.licensePlate}</strong>
                          <small>{vehicle.model}</small>
                        </div>
                      </div>
                    </td>
                    <td>{stationName(vehicle.currentStationId)}</td>
                    <td>
                      <span className={`transfer-tag ${vehicle.currentServiceType}`}>
                        {services[vehicle.currentServiceType]}
                      </span>
                    </td>
                    <td>
                      <span className={`transfer-tag ${vehicle.status}`}>
                        {vehicle.status === 'IDLE' ? '空閒中' : '不可調撥'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="transfer-link"
                        disabled={vehicle.status !== 'IDLE'}
                        onClick={() => open([vehicle])}
                      >
                        快捷調度
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length && <p className="transfer-empty">暫無符合條件的車輛</p>}
          </div>
        </div>
        {notice && (
          <p role="status" className="transfer-notice">
            {notice}
          </p>
        )}
        {transfers.length > 0 && (
          <div
            className="transfer-backdrop"
            onKeyDown={(event) => {
              if (event.key === 'Escape') setTransfers([]);
            }}
          >
            <section
              className="transfer-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="transfer-title"
            >
              <header>
                <h2 id="transfer-title">
                  {transfers.length > 1 ? '批量車輛調撥與服務切換' : '單車快捷調撥'}
                </h2>
                <button className="transfer-icon" aria-label="關閉調撥" onClick={() => setTransfers([])}>
                  <X size={18} />
                </button>
              </header>
              {transfers.length > 1 && (
                <div className="transfer-bulk">
                  <strong>批量統一配置 (可選)</strong>
                  <div>
                    <label>
                      統一服務類型
                      <select value={bulkService} onChange={(event) => setBulkService(event.target.value)}>
                        <option value="">保持原樣</option>
                        {Object.entries(services).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      統一目標站點
                      <select value={bulkStation} onChange={(event) => setBulkStation(event.target.value)}>
                        <option value="">選擇目標站點</option>
                        {stations.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="transfer-secondary"
                      onClick={() =>
                        setTransfers(
                          transfers.map((item) => ({
                            ...item,
                            targetStationId: bulkStation || item.targetStationId,
                            targetServiceType: bulkService || item.targetServiceType,
                          })),
                        )
                      }
                    >
                      應用到所有車輛
                    </button>
                  </div>
                </div>
              )}
              <div className="transfer-execution">
                <h3>調撥執行清單 ({transfers.length}輛)</h3>
                {transfers.map((item) => (
                  <div
                    className={`transfer-change ${changes.includes(item) ? 'changed' : ''}`}
                    key={item.vehicle.id}
                  >
                    <div>
                      <strong>{item.vehicle.licensePlate}</strong>
                      <p>目前站點：{stationName(item.vehicle.currentStationId)}</p>
                      <p>服務類型：{services[item.vehicle.currentServiceType]}</p>
                    </div>
                    <ArrowRight size={24} />
                    <div className="transfer-target">
                      <label>
                        目標類型
                        <select
                          value={item.targetServiceType}
                          onChange={(event) =>
                            update(item.vehicle.id, 'targetServiceType', event.target.value)
                          }
                        >
                          {Object.entries(services).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        目標站點
                        <select
                          value={item.targetStationId}
                          onChange={(event) => update(item.vehicle.id, 'targetStationId', event.target.value)}
                        >
                          {stations.map((station) => (
                            <option key={station.id} value={station.id}>
                              {station.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <footer>
                <span>
                  檢測到 <strong>{changes.length}</strong> 輛車產生實際變更
                </span>
                <div>
                  <button autoFocus className="transfer-secondary" onClick={() => setTransfers([])}>
                    取消
                  </button>
                  <button
                    className="transfer-primary"
                    disabled={!changes.length || transfers.some((item) => !item.targetStationId)}
                    onClick={submit}
                  >
                    <Check size={16} />
                    確認執行調撥
                  </button>
                </div>
              </footer>
            </section>
          </div>
        )}
      </section>
    </LocalizedView>
  );
}
