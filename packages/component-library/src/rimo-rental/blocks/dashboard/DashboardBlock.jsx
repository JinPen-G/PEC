import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoMarkup, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import * as echarts from 'echarts';
import './dashboard.css';
function createPageState(model) {
  const document = model.document;
  const window = model.window;
  const localStorage = model.storage;
  const _sessionStorage = model.storage;
  const themeColor = () => model.theme();
  const themeColorLight = level => model.theme(level);
  const themeRGBA = alpha => model.themeAlpha(alpha);
  const feedback = {
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
  const {
    cell: ref,
    record: reactive,
    onMount: onMounted,
    derived: computed,
    nextTick: nextTick
  } = model;
  const {
    ElMessage: _ElMessage
  } = feedback;
  function pageSetup() {
    const mapView = ref('scatter');
    const stats = reactive({
      memberTotal: 12450,
      corporateTotal: 342,
      vehicleTotal: 1560,
      vehicleRented: 980,
      vehicleAvailable: 495,
      vehicleMaintenance: 85,
      todayOrders: 345,
      ordersStore: 125,
      ordersTimeShare: 220,
      todayRevenue: 128500
    });
    const orderExceptions = ref([{
      id: 'OE-1',
      type: '逾期未還',
      orderNo: 'R-202611-0012',
      timeStr: '超期 2H',
      desc: '車輛定位顯示未進入還車區域，多次聯繫未接聽。',
      customer: '李強',
      phone: '138****0011'
    }, {
      id: 'OE-2',
      type: '未準時取車',
      orderNo: 'R-202611-0045',
      timeStr: '超期 1.5H',
      desc: '預訂時間爲14:00，目前仍未辦理提車手續。',
      customer: '張三',
      phone: '139****1234'
    }, {
      id: 'OE-3',
      type: '事故工單',
      orderNo: 'R-202611-0089',
      timeStr: '處理中',
      desc: '客戶反饋輕微追尾，已聯繫交警與保險公司。',
      customer: '王五',
      phone: '137****5678'
    }]);
    const vehicleExceptions = ref([{
      id: 'VE-1',
      type: '需保養',
      plateNo: '滬A·DF889',
      desc: '當前里程 49,850 km，臨近 50,000 km 大保養週期。',
      location: '虹橋機場店'
    }, {
      id: 'VE-2',
      type: '待清潔',
      plateNo: '京A·R6677',
      desc: '剛結束跨城調度，傳感器上報內飾髒污預警。',
      location: '北京南站店'
    }, {
      id: 'VE-3',
      type: '低電量',
      plateNo: '粵B·E1234',
      desc: 'SOC低於15%，需立即接入快充樁補能。',
      location: '福田高鐵站'
    }]);
    const totalExceptions = computed(() => orderExceptions.value.length + vehicleExceptions.value.length);
    const notificationDrawerVisible = ref(false);
    const activeNotificationTab = ref('all');
    const notifications = ref([{
      id: 1,
      type: '訂單提醒',
      time: '10分鐘前',
      title: '🔴 [高危風控] 會員李*(138****0011) 觸碰邊界電子圍欄，存在拆除GPS/騙租極高風險！',
      action: '立即凍結'
    }, {
      id: 2,
      type: '停車提醒',
      time: '15分鐘前',
      title: '🔴 [網點阻斷] 上海新客站店車位剩餘0，但未來 2 小時仍有 12 臺預定還車，面臨大規模阻塞！',
      action: '指派疏解'
    }, {
      id: 3,
      type: '車況提醒',
      time: '2小時前',
      title: '🔴 [經營異動] 今日核心車型 GL8 出租率暴跌至 45%，且均價即將跌破警戒盈虧線。',
      action: '查看對策'
    }]);
    const filteredNotifications = computed(() => {
      if (activeNotificationTab.value === 'all') return notifications.value;
      if (activeNotificationTab.value === '系統通知') return notifications.value.filter(n => ['公告通知', '工單提醒'].includes(n.type));
      return notifications.value.filter(n => n.type === activeNotificationTab.value);
    });
    const getNotificationTypeTag = type => {
      const map = {
        '訂單提醒': 'danger',
        '車況提醒': 'warning',
        '保養提醒': 'info',
        '清潔提醒': 'success',
        '停車提醒': 'primary',
        '公告通知': '',
        '工單提醒': 'danger'
      };
      return map[type] || 'info';
    };
    const highlightKeyword = text => {
      return text.replace(/(ZT[0-9]+|RDC-[A-Z0-9]+)/g, '<span class="text-blue-600 font-bold underline cursor-pointer hover:text-blue-800">$1</span>');
    };
    const snoozeToday = ref(false);
    const checkSnoozeStatus = () => {
      const snoozeDate = localStorage.getItem('rimo_notification_snooze_date');
      const today = new Date().toISOString().split('T')[0];
      if (snoozeDate === today) {
        snoozeToday.value = true;
        notificationDrawerVisible.value = false;
      } else {
        snoozeToday.value = false;
        localStorage.removeItem('rimo_notification_snooze_date');
        window.setTimeout(() => {
          notificationDrawerVisible.value = true;
        }, 1000);
      }
    };
    const handleSnoozeChange = val => {
      if (val) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('rimo_notification_snooze_date', today);
        feedback.ElMessage.success('設置成功，今日不再自動彈出預警中心。');
      } else {
        localStorage.removeItem('rimo_notification_snooze_date');
      }
    };
    const initMapChart = () => {
      const chartDom = document.getElementById('mapChart');
      if (!chartDom) return;
      const myChart = echarts.init(chartDom);
      const data = [[121.32, 31.19, 85, '上海虹橋點'], [121.47, 31.23, 120, '上海市區'], [116.40, 39.90, 60, '北京門店'], [114.05, 22.54, 95, '深圳門店'], [120.15, 30.28, 45, '杭州門店']];
      const _option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return `${params.data[3]}<br/>可用車輛: ${params.data[2]} 臺`;
          }
        },
        geo: {
          map: 'china',
          roam: true,
          label: {
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              areaColor: themeColorLight(8),
              borderColor: themeColorLight(7)
            },
            emphasis: {
              areaColor: themeColorLight(7)
            }
          },
          center: [116.46, 39.92],
          zoom: 1.5
        },
        series: [{
          name: '可用站點分佈',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: data,
          symbolSize: function (val) {
            return val[2] / 4;
          },
          label: {
            formatter: '{b}',
            position: 'right',
            show: false
          },
          itemStyle: {
            color: themeColor()
          },
          emphasis: {
            label: {
              show: true
            }
          }
        }, {
          name: '重點服務網點',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: data.sort(function (a, b) {
            return b[2] - a[2];
          }).slice(0, 3),
          symbolSize: function (val) {
            return val[2] / 5;
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke'
          },
          itemStyle: {
            color: themeColor(),
            shadowBlur: 10,
            shadowColor: themeColor()
          },
          zlevel: 1
        }]
      };
      const mockOption = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        xAxis: {
          type: 'value',
          show: false
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [{
          type: 'effectScatter',
          symbolSize: 20,
          data: [[10, 20], [20, 30], [50, 40], [30, 80], [70, 60]],
          itemStyle: {
            color: themeColor()
          },
          label: {
            show: true,
            formatter: '活躍站點',
            position: 'top',
            color: '#666'
          }
        }, {
          type: 'scatter',
          symbolSize: 10,
          data: [[15, 25], [25, 35], [55, 45], [35, 85], [75, 65], [40, 20], [80, 10], [10, 80], [60, 90], [90, 50]],
          itemStyle: {
            color: '#93c5fd'
          }
        }]
      };
      myChart.setOption(mockOption);
      window.addEventListener('resize', () => myChart.resize());
    };
    const initUtilizationChart = () => {
      const chartDom = document.getElementById('utilizationChart');
      if (!chartDom) return;
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}日<br/>出租率：{c}%'
        },
        grid: {
          top: '10%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
          axisLine: {
            lineStyle: {
              color: '#cbd5e1'
            }
          },
          axisLabel: {
            color: '#64748b'
          }
        },
        yAxis: {
          type: 'value',
          min: 50,
          max: 100,
          axisLabel: {
            formatter: '{value} %',
            color: '#64748b'
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#e2e8f0'
            }
          }
        },
        series: [{
          name: '出租率',
          type: 'line',
          smooth: true,
          data: [78, 80, 82, 79, 88, 95, 93],
          itemStyle: {
            color: themeColor()
          },
          lineStyle: {
            width: 3,
            shadowColor: themeRGBA(0.3),
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: themeRGBA(0.4)
            }, {
              offset: 1,
              color: themeRGBA(0.0)
            }])
          }
        }]
      };
      myChart.setOption(option);
      window.addEventListener('resize', () => myChart.resize());
    };
    const initRevenueChart = () => {
      const chartDom = document.getElementById('revenueChart');
      if (!chartDom) return;
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['租金收入', '增值服務'],
          top: 0,
          right: 0
        },
        grid: {
          top: '15%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
          axisLine: {
            lineStyle: {
              color: '#cbd5e1'
            }
          },
          axisLabel: {
            color: '#64748b'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '￥{value}k',
            color: '#64748b'
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#e2e8f0'
            }
          }
        },
        series: [{
          name: '租金收入',
          type: 'bar',
          stack: 'total',
          barWidth: '40%',
          itemStyle: {
            color: themeColor(),
            borderRadius: [0, 0, 2, 2]
          },
          data: [120, 132, 101, 134, 190, 230, 210]
        }, {
          name: '增值服務',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: themeColorLight(5),
            borderRadius: [2, 2, 0, 0]
          },
          data: [20, 25, 18, 22, 35, 45, 40]
        }]
      };
      myChart.setOption(option);
      window.addEventListener('resize', () => myChart.resize());
    };
    onMounted(() => {
      checkSnoozeStatus();
      nextTick(() => {
        initMapChart();
        initUtilizationChart();
        initRevenueChart();
      });
    });
    return {
      stats,
      orderExceptions,
      vehicleExceptions,
      totalExceptions,
      mapView,
      notificationDrawerVisible,
      activeNotificationTab,
      filteredNotifications,
      getNotificationTypeTag,
      highlightKeyword,
      notifications,
      snoozeToday,
      checkSnoozeStatus,
      handleSnoozeChange,
      initMapChart,
      initUtilizationChart,
      initRevenueChart
    };
  }
  return pageSetup();
}
export default function DashboardBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="dashboard" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all"><div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
<div className="flex justify-between items-start relative z-10"><div><h3 className="text-sm font-medium text-gray-500 mb-1">{text("會員總規模")}</h3>
<div className="text-3xl font-bold text-gray-800">{rimoText(view.stats.memberTotal.toLocaleString())}{text("\n                                ")}</div></div>
<div className="p-2 bg-blue-100 rounded-lg text-blue-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="UserFilled" /></RimoElement></div></div>
<div className="mt-4 flex items-center gap-4 text-sm relative z-10"><div className="flex items-center text-emerald-600 font-medium"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="TopRight" /></RimoElement>
<span>{text("+124 本週")}</span></div>
<div className="text-gray-500">{text("\n                                企業客戶: ")}
<span className="font-bold text-gray-700">{rimoText(view.stats.corporateTotal)}</span></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all"><div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
<div className="flex justify-between items-start relative z-10"><div><h3 className="text-sm font-medium text-gray-500 mb-1">{text("運力及車輛狀態")}</h3>
<div className="text-3xl font-bold text-gray-800">{rimoText(view.stats.vehicleTotal.toLocaleString())}{text("\n                                ")}</div></div>
<div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Van" /></RimoElement></div></div>
<div className="mt-4 flex gap-4 text-sm relative z-10"><div className="flex flex-col text-gray-500"><span className="text-emerald-600 font-bold">{rimoText(view.stats.vehicleRented)}</span>
<span className="text-xs">{text("使用中")}</span></div>
<div className="w-px bg-gray-200"></div>
<div className="flex flex-col text-gray-500"><span className="text-blue-600 font-bold">{rimoText(view.stats.vehicleAvailable)}</span>
<span className="text-xs">{text("待租中")}</span></div>
<div className="w-px bg-gray-200"></div>
<div className="flex flex-col text-gray-500"><span className="text-amber-500 font-bold">{rimoText(view.stats.vehicleMaintenance)}</span>
<span className="text-xs">{text("維保中")}</span></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all"><div className="absolute right-0 top-0 w-24 h-24 bg-[color:var(--app-color-primary-light-9)] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
<div className="flex justify-between items-start relative z-10"><div><h3 className="text-sm font-medium text-gray-500 mb-1">{text("今日新增訂單")}</h3>
<div className="text-3xl font-bold text-gray-800">{rimoText(view.stats.todayOrders)}</div></div>
<div className="p-2 bg-[color:var(--app-color-primary-light-8)] rounded-lg text-[color:var(--app-color-primary)]"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="List" /></RimoElement></div></div>
<div className="mt-4 flex flex-col gap-1 text-sm relative z-10"><div className="flex justify-between"><span className="text-gray-500">{text("門市租賃")}</span>
<span className="font-bold text-gray-700">{rimoText(view.stats.ordersStore)}</span></div>
<div className="flex justify-between"><span className="text-gray-500">{text("分時租賃")}</span>
<span className="font-bold text-gray-700">{rimoText(view.stats.ordersTimeShare)}</span></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all"><div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
<div className="flex justify-between items-start relative z-10"><div><h3 className="text-sm font-medium text-gray-500 mb-1">{text("今日預估營收")}</h3>
<div className="text-3xl font-bold text-gray-800 tracking-tight"><span className="text-xl font-medium">{text("￥")}</span>
{rimoText((view.stats.todayRevenue / 1000).toFixed(1))}{text("k\n                                ")}</div></div>
<div className="p-2 bg-orange-100 rounded-lg text-orange-600"><RimoElement kind="el-icon" className="text-xl"><RimoIcon name="Money" /></RimoElement></div></div>
<div className="mt-4 flex items-center text-sm relative z-10"><div className="flex items-center text-emerald-600 font-medium"><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="TopRight" /></RimoElement>
<span>{text("+5.2% 較昨日")}</span></div>
<div className="ml-auto text-xs text-gray-400">{text("更新時間: 10分鐘前")}</div></div></div></div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"><div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50"><h2 className="font-bold text-gray-800 text-lg flex items-center"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)] mr-2"><RimoIcon name="Location" /></RimoElement>
{text("\n                                門店及車輛分佈監控\n                            ")}</h2>
<RimoElement kind="el-radio-group" modelValue={view.mapView} onModelChange={value => {
                model.write(["mapView"], value);
              }} size="small"><RimoElement kind="el-radio-button" label="heat">{text("熱力模式")}</RimoElement>
<RimoElement kind="el-radio-button" label="scatter">{text("站點分佈")}</RimoElement></RimoElement></div>
<div className="p-4 flex-1"><div id="mapChart" className="map-container rounded-lg bg-gray-50/50"></div></div></div></div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6"><div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("近7天車隊出租率趨勢 (Fleet Utilization)")}</h2></div>
<div className="p-4"><div id="utilizationChart" className="chart-container"></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("近7天營收與訂單量趨勢 (Revenue & Orders)")}</h2></div>
<div className="p-4"><div id="revenueChart" className="chart-container"></div></div></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.notificationDrawerVisible} onModelChange={value => {
      model.write(["notificationDrawerVisible"], value);
    }} title="系統提醒中心" width="800px" center={true} top="10vh" showClose={true} customClass="shadow-2xl rounded-xl" className="dashboard-overlay" slots={{
      "header": _slot => <><div className="flex items-center text-gray-800 font-bold text-lg"><span className="w-2 h-6 bg-red-500 rounded mr-3"></span>
{text("\n                    實時預警與通知中心\n                    ")}
<RimoElement kind="el-badge" value={view.filteredNotifications.length} type="danger" className="ml-3"></RimoElement></div></>,
      "footer": _slot => <><div className="flex items-center justify-between"><RimoElement kind="el-checkbox" modelValue={view.snoozeToday} onModelChange={value => {
            model.write(["snoozeToday"], value);
          }} onChange={event => {
            view.handleSnoozeChange?.(event);
          }}>{text("今日不再自動彈出")}</RimoElement>
<RimoElement kind="el-button" onClick={_event => {
            model.write(["notificationDrawerVisible"], false);
          }}>{text("關閉")}</RimoElement></div></>
    }}>{() => <><div className="flex items-center justify-between mb-4"><RimoElement kind="el-radio-group" modelValue={view.activeNotificationTab} onModelChange={value => {
            model.write(["activeNotificationTab"], value);
          }} size="default"><RimoElement kind="el-radio-button" label="all">{text("全部提醒")}</RimoElement>
<RimoElement kind="el-radio-button" label="訂單提醒">{text("訂單提醒")}</RimoElement>
<RimoElement kind="el-radio-button" label="車況提醒">{text("車況提醒")}</RimoElement>
<RimoElement kind="el-radio-button" label="保養提醒">{text("保養提醒")}</RimoElement>
<RimoElement kind="el-radio-button" label="系統通知">{text("其他通知")}</RimoElement></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} size="small">{text("全部標爲已讀")}</RimoElement></div>
<RimoElement kind="el-table" data={view.filteredNotifications} style={rimoStyle("width: 100%")} height="600px" size="large" headerCellStyle={{
          background: '#f9fafb',
          color: '#374151',
          fontSize: '13px'
        }}><RimoElement kind="el-table-column" prop="type" label="提醒類型" width="100" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" size="small" type={view.getNotificationTypeTag(row.type)} effect="dark">{rimoText(row.type)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="time" label="提醒時間" width="150" slots={{
            "default": ({
              row
            }) => <><span className="text-xs text-gray-500 font-mono">{rimoText(row.time)}</span></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="title" label="提醒標題" minWidth="320" slots={{
            "default": ({
              row
            }) => <><RimoMarkup className="text-sm font-medium text-gray-800" html={view.highlightKeyword(row.title)} as="span"></RimoMarkup></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="90" align="center" fixed="right" slots={{
            "default": ({
              row
            }) => <>{row.action ? <><RimoElement kind="el-button" type="primary" size="small" className="font-bold">{rimoText(row.action)}</RimoElement></> : <><RimoElement kind="el-button" link={true} type="primary" size="small">{text("立即處理")}</RimoElement></>}</>
          }}></RimoElement></RimoElement></>}</RimoElement></RimoRoot>;
}