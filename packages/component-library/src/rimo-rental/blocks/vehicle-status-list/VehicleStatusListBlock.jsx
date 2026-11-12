import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './vehicle-status-list.css';
import createPageState from './vehicle-status-list-model.js';
export default function VehicleStatusListBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="vehicle-status-list" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="vehicle-status-summary-actions flex gap-3 z-10" data-rimo-layout="list-summary"><button type="button" className={rimoClass(["vehicle-status-summary-card text-right", rimoClass({
          'is-active': view.isSummaryFilterActive('pool')
        })])} onClick={_event => {
          view.toggleSummaryFilter('pool');
        }}><div className="text-xs text-gray-500 font-medium mb-1">{text("監控車輛池")}</div>
<div className="text-2xl font-bold text-gray-800">{rimoText(view.tableData.length)}{text(" ")}
<span className="text-sm font-normal text-gray-400">{text("臺")}</span></div></button>
<div className="w-px bg-gray-200"></div>
<button type="button" className={rimoClass(["vehicle-status-summary-card text-right", rimoClass({
          'is-active': view.isSummaryFilterActive('rented')
        })])} onClick={_event => {
          view.toggleSummaryFilter('rented');
        }}><div className="text-xs text-gray-500 font-medium mb-1">{text("營運中 (在途)")}</div>
<div className="text-2xl font-bold text-blue-600">{rimoText(view.tableData.filter(v => v.status === 'RENTED').length)}{text(" ")}
<span className="text-sm font-normal text-gray-400">{text("臺")}</span></div></button>
<div className="w-px bg-gray-200"></div>
<button type="button" className={rimoClass(["vehicle-status-summary-card text-right", rimoClass({
          'is-active': view.isSummaryFilterActive('attention')
        })])} onClick={_event => {
          view.toggleSummaryFilter('attention');
        }}><div className="text-xs text-gray-500 font-medium mb-1">{text("異常待關注")}</div>
<div className="text-2xl font-bold text-amber-500">{rimoText(view.attentionVehicleCount)}{text(" ")}
<span className="text-sm font-normal text-gray-400">{text("臺")}</span></div></button></div>
<div className="vehicle-status-header flex justify-between items-end shrink-0" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("車輛速查表")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("全局查詢車輛實時運行工況、調度定位與當前訂單當前分配。")}</p></div></div>
<div className="vehicle-status-table-card flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden"><RimoElement kind="el-table" className="vehicle-status-table" data={view.pagedData} style={rimoStyle("width: 100%; height: 100%;")} tableLayout="fixed" scrollbarAlwaysOn={true} stripe={true} border={true} size="small" slots={{
          "toolbar": _slot => <><div className="vehicle-status-filter-row flex justify-between items-center gap-6"><div className="vehicle-status-filter-controls flex gap-3 z-10 w-2/3 items-center flex-wrap"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                  model.write(["filters", "keyword"], value);
                }} placeholder="搜索車牌號/廠牌/車款..." prefixIcon="Search" clearable={true} className="w-64"></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.station} onModelChange={value => {
                  model.write(["filters", "station"], value);
                }} placeholder="據點/門店" style={rimoStyle("width: 140px;")} clearable={true}><RimoElement kind="el-option" label="臺北車站門店" value="S-TPE"></RimoElement>
<RimoElement kind="el-option" label="松山機場門店" value="S-TSA"></RimoElement>
<RimoElement kind="el-option" label="左營高鐵站門店" value="S-KHH"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.vehicleType} onModelChange={value => {
                  model.write(["filters", "vehicleType"], value);
                }} placeholder="載具類型" style={rimoStyle("width: 120px;")} clearable={true}><RimoElement kind="el-option" label="汽車" value="Vehicle"></RimoElement>
<RimoElement kind="el-option" label="微電車" value="MicroEV"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                  model.write(["filters", "status"], value);
                }} placeholder="當前狀態" style={rimoStyle("width: 120px;")} clearable={true}><RimoElement kind="el-option" label="空閒" value="IDLE"></RimoElement>
<RimoElement kind="el-option" label="出租中" value="RENTED"></RimoElement>
<RimoElement kind="el-option" label="調度中" value="DISPATCHING"></RimoElement>
<RimoElement kind="el-option" label="維修保養" value="MAINTENANCE"></RimoElement></RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} onClick={event => {
                    view.resetFilters?.(event);
                  }} icon="Refresh" data-rimo-filter-reset="true" aria-label="重置筛选"></RimoElement></RimoElement></div></div>
<div className="pt-4 mt-1 border-t border-gray-100"><div className="flex flex-wrap items-center gap-3"><RimoElement kind="el-select" modelValue={view.advancedFilters.group} onModelChange={value => {
                  model.write(["advancedFilters", "group"], value);
                }} placeholder="車組" clearable={true} style={rimoStyle("width: 140px;")} data-rimo-secondary="true">{rimoEntries(view.groupOptions).map(([group], _itemIndex) => <Fragment key={group}><RimoElement kind="el-option" key={group} label={group} value={group}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.advancedFilters.fuelType} onModelChange={value => {
                  model.write(["advancedFilters", "fuelType"], value);
                }} placeholder="能源類型" clearable={true} style={rimoStyle("width: 130px;")} data-rimo-secondary="true"><RimoElement kind="el-option" label="汽油" value="Gasoline"></RimoElement>
<RimoElement kind="el-option" label="柴油" value="Diesel"></RimoElement>
<RimoElement kind="el-option" label="純電" value="EV"></RimoElement>
<RimoElement kind="el-option" label="油電" value="Hybrid"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.advancedFilters.orderState} onModelChange={value => {
                  model.write(["advancedFilters", "orderState"], value);
                }} placeholder="訂單佔用" clearable={true} style={rimoStyle("width: 130px;")} data-rimo-secondary="true"><RimoElement kind="el-option" label="無訂單" value="none"></RimoElement>
<RimoElement kind="el-option" label="有訂單" value="occupied"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.advancedFilters.attentionState} onModelChange={value => {
                  model.write(["advancedFilters", "attentionState"], value);
                }} placeholder="關注狀態" multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} style={rimoStyle("width: 190px;")} data-rimo-secondary="true"><RimoElement kind="el-option" label="通訊異常" value="communication"></RimoElement>
<RimoElement kind="el-option" label="定位異常" value="location"></RimoElement>
<RimoElement kind="el-option" label="低電量" value="lowEnergy"></RimoElement>
<RimoElement kind="el-option" label="低電壓" value="lowVoltage"></RimoElement>
<RimoElement kind="el-option" label="防盜未上鎖" value="securityUnlocked"></RimoElement>
<RimoElement kind="el-option" label="中控未上鎖" value="centralUnlocked"></RimoElement>
<RimoElement kind="el-option" label="車門未全關" value="doorOpen"></RimoElement>
<RimoElement kind="el-option" label="電子鑰匙未回位" value="keyNotReturned"></RimoElement></RimoElement></div></div></>
        }}><RimoElement kind="el-table-column" label="車輛狀態" width="180" fixed="left" align="left" slots={{
            "default": ({
              row
            }) => <><div className="vehicle-status-inline"><div className={rimoClass(["vehicle-status-primary tracking-wide", rimoClass({
                  'opacity-50 line-through': row.status === 'MAINTENANCE'
                })])}>{rimoText(row.plate)}</div>
<span className="vehicle-status-muted">{text("\n                                                ")}{rimoText(row.vehicleType === 'MicroEV' ? '微電車' : '汽車')}{text("\n                                            ")}</span></div>
<div className="vehicle-status-tags">{row.status === 'IDLE' ? <><RimoElement kind="el-tag" type="success" effect="dark" size="small">{text("空閒")}</RimoElement></> : row.status === 'RENTED' ? <><RimoElement kind="el-tag" type="primary" effect="dark" size="small">{text("出租中")}</RimoElement></> : row.status === 'DISPATCHING' ? <><RimoElement kind="el-tag" type="warning" effect="dark" size="small">{text("調度中")}</RimoElement></> : row.status === 'MAINTENANCE' ? <><RimoElement kind="el-tag" type="danger" effect="plain" size="small">{text("維修/保養")}</RimoElement></> : null}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="車輛基礎信息" width="220" align="left" slots={{
            "default": ({
              row
            }) => <><div className="vehicle-status-primary">{rimoText(row.brand)}{text(" ")}{rimoText(row.model)}</div>
<div className="vehicle-status-secondary">{text("車組：")}{rimoText(row.group)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="歸屬與服務" width="220" align="left" showOverflowTooltip={true} slots={{
            "default": ({
              row
            }) => <><div className="vehicle-status-inline"><RimoElement kind="el-icon" className="text-blue-400 shrink-0"><RimoIcon name="Shop" /></RimoElement>
<span className="vehicle-status-muted truncate" title={row.station}>{rimoText(row.station)}</span></div>
<div className="vehicle-status-secondary truncate" title={row.serviceType}>{text("服務：")}{rimoText(row.serviceType)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="實時車況" width="220" align="left" slots={{
            "default": ({
              row
            }) => <><div className="vehicle-status-inline"><span className="vehicle-status-muted">{text("里程")}</span>
<span className="font-mono text-gray-700">{rimoText(view.formatMetric(row.mileage, 'km', true))}</span></div>
<div className="vehicle-status-meter flex items-center gap-2"><span className="vehicle-status-muted shrink-0">{rimoText(view.getEnergyLabel(row))}</span>
<div className="meter-bar flex-1" title={view.getEnergyTitle(row)}>{view.getEnergyLevel(row) !== null ? <><div className={rimoClass(["meter-fill", rimoClass(view.getEnergyBarClass(row))])} style={rimoStyle({
                      width: view.getEnergyLevel(row) + '%'
                    })}></div></> : null}</div>
<span className={rimoClass(["font-bold text-xs whitespace-nowrap", rimoClass(view.getEnergyTextClass(row))])}>{rimoText(view.formatPercentage(view.getEnergyLevel(row)))}</span></div>
{row.vehicleType === 'MicroEV' ? <><div className="vehicle-status-secondary vehicle-status-condition-line"><span>{text("續航 ")}{rimoText(view.formatMetric(row.remainingDistance, 'km'))}</span>
<span>{text("直流 ")}{rimoText(view.formatMetric(row.dcVoltage, 'V'))}</span></div></> : <><div className="vehicle-status-secondary vehicle-status-condition-line"><span>{text("低壓蓄電池 ")}{rimoText(view.formatMetric(row.batteryVoltage, 'V'))}</span></div></>}
{view.getRealtimeAttentionTypes(row).length ? <><div className="vehicle-status-alert-tags">{rimoEntries(view.getRealtimeAttentionTypes(row)).map(([attention], _itemIndex) => <Fragment key={attention.key}><RimoElement kind="el-tag" key={attention.key} size="small" effect="plain" type={attention.type}>{rimoText(attention.label)}</RimoElement></Fragment>)}</div></> : null}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="行駛動態" minWidth="300" align="left" showOverflowTooltip={true} slots={{
            "default": ({
              row
            }) => <><div className="vehicle-status-inline"><span className="vehicle-status-muted">{text("車速")}</span>
<span className={rimoClass(["font-mono font-bold", rimoClass(Number(row.speed) > 0 ? 'text-blue-600' : 'text-gray-400')])}>{rimoText(view.formatMetric(row.speed, 'km/h'))}</span>
{row.vehicleType === 'MicroEV' ? <><span className={rimoClass(["vehicle-status-secondary mt-0", rimoClass(row.motorStarted === true ? 'text-emerald-600' : 'text-gray-400')])}>{text("\n                                                馬達 ")}{rimoText(view.formatBooleanState(row.motorStarted, '已啓動', '關閉'))}{text("\n                                            ")}</span></> : <><span className="vehicle-status-secondary mt-0">{text("轉速 ")}{rimoText(view.formatMetric(row.rpm, 'rpm'))}</span></>}
<span className="vehicle-status-secondary mt-0">{text("更新時間 ")}{rimoText(view.formatShortTime(row.receivedAt))}</span></div>
{view.hasMapPosition(row) ? <><button type="button" className="vehicle-status-map-trigger" title={`查看 ${row.plate} 的地圖定位`} onClick={event => {
                  event.stopPropagation();
                  view.openMapDialog(row);
                }}><RimoElement kind="el-icon" className="text-red-500 shrink-0"><RimoIcon name="Location" /></RimoElement>
<span className="vehicle-status-secondary mt-0 truncate">{rimoText(row.address)}</span>
<span className="vehicle-status-map-action">{text("查看地圖")}</span></button></> : <><div className="vehicle-status-secondary flex items-center gap-1.5 truncate" title={row.address}><RimoElement kind="el-icon" className="text-gray-400 shrink-0"><RimoIcon name="Location" /></RimoElement>
<span className="truncate">{rimoText(row.address)}</span></div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="關聯訂單" width="160" slots={{
            "default": ({
              row
            }) => <>{row.orderInfo ? <><span className="text-xs font-bold text-blue-700 hover:underline cursor-pointer">{text("#")}{rimoText(row.orderInfo.orderNo)}</span></> : <><span className="text-gray-300">{text("—")}</span></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="140" fixed="right" align="center" slots={{
            "default": ({
              row
            }) => <><div className="flex items-center justify-center gap-3"><button type="button" className="vehicle-status-link" onClick={_event => {
                  view.openHistoryDialog(row);
                }}>{text("歷史記錄")}</button>
<a className="vehicle-status-link" href={view.getConsoleHref(row)}>{text("查看狀態")}</a></div></>
          }}></RimoElement></RimoElement>
<div className="vehicle-status-pagination"><RimoElement kind="el-pagination" currentPage={view.currentPage} onCurrentPageChange={value => {
            model.write(["currentPage"], value);
          }} pageSize={view.pageSize} onPageSizeChange={value => {
            model.write(["pageSize"], value);
          }} pageSizes={[10, 20, 50]} total={view.filteredData.length} layout="total, sizes, prev, pager, next" background={true} onSizeChange={_event => {
            model.write(["currentPage"], 1);
          }}></RimoElement></div></div></div><RimoElement kind="el-dialog" modelValue={view.mapDialogVisible} onModelChange={value => {
      model.write(["mapDialogVisible"], value);
    }} title={view.mapDialogVehicle ? `${view.mapDialogVehicle.plate} · 地圖定位` : '地圖定位'} width="min(880px, 92vw)" destroyOnClose={true}>{() => <>{view.mapDialogVehicle ? <><div className="map-dialog-body"><div className="map-dialog-canvas"><div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 rounded-lg text-xs text-gray-700 shadow-sm">{text("\n                            最新定位時間：")}{rimoText(view.mapDialogVehicle.iduGpsTime || 'NA')}{text("\n                        ")}</div>
<div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 rounded-lg text-xs text-gray-700 shadow-sm">{text("\n                            經緯度：")}{rimoText(view.mapDialogVehicle.latitude)}{text(", ")}{rimoText(view.mapDialogVehicle.longitude)}{text("\n                        ")}</div>
<div className="map-dialog-marker absolute text-red-500 drop-shadow-md"><svg viewBox="0 0 24 24" className="w-10 h-10 fill-current" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg></div></div>
<div className="map-dialog-meta"><div className="map-dialog-meta-item"><div className="text-xs text-gray-500 mb-1">{text("定位地址")}</div>
<div className="text-sm text-gray-700">{rimoText(view.mapDialogVehicle.address || 'NA')}</div></div>
<div className="map-dialog-meta-item"><div className="text-xs text-gray-500 mb-1">{text("定位狀態")}</div>
<div className="text-sm text-gray-700">{rimoText(view.formatBooleanState(view.mapDialogVehicle.gpsStatus, 'GPS 有效', 'GPS 無效'))}{text(" / ")}{rimoText(view.getConnectionText(view.mapDialogVehicle))}</div></div></div></div></> : null}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.historyDialogVisible} onModelChange={value => {
      model.write(["historyDialogVisible"], value);
    }} title={view.historyTargetVehicle ? `${view.historyTargetVehicle.plate} · 車機資料歷史記錄` : '車機資料歷史記錄'} className="vehicle-history-dialog" width="96vw" top="3vh" destroyOnClose={true}>{() => <>{view.historyTargetVehicle ? <><div className="history-dialog-content"><div className="history-toolbar"><RimoElement kind="el-date-picker" modelValue={view.historyDateRange} onModelChange={value => {
                model.write(["historyDateRange"], value);
              }} type="datetimerange" valueFormat="YYYY-MM-DD HH:mm:ss" format="MM-DD HH:mm" startPlaceholder="平臺接收開始" endPlaceholder="平臺接收結束" rangeSeparator="至" clearable={true} onChange={event => {
                view.onHistoryFilterChange?.(event);
              }}></RimoElement>
<RimoElement kind="el-date-picker" modelValue={view.historyGpsDateRange} onModelChange={value => {
                model.write(["historyGpsDateRange"], value);
              }} type="datetimerange" valueFormat="YYYY-MM-DD HH:mm:ss" format="MM-DD HH:mm" startPlaceholder="定位開始" endPlaceholder="定位結束" rangeSeparator="至" clearable={true} onChange={event => {
                view.onHistoryFilterChange?.(event);
              }}></RimoElement>
<RimoElement kind="el-select" modelValue={view.historyFilters.gpsStatus} onModelChange={value => {
                model.write(["historyFilters", "gpsStatus"], value);
              }} clearable={true} placeholder="GPS 狀態" onChange={event => {
                view.onHistoryFilterChange?.(event);
              }}><RimoElement kind="el-option" label="有效定位" value="true"></RimoElement>
<RimoElement kind="el-option" label="無效定位" value="false"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.historyFilters.gprsStatus} onModelChange={value => {
                model.write(["historyFilters", "gprsStatus"], value);
              }} clearable={true} placeholder="通訊狀態" onChange={event => {
                view.onHistoryFilterChange?.(event);
              }}><RimoElement kind="el-option" label="在線" value="true"></RimoElement>
<RimoElement kind="el-option" label="離線" value="false"></RimoElement></RimoElement>
<RimoElement kind="el-button" plain={true} onClick={event => {
                view.resetHistoryFilters?.(event);
              }}>{text("重置")}</RimoElement></div>
<div className="history-table-wrap"><RimoElement kind="el-table" className="history-data-table" data={view.pagedHistoryRecords} rowKey="snapshotId" height="100%" tableLayout="fixed" scrollbarAlwaysOn={true} border={true} size="small"><RimoElement kind="el-table-column" prop="receivedAt" label="平臺接收時間" width="170" fixed={true}></RimoElement>
<RimoElement kind="el-table-column" prop="iduGpsTime" label="車機定位時間" width="170" fixed={true}></RimoElement>
<RimoElement kind="el-table-column" label="GPS" width="95" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(view.formatBooleanState(row.gpsStatus, '有效', '無效'))}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="GPRS" width="95" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(view.getConnectionText(row))}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="latitude" label="緯度" width="125"></RimoElement>
<RimoElement kind="el-table-column" prop="longitude" label="經度" width="125"></RimoElement>
<RimoElement kind="el-table-column" label="總行駛里程" width="120" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(view.formatMetric(row.mileage, 'km', true))}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="車速" width="100" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(view.formatMetric(row.speed, 'km/h'))}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label={view.historyTargetVehicle.vehicleType === 'MicroEV' ? '總電量' : '剩餘油量'} width="105" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(view.formatPercentage(view.getEnergyLevel(row)))}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label={view.historyTargetVehicle.vehicleType === 'MicroEV' ? '直流側電壓' : '低壓蓄電池電壓'} width="130" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(view.formatMetric(row.vehicleType === 'MicroEV' ? row.dcVoltage : row.batteryVoltage, 'V'))}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="低電壓" width="95" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(view.formatBooleanState(row.lowVoltage, '異常', '正常'))}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="車機租約" width="100" slots={{
                  "default": ({
                    row
                  }) => <>{rimoText(view.formatBooleanState(row.rentalStatus, '有租約', '無租約'))}</>
                }}></RimoElement>
{view.historyTargetVehicle.vehicleType === 'Vehicle' ? <><><RimoElement kind="el-table-column" label="ACC" width="90" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.formatBooleanState(row.accStatus, '發動車', '熄火'))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="引擎" width="90" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.formatBooleanState(row.powerOnStatus, '開啓', '關閉'))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="防盜鎖" width="100" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.formatBooleanState(row.securityStatus, '已上鎖', '未上鎖'))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="中控鎖" width="110" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.formatBooleanState(row.doorLockStatus, '全部上鎖', '有門解鎖'))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="車門狀態" width="110" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.formatBooleanState(row.doorStatus, '有門開啓', '全部關閉'))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="燈光" width="85" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.formatBooleanState(row.lightStatus, '開啓', '關閉'))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="電子鑰匙" width="105" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.formatBooleanState(row.iButtonStatus, '已回位', '未回位'))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" prop="iButtonId" label="電子鑰匙編號" width="180" showOverflowTooltip={true}></RimoElement></></> : <><><RimoElement kind="el-table-column" label="馬達" width="90" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.formatBooleanState(row.motorStarted, '已啓動', '關閉'))}</>
                    }}></RimoElement>
{rimoEntries(['1號倉', '2號倉', '3號倉']).map(([slot, index], _itemIndex) => <Fragment key={slot}><><RimoElement kind="el-table-column" label={`${slot} SOC`} width="100" slots={{
                          "default": ({
                            row
                          }) => <>{rimoText(view.formatPercentage(view.getBatterySlotValue(row, index, 'soc')))}</>
                        }}></RimoElement>
<RimoElement kind="el-table-column" label={`${slot} 電流`} width="105" slots={{
                          "default": ({
                            row
                          }) => <>{rimoText(view.formatMetric(view.getBatterySlotValue(row, index, 'current'), 'A'))}</>
                        }}></RimoElement>
<RimoElement kind="el-table-column" label={`${slot} 最低溫`} width="105" slots={{
                          "default": ({
                            row
                          }) => <>{rimoText(view.formatMetric(view.getBatterySlotValue(row, index, 'tempLow'), '℃'))}</>
                        }}></RimoElement>
<RimoElement kind="el-table-column" label={`${slot} 最高溫`} width="105" slots={{
                          "default": ({
                            row
                          }) => <>{rimoText(view.formatMetric(view.getBatterySlotValue(row, index, 'tempHigh'), '℃'))}</>
                        }}></RimoElement>
<RimoElement kind="el-table-column" label={`${slot} 序號`} width="170" slots={{
                          "default": ({
                            row
                          }) => <>{rimoText(view.getBatterySlotValue(row, index, 'serialNo') || 'NA')}</>
                        }}></RimoElement>
<RimoElement kind="el-table-column" label={`${slot} 韌體`} width="110" slots={{
                          "default": ({
                            row
                          }) => <>{rimoText(view.getBatterySlotValue(row, index, 'firmware') || 'NA')}</>
                        }}></RimoElement></></Fragment>)}</></>}</RimoElement></div>
<div className="history-pagination"><RimoElement kind="el-pagination" currentPage={view.historyPage} onCurrentPageChange={value => {
                model.write(["historyPage"], value);
              }} pageSize={view.historyPageSize} onPageSizeChange={value => {
                model.write(["historyPageSize"], value);
              }} pageSizes={[10, 20, 50]} total={view.filteredHistoryRecords.length} layout="total, sizes, prev, pager, next" background={true}></RimoElement></div></div></> : null}</>}</RimoElement></RimoRoot>;
}