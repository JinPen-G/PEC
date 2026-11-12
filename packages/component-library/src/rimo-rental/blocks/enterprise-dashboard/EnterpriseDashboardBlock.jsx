import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoTable, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import * as echarts from 'echarts';
import './enterprise-dashboard.css';
function createPageState(model) {
  const document = model.document;
  const window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const themeColor = () => model.theme();
  const _themeColorLight = level => model.theme(level);
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
    nextTick: nextTick
  } = model;
  const usageEngine = {
    at(value) {
      return Date.parse(value + '+08:00');
    },
    merge(intervals) {
      const result = [];
      for (const item of intervals.filter(x => x[1] > x[0]).map(x => [...x]).sort((a, b) => a[0] - b[0])) {
        const last = result[result.length - 1];
        if (last && item[0] <= last[1]) last[1] = Math.max(last[1], item[1]);else result.push(item);
      }
      return result;
    },
    intersect(a, b) {
      return this.merge(a.flatMap(x => b.map(y => [Math.max(x[0], y[0]), Math.min(x[1], y[1])])));
    },
    length(intervals) {
      return this.merge(intervals).reduce((sum, x) => sum + x[1] - x[0], 0);
    },
    subtract(intervals, occupied) {
      return this.merge(occupied).reduce((parts, cut) => parts.flatMap(part => {
        if (cut[1] <= part[0] || cut[0] >= part[1]) return [part];
        return [[part[0], Math.min(part[1], cut[0])], [Math.max(part[0], cut[1]), part[1]]].filter(x => x[1] > x[0]);
      }), this.merge(intervals));
    },
    work(start, end, basis = 'work') {
      if (basis === 'calendar') return end > start ? [[start, end]] : [];
      const result = [],
        dayMs = 86400000;
      const local = new Date(start + 8 * 3600000);
      let day = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 8 * 3600000;
      for (; day < end; day += dayMs) {
        const weekday = new Date(day + 8 * 3600000).getUTCDay();
        if (weekday && weekday < 6) result.push([Math.max(start, day + 9 * 3600000), Math.min(end, day + 18 * 3600000)]);
      }
      return this.merge(result);
    },
    calculate(vehicle, start, end, basis = 'work') {
      const work = this.work(start, end, basis);
      const events = [...vehicle.events].sort((a, b) => a.at - b.at);
      let occupied = [];
      const orderRecords = [...vehicle.orders].sort((a, b) => a.start - b.start || a.id.localeCompare(b.id)).map(order => {
        const clippedStart = Math.max(order.start, start),
          clippedEnd = Math.min(order.end || end, end);
        if (clippedEnd <= clippedStart) return null;
        const workingIntervals = this.intersect([[clippedStart, clippedEnd]], work);
        const intervals = this.subtract(workingIntervals, occupied);
        occupied = this.merge([...occupied, ...workingIntervals]);
        const usedMs = this.length(intervals),
          actualMs = clippedEnd - clippedStart;
        return {
          ...order,
          clippedStart,
          clippedEnd,
          actualMs,
          usedMs,
          excludedMs: actualMs - this.length(workingIntervals),
          overlapMs: this.length(workingIntervals) - usedMs,
          fullActualMs: Math.max(0, Math.min(order.end || end, end) - order.start),
          segments: intervals.map(x => ({
            start: x[0],
            end: x[1]
          }))
        };
      }).filter(Boolean).sort((a, b) => b.start - a.start);
      const used = this.merge(orderRecords.flatMap(order => order.segments.map(x => [x.start, x.end])));
      const serviceRecords = events.map((event, index) => {
        const next = events[index + 1],
          a = Math.max(start, event.at),
          b = Math.min(end, next?.at || end);
        if (a >= b) return null;
        const eligible = this.intersect([[a, b]], work);
        const intervals = event.listed ? eligible : this.intersect(eligible, used);
        const ms = this.length(intervals);
        return {
          id: `${vehicle.id}-${index}`,
          start: a,
          end: b,
          originalStart: event.at,
          originalEnd: next?.at || null,
          listed: event.listed,
          listedMs: event.listed ? ms : 0,
          supplementMs: event.listed ? 0 : ms,
          serviceMs: ms,
          segments: intervals.map(x => ({
            start: x[0],
            end: x[1],
            reason: event.listed ? '上架工作時段' : '下架後實際用車',
            orderIds: orderRecords.filter(o => o.clippedStart < x[1] && o.clippedEnd > x[0]).map(o => o.id)
          }))
        };
      }).filter(Boolean);
      const serviceMs = serviceRecords.reduce((sum, r) => sum + r.serviceMs, 0),
        usedMs = this.length(used);
      return {
        ...vehicle,
        serviceRecords,
        orderRecords,
        serviceMs,
        usedMs,
        listedMs: serviceRecords.reduce((sum, r) => sum + r.listedMs, 0),
        supplementMs: serviceRecords.reduce((sum, r) => sum + r.supplementMs, 0),
        actualMs: this.length(orderRecords.map(o => [o.clippedStart, o.clippedEnd])),
        rate: serviceMs ? usedMs / serviceMs * 100 : null
      };
    },
    total(rows) {
      const serviceMs = rows.reduce((sum, row) => sum + row.serviceMs, 0),
        usedMs = rows.reduce((sum, row) => sum + row.usedMs, 0);
      return {
        serviceMs,
        usedMs,
        rate: serviceMs ? usedMs / serviceMs * 100 : null
      };
    },
    mock(branches, source) {
      const result = [],
        names = ['陳怡君', '林柏翰', '王雅婷', '張志明', '黃佳蓉'];
      for (const branch of branches) {
        const index = 0;
        const known = source.find(v => v.branchId === branch.value),
          scenario = branch.value - 11;
        const vehicle = {
          id: `U${branch.value}-${index}`,
          branchId: branch.value,
          branchName: branch.label,
          plate: known?.plate || `R${String.fromCharCode(65 + branch.value - 11)}T-${String(1000 + index * 37 + branch.value).padStart(4, '0')}`,
          events: [],
          orders: []
        };
        vehicle.events.push({
          at: this.at('2026-09-01T00:00'),
          listed: scenario !== 1 && scenario !== 4 && scenario !== 5
        });
        if (scenario === 1) vehicle.events.push({
          at: this.at('2026-11-03T10:00'),
          listed: true
        });
        if (scenario === 5) vehicle.events.push({
          at: this.at('2026-11-04T13:00'),
          listed: true
        });
        if (scenario === 2) vehicle.events.push({
          at: this.at('2026-11-03T12:00'),
          listed: false
        }, {
          at: this.at('2026-11-05T11:00'),
          listed: true
        });
        if (scenario === 3) vehicle.events.push({
          at: this.at('2026-11-05T12:00'),
          listed: false
        });
        for (const month of ['10', '11']) {
          if (scenario === 4 || month === '10' && [1, 5].includes(scenario)) continue;
          const add = (day, from, until, toDay = day) => vehicle.orders.push({
            id: `OV-2026${month}${day}-${branch.value}${index}-${vehicle.orders.length}`,
            employee: names[scenario % names.length],
            start: this.at(`2026-${month}-${day}T${from}`),
            end: until ? this.at(`2026-${month}-${toDay}T${until}`) : null
          });
          if (![1, 5].includes(scenario)) add('02', '09:30', month === '11' ? '14:30' : '13:30');
          if (scenario !== 5) add('03', scenario === 1 ? '11:00' : '10:00', '16:00');
          add('04', '16:00', '10:00', '05');
          add('05', scenario === 3 ? '10:00' : '11:00', month === '11' && scenario === 3 ? null : '14:00');
        }
        if (scenario === 0) vehicle.orders.push({
          id: `OV-20261030-${branch.value}-CROSS`,
          employee: names[0],
          start: this.at('2026-10-30T16:00'),
          end: this.at('2026-11-02T09:30')
        });
        result.push(vehicle);
      }
      return result;
    }
  };
  const pageOptions = {
    data() {
      return {
        selectedCompany: 1,
        employeeSort: "times",
        overallMode: "month",
        vehicleSort: "times",
        departmentMetric: "duration",
        departmentMode: "month",
        briefingHelpVisible: false,
        usageDetailsVisible: false,
        usageVehicleDetailsVisible: false,
        usageBasis: 'work',
        usagePeriod: 'current',
        usagePage: 1,
        usageQuery: '',
        usageBranchFilter: '',
        usageSelectedVehicleId: '',
        usageDetailTab: 'service',
        usageSnapshotAt: usageEngine.at('2026-11-05T15:00'),
        usageVehicles: [],
        companyTreeList: [{
          value: 1,
          label: "RITI 總公司",
          children: [{
            value: 11,
            label: "臺北分公司"
          }, {
            value: 12,
            label: "新北分公司"
          }, {
            value: 13,
            label: "桃園分公司"
          }, {
            value: 14,
            label: "臺中分公司"
          }, {
            value: 15,
            label: "臺南分公司"
          }, {
            value: 16,
            label: "高雄分公司"
          }]
        }],
        topMetricsMap: {
          1: {
            employeeTotal: 186,
            availableEmployees: 158,
            availableEmployeeRate: 85,
            vehicleTotal: 96,
            availableVehicles: 82,
            availableVehicleRate: 85,
            totalUsageTimes: 724,
            monthAvgUsageRate: "76.4",
            monthAvgUsageRateTrend: "+6.4%",
            monthAvgUsageRateTrendType: "is-up",
            monthUsageTimes: 186,
            monthUsageTrend: "+8.3%",
            monthUsageTrendType: "is-up"
          },
          11: {
            employeeTotal: 52,
            availableEmployees: 46,
            availableEmployeeRate: 88,
            vehicleTotal: 28,
            availableVehicles: 24,
            availableVehicleRate: 86,
            totalUsageTimes: 214,
            monthAvgUsageRate: "82.0",
            monthAvgUsageRateTrend: "+7.0%",
            monthAvgUsageRateTrendType: "is-up",
            monthUsageTimes: 58,
            monthUsageTrend: "+7.4%",
            monthUsageTrendType: "is-up"
          },
          12: {
            employeeTotal: 38,
            availableEmployees: 32,
            availableEmployeeRate: 84,
            vehicleTotal: 18,
            availableVehicles: 15,
            availableVehicleRate: 83,
            totalUsageTimes: 148,
            monthAvgUsageRate: "74.0",
            monthAvgUsageRateTrend: "+3.9%",
            monthAvgUsageRateTrendType: "is-up",
            monthUsageTimes: 36,
            monthUsageTrend: "+5.6%",
            monthUsageTrendType: "is-up"
          },
          13: {
            employeeTotal: 29,
            availableEmployees: 24,
            availableEmployeeRate: 83,
            vehicleTotal: 15,
            availableVehicles: 12,
            availableVehicleRate: 80,
            totalUsageTimes: 116,
            monthAvgUsageRate: "69.0",
            monthAvgUsageRateTrend: "+2.4%",
            monthAvgUsageRateTrendType: "is-up",
            monthUsageTimes: 29,
            monthUsageTrend: "+3.2%",
            monthUsageTrendType: "is-up"
          },
          14: {
            employeeTotal: 33,
            availableEmployees: 28,
            availableEmployeeRate: 85,
            vehicleTotal: 17,
            availableVehicles: 14,
            availableVehicleRate: 82,
            totalUsageTimes: 132,
            monthAvgUsageRate: "72.0",
            monthAvgUsageRateTrend: "+3.2%",
            monthAvgUsageRateTrendType: "is-up",
            monthUsageTimes: 33,
            monthUsageTrend: "+4.1%",
            monthUsageTrendType: "is-up"
          },
          15: {
            employeeTotal: 18,
            availableEmployees: 15,
            availableEmployeeRate: 83,
            vehicleTotal: 10,
            availableVehicles: 8,
            availableVehicleRate: 80,
            totalUsageTimes: 72,
            monthAvgUsageRate: "61.0",
            monthAvgUsageRateTrend: "-1.5%",
            monthAvgUsageRateTrendType: "is-down",
            monthUsageTimes: 18,
            monthUsageTrend: "-1.4%",
            monthUsageTrendType: "is-down"
          },
          16: {
            employeeTotal: 16,
            availableEmployees: 13,
            availableEmployeeRate: 81,
            vehicleTotal: 11,
            availableVehicles: 9,
            availableVehicleRate: 82,
            totalUsageTimes: 42,
            monthAvgUsageRate: "55.0",
            monthAvgUsageRateTrend: "-3.7%",
            monthAvgUsageRateTrendType: "is-down",
            monthUsageTimes: 12,
            monthUsageTrend: "-3.8%",
            monthUsageTrendType: "is-down"
          }
        },
        branchBriefRows: [{
          id: "B01",
          name: "臺北分公司",
          available: 24,
          total: 28,
          availableRate: 86,
          completed: 58,
          duration: 486,
          durationRate: 100,
          usageRate: 82,
          compare: 9.8,
          pending: 14,
          avgDuration: "8.4 hr"
        }, {
          id: "B02",
          name: "新北分公司",
          available: 15,
          total: 18,
          availableRate: 83,
          completed: 36,
          duration: 312,
          durationRate: 64,
          usageRate: 74,
          compare: 5.6,
          pending: 9,
          avgDuration: "8.7 hr"
        }, {
          id: "B03",
          name: "桃園分公司",
          available: 12,
          total: 15,
          availableRate: 80,
          completed: 29,
          duration: 254,
          durationRate: 52,
          usageRate: 69,
          compare: 3.2,
          pending: 6,
          avgDuration: "8.8 hr"
        }, {
          id: "B04",
          name: "臺中分公司",
          available: 14,
          total: 17,
          availableRate: 82,
          completed: 33,
          duration: 288,
          durationRate: 59,
          usageRate: 72,
          compare: 4.1,
          pending: 8,
          avgDuration: "8.7 hr"
        }, {
          id: "B05",
          name: "臺南分公司",
          available: 8,
          total: 10,
          availableRate: 80,
          completed: 18,
          duration: 142,
          durationRate: 29,
          usageRate: 61,
          compare: -1.4,
          pending: 4,
          avgDuration: "7.9 hr"
        }, {
          id: "B06",
          name: "高雄分公司",
          available: 9,
          total: 11,
          availableRate: 82,
          completed: 12,
          duration: 108,
          durationRate: 22,
          usageRate: 55,
          compare: -3.8,
          pending: 3,
          avgDuration: "9.0 hr"
        }],
        vehicleBriefMap: {
          11: [{
            id: "V1101",
            name: "RAB-5826",
            subName: "Toyota Camry 2023款",
            statusText: "上架",
            statusType: "listed",
            completed: 16,
            duration: 132,
            durationRate: 100,
            usageRate: 84,
            compare: 8.5,
            pending: 3,
            avgDuration: "8.3 hr"
          }, {
            id: "V1102",
            name: "RAC-7305",
            subName: "Lexus ES 250 2022款",
            statusText: "上架",
            statusType: "listed",
            completed: 14,
            duration: 116,
            durationRate: 88,
            usageRate: 79,
            compare: 6.2,
            pending: 2,
            avgDuration: "8.3 hr"
          }, {
            id: "V1103",
            name: "RAE-1968",
            subName: "Toyota Alphard 2023款",
            statusText: "使用中",
            statusType: "listed",
            completed: 12,
            duration: 104,
            durationRate: 79,
            usageRate: 76,
            compare: 4.1,
            pending: 2,
            avgDuration: "8.7 hr"
          }, {
            id: "V1104",
            name: "RAF-4219",
            subName: "Toyota RAV4 2022款",
            statusText: "上架",
            statusType: "listed",
            completed: 9,
            duration: 74,
            durationRate: 56,
            usageRate: 68,
            compare: 1.8,
            pending: 1,
            avgDuration: "8.2 hr"
          }, {
            id: "V1105",
            name: "RAH-9052",
            subName: "Honda CR-V 2021款",
            statusText: "下架",
            statusType: "delisted",
            completed: 7,
            duration: 60,
            durationRate: 45,
            usageRate: 52,
            compare: -3.6,
            pending: 1,
            avgDuration: "8.6 hr"
          }, {
            id: "V1106",
            name: "RAJ-3186",
            subName: "Toyota Corolla Cross 2022款",
            statusText: "上架",
            statusType: "listed",
            completed: 7,
            duration: 55,
            durationRate: 42,
            usageRate: 57,
            compare: 0.8,
            pending: 1,
            avgDuration: "7.9 hr"
          }, {
            id: "V1107",
            name: "RAK-6402",
            subName: "Nissan X-Trail 2021款",
            statusText: "上架",
            statusType: "listed",
            completed: 6,
            duration: 49,
            durationRate: 37,
            usageRate: 54,
            compare: -0.6,
            pending: 1,
            avgDuration: "8.2 hr"
          }, {
            id: "V1108",
            name: "RAL-7729",
            subName: "Toyota Sienta 2023款",
            statusText: "上架",
            statusType: "listed",
            completed: 6,
            duration: 46,
            durationRate: 35,
            usageRate: 51,
            compare: 1.1,
            pending: 1,
            avgDuration: "7.7 hr"
          }, {
            id: "V1109",
            name: "RAM-2058",
            subName: "Mazda CX-5 2022款",
            statusText: "使用中",
            statusType: "listed",
            completed: 5,
            duration: 42,
            durationRate: 32,
            usageRate: 49,
            compare: -1.2,
            pending: 1,
            avgDuration: "8.4 hr"
          }, {
            id: "V1110",
            name: "RAN-9164",
            subName: "Toyota Altis 2021款",
            statusText: "上架",
            statusType: "listed",
            completed: 5,
            duration: 38,
            durationRate: 29,
            usageRate: 46,
            compare: -2.0,
            pending: 1,
            avgDuration: "7.6 hr"
          }, {
            id: "V1111",
            name: "RAP-4371",
            subName: "Honda HR-V 2022款",
            statusText: "管控中",
            statusType: "delisted",
            completed: 4,
            duration: 34,
            durationRate: 26,
            usageRate: 41,
            compare: -3.2,
            pending: 0,
            avgDuration: "8.5 hr"
          }, {
            id: "V1112",
            name: "RAQ-5803",
            subName: "Toyota Camry 2020款",
            statusText: "上架",
            statusType: "listed",
            completed: 4,
            duration: 31,
            durationRate: 23,
            usageRate: 39,
            compare: -1.8,
            pending: 0,
            avgDuration: "7.8 hr"
          }],
          12: [{
            id: "V1201",
            name: "RBA-6183",
            subName: "Toyota Corolla Cross 2023款",
            statusText: "上架",
            statusType: "listed",
            completed: 11,
            duration: 96,
            durationRate: 100,
            usageRate: 75,
            compare: 5.4,
            pending: 2,
            avgDuration: "8.7 hr"
          }, {
            id: "V1202",
            name: "RBD-2507",
            subName: "Honda CR-V 2022款",
            statusText: "上架",
            statusType: "listed",
            completed: 10,
            duration: 86,
            durationRate: 90,
            usageRate: 71,
            compare: 3.7,
            pending: 2,
            avgDuration: "8.6 hr"
          }, {
            id: "V1203",
            name: "RBF-9031",
            subName: "Toyota Altis 2021款",
            statusText: "下架",
            statusType: "delisted",
            completed: 8,
            duration: 68,
            durationRate: 71,
            usageRate: 62,
            compare: -0.6,
            pending: 1,
            avgDuration: "8.5 hr"
          }],
          13: [{
            id: "V1301",
            name: "RCA-8260",
            subName: "Nissan X-Trail 2023款",
            statusText: "上架",
            statusType: "listed",
            completed: 9,
            duration: 82,
            durationRate: 100,
            usageRate: 70,
            compare: 3.4,
            pending: 2,
            avgDuration: "9.1 hr"
          }, {
            id: "V1302",
            name: "RCE-3916",
            subName: "Toyota Camry 2021款",
            statusText: "上架",
            statusType: "listed",
            completed: 8,
            duration: 70,
            durationRate: 85,
            usageRate: 67,
            compare: 1.9,
            pending: 1,
            avgDuration: "8.8 hr"
          }, {
            id: "V1303",
            name: "RCF-7725",
            subName: "Lexus NX 2022款",
            statusText: "下架",
            statusType: "delisted",
            completed: 6,
            duration: 52,
            durationRate: 63,
            usageRate: 58,
            compare: -1.1,
            pending: 1,
            avgDuration: "8.7 hr"
          }],
          14: [{
            id: "V1401",
            name: "RDA-5097",
            subName: "Toyota RAV4 2022款",
            statusText: "上架",
            statusType: "listed",
            completed: 10,
            duration: 88,
            durationRate: 100,
            usageRate: 73,
            compare: 4.6,
            pending: 2,
            avgDuration: "8.8 hr"
          }, {
            id: "V1402",
            name: "RDC-6642",
            subName: "Mazda CX-5 2021款",
            statusText: "上架",
            statusType: "listed",
            completed: 8,
            duration: 70,
            durationRate: 80,
            usageRate: 66,
            compare: 1.5,
            pending: 1,
            avgDuration: "8.8 hr"
          }],
          15: [{
            id: "V1501",
            name: "REA-1738",
            subName: "Hyundai Tucson 2023款",
            statusText: "上架",
            statusType: "listed",
            completed: 6,
            duration: 48,
            durationRate: 100,
            usageRate: 63,
            compare: -0.8,
            pending: 1,
            avgDuration: "8.0 hr"
          }, {
            id: "V1502",
            name: "REC-4829",
            subName: "Toyota Sienta 2022款",
            statusText: "下架",
            statusType: "delisted",
            completed: 5,
            duration: 38,
            durationRate: 79,
            usageRate: 55,
            compare: -2.2,
            pending: 1,
            avgDuration: "7.6 hr"
          }],
          16: [{
            id: "V1601",
            name: "RFA-7206",
            subName: "Toyota Camry 2020款",
            statusText: "上架",
            statusType: "listed",
            completed: 5,
            duration: 44,
            durationRate: 100,
            usageRate: 57,
            compare: -2.7,
            pending: 1,
            avgDuration: "8.8 hr"
          }, {
            id: "V1602",
            name: "RFC-3185",
            subName: "Nissan Sentra 2021款",
            statusText: "下架",
            statusType: "delisted",
            completed: 4,
            duration: 32,
            durationRate: 73,
            usageRate: 49,
            compare: -4.1,
            pending: 1,
            avgDuration: "8.0 hr"
          }]
        },
        employeeSource: [{
          id: "E01",
          branchId: 11,
          name: "林佳穎",
          department: "業務一部",
          times: 18,
          durationSeconds: 42 * 3600 + 30 * 60
        }, {
          id: "E02",
          branchId: 11,
          name: "陳柏宇",
          department: "營運管理部",
          times: 16,
          durationSeconds: 38 * 3600 + 10 * 60
        }, {
          id: "E11",
          branchId: 11,
          name: "李冠霖",
          department: "業務一部",
          times: 13,
          durationSeconds: 30 * 3600 + 15 * 60
        }, {
          id: "E12",
          branchId: 11,
          name: "吳思婷",
          department: "客戶服務部",
          times: 11,
          durationSeconds: 26 * 3600 + 40 * 60
        }, {
          id: "E13",
          branchId: 11,
          name: "何俊廷",
          department: "工程維運部",
          times: 9,
          durationSeconds: 22 * 3600 + 20 * 60
        }, {
          id: "E14",
          branchId: 11,
          name: "郭怡君",
          department: "財務行政部",
          times: 8,
          durationSeconds: 18 * 3600 + 50 * 60
        }, {
          id: "E15",
          branchId: 11,
          name: "沈家豪",
          department: "資訊服務部",
          times: 7,
          durationSeconds: 16 * 3600 + 30 * 60
        }, {
          id: "E16",
          branchId: 11,
          name: "謝佩蓉",
          department: "人資總務部",
          times: 6,
          durationSeconds: 14 * 3600 + 10 * 60
        }, {
          id: "E03",
          branchId: 12,
          name: "張雅婷",
          department: "客戶服務部",
          times: 14,
          durationSeconds: 31 * 3600 + 45 * 60
        }, {
          id: "E17",
          branchId: 12,
          name: "羅明哲",
          department: "業務二部",
          times: 10,
          durationSeconds: 23 * 3600 + 20 * 60
        }, {
          id: "E18",
          branchId: 12,
          name: "洪雅琪",
          department: "採購管理部",
          times: 8,
          durationSeconds: 19 * 3600 + 5 * 60
        }, {
          id: "E04",
          branchId: 13,
          name: "黃志豪",
          department: "工程維運部",
          times: 11,
          durationSeconds: 28 * 3600 + 20 * 60
        }, {
          id: "E19",
          branchId: 13,
          name: "邱子軒",
          department: "資訊服務部",
          times: 8,
          durationSeconds: 18 * 3600 + 40 * 60
        }, {
          id: "E05",
          branchId: 15,
          name: "吳佩珊",
          department: "財務行政部",
          times: 9,
          durationSeconds: 21 * 3600 + 50 * 60
        }, {
          id: "E06",
          branchId: 14,
          name: "劉冠廷",
          department: "業務二部",
          times: 8,
          durationSeconds: 18 * 3600 + 15 * 60
        }, {
          id: "E20",
          branchId: 14,
          name: "彭鬱雯",
          department: "營運管理部",
          times: 7,
          durationSeconds: 17 * 3600 + 10 * 60
        }, {
          id: "E07",
          branchId: 12,
          name: "蔡宜庭",
          department: "採購管理部",
          times: 7,
          durationSeconds: 16 * 3600 + 40 * 60
        }, {
          id: "E08",
          branchId: 13,
          name: "許家銘",
          department: "資訊服務部",
          times: 6,
          durationSeconds: 14 * 3600 + 25 * 60
        }, {
          id: "E09",
          branchId: 14,
          name: "鄭惠如",
          department: "人資總務部",
          times: 5,
          durationSeconds: 12 * 3600 + 10 * 60
        }, {
          id: "E10",
          branchId: 16,
          name: "周俊賢",
          department: "法務合規部",
          times: 4,
          durationSeconds: 9 * 3600 + 35 * 60
        }],
        departmentStats: {
          total: [{
            name: "臺北分公司 - 業務一部",
            durationMonth: 128,
            durationYear: 1468,
            timesMonth: 31,
            timesYear: 356
          }, {
            name: "臺北分公司 - 營運管理部",
            durationMonth: 106,
            durationYear: 1210,
            timesMonth: 24,
            timesYear: 284
          }, {
            name: "新北分公司 - 客戶服務部",
            durationMonth: 86,
            durationYear: 998,
            timesMonth: 21,
            timesYear: 242
          }, {
            name: "臺中分公司 - 業務二部",
            durationMonth: 78,
            durationYear: 912,
            timesMonth: 18,
            timesYear: 216
          }, {
            name: "桃園分公司 - 工程維運部",
            durationMonth: 66,
            durationYear: 785,
            timesMonth: 15,
            timesYear: 178
          }, {
            name: "臺南分公司 - 財務行政部",
            durationMonth: 52,
            durationYear: 624,
            timesMonth: 12,
            timesYear: 142
          }, {
            name: "高雄分公司 - 業務一部",
            durationMonth: 46,
            durationYear: 536,
            timesMonth: 10,
            timesYear: 126
          }, {
            name: "新北分公司 - 採購管理部",
            durationMonth: 42,
            durationYear: 486,
            timesMonth: 9,
            timesYear: 106
          }, {
            name: "臺中分公司 - 人資總務部",
            durationMonth: 34,
            durationYear: 418,
            timesMonth: 8,
            timesYear: 92
          }, {
            name: "桃園分公司 - 資訊服務部",
            durationMonth: 28,
            durationYear: 336,
            timesMonth: 6,
            timesYear: 74
          }, {
            name: "臺南分公司 - 法務合規部",
            durationMonth: 24,
            durationYear: 288,
            timesMonth: 5,
            timesYear: 62
          }, {
            name: "高雄分公司 - 營運管理部",
            durationMonth: 18,
            durationYear: 216,
            timesMonth: 4,
            timesYear: 48
          }],
          11: [{
            name: "業務一部",
            durationMonth: 128,
            durationYear: 1468,
            timesMonth: 31,
            timesYear: 356
          }, {
            name: "營運管理部",
            durationMonth: 106,
            durationYear: 1210,
            timesMonth: 24,
            timesYear: 284
          }, {
            name: "財務行政部",
            durationMonth: 58,
            durationYear: 704,
            timesMonth: 13,
            timesYear: 154
          }, {
            name: "客戶服務部",
            durationMonth: 54,
            durationYear: 642,
            timesMonth: 12,
            timesYear: 138
          }, {
            name: "工程維運部",
            durationMonth: 48,
            durationYear: 590,
            timesMonth: 10,
            timesYear: 126
          }, {
            name: "資訊服務部",
            durationMonth: 36,
            durationYear: 438,
            timesMonth: 8,
            timesYear: 96
          }, {
            name: "人資總務部",
            durationMonth: 28,
            durationYear: 336,
            timesMonth: 6,
            timesYear: 72
          }, {
            name: "法務合規部",
            durationMonth: 22,
            durationYear: 268,
            timesMonth: 5,
            timesYear: 58
          }],
          12: [{
            name: "客戶服務部",
            durationMonth: 86,
            durationYear: 998,
            timesMonth: 21,
            timesYear: 242
          }, {
            name: "採購管理部",
            durationMonth: 42,
            durationYear: 486,
            timesMonth: 9,
            timesYear: 106
          }, {
            name: "業務二部",
            durationMonth: 38,
            durationYear: 452,
            timesMonth: 8,
            timesYear: 96
          }, {
            name: "營運管理部",
            durationMonth: 34,
            durationYear: 408,
            timesMonth: 7,
            timesYear: 84
          }, {
            name: "財務行政部",
            durationMonth: 26,
            durationYear: 318,
            timesMonth: 6,
            timesYear: 70
          }, {
            name: "資訊服務部",
            durationMonth: 18,
            durationYear: 226,
            timesMonth: 4,
            timesYear: 52
          }],
          13: [{
            name: "工程維運部",
            durationMonth: 66,
            durationYear: 785,
            timesMonth: 15,
            timesYear: 178
          }, {
            name: "資訊服務部",
            durationMonth: 28,
            durationYear: 336,
            timesMonth: 6,
            timesYear: 74
          }, {
            name: "財務行政部",
            durationMonth: 24,
            durationYear: 294,
            timesMonth: 5,
            timesYear: 62
          }, {
            name: "業務一部",
            durationMonth: 22,
            durationYear: 264,
            timesMonth: 5,
            timesYear: 58
          }, {
            name: "營運管理部",
            durationMonth: 18,
            durationYear: 218,
            timesMonth: 4,
            timesYear: 46
          }, {
            name: "人資總務部",
            durationMonth: 14,
            durationYear: 168,
            timesMonth: 3,
            timesYear: 36
          }],
          14: [{
            name: "業務二部",
            durationMonth: 78,
            durationYear: 912,
            timesMonth: 18,
            timesYear: 216
          }, {
            name: "人資總務部",
            durationMonth: 34,
            durationYear: 418,
            timesMonth: 8,
            timesYear: 92
          }, {
            name: "營運管理部",
            durationMonth: 30,
            durationYear: 356,
            timesMonth: 7,
            timesYear: 80
          }, {
            name: "客戶服務部",
            durationMonth: 26,
            durationYear: 312,
            timesMonth: 6,
            timesYear: 72
          }, {
            name: "財務行政部",
            durationMonth: 22,
            durationYear: 268,
            timesMonth: 5,
            timesYear: 60
          }, {
            name: "工程維運部",
            durationMonth: 18,
            durationYear: 216,
            timesMonth: 4,
            timesYear: 48
          }],
          15: [{
            name: "財務行政部",
            durationMonth: 52,
            durationYear: 624,
            timesMonth: 12,
            timesYear: 142
          }, {
            name: "法務合規部",
            durationMonth: 24,
            durationYear: 288,
            timesMonth: 5,
            timesYear: 62
          }, {
            name: "客戶服務部",
            durationMonth: 22,
            durationYear: 254,
            timesMonth: 5,
            timesYear: 58
          }, {
            name: "業務一部",
            durationMonth: 18,
            durationYear: 214,
            timesMonth: 4,
            timesYear: 48
          }, {
            name: "營運管理部",
            durationMonth: 14,
            durationYear: 172,
            timesMonth: 3,
            timesYear: 36
          }],
          16: [{
            name: "業務一部",
            durationMonth: 46,
            durationYear: 536,
            timesMonth: 10,
            timesYear: 126
          }, {
            name: "營運管理部",
            durationMonth: 18,
            durationYear: 216,
            timesMonth: 4,
            timesYear: 48
          }, {
            name: "工程維運部",
            durationMonth: 16,
            durationYear: 192,
            timesMonth: 3,
            timesYear: 38
          }, {
            name: "財務行政部",
            durationMonth: 12,
            durationYear: 148,
            timesMonth: 3,
            timesYear: 32
          }, {
            name: "客戶服務部",
            durationMonth: 10,
            durationYear: 126,
            timesMonth: 2,
            timesYear: 28
          }]
        },
        vehicleSource: [{
          branchId: 11,
          plate: "RAB-5826",
          station: "臺北總部地下停車場",
          times: 18,
          durationSeconds: 42 * 3600 + 30 * 60
        }, {
          branchId: 11,
          plate: "RAC-7305",
          station: "內湖科技園區停車場",
          times: 16,
          durationSeconds: 37 * 3600 + 40 * 60
        }, {
          branchId: 11,
          plate: "RAE-1968",
          station: "臺北總部地下停車場",
          times: 14,
          durationSeconds: 32 * 3600 + 20 * 60
        }, {
          branchId: 11,
          plate: "RAF-4219",
          station: "南港軟體園區停車場",
          times: 12,
          durationSeconds: 28 * 3600 + 50 * 60
        }, {
          branchId: 11,
          plate: "RAH-9052",
          station: "內湖科技園區停車場",
          times: 10,
          durationSeconds: 24 * 3600 + 30 * 60
        }, {
          branchId: 11,
          plate: "RAJ-3186",
          station: "臺北總部地下停車場",
          times: 9,
          durationSeconds: 21 * 3600 + 15 * 60
        }, {
          branchId: 11,
          plate: "RAK-6402",
          station: "松山辦公室停車場",
          times: 8,
          durationSeconds: 18 * 3600 + 45 * 60
        }, {
          branchId: 11,
          plate: "RAL-7729",
          station: "南港軟體園區停車場",
          times: 7,
          durationSeconds: 16 * 3600 + 20 * 60
        }, {
          branchId: 11,
          plate: "RAM-2058",
          station: "松山辦公室停車場",
          times: 6,
          durationSeconds: 14 * 3600 + 40 * 60
        }, {
          branchId: 11,
          plate: "RAN-9164",
          station: "臺北總部地下停車場",
          times: 5,
          durationSeconds: 12 * 3600 + 10 * 60
        }, {
          branchId: 12,
          plate: "RBA-6183",
          station: "板橋辦公大樓停車場",
          times: 13,
          durationSeconds: 30 * 3600 + 20 * 60
        }, {
          branchId: 12,
          plate: "RBD-2507",
          station: "新店裕隆城停車場",
          times: 11,
          durationSeconds: 26 * 3600 + 10 * 60
        }, {
          branchId: 12,
          plate: "RBF-9031",
          station: "板橋辦公大樓停車場",
          times: 9,
          durationSeconds: 22 * 3600 + 25 * 60
        }, {
          branchId: 12,
          plate: "RBG-7614",
          station: "汐止遠雄園區停車場",
          times: 7,
          durationSeconds: 17 * 3600 + 30 * 60
        }, {
          branchId: 14,
          plate: "RDA-5097",
          station: "臺中公益辦公室停車場",
          times: 12,
          durationSeconds: 28 * 3600 + 10 * 60
        }, {
          branchId: 14,
          plate: "RDC-6642",
          station: "臺中七期辦公室停車場",
          times: 10,
          durationSeconds: 23 * 3600 + 20 * 60
        }, {
          branchId: 14,
          plate: "RDE-4028",
          station: "臺中公益辦公室停車場",
          times: 8,
          durationSeconds: 19 * 3600 + 45 * 60
        }, {
          branchId: 14,
          plate: "RDF-1956",
          station: "臺中七期辦公室停車場",
          times: 6,
          durationSeconds: 14 * 3600 + 35 * 60
        }, {
          branchId: 13,
          plate: "RCA-8260",
          station: "桃園青埔辦公區停車場",
          times: 10,
          durationSeconds: 24 * 3600 + 45 * 60
        }, {
          branchId: 13,
          plate: "RCE-3916",
          station: "桃園中壢倉辦停車場",
          times: 8,
          durationSeconds: 19 * 3600 + 30 * 60
        }, {
          branchId: 15,
          plate: "REA-1738",
          station: "臺南永康廠辦停車場",
          times: 8,
          durationSeconds: 19 * 3600 + 35 * 60
        }, {
          branchId: 16,
          plate: "RFA-7206",
          station: "高雄前鎮辦公室停車場",
          times: 6,
          durationSeconds: 15 * 3600 + 20 * 60
        }, {
          branchId: 13,
          plate: "RCF-7725",
          station: "桃園中壢倉辦停車場",
          times: 5,
          durationSeconds: 12 * 3600 + 50 * 60
        }, {
          branchId: 15,
          plate: "REC-4829",
          station: "臺南安平辦公室停車場",
          times: 4,
          durationSeconds: 10 * 3600 + 5 * 60
        }, {
          branchId: 16,
          plate: "RFC-3185",
          station: "高雄左營辦公室停車場",
          times: 3,
          durationSeconds: 7 * 3600 + 45 * 60
        }],
        overallChart: null
      };
    },
    computed: {
      usageRateLabel() {
        return this.usageBasis === 'work' ? '工作時段使用率' : '自然日使用率';
      },
      usageMetricLabel() {
        return '本月' + this.usageRateLabel;
      },
      usageBasisSwitchLabel() {
        return '切換為' + (this.usageBasis === 'work' ? '自然日使用率' : '工作時段使用率');
      },
      usageScopedVehicles() {
        return this.usageVehicles.filter(v => this.isHeadquartersScope || v.branchId === this.selectedCompany);
      },
      usageCurrentVehicles() {
        return this.usageScopedVehicles.map(v => usageEngine.calculate(v, usageEngine.at('2026-11-01T00:00'), this.usageSnapshotAt, this.usageBasis));
      },
      usagePreviousVehicles() {
        return this.usageScopedVehicles.map(v => usageEngine.calculate(v, usageEngine.at('2026-10-01T00:00'), usageEngine.at('2026-10-05T15:00'), this.usageBasis));
      },
      usageCurrentSummary() {
        return usageEngine.total(this.usageCurrentVehicles);
      },
      usagePreviousSummary() {
        return usageEngine.total(this.usagePreviousVehicles);
      },
      usageComparison() {
        return this.usageRateDifference(this.usageCurrentSummary.rate, this.usagePreviousSummary.rate);
      },
      usageSummary() {
        return this.usagePeriod === 'current' ? this.usageCurrentSummary : this.usagePreviousSummary;
      },
      usagePeriodLabel() {
        return this.usagePeriod === 'current' ? '2026-11-01 00:00 至 2026-11-05 15:00' : '2026-10-01 00:00 至 2026-10-05 15:00';
      },
      usagePeriodVehicles() {
        return this.usagePeriod === 'current' ? this.usageCurrentVehicles : this.usagePreviousVehicles;
      },
      usageFilteredVehicles() {
        const query = this.usageQuery.trim().toUpperCase();
        return this.usagePeriodVehicles.filter(v => v.serviceMs > 0 && (!query || v.plate.includes(query)) && (!this.usageBranchFilter || v.branchId === this.usageBranchFilter)).sort((a, b) => a.branchId - b.branchId || a.plate.localeCompare(b.plate));
      },
      usagePagedVehicles() {
        return this.usageFilteredVehicles.slice((this.usagePage - 1) * 10, this.usagePage * 10);
      },
      usageSelectedVehicle() {
        return this.usagePeriodVehicles.find(v => v.id === this.usageSelectedVehicleId && v.serviceMs > 0);
      },
      usageServiceLedger() {
        if (!this.usageSelectedVehicle) return [];
        return this.usageSelectedVehicle.serviceRecords.map(record => ({
          id: record.id,
          operatedAt: record.originalStart,
          listed: record.listed,
          action: record.listed ? '上架' : '下架',
          serviceMs: record.serviceMs
        }));
      },
      isHeadquartersScope() {
        return this.selectedCompany === 1;
      },
      topMetrics() {
        const metrics = this.topMetricsMap[this.selectedCompany] || this.topMetricsMap[1];
        const availableVehicles = this.usageScopedVehicles.filter(this.isMockVehicleListed).length;
        const monthUsageTimes = this.usageCurrentVehicles.reduce((sum, v) => sum + v.orderRecords.length, 0);
        const previousTimes = this.usagePreviousVehicles.reduce((sum, v) => sum + v.orderRecords.length, 0);
        const change = previousTimes ? (monthUsageTimes - previousTimes) / previousTimes * 100 : null;
        return {
          ...metrics,
          vehicleTotal: this.usageScopedVehicles.length,
          availableVehicles,
          totalUsageTimes: this.usageScopedVehicles.reduce((sum, v) => sum + v.orders.length, 0),
          monthUsageTimes,
          monthUsageTrend: change == null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
          monthUsageTrendType: this.getBriefingTrendClass(change),
          availableVehicleRate: this.usageScopedVehicles.length ? Math.round(availableVehicles / this.usageScopedVehicles.length * 100) : 0
        };
      },
      currentScopeLabel() {
        return this.findCompanyLabel(this.companyTreeList, this.selectedCompany) || "RITI 總公司";
      },
      briefingTitle() {
        return this.isHeadquartersScope ? "各分公司使用狀況總覽" : `${this.currentScopeLabel}車輛使用狀況總覽`;
      },
      briefingNameLabel() {
        return this.isHeadquartersScope ? "分公司" : "車輛";
      },
      briefingStatusLabel() {
        return this.isHeadquartersScope ? "所屬車輛（可用 / 總數）" : "車輛狀態";
      },
      briefingHelpFields() {
        return [{
          name: this.briefingNameLabel,
          desc: this.isHeadquartersScope ? "總公司視角顯示各分公司名稱，用於比較不同分公司的公務車使用狀況。" : "分公司視角顯示資產歸屬本分公司的車牌與車型，不含其他單位共享車輛。"
        }, {
          name: this.briefingStatusLabel,
          desc: this.isHeadquartersScope ? "按車輛資產歸屬統計：可用數為本分公司所屬車輛中已上架且綁定有效合約的數量，總數為所屬車輛總數；不含其他單位共享車輛。進度條為兩者比例，不表示此刻空閒。" : "顯示車輛目前狀態，例如可用、使用中或管控中。"
        }, {
          name: "本月已完成",
          desc: "本月已完成的公務車用車訂單數量，不包含取消、未開始、使用中或仍待完成的訂單。"
        }, {
          name: "本月用車時長 (hr)",
          desc: "本月已完成訂單累計用車時長，單位為小時，用於觀察實際佔用車輛資源的總量。"
        }, {
          name: this.usageRateLabel,
          desc: "按車輛資產歸屬，計入用車時長合計 ÷ 有效服務時長合計 × 100%；其他分公司員工使用該車也歸入車輛所屬單位。工作時段按週一至週五 09:00–18:00，自然日按每日 00:00–24:00 計算；下架後仍用車繼續計入。"
        }, {
          name: "較上月同期",
          desc: "本月使用率減去上月相同日期、時刻截止的使用率，以 % 符號顯示；任一期間有效服務時長為 0 時顯示 —。"
        }, {
          name: "未完成訂單",
          desc: "目前尚未完成的訂單數量，包含已預約尚未完成取還車流程的訂單，以及正在用車中的訂單。"
        }, {
          name: "平均每次時長",
          desc: "本月已完成訂單的平均用車時長，計算方式為本月用車時長除以本月已完成次數。"
        }];
      },
      briefingRows() {
        const rows = this.isHeadquartersScope ? this.branchBriefRows : this.vehicleBriefMap[this.selectedCompany] || [];
        const result = rows.map((row, index) => {
          const matches = v => this.isHeadquartersScope ? v.branchId === this.companyTreeList[0].children[index].value : v.plate === row.name;
          const vehicles = this.usageScopedVehicles.filter(matches);
          if (!this.isHeadquartersScope && !vehicles.length) return null;
          const currentVehicles = this.usageCurrentVehicles.filter(matches);
          const current = usageEngine.total(currentVehicles);
          const previous = usageEngine.total(this.usagePreviousVehicles.filter(matches));
          const available = vehicles.filter(this.isMockVehicleListed).length;
          const orders = currentVehicles.flatMap(v => v.orderRecords);
          const completedOrders = orders.filter(o => o.end && o.end <= this.usageSnapshotAt);
          const duration = Number((completedOrders.reduce((sum, o) => sum + o.actualMs, 0) / 3600000).toFixed(1));
          return {
            ...row,
            available,
            total: vehicles.length,
            availableRate: vehicles.length ? available / vehicles.length * 100 : 0,
            statusType: available ? 'listed' : 'delisted',
            statusText: available ? '上架' : '下架',
            completed: completedOrders.length,
            pending: orders.length - completedOrders.length,
            duration,
            avgDuration: completedOrders.length ? `${(duration / completedOrders.length).toFixed(1)} hr` : '0 hr',
            usageRate: current.rate,
            compare: this.usageRateDifference(current.rate, previous.rate)
          };
        }).filter(Boolean);
        const maximum = Math.max(...result.map(r => r.duration), 1);
        return result.map(row => ({
          ...row,
          durationRate: row.duration / maximum * 100
        }));
      },
      briefingTotal() {
        const rows = this.briefingRows;
        const completed = rows.reduce((sum, row) => sum + row.completed, 0);
        const duration = rows.reduce((sum, row) => sum + row.duration, 0);
        const pending = rows.reduce((sum, row) => sum + row.pending, 0);
        const available = this.isHeadquartersScope ? rows.reduce((sum, row) => sum + row.available, 0) : rows.filter(row => row.statusType === "listed").length;
        const total = this.isHeadquartersScope ? rows.reduce((sum, row) => sum + row.total, 0) : rows.length;
        const usageRate = this.usageCurrentSummary.rate;
        const compare = this.usageComparison;
        const avgDuration = completed ? `${(duration / completed).toFixed(1)} hr` : "0 hr";
        return {
          status: `${available} / ${total}`,
          completed,
          duration,
          usageRate,
          compare,
          pending,
          avgDuration
        };
      },
      employeeRows() {
        const rows = this.employeeSource.filter(item => this.isHeadquartersScope || item.branchId === this.selectedCompany).sort((a, b) => {
          return this.employeeSort === "times" ? b.times - a.times : b.durationSeconds - a.durationSeconds;
        });
        return rows.map(item => ({
          ...item,
          duration: this.formatSeconds(item.durationSeconds)
        }));
      },
      vehicleRows() {
        const rows = this.usageCurrentVehicles.map(v => ({
          branchId: v.branchId,
          plate: v.plate,
          station: this.vehicleSource.find(item => item.plate === v.plate)?.station || '—',
          times: v.orderRecords.length,
          durationSeconds: v.actualMs / 1000
        })).sort((a, b) => {
          return this.vehicleSort === "times" ? b.times - a.times : b.durationSeconds - a.durationSeconds;
        });
        return rows.map(item => ({
          ...item,
          duration: this.formatSeconds(item.durationSeconds)
        }));
      },
      departmentMetricLabel() {
        return this.departmentMetric === "duration" ? "用車時間" : "用車次數";
      },
      departmentMetricUnit() {
        return this.departmentMetric === "duration" ? "hr" : "次";
      },
      departmentChartScopeText() {
        return this.isHeadquartersScope ? "總公司 / 分公司部門" : `${this.currentScopeLabel} / 部門`;
      },
      departmentChartTitle() {
        const period = this.departmentMode === "month" ? "本月" : "今年";
        return `${period}${this.departmentMetricLabel}排行`;
      },
      departmentChartRows() {
        const source = this.departmentStats[this.isHeadquartersScope ? "total" : this.selectedCompany] || this.departmentStats[11] || [];
        const key = `${this.departmentMetric}${this.departmentMode === "month" ? "Month" : "Year"}`;
        return source.map(item => ({
          name: item.name,
          value: item[key] || 0
        })).sort((a, b) => b.value - a.value);
      },
      departmentMaxValue() {
        return Math.max(...this.departmentChartRows.map(item => item.value), 1);
      }
    },
    watch: {
      selectedCompany() {
        this.usageVehicleDetailsVisible = false;
        this.usageSelectedVehicleId = '';
        this.usageBranchFilter = '';
        this.usagePage = 1;
        this.renderOverallChart();
      },
      usageQuery() {
        this.usagePage = 1;
      },
      usageBranchFilter() {
        this.usagePage = 1;
      },
      usagePeriod() {
        this.usagePage = 1;
      },
      usageBasis() {
        this.usagePage = 1;
        this.renderOverallChart();
      },
      overallMode() {
        this.renderOverallChart();
      }
    },
    created() {
      this.usageVehicles = usageEngine.mock(this.companyTreeList[0].children, this.vehicleSource);
    },
    mounted() {
      nextTick(() => {
        this.overallChart = model.markRaw(model.chart(echarts, this.$refs.overallChartRef));
        this.renderOverallChart();
        window.addEventListener("resize", this.handleResize);
      });
    },
    beforeUnmount() {
      window.removeEventListener("resize", this.handleResize);
      if (this.overallChart) this.overallChart.dispose();
    },
    methods: {
      toggleUsageBasis() {
        this.usageBasis = this.usageBasis === 'work' ? 'calendar' : 'work';
      },
      isMockVehicleListed(vehicle) {
        const events = vehicle.events.filter(e => e.at <= this.usageSnapshotAt).sort((a, b) => a.at - b.at);
        return !!events[events.length - 1]?.listed;
      },
      openUsageDetails() {
        this.usagePeriod = 'current';
        this.usagePage = 1;
        this.usageQuery = '';
        this.usageBranchFilter = '';
        this.usageVehicleDetailsVisible = false;
        this.usageSelectedVehicleId = '';
        this.usageDetailsVisible = true;
      },
      showUsageVehicle(row, tab) {
        this.usageSelectedVehicleId = row.id;
        this.usageDetailTab = tab;
        this.usageVehicleDetailsVisible = true;
      },
      usageCsvContent(headers, rows) {
        const cell = value => {
          let text = String(value ?? '');
          if (/^[=+@\t\r-]/.test(text)) text = "'" + text;
          return '"' + text.replace(/"/g, '""') + '"';
        };
        return '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
      },
      saveUsageCsv(name, headers, rows) {
        const blob = new Blob([this.usageCsvContent(headers, rows)], {
          type: 'text/csv;charset=utf-8'
        });
        const url = URL.createObjectURL(blob),
          link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      usageExportContext() {
        return [this.usagePeriodLabel, this.usageBasis === 'work' ? '週一至週五09:00–18:00' : '自然日'];
      },
      downloadUsageVehicles() {
        const rows = this.usageFilteredVehicles.map(row => [row.plate, row.branchName, Math.floor(row.serviceMs / 60000), Math.floor(row.actualMs / 60000), Math.floor(row.usedMs / 60000), this.displayUsageRate(row.rate), ...this.usageExportContext()]);
        this.saveUsageCsv(`使用率車輛清單_${this.selectedCompany}_${this.usagePeriod}_${this.usageBasis}.csv`, ['車牌', '分公司', '有效服務分鐘', '本期實際用車分鐘', '計入用車分鐘', '使用率', '統計期間', '統計口徑'], rows);
      },
      downloadUsageVehicleDetails() {
        const vehicle = this.usageSelectedVehicle;
        if (!vehicle) return;
        const context = [vehicle.plate, vehicle.branchName, ...this.usageExportContext()];
        if (this.usageDetailTab === 'service') {
          const rows = this.usageServiceLedger.map(row => [this.displayUsageTime(row.operatedAt), row.action, Math.floor(row.serviceMs / 60000), ...context]);
          this.saveUsageCsv(`${vehicle.plate}_服務流水_${this.usagePeriod}_${this.usageBasis}.csv`, ['操作時間', '操作', '本期計入分鐘', '車牌', '分公司', '統計期間', '統計口徑'], rows);
        } else {
          const rows = vehicle.orderRecords.map(row => [row.id, row.employee, this.displayUsageTime(row.start), row.end ? this.displayUsageTime(row.end) : '用車中', Math.floor(row.fullActualMs / 60000), Math.floor(row.actualMs / 60000), Math.floor(row.usedMs / 60000), this.displayUsageTime(row.clippedStart), this.displayUsageTime(row.clippedEnd), Math.floor(row.excludedMs / 60000), Math.floor(row.overlapMs / 60000), ...context]);
          this.saveUsageCsv(`${vehicle.plate}_用車訂單_${this.usagePeriod}_${this.usageBasis}.csv`, ['訂單編號', '用車員工', '實際取車', '實際還車', '完整已發生分鐘', '本期實際分鐘', '計入用車分鐘', '本期開始', '本期結束', '非工作時段扣除分鐘', '重疊扣除分鐘', '車牌', '分公司', '統計期間', '統計口徑'], rows);
        }
      },
      usageRateDifference(current, previous) {
        return current == null || previous == null ? null : current - previous;
      },
      displayUsageRate(value) {
        return value == null ? '—' : `${value.toFixed(1)}%`;
      },
      displayUsageDifference(value) {
        return value == null ? '—' : `${Number(value.toFixed(1)) > 0 ? '+' : Number(value.toFixed(1)) < 0 ? '-' : ''}${Math.abs(value).toFixed(1)}%`;
      },
      displayUsageDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        if (minutes < 60) return `${minutes} 分`;
        return `${Math.floor(minutes / 60)} 小時${minutes % 60 ? ` ${minutes % 60} 分` : ''}`;
      },
      displayUsageTime(value) {
        if (value == null) return '—';
        return new Date(value + 8 * 3600000).toISOString().slice(0, 16).replace('T', ' ');
      },
      findCompanyLabel(nodes, value) {
        for (const node of nodes) {
          if (node.value === value) return node.label;
          if (node.children) {
            const childLabel = this.findCompanyLabel(node.children, value);
            if (childLabel) return childLabel;
          }
        }
        return "";
      },
      formatNumber(value) {
        return Number(value || 0).toLocaleString();
      },
      formatCompare(value) {
        return this.displayUsageDifference(value);
      },
      getBriefingTrendClass(value) {
        const numericValue = Number(Number(value || 0).toFixed(1));
        if (numericValue > 0) return "is-up";
        if (numericValue < 0) return "is-down";
        return "is-flat";
      },
      getSparklinePath(type) {
        if (type === "is-down") return "M2 5 C12 7, 17 8, 24 7 S38 10, 45 14 S55 19, 62 20";
        if (type === "is-flat") return "M2 13 C12 12, 18 13, 25 12 S39 11, 47 12 S56 13, 62 12";
        return "M2 19 C12 18, 17 15, 24 16 S38 12, 45 9 S55 6, 62 4";
      },
      departmentBarWidth(value) {
        const percent = Math.round(Number(value || 0) / this.departmentMaxValue * 100);
        return `${Math.max(percent, 6)}%`;
      },
      handleResize() {
        if (this.overallChart) this.overallChart.resize();
      },
      formatSeconds(totalSeconds) {
        if (!totalSeconds) return "0m";
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor(totalSeconds % 3600 / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
      },
      renderOverallChart() {
        if (!this.overallChart) return;
        const rate = (start, end) => usageEngine.total(this.usageScopedVehicles.map(v => usageEngine.calculate(v, start, end, this.usageBasis))).rate;
        const monthly = this.overallMode === 'month';
        const points = Array.from({
          length: monthly ? 5 : 11
        }, (_, i) => i + 1);
        const periodRate = (point, previous) => {
          const year = previous && !monthly ? 2025 : 2026;
          const month = monthly ? previous ? 10 : 11 : point;
          const pad = n => String(n).padStart(2, '0');
          const start = usageEngine.at(`${year}-${pad(month)}-${monthly ? pad(point) : '01'}T00:00`);
          const cutoff = usageEngine.at(previous && monthly ? '2026-10-05T15:00' : previous ? '2025-11-05T15:00' : '2026-11-05T15:00');
          const next = monthly ? start + 86400000 : Date.UTC(year, month, 1) - 8 * 3600000;
          return rate(start, Math.min(next, cutoff));
        };
        const source = {
          x: points.map(p => `${p}${monthly ? '日' : '月'}`),
          currentName: monthly ? '本月' : '今年',
          previousName: monthly ? '上月同期' : '去年同期',
          current: points.map(p => periodRate(p, false)),
          previous: points.map(p => periodRate(p, true))
        };
        this.overallChart.setOption({
          color: ["#0f9b8e", "#4f7cff"],
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255,255,255,0.98)",
            borderColor: "#d7dde6",
            borderWidth: 1,
            textStyle: {
              color: "#1f2937"
            },
            extraCssText: "box-shadow: 0 8px 24px rgba(15,23,42,0.1); border-radius: 8px;",
            axisPointer: {
              type: "line",
              lineStyle: {
                color: "#cfd8e3",
                type: "dashed"
              }
            }
          },
          legend: {
            data: [source.currentName, source.previousName],
            type: "scroll",
            right: 0,
            top: 0,
            itemGap: 14,
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
              color: "#6b7280",
              fontSize: 12
            }
          },
          grid: {
            left: 18,
            right: 18,
            top: 38,
            bottom: 24,
            containLabel: true
          },
          xAxis: [{
            type: "category",
            boundaryGap: false,
            data: source.x,
            axisLine: {
              show: true,
              lineStyle: {
                color: "#d9dee7"
              }
            },
            axisTick: {
              show: true,
              alignWithLabel: true,
              lineStyle: {
                color: "#d9dee7"
              }
            },
            axisLabel: {
              show: true,
              interval: 0,
              color: "#64748b",
              fontSize: 12,
              margin: 12
            }
          }],
          yAxis: [{
            type: "value",
            min: 0,
            max: 100,
            interval: 20,
            splitNumber: 5,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              lineStyle: {
                color: "#edf1f5",
                type: "dashed"
              }
            },
            axisLabel: {
              show: true,
              color: "#64748b",
              fontSize: 12,
              margin: 10,
              formatter: "{value}%"
            }
          }],
          series: [{
            name: source.currentName,
            smooth: false,
            type: "line",
            showSymbol: false,
            lineStyle: {
              width: 2
            },
            areaStyle: {
              opacity: 0.08,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: "rgba(15, 155, 142, 0.18)"
              }, {
                offset: 1,
                color: "rgba(15, 155, 142, 0.02)"
              }])
            },
            data: source.current
          }, {
            name: source.previousName,
            smooth: false,
            type: "line",
            showSymbol: false,
            lineStyle: {
              width: 2
            },
            areaStyle: {
              opacity: 0.06,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: "rgba(79, 124, 255, 0.16)"
              }, {
                offset: 1,
                color: "rgba(79, 124, 255, 0.02)"
              }])
            },
            data: source.previous
          }]
        });
      },
      renderDepartmentChart() {
        if (!this.departmentChart) return;
        const sourceMap = {
          duration: {
            month: {
              total: [{
                name: "臺北分公司 - 業務一部",
                value: 128
              }, {
                name: "臺北分公司 - 營運管理部",
                value: 106
              }, {
                name: "新北分公司 - 客戶服務部",
                value: 86
              }, {
                name: "臺中分公司 - 業務二部",
                value: 78
              }, {
                name: "桃園分公司 - 工程維運部",
                value: 66
              }, {
                name: "臺南分公司 - 財務行政部",
                value: 52
              }],
              11: [{
                name: "業務一部",
                value: 128
              }, {
                name: "營運管理部",
                value: 106
              }, {
                name: "財務行政部",
                value: 58
              }],
              12: [{
                name: "客戶服務部",
                value: 86
              }, {
                name: "採購管理部",
                value: 42
              }, {
                name: "業務二部",
                value: 38
              }],
              13: [{
                name: "工程維運部",
                value: 66
              }, {
                name: "資訊服務部",
                value: 28
              }, {
                name: "財務行政部",
                value: 24
              }],
              14: [{
                name: "業務二部",
                value: 78
              }, {
                name: "人資總務部",
                value: 34
              }, {
                name: "營運管理部",
                value: 30
              }],
              15: [{
                name: "財務行政部",
                value: 52
              }, {
                name: "法務合規部",
                value: 24
              }, {
                name: "客戶服務部",
                value: 22
              }],
              16: [{
                name: "業務一部",
                value: 46
              }, {
                name: "營運管理部",
                value: 18
              }, {
                name: "工程維運部",
                value: 16
              }]
            },
            year: {
              total: [{
                name: "臺北分公司 - 業務一部",
                value: 1468
              }, {
                name: "臺北分公司 - 營運管理部",
                value: 1210
              }, {
                name: "新北分公司 - 客戶服務部",
                value: 998
              }, {
                name: "臺中分公司 - 業務二部",
                value: 912
              }, {
                name: "桃園分公司 - 工程維運部",
                value: 785
              }, {
                name: "臺南分公司 - 財務行政部",
                value: 624
              }],
              11: [{
                name: "業務一部",
                value: 1468
              }, {
                name: "營運管理部",
                value: 1210
              }, {
                name: "財務行政部",
                value: 704
              }],
              12: [{
                name: "客戶服務部",
                value: 998
              }, {
                name: "採購管理部",
                value: 486
              }, {
                name: "業務二部",
                value: 452
              }],
              13: [{
                name: "工程維運部",
                value: 785
              }, {
                name: "資訊服務部",
                value: 336
              }, {
                name: "財務行政部",
                value: 294
              }],
              14: [{
                name: "業務二部",
                value: 912
              }, {
                name: "人資總務部",
                value: 418
              }, {
                name: "營運管理部",
                value: 356
              }],
              15: [{
                name: "財務行政部",
                value: 624
              }, {
                name: "法務合規部",
                value: 288
              }, {
                name: "客戶服務部",
                value: 254
              }],
              16: [{
                name: "業務一部",
                value: 536
              }, {
                name: "營運管理部",
                value: 216
              }, {
                name: "工程維運部",
                value: 192
              }]
            }
          },
          times: {
            month: {
              total: [{
                name: "臺北分公司 - 業務一部",
                value: 31
              }, {
                name: "臺北分公司 - 營運管理部",
                value: 24
              }, {
                name: "新北分公司 - 客戶服務部",
                value: 21
              }, {
                name: "臺中分公司 - 業務二部",
                value: 18
              }, {
                name: "桃園分公司 - 工程維運部",
                value: 15
              }, {
                name: "臺南分公司 - 財務行政部",
                value: 12
              }],
              11: [{
                name: "業務一部",
                value: 31
              }, {
                name: "營運管理部",
                value: 24
              }, {
                name: "財務行政部",
                value: 13
              }],
              12: [{
                name: "客戶服務部",
                value: 21
              }, {
                name: "採購管理部",
                value: 9
              }, {
                name: "業務二部",
                value: 8
              }],
              13: [{
                name: "工程維運部",
                value: 15
              }, {
                name: "資訊服務部",
                value: 6
              }, {
                name: "財務行政部",
                value: 5
              }],
              14: [{
                name: "業務二部",
                value: 18
              }, {
                name: "人資總務部",
                value: 8
              }, {
                name: "營運管理部",
                value: 7
              }],
              15: [{
                name: "財務行政部",
                value: 12
              }, {
                name: "法務合規部",
                value: 5
              }, {
                name: "客戶服務部",
                value: 5
              }],
              16: [{
                name: "業務一部",
                value: 10
              }, {
                name: "營運管理部",
                value: 4
              }, {
                name: "工程維運部",
                value: 3
              }]
            },
            year: {
              total: [{
                name: "臺北分公司 - 業務一部",
                value: 356
              }, {
                name: "臺北分公司 - 營運管理部",
                value: 284
              }, {
                name: "新北分公司 - 客戶服務部",
                value: 242
              }, {
                name: "臺中分公司 - 業務二部",
                value: 216
              }, {
                name: "桃園分公司 - 工程維運部",
                value: 178
              }, {
                name: "臺南分公司 - 財務行政部",
                value: 142
              }],
              11: [{
                name: "業務一部",
                value: 356
              }, {
                name: "營運管理部",
                value: 284
              }, {
                name: "財務行政部",
                value: 154
              }],
              12: [{
                name: "客戶服務部",
                value: 242
              }, {
                name: "採購管理部",
                value: 106
              }, {
                name: "業務二部",
                value: 96
              }],
              13: [{
                name: "工程維運部",
                value: 178
              }, {
                name: "資訊服務部",
                value: 74
              }, {
                name: "財務行政部",
                value: 62
              }],
              14: [{
                name: "業務二部",
                value: 216
              }, {
                name: "人資總務部",
                value: 92
              }, {
                name: "營運管理部",
                value: 80
              }],
              15: [{
                name: "財務行政部",
                value: 142
              }, {
                name: "法務合規部",
                value: 62
              }, {
                name: "客戶服務部",
                value: 58
              }],
              16: [{
                name: "業務一部",
                value: 126
              }, {
                name: "營運管理部",
                value: 48
              }, {
                name: "工程維運部",
                value: 38
              }]
            }
          }
        };
        const metricLabel = this.departmentMetric === "duration" ? "用車時間" : "用車次數";
        const suffix = this.departmentMetric === "duration" ? "hr" : "次";
        const scopeKey = this.isHeadquartersScope ? "total" : this.selectedCompany;
        const source = [...(sourceMap[this.departmentMetric][this.departmentMode][scopeKey] || sourceMap[this.departmentMetric][this.departmentMode][11])].sort((a, b) => a.value - b.value);
        const categories = source.map(item => item.name);
        const values = source.map(item => item.value);
        const maxValue = Math.max(...values, 0);
        const axisMax = maxValue <= 0 ? 10 : Math.ceil(maxValue * 1.15 / 10) * 10;
        this.departmentChart.setOption({
          color: [themeColor()],
          title: {
            show: false
          },
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255,255,255,0.98)",
            borderColor: "#d7dde6",
            borderWidth: 1,
            textStyle: {
              color: "#1f2937"
            },
            extraCssText: "box-shadow: 0 8px 24px rgba(15,23,42,0.1); border-radius: 8px;",
            axisPointer: {
              type: "shadow",
              shadowStyle: {
                color: themeRGBA(0.06)
              }
            },
            formatter(params) {
              const item = params && params[0];
              if (!item) return "";
              return `${item.name}<br/>${item.marker}${metricLabel}: ${item.value}${suffix}`;
            }
          },
          legend: {
            show: false
          },
          grid: {
            left: this.isHeadquartersScope ? 128 : 70,
            right: 58,
            top: 26,
            bottom: 28,
            containLabel: true
          },
          xAxis: {
            type: "value",
            min: 0,
            max: axisMax,
            splitNumber: 6,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              fontSize: 12,
              color: "#94a3b8",
              formatter(value) {
                return value;
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: "#edf2f7",
                type: "solid"
              }
            }
          },
          yAxis: {
            type: "category",
            data: categories,
            inverse: true,
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            axisLabel: {
              show: true,
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              margin: 14,
              width: this.isHeadquartersScope ? 112 : 58,
              overflow: "truncate"
            }
          },
          series: [{
            name: metricLabel,
            data: values,
            type: "bar",
            barWidth: 20,
            showBackground: true,
            backgroundStyle: {
              color: "#f1f5f9",
              borderRadius: [0, 999, 999, 0]
            },
            label: {
              show: true,
              position: "right",
              formatter: `{c}${suffix}`,
              color: "#64748b",
              fontSize: 12,
              fontWeight: 600
            },
            itemStyle: {
              borderRadius: [0, 999, 999, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                offset: 0,
                color: themeColor()
              }, {
                offset: 1,
                color: "#38A9C8"
              }])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                  offset: 0,
                  color: "#00567f"
                }, {
                  offset: 1,
                  color: "#2497b8"
                }])
              }
            },
            animationDuration: 500
          }]
        }, true);
      }
    }
  };
  return model.options(pageOptions);
}
export default function EnterpriseDashboardBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-dashboard" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="dashboard-page"><section className="dashboard-toolbar" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("Dashboard")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("查看企業公務車整體用車概況、車輛與部門排行及月度趨勢。")}</p></div>
<div className="toolbar-filter-shell"><div className="toolbar-filter"><div className="toolbar-filter-caption">{text("查看範圍")}</div>
<RimoElement kind="el-tree-select" modelValue={view.selectedCompany} onModelChange={value => {
                model.write(["selectedCompany"], value);
              }} data={view.companyTreeList} nodeKey="value" checkStrictly={true} defaultExpandAll={true} filterable={true} renderAfterExpand={false} placeholder="請選擇公司或據點"></RimoElement></div></div></section>
<section className="metrics-panel"><div className="metrics-grid"><article className="metrics-card"><RimoElement kind="el-tooltip" placement="top" showAfter={250} popperClass="metrics-help-popper" slots={{
                "content": _slot => <><div>{text("員工數：當前查看範圍內所有在職員工數量，不受用車資格狀態影響。")}</div>
<div>{text("可用車員工數：當前查看範圍內在職且用車資格爲“啓用”的員工數量。")}</div></>
              }}><RimoElement kind="el-icon" className="metrics-help" aria-label="查看員工數計算說明"><RimoIcon name="QuestionFilled" /></RimoElement></RimoElement>
<div className="metrics-icon metrics-icon-coral"><RimoElement kind="el-icon" className="metrics-card-icon"><RimoIcon name="User" /></RimoElement></div>
<div className="metrics-copy"><div className="metrics-value">{rimoText(view.topMetrics.employeeTotal)}</div>
<div className="metrics-label">{text("員工數")}</div>
<div className="metrics-sub">{text("可用車員工數 ")}
<strong>{rimoText(view.topMetrics.availableEmployees)}</strong></div>
<div className="metrics-progress"><span style={rimoStyle({
                    width: view.topMetrics.availableEmployeeRate + '%'
                  })}></span></div></div></article>
<article className="metrics-card"><RimoElement kind="el-tooltip" placement="top" showAfter={250} popperClass="metrics-help-popper" slots={{
                "content": _slot => <><div>{text("公務車數：當前查看範圍內資產歸屬的車輛總數，不受合約與上架狀態影響。")}</div>
<div>{text("可用車數：上述所屬車輛中已綁定有效合約且上架的數量，不含其他單位共享車輛。")}</div></>
              }}><RimoElement kind="el-icon" className="metrics-help" aria-label="查看公務車數計算說明"><RimoIcon name="QuestionFilled" /></RimoElement></RimoElement>
<div className="metrics-icon metrics-icon-blue"><RimoElement kind="el-icon" className="metrics-card-icon"><RimoIcon name="Van" /></RimoElement></div>
<div className="metrics-copy"><div className="metrics-value">{rimoText(view.topMetrics.vehicleTotal)}</div>
<div className="metrics-label">{text("公務車數")}</div>
<div className="metrics-sub">{text("可用車數 ")}
<strong>{rimoText(view.topMetrics.availableVehicles)}</strong></div>
<div className="metrics-progress"><span style={rimoStyle({
                    width: view.topMetrics.availableVehicleRate + '%'
                  })}></span></div></div></article>
<article className="metrics-card"><RimoElement kind="el-tooltip" placement="top" showAfter={250} popperClass="metrics-help-popper" slots={{
                "content": _slot => <><div>{text("總計公務用車次數：當前查看範圍內累計產生的公務用車次數。")}</div>
<div>{text("統計週期：自企業啓用公務車業務起，累計至當前時間。")}</div></>
              }}><RimoElement kind="el-icon" className="metrics-help" aria-label="查看總計公務用車次數計算說明"><RimoIcon name="QuestionFilled" /></RimoElement></RimoElement>
<div className="metrics-icon metrics-icon-cyan"><RimoElement kind="el-icon" className="metrics-card-icon"><RimoIcon name="Odometer" /></RimoElement></div>
<div className="metrics-copy"><div className="metrics-value">{rimoText(view.topMetrics.totalUsageTimes)}</div>
<div className="metrics-label">{text("總計公務用車次數")}</div>
<div className="metrics-trend-row"><div className="metrics-trend is-flat">{text("累計至今日")}</div>
<svg className="metrics-sparkline is-up" viewBox="0 0 64 24" aria-hidden="true"><path d="M2 20 C12 17, 16 10, 25 13 S41 17, 48 8 S57 5, 62 4"></path></svg></div></div></article>
<article className="metrics-card metrics-usage-card"><RimoElement kind="el-tooltip" content="查看明細" placement="top" showAfter={150}><button className="usage-details-button" type="button" aria-label={'查看' + view.usageMetricLabel + '明細'} aria-haspopup="dialog" aria-expanded={view.usageDetailsVisible} onClick={event => {
                  view.openUsageDetails?.(event);
                }}><RimoElement kind="el-icon" aria-hidden="true"><RimoIcon name="Document" /></RimoElement></button></RimoElement>
<RimoElement kind="el-tooltip" content={view.usageBasisSwitchLabel} placement="top" showAfter={150}><button className="usage-basis-button" type="button" aria-label={view.usageBasisSwitchLabel} onClick={event => {
                  view.toggleUsageBasis?.(event);
                }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 3-4 4 4 4M4 7h16m-4 6 4 4-4 4M20 17H4"></path></svg></button></RimoElement>
<div className="metrics-icon metrics-icon-rose"><RimoElement kind="el-icon" className="metrics-card-icon"><RimoIcon name="Odometer" /></RimoElement></div>
<div className="metrics-copy"><div className="metrics-value"><span>{rimoText(view.displayUsageRate(view.usageCurrentSummary.rate))}</span>
<RimoElement kind="el-tooltip" placement="top" showAfter={150} popperClass="metrics-help-popper usage-calculation-popper" slots={{
                    "content": _slot => <><div>{text("使用率 = 各車用車時長合計 ÷ 服務時長合計 × 100%。")}</div>
<div>{text("服務時長含上架及下架後仍用車的時間，重疊只算一次。")}</div>
<div>{rimoText(view.usageBasis === 'work' ? '僅計週一至週五 09:00–18:00' : '計入全天，包含夜間及週末')}{text("；本月累計至統計截止時間。")}</div></>
                  }}><button className="usage-info-button" type="button" aria-label={'查看' + view.usageRateLabel + '計算方式'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle>
<path d="M12 11v6"></path>
<circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"></circle></svg></button></RimoElement></div>
<div className="metrics-label">{rimoText(view.usageMetricLabel)}</div>
<div className="metrics-trend-row"><div className={rimoClass(["metrics-trend", rimoClass(view.getBriefingTrendClass(view.usageComparison))])}>{text("較上月同期 ")}{rimoText(view.displayUsageDifference(view.usageComparison))}</div>
<svg className={rimoClass(["metrics-sparkline", rimoClass(view.getBriefingTrendClass(view.usageComparison))])} viewBox="0 0 64 24" aria-hidden="true"><path d={view.getSparklinePath(view.getBriefingTrendClass(view.usageComparison))}></path></svg></div></div></article>
<article className="metrics-card"><RimoElement kind="el-tooltip" placement="top" showAfter={250} popperClass="metrics-help-popper" slots={{
                "content": _slot => <><div>{text("本月用車次數：當前查看範圍內本月創建或用車時間發生在本月的公務車訂單數量。")}</div>
<div>{text("較上月 =（本月用車次數 - 上月同期用車次數）÷ 上月同期用車次數 × 100%。")}</div></>
              }}><RimoElement kind="el-icon" className="metrics-help" aria-label="查看本月用車次數計算說明"><RimoIcon name="QuestionFilled" /></RimoElement></RimoElement>
<div className="metrics-icon metrics-icon-green"><RimoElement kind="el-icon" className="metrics-card-icon"><RimoIcon name="Histogram" /></RimoElement></div>
<div className="metrics-copy"><div className="metrics-value">{rimoText(view.topMetrics.monthUsageTimes)}</div>
<div className="metrics-label">{text("本月用車次數")}</div>
<div className="metrics-trend-row"><div className={rimoClass(["metrics-trend", rimoClass(view.topMetrics.monthUsageTrendType)])}>{text("較上月 ")}{rimoText(view.topMetrics.monthUsageTrend)}</div>
<svg className={rimoClass(["metrics-sparkline", rimoClass(view.topMetrics.monthUsageTrendType)])} viewBox="0 0 64 24" aria-hidden="true"><path d={view.getSparklinePath(view.topMetrics.monthUsageTrendType)}></path></svg></div></div></article></div></section>
<div className="dashboard-main"><div className="dashboard-cell dashboard-brief"><section className="dashboard-panel"><header className="panel-header"><div className="panel-title">{rimoText(view.briefingTitle)}</div>
<RimoElement kind="el-button" className="field-help-button" size="small" text={true} bg={true} onClick={_event => {
                  model.write(["briefingHelpVisible"], true);
                }}><RimoElement kind="el-icon"><RimoIcon name="question-filled" /></RimoElement>
{text("\n                                        欄位說明\n                                    ")}</RimoElement></header>
<div className="briefing-table-wrap"><div className="briefing-table-scroll"><RimoTable className="briefing-table"><thead><tr><th style={rimoStyle("width: 17%;")}>{rimoText(view.briefingNameLabel)}</th>
<th className="briefing-owned-header" style={rimoStyle("width: 16%;")}>{rimoText(view.briefingStatusLabel)}</th>
<th style={rimoStyle("width: 12%;")}>{text("本月已完成")}</th>
<th style={rimoStyle("width: 15%;")}>{text("本月用車時長 (hr)")}</th>
<th className="briefing-usage-header" style={rimoStyle("width: 12%;")}>{rimoText(view.usageRateLabel)}</th>
<th style={rimoStyle("width: 10%;")}>{text("較上月同期")}</th>
<th style={rimoStyle("width: 9%;")}>{text("未完成訂單")}</th>
<th style={rimoStyle("width: 9%;")}>{text("平均每次時長")}</th></tr></thead>
<tbody>{rimoEntries(view.briefingRows).map(([row], _itemIndex) => <Fragment key={row.id}><tr key={row.id}><td><div className="briefing-name"><RimoElement kind="el-icon" className="briefing-name-icon">{view.isHeadquartersScope ? <><RimoIcon name="Location" /></> : <><RimoIcon name="Van" /></>}</RimoElement>
<div className="min-w-0"><div className="briefing-name-main">{rimoText(row.name)}</div>
{row.subName ? <><div className="briefing-name-sub">{rimoText(row.subName)}</div></> : null}</div></div></td>
<td>{view.isHeadquartersScope ? <><><div className="briefing-metric"><span className="briefing-metric-value">{rimoText(row.available)}{text(" / ")}{rimoText(row.total)}</span>
<span className="briefing-bar"><span style={rimoStyle({
                                      width: row.availableRate + '%'
                                    })}></span></span></div></></> : <><><span className={rimoClass(["briefing-status", rimoClass(row.statusType)])}>{rimoText(row.statusText)}</span></></>}</td>
<td>{rimoText(row.completed)}</td>
<td><div className="briefing-metric"><span className="briefing-metric-value">{rimoText(view.formatNumber(row.duration))}</span>
<span className="briefing-bar briefing-bar-blue"><span style={rimoStyle({
                                  width: row.durationRate + '%'
                                })}></span></span></div></td>
<td><div className="briefing-metric"><span className="briefing-metric-value">{rimoText(view.displayUsageRate(row.usageRate))}</span>
<span className="briefing-bar briefing-bar-orange"><span style={rimoStyle({
                                  width: row.usageRate + '%'
                                })}></span></span></div></td>
<td><span className={rimoClass(["briefing-trend", rimoClass(view.getBriefingTrendClass(row.compare))])}>{text("\n                                                            ")}{rimoText(row.compare > 0 ? '▲' : row.compare < 0 ? '▼' : '—')}{text("\n                                                            ")}{rimoText(view.formatCompare(row.compare))}{text("\n                                                        ")}</span></td>
<td>{rimoText(row.pending)}</td>
<td>{rimoText(row.avgDuration)}</td></tr></Fragment>)}</tbody>
<tfoot><tr><td>{text("總計")}</td>
<td>{rimoText(view.briefingTotal.status)}</td>
<td>{rimoText(view.briefingTotal.completed)}</td>
<td>{rimoText(view.formatNumber(view.briefingTotal.duration))}</td>
<td>{rimoText(view.displayUsageRate(view.briefingTotal.usageRate))}</td>
<td><span className={rimoClass(["briefing-trend", rimoClass(view.getBriefingTrendClass(view.briefingTotal.compare))])}>{text("\n                                                            ")}{rimoText(view.briefingTotal.compare > 0 ? '▲' : view.briefingTotal.compare < 0 ? '▼' : '—')}{text("\n                                                            ")}{rimoText(view.formatCompare(view.briefingTotal.compare))}{text("\n                                                        ")}</span></td>
<td>{rimoText(view.briefingTotal.pending)}</td>
<td>{rimoText(view.briefingTotal.avgDuration)}</td></tr></tfoot></RimoTable></div></div></section></div>
<div className="dashboard-cell dashboard-employee"><section className="dashboard-panel table-panel"><header className="panel-header"><div className="panel-header-main"><div className="panel-title">{text("員工用車排名")}</div>
<RimoElement kind="el-radio-group" modelValue={view.employeeSort} onModelChange={value => {
                    model.write(["employeeSort"], value);
                  }} size="small" className="panel-switch"><RimoElement kind="el-radio-button" label="times">{text("次數")}</RimoElement>
<RimoElement kind="el-radio-button" label="duration">{text("時長")}</RimoElement></RimoElement></div>
<div className="panel-link">{text("全部")}</div></header>
<div className="rank-table-wrap"><RimoTable className="rank-table"><thead><tr><th className="text-center" style={rimoStyle("width: 62px;")}>{text("排名")}</th>
<th style={rimoStyle("width: 22%;")}>{text("姓名")}</th>
<th>{text("部門")}</th>
<th className="text-right" style={rimoStyle("width: 78px;")}>{text("用車次數")}</th>
<th className="text-right" style={rimoStyle("width: 78px;")}>{text("用車時數")}</th></tr></thead>
{view.employeeRows.length ? <><tbody>{rimoEntries(view.employeeRows).map(([row, index], _itemIndex) => <Fragment key={row.id}><tr key={row.id}><td className="text-center"><span className={rimoClass(["rank-badge", rimoClass(index < 3 ? 'rank-badge-top' : 'rank-badge-normal')])}>{rimoText(index + 1)}</span></td>
<td className="rank-table-ellipsis" title={row.name}>{rimoText(row.name)}</td>
<td className="rank-table-ellipsis" title={row.department}>{rimoText(row.department)}</td>
<td className="text-right">{rimoText(row.times)}</td>
<td className="text-right">{rimoText(row.duration)}</td></tr></Fragment>)}</tbody></> : <><tbody><tr><td className="rank-table-empty" colSpan="5">{text("暫無資料")}</td></tr></tbody></>}</RimoTable></div></section></div>
<div className="dashboard-cell dashboard-overall"><section className="dashboard-panel"><header className="panel-header"><div className="panel-title">{text("總體用車率")}</div>
<RimoElement kind="el-radio-group" modelValue={view.overallMode} onModelChange={value => {
                  model.write(["overallMode"], value);
                }} size="small" className="panel-switch"><RimoElement kind="el-radio-button" label="month">{text("月")}</RimoElement>
<RimoElement kind="el-radio-button" label="year">{text("年")}</RimoElement></RimoElement></header>
<div ref={model.ref("overallChartRef")} className="chart-surface chart-tall"></div></section></div>
<div className="dashboard-cell dashboard-vehicle"><section className="dashboard-panel table-panel"><header className="panel-header"><div className="panel-header-main"><div className="panel-title">{text("車輛用車排名")}</div>
<RimoElement kind="el-radio-group" modelValue={view.vehicleSort} onModelChange={value => {
                    model.write(["vehicleSort"], value);
                  }} size="small" className="panel-switch"><RimoElement kind="el-radio-button" label="times">{text("次數")}</RimoElement>
<RimoElement kind="el-radio-button" label="duration">{text("時長")}</RimoElement></RimoElement></div>
<div className="panel-link">{text("全部")}</div></header>
<div className="rank-table-wrap"><RimoTable className="rank-table"><thead><tr><th className="text-center" style={rimoStyle("width: 62px;")}>{text("排名")}</th>
<th style={rimoStyle("width: 24%;")}>{text("車牌號碼")}</th>
<th>{text("據點")}</th>
<th className="text-right" style={rimoStyle("width: 78px;")}>{text("用車次數")}</th>
<th className="text-right" style={rimoStyle("width: 78px;")}>{text("用車時數")}</th></tr></thead>
{view.vehicleRows.length ? <><tbody>{rimoEntries(view.vehicleRows).map(([row, index], _itemIndex) => <Fragment key={row.plate}><tr key={row.plate}><td className="text-center"><span className={rimoClass(["rank-badge", rimoClass(index < 3 ? 'rank-badge-top' : 'rank-badge-normal')])}>{rimoText(index + 1)}</span></td>
<td className="rank-table-ellipsis" title={row.plate}>{rimoText(row.plate)}</td>
<td className="rank-table-ellipsis" title={row.station}>{rimoText(row.station)}</td>
<td className="text-right">{rimoText(row.times)}</td>
<td className="text-right">{rimoText(row.duration)}</td></tr></Fragment>)}</tbody></> : <><tbody><tr><td className="rank-table-empty" colSpan="5">{text("暫無資料")}</td></tr></tbody></>}</RimoTable></div></section></div>
<div className="dashboard-cell dashboard-department"><section className="dashboard-panel"><header className="panel-header"><div className="panel-header-main"><div className="panel-title">{text("部門用車統計")}</div>
<RimoElement kind="el-radio-group" modelValue={view.departmentMetric} onModelChange={value => {
                    model.write(["departmentMetric"], value);
                  }} size="small" className="panel-switch"><RimoElement kind="el-radio-button" label="duration">{text("時長")}</RimoElement>
<RimoElement kind="el-radio-button" label="times">{text("次數")}</RimoElement></RimoElement></div>
<RimoElement kind="el-radio-group" modelValue={view.departmentMode} onModelChange={value => {
                  model.write(["departmentMode"], value);
                }} size="small" className="panel-switch"><RimoElement kind="el-radio-button" label="month">{text("本月")}</RimoElement>
<RimoElement kind="el-radio-button" label="year">{text("今年")}</RimoElement></RimoElement></header>
<div className="department-chart-card"><div className="department-chart-list">{rimoEntries(view.departmentChartRows).map(([row, index], _itemIndex) => <Fragment key={row.name}><div className="department-chart-row" key={row.name}><div className="department-chart-name"><span className="department-chart-rank">{rimoText(index + 1)}</span>
<span className="department-chart-label" title={row.name}>{rimoText(row.name)}</span></div>
<div className="department-bar-track"><span className="department-bar-fill" style={rimoStyle({
                          width: view.departmentBarWidth(row.value)
                        })}></span></div>
<div className="department-chart-value">{rimoText(view.formatNumber(row.value))}{text(" ")}{rimoText(view.departmentMetricUnit)}</div></div></Fragment>)}</div></div></section></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.usageDetailsVisible} onModelChange={value => {
      model.write(["usageDetailsVisible"], value);
    }} title="使用率明細" className="dashboard-overlay usage-detail-dialog" top="6vh" closeOnClickModal={false} onClosed={_event => {
      model.write(["usageVehicleDetailsVisible"], false);
    }}>{() => <><div className="usage-toolbar"><strong>{rimoText(view.currentScopeLabel)}</strong>
<RimoElement kind="el-radio-group" modelValue={view.usagePeriod} onModelChange={value => {
            model.write(["usagePeriod"], value);
          }} size="small" className="usage-period"><RimoElement kind="el-radio-button" label="current">{text("本月")}</RimoElement>
<RimoElement kind="el-radio-button" label="previous">{text("上月同期")}</RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.usageBasis} onModelChange={value => {
            model.write(["usageBasis"], value);
          }} aria-label="使用率統計口徑" size="small" style={rimoStyle("width: 190px")}><RimoElement kind="el-option" label="工作時段 09:00–18:00" value="work"></RimoElement>
<RimoElement kind="el-option" label="自然日" value="calendar"></RimoElement></RimoElement></div>
<div className="usage-meta">{rimoText(view.usagePeriodLabel)}</div>
<div className="usage-formula"><span>{text("計入用車 ")}
<strong>{rimoText(view.displayUsageDuration(view.usageSummary.usedMs))}</strong></span>
<span>{text("÷ 有效服務 ")}
<strong>{rimoText(view.displayUsageDuration(view.usageSummary.serviceMs))}</strong></span>
<span>{text("= ")}
<strong className="usage-rate">{rimoText(view.displayUsageRate(view.usageSummary.rate))}</strong></span></div>
<div className="usage-toolbar"><RimoElement kind="el-input" modelValue={view.usageQuery} onModelChange={value => {
            model.write(["usageQuery"], value);
          }} placeholder="搜尋車牌" aria-label="搜尋使用率明細車牌" clearable={true} size="small" style={rimoStyle("width: 160px")}></RimoElement>
{view.isHeadquartersScope ? <><RimoElement kind="el-select" modelValue={view.usageBranchFilter} onModelChange={value => {
              model.write(["usageBranchFilter"], value);
            }} placeholder="全部分公司" aria-label="篩選分公司" clearable={true} size="small" style={rimoStyle("width: 145px")}>{rimoEntries(view.companyTreeList[0].children).map(([branch], _itemIndex) => <Fragment key={branch.value}><RimoElement kind="el-option" key={branch.value} label={branch.label} value={branch.value}></RimoElement></Fragment>)}</RimoElement></> : null}
<RimoElement kind="el-button" className="usage-download" size="small" disabled={!view.usageFilteredVehicles.length} onClick={event => {
            view.downloadUsageVehicles?.(event);
          }}><RimoElement kind="el-icon"><RimoIcon name="Download" /></RimoElement>
{text("下載清單")}</RimoElement></div>
<RimoElement kind="el-table" data={view.usagePagedVehicles} maxHeight="400" emptyText="沒有符合條件的車輛"><RimoElement kind="el-table-column" prop="plate" label="車牌" minWidth="110"></RimoElement>
<RimoElement kind="el-table-column" prop="branchName" label="分公司" minWidth="110"></RimoElement>
<RimoElement kind="el-table-column" label="有效服務時長" minWidth="135" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" link={true} type="primary" onClick={_event => {
                view.showUsageVehicle(row, 'service');
              }}>{rimoText(view.displayUsageDuration(row.serviceMs))}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="計入用車時長" minWidth="135" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" link={true} type="primary" onClick={_event => {
                view.showUsageVehicle(row, 'orders');
              }}>{rimoText(view.displayUsageDuration(row.usedMs))}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label={view.usageRateLabel} width="125" align="right" slots={{
            "default": ({
              row
            }) => <>{rimoText(view.displayUsageRate(row.rate))}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="65" align="right" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" link={true} type="primary" onClick={_event => {
                view.showUsageVehicle(row, 'service');
              }}>{text("查看")}</RimoElement></>
          }}></RimoElement></RimoElement>
<div className="usage-pagination"><RimoElement kind="el-pagination" currentPage={view.usagePage} onCurrentPageChange={value => {
            model.write(["usagePage"], value);
          }} pageSize={10} total={view.usageFilteredVehicles.length} layout="total, prev, pager, next"></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.usageVehicleDetailsVisible} onModelChange={value => {
      model.write(["usageVehicleDetailsVisible"], value);
    }} title={view.usageSelectedVehicle ? view.usageSelectedVehicle.plate + ' · 車輛明細' : '車輛明細'} className="dashboard-overlay usage-detail-dialog usage-vehicle-dialog" top="8vh" appendToBody={true} closeOnClickModal={false}>{() => <>{view.usageSelectedVehicle ? <><><div className="usage-meta">{rimoText(view.usageSelectedVehicle.branchName)}{text(" · ")}{rimoText(view.usagePeriodLabel)}{text(" · ")}{rimoText(view.usageBasis === 'work' ? '工作時段（週一至週五 09:00–18:00）' : '自然日')}</div>
<div className="usage-formula"><span>{text("計入用車 ")}
<strong>{rimoText(view.displayUsageDuration(view.usageSelectedVehicle.usedMs))}</strong></span>
<span>{text("÷ 有效服務 ")}
<strong>{rimoText(view.displayUsageDuration(view.usageSelectedVehicle.serviceMs))}</strong></span>
<span>{text("= ")}
<strong className="usage-rate">{rimoText(view.displayUsageRate(view.usageSelectedVehicle.rate))}</strong></span></div>
<div className="usage-detail-tabs"><RimoElement kind="el-tabs" modelValue={view.usageDetailTab} onModelChange={value => {
                model.write(["usageDetailTab"], value);
              }}><RimoElement kind="el-tab-pane" label="服務流水" name="service"><RimoElement kind="el-table" data={view.usageServiceLedger} rowKey="id" maxHeight="380" emptyText="沒有服務記錄"><RimoElement kind="el-table-column" label="操作時間" minWidth="180" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.displayUsageTime(row.operatedAt))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" minWidth="100" slots={{
                      "default": ({
                        row
                      }) => <><RimoElement kind="el-tag" type={row.listed ? 'success' : 'info'} size="small">{rimoText(row.action)}</RimoElement></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="本期計入時長" minWidth="150" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.displayUsageDuration(row.serviceMs))}</>
                    }}></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-tab-pane" label="用車訂單" name="orders"><RimoElement kind="el-table" data={view.usageSelectedVehicle.orderRecords} maxHeight="380" emptyText="沒有用車訂單"><RimoElement kind="el-table-column" label="訂單 / 員工" minWidth="185" slots={{
                      "default": ({
                        row
                      }) => <><div>{rimoText(row.id)}</div>
<div className="usage-secondary">{rimoText(row.employee)}</div></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="實際取還車" minWidth="150" slots={{
                      "default": ({
                        row
                      }) => <><div>{rimoText(view.displayUsageTime(row.start))}</div>
<div className="usage-secondary">{rimoText(row.end ? view.displayUsageTime(row.end) : '用車中')}</div></>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="完整用車" minWidth="115" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.displayUsageDuration(row.fullActualMs))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="本期實際" minWidth="115" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.displayUsageDuration(row.actualMs))}</>
                    }}></RimoElement>
<RimoElement kind="el-table-column" label="計入時長" minWidth="115" align="right" slots={{
                      "default": ({
                        row
                      }) => <>{rimoText(view.displayUsageDuration(row.usedMs))}</>
                    }}></RimoElement></RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-button" className="usage-tab-download" size="small" disabled={view.usageDetailTab === 'service' ? !view.usageServiceLedger.length : !view.usageSelectedVehicle.orderRecords.length} onClick={event => {
                view.downloadUsageVehicleDetails?.(event);
              }}><RimoElement kind="el-icon"><RimoIcon name="Download" /></RimoElement>
{text("下載清單")}</RimoElement></div></></> : null}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.briefingHelpVisible} onModelChange={value => {
      model.write(["briefingHelpVisible"], value);
    }} title={`${view.briefingTitle}欄位說明`} width="640px" className="dashboard-overlay">{() => <><div className="field-help-list">{rimoEntries(view.briefingHelpFields).map(([item], _itemIndex) => <Fragment key={item.name}><div className="field-help-item" key={item.name}><div className="field-help-name">{rimoText(item.name)}</div>
<div className="field-help-desc">{rimoText(item.desc)}</div></div></Fragment>)}</div></>}</RimoElement></RimoRoot>;
}