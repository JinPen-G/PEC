import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import * as echarts from 'echarts';
import './war-room.css';
function createPageState(model) {
  const document = model.document;
  const window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const themeColor = () => model.theme();
  const themeColorLight = level => model.theme(level);
  const themeRGBA = alpha => model.themeAlpha(alpha);
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
  const {
    cell: ref,
    record: _reactive,
    onMount: onMounted,
    derived: _computed,
    nextTick: nextTick
  } = model;
  function pageSetup() {
    const dateRange = ref('week');
    const businessLine = ref('all');
    const businessLineOptions = ref([{
      value: 'all',
      label: '全部業務'
    }, {
      value: 'timeshare',
      label: '分時租賃',
      children: [{
        value: 'station',
        label: '同站租還'
      }, {
        value: 'oneway',
        label: '甲租乙還'
      }]
    }, {
      value: 'store_group',
      label: '門市長短租',
      children: [{
        value: 'store',
        label: '門市租車'
      }, {
        value: 'self24h',
        label: '24h自助門市'
      }]
    }]);
    const kpis = ref([{
      label: '本週總營收',
      value: '¥86.5萬',
      trend: 12.3,
      bgColor: '#dbeafe'
    }, {
      label: '本週訂單量',
      value: '2,340',
      trend: 8.7,
      bgColor: '#dcfce7'
    }, {
      label: '車隊出租率',
      value: '87.3%',
      trend: 3.2,
      bgColor: '#fef3c7'
    }, {
      label: '車輛總數',
      value: '1,560',
      trend: 1.1,
      bgColor: 'var(--app-color-primary-light-8)'
    }, {
      label: '活躍會員',
      value: '9,120',
      trend: 5.6,
      bgColor: 'var(--app-color-primary-light-8)'
    }, {
      label: '異常工單',
      value: '23',
      trend: -15.4,
      bgColor: '#fee2e2'
    }]);
    const topStations = ref([{
      name: '上海虹橋機場 T2 網點',
      orders: 892,
      pct: 100
    }, {
      name: '北京首都機場 T3 網點',
      orders: 756,
      pct: 85
    }, {
      name: '深圳寶安機場網點',
      orders: 634,
      pct: 71
    }, {
      name: '杭州蕭山機場網點',
      orders: 521,
      pct: 58
    }, {
      name: '廣州白雲機場網點',
      orders: 489,
      pct: 55
    }, {
      name: '成都天府機場網點',
      orders: 412,
      pct: 46
    }, {
      name: '重慶江北機場網點',
      orders: 387,
      pct: 43
    }, {
      name: '南京祿口機場網點',
      orders: 345,
      pct: 39
    }]);
    const initHeatmap = () => {
      const dom = document.getElementById('heatmapChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      const hours = Array.from({
        length: 24
      }, (_, i) => i + ':00');
      const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
      const data = [];
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          const base = h >= 8 && h <= 20 ? 40 : 10;
          const weekend = d >= 5 ? 20 : 0;
          const peak = h >= 9 && h <= 11 || h >= 17 && h <= 19 ? 30 : 0;
          data.push([h, d, Math.min(100, base + weekend + peak + Math.floor(Math.random() * 25))]);
        }
      }
      chart.setOption({
        tooltip: {
          position: 'top',
          formatter: p => `${days[p.value[1]]} ${hours[p.value[0]]}<br/>訂單量: <b>${p.value[2]}</b>`
        },
        grid: {
          top: 10,
          bottom: 30,
          left: 50,
          right: 20
        },
        xAxis: {
          type: 'category',
          data: hours,
          axisLabel: {
            color: '#6b7280',
            fontSize: 10
          },
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category',
          data: days,
          axisLabel: {
            color: '#374151'
          }
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          show: false,
          inRange: {
            color: [themeColorLight(9), '#7dd3fc', '#38bdf8', '#0284c7', '#075985']
          }
        },
        series: [{
          type: 'heatmap',
          data: data,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.15)'
            }
          }
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initWeeklyRevenue = () => {
      const dom = document.getElementById('weeklyRevenueChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      chart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['租金收入', '增值服務', '環比增長率'],
          top: 0,
          right: 0,
          textStyle: {
            color: '#6b7280',
            fontSize: 11
          }
        },
        grid: {
          top: 35,
          left: 10,
          right: 40,
          bottom: 10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['W1', 'W2', 'W3', 'W4'],
          axisLabel: {
            color: '#6b7280'
          }
        },
        yAxis: [{
          type: 'value',
          axisLabel: {
            color: '#6b7280',
            formatter: '¥{value}k'
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          }
        }, {
          type: 'value',
          axisLabel: {
            color: '#6b7280',
            formatter: '{value}%'
          },
          splitLine: {
            show: false
          }
        }],
        series: [{
          name: '租金收入',
          type: 'bar',
          barWidth: '30%',
          itemStyle: {
            color: themeColor(),
            borderRadius: [4, 4, 0, 0]
          },
          data: [180, 210, 195, 240]
        }, {
          name: '增值服務',
          type: 'bar',
          barWidth: '30%',
          itemStyle: {
            color: themeColorLight(5),
            borderRadius: [4, 4, 0, 0]
          },
          data: [30, 35, 28, 42]
        }, {
          name: '環比增長率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          itemStyle: {
            color: '#10b981'
          },
          data: [null, 16.7, -7.1, 23.1]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initVehicleStatus = () => {
      const dom = document.getElementById('vehicleStatusChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: {
            color: '#374151',
            fontSize: 12
          }
        },
        series: [{
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: {
            position: 'center',
            show: true,
            formatter: '總計\n{total|1,560}',
            rich: {
              total: {
                fontSize: 22,
                fontWeight: 'bold',
                color: '#1f2937',
                lineHeight: 30
              }
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 3
          },
          data: [{
            value: 980,
            name: '在租中',
            itemStyle: {
              color: themeColor()
            }
          }, {
            value: 395,
            name: '可租用',
            itemStyle: {
              color: '#10b981'
            }
          }, {
            value: 85,
            name: '維保中',
            itemStyle: {
              color: '#f59e0b'
            }
          }, {
            value: 60,
            name: '待清潔',
            itemStyle: {
              color: themeColorLight(5)
            }
          }, {
            value: 40,
            name: '故障封控',
            itemStyle: {
              color: '#ef4444'
            }
          }]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initUtilization = () => {
      const dom = document.getElementById('utilizationChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>出租率: {c}%'
        },
        grid: {
          top: 20,
          left: 10,
          right: 20,
          bottom: 10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
          axisLabel: {
            color: '#6b7280'
          }
        },
        yAxis: {
          type: 'value',
          min: 50,
          max: 100,
          axisLabel: {
            formatter: '{value}%',
            color: '#6b7280'
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          }
        },
        series: [{
          type: 'line',
          smooth: true,
          data: [78, 80, 82, 79, 88, 95, 93],
          itemStyle: {
            color: themeColor()
          },
          lineStyle: {
            width: 3,
            shadowColor: themeRGBA(0.2),
            shadowBlur: 8,
            shadowOffsetY: 4
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: themeRGBA(0.3)
            }, {
              offset: 1,
              color: themeRGBA(0)
            }])
          }
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initRevenue = () => {
      const dom = document.getElementById('revenueChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: 20,
          left: 10,
          right: 10,
          bottom: 10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
          axisLabel: {
            color: '#6b7280'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}k',
            color: '#6b7280'
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          }
        },
        series: [{
          name: '日營收',
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: themeColor()
            }, {
              offset: 1,
              color: '#93c5fd'
            }]),
            borderRadius: [6, 6, 0, 0]
          },
          data: [120, 132, 101, 134, 190, 230, 210]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initTopModels = () => {
      const dom = document.getElementById('topModelsChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      const models = ['Tesla Model 3', 'Toyota Camry', 'BMW 3 Series', 'Mercedes C-Class', 'Honda CR-V', 'Audi A4', 'Volvo XC60', 'Lexus ES'];
      const counts = [456, 389, 312, 287, 265, 231, 198, 176];
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: 10,
          left: 10,
          right: 40,
          bottom: 10,
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#6b7280'
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: models.reverse(),
          axisLabel: {
            color: '#374151',
            fontSize: 11
          }
        },
        series: [{
          type: 'bar',
          barWidth: '55%',
          data: counts.reverse().map((v, i) => ({
            value: v,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                offset: 0,
                color: i >= counts.length - 3 ? themeColor() : '#d1d5db'
              }, {
                offset: 1,
                color: i >= counts.length - 3 ? '#60a5fa' : '#e5e7eb'
              }]),
              borderRadius: [0, 4, 4, 0]
            }
          })),
          label: {
            show: true,
            position: 'right',
            color: '#374151',
            fontSize: 11
          }
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initBranchStatus = () => {
      const dom = document.getElementById('branchStatusChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      const branches = ['RIMO上海', 'RIMO北京', 'RIMO深圳', 'RIMO杭州', '合作方A', '合作方B'];
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['在租', '空閒', '維保', '故障'],
          top: 0,
          right: 0,
          textStyle: {
            color: '#6b7280',
            fontSize: 11
          }
        },
        grid: {
          top: 35,
          left: 10,
          right: 10,
          bottom: 10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: branches,
          axisLabel: {
            color: '#374151',
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#6b7280'
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          }
        },
        series: [{
          name: '在租',
          type: 'bar',
          stack: 'total',
          barWidth: '45%',
          itemStyle: {
            color: themeColor()
          },
          data: [280, 210, 170, 120, 98, 65]
        }, {
          name: '空閒',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: '#10b981'
          },
          data: [80, 65, 55, 40, 30, 22]
        }, {
          name: '維保',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: '#f59e0b'
          },
          data: [20, 18, 12, 8, 6, 4]
        }, {
          name: '故障',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: '#ef4444',
            borderRadius: [4, 4, 0, 0]
          },
          data: [8, 5, 4, 3, 2, 1]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initOrderStatus = () => {
      const dom = document.getElementById('orderStatusChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}'
        },
        legend: {
          top: 0,
          textStyle: {
            color: '#6b7280'
          }
        },
        series: [{
          type: 'funnel',
          left: '10%',
          top: 40,
          bottom: 10,
          width: '80%',
          sort: 'descending',
          gap: 3,
          label: {
            show: true,
            position: 'inside',
            color: '#fff',
            fontSize: 12
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          },
          data: [{
            value: 2340,
            name: '總預訂量',
            itemStyle: {
              color: themeColor()
            }
          }, {
            value: 2100,
            name: '已取車',
            itemStyle: {
              color: '#0ea5e9'
            }
          }, {
            value: 1850,
            name: '租賃中',
            itemStyle: {
              color: '#10b981'
            }
          }, {
            value: 1680,
            name: '正常完結',
            itemStyle: {
              color: '#22c55e'
            }
          }, {
            value: 120,
            name: '逾期/違約',
            itemStyle: {
              color: '#ef4444'
            }
          }]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initChannel = () => {
      const dom = document.getElementById('channelChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: {
            color: '#374151'
          }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['35%', '50%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 3
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold'
            }
          },
          data: [{
            value: 780,
            name: '微信小程序',
            itemStyle: {
              color: '#22c55e'
            }
          }, {
            value: 620,
            name: 'APP 自營',
            itemStyle: {
              color: themeColor()
            }
          }, {
            value: 480,
            name: '企業大客戶',
            itemStyle: {
              color: '#f59e0b'
            }
          }, {
            value: 320,
            name: 'OTA平臺',
            itemStyle: {
              color: themeColorLight(5)
            }
          }, {
            value: 140,
            name: '門店櫃檯',
            itemStyle: {
              color: '#9ca3af'
            }
          }]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    const initRiskTrend = () => {
      const dom = document.getElementById('riskTrendChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      const days14 = Array.from({
        length: 14
      }, (_, i) => `${i + 1}日`);
      chart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['事故率', '嚴重逾期率'],
          top: 0,
          right: 0,
          textStyle: {
            color: '#6b7280'
          }
        },
        grid: {
          top: 35,
          left: 10,
          right: 10,
          bottom: 10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: days14,
          axisLabel: {
            color: '#6b7280',
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%',
            color: '#6b7280'
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          }
        },
        series: [{
          name: '事故率',
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#ef4444'
          },
          data: [1.2, 0.8, 1.5, 0.6, 1.1, 0.9, 1.8, 1.3, 0.7, 1.0, 0.5, 1.4, 0.9, 1.1]
        }, {
          name: '嚴重逾期率',
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#f59e0b'
          },
          data: [2.1, 1.9, 2.5, 1.8, 2.3, 2.0, 3.1, 2.6, 1.5, 2.2, 1.7, 2.8, 2.0, 2.3]
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    onMounted(() => {
      nextTick(() => {
        initHeatmap();
        initWeeklyRevenue();
        initVehicleStatus();
        initUtilization();
        initRevenue();
        initTopModels();
        initBranchStatus();
        initOrderStatus();
        initChannel();
        initRiskTrend();
      });
    });
    return {
      dateRange,
      businessLine,
      businessLineOptions,
      kpis,
      topStations,
      initHeatmap,
      initWeeklyRevenue,
      initVehicleStatus,
      initUtilization,
      initRevenue,
      initTopModels,
      initBranchStatus,
      initOrderStatus,
      initChannel,
      initRiskTrend
    };
  }
  return pageSetup();
}
export default function WarRoomBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="war-room" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll"><div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between"><div className="flex items-center space-x-4"><span className="text-sm font-bold text-gray-700">{text("業務線過濾")}</span>
<RimoElement kind="el-cascader" modelValue={view.businessLine} onModelChange={value => {
              model.write(["businessLine"], value);
            }} options={view.businessLineOptions} props={{
              checkStrictly: true,
              expandTrigger: 'hover'
            }} size="small" placeholder="業務線過濾" clearable={true}></RimoElement></div>
<div className="flex items-center space-x-4"><span className="text-sm text-gray-500">{text("統計區間")}</span>
<RimoElement kind="el-select" modelValue={view.dateRange} onModelChange={value => {
              model.write(["dateRange"], value);
            }} size="small" style={rimoStyle("width: 140px;")}><RimoElement kind="el-option" label="本週" value="week"></RimoElement>
<RimoElement kind="el-option" label="本月" value="month"></RimoElement>
<RimoElement kind="el-option" label="近30天" value="30d"></RimoElement></RimoElement></div></div>
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">{rimoEntries(view.kpis).map(([kpi], _itemIndex) => <Fragment key={kpi.label}><div key={kpi.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md transition-all"><div className="absolute right-0 top-0 w-20 h-20 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" style={rimoStyle({
                background: kpi.bgColor
              })}></div>
<div className="relative z-10"><div className="text-xs font-medium text-gray-500 mb-1">{rimoText(kpi.label)}</div>
<div className="text-2xl font-bold text-gray-800">{rimoText(kpi.value)}</div>
<div className={rimoClass(["mt-1 text-xs", rimoClass(kpi.trend > 0 ? 'text-green-600' : 'text-red-500')])}>{text("\n                                ")}{rimoText(kpi.trend > 0 ? '↑' : '↓')}{text(" ")}{rimoText(Math.abs(kpi.trend))}{text("% 較上週\n                            ")}</div></div></div></Fragment>)}</div>
<div className="grid grid-cols-1 lg:grid-cols-5 gap-6"><div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-3"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("熱門時段統計 (週一~週日 × 24H)")}</h2></div>
<div className="p-4"><div id="heatmapChart" className="chart-box-heatmap"></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("每週營收分析")}</h2></div>
<div className="p-4"><div id="weeklyRevenueChart" className="chart-box-heatmap"></div></div></div></div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("當下車況分佈")}</h2></div>
<div className="p-4"><div id="vehicleStatusChart" className="chart-box"></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("近7日出租率趨勢")}</h2></div>
<div className="p-4"><div id="utilizationChart" className="chart-box"></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("營收情況")}</h2></div>
<div className="p-4"><div id="revenueChart" className="chart-box"></div></div></div></div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("熱門車款租用次數排行")}</h2></div>
<div className="p-4"><div id="topModelsChart" className="chart-box-lg"></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("各車行公司車輛狀況統計")}</h2></div>
<div className="p-4"><div id="branchStatusChart" className="chart-box-lg"></div></div></div></div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("訂單狀況統計")}</h2></div>
<div className="p-4"><div id="orderStatusChart" className="chart-box-lg"></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800 text-base">{text("熱門站點排行")}</h2></div>
<div className="p-4 px-5">{rimoEntries(view.topStations).map(([s, i], _itemIndex) => <Fragment key={s.name}><div key={s.name} className="rank-item"><div className={rimoClass(['rank-badge', i < 3 ? 'rank-' + (i + 1) : 'rank-default'])}>{rimoText(i + 1)}</div>
<div className="flex-1 min-w-0"><div className="text-sm text-gray-800 font-medium truncate">{rimoText(s.name)}</div>
<div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5"><div className="h-1.5 rounded-full transition-all" style={rimoStyle({
                        width: s.pct + '%',
                        background: i === 0 ? 'var(--app-color-primary)' : i === 1 ? 'var(--app-color-primary)' : i === 2 ? 'var(--app-color-primary)' : '#d1d5db'
                      })}></div></div></div>
<div className={rimoClass(["text-sm font-bold ml-3 flex-shrink-0", rimoClass(i < 3 ? 'text-blue-600' : 'text-gray-400')])}>{rimoText(s.orders)}{text(" 單")}</div></div></Fragment>)}</div></div></div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6"><div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100 flex items-center justify-between"><h2 className="font-bold text-gray-800 text-base">{text("渠道進件佔比")}</h2>
<span className="text-xs text-gray-400">{text("訂單來源分析")}</span></div>
<div className="p-4"><div id="channelChart" className="chart-box"></div></div></div>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100 flex items-center justify-between"><h2 className="font-bold text-gray-800 text-base">{text("風險與異常單趨勢")}</h2>
<span className="text-xs text-gray-400">{text("近14天")}</span></div>
<div className="p-4"><div id="riskTrendChart" className="chart-box"></div></div></div></div></div></div></RimoRoot>;
}