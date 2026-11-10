import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './tbox-management.css';
import createPageState from './tbox-management-model.js';
export default function TboxManagementBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="tbox-management" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end shrink-0" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("車機設定中心")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理租戶下所有車機設備，執行車輛換綁與授權驗證操作。")}</p></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 shrink-0 flex justify-between items-center gap-6 relative overflow-hidden" data-rimo-layout="filters"><div className="flex gap-3 z-10 flex-1 min-w-0 max-w-[680px]"><RimoElement kind="el-input" modelValue={view.searchQuery} onModelChange={value => {
            model.write(["searchQuery"], value);
          }} placeholder="搜索 CID / SIM卡 / 綁定車牌" prefixIcon="Search" clearable={true} className="w-full"></RimoElement>
<RimoElement kind="el-select" modelValue={view.statusFilter} onModelChange={value => {
            model.write(["statusFilter"], value);
          }} placeholder="狀態篩選" style={rimoStyle("width: 140px;")}><RimoElement kind="el-option" label="所有狀態" value="ALL"></RimoElement>
<RimoElement kind="el-option" label="已綁定" value="BOUND"></RimoElement>
<RimoElement kind="el-option" label="未綁定 (閒置)" value="UNBOUND"></RimoElement></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} icon="Download" onClick={event => {
            view.handleExport?.(event);
          }}>{text("導出")}</RimoElement></div>
<div className="flex gap-8 z-10 shrink-0"><div><div className="text-xs text-gray-500 font-medium mb-1">{text("租戶名下車機總數")}</div>
<div className="text-2xl font-bold text-gray-800">{rimoText(view.devices.length)}{text(" ")}
<span className="text-sm font-normal text-gray-400">{text("臺")}</span></div></div>
<div className="w-px bg-gray-200"></div>
<div><div className="text-xs text-gray-500 font-medium mb-1">{text("已綁定車輛")}</div>
<div className="text-2xl font-bold text-blue-600">{rimoText(view.boundCount)}{text(" ")}
<span className="text-sm font-normal text-gray-400">{text("臺")}</span></div></div>
<div className="w-px bg-gray-200"></div>
<div><div className="text-xs text-gray-500 font-medium mb-1">{text("在庫閒置 (未綁定)")}</div>
<div className="text-2xl font-bold text-orange-500">{rimoText(view.unboundCount)}{text(" ")}
<span className="text-sm font-normal text-gray-400">{text("臺")}</span></div></div></div></div>
<div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden" data-rimo-layout="list"><RimoElement kind="el-table" data={view.filteredDevices} style={rimoStyle("width: 100%; height: 100%;")} stripe={true}><RimoElement kind="el-table-column" label="硬件身份 (CID & SIM)" minWidth="200" fixed="left" slots={{
            "default": ({
              row
            }) => <><div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"><RimoElement kind="el-icon" className="text-blue-500"><RimoIcon name="Cpu" /></RimoElement></div>
<div><div className="font-bold text-sm text-gray-800 font-mono">{rimoText(row.cid)}</div>
<div className="text-xs text-gray-500 mt-0.5">{text("SIM: ")}
<span className="font-mono">{rimoText(row.sim)}</span></div></div></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="型號與保固" minWidth="140" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-700">{rimoText(row.model)}</div>
<div className={rimoClass(["text-xs mt-0.5", rimoClass(view.isExpiringSoon(row.warrantyDate) ? 'text-red-500 font-bold' : 'text-gray-400')])}>{text("\n                                    過保: ")}{rimoText(row.warrantyDate)}{text("\n                                ")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="系統版本" minWidth="120" slots={{
            "default": ({
              row
            }) => <><div className="text-xs text-gray-600 font-mono flex flex-col gap-0.5"><span title="基帶/核心版本號(V1)">{text("V1: ")}{rimoText(row.version1)}</span>
<span title="應用程序版本號(V2)">{text("V2: ")}{rimoText(row.version2)}</span></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="電子鑰匙 (iButton)" minWidth="160" slots={{
            "default": ({
              row
            }) => <>{row.supportsIbutton ? <><div className="flex flex-col gap-0.5"><RimoElement kind="el-tag" size="small" type="success" effect="plain" className="w-max">{text("支持")}</RimoElement>
{row.ibuttonCode ? <><span className="text-xs text-gray-500 font-mono mt-1">{text("編碼: ")}{rimoText(row.ibuttonCode)}</span></> : <><span className="text-xs text-gray-300 mt-1">{text("未配對實體鑰匙")}</span></>}</div></> : <><div><RimoElement kind="el-tag" size="small" type="info" effect="plain">{text("硬件不支持")}</RimoElement></div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="近期通訊" minWidth="170" slots={{
            "default": ({
              row
            }) => <><div className="text-xs text-gray-600 flex flex-col gap-1"><div className="flex items-center justify-between"><span className="text-gray-400">{text("上電:")}</span>
<span>{rimoText(row.powerOnTime || '-')}</span></div>
<div className="flex items-center justify-between"><span className="text-gray-400">{text("最後回傳:")}</span>
<span className={rimoClass(view.isOnline(row.lastReturnTime) ? 'text-emerald-600 font-medium' : 'text-red-500')}>{text("\n                                            ")}{rimoText(row.lastReturnTime || '設備未激活')}{text("\n                                        ")}</span></div></div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="目前綁定車輛" minWidth="140" align="center" fixed="right" slots={{
            "default": ({
              row
            }) => <>{row.boundPlate ? <><div className="flex flex-col items-center gap-1"><RimoElement kind="el-tag" type="primary" effect="dark" className="font-bold tracking-wider cursor-pointer shadow-sm hover:scale-105 transition-transform">{rimoText(row.boundPlate)}</RimoElement>
<span className="text-[10px] text-gray-400">{rimoText(row.vehicleModel)}</span></div></> : <><div><RimoElement kind="el-tag" type="warning" effect="light" className="border-dashed cursor-not-allowed">{text("\n                                        在庫閒置\n                                    ")}</RimoElement></div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="130" fixed="right" align="center" slots={{
            "default": ({
              row
            }) => <><div className="flex flex-col gap-2">{!row.boundPlate ? <><RimoElement kind="el-button" type="primary" size="small" plain={true} onClick={_event => {
                    view.openBindDialog(row);
                  }} className="!m-0">{text("綁定車輛")}</RimoElement></> : <><><RimoElement kind="el-button" type="primary" size="small" plain={true} onClick={_event => {
                      view.openBindDialog(row, true);
                    }} className="!m-0">{text("更換車輛")}</RimoElement>
<RimoElement kind="el-button" type="danger" size="small" text={true} onClick={_event => {
                      view.unbindVehicle(row);
                    }} className="!m-0">{text("強制解綁")}</RimoElement></></>}</div></>
          }}></RimoElement></RimoElement>
<div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50"><RimoElement kind="el-pagination" background={true} layout="total, prev, pager, next" total={view.filteredDevices.length} pageSize={10}></RimoElement></div></div></div><RimoElement kind="el-dialog" modelValue={view.bindDialogVisible} onModelChange={value => {
      model.write(["bindDialogVisible"], value);
    }} title={view.isChanging ? '車機換綁操作' : '車機綁定操作'} width="500px" destroyOnClose={true} className="tbox-management-overlay" slots={{
      "footer": _slot => <><div className="flex justify-between items-center w-full"><div className="text-xs text-gray-400">{text("\n                        請確保現場硬件安裝完畢後再進行線上綁定\n                    ")}</div>
<div><RimoElement kind="el-button" onClick={_event => {
              model.write(["bindDialogVisible"], false);
            }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" disabled={!view.targetPlate} onClick={event => {
              view.confirmBinding?.(event);
            }} loading={view.isSubmitting}>{text("\n                            確認執行\n                        ")}</RimoElement></div></div></>
    }}>{() => <>{view.selectedDevice ? <><div className="pb-2"><div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 mb-5"><RimoElement kind="el-icon" className="text-blue-500 text-xl mt-0.5"><RimoIcon name="WarnTriangleFilled" /></RimoElement>
<div className="text-sm"><div className="text-blue-800 font-bold mb-1">{text("目標操作車機：")}
<span className="font-mono">{rimoText(view.selectedDevice.cid)}</span></div>
<div className="text-blue-600">{text("請注意，換綁操作將使該車機取代目標車輛上原有的硬件授權信息。")}</div></div></div>
<RimoElement kind="el-form" labelPosition="top">{view.isChanging ? <><RimoElement kind="el-form-item" label="目前綁定的車輛"><RimoElement kind="el-input" disabled={true} value={view.selectedDevice.boundPlate + ' (' + view.selectedDevice.vehicleModel + ')'}></RimoElement></RimoElement></> : null}
<RimoElement kind="el-form-item" label={view.isChanging ? '選擇新目標車輛' : '選擇載體車輛'}><RimoElement kind="el-select" modelValue={view.targetPlate} onModelChange={value => {
                  model.write(["targetPlate"], value);
                }} filterable={true} placeholder="請搜索車牌號碼 (如 RAB-1234)" className="w-full" noMatchText="未找到空缺車輛">{rimoEntries(view.unboundVehicles).map(([v], _itemIndex) => <Fragment key={v.plate}><RimoElement kind="el-option" key={v.plate} label={v.plate + ' - ' + v.model} value={v.plate}><span className="float-left font-bold">{rimoText(v.plate)}</span>
<span className="float-right text-gray-400 text-xs">{rimoText(v.model)}</span></RimoElement></Fragment>)}</RimoElement></RimoElement></RimoElement></div></> : null}</>}</RimoElement></RimoRoot>;
}