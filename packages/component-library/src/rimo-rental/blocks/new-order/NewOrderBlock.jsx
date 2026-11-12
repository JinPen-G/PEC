import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './new-order.css';
function createPageState(model) {
  const _document = model.document;
  const window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const _themeColor = () => model.theme();
  const _themeColorLight = level => model.theme(level);
  const _themeRGBA = alpha => model.themeAlpha(alpha);
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
  function pageSetup() {
    const {
      cell: ref,
      record: reactive,
      derived: computed,
      watch: watch
    } = model;
    const {
      ElMessage: _ElMessage
    } = feedback;
    const reservationType = ref('personal');
    const customers = ref([{
      id: 1,
      name: '王小明',
      phone: '0912-345-678',
      levelType: 'warning',
      levelName: '金牌會員',
      points: 3500,
      enterprise: {
        id: 'ent_001',
        name: '谷歌信息技術有限公司'
      },
      coupons: [{
        id: 'c1',
        name: '新客優惠',
        desc: '立減50元',
        value: 50,
        type: 'amount'
      }, {
        id: 'c2',
        name: '生日禮券',
        desc: '88折',
        value: 0.88,
        type: 'rate'
      }]
    }, {
      id: 2,
      name: '李大壯',
      phone: '0988-111-222',
      levelType: 'info',
      levelName: '普通會員',
      points: 200,
      coupons: []
    }, {
      id: 3,
      name: '張曉華',
      phone: '0933-444-555',
      levelType: 'danger',
      levelName: '黑鑽會員',
      points: 12000,
      enterprise: {
        id: 'ent_002',
        name: '微軟中國'
      },
      coupons: [{
        id: 'c3',
        name: 'VIP專屬券',
        desc: '立減200元',
        type: 'amount',
        value: 200
      }]
    }]);
    const vehicleGroups = ref([{
      id: 'sedan',
      name: '舒適轎車組',
      desc: 'Toyota Altis / Vios',
      price: 300,
      available: 5,
      deposit: 3000
    }, {
      id: 'suv',
      name: '豪華SUV組',
      desc: 'Honda CR-V / Toyota RAV4',
      price: 500,
      available: 2,
      deposit: 5000
    }, {
      id: 'mpv',
      name: '商務MPV組',
      desc: 'Honda Odyssey',
      price: 800,
      available: 1,
      deposit: 8000
    }, {
      id: 'lux_sedan',
      name: '豪華轎車組',
      desc: 'BMW 5 Series / Benz E',
      price: 1200,
      available: 3,
      deposit: 10000
    }, {
      id: 'sport',
      name: '性能跑車組',
      desc: 'Porsche 911 / AMG GT',
      price: 3500,
      available: 1,
      deposit: 50000
    }, {
      id: 'electric',
      name: '純電SUV組',
      desc: 'Tesla Model Y / Nio ES6',
      price: 600,
      available: 8,
      deposit: 6000
    }, {
      id: 'van',
      name: '貨運麪包組',
      desc: 'Ford Transit',
      price: 400,
      available: 0,
      deposit: 4000
    }]);
    const services = ref([{
      id: 1,
      name: '安心保障險 (50/天)',
      price: 250,
      selected: false,
      daily: true,
      unitPrice: 50,
      maxQuantity: 1,
      quantity: 1
    }, {
      id: 2,
      name: '兒童安全座椅',
      price: 100,
      selected: false,
      daily: false,
      maxQuantity: 2,
      quantity: 1
    }, {
      id: 3,
      name: 'GPS導航儀',
      price: 50,
      selected: false,
      daily: false,
      maxQuantity: 1,
      quantity: 1
    }, {
      id: 4,
      name: '舒適靠墊',
      price: 30,
      selected: false,
      daily: false,
      maxQuantity: 4,
      quantity: 1
    }, {
      id: 5,
      name: '露營裝備包',
      price: 200,
      selected: false,
      daily: false,
      maxQuantity: 1,
      quantity: 1
    }]);
    const marketingPlans = ref([{
      id: 'personal_student',
      name: '學生專案行銷方案',
      scope: 'personal',
      weekdayRate: 0.85,
      holidayRate: 0.9,
      manualVerification: true,
      qualificationName: '學生身份',
      requiredDocText: '學生證、在學證明等可證明學生身份的文件',
      supportedModes: ['門市租車']
    }, {
      id: 'personal_weekday',
      name: '個人會員平假日優惠',
      scope: 'personal',
      weekdayRate: 0.9,
      holidayRate: 0.95,
      manualVerification: false
    }, {
      id: 'personal_gold',
      name: '金牌會員專享折扣',
      scope: 'personal',
      weekdayRate: 0.85,
      holidayRate: 0.9,
      levels: ['金牌會員', '黑鑽會員']
    }, {
      id: 'enterprise_staff',
      name: '企業員工用車方案',
      scope: 'enterprise',
      weekdayRate: 0.82,
      holidayRate: 0.88
    }, {
      id: 'enterprise_monthly',
      name: '企業月結協議方案',
      scope: 'enterprise',
      weekdayRate: 0.8,
      holidayRate: 0.86
    }]);
    const selectedCustomerId = ref(null);
    const currentCustomer = computed(() => customers.value.find(c => c.id === selectedCustomerId.value));
    const getDefaultPickupTime = () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(9, 0, 0, 0);
      return date;
    };
    const getDefaultReturnTime = () => {
      const date = getDefaultPickupTime();
      date.setDate(date.getDate() + 1);
      return date;
    };
    const rentalData = reactive({
      pickupLocation: 'store_main',
      returnLocation: 'store_main',
      pickupTime: getDefaultPickupTime(),
      returnTime: getDefaultReturnTime()
    });
    const selectedGroupId = ref(null);
    const selectedGroup = computed(() => vehicleGroups.value.find(g => g.id === selectedGroupId.value));
    const selectedMarketingPlanId = ref('none');
    const selectedCouponId = ref(null);
    const showRedeemInput = ref(false);
    const redeemCode = ref('');
    const pointsUsed = ref(0);
    const collectionMode = ref('deposit');
    const canUsePersonalBenefits = computed(() => {
      return reservationType.value !== 'enterprise';
    });
    const currentCustomerCoupons = computed(() => {
      return currentCustomer.value ? currentCustomer.value.coupons : [];
    });
    const customerCoupons = computed(() => {
      return canUsePersonalBenefits.value ? currentCustomerCoupons.value : [];
    });
    const availableMarketingPlans = computed(() => {
      if (!currentCustomer.value) return [];
      const scope = reservationType.value === 'enterprise' && currentCustomer.value.enterprise ? 'enterprise' : 'personal';
      return marketingPlans.value.filter(plan => {
        if (plan.scope !== scope) return false;
        if (plan.levels && !plan.levels.includes(currentCustomer.value.levelName)) return false;
        return true;
      });
    });
    const selectedMarketingPlan = computed(() => {
      return availableMarketingPlans.value.find(plan => plan.id === selectedMarketingPlanId.value);
    });
    const marketingPlanEligibilityLabel = computed(() => {
      return reservationType.value === 'enterprise' && currentCustomer.value?.enterprise ? '當前展示企業資格可用方案' : '當前展示個人資格可用方案';
    });
    const rentalDurationHours = computed(() => {
      if (!rentalData.pickupTime || !rentalData.returnTime) return 0;
      const diff = new Date(rentalData.returnTime).getTime() - new Date(rentalData.pickupTime).getTime();
      return Math.max(0, diff / 1000 / 60 / 60);
    });
    const rentalDurationLabel = computed(() => {
      if (rentalDurationHours.value <= 0) return '0小時';
      const totalMinutes = Math.round(rentalDurationHours.value * 60);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor(totalMinutes % 1440 / 60);
      const minutes = totalMinutes % 60;
      const parts = [];
      if (days > 0) parts.push(`${days}天`);
      if (hours > 0) parts.push(`${hours}小時`);
      if (minutes > 0) parts.push(`${minutes}分鐘`);
      return parts.join('') || '0小時';
    });
    const rentalDays = computed(() => {
      if (rentalDurationHours.value <= 0) return 1;
      return Math.max(1, Math.ceil(rentalDurationHours.value / 24));
    });
    const getBillingDayType = date => {
      const day = date.getDay();
      return day >= 1 && day <= 4 ? 'weekday' : 'holiday';
    };
    const billingSegments = computed(() => {
      if (!selectedGroup.value || !rentalData.pickupTime || !rentalData.returnTime || rentalDurationHours.value <= 0) {
        return [];
      }
      const pickup = new Date(rentalData.pickupTime);
      const standardPrice = selectedGroup.value.price;
      const segments = [];
      if (rentalDurationHours.value <= 24) {
        segments.push({
          label: '起租24小時',
          amount: standardPrice,
          dayType: getBillingDayType(pickup),
          unit: 'day'
        });
        return segments;
      }
      const fullDays = Math.floor(rentalDurationHours.value / 24);
      const remainderHours = rentalDurationHours.value - fullDays * 24;
      for (let i = 0; i < fullDays; i++) {
        const segmentStart = new Date(pickup);
        segmentStart.setHours(segmentStart.getHours() + i * 24);
        segments.push({
          label: `第${i + 1}個24小時`,
          amount: standardPrice,
          dayType: getBillingDayType(segmentStart),
          unit: 'day'
        });
      }
      if (remainderHours > 0) {
        const billedHours = Math.max(1, Math.ceil(remainderHours));
        const segmentStart = new Date(pickup);
        segmentStart.setHours(segmentStart.getHours() + fullDays * 24);
        const chargeAsDay = billedHours >= 5;
        segments.push({
          label: chargeAsDay ? `超時${billedHours}小時按1天` : `超時${billedHours}小時`,
          amount: chargeAsDay ? standardPrice : Math.round(standardPrice * 0.1 * billedHours),
          dayType: getBillingDayType(segmentStart),
          unit: chargeAsDay ? 'day' : 'hour',
          billedHours
        });
      }
      return segments;
    });
    const rentalBillingLabel = computed(() => {
      if (billingSegments.value.length === 0) return '未選擇車組';
      const dayCount = billingSegments.value.filter(segment => segment.unit === 'day').length;
      const hourSegment = billingSegments.value.find(segment => segment.unit === 'hour');
      const parts = [];
      if (dayCount > 0) parts.push(`${dayCount}天`);
      if (hourSegment) parts.push(`${hourSegment.billedHours}小時`);
      return parts.join('+') || '1天';
    });
    const baseRentalTotal = computed(() => {
      return billingSegments.value.reduce((total, segment) => total + segment.amount, 0);
    });
    const servicesTotal = computed(() => {
      let total = 0;
      services.value.forEach(s => {
        if (s.selected) {
          const unitPrice = s.daily ? s.unitPrice * rentalDays.value : s.price;
          total += unitPrice * (s.quantity || 1);
        }
      });
      return total;
    });
    const discountAmount = computed(() => {
      const plan = selectedMarketingPlan.value;
      if (!plan) return 0;
      return billingSegments.value.reduce((total, segment) => {
        const rate = segment.dayType === 'weekday' ? plan.weekdayRate : plan.holidayRate;
        return total + Math.round(segment.amount * (1 - rate));
      }, 0);
    });
    const couponAmount = computed(() => {
      if (!canUsePersonalBenefits.value) return 0;
      const coupon = customerCoupons.value.find(c => c.id === selectedCouponId.value);
      if (!coupon) return 0;
      if (coupon.type === 'amount') return coupon.value;
      if (coupon.type === 'rate') {
        return Math.round(baseRentalTotal.value * (1 - coupon.value));
      }
      return 0;
    });
    const pointsAmount = computed(() => {
      if (!canUsePersonalBenefits.value) return 0;
      return Math.floor(pointsUsed.value / 10);
    });
    const finalTotal = computed(() => {
      const total = baseRentalTotal.value + servicesTotal.value - discountAmount.value - couponAmount.value - pointsAmount.value;
      return Math.max(0, total);
    });
    const depositAmount = computed(() => {
      return selectedGroup.value ? selectedGroup.value.deposit : 0;
    });
    const preAuthRule = reactive({
      mode: 'percentage',
      fixedAmount: 3000,
      percent: 30
    });
    const preAuthRuleText = computed(() => {
      if (preAuthRule.mode === 'fixed') {
        return `預授權押金按規則固定額度 ${formatNumber(preAuthRule.fixedAmount)} 試算`;
      }
      return `預授權押金按規則租金比例 ${preAuthRule.percent}% 試算`;
    });
    const depositPayAmount = computed(() => {
      if (finalTotal.value <= 0) return 0;
      if (preAuthRule.mode === 'fixed') return preAuthRule.fixedAmount;
      const percent = Math.min(100, Math.max(0, preAuthRule.percent));
      return Math.ceil(finalTotal.value * percent / 100);
    });
    const paymentDialogVisible = ref(false);
    const paymentDialogType = ref('online');
    const newPayment = reactive({
      gateway: 'jiekou',
      amount: 0,
      refNo: '',
      processing: false
    });
    const orderSuccessVisible = ref(false);
    const createdOrder = reactive({
      orderId: '',
      mainStatus: '',
      mainStatusText: '',
      paymentStatus: '',
      paymentStatusText: '',
      dispatchStatusText: '',
      amount: 0,
      paidAmount: 0,
      billingMode: 'customer_pay',
      fundSummaryLabel: '本次預授權',
      fundSummaryText: '0',
      priceVersion: 'PRICE-STORE-20260418-001',
      marketingVersion: 'MKT-STORE-MEMBER-20260418-001',
      ruleVersion: 'RULE-STORE-20260418-002'
    });
    const userCreditCards = ref([{
      id: 1,
      brand: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    }, {
      id: 2,
      brand: 'Mastercard',
      last4: '8888',
      expiry: '09/24',
      isDefault: false
    }]);
    const selectedCreditCard = ref(1);
    const goBack = () => {
      window.location.href = 'store_orders.html';
    };
    const formatNumber = num => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    const formatDiscountRate = rate => {
      return `${Math.round(rate * 100) / 10}折`;
    };
    const formatMarketingPlanLabel = plan => {
      return `${plan.name}（平日${formatDiscountRate(plan.weekdayRate)} / 假日${formatDiscountRate(plan.holidayRate)}）`;
    };
    const handleCustomerSelect = () => {
      pointsUsed.value = 0;
      reservationType.value = 'personal';
      selectedCouponId.value = null;
      selectedMarketingPlanId.value = 'none';
      if (collectionMode.value === 'monthly') {
        setCollectionMode('deposit');
      }
    };
    const selectVehicleGroup = group => {
      if (group.available <= 0) {
        feedback.ElMessage.warning('當前車組庫存不足，無法選擇');
        return;
      }
      selectedGroupId.value = group.id;
    };
    const handlePickupTimeChange = () => {
      if (!rentalData.pickupTime) return;
      const pickup = new Date(rentalData.pickupTime);
      const currentReturn = rentalData.returnTime ? new Date(rentalData.returnTime) : null;
      if (!currentReturn || currentReturn <= pickup) {
        const nextReturn = new Date(pickup);
        nextReturn.setDate(nextReturn.getDate() + 1);
        rentalData.returnTime = nextReturn;
      }
    };
    const setCollectionMode = mode => {
      if (mode === 'monthly' && reservationType.value !== 'enterprise') {
        feedback.ElMessage.warning('企業月結僅支持企業預訂');
        return;
      }
      collectionMode.value = mode;
      if (mode === 'deposit') {
        paymentDialogType.value = 'online';
        newPayment.gateway = 'jiekou';
      }
      syncPaymentAmount();
    };
    const syncPaymentAmount = () => {
      if (collectionMode.value === 'monthly' || collectionMode.value === 'pending') {
        newPayment.amount = 0;
      } else {
        newPayment.amount = depositPayAmount.value;
      }
    };
    const redeemCoupon = () => {
      if (!canUsePersonalBenefits.value) {
        feedback.ElMessage.warning('企業身份訂單不支持優惠券和積分');
        return;
      }
      if (redeemCode.value === 'TEST50') {
        if (currentCustomer.value) {
          const newCoupon = {
            id: 'c_new_' + Date.now(),
            name: '測試兌換券',
            desc: '立減50元',
            value: 50,
            type: 'amount'
          };
          currentCustomer.value.coupons.push(newCoupon);
          selectedCouponId.value = newCoupon.id;
          redeemCode.value = '';
          feedback.ElMessage.success('優惠碼兌換成功並已自動應用！');
        } else {
          feedback.ElMessage.warning('請先選擇客戶');
        }
      } else {
        feedback.ElMessage.error('無效的優惠碼');
      }
    };
    const calculateServicePrice = service => {
      const unitPrice = service.daily ? service.unitPrice * rentalDays.value : service.price;
      return unitPrice * (service.quantity || 1);
    };
    const calculateTotal = () => {};
    const submitOrder = () => {
      if (!selectedCustomerId.value) {
        feedback.ElMessage.warning('請選擇客戶');
        return;
      }
      if (!rentalData.pickupTime || !rentalData.returnTime) {
        feedback.ElMessage.warning('請選擇取還車時間');
        return;
      }
      if (new Date(rentalData.returnTime) <= new Date(rentalData.pickupTime)) {
        feedback.ElMessage.warning('還車時間必須晚於取車時間');
        return;
      }
      if (!selectedGroupId.value) {
        feedback.ElMessage.warning('請選擇車組');
        return;
      }
      if (selectedGroup.value && selectedGroup.value.available <= 0) {
        feedback.ElMessage.warning('當前車組庫存不足，無法創建訂單');
        return;
      }
      paymentDialogType.value = 'online';
      newPayment.gateway = 'jiekou';
      paymentDialogVisible.value = true;
      syncPaymentAmount();
    };
    const confirmPayment = () => {
      if (collectionMode.value === 'monthly' && reservationType.value !== 'enterprise') {
        feedback.ElMessage.warning('企業月結僅支持企業預訂');
        return;
      }
      if (collectionMode.value !== 'monthly' && collectionMode.value !== 'pending' && newPayment.amount <= 0) {
        feedback.ElMessage.warning('請輸入本次預授權金額');
        return;
      }
      if (collectionMode.value === 'deposit' && paymentDialogType.value !== 'online') {
        feedback.ElMessage.warning('下單預授權押金僅支持線上預授權');
        paymentDialogType.value = 'online';
        newPayment.gateway = 'jiekou';
        return;
      }
      newPayment.processing = true;
      window.setTimeout(() => {
        newPayment.processing = false;
        paymentDialogVisible.value = false;
        const isMonthly = collectionMode.value === 'monthly';
        const mainStatus = collectionMode.value === 'pending' ? 'pending_payment' : 'reserved';
        const paymentStatus = isMonthly ? 'monthly_billing' : collectionMode.value === 'deposit' ? 'deposit_paid' : 'unpaid';
        const fundSummaryAmount = isMonthly ? finalTotal.value : collectionMode.value === 'pending' ? 0 : newPayment.amount;
        Object.assign(createdOrder, {
          orderId: `ZT${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Date.now()).slice(-4)}`,
          mainStatus,
          mainStatusText: collectionMode.value === 'pending' ? '待支付' : '已預訂',
          paymentStatus,
          paymentStatusText: paymentStatus === 'monthly_billing' ? '企業月結' : paymentStatus === 'paid' ? '已結清' : paymentStatus === 'deposit_paid' ? '已收預授權押金' : '未支付',
          dispatchStatusText: '待派車',
          amount: finalTotal.value,
          paidAmount: collectionMode.value === 'monthly' || collectionMode.value === 'pending' ? 0 : newPayment.amount,
          billingMode: isMonthly ? 'monthly' : 'customer_pay',
          fundSummaryLabel: isMonthly ? '預計月結' : collectionMode.value === 'pending' ? '本次收款' : '本次預授權',
          fundSummaryText: isMonthly ? formatNumber(fundSummaryAmount) : formatNumber(fundSummaryAmount),
          priceVersion: 'PRICE-STORE-20260418-001',
          marketingVersion: reservationType.value === 'enterprise' ? 'MKT-STORE-CORP-20260418-002' : 'MKT-STORE-MEMBER-20260418-001',
          ruleVersion: 'RULE-STORE-20260418-002'
        });
        orderSuccessVisible.value = true;
      }, collectionMode.value === 'monthly' || collectionMode.value === 'pending' ? 500 : 1500);
    };
    watch([finalTotal, collectionMode], () => {
      if (paymentDialogVisible.value) {
        syncPaymentAmount();
      }
    });
    watch(reservationType, value => {
      selectedMarketingPlanId.value = 'none';
      if (value === 'enterprise') {
        selectedCouponId.value = null;
        pointsUsed.value = 0;
        showRedeemInput.value = false;
        redeemCode.value = '';
      }
      if (value !== 'enterprise' && collectionMode.value === 'monthly') {
        setCollectionMode('deposit');
      }
    });
    const viewCreatedOrder = () => {
      const params = new URLSearchParams({
        id: createdOrder.orderId
      });
      if (createdOrder.mainStatus) params.set('status', createdOrder.mainStatus);
      if (createdOrder.paymentStatus) params.set('paymentStatus', createdOrder.paymentStatus);
      if (createdOrder.amount !== undefined) params.set('amount', createdOrder.amount);
      if (createdOrder.billingMode === 'monthly') {
        params.set('billing', 'monthly');
      }
      if (reservationType.value === 'enterprise' && currentCustomer.value?.enterprise) {
        params.set('clientType', 'corporate');
        params.set('customerName', currentCustomer.value.name);
        params.set('customerPhone', currentCustomer.value.phone);
        params.set('customerLevel', currentCustomer.value.levelName);
        params.set('corporateName', currentCustomer.value.enterprise.name);
        params.set('corporateShortName', currentCustomer.value.enterprise.name.slice(0, 8));
      }
      window.location.href = `order_detail.html?${params.toString()}`;
    };
    return {
      reservationType,
      customers,
      vehicleGroups,
      services,
      marketingPlans,
      availableMarketingPlans,
      selectedMarketingPlan,
      marketingPlanEligibilityLabel,
      canUsePersonalBenefits,
      selectedCustomerId,
      currentCustomer,
      rentalData,
      selectedGroupId,
      selectedGroup,
      selectedMarketingPlanId,
      selectedCouponId,
      showRedeemInput,
      redeemCode,
      pointsUsed,
      collectionMode,
      rentalDays,
      rentalDurationLabel,
      rentalBillingLabel,
      baseRentalTotal,
      servicesTotal,
      calculateServicePrice,
      discountAmount,
      couponAmount,
      pointsAmount,
      finalTotal,
      depositAmount,
      depositPayAmount,
      preAuthRuleText,
      handleCustomerSelect,
      formatMarketingPlanLabel,
      handlePickupTimeChange,
      selectVehicleGroup,
      setCollectionMode,
      redeemCoupon,
      calculateTotal,
      submitOrder,
      customerCoupons,
      paymentDialogVisible,
      paymentDialogType,
      newPayment,
      userCreditCards,
      selectedCreditCard,
      orderSuccessVisible,
      createdOrder,
      formatNumber,
      confirmPayment,
      viewCreatedOrder,
      goBack,
      ArrowLeft: rimoIcons.ArrowLeft,
      ElMessage: feedback.ElMessage,
      getDefaultPickupTime,
      getDefaultReturnTime,
      currentCustomerCoupons,
      rentalDurationHours,
      getBillingDayType,
      billingSegments,
      preAuthRule,
      formatDiscountRate,
      syncPaymentAmount
    };
  }
  return pageSetup();
}
export default function NewOrderBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="new-order" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="w-full mx-auto"><div className="mb-4"><RimoElement kind="el-button" onClick={event => {
            view.goBack?.(event);
          }} icon={view.ArrowLeft} plain={true}>{text("返回")}</RimoElement></div>
<div className="grid grid-cols-12 gap-5 items-start" data-rimo-grid="12" data-rimo-layout="form-grid"><div className="col-span-9 space-y-4"><div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-card" shadow="never" className="!border-gray-200 !rounded-lg h-full flex flex-col" bodyClass="!p-4 flex-1" slots={{
                "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="User" /></RimoElement>
{text(" 客戶信息\n                                                ")}</div></>
              }}><div className="block"><RimoElement kind="el-form" labelPosition="top" size="default"><RimoElement kind="el-select" modelValue={view.selectedCustomerId} onModelChange={value => {
                      model.write(["selectedCustomerId"], value);
                    }} placeholder="搜索客戶 (姓名/手機)" filterable={true} className="w-full mb-3" onChange={event => {
                      view.handleCustomerSelect?.(event);
                    }}>{rimoEntries(view.customers).map(([c], _itemIndex) => <Fragment key={c.id}><RimoElement kind="el-option" key={c.id} label={c.name + ' (' + c.phone + ')'} value={c.id}><div className="flex justify-between items-center text-sm"><span>{rimoText(c.name)}</span>
<span className="text-gray-400 text-xs">{rimoText(c.phone)}</span></div></RimoElement></Fragment>)}</RimoElement>
{view.currentCustomer ? <><div className="space-y-3"><div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100"><div><div className="font-bold text-gray-900 text-sm">{rimoText(view.currentCustomer.name)}</div>
<div className="text-xs text-gray-500">{rimoText(view.currentCustomer.phone)}{text("\n                                                                ")}</div></div>
<div className="text-right"><RimoElement kind="el-tag" size="small" type={view.currentCustomer.levelType} effect="plain">{rimoText(view.currentCustomer.levelName)}</RimoElement></div></div>
<div className="bg-gray-100 p-1 rounded-lg grid grid-cols-2 gap-1 border border-gray-200" data-rimo-grid="2" data-rimo-layout="summary"><div onClick={_event => {
                            model.write(["reservationType"], 'personal');
                          }} className={rimoClass(["cursor-pointer text-center py-1.5 text-xs font-bold rounded-md transition-all duration-200", rimoClass(view.reservationType === 'personal' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700')])} data-rimo-layout="stat">{text("\n                                                                個人預訂\n                                                            ")}</div>
<div onClick={_event => {
                            view.currentCustomer.enterprise && model.write(["reservationType"], 'enterprise');
                          }} className={rimoClass(["cursor-pointer text-center py-1.5 text-xs font-bold rounded-md transition-all duration-200 relative select-none", rimoClass([view.reservationType === 'enterprise' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700', !view.currentCustomer.enterprise ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'])])} data-rimo-layout="stat">{text("\n                                                                企業預訂\n                                                            ")}</div></div>
{view.reservationType === 'enterprise' && view.currentCustomer.enterprise ? <><div className="text-xs text-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)] p-2 rounded text-center flex items-center justify-center gap-1 border border-[color:var(--app-color-primary-light-8)]"><RimoElement kind="el-icon"><RimoIcon name="OfficeBuilding" /></RimoElement>
{text(" ")}{rimoText(view.currentCustomer.enterprise.name)}{text("\n                                                        ")}</div></> : null}
{view.reservationType === 'enterprise' && view.currentCustomer.enterprise ? <><div className="text-[11px] leading-4 text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">{text("\n                                                            ")}{rimoText(view.collectionMode === 'monthly' ? '企業月結訂單不發起支付或預授權，費用進入企業賬單。' : '非月結企業預訂使用企業資格行銷方案，費用由客戶本人支付，不支持優惠券和積分。')}{text("\n                                                        ")}</div></> : null}</div></> : <><div className="text-xs text-gray-400 text-center py-4 border border-dashed rounded bg-gray-50">{text("\n                                                        請先選擇客戶\n                                                    ")}</div></>}</RimoElement></div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="!border-gray-200 !rounded-lg h-full flex flex-col" bodyClass="!p-0 flex-1" slots={{
                "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Calendar" /></RimoElement>
{text(" 用車信息\n                                                ")}</div></>
              }}><div className="p-4 space-y-3"><div className="grid grid-cols-2 gap-3" data-rimo-grid="2" data-rimo-layout="form-grid"><div><div className="text-xs text-gray-500 mb-1">{text("取車門店")}</div>
<RimoElement kind="el-select" modelValue={view.rentalData.pickupLocation} onModelChange={value => {
                        model.write(["rentalData", "pickupLocation"], value);
                      }} className="w-full" size="default"><RimoElement kind="el-option" label="新北總店" value="store_main"></RimoElement>
<RimoElement kind="el-option" label="臺北車站店" value="store_station"></RimoElement></RimoElement></div>
<div><div className="text-xs text-gray-500 mb-1">{text("取車時間")}</div>
<RimoElement kind="el-date-picker" modelValue={view.rentalData.pickupTime} onModelChange={value => {
                        model.write(["rentalData", "pickupTime"], value);
                      }} type="datetime" placeholder="選擇時間" className="w-full" style={rimoStyle("width: 100%")} size="default" onChange={event => {
                        view.handlePickupTimeChange?.(event);
                      }}></RimoElement></div></div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2" data-rimo-layout="form-grid"><div><div className="text-xs text-gray-500 mb-1">{text("還車門店")}</div>
<RimoElement kind="el-select" modelValue={view.rentalData.returnLocation} onModelChange={value => {
                        model.write(["rentalData", "returnLocation"], value);
                      }} className="w-full" size="default"><RimoElement kind="el-option" label="新北總店" value="store_main"></RimoElement>
<RimoElement kind="el-option" label="臺北車站店" value="store_station"></RimoElement></RimoElement></div>
<div><div className="text-xs text-gray-500 mb-1">{text("還車時間")}</div>
<RimoElement kind="el-date-picker" modelValue={view.rentalData.returnTime} onModelChange={value => {
                        model.write(["rentalData", "returnTime"], value);
                      }} type="datetime" placeholder="選擇時間" className="w-full" style={rimoStyle("width: 100%")} size="default"></RimoElement></div></div>
<div className="text-xs bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary-hover)] px-3 py-2 rounded border border-[color:var(--app-color-primary-light-8)]">{text("\n                                                    預計租期：")}
<span className="font-bold">{rimoText(view.rentalDurationLabel)}</span>
{text("，計費：")}
<span className="font-bold">{rimoText(view.rentalBillingLabel)}</span>
{text("，按當前車組標準價試算。\n                                                ")}</div></div></RimoElement></div>
<RimoElement kind="el-card" shadow="never" className="!border-gray-200 !rounded-lg" bodyClass="!p-0" slots={{
              "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Van" /></RimoElement>
{text(" 車組選擇\n                                            ")}</div></>
            }}><div className="p-4"><div className="grid grid-cols-4 gap-3" data-rimo-grid="4">{rimoEntries(view.vehicleGroups).map(([group], _itemIndex) => <Fragment key={group.id}><div key={group.id} onClick={_event => {
                      view.selectVehicleGroup(group);
                    }} className={rimoClass(["cursor-pointer border rounded-lg p-3 relative hover:shadow-md transition-all duration-200 group bg-white", rimoClass([view.selectedGroupId === group.id ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]', group.available <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-50 hover:shadow-none hover:border-gray-200' : ''])])}><div className="flex justify-between items-start mb-1"><div className="font-bold text-gray-800 text-sm truncate pr-2">{rimoText(group.name)}</div>
<RimoElement kind="el-tag" size="small" type={group.available > 0 ? 'success' : 'danger'} effect="light" className="!px-1 !h-5 !text-[10px]">{text("\n                                                            ")}{rimoText(group.available > 0 ? '剩' + group.available : '無庫存')}{text("\n                                                        ")}</RimoElement></div>
<div className="text-xs text-gray-500 truncate mb-2" title={group.desc}>{rimoText(group.desc)}</div>
<div className="flex items-end justify-between"><div className="text-[color:var(--app-color-primary)] font-bold"><span className="text-sm"></span>
{rimoText(group.price)}
<span className="text-xs font-normal text-gray-400">{text("/天")}</span></div>
<div className={rimoClass(["w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center transition-colors", rimoClass({
                          'bg-[color:var(--app-color-primary)] border-[color:var(--app-color-primary)]': view.selectedGroupId === group.id
                        })])}>{view.selectedGroupId === group.id ? <><RimoElement kind="el-icon" className="text-white text-xs scale-75"><RimoIcon name="Check" /></RimoElement></> : null}</div></div></div></Fragment>)}</div></div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="!border-gray-200 !rounded-lg" bodyClass="!p-0" slots={{
              "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Goods" /></RimoElement>
{text(" 增值服務\n                                            ")}</div></>
            }}><div className="p-0"><div className="grid grid-cols-2 divide-x divide-gray-100" data-rimo-grid="2">{rimoEntries(view.services).map(([service, _index], _itemIndex) => <Fragment key={service.id}><div key={service.id} className={rimoClass(["p-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100", rimoClass({
                      'bg-[color:var(--app-color-primary-light-9)]': service.selected
                    })])}><div className="flex items-center gap-3"><RimoElement kind="el-checkbox" modelValue={service.selected} onModelChange={value => {
                          model.assign(service, "selected", value);
                        }} onChange={event => {
                          view.calculateTotal?.(event);
                        }} size="default"><span className="text-sm text-gray-700 font-medium">{rimoText(service.name)}</span></RimoElement></div>
<div className="flex items-center gap-3" data-rimo-layout="field-row"><div className="text-gray-900 font-bold text-sm">{rimoText(service.price)}{text("\n                                                        ")}</div>
{service.maxQuantity > 1 ? <><RimoElement kind="el-input-number" modelValue={service.quantity} onModelChange={value => {
                            model.assign(service, "quantity", value);
                          }} min={1} max={service.maxQuantity} size="small" controlsPosition="right" className="!w-20" disabled={!service.selected} onChange={event => {
                            view.calculateTotal?.(event);
                          }}></RimoElement></> : null}</div></div></Fragment>)}</div></div></RimoElement></div>
<div className="col-span-3"><div className="sticky-summary space-y-4"><RimoElement kind="el-card" shadow="hover" className="!border-[color:var(--app-color-primary-light-8)] !rounded-lg" bodyClass="!p-0" slots={{
                "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-[color:var(--app-color-primary-light-9)] bg-[color:var(--app-color-primary-light-9)]"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Ticket" /></RimoElement>
{text(" 優惠與折扣\n                                                ")}</div></>
              }}><div className="p-4 space-y-4"><div className="space-y-1"><div className="text-xs font-bold text-gray-600">{text("行銷優惠方案")}</div>
<RimoElement kind="el-select" modelValue={view.selectedMarketingPlanId} onModelChange={value => {
                      model.write(["selectedMarketingPlanId"], value);
                    }} size="default" className="w-full" onChange={event => {
                      view.calculateTotal?.(event);
                    }} disabled={!view.currentCustomer}><RimoElement kind="el-option" label="不使用方案" value="none"></RimoElement>
{rimoEntries(view.availableMarketingPlans).map(([p], _itemIndex) => <Fragment key={p.id}><RimoElement kind="el-option" key={p.id} label={view.formatMarketingPlanLabel(p)} value={p.id}><div className="flex items-center justify-between gap-3"><span>{rimoText(view.formatMarketingPlanLabel(p))}</span>
{p.manualVerification ? <><RimoElement kind="el-tag" size="small" type="warning" effect="plain">{text("取車覈驗")}</RimoElement></> : null}</div></RimoElement></Fragment>)}</RimoElement>
<div className="text-[11px] text-gray-400 leading-4">{text("\n                                                        ")}{rimoText(view.currentCustomer ? view.marketingPlanEligibilityLabel : '選擇客戶後展示可用方案')}{text("\n                                                    ")}</div>
{view.selectedMarketingPlan && view.selectedMarketingPlan.manualVerification ? <><div className="text-[11px] text-amber-600 leading-4 bg-amber-50 border border-amber-100 rounded px-2 py-1">{text("\n                                                        該方案需取車時現場覈驗 ")}{rimoText(view.selectedMarketingPlan.qualificationName)}{text("，未通過時門店會更換方案並重新計算費用。\n                                                    ")}</div></> : null}</div>
{view.canUsePersonalBenefits ? <><div className="space-y-2"><div className="text-xs font-bold text-gray-600">{text("優惠券")}</div>
<div className="flex gap-2" data-rimo-layout="field-row"><RimoElement kind="el-select" modelValue={view.selectedCouponId} onModelChange={value => {
                          model.write(["selectedCouponId"], value);
                        }} placeholder="選擇優惠券" size="default" className="w-full" onChange={event => {
                          view.calculateTotal?.(event);
                        }} clearable={true} disabled={!view.currentCustomer}>{rimoEntries(view.customerCoupons).map(([coupon], _itemIndex) => <Fragment key={coupon.id}><RimoElement kind="el-option" key={coupon.id} label={coupon.name} value={coupon.id}><span className="float-left text-sm">{rimoText(coupon.name)}</span>
<span className="float-right text-gray-400 text-xs">{rimoText(coupon.desc)}</span></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-button" icon={view.showRedeemInput ? 'Minus' : 'Plus'} circle={true} size="default" onClick={_event => {
                          model.write(["showRedeemInput"], !view.showRedeemInput);
                        }} plain={true}></RimoElement></div>
{view.showRedeemInput ? <><div className="flex gap-2 animate-fade-in"><RimoElement kind="el-input" modelValue={view.redeemCode} onModelChange={value => {
                            model.write(["redeemCode"], value);
                          }} placeholder="輸入優惠碼兌換" size="default" className="flex-1"></RimoElement>
<RimoElement kind="el-button" onClick={event => {
                            view.redeemCoupon?.(event);
                          }} size="default" plain={true} className="!px-4">{text("兌換")}</RimoElement></div></> : null}</div></> : null}
{view.canUsePersonalBenefits ? <><div className="space-y-1"><div className="flex justify-between items-center"><div className="text-xs text-gray-600 font-bold">{text("積分抵扣 ")}
<span className="font-normal text-gray-400">{text("(餘")}{rimoText(view.currentCustomer ? view.currentCustomer.points : 0)}{text(")")}</span></div></div>
<div className="flex items-center gap-2" data-rimo-layout="field-row"><RimoElement kind="el-input-number" modelValue={view.pointsUsed} onModelChange={value => {
                          model.write(["pointsUsed"], value);
                        }} min={0} max={view.currentCustomer ? view.currentCustomer.points : 0} step={100} size="default" className="!w-full" disabled={!view.currentCustomer} controlsPosition="right" onChange={event => {
                          view.calculateTotal?.(event);
                        }}></RimoElement>
<div className="text-orange-500 font-bold text-sm w-16 text-right whitespace-nowrap">{text("\n                                                            -")}{rimoText(view.pointsAmount)}</div></div></div></> : <><div className="rounded-lg border border-[color:var(--app-color-primary-light-8)] bg-[color:var(--app-color-primary-light-9)] p-3 text-xs text-[color:var(--app-color-primary-hover)] leading-5">{text("\n                                                    企業身份訂單隻使用企業資格行銷方案，不支持優惠券、兌換碼和積分抵扣。\n                                                ")}</div></>}</div></RimoElement>
<RimoElement kind="el-card" shadow="hover" className="!border-[color:var(--app-color-primary-light-8)] !bg-slate-50/50 !rounded-lg" bodyClass="!p-0" slots={{
                "header": _slot => <><div className="font-bold text-gray-900 text-base px-4 h-[45px] flex items-center border-b border-[color:var(--app-color-primary-light-8)]">{text("\n                                                    費用明細")}</div></>
              }}><div className="p-4"><div className="space-y-2 text-sm"><div className="flex justify-between text-gray-600"><span>{text("租金 (")}{rimoText(view.rentalBillingLabel)}{text(")")}</span>
<span className="font-medium">{rimoText(view.baseRentalTotal)}</span></div>
{view.services.some(s => s.selected) ? <><><div className="text-xs font-bold text-gray-400 mt-2 mb-1">{text("增值服務\n                                                        ")}</div>
{rimoEntries(view.services).map(([service], _itemIndex) => <Fragment key={service.id}><div key={service.id}>{service.selected ? <><div className="flex justify-between text-gray-600 pl-2"><span>{text("\n                                                                    ")}{rimoText(service.name)}{text("\n                                                                    ")}
{service.quantity > 1 ? <><span className="text-xs text-gray-400">{text("x")}{rimoText(service.quantity)}</span></> : null}</span>
<span className="font-medium">{rimoText(view.calculateServicePrice(service))}</span></div></> : null}</div></Fragment>)}</></> : null}
{view.discountAmount > 0 || view.couponAmount > 0 || view.pointsAmount > 0 ? <><div className="border-t border-dashed border-gray-200 my-2 pt-2">{view.discountAmount > 0 ? <><div className="flex justify-between text-green-600 text-xs"><span>{text("行銷優惠方案")}</span>
<span>{text("- ")}{rimoText(view.discountAmount)}</span></div></> : null}
{view.couponAmount > 0 ? <><div className="flex justify-between text-green-600 text-xs"><span>{text("優惠券")}</span>
<span>{text("- ")}{rimoText(view.couponAmount)}</span></div></> : null}
{view.pointsAmount > 0 ? <><div className="flex justify-between text-orange-500 text-xs"><span>{text("積分")}</span>
<span>{text("- ")}{rimoText(view.pointsAmount)}</span></div></> : null}</div></> : null}</div>
<div className="border-t border-gray-200 mt-4 pt-3"><div className="flex justify-between items-baseline"><span className="text-gray-600 text-sm">{text("總計")}</span>
<span className="text-2xl font-bold text-[color:var(--app-color-primary)]">{rimoText(view.finalTotal)}</span></div>
<div className="mt-2 flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-2 py-1.5 rounded border border-blue-100"><span>{text("車組押金標準")}</span>
<span className="font-bold">{rimoText(view.depositAmount)}</span></div></div>
<RimoElement kind="el-button" type="primary" size="large" className="w-full mt-4 !rounded-lg !h-10 !text-base !font-bold shadow-lg shadow-[color:var(--app-color-primary-shadow)]" onClick={event => {
                    view.submitOrder?.(event);
                  }}>{text("\n                                                    創建訂單\n                                                ")}</RimoElement></div></RimoElement></div></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.paymentDialogVisible} onModelChange={value => {
      model.write(["paymentDialogVisible"], value);
    }} title={view.collectionMode === 'monthly' ? '創建企業月結訂單' : view.collectionMode === 'pending' ? '創建待支付訂單' : '添加預授權押金'} width="500px" destroyOnClose={true} top="15vh" className="rounded-xl overflow-hidden new-order-overlay" closeOnClickModal={false} slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" onClick={_event => {
            model.write(["paymentDialogVisible"], false);
          }} className="flex-1" size="large">{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmPayment?.(event);
          }} loading={view.newPayment.processing} className="flex-1" size="large">{text("\n                            ")}{rimoText(view.collectionMode === 'monthly' || view.collectionMode === 'pending' ? '確認創建' : '發起預授權')}{text("\n                        ")}</RimoElement></div></>
    }}>{() => <><div className="p-1"><div className="mb-5"><div className="text-sm font-medium text-gray-700 mb-2">{text("收款模式")}</div>
<div className="grid grid-cols-3 gap-2" data-rimo-grid="3" data-rimo-layout="summary"><div className={rimoClass(["p-3 rounded-lg border cursor-pointer text-center transition-all", rimoClass(view.collectionMode === 'deposit' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-orange-200')])} onClick={_event => {
                view.setCollectionMode('deposit');
              }} data-rimo-layout="stat"><div className="font-bold text-sm">{text("預授權押金")}</div>
<div className="text-xs mt-1">{text("按規則配置")}</div></div>
<div className={rimoClass(["p-3 rounded-lg border cursor-pointer text-center transition-all", rimoClass(view.collectionMode === 'pending' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-200')])} onClick={_event => {
                view.setCollectionMode('pending');
              }} data-rimo-layout="stat"><div className="font-bold text-sm">{text("暫不收款")}</div>
<div className="text-xs mt-1">{text("生成待支付")}</div></div>
<div className={rimoClass(["p-3 rounded-lg border text-center transition-all", rimoClass([view.collectionMode === 'monthly' ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary-hover)]' : 'border-gray-200 text-gray-600', view.reservationType !== 'enterprise' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[color:var(--app-color-primary-light-7)]'])])} onClick={_event => {
                view.setCollectionMode('monthly');
              }} data-rimo-layout="stat"><div className="font-bold text-sm">{text("企業月結")}</div>
<div className="text-xs mt-1">{text("本次不收款")}</div></div></div></div>
{view.collectionMode === 'deposit' ? <><><div className="rounded-lg border border-blue-100 bg-blue-50 text-blue-700 text-sm px-3 py-2 mb-5">{text("\n                            本期下單預授權押金僅支持線上預授權，不支持現金押金、線下押金或僅登記線下憑證。\n                        ")}</div>
{view.paymentDialogType === 'online' ? <><div className="space-y-4"><div className="text-sm font-medium text-gray-700 mb-2">{text("選擇支付渠道")}</div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2" data-rimo-layout="summary"><div className={rimoClass(["p-4 rounded-xl border-2 cursor-pointer transition-all relative", rimoClass(view.newPayment.gateway === 'jiekou' ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                      model.write(["newPayment", "gateway"], 'jiekou');
                    }} data-rimo-layout="stat"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><span className="text-orange-500 text-lg font-bold">{text("街")}</span></div>
<div><div className="font-medium text-gray-800">{text("街口支付")}</div>
<div className="text-xs text-gray-400">{text("線上掃碼")}</div></div></div>
{view.newPayment.gateway === 'jiekou' ? <><div className="absolute top-2 right-2"><RimoElement kind="el-icon" className="text-orange-500"><RimoIcon name="CircleCheck" /></RimoElement></div></> : null}</div>
<div className={rimoClass(["p-4 rounded-xl border-2 cursor-pointer transition-all relative", rimoClass(view.newPayment.gateway === 'credit_card' ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)] shadow-sm' : 'border-gray-200 hover:border-gray-300')])} onClick={_event => {
                      model.write(["newPayment", "gateway"], 'credit_card');
                    }} data-rimo-layout="stat"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)] text-lg"><RimoIcon name="CreditCard" /></RimoElement></div>
<div><div className="font-medium text-gray-800">{text("信用卡")}</div>
<div className="text-xs text-gray-400">{text("用戶綁定卡")}</div></div></div>
{view.newPayment.gateway === 'credit_card' ? <><div className="absolute top-2 right-2"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="CircleCheck" /></RimoElement></div></> : null}</div></div>
{view.newPayment.gateway === 'credit_card' ? <><div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200"><div className="text-sm font-medium text-gray-700 mb-3">{text("選擇信用卡")}</div>
<div className="space-y-2">{rimoEntries(view.userCreditCards).map(([card], _itemIndex) => <Fragment key={card.id}><div key={card.id} className={rimoClass(["p-3 bg-white rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center", rimoClass(view.selectedCreditCard === card.id ? 'border-[color:var(--app-color-primary)] shadow-sm' : 'border-gray-100 hover:border-gray-300')])} onClick={_event => {
                            model.write(["selectedCreditCard"], card.id);
                          }}><div className="flex items-center gap-3"><div className={rimoClass(["w-8 h-8 rounded flex items-center justify-center", rimoClass(card.brand === 'Visa' ? 'bg-blue-100' : 'bg-orange-100')])}><span className={rimoClass(["text-xs font-bold", rimoClass(card.brand === 'Visa' ? 'text-blue-600' : 'text-orange-600')])}>{text("\n                                                    ")}{rimoText(card.brand.substring(0, 2))}{text("\n                                                ")}</span></div>
<div><div className="font-mono text-gray-800">{text("**** **** **** ")}{rimoText(card.last4)}{text("\n                                                ")}</div>
<div className="text-xs text-gray-400">{text("有效期: ")}{rimoText(card.expiry)}</div></div></div>
<div className="flex items-center gap-2">{card.isDefault ? <><RimoElement kind="el-tag" size="small" type="success" effect="plain">{text("默認卡")}</RimoElement></> : null}
{view.selectedCreditCard === card.id ? <><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="CircleCheck" /></RimoElement></> : null}</div></div></Fragment>)}</div></div></> : null}</div></> : null}
<div className="mt-6 p-4 bg-gradient-to-r from-[color:var(--app-color-primary-light-9)] to-[color:var(--app-color-primary-light-9)] rounded-xl border border-[color:var(--app-color-primary-light-8)]"><div className="flex justify-between items-center mb-3"><span className="text-sm font-medium text-gray-700">{text("本次預授權金額")}</span>
<span className="text-xs text-gray-400">{text("訂單總額: ")}{rimoText(view.formatNumber(view.finalTotal))}</span></div>
<RimoElement kind="el-input-number" modelValue={view.newPayment.amount} onModelChange={value => {
                  model.write(["newPayment", "amount"], value);
                }} min={0} max={view.depositPayAmount} controls={false} className="w-full" size="large" precision={0} disabled={true} slots={{
                  "prefix": _slot => <><span className="text-gray-400 font-mono"></span></>
                }}></RimoElement>
<div className="text-xs text-[color:var(--app-color-primary)] mt-2">{text("\n                                ")}{rimoText(view.preAuthRuleText)}{text("，剩餘租金在取車時補足，還車只處理差額結算。\n                            ")}</div></div></></> : view.collectionMode === 'pending' ? <><div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{text("\n                        暫不收款模式下，本次創建訂單不發起預授權。訂單創建後狀態爲“待支付”，支付狀態爲“未支付”，車組庫存保留30分鐘；超時未完成預授權時自動取消並釋放庫存。\n                    ")}</div></> : <><div className="p-4 bg-[color:var(--app-color-primary-light-9)] border border-[color:var(--app-color-primary-light-8)] rounded-xl text-sm text-[color:var(--app-color-primary-hover)]">{text("\n                        企業月結模式下，本次創建訂單不發起支付、不發起預授權。訂單創建後狀態爲“已預訂”，支付狀態爲“企業月結”，最終費用進入企業月結賬單。\n                    ")}</div></>}
<div className="mt-4 grid grid-cols-2 gap-3 text-xs" data-rimo-grid="2"><div className="bg-gray-50 border border-gray-100 rounded-lg p-3"><div className="text-gray-400 mb-1">{text("訂單總額")}</div>
<div className="font-bold text-gray-800">{rimoText(view.formatNumber(view.finalTotal))}</div></div>
<div className="bg-blue-50 border border-blue-100 rounded-lg p-3"><div className="text-blue-500 mb-1">{text("車組押金標準")}</div>
<div className="font-bold text-blue-700">{rimoText(view.formatNumber(view.depositAmount))}</div></div></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.orderSuccessVisible} onModelChange={value => {
      model.write(["orderSuccessVisible"], value);
    }} title="訂單創建成功" width="520px" center={true} destroyOnClose={true} closeOnClickModal={false} className="new-order-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" className="flex-1" onClick={event => {
            view.goBack?.(event);
          }}>{text("返回訂單列表")}</RimoElement>
<RimoElement kind="el-button" type="primary" className="flex-1" onClick={event => {
            view.viewCreatedOrder?.(event);
          }}>{text("\n                            查看訂單詳情\n                        ")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div className="text-center"><div className="mx-auto w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3"><RimoElement kind="el-icon" className="text-3xl"><RimoIcon name="CircleCheck" /></RimoElement></div>
<div className="font-bold text-gray-900 text-lg">{rimoText(view.createdOrder.orderId)}</div>
<div className="text-xs text-gray-500 mt-1">{text("\n                            ")}{rimoText(view.createdOrder.mainStatus === 'pending_payment' ? '車組庫存已臨時保留30分鐘，待支付完成後進入正常派車，並已保存訂單快照版本。' : '車組庫存已鎖定，訂單已寫入門市租車訂單列表，並保存訂單計費快照和規則快照。')}{text("\n                        ")}</div></div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2"><div className="bg-gray-50 border border-gray-100 rounded-lg p-3"><div className="text-xs text-gray-400 mb-1">{text("訂單主狀態")}</div>
<div className="font-bold text-gray-800">{rimoText(view.createdOrder.mainStatusText)}</div></div>
<div className="bg-gray-50 border border-gray-100 rounded-lg p-3"><div className="text-xs text-gray-400 mb-1">{text("支付狀態")}</div>
<div className="font-bold text-gray-800">{rimoText(view.createdOrder.paymentStatusText)}</div></div>
<div className="bg-gray-50 border border-gray-100 rounded-lg p-3"><div className="text-xs text-gray-400 mb-1">{text("派車狀態")}</div>
<div className="font-bold text-gray-800">{rimoText(view.createdOrder.dispatchStatusText)}</div></div>
<div className="bg-gray-50 border border-gray-100 rounded-lg p-3"><div className="text-xs text-gray-400 mb-1">{rimoText(view.createdOrder.fundSummaryLabel)}</div>
<div className="font-bold text-gray-800">{rimoText(view.createdOrder.fundSummaryText)}</div></div></div>
<div className="rounded-lg border border-[color:var(--app-color-primary-light-8)] bg-[color:var(--app-color-primary-light-9)] p-3"><div className="text-xs text-[color:var(--app-color-primary)] mb-2">{text("訂單快照版本")}</div>
<div className="flex flex-wrap gap-2"><RimoElement kind="el-tag" size="small" effect="plain">{rimoText(view.createdOrder.priceVersion)}</RimoElement>
<RimoElement kind="el-tag" size="small" effect="plain">{rimoText(view.createdOrder.marketingVersion)}</RimoElement>
<RimoElement kind="el-tag" size="small" effect="plain">{rimoText(view.createdOrder.ruleVersion)}</RimoElement></div></div></div></>}</RimoElement></RimoRoot>;
}