import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-dispatch-schedule.css';
function createPageState(model) {
  const _document = model.document;
  const _window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const _themeColor = () => model.theme();
  const _themeColorLight = level => model.theme(level);
  const _themeRGBA = alpha => model.themeAlpha(alpha);
  const _feedback = {
    ElMessage: Object.assign(message => model.notify('info', message), {
      success: message => model.notify('success', message),
      warning: message => model.notify('warning', message),
      error: message => model.notify('error', message),
      info: message => model.notify('info', message)
    }),
    ElMessageBox: {
      confirm: (message, title) => model.confirm(message, title),
      alert: (message, title) => model.confirm(message, title)
    }
  };
  function pageSetup() {
    const {
      record: reactive,
      cell: ref
    } = model;
    const currentUserRole = ref('HEADQUARTERS');
    const viewMode = ref('week');
    const selectedWeek = ref('');
    const filters = reactive({
      station: '',
      model: '',
      type: '',
      plate: ''
    });
    const legends = [{
      name: '全部',
      color: '#cbd5e1'
    }, {
      name: '預約中',
      color: '#dbeafe'
    }, {
      name: '用車中',
      color: '#fef3c7'
    }, {
      name: '已還車',
      color: '#dcfce7'
    }, {
      name: '調度',
      color: 'var(--app-color-primary-light-9)'
    }];
    const gridDates = [{
      day: '06/10',
      week: '週三'
    }, {
      day: '06/11',
      week: '週四'
    }, {
      day: '06/12',
      week: '週五'
    }, {
      day: '06/13',
      week: '週六'
    }, {
      day: '06/14',
      week: '週日'
    }, {
      day: '06/15',
      week: '週一'
    }, {
      day: '06/16',
      week: '週二'
    }];
    const dispatchRows = [{
      plate: 'XLY-8008',
      model: 'Toyota Corolla Cross',
      station: '八輪測試-寶龍用車點',
      cells: [{
        title: '王怡君',
        time: '09:00 - 18:00',
        bg: '#DBEAFE',
        border: '#60A5FA'
      }, null, {
        title: '客戶拜訪',
        time: '10:00 - 15:30',
        bg: '#FEF3C7',
        border: '#F59E0B'
      }, null, null, {
        title: '跨區調度',
        time: '14:00 - 18:00',
        bg: 'var(--app-color-primary-light-9)',
        border: '#38BDF8'
      }, null]
    }, {
      plate: 'XLY-8001',
      model: 'Lexus ES 250',
      station: '八輪測試-啓迪用車點',
      cells: [null, {
        title: '陳建宏',
        time: '08:30 - 20:00',
        bg: '#FEF3C7',
        border: '#F59E0B'
      }, null, {
        title: '會議接送',
        time: '13:00 - 17:00',
        bg: '#DCFCE7',
        border: '#22C55E'
      }, null, null, null]
    }, {
      plate: 'XLY-8004',
      model: 'Toyota Camry',
      station: '八輪測試-寶龍用車點',
      cells: [null, null, {
        title: '林雅婷',
        time: '13:00 - 17:00',
        bg: '#DBEAFE',
        border: '#60A5FA'
      }, null, {
        title: '主管審批',
        time: '10:00 - 15:00',
        bg: 'var(--app-color-primary-light-9)',
        border: '#38BDF8'
      }, null, null]
    }, {
      plate: 'XLY-8010',
      model: 'Honda CR-V',
      station: '八輪測試-人工智能用車點',
      cells: [null, {
        title: '黃柏翰',
        time: '10:00 - 15:00',
        bg: '#DBEAFE',
        border: '#60A5FA'
      }, null, null, {
        title: '跨區調度',
        time: '14:00 - 18:00',
        bg: 'var(--app-color-primary-light-9)',
        border: '#38BDF8'
      }, null, null]
    }];
    const refreshHandel = () => {
      filters.station = '';
      filters.model = '';
      filters.type = '';
      filters.plate = '';
    };
    return {
      currentUserRole,
      viewMode,
      selectedWeek,
      filters,
      legends,
      gridDates,
      dispatchRows,
      refreshHandel
    };
  }
  return pageSetup();
}
export default function EnterpriseDispatchScheduleBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-dispatch-schedule" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="car-control-page"><div className="car-control-page__header" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("排程表")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("可視化管理車輛排班、調度與衝突處理。")}</p></div>
<div className="flex items-center gap-3 flex-wrap justify-end"><RimoElement kind="el-button-group" className="shadow-sm"><RimoElement kind="el-button" type={view.viewMode === 'day' ? 'primary' : 'default'} onClick={_event => {
                model.write(["viewMode"], 'day');
              }}>{text("日")}</RimoElement>
<RimoElement kind="el-button" type={view.viewMode === 'week' ? 'primary' : 'default'} onClick={_event => {
                model.write(["viewMode"], 'week');
              }}>{text("周")}</RimoElement>
<RimoElement kind="el-button" type={view.viewMode === 'month' ? 'primary' : 'default'} onClick={_event => {
                model.write(["viewMode"], 'month');
              }}>{text("月")}</RimoElement></RimoElement>
<RimoElement kind="el-date-picker" modelValue={view.selectedWeek} onModelChange={value => {
              model.write(["selectedWeek"], value);
            }} type="week" format="YYYY 第 ww 周" placeholder="選擇周" style={rimoStyle("width: 170px")}></RimoElement></div></div>
<div className="car-control-page__filter-wrap"><div className="car-control-page__filter-bar"><div className="car-control-page__filter-left"><span className="car-control-page__filter-label">{text("篩選:")}</span>
<div className="car-control-page__filter-field car-control-page__filter-field--lg"><RimoElement kind="el-select" modelValue={view.filters.station} onModelChange={value => {
                  model.write(["filters", "station"], value);
                }} clearable={true} placeholder="據點"><RimoElement kind="el-option" label="八輪測試-寶龍用車點" value="baolong"></RimoElement>
<RimoElement kind="el-option" label="八輪測試-啓迪用車點" value="qidi"></RimoElement>
<RimoElement kind="el-option" label="八輪測試-人工智能用車點" value="ai"></RimoElement></RimoElement></div>
<div className="car-control-page__filter-field car-control-page__filter-field--sm"><RimoElement kind="el-select" modelValue={view.filters.model} onModelChange={value => {
                  model.write(["filters", "model"], value);
                }} clearable={true} placeholder="車型"><RimoElement kind="el-option" label="Toyota" value="toyota"></RimoElement>
<RimoElement kind="el-option" label="Lexus" value="lexus"></RimoElement>
<RimoElement kind="el-option" label="Honda" value="honda"></RimoElement></RimoElement></div>
<div className="car-control-page__filter-field car-control-page__filter-field--sm"><RimoElement kind="el-select" modelValue={view.filters.type} onModelChange={value => {
                  model.write(["filters", "type"], value);
                }} clearable={true} placeholder="車輛類型"><RimoElement kind="el-option" label="公務車" value="official"></RimoElement>
<RimoElement kind="el-option" label="商務車" value="business"></RimoElement></RimoElement></div>
<div className="car-control-page__filter-field car-control-page__filter-field--sm"><RimoElement kind="el-input" modelValue={view.filters.plate} onModelChange={value => {
                  model.write(["filters", "plate"], value);
                }} clearable={true} placeholder="車牌號"></RimoElement></div>
<RimoElement kind="el-tooltip" content="重置" placement="top"><RimoElement kind="el-button" circle={true} onClick={event => {
                  view.refreshHandel?.(event);
                }}><RimoElement kind="el-icon"><RimoIcon name="Refresh" /></RimoElement></RimoElement></RimoElement></div>
<div className="car-control-page__legend">{rimoEntries(view.legends).map(([item], _itemIndex) => <Fragment key={item.name}><span key={item.name} className="inline-flex items-center"><i className="legend-dot" style={rimoStyle({
                    background: item.color
                  })}></i>
{rimoText(item.name)}{text("\n                    ")}</span></Fragment>)}</div></div></div>
<div className="car-control-page__board-wrap"><div className="car-control-page__board custom-scroll"><div className="car-control-page__board-inner"><div className="gantt-grid"><div className="gantt-cell gantt-header">{text("車輛")}</div>
{rimoEntries(view.gridDates).map(([date], _itemIndex) => <Fragment key={date.day}><div key={date.day} className="gantt-cell gantt-header"><div className="text-center"><div>{rimoText(date.day)}</div>
<div className="mt-0.5 text-[11px] font-medium text-gray-400">{rimoText(date.week)}</div></div></div></Fragment>)}
{rimoEntries(view.dispatchRows).map(([row], _itemIndex) => <Fragment key={row.plate}><><div className="gantt-cell resource-cell"><div className="resource-name">{rimoText(row.plate)}</div>
<div className="resource-meta">{rimoText(row.model)}</div>
<div className="resource-meta">{rimoText(row.station)}</div></div>
{rimoEntries(row.cells).map(([cell, index], _itemIndex) => <Fragment key={row.plate + '-' + index}><div key={row.plate + '-' + index} className="gantt-cell schedule-cell">{cell ? <><div className="gantt-bar" style={rimoStyle({
                            background: cell.bg,
                            borderColor: cell.border
                          })}><div className="gantt-bar__title">{rimoText(cell.title)}</div>
<div className="gantt-bar__meta">{rimoText(cell.time)}</div></div></> : <><div className="empty-slot"></div></>}</div></Fragment>)}</></Fragment>)}</div></div></div></div></div></div></RimoRoot>;
}