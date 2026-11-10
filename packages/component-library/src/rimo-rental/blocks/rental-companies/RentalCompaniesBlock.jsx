import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './rental-companies.css';
import createPageState from './rental-companies-model.js';
export default function RentalCompaniesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="rental-companies" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("車行管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理車輛資產歸屬、同車行調度範圍及下屬門市。")}</p></div>
{view.canCreateCompany ? <><RimoElement kind="el-button" type="primary" size="large" onClick={_event => {
            view.openDialog();
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("新增車行\n      ")}</RimoElement></> : null}</div>
<div className="summary-grid" data-rimo-layout="summary">{rimoEntries(view.summaryCards).map(([card], _itemIndex) => <Fragment key={card.key}><div key={card.key} className={rimoClass(["summary-card", rimoClass({
            'is-active': view.activeSummaryFilter === card.key
          })])} onClick={_event => {
            view.applySummaryFilter(card.key);
          }} data-rimo-layout="stat"><div className="summary-label">{rimoText(card.label)}</div>
<div className="summary-value">{rimoText(card.value)}</div></div></Fragment>)}</div>
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm" data-rimo-layout="list"><RimoElement kind="el-table" data={view.pagedRows} tableLayout="fixed" style={rimoStyle("width:100%")} slots={{
          "empty": _slot => <><RimoElement kind="el-empty" description="暫無符合條件的車行"></RimoElement></>,
          "toolbar": _slot => <><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
              model.write(["filters", "keyword"], value);
            }} placeholder="搜索車行編號/名稱/統編/負責人" clearable={true} prefixIcon="Search" style={rimoStyle("width: 300px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
              model.write(["filters", "status"], value);
            }} placeholder="營運狀態" clearable={true} style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="營運中" value="ACTIVE"></RimoElement>
<RimoElement kind="el-option" label="已停用" value="INACTIVE"></RimoElement></RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} aria-label="重置篩選" onClick={event => {
                view.resetFilters?.(event);
              }}><RimoElement kind="el-icon"><RimoIcon name="Refresh" /></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
              view.exportData?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text("導出")}</RimoElement>
<span className="ml-auto text-sm text-gray-500">{text("共 ")}{rimoText(view.filteredRows.length)}{text(" 家車行")}</span></>
        }}><RimoElement kind="el-table-column" label="車行編號與名稱" minWidth="230" slots={{
            "default": ({
              row
            }) => <><div className="table-primary">{rimoText(row.name)}</div>
<div className="table-secondary">{rimoText(row.code)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="營運主體" minWidth="210" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(row.legalName)}</div>
<div className="table-secondary">{text("統編 ")}{rimoText(row.taxId)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="組織規模" width="150" slots={{
            "default": ({
              row
            }) => <><div>{text("門市 ")}{rimoText(row.storeCount)}{text(" 家")}</div>
<div className="table-secondary">{text("據點 ")}{rimoText(row.stationCount)}{text(" 個")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="車輛資產" width="120" slots={{
            "default": ({
              row
            }) => <><span className="font-semibold">{rimoText(row.vehicleCount)}</span>
{text(" 臺")}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="調度邊界" width="130" slots={{
            "default": _slot => <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("僅同車行")}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="負責人" minWidth="160" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(row.contactName)}</div>
<div className="table-secondary">{rimoText(row.contactPhone)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="營運狀態" width="110" slots={{
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
    }} title={view.editingId ? '編輯車行' : '新增車行'} width="720px" destroyOnClose={true} slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["dialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.save?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" modelRef={model.ref("formRef")} model={view.form} rules={view.rules} labelPosition="top"><div className="grid grid-cols-2 gap-x-5" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="車行編號" prop="code"><RimoElement kind="el-input" modelValue={view.form.code} onModelChange={value => {
                model.write(["form", "code"], value);
              }} disabled={!!view.editingId} placeholder="例如 RC-TPE-01"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車行名稱" prop="name"><RimoElement kind="el-input" modelValue={view.form.name} onModelChange={value => {
                model.write(["form", "name"], value);
              }} placeholder="請輸入車行名稱"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="營運主體名稱" prop="legalName"><RimoElement kind="el-input" modelValue={view.form.legalName} onModelChange={value => {
                model.write(["form", "legalName"], value);
              }} placeholder="請輸入公司或組織名稱"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="統一編號" prop="taxId"><RimoElement kind="el-input" modelValue={view.form.taxId} onModelChange={value => {
                model.write(["form", "taxId"], value);
              }} maxLength="8" placeholder="8位統一編號"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="負責人" prop="contactName"><RimoElement kind="el-input" modelValue={view.form.contactName} onModelChange={value => {
                model.write(["form", "contactName"], value);
              }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="聯繫電話" prop="contactPhone"><RimoElement kind="el-input" modelValue={view.form.contactPhone} onModelChange={value => {
                model.write(["form", "contactPhone"], value);
              }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="Email" className="col-span-2"><RimoElement kind="el-input" modelValue={view.form.email} onModelChange={value => {
                model.write(["form", "email"], value);
              }}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="營運狀態"><RimoElement kind="el-switch" modelValue={view.form.isActive} onModelChange={value => {
                model.write(["form", "isActive"], value);
              }} activeText="營運中" inactiveText="停用"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="調度邊界"><RimoElement kind="el-input" modelValue="僅限同車行範圍" disabled={true}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="備註" className="col-span-2"><RimoElement kind="el-input" modelValue={view.form.remark} onModelChange={value => {
                model.write(["form", "remark"], value);
              }} type="textarea" rows={3} maxLength="200" showWordLimit={true}></RimoElement></RimoElement></div></RimoElement></>}</RimoElement></RimoRoot>;
}