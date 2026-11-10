import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, RimoImage, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './vehicle-console.css';
import createPageState from './vehicle-console-model.js';
export default function VehicleConsoleBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="vehicle-console" assets={{}}><div className="console-business" data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end shrink-0" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("車輛控制台")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("遠程實時操作車輛硬件接口，監控底盤、門鎖、網絡終端與微電動車電池狀態。")}</p></div></div>
<div className="console-layout"><div className="vehicle-selector bg-white rounded-xl shadow-sm border border-gray-100"><div className="p-4 border-b border-gray-100 bg-gray-50"><div className="font-bold text-gray-800 mb-3 flex items-center"><RimoElement kind="el-icon" className="mr-2 text-blue-600"><RimoIcon name="Van" /></RimoElement>
{text("\n                                        目標車輛檢索\n                                    ")}</div>
<div className="filter-controls"><RimoElement kind="el-cascader" modelValue={view.filters.stationIds} onModelChange={value => {
                model.write(["filters", "stationIds"], value);
              }} options={view.orgData} props={view.stationCascaderProps} placeholder="請選擇車行 / 門市 / 據點（支持多選）" className="w-full" clearable={true} filterable={true} collapseTags={true} collapseTagsTooltip={true}></RimoElement>
<div className="type-filter-row"><RimoElement kind="el-select" modelValue={view.filters.vehicleType} onModelChange={value => {
                  model.write(["filters", "vehicleType"], value);
                }} aria-label="車輛類型" className="w-full"><RimoElement kind="el-option" label="全部車輛類型" value="ALL"></RimoElement>
<RimoElement kind="el-option" label="汽車" value="Vehicle"></RimoElement>
<RimoElement kind="el-option" label="微電動車" value="MicroEV"></RimoElement></RimoElement></div>
<RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                model.write(["filters", "keyword"], value);
              }} placeholder="搜索車牌號/VIN/車型/CID" prefixIcon="Search" clearable={true} className="filter-search filter-full"></RimoElement></div></div>
<div className="vehicle-list custom-scroll p-2">{view.filteredVehicles.length === 0 ? <><div className="flex flex-col items-center justify-center h-40 text-gray-400"><RimoElement kind="el-icon" className="text-3xl mb-2"><RimoIcon name="DataLine" /></RimoElement>
<span className="text-sm">{text("未找到匹配車輛")}</span></div></> : null}
{rimoEntries(view.filteredVehicles).map(([v], _itemIndex) => <Fragment key={v.id}><div key={v.id} onClick={_event => {
                view.selectVehicle(v);
              }} className={rimoClass(["vehicle-card rounded-lg border cursor-pointer transition-all duration-200", rimoClass(view.activeVehicle?.id === v.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50')])}><div className="vehicle-card-body"><div className="vehicle-card-copy"><div className="flex items-center gap-2 flex-wrap"><div className="vehicle-card-title font-bold text-gray-800">{rimoText(v.licensePlate)}</div>
<RimoElement kind="el-tag" size="small" type={v.vehicleType === 'MicroEV' ? 'warning' : 'info'} effect="plain">{text("\n                                                        ")}{rimoText(view.getVehicleTypeName(v.vehicleType))}{text("\n                                                    ")}</RimoElement></div>
<div className="vehicle-card-model text-gray-500 truncate">{rimoText(v.model)}{text("\n                                                ")}</div>
<div className="vehicle-card-meta text-gray-400 font-mono">{text("CID ")}{rimoText(v.iduId)}{text("\n                                                ")}</div></div>
<div className="vehicle-card-side flex flex-col items-end shrink-0"><RimoElement kind="el-tag" size="small" type={v.isDriving ? 'primary' : 'info'} effect="light" round={true}><span className={rimoClass(["status-dot mr-1", rimoClass(v.isDriving ? 'driving' : 'offline')])} style={rimoStyle("width: 6px; height: 6px;")}></span>
{text("\n                                                    ")}{rimoText(v.isDriving ? '行駛中' : '靜止')}{text("\n                                                ")}</RimoElement>
{v.isOnline ? <><span className="text-[10px] text-gray-400">{text("在線")}</span></> : <><span className="text-[10px] text-red-400">{text("離線")}</span></>}</div></div></div></Fragment>)}</div></div>
{view.activeVehicle ? <><div className="console-main"><div className="vehicle-summary bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 shrink-0"><div className="vehicle-summary-main"><div className="vehicle-summary-photo"><RimoElement kind="el-image" src={view.getVehiclePhoto(view.activeVehicle)} fit="cover" alt={view.activeVehicle.model} slots={{
                    "error": _slot => <><div className="vehicle-photo-fallback">{rimoText(view.activeVehicle.vehicleType === 'MicroEV' ? '微電動車' : '汽車')}</div></>
                  }}></RimoElement></div>
<div className="vehicle-summary-copy"><div className="vehicle-title-row"><h2 className="text-2xl font-bold text-gray-800">{rimoText(view.activeVehicle.licensePlate)}</h2>
<RimoElement kind="el-tag" type={view.activeVehicle.vehicleType === 'MicroEV' ? 'warning' : 'info'} effect="plain">{text("\n                                                    ")}{rimoText(view.getVehicleTypeName(view.activeVehicle.vehicleType))}{text("\n                                                ")}</RimoElement>
<RimoElement kind="el-tag" type={view.activeVehicle.isDriving ? 'primary' : 'info'} className={rimoClass({
                      'vehicle-driving-tag': view.activeVehicle.isDriving
                    })} effect="dark"><div className="flex items-center"><span className="status-dot bg-white mr-1.5" style={rimoStyle(view.activeVehicle.isDriving ? 'box-shadow: 0 0 5px white;' : '')}></span>
{text("\n                                                        ")}{rimoText(view.activeVehicle.isDriving ? '車輛行駛中' : '車輛已靜止')}{text("\n                                                    ")}</div></RimoElement>
<RimoElement kind="el-tag" type={view.isDeviceOnline ? 'success' : 'info'} effect="plain">{text("\n                                                    ")}{rimoText(view.deviceConnectionText)}{text("\n                                                ")}</RimoElement></div>
<div className="vehicle-meta text-sm text-gray-500 mt-1 font-mono"><span>{text("所屬：")}{rimoText(view.getVehicleOrganizationText(view.activeVehicle))}</span>
<span>{text("CID: ")}{rimoText(view.activeVehicle.iduId)}</span>
<span className="inline-flex items-center gap-1">{text("平臺接收時間\n                                                    ")}
<RimoElement kind="el-tooltip" content="平臺接收並寫入本次車機資料的時間，由後端 receivedAt 產生。" placement="top"><span className="time-help-icon" aria-label="平臺接收時間說明">{text("?")}</span></RimoElement>
{text(":\n                                                    ")}
<span className="text-gray-800 font-medium">{rimoText(view.platformReceivedTime)}</span></span></div></div></div>
<RimoElement kind="el-button" onClick={event => {
                view.refreshTelemetry?.(event);
              }} loading={view.isRefreshing} icon="Refresh">{text("手動刷新狀態")}</RimoElement></div>
<div className="upper-grid shrink-0"><div className="map-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"><div className="console-panel-header"><span className="font-bold text-sm text-gray-700">{text("最新定位")}</span>
<span className="location-time inline-flex items-center gap-1">{text("\n                                                ")}{rimoText(view.telemetry.iduGpsTime)}{text("\n                                                ")}
<RimoElement kind="el-tooltip" content="車機記錄的定位時間，取自 iduGpsTime 字段；與平臺接收時間可能不同。" placement="top"><span className="time-help-icon" aria-label="最新定位時間說明">{text("?")}</span></RimoElement></span></div>
<div className="flex-1 map-placeholder relative group"><div className="map-open-action"><RimoElement kind="el-button" type="primary" size="small" plain={true} onClick={event => {
                      view.openMapDialog?.(event);
                    }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Location" /></RimoElement>
{text("打開地圖窗口")}</RimoElement></div>
<div className="map-location-marker absolute top-1/2 left-1/2 -mt-4 -ml-3 text-red-500 drop-shadow-md cursor-pointer hover:scale-110 transition-transform"><svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg></div></div>
<div className="p-3 text-xs text-gray-600 bg-white truncate" title={view.telemetry.address}><RimoElement kind="el-icon" className="mr-1 text-gray-400"><RimoIcon name="Position" /></RimoElement>
{text("\n                                            ")}{rimoText(view.telemetry.address)}{text("\n                                        ")}</div></div>
<div className="remote-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"><div className="console-panel-header font-bold text-sm text-gray-700"><span>{text("遠程指令中樞")}</span></div>
<div className="remote-card-body">{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="remote-grid"><div className={rimoClass(["border rounded-lg p-4 flex flex-col justify-center items-center gap-3 relative overflow-hidden", rimoClass(view.telemetry.doorLockStatus ? 'bg-gray-50 border-gray-200' : 'bg-emerald-50 border-emerald-200')])}><div className="absolute top-2 left-2 text-[10px] text-gray-400">{text("車門中控\n                                                    ")}</div>
<div className={rimoClass(["text-3xl", rimoClass(view.telemetry.doorLockStatus ? 'text-gray-400' : 'text-emerald-500')])}>{view.telemetry.doorLockStatus ? <><RimoElement kind="el-icon"><RimoIcon name="Lock" /></RimoElement></> : <><RimoElement kind="el-icon"><RimoIcon name="Unlock" /></RimoElement></>}</div>
<div className="font-bold text-gray-700 tracking-widest">{rimoText(view.telemetry.doorLockStatus ? '已落鎖' : '已解鎖')}</div>
<div className="flex gap-2 mt-1 w-full px-2"><RimoElement kind="el-button" type="success" size="small" className="flex-1 remote-btn" disabled={!view.isDeviceOnline} onClick={_event => {
                            view.sendCommand('LOCK_DOOR');
                          }}>{text("上鎖")}</RimoElement>
<RimoElement kind="el-button" type="danger" size="small" className="flex-1 remote-btn" disabled={!view.isDeviceOnline} onClick={_event => {
                            view.sendCommand('UNLOCK_DOOR');
                          }}>{text("解鎖")}</RimoElement></div></div>
<div className={rimoClass(["border rounded-lg p-4 flex flex-col justify-center items-center gap-3 relative overflow-hidden", rimoClass(view.telemetry.securityOn ? 'bg-gray-50 border-gray-200' : 'bg-emerald-50 border-emerald-200')])}><div className="absolute top-2 left-2 text-[10px] text-gray-400">{text("保全 / 防盜\n                                                    ")}</div>
<div className={rimoClass(["text-3xl", rimoClass(view.telemetry.securityOn ? 'text-gray-400' : 'text-emerald-500')])}><RimoElement kind="el-icon"><RimoIcon name="Warning" /></RimoElement></div>
<div className="font-bold text-gray-700 tracking-widest">{rimoText(view.telemetry.securityOn ? '已上鎖' : '已解除')}</div>
<div className="flex gap-2 mt-1 w-full px-2"><RimoElement kind="el-button" type="warning" size="small" className="flex-1 remote-btn" disabled={!view.isDeviceOnline} onClick={_event => {
                            view.sendCommand('ENABLE_IMMOBILIZER');
                          }}>{text("上鎖")}</RimoElement>
<RimoElement kind="el-button" type="info" size="small" className="flex-1 remote-btn" disabled={!view.isDeviceOnline} onClick={_event => {
                            view.sendCommand('DISABLE_IMMOBILIZER');
                          }}>{text("解除")}</RimoElement></div></div>
<div className="flex flex-col gap-3 min-h-0"><RimoElement kind="el-button" type="primary" className="w-full flex-1 remote-btn !m-0 rounded-lg shadow-sm" disabled={!view.isDeviceOnline} onClick={_event => {
                          view.sendCommand('FIND_VEHICLE');
                        }}><div className="flex flex-col items-center"><RimoElement kind="el-icon" className="text-lg mb-1"><RimoIcon name="Bell" /></RimoElement>
<span className="font-bold tracking-wider">{text("遠程尋車 (鳴笛/閃燈)")}</span></div></RimoElement>
<div className="w-full flex-1 border rounded-lg bg-gray-50 flex items-center justify-between px-4 text-sm"><span className="text-gray-500">{text("電子鑰匙回位")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.iButtonReturned ? 'success' : 'danger'} effect="dark">{rimoText(view.telemetry.iButtonReturned ? '在位' : '已拔出')}</RimoElement></div></div></div></> : <><div className="remote-grid remote-grid-moto">{null}
<div className="moto-lease-controls"><div className="moto-lease-row"><span className="moto-lease-label">{text("車輛狀態")}</span>
<RimoElement kind="el-icon" size={24} color="var(--app-color-primary)" aria-hidden="true">{view.isTrueValue(view.telemetry.rentalActive) ? <><RimoIcon name="Unlock" /></> : <><RimoIcon name="Lock" /></>}</RimoElement>
<RimoElement kind="el-tag" type={view.isTrueValue(view.telemetry.rentalActive) ? 'success' : 'info'} effect="plain">{text("\n                                                            ")}{rimoText(view.isTrueValue(view.telemetry.rentalActive) ? '已解鎖' : '已上鎖')}{text("\n                                                        ")}</RimoElement></div>
<div className="moto-lease-row"><span className="moto-lease-label">{text("關聯訂單")}</span>
<span>{rimoText(view.activeVehicle.orderInfo ? view.activeVehicle.orderInfo.orderNo : '暫無進行中訂單')}</span></div>
<div className="moto-lease-actions"><RimoElement kind="el-button" type="primary" icon="Unlock" disabled={!view.isDeviceOnline} onClick={_event => {
                            view.sendCommand('SET_MOTO_LEASE');
                          }}>{text("解鎖")}</RimoElement>
<RimoElement kind="el-button" plain={true} icon="Lock" disabled={!view.isDeviceOnline} onClick={_event => {
                            view.sendCommand('RELEASE_MOTO_LEASE');
                          }}>{text("上鎖")}</RimoElement></div></div></div></>}</div></div></div>
<div className="lower-grid"><div className="status-panel w-72 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col"><div className="console-panel-header font-bold text-sm text-gray-700"><span>{text("終端與車輛狀態矩陣")}</span>
<button type="button" className="status-detail-trigger text-xs font-medium" onClick={event => {
                    view.openStatusDrawer?.(event);
                  }}>{text("查看更多狀態 >")}</button></div>
<div className="status-scroll custom-scroll">{view.activeVehicle.vehicleType === 'Vehicle' ? <><><div className="matrix-section"><div className="matrix-section-header"><span>{text("終端通訊與定位")}</span></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Location" /></RimoElement>
{text("GPS 定位狀態")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.gpsStatus ? 'success' : 'info'} effect="plain" round={true}><span className={rimoClass(["status-dot mr-1", rimoClass(view.telemetry.gpsStatus ? 'online' : 'offline')])} style={rimoStyle("width: 5px; height: 5px;")}></span>
{text("\n                                                            ")}{rimoText(view.telemetry.gpsStatus ? '有效' : '無效')}{text("\n                                                        ")}</RimoElement></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Connection" /></RimoElement>
{text("GPRS 連線")}</span>
<RimoElement kind="el-tag" size="small" type={view.isDeviceOnline ? 'success' : 'info'} effect="plain" round={true}><span className={rimoClass(["status-dot mr-1", rimoClass(view.isDeviceOnline ? 'online' : 'offline')])} style={rimoStyle("width: 5px; height: 5px;")}></span>
{text("\n                                                            ")}{rimoText(view.deviceConnectionText)}{text("\n                                                        ")}</RimoElement></div></div>
<div className="matrix-section"><div className="matrix-section-header"><span>{text("動力與保全")}</span></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Key" /></RimoElement>
{text("ACC 發動")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.accOn ? 'success' : 'info'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.accOn ? '發動車' : '熄火')}{text("\n                                                        ")}</RimoElement></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Cpu" /></RimoElement>
{text("引擎狀態")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.powerOn ? 'success' : 'info'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.powerOn ? '開啓' : '關閉')}{text("\n                                                        ")}</RimoElement></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Warning" /></RimoElement>
{text("防盜鎖狀態")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.securityOn ? 'info' : 'success'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.securityOn ? '已設防' : '已解除')}{text("\n                                                        ")}</RimoElement></div></div>
<div className="matrix-section"><div className="matrix-section-header"><span>{text("車身與車門")}</span></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Lock" /></RimoElement>
{text("車門鎖狀態")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.doorLockStatus ? 'info' : 'success'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.doorLockStatus ? '全部上鎖' : '有門解鎖')}{text("\n                                                        ")}</RimoElement></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Unlock" /></RimoElement>
{text("車門物理狀態")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.doorOpen ? 'success' : 'info'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.doorOpen ? '有車門開啓' : '全部關閉')}{text("\n                                                        ")}</RimoElement></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Sunny" /></RimoElement>
{text("燈光狀態")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.lightOn ? 'success' : 'info'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.lightOn ? '開啓' : '關閉')}{text("\n                                                        ")}</RimoElement></div></div>
<div className="matrix-section"><div className="matrix-section-header"><span>{text("能耗與電瓶")}</span></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Odometer" /></RimoElement>
{text("剩餘油量")}</span>
<div className="matrix-gauge-wrap"><div className="matrix-progress-bar"><div className="matrix-progress-inner" style={rimoStyle({
                                width: view.telemetry.remainFuel + '%',
                                backgroundColor: Number(view.telemetry.remainFuel) < 10 ? '#ef4444' : Number(view.telemetry.remainFuel) < 30 ? '#f59e0b' : '#10b981'
                              })}></div></div>
<span className={rimoClass(["text-xs font-mono font-bold", rimoClass(Number(view.telemetry.remainFuel) < 10 ? 'text-red-500' : Number(view.telemetry.remainFuel) < 30 ? 'text-amber-500' : 'text-emerald-600')])}>{text("\n                                                                ")}{rimoText(view.telemetry.remainFuel)}{text("%\n                                                            ")}</span></div></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Compass" /></RimoElement>
{text("低電壓警示")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.lowVoltage ? 'danger' : 'success'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.lowVoltage ? '異常' : '正常')}{text(" (")}{rimoText(view.telemetry.batteryVoltage)}{text("V)\n                                                        ")}</RimoElement></div></div></></> : <><><div className="matrix-section"><div className="matrix-section-header"><span>{text("終端通訊與定位")}</span></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Location" /></RimoElement>
{text("GPS 定位狀態")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.gpsStatus ? 'success' : 'info'} effect="plain" round={true}><span className={rimoClass(["status-dot mr-1", rimoClass(view.telemetry.gpsStatus ? 'online' : 'offline')])} style={rimoStyle("width: 5px; height: 5px;")}></span>
{text("\n                                                            ")}{rimoText(view.telemetry.gpsStatus ? '有效' : '無效')}{text("\n                                                        ")}</RimoElement></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Connection" /></RimoElement>
{text("GPRS 連線")}</span>
<RimoElement kind="el-tag" size="small" type={view.isDeviceOnline ? 'success' : 'info'} effect="plain" round={true}><span className={rimoClass(["status-dot mr-1", rimoClass(view.isDeviceOnline ? 'online' : 'offline')])} style={rimoStyle("width: 5px; height: 5px;")}></span>
{text("\n                                                            ")}{rimoText(view.deviceConnectionText)}{text("\n                                                        ")}</RimoElement></div></div>
<div className="matrix-section"><div className="matrix-section-header"><span>{text("動力與馬達")}</span></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Key" /></RimoElement>
{text("發動狀態")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.accOn ? 'success' : 'info'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.accOn ? '發動車' : '熄火')}{text("\n                                                        ")}</RimoElement></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Cpu" /></RimoElement>
{text("馬達啓動")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.motorStarted ? 'success' : 'info'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.motorStarted ? '已啓動' : '關閉')}{text("\n                                                        ")}</RimoElement></div></div>
<div className="matrix-section"><div className="matrix-section-header"><span>{text("電池與續航")}</span></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Odometer" /></RimoElement>
{text("總電量 (SOC)")}</span>
<div className="matrix-gauge-wrap"><div className="matrix-progress-bar"><div className="matrix-progress-inner" style={rimoStyle({
                                width: view.telemetry.rsoc + '%',
                                backgroundColor: Number(view.telemetry.rsoc) < 10 ? '#ef4444' : Number(view.telemetry.rsoc) < 30 ? '#f59e0b' : '#10b981'
                              })}></div></div>
<span className={rimoClass(["text-xs font-mono font-bold", rimoClass(Number(view.telemetry.rsoc) < 10 ? 'text-red-500' : Number(view.telemetry.rsoc) < 30 ? 'text-amber-500' : 'text-emerald-600')])}>{text("\n                                                                ")}{rimoText(view.telemetry.rsoc)}{text("%\n                                                            ")}</span></div></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Timer" /></RimoElement>
{text("預估續航")}</span>
<span className="text-xs font-mono font-bold text-gray-700">{rimoText(view.telemetry.remainingDistance)}{text(" km")}</span></div>
<div className="matrix-item"><span className="matrix-item-label"><RimoElement kind="el-icon"><RimoIcon name="Compass" /></RimoElement>
{text("低電壓警示")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.lowVoltage ? 'danger' : 'success'} effect="plain">{text("\n                                                            ")}{rimoText(view.telemetry.lowVoltage ? '異常' : '正常')}{text(" (")}{rimoText(view.telemetry.dcVoltage)}{text("V)\n                                                        ")}</RimoElement></div></div></></>}</div></div>
<div className="history-panel bg-white rounded-xl shadow-sm border border-gray-100"><div className="console-panel-header"><span className="font-bold text-sm text-gray-700">{text("車輛遠程控制指令臺賬（最新 10 條）")}</span>
<div className="flex items-center gap-2"><RimoElement kind="el-button" size="small" plain={true} onClick={event => {
                      view.openHistoryDialog?.(event);
                    }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Tickets" /></RimoElement>
{text("查看全部臺賬")}</RimoElement>
<RimoElement kind="el-button" size="small" plain={true} icon="Refresh" onClick={event => {
                      view.fetchHistory?.(event);
                    }}>{text("刷新日誌")}</RimoElement></div></div>
<div className="p-0 overflow-hidden" data-rimo-layout="list"><RimoElement kind="el-table" data={view.historyLogs} height="100%" stripe={true} size="small" className="w-full"><RimoElement kind="el-table-column" prop="time" label="下發時間" width="150" slots={{
                      "default": ({
                        row
                      }) => <><span className="font-mono text-xs text-gray-600">{rimoText(row.time)}</span></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="110"></RimoElement>
<RimoElement kind="el-table-column" prop="action" label="控制指令" width="160" slots={{
                      "default": ({
                        row
                      }) => <><span className="font-bold text-xs">{rimoText(row.action === 'SET_MOTO_LEASE' ? '解鎖' : row.action === 'RELEASE_MOTO_LEASE' ? '上鎖' : view.getActionName(row.action))}</span></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" prop="plate" label="關聯車牌" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="cid" label="CID" width="100"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="執行結果" width="100" slots={{
                      "default": ({
                        row
                      }) => <><RimoElement kind="el-tag" size="small" type={view.getHistoryStatusType(row.status)} effect="dark">{rimoText(view.getHistoryStatusText(row.status))}</RimoElement></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" prop="note" label="備註說明" minWidth="200" slots={{
                      "default": ({
                        row
                      }) => <>{row.status === 'FAIL' ? <><span className="text-red-500 text-xs">{rimoText(row.note)}</span></> : null}</>
                    }}></RimoElement></RimoElement></div></div></div></div></> : <><div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400"><RimoImage src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e5e7eb' width='120' height='120'><path d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z'/><circle cx='7.5' cy='14.5' r='1.5'/><circle cx='16.5' cy='14.5' r='1.5'/></svg>" alt="Select Car" className="mb-4 opacity-50" />
<h3 className="text-xl font-bold text-gray-500 mb-2">{text("未選擇監控車輛")}</h3>
<p className="text-sm">{text("請在左側檢索欄中選擇一臺車輛以開啓實時控制與監控面板")}</p></div></>}</div></div><RimoElement kind="el-drawer" modelValue={view.statusDetailVisible} onModelChange={value => {
      model.write(["statusDetailVisible"], value);
    }} title={view.activeVehicle ? `${view.activeVehicle.licensePlate} · 更多狀態信息` : '更多狀態信息'} size="580px" className="vehicle-console-overlay" modalClass="vehicle-console-overlay-modal" destroyOnClose={true}>{() => <>{view.activeVehicle ? <><div className="detail-status-sections"><section className="detail-status-section"><div className="detail-status-title"><span className="flex items-center gap-1.5"><RimoElement kind="el-icon" className="text-blue-600"><RimoIcon name="Cpu" /></RimoElement>
{text("\n                                車機硬件與通訊參數\n                            ")}</span></div>
<div className="detail-grid-2col"><div className="detail-grid-item"><div className="detail-grid-label"><span>{text("設備 CID")}</span>
<button type="button" className="copy-icon-btn" title="複製 CID" onClick={_event => {
                      view.copyText(view.telemetry.iduId, 'CID');
                    }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></div>
<div className="detail-grid-val text-blue-600">{rimoText(view.telemetry.iduId)}</div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{text("安裝車輛類別")}</div>
<div className="detail-grid-val">{rimoText(view.activeVehicle.vehicleType === 'MicroEV' ? 'MicroEV / 微電動車' : 'Vehicle / 汽車')}</div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{text("車機廠商 / 型號")}</div>
<div className="detail-grid-val">{rimoText(view.telemetry.iduBrandName)}{text(" / ")}{rimoText(view.telemetry.iduModelName)}{text("\n                                ")}</div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{text("車機韌體版本")}</div>
<div className="detail-grid-val">{rimoText(view.telemetry.iduFW)}</div></div>
<div className="detail-grid-item"><div className="detail-grid-label"><span>{text("IMEI 識別碼")}</span>
<button type="button" className="copy-icon-btn" title="複製 IMEI" onClick={_event => {
                      view.copyText(view.telemetry.iduIMEI, 'IMEI');
                    }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></div>
<div className="detail-grid-val font-mono text-xs">{rimoText(view.telemetry.iduIMEI)}</div></div>
<div className="detail-grid-item"><div className="detail-grid-label"><span>{text("ICCID 物聯網卡號")}</span>
<button type="button" className="copy-icon-btn" title="複製 ICCID" onClick={_event => {
                      view.copyText(view.telemetry.iduICCID, 'ICCID');
                    }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></div>
<div className="detail-grid-val font-mono text-xs">{rimoText(view.telemetry.iduICCID)}</div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{text("GPS 定位狀態")}</div>
<div className="detail-grid-val"><span className={rimoClass(view.telemetry.gpsStatus ? 'text-green-600 font-bold' : 'text-gray-400 font-bold')}>{text("\n                                        ")}{rimoText(view.telemetry.gpsStatus ? '● 有效定位' : '○ 無效')}{text("\n                                    ")}</span></div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{text("GPRS 通訊狀態")}</div>
<div className="detail-grid-val"><span className={rimoClass(view.isDeviceOnline ? 'text-green-600 font-bold' : 'text-gray-400 font-bold')}>{text("\n                                        ")}{rimoText(view.isDeviceOnline ? '● ' + view.deviceConnectionText : '○ ' + view.deviceConnectionText)}{text("\n                                    ")}</span></div></div>
<div className="detail-grid-item col-span-2"><div className="detail-grid-label"><span>{text("當前經緯度座標")}</span>
<button type="button" className="copy-icon-btn" title="複製經緯度" onClick={_event => {
                      view.copyText(`{{ telemetry.latitude }}, {{ telemetry.longitude }}`, '經緯度座標');
                    }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></div>
<div className="detail-grid-val font-mono text-xs text-gray-700">{text("\n                                    ")}{rimoText(view.telemetry.latitude)}{text(", ")}{rimoText(view.telemetry.longitude)}{text("\n                                ")}</div></div></div></section>
<section className="detail-status-section"><div className="detail-status-title"><span className="flex items-center gap-1.5"><RimoElement kind="el-icon" className="text-blue-600"><RimoIcon name="Lock" /></RimoElement>
{text("\n                                車輛運行與安防狀態\n                            ")}</span></div>
<div className="detail-grid-2col"><div className="detail-grid-item"><div className="detail-grid-label">{text("當前租約狀態")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.rentalActive ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.activeVehicle.vehicleType === 'MicroEV' ? view.isTrueValue(view.telemetry.rentalActive) ? '已上租約（已解鎖）' : '已解租約（已上鎖）' : view.telemetry.rentalActive ? '有租約' : '無租約')}{text("\n                                    ")}</RimoElement></div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{text("ACC 發動狀態")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.accOn ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.accOn ? '發動車' : '熄火')}{text("\n                                    ")}</RimoElement></div></div>
{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="detail-grid-item"><div className="detail-grid-label">{text("引擎運轉狀態")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.powerOn ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.powerOn ? '開啓' : '關閉')}{text("\n                                    ")}</RimoElement></div></div></> : <><div className="detail-grid-item"><div className="detail-grid-label">{text("馬達啓動狀態")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.motorStarted ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.motorStarted ? '已啓動' : '關閉')}{text("\n                                    ")}</RimoElement></div></div></>}
{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="detail-grid-item"><div className="detail-grid-label">{text("防盜鎖狀態")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.securityOn ? 'info' : 'success'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.securityOn ? '已上鎖設防' : '已解除')}{text("\n                                    ")}</RimoElement></div></div></> : null}
{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="detail-grid-item"><div className="detail-grid-label">{text("車門中控鎖")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.doorLockStatus ? 'info' : 'success'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.doorLockStatus ? '全部上鎖' : '有車門解鎖')}{text("\n                                    ")}</RimoElement></div></div></> : null}
{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="detail-grid-item"><div className="detail-grid-label">{text("車門物理開閉")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.doorOpen ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.doorOpen ? '有車門開啓' : '全部關閉')}{text("\n                                    ")}</RimoElement></div></div></> : null}
{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="detail-grid-item"><div className="detail-grid-label">{text("車輛燈光狀態")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.lightOn ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.lightOn ? '開啓' : '關閉')}{text("\n                                    ")}</RimoElement></div></div></> : null}
{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="detail-grid-item"><div className="detail-grid-label">{text("電子鑰匙在位")}</div>
<div className="detail-grid-val"><RimoElement kind="el-tag" size="small" type={view.telemetry.iButtonReturned ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.iButtonReturned ? '鑰匙已掛回' : '鑰匙未掛回')}{text("\n                                    ")}</RimoElement></div></div></> : null}
{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="detail-grid-item"><div className="detail-grid-label"><span>{text("iButton 鑰匙編號")}</span>
<button type="button" className="copy-icon-btn" title="複製 iButton" onClick={_event => {
                        view.copyText(view.telemetry.iButtonId, 'iButton 編號');
                      }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></div>
<div className="detail-grid-val font-mono text-xs">{rimoText(view.telemetry.iButtonId || 'NA')}</div></div></> : null}</div></section>
<section className="detail-status-section"><div className="detail-status-title"><span className="flex items-center gap-1.5"><RimoElement kind="el-icon" className="text-blue-600"><RimoIcon name="Odometer" /></RimoElement>
{text("\n                                行駛工況與能耗監控\n                            ")}</span></div>
<div className="detail-grid-2col"><div className="detail-grid-item"><div className="detail-grid-label">{rimoText(view.activeVehicle.vehicleType === 'MicroEV' ? '直流側電壓' : '低壓蓄電池電壓')}</div>
<div className={rimoClass(["detail-grid-val", rimoClass(view.telemetry.lowVoltage ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold')])}>{text("\n                                    ")}{rimoText(view.activeVehicle.vehicleType === 'MicroEV' ? view.telemetry.dcVoltage + ' V' : view.telemetry.batteryVoltage + ' V')}{text("\n                                    ")}
<span className={rimoClass(["text-xs font-normal ml-1", rimoClass(view.telemetry.lowVoltage ? 'text-red-500' : 'text-gray-400')])}>{text("(")}{rimoText(view.telemetry.lowVoltage ? '低電壓異常' : '電壓正常')}{text(")")}</span></div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{text("實時車速")}</div>
<div className="detail-grid-val font-mono">{rimoText(view.telemetry.speed)}{text(" km/h")}</div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{rimoText(view.activeVehicle.vehicleType === 'MicroEV' ? '馬達端電流' : '引擎轉速')}</div>
<div className="detail-grid-val font-mono">{text("\n                                    ")}{rimoText(view.activeVehicle.vehicleType === 'MicroEV' ? view.telemetry.current + ' A' : view.telemetry.rpm + ' rpm')}{text("\n                                ")}</div></div>
<div className="detail-grid-item"><div className="detail-grid-label">{text("總行駛里程")}</div>
<div className="detail-grid-val font-mono">{rimoText(view.telemetry.mileage)}{text(" km")}</div></div>
{view.activeVehicle.vehicleType === 'Vehicle' ? <><div className="detail-grid-item col-span-2"><div className="detail-grid-label"><span>{text("剩餘油量 (Fuel Level)")}</span>
<span className={rimoClass(["font-mono font-bold", rimoClass(Number(view.telemetry.remainFuel) < 10 ? 'text-red-500' : Number(view.telemetry.remainFuel) < 30 ? 'text-amber-500' : 'text-emerald-600')])}>{rimoText(view.telemetry.remainFuel)}{text("%")}</span></div>
<div className="mt-1"><RimoElement kind="el-progress" percentage={Number(view.telemetry.remainFuel)} color={Number(view.telemetry.remainFuel) < 10 ? '#ef4444' : Number(view.telemetry.remainFuel) < 30 ? '#f59e0b' : '#10b981'} showText={false} strokeWidth={8}></RimoElement></div></div></> : <><div className="detail-grid-item col-span-2"><div className="detail-grid-label"><span>{text("總剩餘電量 (SOC) / 預估續航")}</span>
<span className={rimoClass(["font-mono font-bold", rimoClass(Number(view.telemetry.rsoc) < 10 ? 'text-red-500' : Number(view.telemetry.rsoc) < 30 ? 'text-amber-500' : 'text-emerald-600')])}>{rimoText(view.telemetry.rsoc)}{text("% (約 ")}{rimoText(view.telemetry.remainingDistance)}{text(" km)")}</span></div>
<div className="mt-1"><RimoElement kind="el-progress" percentage={Number(view.telemetry.rsoc)} color={Number(view.telemetry.rsoc) < 10 ? '#ef4444' : Number(view.telemetry.rsoc) < 30 ? '#f59e0b' : '#10b981'} showText={false} strokeWidth={8}></RimoElement></div></div></>}
{view.activeVehicle.vin ? <><div className="detail-grid-item col-span-2"><div className="detail-grid-label"><span>{text("車輛識別代碼 (VIN)")}</span>
<button type="button" className="copy-icon-btn" title="複製 VIN" onClick={_event => {
                        view.copyText(view.activeVehicle.vin, 'VIN');
                      }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></div>
<div className="detail-grid-val font-mono text-xs text-gray-700">{rimoText(view.activeVehicle.vin)}{text("\n                                ")}</div></div></> : null}</div></section>
{view.activeVehicle.vehicleType === 'MicroEV' ? <><section className="detail-status-section"><div className="detail-status-title"><span className="flex items-center gap-1.5"><RimoElement kind="el-icon" className="text-blue-600"><RimoIcon name="Coin" /></RimoElement>
{text("\n                                多倉電池狀態與實時參數\n                            ")}</span></div>
<div className="battery-slot-list"><article className={rimoClass(["battery-slot-card", rimoClass(view.telemetry.mba !== 'NA' ? 'is-installed' : 'is-empty')])}><div className="battery-slot-title"><span>{text("1號倉電池")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.mba !== 'NA' ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.mba !== 'NA' ? '已識別電池' : '未識別電池')}{text("\n                                    ")}</RimoElement></div>
{view.telemetry.mba !== 'NA' ? <><div className="battery-slot-fields"><div className="battery-slot-field"><span className="battery-slot-label">{text("剩餘電量")}</span>
<span className={rimoClass(["battery-slot-value font-bold", rimoClass(Number(view.telemetry.mba) < 10 ? 'text-red-500' : Number(view.telemetry.mba) < 30 ? 'text-amber-500' : 'text-emerald-600')])}>{rimoText(view.telemetry.mba)}{text("%")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("目前電流")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.mbaa)}{text(" A")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("溫度範圍")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.mbaTempLow)}{text(" ~ ")}{rimoText(view.telemetry.mbaTempHigh)}{text(" ℃")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("電池韌體")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.mbaFw || 'NA')}</span></div>
<div className="battery-slot-field col-span-2"><span className="battery-slot-label flex items-center gap-1"><span>{text("電池序號")}</span>
<button type="button" className="copy-icon-btn" title="複製電池 SN" onClick={_event => {
                              view.copyText(view.telemetry.mbaSn, '電池 SN');
                            }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></span>
<span className="battery-slot-value font-mono text-xs text-gray-800">{rimoText(view.telemetry.mbaSn)}</span></div></div></> : <><div className="p-3 text-center text-xs text-gray-400">{text("\n                                    當前倉位未檢測到電池組件\n                                ")}</div></>}</article>
<article className={rimoClass(["battery-slot-card", rimoClass(view.telemetry.rba !== 'NA' ? 'is-installed' : 'is-empty')])}><div className="battery-slot-title"><span>{text("2號倉電池")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.rba !== 'NA' ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.rba !== 'NA' ? '已識別電池' : '未識別電池')}{text("\n                                    ")}</RimoElement></div>
{view.telemetry.rba !== 'NA' ? <><div className="battery-slot-fields"><div className="battery-slot-field"><span className="battery-slot-label">{text("剩餘電量")}</span>
<span className={rimoClass(["battery-slot-value font-bold", rimoClass(Number(view.telemetry.rba) < 10 ? 'text-red-500' : Number(view.telemetry.rba) < 30 ? 'text-amber-500' : 'text-emerald-600')])}>{rimoText(view.telemetry.rba)}{text("%")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("目前電流")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.rbaa)}{text(" A")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("溫度範圍")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.rbaTempLow)}{text(" ~ ")}{rimoText(view.telemetry.rbaTempHigh)}{text(" ℃")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("電池韌體")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.rbaFw || 'NA')}</span></div>
<div className="battery-slot-field col-span-2"><span className="battery-slot-label flex items-center gap-1"><span>{text("電池序號")}</span>
<button type="button" className="copy-icon-btn" title="複製電池 SN" onClick={_event => {
                              view.copyText(view.telemetry.rbaSn, '電池 SN');
                            }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></span>
<span className="battery-slot-value font-mono text-xs text-gray-800">{rimoText(view.telemetry.rbaSn)}</span></div></div></> : <><div className="p-3 text-center text-xs text-gray-400">{text("\n                                    當前倉位未檢測到電池組件\n                                ")}</div></>}</article>
<article className={rimoClass(["battery-slot-card", rimoClass(view.telemetry.lba !== 'NA' ? 'is-installed' : 'is-empty')])}><div className="battery-slot-title"><span>{text("3號倉電池")}</span>
<RimoElement kind="el-tag" size="small" type={view.telemetry.lba !== 'NA' ? 'success' : 'info'} effect="plain">{text("\n                                        ")}{rimoText(view.telemetry.lba !== 'NA' ? '已識別電池' : '未識別電池')}{text("\n                                    ")}</RimoElement></div>
{view.telemetry.lba !== 'NA' ? <><div className="battery-slot-fields"><div className="battery-slot-field"><span className="battery-slot-label">{text("剩餘電量")}</span>
<span className={rimoClass(["battery-slot-value font-bold", rimoClass(Number(view.telemetry.lba) < 10 ? 'text-red-500' : Number(view.telemetry.lba) < 30 ? 'text-amber-500' : 'text-emerald-600')])}>{rimoText(view.telemetry.lba)}{text("%")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("目前電流")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.lbaa)}{text(" A")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("溫度範圍")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.lbaTempLow)}{text(" ~ ")}{rimoText(view.telemetry.lbaTempHigh)}{text(" ℃")}</span></div>
<div className="battery-slot-field"><span className="battery-slot-label">{text("電池韌體")}</span>
<span className="battery-slot-value font-mono">{rimoText(view.telemetry.lbaFw)}</span></div>
<div className="battery-slot-field col-span-2"><span className="battery-slot-label flex items-center gap-1"><span>{text("電池序號")}</span>
<button type="button" className="copy-icon-btn" title="複製電池 SN" onClick={_event => {
                              view.copyText(view.telemetry.lbaSn, '電池 SN');
                            }}><RimoElement kind="el-icon"><RimoIcon name="CopyDocument" /></RimoElement></button></span>
<span className="battery-slot-value font-mono text-xs text-gray-800">{rimoText(view.telemetry.lbaSn)}</span></div></div></> : <><div className="p-3 text-center text-xs text-gray-400">{text("\n                                    當前倉位未檢測到電池組件\n                                ")}</div></>}</article></div></section></> : null}</div></> : null}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.historyDialogVisible} onModelChange={value => {
      model.write(["historyDialogVisible"], value);
    }} title={view.activeVehicle ? `${view.activeVehicle.licensePlate} · 歷史臺賬` : '歷史臺賬'} width="min(1080px, 92vw)" destroyOnClose={true}>{() => <><div className="dialog-toolbar"><div className="toolbar-item is-range"><RimoElement kind="el-date-picker" modelValue={view.historyFilters.dateRange} onModelChange={value => {
              model.write(["historyFilters", "dateRange"], value);
            }} type="datetimerange" rangeSeparator="至" startPlaceholder="開始時間" endPlaceholder="結束時間" valueFormat="YYYY-MM-DD HH:mm:ss" className="w-full" clearable={true}></RimoElement></div>
<div className="toolbar-item is-operator"><RimoElement kind="el-select" modelValue={view.historyFilters.operatorKeyword} onModelChange={value => {
              model.write(["historyFilters", "operatorKeyword"], value);
            }} className="w-full" placeholder="操作人關鍵字" filterable={true} clearable={true} allowCreate={true} defaultFirstOption={true}>{rimoEntries(view.historyOperatorOptions).map(([item], _itemIndex) => <Fragment key={item}><RimoElement kind="el-option" key={item} label={item} value={item}></RimoElement></Fragment>)}</RimoElement></div>
<div className="toolbar-item is-action"><RimoElement kind="el-select" modelValue={view.historyFilters.action} onModelChange={value => {
              model.write(["historyFilters", "action"], value);
            }} className="w-full" placeholder="指令類型" clearable={true}><RimoElement kind="el-option" label="全部指令" value="ALL"></RimoElement>
{rimoEntries(view.historyActionOptions).map(([item], _itemIndex) => <Fragment key={item}><RimoElement kind="el-option" key={item} label={view.getActionName(item)} value={item}></RimoElement></Fragment>)}</RimoElement></div>
<div className="toolbar-actions"><RimoElement kind="el-button" plain={true} onClick={event => {
              view.resetHistoryFilters?.(event);
            }}>{text("重置篩選")}</RimoElement></div></div>
<div className="history-dialog-table"><RimoElement kind="el-table" data={view.pagedHistoryArchive} height="460" stripe={true} size="small"><RimoElement kind="el-table-column" prop="time" label="下發時間" width="170"></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="160"></RimoElement>
<RimoElement kind="el-table-column" prop="action" label="控制指令" width="180" slots={{
              "default": ({
                row
              }) => <>{rimoText(view.getActionName(row.action))}</>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="plate" label="關聯車牌" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="cid" label="CID" width="100"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="執行結果" width="110" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" size="small" type={view.getHistoryStatusType(row.status)} effect="dark">{rimoText(view.getHistoryStatusText(row.status))}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="備註信息" minWidth="220" slots={{
              "default": ({
                row
              }) => <><span className={rimoClass(row.status === 'FAIL' ? 'text-red-500' : 'text-gray-400')}>{rimoText(row.note || '-')}</span></>
            }}></RimoElement></RimoElement></div>
<div className="history-dialog-pagination"><RimoElement kind="el-pagination" currentPage={view.historyPage} onCurrentPageChange={value => {
            model.write(["historyPage"], value);
          }} pageSize={view.historyPageSize} onPageSizeChange={value => {
            model.write(["historyPageSize"], value);
          }} pageSizes={[10, 20, 50, 100]} total={view.filteredHistoryArchive.length} layout="total, sizes, prev, pager, next" background={true}></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.mapDialogVisible} onModelChange={value => {
      model.write(["mapDialogVisible"], value);
    }} title={view.activeVehicle ? `${view.activeVehicle.licensePlate} · 地圖定位` : '地圖定位'} width="min(880px, 92vw)" destroyOnClose={true}>{() => <>{view.activeVehicle ? <><div className="map-dialog-body"><div className="map-dialog-canvas map-placeholder relative"><div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 rounded-lg text-xs text-gray-700 shadow-sm">{text("\n                            最新定位時間：")}{rimoText(view.telemetry.iduGpsTime)}</div>
<div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 rounded-lg text-xs text-gray-700 shadow-sm">{text("\n                            經緯度：")}{rimoText(view.telemetry.latitude)}{text(", ")}{rimoText(view.telemetry.longitude)}</div>
<div className="map-dialog-marker absolute text-red-500 drop-shadow-md"><svg viewBox="0 0 24 24" className="w-10 h-10 fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg></div></div>
<div className="map-dialog-meta"><div className="map-dialog-meta-item"><div className="text-xs text-gray-500 mb-1">{text("定位地址")}</div>
<div className="text-sm text-gray-700">{rimoText(view.telemetry.address)}</div></div>
<div className="map-dialog-meta-item"><div className="text-xs text-gray-500 mb-1">{text("定位狀態")}</div>
<div className="text-sm text-gray-700">{rimoText(view.telemetry.gpsStatus ? 'GPS 有效' : 'GPS 無效')}{text(" / ")}{rimoText(view.deviceConnectionText)}</div></div></div></div></> : null}</>}</RimoElement></RimoRoot>;
}