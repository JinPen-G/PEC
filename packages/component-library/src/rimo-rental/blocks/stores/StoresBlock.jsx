import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './stores.css';
import createPageState from './stores-model.js';
export default function StoresBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="stores" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("門市管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理客戶面對的門市資料、營業時間及門市租車服務。")}</p></div>
{view.canCreateStore ? <><RimoElement kind="el-button" type="primary" size="large" onClick={_event => {
            view.openDialog();
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("新增門市\n      ")}</RimoElement></> : null}</div>
<div className="summary-grid" data-rimo-layout="summary">{rimoEntries(view.summaryCards).map(([card], _itemIndex) => <Fragment key={card.key}><div key={card.key} className={rimoClass(["summary-card", rimoClass({
            'is-active': view.activeSummaryFilter === card.key
          })])} onClick={_event => {
            view.applySummaryFilter(card.key);
          }} data-rimo-layout="stat"><div className="summary-label">{rimoText(card.label)}</div>
<div className="summary-value">{rimoText(card.value)}</div></div></Fragment>)}</div>
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm" data-rimo-layout="list"><RimoElement kind="el-table" data={view.pagedRows} tableLayout="fixed" style={rimoStyle("width:100%")} slots={{
          "empty": _slot => <><RimoElement kind="el-empty" description="暫無符合條件的門市"></RimoElement></>,
          "toolbar": _slot => <><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
              model.write(["filters", "keyword"], value);
            }} placeholder="搜索門市編號/名稱/地址/負責人" clearable={true} prefixIcon="Search" style={rimoStyle("width: 290px")}></RimoElement>
{view.permissionDemoMode === 'TENANT_MANAGE' || view.permissionDemoMode === 'VIEW_ONLY' ? <><RimoElement kind="el-select" modelValue={view.filters.companyId} onModelChange={value => {
                model.write(["filters", "companyId"], value);
              }} placeholder="所屬車行" clearable={true} filterable={true} style={rimoStyle("width: 210px")}>{rimoEntries(view.companyOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></> : <><RimoElement kind="el-tag" className="permission-scope-tag" type="info" effect="plain">{rimoText(view.permissionScopeText)}</RimoElement></>}
<RimoElement kind="el-select" modelValue={view.filters.storeRentalStatus} onModelChange={value => {
              model.write(["filters", "storeRentalStatus"], value);
            }} placeholder="門市租車狀態" clearable={true} style={rimoStyle("width: 160px")}><RimoElement kind="el-option" label="營業中" value="ACTIVE"></RimoElement>
<RimoElement kind="el-option" label="已暫停" value="SUSPENDED"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
              model.write(["filters", "status"], value);
            }} placeholder="門市狀態" clearable={true} style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="啓用中" value="ACTIVE"></RimoElement>
<RimoElement kind="el-option" label="已停用" value="INACTIVE"></RimoElement></RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} aria-label="重置篩選" onClick={event => {
                view.resetFilters?.(event);
              }} icon="Refresh" data-rimo-filter-reset="true"></RimoElement></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
              view.exportData?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text("導出")}</RimoElement></>
        }}><RimoElement kind="el-table-column" label="門市編號與名稱" minWidth="230" slots={{
            "default": ({
              row
            }) => <><div className="table-primary">{rimoText(row.name)}</div>
<div className="table-secondary">{rimoText(row.code)}{text(" · ")}{rimoText(row.address)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="所屬車行" minWidth="190" slots={{
            "default": ({
              row
            }) => <>{rimoText(view.getCompanyName(row.companyId))}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="櫃檯服務" width="150" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(view.formatTimeRange(row.counterServiceHours))}</div>
<div className="table-secondary">{rimoText(row.manualHandover ? '人工交車' : '非人工交車')}{text(" · ")}{rimoText(row.manualInspection ? '人工驗車' : '非人工驗車')}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="門市租車" width="120" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" size="small" type={row.storeRentalStatus === 'ACTIVE' ? 'success' : 'warning'} effect="plain">{text("\n              ")}{rimoText(row.storeRentalStatus === 'ACTIVE' ? '營業中' : '已暫停')}{text("\n            ")}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="履約據點" width="150" slots={{
            "default": ({
              row
            }) => <><div>{text("門市租車 ")}{rimoText(row.rentalStationCount)}{text(" 個")}</div>
<div className="table-secondary">{text("24小時自助 ")}{rimoText(row.selfServiceStationCount)}{text(" 個")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="當前可售" width="110" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" size="small" type={view.isStoreSellable(row) ? 'success' : 'info'}>{text("\n              ")}{rimoText(view.isStoreSellable(row) ? '可預約' : '不可預約')}{text("\n            ")}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="負責人" minWidth="145" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(row.contactName)}</div>
<div className="table-secondary">{rimoText(row.contactPhone)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="門市狀態" width="100" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-switch" modelValue={row.isActive} onModelChange={value => {
                model.assign(row, "isActive", value);
              }} size="small" style={rimoStyle("--el-switch-on-color:#10b981")} disabled={!view.canManageRow(row)} onChange={event => {
                (value => view.changeStatus(row, value))?.(event);
              }}></RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="100" align="right" fixed="right" slots={{
            "default": ({
              row
            }) => <>{view.canManageRow(row) ? <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                  view.openDialog(row);
                }}>{text("編輯")}</RimoElement></> : <><span className="text-sm text-gray-400">{text("只讀")}</span></>}</>
          }}></RimoElement></RimoElement>
<div className="flex justify-end p-4 border-t border-gray-100"><RimoElement kind="el-pagination" currentPage={view.currentPage} onCurrentPageChange={value => {
            model.write(["currentPage"], value);
          }} pageSize={view.pageSize} onPageSizeChange={value => {
            model.write(["pageSize"], value);
          }} pageSizes={[10, 20, 50]} total={view.filteredRows.length} layout="total, sizes, prev, pager, next, jumper" background={true} small={true}></RimoElement></div></div>
<div className="prototype-permission-switcher" aria-label="權限演示" data-rimo-layout="permissions"><span className="prototype-permission-label">{text("權限演示")}</span>
<RimoElement kind="el-radio-group" modelValue={view.permissionDemoMode} onModelChange={value => {
          model.write(["permissionDemoMode"], value);
        }} size="small" onChange={event => {
          view.setPermissionDemoMode?.(event);
        }}>{rimoEntries(view.permissionDemoOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-radio-button" key={item.value} label={item.value}>{text("\n          ")}{rimoText(item.label)}{text("\n        ")}</RimoElement></Fragment>)}</RimoElement></div></div><RimoElement kind="el-dialog" modelValue={view.dialogVisible} onModelChange={value => {
      model.write(["dialogVisible"], value);
    }} title={view.editingId ? '編輯門市' : '新增門市'} width="780px" destroyOnClose={true} slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["dialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.save?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" modelRef={model.ref("formRef")} model={view.form} rules={view.rules} labelPosition="top"><div className="grid grid-cols-2 gap-x-5" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="所屬車行" prop="companyId"><RimoElement kind="el-select" modelValue={view.form.companyId} onModelChange={value => {
                model.write(["form", "companyId"], value);
              }} filterable={true} className="w-full" disabled={!!view.editingId || view.permissionDemoMode !== 'TENANT_MANAGE'}>{rimoEntries(view.editableCompanyOptions).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="門市編號" prop="code"><RimoElement kind="el-input" modelValue={view.form.code} onModelChange={value => {
                model.write(["form", "code"], value);
              }} disabled={!!view.editingId} placeholder="例如 ST-TPE-001"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="門市名稱" prop="name"><RimoElement kind="el-input" modelValue={view.form.name} onModelChange={value => {
                model.write(["form", "name"], value);
              }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="門市狀態"><RimoElement kind="el-switch" modelValue={view.form.isActive} onModelChange={value => {
                model.write(["form", "isActive"], value);
              }} activeText="啓用" inactiveText="停用"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="門市地址" prop="address" className="col-span-2"><RimoElement kind="el-input" modelValue={view.form.address} onModelChange={value => {
                model.write(["form", "address"], value);
              }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="負責人" prop="contactName"><RimoElement kind="el-input" modelValue={view.form.contactName} onModelChange={value => {
                model.write(["form", "contactName"], value);
              }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="聯繫電話" prop="contactPhone"><RimoElement kind="el-input" modelValue={view.form.contactPhone} onModelChange={value => {
                model.write(["form", "contactPhone"], value);
              }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="門市租車營業狀態"><RimoElement kind="el-radio-group" modelValue={view.form.storeRentalStatus} onModelChange={value => {
                model.write(["form", "storeRentalStatus"], value);
              }}><RimoElement kind="el-radio" label="ACTIVE">{text("營業中")}</RimoElement>
<RimoElement kind="el-radio" label="SUSPENDED">{text("暫停")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="櫃檯服務時間" prop="counterServiceHours"><RimoElement kind="el-time-picker" isRange={true} modelValue={view.form.counterServiceHours} onModelChange={value => {
                model.write(["form", "counterServiceHours"], value);
              }} className="w-full" rangeSeparator="至" startPlaceholder="開始時間" endPlaceholder="結束時間"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="現場作業" className="col-span-2"><RimoElement kind="el-checkbox" modelValue={view.form.manualHandover} onModelChange={value => {
                model.write(["form", "manualHandover"], value);
              }}>{text("人工交車")}</RimoElement>
<RimoElement kind="el-checkbox" modelValue={view.form.manualInspection} onModelChange={value => {
                model.write(["form", "manualInspection"], value);
              }}>{text("人工驗車")}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="備註" className="col-span-2"><RimoElement kind="el-input" modelValue={view.form.remark} onModelChange={value => {
                model.write(["form", "remark"], value);
              }} type="textarea" rows={3} maxLength="200" showWordLimit={true}></RimoElement></RimoElement></div></RimoElement></>}</RimoElement></RimoRoot>;
}