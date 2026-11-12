import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, RimoImage, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './vehicles.css';
import createPageState from './vehicles-model.js';
export default function VehiclesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="vehicles" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("車輛檔案庫")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理所有車輛實例，監控狀態、里程及服務能力。")}</p></div>
<div className="flex gap-3"><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
            view.openDialog(null);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增車輛\n                        ")}</RimoElement></div></div>
<div className="vehicles-list-panel bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-264px)]" data-rimo-layout="list"><div className="vehicles-table-wrap flex flex-col flex-1 min-h-0 overflow-hidden"><RimoElement kind="el-table" className="vehicles-table" data={view.paginatedVehicles} tableLayout="fixed" style={rimoStyle("width: 100%")} height="100%" stripe={true} headerCellStyle={{
            background: 'var(--app-color-surface-subtle)',
            color: 'var(--app-color-text-secondary)',
            fontWeight: '600'
          }} onSelectionChange={event => {
            view.handleSelectionChange?.(event);
          }} slots={{
            "toolbar": _slot => <><div className="adaptive-filter-toolbar flex flex-wrap items-center justify-between gap-4"><div className="adaptive-filter-controls flex items-center gap-4 flex-wrap"><RimoElement kind="el-input" modelValue={view.searchQuery} onModelChange={value => {
                    model.write(["searchQuery"], value);
                  }} placeholder="車牌號 / VIN" prefixIcon="Search" clearable={true} style={rimoStyle("width: 280px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filterAssetCompanyIds} onModelChange={value => {
                    model.write(["filterAssetCompanyIds"], value);
                  }} multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} filterable={true} placeholder="資產歸屬" style={rimoStyle("width: 150px")}>{rimoEntries(view.companyOptions).map(([company], _itemIndex) => <Fragment key={company.id}><RimoElement kind="el-option" key={company.id} label={company.label} value={company.id}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-cascader" modelValue={view.filterPositionIds} onModelChange={value => {
                    model.write(["filterPositionIds"], value);
                  }} options={view.orgData} props={view.positionFilterProps} filterable={true} clearable={true} collapseTags={true} collapseTagsTooltip={true} placeholder="當前位置" style={rimoStyle("width: 210px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filterStatus} onModelChange={value => {
                    model.write(["filterStatus"], value);
                  }} multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} placeholder="營運狀態" style={rimoStyle("width: 150px")}>{rimoEntries(view.statusOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-button" icon="Refresh" circle={true} onClick={event => {
                    view.resetVehicleFilters?.(event);
                  }} data-rimo-filter-reset="true" aria-label="重置筛选"></RimoElement>
<RimoElement kind="el-button" type="success" plain={true} icon="Upload" onClick={_event => {
                    view.handleImportCommand('import');
                  }}>{text("導入")}</RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} icon="Download" onClick={event => {
                    view.handleExport?.(event);
                  }}>{text("導出")}</RimoElement>
<RimoElement kind="el-dropdown" onCommand={event => {
                    view.applyVehicleBatchStatus?.(event);
                  }} trigger="click" slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item" command={true} className="text-emerald-600"><RimoElement kind="el-icon"><RimoIcon name="Check" /></RimoElement>
{text("批量啓用")}</RimoElement>
<RimoElement kind="el-dropdown-item" command={false} className="text-red-500"><RimoElement kind="el-icon"><RimoIcon name="Close" /></RimoElement>
{text("批量停用")}</RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" type="warning" plain={true} disabled={view.selectedVehicles.length === 0}>{text("\n                                        批量操作\n                                        ")}
<svg className="ml-1.5 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path></svg></RimoElement></RimoElement></div>
<div className="adaptive-filter-actions flex items-center gap-3"></div></div>
<div className="pt-4 mt-4 border-t border-gray-100"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4 flex-1 flex-wrap"><RimoElement kind="el-select" modelValue={view.filterEnabledStates} onModelChange={value => {
                      model.write(["filterEnabledStates"], value);
                    }} multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} placeholder="是否啓用" style={rimoStyle("width: 150px")} data-rimo-secondary="true">{rimoEntries(view.enabledOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filterVehicleTypes} onModelChange={value => {
                      model.write(["filterVehicleTypes"], value);
                    }} multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} placeholder="載具類型" style={rimoStyle("width: 150px")} data-rimo-secondary="true">{rimoEntries(view.vehicleTypeOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filterServiceTypes} onModelChange={value => {
                      model.write(["filterServiceTypes"], value);
                    }} multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} placeholder="服務類型" style={rimoStyle("width: 180px")} data-rimo-secondary="true">{rimoEntries(view.serviceOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="flex items-center gap-3">{view.selectedVehicles.length > 0 ? <><span className="text-xs text-blue-600 font-medium whitespace-nowrap bg-blue-50 px-2 py-1 rounded border border-blue-100">{text("\n                                        已選 ")}{rimoText(view.selectedVehicles.length)}{text(" 項\n                                    ")}</span></> : null}</div></div></div></>
          }}><RimoElement kind="el-table-column" type="selection" width="40"></RimoElement>
<RimoElement kind="el-table-column" label="車輛信息" minWidth="240" slots={{
              "default": ({
                row
              }) => <><div className="flex items-center gap-3"><RimoElement kind="el-image" src={view.getVehiclePhoto(row)} className="w-20 h-14 rounded object-cover border bg-gray-100" previewSrcList={[view.getVehiclePhoto(row)]} previewTeleported={true} fit="cover" slots={{
                    "error": _slot => <><div className="flex items-center justify-center w-full h-full text-gray-300"><RimoElement kind="el-icon"><RimoIcon name="Picture" /></RimoElement></div></>
                  }}></RimoElement>
<div><div className="flex items-center gap-2"><div className="font-bold text-gray-800 text-base">{rimoText(row.licensePlate)}</div>
<RimoElement kind="el-tag" type={view.getVehicleTypeTagType(row.vehicleType)} size="small" effect="plain">{text("\n                                                    ")}{rimoText(view.getVehicleTypeLabel(row.vehicleType))}{text("\n                                                ")}</RimoElement></div>
<div className="text-xs text-gray-500 mt-1">{rimoText(view.getGroupName(row.vehicleGroupId))}</div>
<div className="text-xs text-gray-400 mt-0.5 font-mono">{text("VIN: ")}{rimoText(row.vin.substring(0, 6))}{text("...")}{rimoText(row.vin.substring(row.vin.length - 4))}{text("\n                                            ")}</div></div></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="資產歸屬" minWidth="180" slots={{
              "default": ({
                row
              }) => <><div className="text-sm font-medium text-gray-800">{rimoText(view.getCompanyName(row.assetCompanyId))}</div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="當前位置" minWidth="180" slots={{
              "default": ({
                row
              }) => <><div className="text-sm"><div className="font-medium text-gray-800">{rimoText(view.getStoreName(row.storeId))}</div>
<div className="text-xs text-gray-500 mt-1 flex items-center"><RimoElement kind="el-icon" className="mr-1 text-gray-400"><RimoIcon name="Location" /></RimoElement>
{text("\n                                            ")}{rimoText(view.getStationName(row.stationId))}{text("\n                                        ")}</div></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="營運狀態" width="110" slots={{
              "default": ({
                row
              }) => <><div className="flex flex-col gap-1"><RimoElement kind="el-tag" type={view.getStatusType(row.operationStatus)} size="small">{rimoText(view.getStatusName(row.operationStatus))}</RimoElement></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="是否啓用" width="90" align="center" slots={{
              "default": ({
                row
              }) => <><div onClick={event => {
                  event.stopPropagation();
                }} className="flex justify-center"><RimoElement kind="el-switch" modelValue={row.enabled} onModelChange={value => {
                    model.assign(row, "enabled", value);
                  }} size="small" style={rimoStyle("--el-switch-on-color: var(--app-color-primary); --el-switch-off-color: #ff4949")} onChange={_event => {
                    view.handleStatusToggle(row);
                  }}></RimoElement></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="當前上架" width="150" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tooltip" content={view.getServiceTooltip(row.serviceTypes)} placement="top" effect="light"><div className="flex flex-col gap-1 cursor-default"><div><RimoElement kind="el-tag" size="small" type={view.getServiceTagType(row.currentServiceType)} effect="light">{text("\n                                                    ")}{rimoText(view.getServiceFullName(row.currentServiceType))}{text("\n                                                ")}</RimoElement></div>
<div className="text-xs text-gray-500">{text("\n                                                可服務 ")}{rimoText(row.serviceTypes.length)}{text(" 項\n                                            ")}</div></div></RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="里程" width="120" prop="mileage" sortable={true} slots={{
              "default": ({
                row
              }) => <><span className="font-mono">{rimoText(row.mileage.toLocaleString())}{text(" km")}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="220" align="right" fixed="right" slots={{
              "default": ({
                row
              }) => <><div className="flex items-center justify-end gap-2"><RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                    view.openDetailDrawer(row);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Document" /></RimoElement>
{text("詳情\n                                        ")}</RimoElement>
<RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                    view.openDialog(row);
                  }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-dropdown" trigger="click" slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu">{row.operationStatus !== 'MAINTENANCE' && row.operationStatus !== 'RENTED' ? <><RimoElement kind="el-dropdown-item" onClick={_event => {
                            view.setMaintenance(row);
                          }}><RimoElement kind="el-icon"><RimoIcon name="Tools" /></RimoElement>
{text(" 發起維保\n                                                    ")}</RimoElement></> : null}
{row.operationStatus === 'MAINTENANCE' ? <><RimoElement kind="el-dropdown-item" onClick={_event => {
                            view.setIdle(row);
                          }}><RimoElement kind="el-icon"><RimoIcon name="CircleCheck" /></RimoElement>
{text(" 結束維保\n                                                    ")}</RimoElement></> : null}
<RimoElement kind="el-dropdown-item" divided={true} className="text-red-500" disabled={row.operationStatus === 'RENTED'} onClick={_event => {
                          view.deleteVehicle(row);
                        }}><RimoElement kind="el-icon"><RimoIcon name="Delete" /></RimoElement>
{text(" 刪除車輛\n                                                    ")}</RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" link={true} type="info" size="small" icon="More"></RimoElement></RimoElement></div></>
            }}></RimoElement></RimoElement>
<div className="p-3 border-t border-gray-100 flex justify-end bg-white"><RimoElement kind="el-pagination" currentPage={view.currentPage} onCurrentPageChange={value => {
              model.write(["currentPage"], value);
            }} pageSize={view.pageSize} onPageSizeChange={value => {
              model.write(["pageSize"], value);
            }} pageSizes={[10, 20, 50]} layout="total, sizes, prev, pager, next, jumper" total={view.filteredVehicles.length} onSizeChange={event => {
              view.handlePageSizeChange?.(event);
            }} onCurrentChange={event => {
              view.handlePageChange?.(event);
            }}></RimoElement></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.dialogVisible} onModelChange={value => {
      model.write(["dialogVisible"], value);
    }} title={view.isEdit ? '編輯車輛' : '新增車輛'} width="920px" top="4vh" className="vehicles-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["dialogVisible"], false);
        }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Close" /></RimoElement>
{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveVehicle?.(event);
        }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" model={view.currentVehicle} labelPosition="top" rules={view.rules} modelRef={model.ref("formRef")} className="h-[620px] overflow-hidden flex flex-col"><RimoElement kind="el-tabs" modelValue={view.activeDialogTab} onModelChange={value => {
            model.write(["activeDialogTab"], value);
          }} className="flex-1 overflow-hidden"><RimoElement kind="el-tab-pane" label="基礎資料" name="BASIC" className="h-full overflow-y-auto custom-scroll pr-2"><RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="Tickets" /></RimoElement>
{text(" 車輛識別")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="車牌號" prop="licensePlate" required={true}><RimoElement kind="el-input" modelValue={view.currentVehicle.licensePlate} onModelChange={value => {
                    model.write(["currentVehicle", "licensePlate"], value);
                  }} placeholder="例如: RAA-1234"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車架號 (VIN)" prop="vin"><RimoElement kind="el-input" modelValue={view.currentVehicle.vin} onModelChange={value => {
                    model.write(["currentVehicle", "vin"], value);
                  }} placeholder="17位 VIN 碼" maxLength="17"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="載具類型" required={true}><RimoElement kind="el-radio-group" modelValue={view.currentVehicle.vehicleType} onModelChange={value => {
                    model.write(["currentVehicle", "vehicleType"], value);
                  }} onChange={event => {
                    view.handleVehicleTypeChange?.(event);
                  }}><RimoElement kind="el-radio" label="car">{text("🚗 汽車")}</RimoElement>
<RimoElement kind="el-radio" label="motorcycle">{text("🏍️ 摩托車")}</RimoElement>
<RimoElement kind="el-radio" label="microElectric">{text("🔋 微電車")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="所屬車型組" prop="vehicleGroupId" required={true}><RimoElement kind="el-select" modelValue={view.currentVehicle.vehicleGroupId} onModelChange={value => {
                    model.write(["currentVehicle", "vehicleGroupId"], value);
                  }} placeholder="請選擇車型組" className="w-full">{rimoEntries(view.filteredGroupOptions).map(([g], _itemIndex) => <Fragment key={g.id}><RimoElement kind="el-option" key={g.id} label={g.brand + ' ' + g.model + ' (' + g.year + ')'} value={g.id}><span className="float-left">{rimoText(g.brand)}{text(" ")}{rimoText(g.model)}</span>
<span className="float-right text-gray-400 text-xs">{rimoText(g.year)}</span></RimoElement></Fragment>)}</RimoElement></RimoElement></div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="OfficeBuilding" /></RimoElement>
{text(" 資產歸屬與位置")}</RimoElement>
<div className="grid grid-cols-3 gap-x-6 gap-y-2" data-rimo-grid="3" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="資產所屬車行" prop="assetCompanyId" required={true}><RimoElement kind="el-select" modelValue={view.currentVehicle.assetCompanyId} onModelChange={value => {
                    model.write(["currentVehicle", "assetCompanyId"], value);
                  }} className="w-full" disabled={view.isEdit} placeholder="請選擇資產所屬車行" onChange={event => {
                    view.handleAssetCompanyChange?.(event);
                  }}>{rimoEntries(view.companyOptions).map(([company], _itemIndex) => <Fragment key={company.id}><RimoElement kind="el-option" key={company.id} label={company.label} value={company.id}></RimoElement></Fragment>)}</RimoElement>
{view.isEdit ? <><span className="text-gray-400 text-xs">{text("編輯時不在此處調整資產歸屬")}</span></> : null}</RimoElement>
<RimoElement kind="el-form-item" label="登記所有人"><RimoElement kind="el-input" modelValue={view.currentVehicle.owner} onModelChange={value => {
                    model.write(["currentVehicle", "owner"], value);
                  }} placeholder="公司/個人"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="資產來源"><RimoElement kind="el-select" modelValue={view.currentVehicle.source} onModelChange={value => {
                    model.write(["currentVehicle", "source"], value);
                  }} className="w-full"><RimoElement kind="el-option" label="自購" value="PURCHASE"></RimoElement>
<RimoElement kind="el-option" label="租賃" value="LEASE"></RimoElement>
<RimoElement kind="el-option" label="掛靠" value="AFFILIATE"></RimoElement>
<RimoElement kind="el-option" label="託管" value="TRUST"></RimoElement></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="當前門市" prop="storeId" required={true}><RimoElement kind="el-select" modelValue={view.currentVehicle.storeId} onModelChange={value => {
                    model.write(["currentVehicle", "storeId"], value);
                  }} className="w-full" disabled={view.isEdit} placeholder="請選擇當前門市" onChange={event => {
                    view.handleStoreChange?.(event);
                  }}>{rimoEntries(view.filteredStoreOptions).map(([store], _itemIndex) => <Fragment key={store.id}><RimoElement kind="el-option" key={store.id} label={store.label} value={store.id}></RimoElement></Fragment>)}</RimoElement>
{view.isEdit ? <><span className="text-gray-400 text-xs">{text("編輯時通過調度或調撥調整位置")}</span></> : null}</RimoElement>
<RimoElement kind="el-form-item" label="當前據點" prop="stationId" required={true}><RimoElement kind="el-select" modelValue={view.currentVehicle.stationId} onModelChange={value => {
                    model.write(["currentVehicle", "stationId"], value);
                  }} className="w-full" disabled={view.isEdit} placeholder="請選擇當前據點">{rimoEntries(view.filteredStationOptions).map(([station], _itemIndex) => <Fragment key={station.id}><RimoElement kind="el-option" key={station.id} label={station.label} value={station.id}></RimoElement></Fragment>)}</RimoElement>
{view.isEdit ? <><span className="text-gray-400 text-xs">{text("編輯時通過調度或調撥調整位置")}</span></> : null}</RimoElement></div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="InfoFilled" /></RimoElement>
{text(" 基礎屬性")}</RimoElement>
<div className="grid grid-cols-3 gap-x-6 gap-y-2" data-rimo-grid="3" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="顏色"><RimoElement kind="el-input" modelValue={view.currentVehicle.color} onModelChange={value => {
                    model.write(["currentVehicle", "color"], value);
                  }} placeholder="例如: 白色"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="出廠年份"><RimoElement kind="el-date-picker" modelValue={view.currentVehicle.year} onModelChange={value => {
                    model.write(["currentVehicle", "year"], value);
                  }} type="year" placeholder="選擇年份" valueFormat="YYYY" style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="當前里程 (km)"><RimoElement kind="el-input-number" modelValue={view.currentVehicle.mileage} onModelChange={value => {
                    model.write(["currentVehicle", "mileage"], value);
                  }} min={0} step={100} style={rimoStyle("width: 100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車輛暱稱"><RimoElement kind="el-input" modelValue={view.currentVehicle.nickname} onModelChange={value => {
                    model.write(["currentVehicle", "nickname"], value);
                  }} placeholder="給車輛起個好記的名字"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車輛實拍圖 (可選)" className="col-span-2"><RimoElement kind="el-input" modelValue={view.currentVehicle.customPhotoUrl} onModelChange={value => {
                    model.write(["currentVehicle", "customPhotoUrl"], value);
                  }} placeholder="輸入 URL，留空則使用車型組默認圖" slots={{
                    "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Picture" /></RimoElement></>
                  }}></RimoElement></RimoElement></div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="Setting" /></RimoElement>
{text(" 技術參數")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="座位數"><RimoElement kind="el-input-number" modelValue={view.currentVehicle.seats} onModelChange={value => {
                    model.write(["currentVehicle", "seats"], value);
                  }} min={1} max={60} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車門數"><RimoElement kind="el-input-number" modelValue={view.currentVehicle.doors} onModelChange={value => {
                    model.write(["currentVehicle", "doors"], value);
                  }} min={0} max={6} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="燃料類型"><RimoElement kind="el-select" modelValue={view.currentVehicle.fuelType} onModelChange={value => {
                    model.write(["currentVehicle", "fuelType"], value);
                  }} className="w-full"><RimoElement kind="el-option" label="汽油" value="GASOLINE"></RimoElement>
<RimoElement kind="el-option" label="純電" value="ELECTRIC"></RimoElement>
<RimoElement kind="el-option" label="混合動力" value="HYBRID"></RimoElement>
<RimoElement kind="el-option" label="柴油" value="DIESEL"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="變速箱"><RimoElement kind="el-select" modelValue={view.currentVehicle.transmission} onModelChange={value => {
                    model.write(["currentVehicle", "transmission"], value);
                  }} className="w-full"><RimoElement kind="el-option" label="自動擋 (AT)" value="AT"></RimoElement>
<RimoElement kind="el-option" label="手動擋 (MT)" value="MT"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="排量/續航"><RimoElement kind="el-input" modelValue={view.currentVehicle.displacement} onModelChange={value => {
                    model.write(["currentVehicle", "displacement"], value);
                  }} placeholder="如: 2.0T 或 500km"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="油箱/電池容量"><RimoElement kind="el-input" modelValue={view.currentVehicle.tankCapacity} onModelChange={value => {
                    model.write(["currentVehicle", "tankCapacity"], value);
                  }} placeholder="如: 60L 或 75kWh"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="是否國產"><RimoElement kind="el-switch" modelValue={view.currentVehicle.isDomestic} onModelChange={value => {
                    model.write(["currentVehicle", "isDomestic"], value);
                  }} activeText="國產" inactiveText="進口/合資"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="大件行李數 (24寸+)"><RimoElement kind="el-input-number" modelValue={view.currentVehicle.luggageLarge} onModelChange={value => {
                    model.write(["currentVehicle", "luggageLarge"], value);
                  }} min={0} className="w-full"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="小件行李數 (20寸-)"><RimoElement kind="el-input-number" modelValue={view.currentVehicle.luggageSmall} onModelChange={value => {
                    model.write(["currentVehicle", "luggageSmall"], value);
                  }} min={0} className="w-full"></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="運營配置" name="OPS" className="h-full overflow-y-auto custom-scroll pr-2"><div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm text-gray-600">{text("\n                            位置調整通過調度或調撥處理，當前頁主要維護上架狀態、可服務範圍和設備標籤。\n                        ")}</div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="Operation" /></RimoElement>
{text(" 上架與狀態")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="運營狀態">{view.isEdit ? <><><RimoElement kind="el-tag" type={view.getOperationStatusType(view.currentVehicle.operationStatus)} size="large" effect="dark">{text("\n                                        ")}{rimoText(view.getOperationStatusName(view.currentVehicle.operationStatus))}{text("\n                                    ")}</RimoElement>
<span className="text-gray-400 text-xs ml-2">{text("狀態由系統流程維護")}</span></></> : <><><RimoElement kind="el-tag" type="success" size="large" effect="dark">{text("空閒")}</RimoElement>
<span className="text-gray-400 text-xs ml-2">{text("新車默認空閒")}</span></></>}</RimoElement>
<RimoElement kind="el-form-item" label="當前服務類型" required={true}><RimoElement kind="el-select" modelValue={view.currentVehicle.currentServiceType} onModelChange={value => {
                    model.write(["currentVehicle", "currentServiceType"], value);
                  }} className="w-full" disabled={view.isEdit} placeholder="選擇當前上架的業務線"><RimoElement kind="el-option" label="同站租還" value="SHARING_SAME"></RimoElement>
<RimoElement kind="el-option" label="甲租乙還" value="SHARING_ONE_WAY"></RimoElement>
<RimoElement kind="el-option" label="門市租賃" value="STORE_STANDARD"></RimoElement>
<RimoElement kind="el-option" label="24H門市" value="STORE_24H"></RimoElement>
<RimoElement kind="el-option" label="公務用車" value="GOV"></RimoElement></RimoElement>
{view.isEdit ? <><span className="text-gray-400 text-xs">{text("編輯時不直接修改當前上架業務線")}</span></> : null}</RimoElement>
<RimoElement kind="el-form-item" label="啓用狀態"><div className="flex items-center gap-3"><RimoElement kind="el-switch" modelValue={view.currentVehicle.enabled} onModelChange={value => {
                      model.write(["currentVehicle", "enabled"], value);
                    }} activeText="已啓用" inactiveText="已停用" inactiveColor="#dcdfe6"></RimoElement>
<span className="text-gray-400 text-xs">{rimoText(view.currentVehicle.enabled ? '對外接受新訂單' : '暫停接單，不影響進行中業務')}</span></div></RimoElement></div>
<RimoElement kind="el-form-item" label="可服務類型"><RimoElement kind="el-checkbox-group" modelValue={view.currentVehicle.serviceTypes} onModelChange={value => {
                  model.write(["currentVehicle", "serviceTypes"], value);
                }}><RimoElement kind="el-checkbox" label="SHARING_SAME">{text("同站租還")}</RimoElement>
<RimoElement kind="el-checkbox" label="SHARING_ONE_WAY">{text("甲租乙還")}</RimoElement>
<RimoElement kind="el-checkbox" label="STORE_STANDARD">{text("門市租賃")}</RimoElement>
<RimoElement kind="el-checkbox" label="STORE_24H">{text("24H門市")}</RimoElement>
<RimoElement kind="el-checkbox" label="GOV">{text("公務用車")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="PriceTag" /></RimoElement>
{text(" 標籤與設備")}</RimoElement>
<div className="grid grid-cols-2 gap-x-6 gap-y-2" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="車輛標籤"><RimoElement kind="el-select" modelValue={view.currentVehicle.tags} onModelChange={value => {
                    model.write(["currentVehicle", "tags"], value);
                  }} multiple={true} filterable={true} allowCreate={true} defaultFirstOption={true} placeholder="輸入標籤按回車" className="w-full"><RimoElement kind="el-option" label="新車" value="New"></RimoElement>
<RimoElement kind="el-option" label="無煙車" value="NoSmoke"></RimoElement>
<RimoElement kind="el-option" label="GPS" value="GPS"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車機設備CID"><RimoElement kind="el-input" modelValue={view.currentVehicle.cid} onModelChange={value => {
                    model.write(["currentVehicle", "cid"], value);
                  }} placeholder="T-Box ID / Device ID"></RimoElement></RimoElement></div>
<RimoElement kind="el-divider" contentPosition="left"><RimoElement kind="el-icon"><RimoIcon name="WarningFilled" /></RimoElement>
{text(" 特殊車輛限制")}</RimoElement>
<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 w-full"><RimoElement kind="el-checkbox" modelValue={view.currentVehicle.isSpecial} onModelChange={value => {
                  model.write(["currentVehicle", "isSpecial"], value);
                }}>{text("標記爲特殊車輛")}</RimoElement>
<div className="text-xs text-yellow-700 mt-1">{text("僅影響會員可見性和可預約資格，不改變車輛資產歸屬。")}</div>
{view.currentVehicle.isSpecial ? <><div className="mt-3 animate-fade-in"><RimoElement kind="el-form-item" label="限制會員類型" className="!mb-0"><RimoElement kind="el-select" modelValue={view.currentVehicle.specialMembershipRequired} onModelChange={value => {
                        model.write(["currentVehicle", "specialMembershipRequired"], value);
                      }} placeholder="選擇允許租賃的會員等級" className="w-60"><RimoElement kind="el-option" label="白銀會員及以上" value="SILVER"></RimoElement>
<RimoElement kind="el-option" label="黃金會員及以上" value="GOLD"></RimoElement>
<RimoElement kind="el-option" label="黑鑽會員及以上" value="DIAMOND"></RimoElement></RimoElement></RimoElement></div></> : null}</div></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.importDialogVisible} onModelChange={value => {
      model.write(["importDialogVisible"], value);
    }} title="導入車輛數據" width="480px" destroyOnClose={true} className="vehicles-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["importDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.confirmImport?.(event);
        }}>{text("開始導入")}</RimoElement></>
    }}>{() => <><div className="mb-4 text-gray-600 text-sm"><p className="mb-2">{text("1. 請先下載導入模板，按標準模板格式填寫數據。")}</p>
<RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={event => {
            view.downloadTemplate?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text(" 下載規範表模板\n                ")}</RimoElement></div>
<div className="border-t border-gray-100 pt-4 mt-4"><p className="mb-2 text-gray-600 text-sm">{text("2. 上傳填寫好的數據表格（支持 .xls, .xlsx 格式，單次最大支持 1000 條）。")}</p>
<RimoElement kind="el-upload" className="upload-demo" drag={true} action="#" autoUpload={false} onChange={view.handleFileChange} accept=".xls,.xlsx"><RimoElement kind="el-icon" className="el-icon--upload"><RimoIcon name="UploadFilled" /></RimoElement>
<div className="el-upload__text">{text("\n                        將文件拖拽至此處，或 ")}
<em>{text("點擊上傳")}</em></div></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.photoHistoryVisible} onModelChange={value => {
      model.write(["photoHistoryVisible"], value);
    }} title="歷史車況照片" width="700px" appendToBody={true} destroyOnClose={true} className="vehicles-overlay">{() => <><div className="h-[600px] overflow-y-auto px-4 custom-scroll"><RimoElement kind="el-timeline">{rimoEntries(view.mockPhotoHistory).map(([item, idx], _itemIndex) => <Fragment key={idx}><RimoElement kind="el-timeline-item" key={idx} timestamp={item.date} placement="top" type={idx === 0 ? 'primary' : ''} size={idx === 0 ? 'large' : 'normal'}><div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4 transition-all hover:shadow-sm"><div className="flex justify-between items-start mb-3"><div><div className="font-bold text-gray-800 flex items-center gap-2">{text("\n                                        ")}{rimoText(item.type)}{text("\n                                        ")}
{idx === 0 ? <><RimoElement kind="el-tag" size="small" type="primary" effect="light">{text("Current")}</RimoElement></> : null}</div>
<div className="text-xs text-gray-500 mt-1">{text("驗車人: ")}{rimoText(item.operator)}</div></div></div>
<div className="grid grid-cols-4 gap-2 mb-2" data-rimo-grid="4">{rimoEntries(item.photos).map(([url, pIdx], _itemIndex) => <Fragment key={pIdx}><RimoElement kind="el-image" key={pIdx} src={url} previewSrcList={item.photos} initialIndex={pIdx} fit="cover" className="w-full aspect-video rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"></RimoElement></Fragment>)}</div>
<div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-100 flex items-start gap-1"><RimoElement kind="el-icon" className="mt-0.5"><RimoIcon name="InfoFilled" /></RimoElement>
<span>{text("備註: ")}{rimoText(item.remark)}</span></div></div></RimoElement></Fragment>)}</RimoElement></div></>}</RimoElement>
<RimoElement kind="el-drawer" modelValue={view.detailDrawerVisible} onModelChange={value => {
      model.write(["detailDrawerVisible"], value);
    }} size={'80%'} withHeader={false} destroyOnClose={true} className="custom-drawer vehicles-overlay">{() => <><div className="h-full flex flex-col bg-gray-50 relative"><button onClick={_event => {
            model.write(["detailDrawerVisible"], false);
          }} className="absolute top-4 right-6 z-50 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"><RimoElement kind="el-icon" className="text-2xl"><RimoIcon name="Close" /></RimoElement></button>
<div className="bg-white shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-start z-10 flex-shrink-0 gap-8" data-rimo-layout="toolbar"><div className="flex items-start gap-8 min-w-0"><div><div className="flex items-center gap-4"><h1 className="text-3xl font-mono font-bold text-gray-900 tracking-tight">{text("\n                                    ")}{rimoText(view.currentDetailVehicle.licensePlate)}{text("\n                                ")}</h1>
<RimoElement kind="el-tag" type={view.getStatusType(view.currentDetailVehicle.operationStatus)} effect="light" round={true} size="large" className="!px-4 !text-sm !font-bold">{text("\n                                    ")}{rimoText(view.getStatusName(view.currentDetailVehicle.operationStatus))}{text("\n                                ")}</RimoElement></div>
<div className="text-sm text-gray-500 mt-2 flex items-center gap-3"><span className="font-medium text-gray-700">{rimoText(view.getGroupName(view.currentDetailVehicle.vehicleGroupId))}</span>
<span className="h-3 w-[1px] bg-gray-300"></span>
<span className="font-mono text-gray-400">{text("VIN: ")}{rimoText(view.currentDetailVehicle.vin)}</span></div></div>
<div className="grid grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-3 border-l border-gray-100 pl-10 min-w-[520px]"><div><div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">{text("資產歸屬\n                                ")}</div>
<div className="font-semibold text-gray-800 text-sm">{text("\n                                    ")}{rimoText(view.getCompanyName(view.currentDetailVehicle.assetCompanyId))}{text("\n                                ")}</div></div>
<div><div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">{text("當前位置\n                                ")}</div>
<div className="font-semibold text-gray-800 flex items-center gap-1.5 text-sm"><div className="w-2 h-2 rounded-full bg-[color:var(--app-color-primary)]"></div>
{text("\n                                    ")}{rimoText(view.getLocationName(view.currentDetailVehicle))}{text("\n                                ")}</div></div>
<div><div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">{text("當前服務\n                                ")}</div>
<div className="font-semibold text-gray-800 text-sm">{text("\n                                    ")}{rimoText(view.getServiceFullName(view.currentDetailVehicle.currentServiceType))}{text("\n                                ")}</div></div>
<div><div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">{text("當前里程\n                                ")}</div>
<div className="font-bold text-gray-800 font-mono text-xl leading-none">{text("\n                                    ")}{rimoText(view.currentDetailVehicle.mileage ? view.currentDetailVehicle.mileage.toLocaleString() : 0)}{text("\n                                    ")}
<span className="text-xs font-normal text-gray-400 ml-0.5">{text("km")}</span></div></div></div></div>
<div className="flex gap-3 pr-12 shrink-0"><RimoElement kind="el-button" onClick={_event => {
                view.openDialog(view.currentDetailVehicle);
              }} icon="Edit" plain={true}>{text("編輯資料")}</RimoElement>
{view.currentDetailVehicle.operationStatus !== 'MAINTENANCE' ? <><RimoElement kind="el-button" type="warning" plain={true} icon="Tools" onClick={_event => {
                  view.setMaintenance(view.currentDetailVehicle);
                }}>{text("發起維保")}</RimoElement></> : null}
<RimoElement kind="el-button" type="primary" icon="Van">{text("新增調度")}</RimoElement></div></div>
<div className="flex-1 overflow-hidden flex flex-col relative w-full"><RimoElement kind="el-tabs" modelValue={view.activeDetailTab} onModelChange={value => {
              model.write(["activeDetailTab"], value);
            }} className="h-full flex flex-col vehicle-detail-tabs w-full" type="border-card"><RimoElement kind="el-tab-pane" label="車輛概況" name="OVERVIEW" className="h-full overflow-y-auto custom-scroll p-6 w-full"><div className="max-w-7xl mx-auto space-y-6 w-full p-2"><div className="bg-white rounded-lg border border-gray-200 px-5 py-4"><div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div><div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">{text("當前上架")}</div>
<div className="flex items-center gap-2 flex-wrap"><RimoElement kind="el-tag" size="small" type={view.getServiceTagType(view.currentDetailVehicle.currentServiceType)} effect="light">{text("\n                                                    ")}{rimoText(view.getServiceFullName(view.currentDetailVehicle.currentServiceType))}{text("\n                                                ")}</RimoElement>
<span className="text-sm text-gray-500">{text("可服務 ")}{rimoText((view.currentDetailVehicle.serviceTypes || []).length)}{text(" 項")}</span></div></div>
<div><div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">{text("啓用狀態")}</div>
<div className="flex items-center gap-2"><span className={rimoClass(["inline-flex items-center gap-1 text-sm", rimoClass(view.currentDetailVehicle.enabled ? 'text-emerald-600' : 'text-red-500')])}><span className={rimoClass(["w-2 h-2 rounded-full", rimoClass(view.currentDetailVehicle.enabled ? 'bg-emerald-500' : 'bg-red-500')])}></span>
{text("\n                                                    ")}{rimoText(view.currentDetailVehicle.enabled ? '已啓用，對外接受新訂單' : '已停用，暫停接單')}{text("\n                                                ")}</span></div></div>
<div><div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">{text("資產說明")}</div>
<div className="text-sm text-gray-700">{rimoText(view.currentDetailVehicle.owner || '未登記所有人')}{text(" · ")}{rimoText(view.getSourceName(view.currentDetailVehicle.source))}</div></div></div></div>
<RimoElement kind="el-descriptions" title="車輛基礎檔案" column={4} border={true} className="bg-white shadow-sm rounded-lg overflow-hidden"><RimoElement kind="el-descriptions-item" label="顏色"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-gray-200 shadow-sm" style={rimoStyle({
                          backgroundColor: view.currentDetailVehicle.color === '白色' ? '#fff' : view.currentDetailVehicle.color === '黑色' ? '#000' : '#888'
                        })}></div>
{text("\n                                            ")}{rimoText(view.currentDetailVehicle.color)}{text("\n                                        ")}</div></RimoElement>
<RimoElement kind="el-descriptions-item" label="車座">{rimoText(view.currentDetailVehicle.seats)}{text("座")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="燃料"><RimoElement kind="el-tag" size="small" type={view.currentDetailVehicle.fuelType === 'ELECTRIC' ? 'success' : 'warning'} effect="plain">{rimoText(view.currentDetailVehicle.fuelType)}</RimoElement></RimoElement>
<RimoElement kind="el-descriptions-item" label="車門">{rimoText(view.currentDetailVehicle.doors)}{text("門")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="資產所屬車行">{rimoText(view.getCompanyName(view.currentDetailVehicle.assetCompanyId))}</RimoElement>
<RimoElement kind="el-descriptions-item" label="資產來源">{rimoText(view.getSourceName(view.currentDetailVehicle.source))}</RimoElement>
<RimoElement kind="el-descriptions-item" label="登記所有人">{rimoText(view.currentDetailVehicle.owner)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="當前位置" span={2}>{rimoText(view.getLocationName(view.currentDetailVehicle))}</RimoElement>
<RimoElement kind="el-descriptions-item" label="出廠年份">{rimoText(view.currentDetailVehicle.year)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="上牌日期">{text("2023-05-20")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="車架號 (VIN)" span={2}>{rimoText(view.currentDetailVehicle.vin)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="設備CID" span={2}>{rimoText(view.currentDetailVehicle.cid || '未綁定')}</RimoElement></RimoElement>
<div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between mb-3 text-sm" data-rimo-layout="toolbar"><div className="flex items-center gap-2"><div className="w-1 h-4 bg-blue-600 rounded-full"></div>
<h3 className="font-bold text-gray-800">{text("最新車況照片")}</h3>
<RimoElement kind="el-tag" size="small" type="info" effect="plain" className="border-gray-200 text-gray-500">{text("2024-05-01 驗車")}</RimoElement></div>
<RimoElement kind="el-button" link={true} type="primary" size="small" onClick={_event => {
                        model.write(["photoHistoryVisible"], true);
                      }}>{text("查看歷史照片")}</RimoElement></div>
<div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-3"><div className="h-52 rounded-xl overflow-hidden relative group bg-gray-100 border border-gray-200"><RimoImage src={view.getVehiclePhoto(view.currentDetailVehicle)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3"><div className="flex items-center gap-2"><RimoElement kind="el-tag" size="small" type="primary" effect="dark" className="border-none !bg-blue-600/90 shadow-sm">{text("主視圖")}</RimoElement>
<span className="text-white/80 text-xs">{text("最近一次驗車主圖")}</span></div></div></div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2">{rimoEntries(['正前', '右前 45°', '中控儀表', '後排座椅']).map(([img, idx], _itemIndex) => <Fragment key={'compact' + idx}><div key={'compact' + idx} className="h-[102px] rounded-lg overflow-hidden relative group cursor-pointer bg-gray-100 border border-gray-200"><RimoImage src={'https://via.placeholder.com/300x200?text=Photo+' + (idx + 1)} className="w-full h-full object-cover opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105" />
<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 flex justify-center"><span className="text-[10px] text-white/90 font-medium tracking-wide">{rimoText(img)}</span></div></div></Fragment>)}</div></div></div></div></RimoElement>
<RimoElement kind="el-tab-pane" label="訂單記錄" name="ORDERS" className="h-full overflow-y-auto custom-scroll p-6 w-full bg-gray-50/50"><div className="max-w-7xl mx-auto space-y-4"><div className="flex justify-between items-end border-b border-gray-200 pb-2"><RimoElement kind="el-tabs" modelValue={view.activeOrderTab} onModelChange={value => {
                      model.write(["activeOrderTab"], value);
                    }} className="!mb-0" style={rimoStyle("--el-tabs-header-height: 40px;")}><RimoElement kind="el-tab-pane" label="同站租還" name="same_station"></RimoElement>
<RimoElement kind="el-tab-pane" label="甲租乙還" name="one_way"></RimoElement>
<RimoElement kind="el-tab-pane" label="公務車" name="official"></RimoElement></RimoElement>
<div className="flex items-center gap-3 pb-1"><RimoElement kind="el-radio-group" modelValue={view.radioTime} onModelChange={value => {
                        model.write(["radioTime"], value);
                      }} size="small"><RimoElement kind="el-radio-button" label="近半年"></RimoElement>
<RimoElement kind="el-radio-button" label="全部"></RimoElement></RimoElement>
<RimoElement kind="el-input" prefixIcon="Search" placeholder="搜索訂單號/手機號" size="small" style={rimoStyle("width: 200px")}></RimoElement></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><RimoElement kind="el-table" data={view.filteredOrderRecords} style={rimoStyle("width: 100%")} stripe={true} headerCellStyle={{
                      background: 'var(--app-color-surface-subtle)',
                      color: 'var(--app-color-text-secondary)',
                      fontWeight: '600'
                    }} slots={{
                      "empty": _slot => <><RimoElement kind="el-empty" description="該分類下暫無訂單記錄" imageSize={80}></RimoElement></>
                    }}><RimoElement kind="el-table-column" label="訂單信息" minWidth="160" slots={{
                        "default": scope => <><div className="flex flex-col"><a href={'order_detail.html?id=' + scope.row.orderId} className="text-[color:var(--app-color-primary)] font-bold hover:underline mb-0.5 font-mono text-sm">{text("\n                                                        ")}{rimoText(scope.row.orderId)}{text("\n                                                    ")}</a>
<div className="text-xs text-gray-400">{rimoText(scope.row.createTime)}</div></div></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" label="客戶" minWidth="160" slots={{
                        "default": scope => <><div className="flex items-center gap-2"><div className="font-medium text-gray-800">{rimoText(scope.row.customer.name)}{text("\n                                                    ")}</div>
{scope.row.clientType === 'corporate' ? <><RimoElement kind="el-tag" size="small" color="var(--app-color-primary-light-9)" style={rimoStyle("color: var(--app-color-primary); border-color: var(--app-color-primary-light-8);")} effect="light">{text("\n                                                        ")}{rimoText(scope.row.corporate?.shortName)}{text("\n                                                    ")}</RimoElement></> : null}</div>
<div className="text-xs text-gray-500 mt-0.5">{rimoText(scope.row.customer.phone)}{text("\n                                                ")}</div>
{scope.row.customer.level ? <><RimoElement kind="el-tag" size="small" effect="plain" className="mt-1 scale-90 origin-left">{rimoText(scope.row.customer.level)}</RimoElement></> : null}</>
                      }}></RimoElement>
<RimoElement kind="el-table-column" label="行程時間" minWidth="180" slots={{
                        "default": scope => <><div className="text-sm"><div className="flex items-center gap-1 mb-1"><span className="text-gray-400 w-8 text-xs">{text("取車")}</span>
<span className="font-medium text-gray-700">{rimoText(scope.row.schedule.start)}</span></div>
<div className="flex items-center gap-1"><span className="text-gray-400 w-8 text-xs">{text("還車")}</span>
<span className={rimoClass(["font-medium", rimoClass({
                                'text-red-500 font-bold': scope.row.status === 'overdue',
                                'text-gray-700': scope.row.status !== 'overdue'
                              })])}>{text("\n                                                            ")}{rimoText(scope.row.schedule.end)}{text("\n                                                        ")}</span>
{scope.row.status === 'overdue' ? <><RimoElement kind="el-icon" className="text-red-500 ml-1"><RimoIcon name="Warning" /></RimoElement></> : null}</div></div></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" label="取還門店" minWidth="140" slots={{
                        "default": scope => <><div className="text-sm">{scope.row.location.pickup !== scope.row.location.return ? <><div className="flex flex-col gap-1"><div className="flex items-center gap-1"><RimoElement kind="el-tag" size="small" type="warning" effect="dark" className="scale-90 origin-left w-10 text-center px-0">{text("取")}</RimoElement>
<span className="text-yellow-700 font-bold text-xs">{rimoText(scope.row.location.pickup)}</span></div>
<div className="flex items-center gap-1"><RimoElement kind="el-tag" size="small" type="warning" effect="dark" className="scale-90 origin-left w-10 text-center px-0">{text("還")}</RimoElement>
<span className="text-yellow-700 font-bold text-xs">{rimoText(scope.row.location.return)}</span></div></div></> : <><div><div className="flex items-center gap-1 mb-1"><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="scale-90 origin-left w-10 text-center px-0">{text("取")}</RimoElement>
<span className="text-gray-700 text-xs">{rimoText(scope.row.location.pickup)}</span></div>
<div className="flex items-center gap-1"><RimoElement kind="el-tag" size="small" type="info" effect="plain" className="scale-90 origin-left w-10 text-center px-0">{text("還")}</RimoElement>
<span className="text-gray-700 text-xs">{rimoText(scope.row.location.return)}</span></div></div></>}</div></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" label="金額" minWidth="100" align="right" slots={{
                        "default": scope => <><div className="font-bold text-gray-800 font-mono">{text("¥")}{rimoText(scope.row.amount.toLocaleString())}</div>
{scope.row.status === 'reserved' || scope.row.status === 'pending_payment' ? <><div className="text-xs text-orange-400">{text("\n                                                    待支付")}</div></> : null}</>
                      }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" minWidth="100" align="center" slots={{
                        "default": ({
                          row
                        }) => <><RimoElement kind="el-tag" type={view.tableStatusConfig(row.status).type} color={view.tableStatusConfig(row.status).color} style={rimoStyle(view.tableStatusConfig(row.status).color ? {
                            color: '#fff',
                            borderColor: view.tableStatusConfig(row.status).color
                          } : {})} effect="light" round={true} size="small">{text("\n                                                    ")}{rimoText(view.tableStatusConfig(row.status).text)}{text("\n                                                ")}</RimoElement></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" minWidth="80" align="center" fixed="right" slots={{
                        "default": _scope => <><RimoElement kind="el-button" link={true} type="primary" size="small">{text("詳情")}</RimoElement></>
                      }}></RimoElement></RimoElement></div></div></RimoElement>
<RimoElement kind="el-tab-pane" label="營運軌跡" name="OPERATIONS" className="h-full overflow-y-auto custom-scroll p-6 w-full"><div className="max-w-7xl mx-auto space-y-4"><div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm" data-rimo-layout="toolbar"><div className="flex items-center gap-4"><h3 className="font-bold text-gray-800 text-base">{text("出入站流水記錄")}</h3>
<RimoElement kind="el-radio-group" modelValue={view.radioTime} onModelChange={value => {
                        model.write(["radioTime"], value);
                      }} size="small"><RimoElement kind="el-radio-button" label="近7天"></RimoElement>
<RimoElement kind="el-radio-button" label="近30天"></RimoElement>
<RimoElement kind="el-radio-button" label="全部"></RimoElement></RimoElement></div>
<div className="flex items-center gap-2"><RimoElement kind="el-input" prefixIcon="Search" placeholder="搜索單號/門店" size="small" style={rimoStyle("width: 200px")}></RimoElement>
<RimoElement kind="el-button" icon="Download" size="small" plain={true}>{text("導出")}</RimoElement></div></div>
<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"><RimoElement kind="el-table" data={[{
                      time: '2024-05-03 14:00',
                      type: 'IN',
                      station: '新北板橋車站 B1 停車區',
                      reason: '租賃還車',
                      orderNo: '#ORD-20240501-A2',
                      mileage: '12,850 km',
                      operator: '王怡君'
                    }, {
                      time: '2024-05-01 10:00',
                      type: 'OUT',
                      station: '臺北松山機場第一停車場',
                      reason: '租賃出車',
                      orderNo: '#ORD-20240501-A2',
                      mileage: '12,630 km',
                      operator: '陳柏翰'
                    }, {
                      time: '2024-04-28 09:30',
                      type: 'IN',
                      station: '臺中高鐵 P1 停車區',
                      reason: '內部調度',
                      orderNo: '#DSP-009',
                      mileage: '12,580 km',
                      operator: '林家豪'
                    }, {
                      time: '2024-04-28 08:00',
                      type: 'OUT',
                      station: 'RIMO 新北板橋旗艦店',
                      reason: '內部調度',
                      orderNo: '#DSP-009',
                      mileage: '12,540 km',
                      operator: '林家豪'
                    }]} stripe={true} size="default" style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="time" label="時間" width="160" sortable={true} slots={{
                        "default": ({
                          row
                        }) => <><span className="font-mono text-gray-600">{rimoText(row.time)}</span></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="類型" width="100" slots={{
                        "default": ({
                          row
                        }) => <><RimoElement kind="el-tag" type={row.type === 'IN' ? 'success' : 'primary'} effect="plain" size="small" className="w-16 text-center">{text("\n                                                    ")}{rimoText(row.type === 'IN' ? '入站' : '出站')}{text("\n                                                ")}</RimoElement></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="station" label="站點/停車場" minWidth="180" slots={{
                        "default": ({
                          row
                        }) => <><span className="font-bold text-gray-700">{rimoText(row.station)}</span></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="業務類型" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="orderNo" label="關聯單號" width="160" slots={{
                        "default": ({
                          row
                        }) => <><RimoElement kind="el-link" type="primary" underline={false}>{rimoText(row.orderNo)}</RimoElement></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="mileage" label="里程" width="120" align="right" slots={{
                        "default": ({
                          row
                        }) => <><span className="font-mono">{rimoText(row.mileage)}</span></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="100"></RimoElement></RimoElement></div></div></RimoElement>
<RimoElement kind="el-tab-pane" label="健康檔案" name="HEALTH" className="h-full overflow-y-auto custom-scroll p-6 w-full"><div className="space-y-6 max-w-7xl mx-auto"><RimoElement kind="el-card" shadow="never" className="!border-gray-200" slots={{
                    "header": _slot => <><div className="flex justify-between items-center" data-rimo-layout="toolbar"><span className="font-bold flex items-center gap-2"><RimoElement kind="el-icon" className="text-orange-500"><RimoIcon name="Tools" /></RimoElement>
{text(" 維保記錄")}</span>
<RimoElement kind="el-button" type="primary" link={true} icon="Plus">{text("新增記錄")}</RimoElement></div></>
                  }}><RimoElement kind="el-table" data={view.mockMaintenanceData} emptyText="暫無維保記錄" border={true} stripe={true} size="small"><RimoElement kind="el-table-column" prop="date" label="維保日期" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="維保類型" width="100" slots={{
                        "default": ({
                          row
                        }) => <><RimoElement kind="el-tag" size="small">{rimoText(row.type)}</RimoElement></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="items" label="項目內容"></RimoElement>
<RimoElement kind="el-table-column" prop="cost" label="金額" width="100" slots={{
                        "default": ({
                          row: _row
                        }) => <>{text("N/A")}</>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="garage" label="維修廠"></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="經辦人" width="100"></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-card" shadow="never" className="!border-red-100 bg-red-50/10" slots={{
                    "header": _slot => <><div className="flex justify-between items-center border-red-50"><span className="font-bold text-red-600 flex items-center gap-2"><RimoElement kind="el-icon"><RimoIcon name="WarningFilled" /></RimoElement>
{text(" 事故/出險記錄")}</span></div></>
                  }}><RimoElement kind="el-table" data={view.mockAccidentData} emptyText="暫無事故記錄" border={true} stripe={true} size="small"><RimoElement kind="el-table-column" prop="date" label="出險日期" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="desc" label="事故描述"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="理賠狀態" width="100" slots={{
                        "default": ({
                          row
                        }) => <><RimoElement kind="el-tag" type={row.status === '已結案' ? 'success' : 'warning'} size="small">{rimoText(row.status)}</RimoElement></>
                      }}></RimoElement>
<RimoElement kind="el-table-column" prop="cost" label="定損金額" width="100"></RimoElement></RimoElement></RimoElement></div></RimoElement>
<RimoElement kind="el-tab-pane" label="系統日誌" name="LOGS" className="h-full overflow-y-auto custom-scroll p-6 w-full"><div className="bg-white rounded-lg border border-gray-200 overflow-hidden"><RimoElement kind="el-table" data={view.mockSystemLogs} emptyText="加載中..." stripe={true} size="small" style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" prop="time" label="時間" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="user" label="操作人" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="action" label="操作內容"></RimoElement>
<RimoElement kind="el-table-column" prop="ip" label="IP地址"></RimoElement></RimoElement></div></RimoElement></RimoElement></div></div></>}</RimoElement></RimoRoot>;
}