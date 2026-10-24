<!-- 自动导出：HTML 原型 → Vue 3 SFC（rimo-rental/operation/order_detail.html）。
布局与平台内渲染一比一；模板/逻辑搬运自页面源码，请勿在导出文件上直接二次手工编辑后再导回。
宿主要求：vue3 + element-plus + @element-plus/icons-vue；需 app.use(ElementPlus) 并全局注册图标组件。
注意：<style> 含 :root / html[data-theme] 级别的主题变量（--app-* 命名空间），会作用于宿主页面。 -->
<template>
  <div class="prototype-vue-root order-detail-vue-root">
<section class="legacy-page legacy-order-detail order-detail" data-page-content data-page-root="order-detail" data-page-key="order-detail">
  <div data-business-content data-layout-type="legacy">
<!-- Back Button -->
                <div class="mb-4">
                    <el-button @click="goBack" :icon="ArrowLeft" plain>返回</el-button>
                </div>

                <div>
                    <!-- Top Summary Card -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <div>
                                <div class="flex items-center gap-3 mb-2">
                                    <h1 class="text-2xl font-bold text-gray-900">訂單 {{ orderView.orderId }}</h1>
                                    <el-tag :type="orderStatusType" effect="dark" round>{{ orderStatusText }}</el-tag>
                                    <el-tag effect="plain" round>{{ orderTypeText }}</el-tag>
                                    <el-tag v-if="orderView.clientType === 'corporate'" color="var(--app-color-primary-light-9)"
                                        style="color: var(--app-color-primary); border-color: var(--app-color-primary-light-8);" effect="light" round>
                                        {{ orderView.corporate?.shortName }}
                                    </el-tag>
                                    <el-tag v-if="isMonthlyBilling" type="primary" effect="plain" round>企業月結</el-tag>
                                    <el-tag v-if="paymentStatusBadge" :type="paymentStatusBadge.type" effect="plain"
                                        round>{{ paymentStatusBadge.text }}</el-tag>
                                    <el-tag v-if="postChargeBadge" :type="postChargeBadge.type" effect="plain" round>
                                        {{ postChargeBadge.text }} ¥{{ formatNumber(postChargeView.amount) }}
                                    </el-tag>
                                </div>
                                <div class="flex items-center gap-6 text-sm text-gray-500">
                                    <span class="flex items-center gap-1.5"><el-icon>
                                            <Clock></Clock>
                                        </el-icon> {{ orderView.createTime }}</span>
                                    <span class="flex items-center gap-1.5"><el-icon>
                                            <Iphone></Iphone>
                                        </el-icon> {{ orderView.source }}</span>
                                </div>
                            </div>
                            <div class="flex flex-col items-end">
                                <div class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">訂單總額</div>
                                <div class="text-3xl font-bold text-[color:var(--app-color-primary)] font-mono tracking-tight">{{ formatNumber(orderView.amount) }}</div>
                            </div>
                        </div>

                        <!-- Action Toolbar -->
                        <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                            <div class="flex gap-2">
                                <el-button v-if="canEditOrder" plain icon="Edit">編輯</el-button>
                                <el-button v-if="canRedirect" plain icon="Refresh" @click="openRedirectionModal">改派</el-button>
                                <el-button v-if="canChangeReturnStore && !isSelfServiceOrder" plain icon="Location"
                                    @click="openReturnStoreChangeDialog">改還車門市</el-button>
                                <el-button v-if="canChangeReturnStation && isSelfServiceOrder" plain icon="Location"
                                    @click="openReturnStationChangeDialog">改還車據點</el-button>
                            </div>
                            <div class="w-px h-6 bg-gray-200 mx-1"></div>
                            <div class="flex gap-2">
                                <el-button v-if="canPickup" type="primary" icon="Key" @click="openPickupModal">{{
                                    pickupActionText }}</el-button>

                                <!-- Cancel and close actions moved to dropdown -->

                                <el-button v-if="canExtend" plain icon="Timer" @click="openExtendModal">{{
                                    extendActionText }}</el-button>
                                <el-button v-if="canReturn" type="primary" icon="Checked" @click="openReturnModal">{{
                                    returnActionText }}</el-button>
                            </div>
                            <div class="w-px h-6 bg-gray-200 mx-1"></div>
                            <el-button v-if="orderStatus === 'pending_payment'" type="warning" icon="Wallet"
                                @click="openBookingPaymentDialog">支付</el-button>
                            <el-button plain icon="Money" @click="feeModalVisible = true">費用</el-button>

                            <div class="flex-1"></div>

                            <el-dropdown trigger="click">
                                <el-button plain>
                                    更多操作<el-icon class="el-icon--right">
                                        <ArrowDown></ArrowDown>
                                    </el-icon>
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-if="canCancel" icon="CircleClose" class="text-red-500"
                                            @click="openCancelOrderModal">取消訂單</el-dropdown-item>
                                        <el-dropdown-item v-if="orderStatus === 'pickup_overdue'" icon="WarningFilled" class="text-red-500"
                                            @click="openNoShowModal">標記爽約</el-dropdown-item>
                                        <el-dropdown-item v-if="canClose" icon="SwitchButton" class="text-red-500"
                                            @click="openCloseOrderModal">關閉訂單</el-dropdown-item>
                                        <el-dropdown-item v-if="canAccident" divided icon="Warning" class="text-red-500"
                                            @click="openAccidentModal">事故登記</el-dropdown-item>
                                        <!-- Secondary actions -->
                                        <el-dropdown-item divided icon="Document"
                                            @click="openRemarksModal">訂單備註</el-dropdown-item>
                                        <el-dropdown-item icon="Printer">打印單據</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>

                    <!-- Layout Fix: Top Row for Member & Car Info (Equal Height) -->
                    <div class="grid grid-cols-12 gap-6 mb-6">
                        <!-- User Info -->
                        <div class="col-span-8">
                            <el-card shadow="never" class="border-gray-200 h-full"
                                :body-style="{ padding: '0px', height: '100%' }">
                                <template #header>
                                    <div class="flex justify-between items-center w-full">
                                        <span class="font-bold text-gray-800 flex items-center gap-2">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <User></User>
                                            </el-icon> {{ orderView.clientType === 'corporate' ? '企業客戶信息' : '會員信息' }}
                                        </span>
                                    </div>
                                </template>
                                <div class="p-5 h-full box-border">
                                    <el-descriptions :column="2" border>
                                        <el-descriptions-item :label="orderView.clientType === 'corporate' ? '用車人' : '會員姓名'">
                                            <span 
                                                class="text-[color:var(--app-color-primary)] font-bold cursor-pointer hover:underline hover:text-[color:var(--app-color-primary-hover)] transition-colors">{{ orderView.customer.name }}</span>
                                        </el-descriptions-item>
                                        <el-descriptions-item label="會員編號">{{ orderView.customer.memberNo }}</el-descriptions-item>
                                        <el-descriptions-item label="手機號碼">{{ orderView.customer.phone }}</el-descriptions-item>
                                        <el-descriptions-item label="會員等級">
                                            <el-tag size="small" type="warning" effect="dark">{{ orderView.customer.level }}</el-tag>
                                        </el-descriptions-item>
                                        <el-descriptions-item v-if="orderView.clientType === 'corporate'" label="所屬企業">
                                            <el-tag size="small" color="var(--app-color-primary-light-9)" style="color: var(--app-color-primary); border-color: var(--app-color-primary-light-8);" effect="light">
                                                {{ orderView.corporate?.name }}
                                            </el-tag>
                                        </el-descriptions-item>
                                        <el-descriptions-item v-if="orderView.clientType === 'corporate'" label="部門">
                                            {{ orderView.customer.dept || '-' }}
                                        </el-descriptions-item>
                                        <el-descriptions-item v-if="orderView.clientType === 'corporate'" label="結算方式">
                                            <el-tag size="small" :type="isMonthlyBilling ? 'primary' : 'success'" effect="plain">
                                                {{ isMonthlyBilling ? '企業月結' : '員工自付' }}
                                            </el-tag>
                                        </el-descriptions-item>
                                    </el-descriptions>
                                </div>
                            </el-card>
                        </div>

                        <!-- Car Info (Dispatched) -->
                        <div class="col-span-4">
                            <el-card shadow="never" class="border-gray-200 h-full"
                                :body-style="{ padding: '0px', height: '100%' }">
                                <template #header>
                                    <div class="flex justify-between items-center w-full">
                                        <span class="font-bold text-gray-800 flex items-center gap-2">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <Van></Van>
                                            </el-icon> 派車信息
                                        </span>
                                        <el-tag size="small" effect="plain" type="info">{{ dispatchStatusText }}</el-tag>
                                    </div>
                                </template>
                                <div class="p-5 h-full box-border">
                                    <div class="flex items-center gap-4">
                                        <div 
                                            class="w-14 h-14 bg-gradient-to-br from-[color:var(--app-color-primary-light-9)] to-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] rounded-xl flex items-center justify-center border border-[color:var(--app-color-primary-light-7)] shadow-sm">
                                            <el-icon class="text-3xl">
                                                <Van></Van>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex justify-between items-start">
                                                <div>
                                                    <div 
                                                        class="font-bold text-[color:var(--app-color-primary)] text-lg leading-tight font-mono cursor-pointer hover:underline hover:text-[color:var(--app-color-primary-hover)] transition-colors">
                                                        {{ orderView.vehicle.plate }}</div>
                                                    <div class="text-xs text-gray-500 mt-1">{{ orderView.vehicle.group }}</div>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-mono text-sm font-medium text-gray-600">{{ orderView.vehicle.mileage }}
                                                    </div>
                                                    <div class="text-[10px] text-gray-400">當前里程</div>
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-2 mt-2">
                                                <el-tag size="small" type="info" effect="plain"
                                                    class="!text-gray-600 !bg-gray-50 !border-gray-200">{{ orderView.vehicle.model }}</el-tag>
                                                <el-tag size="small" type="info" effect="light">{{ orderView.vehicle.seats }}</el-tag>
                                                <el-tag size="small" type="info" effect="light">{{ orderView.vehicle.transmission }}</el-tag>
                                                <el-tag size="small" type="info" effect="light">{{ orderView.vehicle.energy }}</el-tag>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </el-card>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-6">
                        <!-- Left Column (Main Info) -->
                        <div class="col-span-8 space-y-6">


                            <!-- Reservation Details -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-gray-800 flex items-center gap-2">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <Calendar></Calendar>
                                            </el-icon> 預約資料
                                        </span>
                                    </div>
                                </template>
                                <div class="p-6">
                                    <el-descriptions :column="1" border>
                                        <el-descriptions-item label="取還站點">
                                            <div class="flex flex-wrap items-center gap-2 text-sm">
                                                <span 
                                                    class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">取</span>
                                                <span class="text-gray-700">{{ pickupLocationDisplay }}</span>
                                                <el-tag size="small" :type="pickupStoreStatusMeta.type" effect="plain">
                                                    門市{{ pickupStoreStatusMeta.label }}
                                                </el-tag>
                                                <el-tag v-if="showPickupStationStatus" size="small" :type="pickupStationStatusMeta.type" effect="plain">
                                                    據點{{ pickupStationStatusMeta.label }}
                                                </el-tag>
                                            </div>
                                            <div v-if="pickupLocationNotice" class="ml-8 mt-1 text-xs text-red-500">
                                                {{ pickupLocationNotice }}
                                            </div>
                                            <div class="flex flex-wrap items-center gap-2 text-sm mt-2">
                                                <span 
                                                    class="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-bold border border-green-100">還</span>
                                                <span class="text-gray-700">{{ returnLocationDisplay }}</span>
                                                <el-tag size="small" :type="returnStoreStatusMeta.type" effect="plain">
                                                    門市{{ returnStoreStatusMeta.label }}
                                                </el-tag>
                                                <el-tag v-if="showReturnStationStatus" size="small" :type="returnStationStatusMeta.type" effect="plain">
                                                    據點{{ returnStationStatusMeta.label }}
                                                </el-tag>
                                            </div>
                                            <div v-if="returnLocationNotice" class="ml-8 mt-1 text-xs text-red-500">
                                                {{ returnLocationNotice }}
                                            </div>
                                        </el-descriptions-item>
                                        <el-descriptions-item label="租期時間">
                                            <div class="flex items-center gap-3">
                                                <span class="font-mono text-gray-600">{{ orderView.schedule.start }}</span>
                                                <el-icon class="text-gray-300">
                                                    <Right></Right>
                                                </el-icon>
                                                <span class="font-mono text-[color:var(--app-color-primary)] font-bold bg-[color:var(--app-color-primary-light-9)] px-2 rounded">{{ orderView.schedule.end }}</span>
                                            </div>
                                        </el-descriptions-item>
                                        <el-descriptions-item label="預定車組">{{ orderView.vehicle.group }}</el-descriptions-item>
                                        <el-descriptions-item label="優惠方案">
                                            <div class="flex gap-2">
                                                <el-tag size="small" effect="light">{{ orderView.promotionText }}</el-tag>
                                                <el-tag v-if="orderView.clientType === 'corporate'" size="small" type="info" effect="plain">
                                                    {{ isMonthlyBilling ? '月結記賬' : '企業資格' }}
                                                </el-tag>
                                            </div>
                                        </el-descriptions-item>
                                        <el-descriptions-item label="額外服務">
                                            <div class="flex gap-2">
                                                <el-tag size="small" effect="plain" type="info">導航 x1</el-tag>
                                                <el-tag size="small" effect="plain" type="info">兒童座椅 x2</el-tag>
                                            </div>
                                        </el-descriptions-item>
                                        <el-descriptions-item label="訂單備註">
                                            <span class="text-gray-600">{{ orderRemarks }}</span>
                                        </el-descriptions-item>
                                    </el-descriptions>
                                </div>
                            </el-card>

                            <!-- Pickup/Return Info -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-gray-800 flex items-center gap-2">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <Connection></Connection>
                                            </el-icon> 取還車明細
                                        </span>
                                    </div>
                                </template>
                                <div class="p-4">
                                    <el-table :data="pickupReturnData" style="width: 100%" :border="false"
                                        :row-class-name="tableRowClassName">
                                        <el-table-column prop="type" label="項目" width="70">
                                            <template #default="scope">
                                                <span class="font-medium text-gray-800">{{ scope.row.type }}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="time" label="時間" min-width="150">
                                            <template #default="{ row }">
                                                <div :class="{'text-gray-400 italic': row.isPending}">{{ row.time }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="station" label="門市 / 據點" min-width="150">
                                            <template #default="{ row }">
                                                <div :class="{'text-gray-400': row.isPending}">
                                                    <div>{{ row.station }}</div>
                                                    <div v-if="row.stationSub" class="text-xs text-gray-400 mt-0.5">{{ row.stationSub }}</div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="mileage" label="里程數" width="110">
                                            <template #default="{ row }">
                                                <span :class="{'text-gray-400': row.isPending}">{{ row.mileage }}</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="fuel" label="油量" width="130">
                                            <template #default="scope">
                                                <div v-if="scope.row.fuel !== '-'" class="flex items-center gap-2">
                                                    <el-progress :percentage="parseInt(scope.row.fuel)"
                                                        :stroke-width="8" :color="getFuelColor(scope.row.fuel)"
                                                        style="width: 50px" :show-text="false" ></el-progress>
                                                    <span class="text-xs font-mono">{{ scope.row.fuel }}</span>
                                                </div>
                                                <span v-else class="text-gray-400">-</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="車況照片" width="100">
                                            <template #default="{ row }">
                                                <el-button v-if="row.photos && row.photos.length > 0" size="small"
                                                    icon="Picture" @click="openPhotoGallery(row.context)">
                                                    {{ row.photos.length }}張
                                                </el-button>
                                                <span v-else class="text-gray-400 text-xs">-</span>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="簽名狀態" width="140">
                                            <template #default="{ row }">
                                                <div v-if="row.signed" class="flex flex-col cursor-pointer group"
                                                    @click="viewSignature(row)">
                                                    <div 
                                                        class="flex items-center gap-1 text-green-600 text-xs group-hover:text-green-700">
                                                        <el-icon>
                                                            <CircleCheck></CircleCheck>
                                                        </el-icon> 已簽名 <span 
                                                            class="text-xs text-gray-400 group-hover:text-[color:var(--app-color-primary)] scale-90">(查看)</span>
                                                    </div>
                                                    <div class="text-xs text-gray-400 scale-90 origin-left">{{
                                                        row.signTime }}</div>
                                                </div>
                                                <div v-else class="text-orange-400 text-xs flex items-center gap-1">
                                                    <el-icon>
                                                        <Clock></Clock>
                                                    </el-icon> 待確認
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="operator" label="操作員" min-width="100">
                                            <template #default="{ row }">
                                                <span :class="{'text-gray-400': row.isPending}">{{ row.operator
                                                    }}</span>
                                            </template>
                                        </el-table-column>
                                    </el-table>

                                    <!-- Bottom Summary (Shown when Return is Completed/Present) -->
                                    <div v-if="orderStatus === 'completed' || returnData.mileage > 0"
                                        class="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center text-sm">
                                        <div class="font-bold text-gray-600 flex items-center gap-2">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <DataLine></DataLine>
                                            </el-icon> 用車統計
                                        </div>
                                        <div class="flex gap-6 text-gray-600">
                                            <span>租期: <span class="text-gray-900 font-bold">4天2小時</span></span>
                                            <span>行駛里程: <span class="text-green-600 font-bold">+670 km</span></span>
                                            <span>油量變化: <span class="text-red-500 font-bold">-20%</span></span>
                                        </div>
                                    </div>
                                </div>

                            </el-card>

                            <!-- Fulfillment Events -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex flex-wrap justify-between items-start gap-3">
                                        <div>
                                            <div class="font-bold text-gray-800 flex items-center gap-2">
                                                <el-icon class="text-[color:var(--app-color-primary)]">
                                                    <Clock></Clock>
                                                </el-icon> 履約事件
                                            </div>
                                            <div class="text-xs text-gray-500 mt-1">按時間線查看訂單關鍵動作、改派、事故和費用影響</div>
                                        </div>
                                        <div class="flex flex-wrap gap-2 justify-end">
                                            <el-tag size="small" type="danger" effect="plain" round
                                                v-if="eventCounts.openAccident > 0">
                                                未結案事故 {{ eventCounts.openAccident }}
                                            </el-tag>
                                            <el-tag size="small" type="warning" effect="plain" round
                                                v-if="eventCounts.redirection > 0">
                                                改派 {{ eventCounts.redirection }}
                                            </el-tag>
                                            <el-tag size="small" effect="plain" round>關鍵事件 {{ eventCounts.all }}</el-tag>
                                        </div>
                                    </div>
                                </template>

                                <div class="px-4 pt-3 pb-3">
                                    <div v-if="eventCounts.openAccident > 0"
                                        class="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 flex items-start justify-between gap-4">
                                        <div class="flex items-start gap-3">
                                            <div 
                                                class="w-8 h-8 rounded-lg bg-white text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                                                <el-icon>
                                                    <Warning></Warning>
                                                </el-icon>
                                            </div>
                                            <div>
                                                <div class="font-bold text-red-700 text-sm">當前訂單存在未結案事故</div>
                                                <div class="text-xs text-red-600 mt-1">
                                                    事故費用、責任歸屬和處理狀態需要在還車結算或追繳前完成核對。
                                                </div>
                                            </div>
                                        </div>
                                        <el-button size="small" type="danger" plain @click="openAccidentRecords">查看事故</el-button>
                                    </div>

                                    <el-tabs v-model="fulfillmentEventTab" class="!mb-0">
                                        <el-tab-pane :label="'全部 ' + eventCounts.all" name="all"></el-tab-pane>
                                        <el-tab-pane :label="'異常 ' + eventCounts.exception" name="exception"></el-tab-pane>
                                        <el-tab-pane :label="'改派 ' + eventCounts.redirection" name="redirection"></el-tab-pane>
                                        <el-tab-pane :label="'事故 ' + eventCounts.accident" name="accident"></el-tab-pane>
                                        <el-tab-pane :label="'操作日誌 ' + eventCounts.audit" name="audit"></el-tab-pane>
                                    </el-tabs>

                                    <div 
                                        class="flex items-center justify-between text-xs text-gray-400 -mt-1 mb-2">
                                        <span>{{ fulfillmentEventTab === 'audit' ? operationRecords.length : filteredFulfillmentEvents.length }} 條記錄</span>
                                        <span>列表區域內滾動查看更多</span>
                                    </div>

                                    <div v-if="fulfillmentEventTab === 'audit'" class="pt-1">
                                        <el-table :data="operationRecords" style="width: 100%" size="small" max-height="420"
                                            :row-class-name="({row}) => row.type === 'danger' ? 'bg-red-50/50' : ''">
                                            <el-table-column prop="timestamp" label="時間" width="150">
                                                <template #default="{ row }">
                                                    <span class="text-xs font-mono text-gray-500">{{ row.timestamp }}</span>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="title" label="操作" min-width="140">
                                                <template #default="{ row }">
                                                    <div class="flex items-center gap-1.5">
                                                        <span class="w-1.5 h-1.5 rounded-full shrink-0"
                                                            :class="row.color ? '' : (row.type === 'success' ? 'bg-green-500' : row.type === 'warning' ? 'bg-yellow-500' : row.type === 'danger' ? 'bg-red-500' : 'bg-blue-500')"
                                                            :style="row.color ? `background-color: ${row.color}` : ''"></span>
                                                        <span class="font-medium text-gray-800 text-sm">{{ row.title }}</span>
                                                    </div>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="content" label="詳情" min-width="180">
                                                <template #default="{ row }">
                                                    <span class="text-xs text-gray-500">{{ row.content || '-' }}</span>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="operator" label="操作員" width="110">
                                                <template #default="{ row }">
                                                    <span class="text-xs text-gray-600">{{ row.operator }}</span>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="memo" label="備註" min-width="120">
                                                <template #default="{ row }">
                                                    <el-tooltip v-if="row.memo" :content="row.memo" placement="top">
                                                        <span 
                                                            class="text-xs text-gray-400 italic truncate block max-w-[120px]">{{
                                                            row.memo }}</span>
                                                    </el-tooltip>
                                                    <span v-else class="text-gray-300">-</span>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                    </div>

                                    <div v-else class="max-h-[520px] overflow-y-auto custom-scroll pr-1 space-y-2">
                                        <div v-if="filteredFulfillmentEvents.length === 0"
                                            class="text-center text-gray-400 text-sm py-8 border border-dashed border-gray-200 rounded-lg">
                                            當前分類暫無履約事件
                                        </div>

                                        <div v-for="(event, index) in filteredFulfillmentEvents" :key="event.key"
                                            class="relative pl-7">
                                            <div v-if="index < filteredFulfillmentEvents.length - 1"
                                                class="absolute left-[9px] top-7 bottom-[-10px] w-px bg-gray-100"></div>
                                            <div class="absolute left-0 top-3.5 w-5 h-5 rounded-full border-4 border-white shadow-sm"
                                                :class="getFulfillmentEventDotClass(event)"></div>

                                            <div class="rounded-lg border p-3 transition-colors"
                                                :class="getFulfillmentEventCardClass(event)">
                                                <div class="flex flex-wrap justify-between items-start gap-3">
                                                    <div>
                                                        <div class="flex flex-wrap items-center gap-2">
                                                            <el-tag size="small" :type="getFulfillmentEventTagType(event)"
                                                                effect="plain">
                                                                {{ event.label }}
                                                            </el-tag>
                                                            <span class="font-bold text-gray-900 text-sm">{{ event.title }}</span>
                                                        </div>
                                                        <div class="text-xs text-gray-500 mt-1">{{ event.summary }}</div>
                                                    </div>
                                                    <div class="text-right text-xs text-gray-400 font-mono">{{ event.time }}</div>
                                                </div>

                                                <div v-if="event.kind === 'redirection' && fulfillmentEventTab === 'redirection'"
                                                    class="mt-2 grid grid-cols-11 gap-2 items-stretch text-xs">
                                                    <div class="col-span-5 bg-white/80 border border-orange-100 rounded-lg p-3">
                                                        <div class="text-gray-400 mb-1">原車輛</div>
                                                        <div class="font-medium text-gray-700">{{ event.record.fromVehicle }}</div>
                                                    </div>
                                                    <div class="col-span-1 flex items-center justify-center text-orange-400">
                                                        <el-icon>
                                                            <Right></Right>
                                                        </el-icon>
                                                    </div>
                                                    <div class="col-span-5 bg-white/90 border border-orange-100 rounded-lg p-3">
                                                        <div class="text-gray-400 mb-1">新車輛</div>
                                                        <div class="font-medium text-gray-900">{{ event.record.toVehicle }}</div>
                                                    </div>
                                                </div>

                                                <div v-if="event.kind === 'redirection'" class="mt-2 flex flex-wrap gap-2">
                                                    <el-tag size="small"
                                                        :type="event.record.priceChange > 0 ? 'danger' : event.record.priceChange < 0 ? 'success' : 'info'"
                                                        effect="plain">
                                                        {{ formatSignedAmount(event.record.priceChange) }}
                                                    </el-tag>
                                                    <el-tag size="small" type="info" effect="plain">
                                                        {{ getRedirectionSettlementText(event.record) }}
                                                    </el-tag>
                                                    <el-tag v-if="event.record.priceHandling === 'free'" size="small"
                                                        type="success" effect="plain">
                                                        免費升等
                                                    </el-tag>
                                                </div>

                                                <div v-if="event.kind === 'accident' && fulfillmentEventTab === 'accident'"
                                                    class="mt-2 grid grid-cols-3 gap-2 text-xs">
                                                    <div class="bg-white/80 border border-red-100 rounded-lg p-3">
                                                        <div class="text-gray-400 mb-1">責任歸屬</div>
                                                        <div class="font-medium text-gray-800">
                                                            {{ getAccidentResponsibilityText(event.record.responsibility) }}
                                                        </div>
                                                    </div>
                                                    <div class="bg-white/80 border border-red-100 rounded-lg p-3">
                                                        <div class="text-gray-400 mb-1">處理狀態</div>
                                                        <div class="font-medium text-gray-800">
                                                            {{ getAccidentStatusText(event.record.status) }}
                                                        </div>
                                                    </div>
                                                    <div class="bg-white/80 border border-red-100 rounded-lg p-3">
                                                        <div class="text-gray-400 mb-1">預估費用</div>
                                                        <div class="font-mono font-bold"
                                                            :class="event.record.amount > 0 ? 'text-red-600' : 'text-gray-500'">
                                                            {{ event.record.amount > 0 ? '¥' + formatNumber(event.record.amount) : '待定損' }}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div v-if="event.kind === 'accident' && fulfillmentEventTab === 'accident' && event.record.photos && event.record.photos.length"
                                                    class="mt-2 flex gap-2">
                                                    <div v-for="(photo, pIdx) in event.record.photos" :key="pIdx"
                                                        class="w-12 h-12 bg-white rounded border border-red-100 flex items-center justify-center cursor-pointer hover:border-red-300 transition-colors shrink-0">
                                                        <el-icon class="text-gray-300 text-lg">
                                                            <Picture></Picture>
                                                        </el-icon>
                                                    </div>
                                                </div>

                                                <div 
                                                    class="mt-2 pt-2 border-t border-white/70 flex flex-wrap justify-between items-center gap-2 text-xs">
                                                    <div class="flex flex-wrap items-center gap-3 text-gray-500">
                                                        <span class="flex items-center gap-1">
                                                            <el-icon>
                                                                <User></User>
                                                            </el-icon> {{ event.operator }}
                                                        </span>
                                                        <span v-if="event.memo" class="text-gray-400">{{ event.memo }}</span>
                                                    </div>
                                                    <div class="flex gap-2">
                                                        <el-button v-if="event.kind === 'accident'" size="small" text
                                                            type="danger" @click="openAccidentRecords">事故詳情</el-button>
                                                        <el-button v-if="event.kind === 'accident' && event.record.amount > 0"
                                                            size="small" text type="primary" @click="feeModalVisible = true">關聯費用</el-button>
                                                        <el-button v-if="event.kind === 'redirection'" size="small" text
                                                            type="warning" @click="openRedirectionModal"
                                                            :disabled="!canRedirect">再次改派</el-button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </el-card>


                        </div>

                        <!-- Right Column (Fees & Logic) -->

                        <div class="col-span-4 space-y-4">

                            <!-- Financial Overview -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-gray-800 flex items-center gap-2">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <DataLine></DataLine>
                                            </el-icon> 賬務總覽
                                        </span>
                                        <el-tag size="small" :type="isMonthlyBilling ? 'primary' : 'success'" effect="plain">
                                            {{ isMonthlyBilling ? '企業月結' : '客戶自付' }}
                                        </el-tag>
                                    </div>
                                </template>
                                <div class="p-4">
                                    <div class="grid grid-cols-2 gap-3">
                                        <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                            <div class="text-xs text-gray-500 mb-1">合計應收</div>
                                            <div class="font-mono text-lg font-bold text-gray-900">¥{{ formatNumber(financeOverview.totalReceivable) }}</div>
                                        </div>
                                        <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                            <div class="text-xs text-gray-500 mb-1">{{ isMonthlyBilling ? '企業掛賬' : '客戶實收' }}</div>
                                            <div class="font-mono text-lg font-bold"
                                                :class="isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : 'text-green-600'">
                                                ¥{{ formatNumber(isMonthlyBilling ? financeOverview.monthlyBillAmount : financeOverview.customerPaid) }}
                                            </div>
                                        </div>
                                        <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                            <div class="text-xs text-gray-500 mb-1">{{ isMonthlyBilling ? '客戶應收' : '待處理' }}</div>
                                            <div class="font-mono text-lg font-bold"
                                                :class="isMonthlyBilling ? 'text-gray-400' : (financeOverview.pendingAmount > 0 ? 'text-orange-600' : 'text-green-600')">
                                                ¥{{ formatNumber(isMonthlyBilling ? 0 : financeOverview.pendingAmount) }}
                                            </div>
                                        </div>
                                        <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                            <div class="text-xs text-gray-500 mb-1">完成後追繳</div>
                                            <div class="font-mono text-lg font-bold"
                                                :class="financeOverview.postChargeAmount > 0 ? 'text-orange-600' : 'text-gray-500'">
                                                ¥{{ formatNumber(financeOverview.postChargeAmount) }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-3 rounded-lg border px-3 py-2 text-xs"
                                        :class="isMonthlyBilling ? 'bg-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary-hover)]' : 'bg-green-50 border-green-100 text-green-700'">
                                        {{ isMonthlyBilling ? '本單不向客戶發起支付、預授權、收款或退款；還車最終應收統一進入企業月結賬單。' : '本單由客戶自付，預授權、收款、退款、減免和追繳均需保留資金記錄。' }}
                                    </div>
                                </div>
                            </el-card>


                            <!-- Billing Snapshot -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-gray-800 flex items-center gap-2">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <Document></Document>
                                            </el-icon> 計費快照
                                        </span>
                                        <div class="flex items-center gap-2">
                                            <el-tag size="small" type="info" effect="plain">基線 {{ billingSnapshotItems.length }}</el-tag>
                                            <el-tag size="small" :type="billingEventSnapshotItems.length ? 'warning' : 'info'" effect="plain">
                                                事件 {{ billingEventSnapshotItems.length }}
                                            </el-tag>
                                        </div>
                                    </div>
                                </template>
                                <div class="divide-y divide-gray-100 max-h-[300px] overflow-y-auto custom-scroll">
                                    <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                                        <div class="flex items-center justify-between gap-3">
                                            <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide">訂單級基線快照</div>
                                        </div>
                                    </div>
                                    <div v-for="item in billingSnapshotItems" :key="item.key" class="px-4 py-3">
                                        <div class="flex items-start justify-between gap-3">
                                            <div class="min-w-0">
                                                <div class="font-medium text-sm text-gray-800 truncate" :title="item.title">{{ item.title }}</div>
                                                <div class="text-xs text-gray-500 mt-1 truncate" :title="item.summary">{{ item.summary }}</div>
                                            </div>
                                            <el-tag size="small" type="primary" effect="plain"
                                                class="shrink-0 cursor-pointer" @click="openSnapshotVersion(item)">
                                                {{ item.version }}
                                            </el-tag>
                                        </div>
                                    </div>
                                    <div class="px-4 py-2.5 bg-amber-50 border-y border-amber-100">
                                        <div class="flex items-center justify-between gap-3">
                                            <div class="text-xs font-semibold text-amber-700 uppercase tracking-wide">事件級快照鏈</div>
                                        </div>
                                    </div>
                                    <template v-if="billingEventSnapshotItems.length">
                                        <div v-for="item in billingEventSnapshotItems" :key="item.key" class="px-4 py-3 bg-amber-50/40">
                                            <div class="flex items-start justify-between gap-3">
                                                <div class="min-w-0">
                                                    <div class="flex items-center gap-2 flex-wrap">
                                                        <div class="font-medium text-sm text-gray-800 truncate max-w-[220px]" :title="item.title">{{ item.title }}</div>
                                                        <el-tag size="small" type="warning" effect="plain">{{ item.eventType }}</el-tag>
                                                    </div>
                                                    <div class="text-xs text-gray-500 mt-1 truncate" :title="item.summary">{{ item.summary }}</div>
                                                </div>
                                                <el-tag size="small" type="warning" effect="plain"
                                                    class="shrink-0 cursor-pointer" @click="openSnapshotVersion(item)">
                                                {{ item.version }}
                                                </el-tag>
                                            </div>
                                        </div>
                                    </template>
                                    <div v-else class="px-4 py-4 text-xs text-gray-400">
                                        暫無事件級快照
                                    </div>
                                </div>
                                <div class="bg-gray-50 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 leading-5">
                                    {{ isMonthlyBilling ? '企業月結訂單不執行客戶支付與退款規則。' : '純履約動作不生成事件級計費快照。' }}
                                </div>
                            </el-card>


                            <!-- Fee Breakdown -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-gray-800 flex items-center gap-2"><el-icon 
                                                class="text-[color:var(--app-color-primary)]">
                                                <Receipt></Receipt>
                                            </el-icon> 收費明細</span>
                                        <el-button type="primary" link @click="feeModalVisible = true">管理費用</el-button>
                                    </div>
                                </template>
                                <div class="divide-y divide-gray-100 max-h-[300px] overflow-y-auto custom-scroll">
                                    <div v-for="fee in rightPanelFeeItems" :key="fee.id"
                                        class="px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div class="flex justify-between items-start gap-3">
                                            <div class="min-w-0">
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <span class="font-medium text-gray-800 text-sm">{{ fee.name }}</span>
                                                    <el-tag v-if="fee.phase === 'post'" size="small" type="warning" effect="plain">追繳</el-tag>
                                                    <el-tag size="small" :type="getFeeStatusType(fee.status)" effect="plain">
                                                        {{ getFeeStatusText(fee.status) }}
                                                    </el-tag>
                                                </div>
                                                <div class="text-xs text-gray-400 mt-1 truncate">{{ fee.description }}</div>
                                            </div>
                                            <div class="text-right shrink-0">
                                                <div class="font-mono font-bold text-gray-900">¥{{ formatNumber(fee.amount) }}</div>
                                                <div v-if="!isMonthlyBilling && fee.amount > fee.paidAmount"
                                                    class="text-xs text-orange-500">
                                                    待收 ¥{{ formatNumber(fee.amount - fee.paidAmount) }}
                                                </div>
                                                <div v-if="isMonthlyBilling" class="text-xs text-[color:var(--app-color-primary)]">入企業賬單</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="rightPanelFeeItems.length === 0" class="p-6 text-center text-gray-400 text-sm">
                                        暫無費用記錄
                                    </div>
                                </div>

                                <div class="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center text-xs">
                                    <span class="text-gray-500">共 {{ financeOverview.feeCount }} 項費用</span>
                                    <span class="text-gray-500">已處理 ¥{{ formatNumber(financeOverview.handledAmount) }}</span>
                                </div>
                            </el-card>

                            <!-- Financial Transactions -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-gray-800 flex items-center gap-2"><el-icon 
                                                class="text-[color:var(--app-color-primary)]">
                                                <CreditCard></CreditCard>
                                            </el-icon> 資金記錄</span>
                                        <el-button type="primary" link @click="openTransactionsDialog">
                                            查看全部 <el-icon class="ml-1">
                                                <ArrowRight></ArrowRight>
                                            </el-icon>
                                        </el-button>
                                    </div>
                                </template>
                                <div v-if="recentFinancialTransactions.length === 0"
                                    class="p-6 text-center text-gray-400 text-sm py-10">
                                    <el-empty description="暫無資金記錄" :image-size="60"></el-empty>
                                </div>
                                <div v-else class="divide-y divide-gray-100 max-h-[300px] overflow-y-auto custom-scroll">
                                    <div v-for="txn in recentFinancialTransactions" :key="txn.id"
                                        class="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div class="flex items-center gap-3 min-w-0">
                                            <div :class="txn.type === 'pre_auth' ? 'bg-[color:var(--app-color-primary-light-9)] text-blue-500' : (txn.type === 'refund' ? 'bg-red-50 text-red-500' : (txn.type === 'waiver' ? 'bg-gray-100 text-gray-500' : (txn.type === 'monthly_bill' ? 'bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)]' : 'bg-green-50 text-green-500')))"
                                                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                                                <el-icon class="text-xl">
                                                    <component 
                                                        :is="txn.type === 'pre_auth' ? 'Lock' : (txn.type === 'refund' ? 'RefreshLeft' : (txn.type === 'waiver' ? 'Discount' : (txn.type === 'monthly_bill' ? 'OfficeBuilding' : 'CircleCheck')))">
                                                    </component>
                                                </el-icon>
                                            </div>
                                            <div class="min-w-0">
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <span class="font-bold text-gray-800 text-sm">{{ getTxnTypeLabel(txn.type, txn.txnType).text }}</span>
                                                    <el-tag size="small" :type="getTxnTypeLabel(txn.type, txn.txnType).type" effect="plain">
                                                        {{ getChannelName(txn.channel) }}
                                                    </el-tag>
                                                </div>
                                                <div class="text-xs text-gray-400 truncate">{{ txn.feeName }} · {{ txn.createdAt }}</div>
                                            </div>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <div class="font-bold font-mono"
                                                :class="txn.type === 'refund' ? 'text-red-500' : (txn.type === 'waiver' ? 'text-gray-400 line-through decoration-gray-400' : (txn.type === 'monthly_bill' ? 'text-[color:var(--app-color-primary)]' : (txn.type === 'pre_auth' ? 'text-blue-600' : 'text-green-600')))">
                                                {{ txn.type === 'refund' ? '-' : '' }}¥{{ formatNumber(txn.amount) }}
                                            </div>
                                            <div class="text-xs text-gray-400 font-mono">{{ txn.refNo || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </el-card>

                            <!-- Invoice Records -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-gray-800 flex items-center gap-2"><el-icon 
                                                class="text-[color:var(--app-color-primary)]">
                                                <Tickets></Tickets>
                                            </el-icon> 發票記錄</span>
                                        <el-button type="primary" size="small" plain icon="Plus">
                                            {{ isMonthlyBilling ? '月結開票' : '申請開票' }}
                                        </el-button>
                                    </div>
                                </template>
                                <div class="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                                    已開票 ¥{{ formatNumber(invoiceSummary.issuedAmount) }} · 待開票 ¥{{ formatNumber(invoiceSummary.pendingAmount) }} · 未開票 ¥{{ formatNumber(invoiceSummary.uninvoicedAmount) }}
                                </div>
                                <div v-if="invoiceRecords.length === 0"
                                    class="p-6 text-center text-gray-400 text-sm py-10">
                                    <el-empty description="暫無發票記錄" :image-size="60"></el-empty>
                                </div>
                                <div v-else class="divide-y divide-gray-100 max-h-[280px] overflow-y-auto custom-scroll">
                                    <div v-for="invoice in invoiceRecords" :key="invoice.id"
                                        class="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                        <div class="flex justify-between items-center">
                                            <div class="flex items-center gap-2.5 flex-1 min-w-0">
                                                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                    :class="invoice.type === 'special' ? 'bg-[color:var(--app-color-primary-light-9)] text-blue-500' : 'bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)]'">
                                                    <el-icon class="text-base">
                                                        <Tickets></Tickets>
                                                    </el-icon>
                                                </div>
                                                <div class="min-w-0 flex-1">
                                                    <div class="flex items-center gap-2 flex-wrap">
                                                        <span class="font-bold text-gray-800 text-sm">{{
                                                            invoice.invoiceNo }}</span>
                                                        <el-tag size="small"
                                                            :type="invoice.type === 'special' ? 'primary' : 'info'"
                                                            effect="plain">
                                                            {{ invoice.type === 'special' ? '專票' : '普票' }}
                                                        </el-tag>
                                                        <el-tag size="small"
                                                            :type="invoice.status === 'issued' ? 'success' : 'warning'"
                                                            effect="plain">
                                                            {{ invoice.status === 'issued' ? '已開具' : '待開具' }}
                                                        </el-tag>
                                                    </div>
                                                    <div class="text-xs text-gray-400">{{ invoice.issueTime }}</div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <div class="font-bold font-mono text-gray-800">¥{{ formatNumber(invoice.amount) }}</div>
                                                <div class="flex items-center gap-1 text-xs text-[color:var(--app-color-primary)] cursor-pointer hover:text-[color:var(--app-color-primary)] transition-colors whitespace-nowrap"
                                                    @click="invoice.showDetails = !invoice.showDetails">
                                                    <el-icon class="transition-transform text-xs"
                                                        :class="{'rotate-90': invoice.showDetails}">
                                                        <CaretRight></CaretRight>
                                                    </el-icon>
                                                    <span>{{ invoice.items.length }}項</span>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Fee Details - Expandable -->
                                        <div v-show="invoice.showDetails"
                                            class="bg-gray-50 rounded-lg p-2.5 border border-gray-100 mt-2 animate__animated animate__fadeIn ml-10">
                                            <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 mb-2">
                                                <div v-for="(item, i) in invoice.items" :key="i"
                                                    class="flex justify-between text-xs">
                                                    <span class="text-gray-500">{{ item.name }}</span>
                                                    <span class="font-mono text-gray-700">¥{{ formatNumber(item.amount) }}</span>
                                                </div>
                                            </div>
                                            <div class="flex gap-2 pt-2 border-t border-gray-200">
                                                <el-button size="small" plain icon="View">查看發票</el-button>
                                                <el-button size="small" plain icon="Download">下載PDF</el-button>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </el-card>

                            <!-- Fee Audit Snapshot -->
                            <el-card shadow="never" class="border-gray-200" :body-style="{ padding: '0px' }">
                                <template #header>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-gray-800 flex items-center gap-2">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <List></List>
                                            </el-icon> 費用審計
                                        </span>
                                        <el-button type="primary" link @click="openFeeAuditLog">查看日誌</el-button>
                                    </div>
                                </template>
                                <div v-if="recentFeeAuditLogs.length === 0" class="p-6 text-center text-gray-400 text-sm">
                                    暫無費用審計記錄
                                </div>
                                <div v-else class="divide-y divide-gray-100">
                                    <div v-for="log in recentFeeAuditLogs" :key="log.id"
                                        class="px-4 py-2.5 flex items-start gap-2">
                                        <el-tag :type="getLogActionType(log.action)" size="small" effect="plain" class="shrink-0">
                                            {{ log.action }}
                                        </el-tag>
                                        <div class="min-w-0 flex-1">
                                            <div class="text-xs text-gray-700 truncate">{{ log.detail }}</div>
                                            <div class="text-xs text-gray-400 mt-0.5">{{ log.time }} · {{ log.operator }}</div>
                                        </div>
                                    </div>
                                </div>
                            </el-card>



                        </div>
                    </div>
                </div>
  </div>
</section>
<div data-page-overlay="overlay" data-block-id="legacy-overlays" data-block-name="歷史頁面覆蓋層" class="order-detail-overlay">
<el-dialog v-model="remarksDialogVisible" title="訂單備註" width="500px" destroy-on-close class="order-detail-overlay">
            <el-form :model="remarksForm" label-position="top">
                <el-form-item label="備註內容">
                    <el-input v-model="remarksForm.content" type="textarea" :rows="4"
                        placeholder="請輸入訂單特殊備註信息..."></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="remarksDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveRemarks">保存</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="accidentDialogVisible" title="事故登記" width="760px" destroy-on-close class="order-detail-overlay">
            <div class="mb-4 rounded-lg border px-4 py-3 text-sm"
                :class="isMonthlyBilling ? 'bg-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary-hover)]' : 'bg-red-50 border-red-100 text-red-700'">
                <div class="font-bold">{{ accidentContextHint.title }}</div>
                <div class="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div class="bg-white/80 border border-gray-200 rounded px-2 py-1">
                        <span class="opacity-70">訂單影響</span>
                        <span class="font-bold ml-1">{{ accidentContextHint.status }}</span>
                    </div>
                    <div class="bg-white/80 border border-gray-200 rounded px-2 py-1">
                        <span class="opacity-70">費用處理</span>
                        <span class="font-bold ml-1">{{ accidentContextHint.fee }}</span>
                    </div>
                    <div class="bg-white/80 border border-gray-200 rounded px-2 py-1">
                        <span class="opacity-70">未結案事故</span>
                        <span class="font-bold ml-1">{{ eventCounts.openAccident }}</span>
                    </div>
                </div>
                <div class="text-xs mt-2 opacity-90">{{ accidentContextHint.desc }}</div>
            </div>

            <!-- Existing Records List -->
            <div v-if="accidentRecords.length > 0 && !isAddingAccident" class="mb-4">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-sm font-bold text-gray-700">已登記記錄</span>
                    <el-button type="primary" size="small" icon="Plus" @click="isAddingAccident = true">新增記錄</el-button>
                </div>
                <div class="space-y-3 max-h-[300px] overflow-y-auto custom-scroll pr-1">
                    <div v-for="(record, index) in accidentRecords" :key="record.id"
                        class="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-start gap-3">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <div class="font-bold text-sm text-gray-800">{{ record.description }}</div>
                                <el-tag size="small" :type="record.status === 'closed' ? 'success' : 'danger'" effect="plain">
                                    {{ getAccidentStatusText(record.status) }}
                                </el-tag>
                            </div>
                            <div class="text-xs text-gray-500 mb-2 flex gap-3">
                                <span>{{ record.time }}</span>
                                <span>{{ record.operator }}</span>
                                <span>{{ getAccidentResponsibilityText(record.responsibility) }}</span>
                                <span v-if="record.location">{{ record.location }}</span>
                            </div>
                            <div class="flex items-center justify-between gap-3">
                                <div class="flex gap-2">
                                    <div v-for="(photo, pIdx) in record.photos" :key="pIdx"
                                        class="w-10 h-10 bg-white rounded border border-gray-200 flex items-center justify-center">
                                        <el-icon class="text-gray-400">
                                            <Picture></Picture>
                                        </el-icon>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs text-gray-400">預估費用</div>
                                    <div class="font-mono font-bold" :class="record.amount > 0 ? 'text-red-600' : 'text-gray-500'">
                                        {{ record.amount > 0 ? '¥' + formatNumber(record.amount) : '待定損' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <el-button v-if="record.status !== 'closed'" type="success" link size="small"
                                @click="closeAccidentRecord(record)">標記結案</el-button>
                            <el-button type="danger" link icon="Delete" @click="deleteAccident(index)"
                                size="small"></el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State for List -->
            <div v-else-if="accidentRecords.length === 0 && !isAddingAccident" class="text-center py-8">
                <el-empty description="暫無事故記錄" :image-size="80"></el-empty>
                <el-button type="primary" icon="Plus" @click="isAddingAccident = true">新增第一條記錄</el-button>
            </div>

            <!-- Add Form -->
            <div v-else>
                <div class="flex items-center gap-2 mb-4 text-sm text-gray-500 cursor-pointer hover:text-[color:var(--app-color-primary)]"
                    @click="isAddingAccident = false" v-if="accidentRecords.length > 0">
                    <el-icon>
                        <Back></Back>
                    </el-icon> 返回列表
                </div>
                <el-form :model="newAccidentForm" label-position="top">
                    <el-form-item label="事故詳情描述">
                        <el-input v-model="newAccidentForm.description" type="textarea" :rows="3"
                            placeholder="請詳細描述事故部位、程度及原因..."></el-input>
                    </el-form-item>
                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="事故時間">
                            <el-date-picker v-model="newAccidentForm.accidentTime" type="datetime"
                                placeholder="選擇事故時間" class="w-full" style="width: 100%"></el-date-picker>
                        </el-form-item>
                        <el-form-item label="事故地點">
                            <el-input v-model="newAccidentForm.location" placeholder="事故發生地點或停車位置"></el-input>
                        </el-form-item>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="責任歸屬">
                            <el-select v-model="newAccidentForm.responsibility" placeholder="請選擇責任歸屬" class="w-full">
                                <el-option label="客戶責任" value="customer"></el-option>
                                <el-option label="門店責任" value="store"></el-option>
                                <el-option label="第三方責任" value="third_party"></el-option>
                                <el-option label="責任待定" value="pending"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="預估費用">
                            <el-input-number v-model="newAccidentForm.estimatedAmount" :min="0" :step="100"
                                class="!w-full" controls-position="right"></el-input-number>
                        </el-form-item>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="處理狀態">
                            <el-select v-model="newAccidentForm.handlingStatus" class="w-full">
                                <el-option label="待定損" value="pending_assessment"></el-option>
                                <el-option label="保險處理中" value="insurance_processing"></el-option>
                                <el-option label="客戶確認中" value="customer_confirming"></el-option>
                                <el-option label="已結案" value="closed"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="保險報案號">
                            <el-input v-model="newAccidentForm.insuranceNo" placeholder="已報案時填寫"></el-input>
                        </el-form-item>
                    </div>
                    <el-form-item label="處理備註">
                        <el-input v-model="newAccidentForm.remark" type="textarea" :rows="2"
                            placeholder="填寫保險報案、客戶溝通或門店處理說明..."></el-input>
                    </el-form-item>
                    <el-form-item label="現場照片">
                        <el-upload action="#" list-type="picture-card" :auto-upload="false" :limit="5">
                            <el-icon>
                                <Plus></Plus>
                            </el-icon>
                        </el-upload>
                    </el-form-item>
                </el-form>
            </div>

            <template #footer>
                <div class="dialog-footer" v-if="isAddingAccident">
                    <el-button @click="isAddingAccident = false" v-if="accidentRecords.length > 0">取消</el-button>
                    <el-button @click="accidentDialogVisible = false" v-else>取消</el-button>
                    <el-button type="primary" @click="saveAccident">確認登記</el-button>
                </div>
                <div class="dialog-footer" v-else>
                    <el-button @click="accidentDialogVisible = false">關閉</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="returnStoreChangeDialogVisible" title="改還車門市 / 轉單" width="720px" destroy-on-close class="order-detail-overlay">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="rounded border border-gray-200 bg-gray-50 p-3">
                        <div class="text-xs text-gray-500 mb-1">取車門市</div>
                        <div class="font-bold text-gray-800">{{ pickupStoreName }}</div>
                    </div>
                    <div class="rounded border border-gray-200 bg-gray-50 p-3">
                        <div class="text-xs text-gray-500 mb-1">當前還車門市</div>
                        <div class="font-bold text-gray-800">{{ currentReturnStoreName }}</div>
                    </div>
                </div>

                <div class="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    確認後訂單當前還車門市會更新，新門市獲得訂單列表、詳情和還車操作權限；原還車門市不再辦理還車。
                </div>
                <div class="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    本期僅支持同車行內改還車門市/轉單，跨車行轉單不開放系統操作。
                </div>

                <el-form label-position="top">
                    <el-form-item label="新還車門市">
                        <el-select v-model="returnStoreChangeData.newStoreId" class="w-full"
                            @change="checkReturnStoreScheduleConflict">
                            <el-option v-for="store in returnStoreTransferOptions" :key="store.id" :label="store.name"
                                :value="store.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="變更原因">
                        <el-select v-model="returnStoreChangeData.reason" class="w-full">
                            <el-option v-for="reason in returnStoreChangeReasons" :key="reason.value"
                                :label="reason.label" :value="reason.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="returnStoreChangeData.reason === 'other' ? '備註（必填）' : '備註'">
                        <el-input v-model="returnStoreChangeData.remark" type="textarea" :rows="3"
                            placeholder="記錄客戶說明、門店協商結果或異常情況"></el-input>
                    </el-form-item>
                </el-form>

                <div v-if="returnStoreConflict.checked && returnStoreConflict.hasConflict"
                    class="rounded border p-4"
                    :class="returnStoreConflict.resolved ? 'border-green-100 bg-green-50' : 'border-red-200 bg-red-50'">
                    <div class="flex items-start gap-3">
                        <el-icon class="text-xl mt-0.5"
                            :class="returnStoreConflict.resolved ? 'text-green-600' : 'text-red-500'">
                            <WarningFilled v-if="!returnStoreConflict.resolved"></WarningFilled>
                            <CircleCheckFilled v-else></CircleCheckFilled>
                        </el-icon>
                        <div class="flex-1">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <h4 class="font-bold text-gray-800 text-sm mb-1">
                                        {{ returnStoreConflict.resolved ? '後續訂單已快捷改派' : '原還車門市存在後續預約' }}
                                    </h4>
                                    <p class="text-xs"
                                        :class="returnStoreConflict.resolved ? 'text-green-700' : 'text-red-600'">
                                        {{ orderView.vehicle.plate }} 轉到 {{ returnStoreConflict.targetStoreName }} 後，原還車門市
                                        {{ returnStoreConflict.originalStoreName }} 的後續訂單需要先釋放車輛佔用。
                                    </p>
                                </div>
                                <el-tag size="small" :type="returnStoreConflict.resolved ? 'success' : 'danger'">
                                    {{ returnStoreConflict.resolved ? '已處理' : '需處理' }}
                                </el-tag>
                            </div>
                            <div class="grid grid-cols-4 gap-2 mt-3 text-xs">
                                <div class="bg-white/80 border rounded p-2">
                                    <div class="text-gray-400">後續訂單</div>
                                    <div class="font-bold text-gray-800 mt-1">{{ returnStoreConflict.orderId }}</div>
                                </div>
                                <div class="bg-white/80 border rounded p-2">
                                    <div class="text-gray-400">取車時間</div>
                                    <div class="font-bold text-gray-800 mt-1">{{ returnStoreConflict.pickupTime }}</div>
                                </div>
                                <div class="bg-white/80 border rounded p-2">
                                    <div class="text-gray-400">客戶</div>
                                    <div class="font-bold text-gray-800 mt-1">{{ returnStoreConflict.customerName }}</div>
                                </div>
                                <div class="bg-white/80 border rounded p-2">
                                    <div class="text-gray-400">派車狀態</div>
                                    <div class="font-bold text-gray-800 mt-1">{{ returnStoreConflict.status }}</div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-3">
                                <div class="text-xs text-gray-600">
                                    {{ returnStoreConflict.currentVehicle }} -> {{ returnStoreConflict.targetVehicle }}
                                </div>
                                <el-button v-if="!returnStoreConflict.resolved" type="danger" size="small" plain
                                    @click="quickRedirectReturnStoreConflict">快捷改派後續訂單</el-button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3 text-sm">
                    <div class="rounded border border-gray-200 p-3">
                        <div class="text-xs text-gray-500 mb-1">當前異地費</div>
                        <div class="font-bold text-gray-800">¥{{ formatNumber(returnStoreCurrentFee) }}</div>
                    </div>
                    <div class="rounded border border-gray-200 p-3">
                        <div class="text-xs text-gray-500 mb-1">新異地費</div>
                        <div class="font-bold text-gray-800">¥{{ formatNumber(returnStoreNewFee) }}</div>
                    </div>
                    <div class="rounded border p-3"
                        :class="returnStoreChangeFeeDelta > 0 ? 'border-red-100 bg-red-50' : returnStoreChangeFeeDelta < 0 ? 'border-green-100 bg-green-50' : 'border-gray-200 bg-gray-50'">
                        <div class="text-xs mb-1"
                            :class="returnStoreChangeFeeDelta > 0 ? 'text-red-500' : returnStoreChangeFeeDelta < 0 ? 'text-green-600' : 'text-gray-500'">
                            本次差額
                        </div>
                        <div class="font-bold"
                            :class="returnStoreChangeFeeDelta > 0 ? 'text-red-600' : returnStoreChangeFeeDelta < 0 ? 'text-green-700' : 'text-gray-800'">
                            {{ returnStoreChangeFeeDelta >= 0 ? '+' : '-' }}¥{{ formatNumber(returnStoreChangeFeeAbs) }}
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="returnStoreChangeDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmReturnStoreChange"
                        :disabled="returnStoreConflict.hasConflict && !returnStoreConflict.resolved">確認轉單</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="returnStationChangeDialogVisible" title="改還車據點" width="720px" destroy-on-close class="order-detail-overlay">
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="rounded border border-gray-200 bg-gray-50 p-3">
                        <div class="text-xs text-gray-500 mb-1">當前還車門市</div>
                        <div class="font-bold text-gray-800">{{ currentReturnStoreName }}</div>
                    </div>
                    <div class="rounded border border-gray-200 bg-gray-50 p-3">
                        <div class="text-xs text-gray-500 mb-1">當前還車據點</div>
                        <div class="font-bold text-gray-800">{{ currentReturnStationName }}</div>
                    </div>
                </div>

                <div class="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    適用於 24 小時自助訂單，或需要人工指定具體還車據點的場景。確認後訂單當前還車據點會更新；如同時切換到其他門市，則新門市獲得還車辦理權限。
                </div>
                <div class="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    本期不自動改站、不自動取消。若門市或據點已關閉，僅提示“站點已關閉，請聯繫客服處理”，由客服人工處理。
                </div>

                <el-form label-position="top">
                    <el-form-item label="新還車據點">
                        <el-cascader v-model="returnStationChangeData.path" :options="returnStationTransferOptions"
                            class="w-full" clearable @change="checkReturnStationScheduleConflict"
                            placeholder="選擇門市與據點"></el-cascader>
                    </el-form-item>
                    <el-form-item label="變更原因">
                        <el-select v-model="returnStationChangeData.reason" class="w-full">
                            <el-option v-for="reason in returnStoreChangeReasons" :key="reason.value"
                                :label="reason.label.replace('門市', '據點')" :value="reason.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="returnStationChangeData.reason === 'other' ? '備註（必填）' : '備註'">
                        <el-input v-model="returnStationChangeData.remark" type="textarea" :rows="3"
                            placeholder="記錄站點關閉、客服溝通結果或客戶變更說明"></el-input>
                    </el-form-item>
                </el-form>

                <div v-if="returnStationConflict.checked && returnStationConflict.hasConflict"
                    class="rounded border p-4"
                    :class="returnStationConflict.resolved ? 'border-green-100 bg-green-50' : 'border-red-200 bg-red-50'">
                    <div class="flex items-start gap-3">
                        <el-icon class="text-xl mt-0.5"
                            :class="returnStationConflict.resolved ? 'text-green-600' : 'text-red-500'">
                            <WarningFilled v-if="!returnStationConflict.resolved"></WarningFilled>
                            <CircleCheckFilled v-else></CircleCheckFilled>
                        </el-icon>
                        <div class="flex-1">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <h4 class="font-bold text-gray-800 text-sm mb-1">
                                        {{ returnStationConflict.resolved ? '後續訂單已快捷改派' : '原還車門市存在後續預約' }}
                                    </h4>
                                    <p class="text-xs"
                                        :class="returnStationConflict.resolved ? 'text-green-700' : 'text-red-600'">
                                        {{ orderView.vehicle.plate }} 改到 {{ returnStationConflict.targetStoreName }} / {{
                                            returnStationConflict.targetStationName }} 後，原還車門市
                                        {{ returnStationConflict.originalStoreName }} 的後續訂單需要先釋放車輛佔用。
                                    </p>
                                </div>
                                <el-tag size="small" :type="returnStationConflict.resolved ? 'success' : 'danger'">
                                    {{ returnStationConflict.resolved ? '已處理' : '需處理' }}
                                </el-tag>
                            </div>
                            <div class="grid grid-cols-4 gap-2 mt-3 text-xs">
                                <div class="bg-white/80 border rounded p-2">
                                    <div class="text-gray-400">後續訂單</div>
                                    <div class="font-bold text-gray-800 mt-1">{{ returnStationConflict.orderId }}</div>
                                </div>
                                <div class="bg-white/80 border rounded p-2">
                                    <div class="text-gray-400">取車時間</div>
                                    <div class="font-bold text-gray-800 mt-1">{{ returnStationConflict.pickupTime }}</div>
                                </div>
                                <div class="bg-white/80 border rounded p-2">
                                    <div class="text-gray-400">客戶</div>
                                    <div class="font-bold text-gray-800 mt-1">{{ returnStationConflict.customerName }}</div>
                                </div>
                                <div class="bg-white/80 border rounded p-2">
                                    <div class="text-gray-400">派車狀態</div>
                                    <div class="font-bold text-gray-800 mt-1">{{ returnStationConflict.status }}</div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-3">
                                <div class="text-xs text-gray-600">
                                    {{ returnStationConflict.currentVehicle }} -> {{ returnStationConflict.targetVehicle }}
                                </div>
                                <el-button v-if="!returnStationConflict.resolved" type="danger" size="small" plain
                                    @click="quickRedirectReturnStationConflict">快捷改派後續訂單</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="returnStationChangeDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmReturnStationChange"
                        :disabled="returnStationConflict.hasConflict && !returnStationConflict.resolved">確認改還車據點</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="pickupModalVisible" title="車輛取車作業" width="1000px" destroy-on-close top="5vh" class="rounded-xl overflow-hidden custom-modal order-detail-overlay" :before-close="handlePickupDialogClose">
            <div class="h-[85vh] flex flex-col">
                <!-- Wizard Header -->
                <div class="px-10 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div class="flex items-center gap-3 relative z-10"
                        :class="{'opacity-100': pickupStep >= 0, 'opacity-50': pickupStep < 0}">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4"
                            :class="pickupStep >= 0 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent'">
                            <el-icon v-if="pickupStep > 0">
                                <Check></Check>
                            </el-icon>
                            <span v-else>1</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Step 01</span>
                            <span class="text-sm font-bold text-gray-800">身份與資格</span>
                        </div>
                    </div>

                    <div class="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden">
                        <div class="h-full bg-[color:var(--app-color-primary)] transition-all duration-500"
                            :style="{width: pickupStep >= 1 ? '100%' : '0%'}"></div>
                    </div>

                    <div class="flex items-center gap-3 relative z-10"
                        :class="{'opacity-100': pickupStep >= 1, 'opacity-50': pickupStep < 1}">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4"
                            :class="pickupStep >= 1 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent'">
                            <el-icon v-if="pickupStep > 1">
                                <Check></Check>
                            </el-icon>
                            <span v-else>2</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Step 02</span>
                            <span class="text-sm font-bold text-gray-800">押金尾款</span>
                        </div>
                    </div>

                    <div class="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden">
                        <div class="h-full bg-[color:var(--app-color-primary)] transition-all duration-500"
                            :style="{width: pickupStep >= 2 ? '100%' : '0%'}"></div>
                    </div>

                    <div class="flex items-center gap-3 relative z-10"
                        :class="{'opacity-100': pickupStep >= 2, 'opacity-50': pickupStep < 2}">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4"
                            :class="pickupStep >= 2 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent'">
                            <el-icon v-if="pickupStep > 2">
                                <Check></Check>
                            </el-icon>
                            <span v-else>3</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Step 03</span>
                            <span class="text-sm font-bold text-gray-800">合約驗車</span>
                        </div>
                    </div>

                    <div class="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden">
                        <div class="h-full bg-[color:var(--app-color-primary)] transition-all duration-500"
                            :style="{width: pickupStep >= 3 ? '100%' : '0%'}"></div>
                    </div>

                    <div class="flex items-center gap-3 relative z-10"
                        :class="{'opacity-100': pickupStep >= 3, 'opacity-50': pickupStep < 3}">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4"
                            :class="pickupStep >= 3 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent'">
                            <el-icon v-if="pickupStep > 3">
                                <Check></Check>
                            </el-icon>
                            <span v-else>4</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Step 04</span>
                            <span class="text-sm font-bold text-gray-800">發車完成</span>
                        </div>
                    </div>
                </div>

                <div v-if="orderStatus === 'inspecting'"
                    class="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-3 text-xs text-amber-700">
                    <div class="flex items-center gap-2 min-w-0">
                        <el-icon class="text-base shrink-0">
                            <Warning></Warning>
                        </el-icon>
                        <span class="font-bold shrink-0">{{ pickupInterrupted ? '取車草稿已保留' : '取車辦理中' }}</span>
                        <span class="truncate">當前驗車中，確認發車後進入用車中；操作鎖 {{ pickupLock.operator }}，{{ pickupLock.expiresAt }} 到期。</span>
                    </div>
                    <el-button v-if="pickupInterrupted" size="small" text type="warning" @click="releasePickupLock">
                        釋放操作鎖
                    </el-button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-6">
                    <!-- Step 0: Identity & Qualification -->
                    <div v-if="pickupStep === 0" class="animate__animated animate__fadeIn">
                        <div class="grid grid-cols-12 gap-6 h-full min-h-[480px]">
                            <!-- Left: Driver Identity -->
                            <div class="col-span-5 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col h-full">
                                <div class="px-6 py-4 bg-slate-50/80 border-b border-gray-100 flex items-center justify-between shrink-0">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] flex flex-col items-center justify-center shadow-sm border border-[color:var(--app-color-primary-light-8)]">
                                            <el-icon class="text-sm"><UserFilled></UserFilled></el-icon>
                                        </div>
                                        <div>
                                            <h4 class="font-bold text-gray-900 text-sm">駕駛人身份</h4>
                                            <p class="text-[11px] text-gray-500 mt-0.5">覈對證件與本人一致</p>
                                        </div>
                                    </div>
                                    <el-tag type="info" effect="plain" class="!border-gray-200 !text-gray-500 !bg-white shadow-sm">駕照有效</el-tag>
                                </div>

                                <div class="p-6 flex-1 flex flex-col">
                                    <!-- Detail Grid -->
                                    <div class="grid grid-cols-2 gap-3 mb-8 basis-auto">
                                        <div class="bg-gray-50/70 p-3 rounded-lg border border-gray-200/60 shadow-sm transition-colors hover:bg-white hover:border-[color:var(--app-color-primary-light-8)]">
                                            <div class="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                                                <el-icon><User></User></el-icon> 駕駛人
                                            </div>
                                            <div class="font-bold text-gray-900 text-sm">{{ pickupData.driverName }}</div>
                                        </div>
                                        <div class="bg-gray-50/70 p-3 rounded-lg border border-gray-200/60 shadow-sm transition-colors hover:bg-white hover:border-[color:var(--app-color-primary-light-8)]">
                                            <div class="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                                                <el-icon><Phone></Phone></el-icon> 聯繫電話
                                            </div>
                                            <div class="font-mono font-medium text-gray-800 text-sm">{{ pickupData.driverPhone }}</div>
                                        </div>
                                        <div class="bg-gray-50/70 p-3 rounded-lg border border-gray-200/60 shadow-sm transition-colors hover:bg-white hover:border-[color:var(--app-color-primary-light-8)]">
                                            <div class="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                                                <el-icon><Postcard></Postcard></el-icon> 身份證號
                                            </div>
                                            <div class="font-mono font-medium text-gray-800 text-sm">{{ pickupData.driverId }}</div>
                                        </div>
                                        <div class="bg-gray-50/70 p-3 rounded-lg border border-gray-200/60 shadow-sm transition-colors hover:bg-white hover:border-[color:var(--app-color-primary-light-8)]">
                                            <div class="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
                                                <el-icon><Calendar></Calendar></el-icon> 駕照有效期
                                            </div>
                                            <div class="font-mono font-medium text-gray-800 text-sm">{{ pickupData.licenseExp }}</div>
                                        </div>
                                    </div>

                                    <!-- ID Cards Display -->
                                    <div class="grid grid-cols-2 gap-4 mb-6 relative">
                                        <div class="border border-gray-200 rounded-xl p-4 bg-white hover:border-[color:var(--app-color-primary-light-7)] hover:shadow-md transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between">
                                            <div class="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0">
                                                <el-icon class="text-6xl"><Postcard></Postcard></el-icon>
                                            </div>
                                            <div class="flex items-center justify-between mb-3 relative z-10">
                                                <div class="text-sm font-bold text-gray-800 group-hover:text-[color:var(--app-color-primary)] transition-colors">身份證人像面</div>
                                                <el-tag size="small" type="info" effect="plain" class="opacity-0 group-hover:opacity-100 transition-opacity !bg-white">查看</el-tag>
                                            </div>
                                            <div class="h-20 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 shadow-inner relative z-10">
                                                <el-icon class="text-3xl"><Postcard></Postcard></el-icon>
                                            </div>
                                        </div>
                                        <div class="border border-gray-200 rounded-xl p-4 bg-white hover:border-[color:var(--app-color-primary-light-7)] hover:shadow-md transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between">
                                            <div class="absolute -right-2 -bottom-2 opacity-5 scale-150 -rotate-12 transition-transform group-hover:rotate-0">
                                                <el-icon class="text-6xl"><DocumentChecked></DocumentChecked></el-icon>
                                            </div>
                                            <div class="flex items-center justify-between mb-3 relative z-10">
                                                <div class="text-sm font-bold text-gray-800 group-hover:text-[color:var(--app-color-primary)] transition-colors">駕駛證正本</div>
                                                <el-tag size="small" type="info" effect="plain" class="opacity-0 group-hover:opacity-100 transition-opacity !bg-white">查看</el-tag>
                                            </div>
                                            <div class="h-20 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 shadow-inner relative z-10">
                                                <el-icon class="text-3xl"><DocumentChecked></DocumentChecked></el-icon>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Confirmation Box -->
                                    <div class="mt-auto rounded-xl border p-4 flex items-center justify-between transition-all"
                                        :class="pickupData.isPersonMatched ? 'bg-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-7)] shadow-sm' : 'bg-gray-50/70 border-gray-200'">
                                        <div>
                                            <div class="text-sm font-bold transition-colors" :class="pickupData.isPersonMatched ? 'text-[color:var(--app-color-primary-hover)]' : 'text-gray-800'">確認人證合一</div>
                                            <div class="text-[11px] mt-0.5 transition-colors" :class="pickupData.isPersonMatched ? 'text-[color:var(--app-color-primary)]' : 'text-gray-500'">本人、身份證、駕駛證資料一致</div>
                                        </div>
                                        <el-checkbox v-model="pickupData.isPersonMatched" size="large" class="!mr-0"></el-checkbox>
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Marketing Qualification -->
                            <div class="col-span-7 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col h-full">
                                <div class="px-6 py-4 bg-slate-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between shrink-0">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center shadow-sm border border-blue-100">
                                            <el-icon class="text-sm"><Present></Present></el-icon>
                                        </div>
                                        <div>
                                            <h4 class="font-bold text-gray-900 text-sm">行銷方案資格</h4>
                                            <p class="text-[11px] text-gray-500 mt-0.5">現場確認當前優惠是否可繼續使用</p>
                                        </div>
                                    </div>
                                    <div class="text-right flex items-center gap-4 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">訂單總額</div>
                                        <div class="font-mono font-bold text-lg text-blue-600">¥{{ formatNumber(paymentData.orderTotal) }}</div>
                                    </div>
                                </div>

                                <div class="p-6 flex-1 flex flex-col overflow-y-auto custom-scroll">
                                    <!-- Plan Summary -->
                                    <div class="bg-gradient-to-r from-blue-50/80 to-[color:var(--app-color-primary-light-9)] border border-blue-100/80 rounded-xl p-5 grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)_1px_180px] gap-4 mb-8 shadow-sm">
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-1.5 text-[11px] text-blue-500 font-bold uppercase tracking-wider mb-1.5">
                                                <el-icon><Discount></Discount></el-icon> 當前方案
                                            </div>
                                            <div class="text-sm font-bold text-gray-900 truncate">{{ currentPickupMarketingPlan.name }}</div>
                                        </div>
                                        <div class="w-px bg-blue-200/50"></div>
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">
                                                <el-icon><Warning></Warning></el-icon> 資格要求
                                            </div>
                                            <div class="text-sm font-medium text-gray-800 line-clamp-1">{{ currentPickupMarketingPlan.qualification }}</div>
                                        </div>
                                        <div class="w-px bg-blue-200/50"></div>
                                        <div class="min-w-0">
                                            <div class="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">
                                                版本
                                            </div>
                                            <div class="text-xs font-mono leading-4 text-gray-700 bg-white px-2 py-1 rounded border border-gray-100 break-all">{{ currentPickupMarketingPlan.version }}</div>
                                        </div>
                                    </div>

                                    <div v-if="requiresPickupQualification" class="flex-1 flex flex-col">
                                        <!-- Documents -->
                                        <div class="mb-8">
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                                                    證明文件附件 <span class="text-red-500">*</span>
                                                </div>
                                                <div class="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold">
                                                    已上傳 {{ uploadedQualificationCount }}/3
                                                </div>
                                            </div>
                                            <div class="text-[11px] text-gray-500 mb-4">{{ currentPickupMarketingPlan.requiredDocText }}</div>
                                            <div class="grid grid-cols-3 gap-4">
                                                <el-upload v-for="doc in pickupData.qualificationFiles" :key="doc.index"
                                                    class="block" action="#" accept="image/*,.pdf" :auto-upload="false"
                                                    :show-file-list="false" :on-change="() => markQualificationFileUploaded(doc)">
                                                    <div class="group h-[110px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                                                        :class="doc.uploaded ? 'border-blue-300 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:border-blue-400' : 'border-gray-200 bg-gray-50/50 text-gray-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 hover:shadow-sm'">
                                                        <el-icon class="text-[28px] mb-2 transition-transform group-hover:scale-110">
                                                            <component :is="doc.uploaded ? 'CircleCheckFilled' : 'UploadFilled'"></component>
                                                        </el-icon>
                                                        <div class="text-[13px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors">證明文件 {{ doc.index }}</div>
                                                        <div class="text-[10px] mt-1 text-gray-400 group-hover:text-blue-500 transition-colors">{{ doc.uploaded ? '點擊重新上傳' : '上傳照片或PDF' }}</div>
                                                    </div>
                                                </el-upload>
                                            </div>
                                        </div>

                                        <div class="h-px bg-gray-100 mb-6"></div>

                                        <!-- Verification Result -->
                                        <div class="mt-auto grid grid-cols-12 gap-6 items-start">
                                            <div :class="pickupData.promoQualificationStatus === 'failed' ? 'col-span-5' : 'col-span-12'">
                                                <div class="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                                                    最終覈驗結果 <span class="text-red-500">*</span>
                                                </div>
                                                <el-radio-group v-model="pickupData.promoQualificationStatus" class="w-full flex shadow-sm" @change="handleQualificationStatusChange">
                                                    <el-radio-button label="passed" class="flex-1 !flex-grow min-w-0 [&_.el-radio-button\_\_inner]:w-full [&_.el-radio-button\_\_inner]:font-bold [&_.el-radio-button\_\_inner]:text-[13px]">通過</el-radio-button>
                                                    <el-radio-button label="failed" class="flex-1 !flex-grow min-w-0 [&_.el-radio-button\_\_inner]:w-full [&_.el-radio-button\_\_inner]:font-bold [&_.el-radio-button\_\_inner]:text-[13px]">不通過</el-radio-button>
                                                </el-radio-group>
                                                <div v-if="pickupData.promoQualificationStatus === 'passed'"
                                                    class="mt-4 rounded-lg px-4 py-3 bg-green-50/60 border border-green-100 flex items-start gap-3 animate__animated animate__fadeIn">
                                                    <el-icon class="text-green-500 text-lg mt-0.5"><CircleCheck></CircleCheck></el-icon>
                                                    <div>
                                                        <div class="text-[13px] font-bold text-green-800">資格已確認有效</div>
                                                        <div class="text-[11px] text-green-600 mt-0.5 opacity-90">當前行銷方案繼續生效，可直接進入下一步支付流程。</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div v-if="pickupData.promoQualificationStatus === 'failed'" class="col-span-7 bg-slate-50 p-5 rounded-xl border border-gray-200 shadow-inner relative animate__animated animate__fadeIn">
                                                <div class="absolute left-0 top-7 -ml-[9px] w-4 h-4 bg-slate-50 border-t border-l border-gray-200 rotate-[-45deg]"></div>
                                                <div class="text-[13px] font-bold text-gray-800 mb-3 relative z-10 flex items-center gap-1.5">
                                                    <el-icon class="text-orange-500"><Warning></Warning></el-icon> 資格不符，需更換方案
                                                </div>
                                                <div class="space-y-4 relative z-10">
                                                    <el-input v-model="pickupData.promoQualificationReason" placeholder="請記錄不通過的原因（選填）"
                                                        size="default" class="text-sm shadow-sm [&_.el-input\_\_wrapper]:bg-white"></el-input>
                                                    <el-select v-model="pickupData.replacementPromoId" placeholder="請選擇要更換的新行銷方案"
                                                        class="w-full shadow-sm" size="large" @change="applyPickupMarketingPlanChange">
                                                        <el-option v-for="plan in availablePickupReplacementPlans" :key="plan.id"
                                                            :label="plan.name" :value="plan.id">
                                                            <div class="flex items-center justify-between gap-3 w-full">
                                                                <span class="font-medium text-[13px]">{{ plan.name }}</span>
                                                                <span class="text-xs text-gray-400 font-mono pl-4">¥{{ formatNumber(plan.orderTotal) }}</span>
                                                            </div>
                                                        </el-option>
                                                    </el-select>
                                                    
                                                    <div v-if="selectedReplacementPickupPlan"
                                                        class="mt-1 rounded-lg border border-orange-200/60 bg-orange-50/50 p-4 flex items-center justify-between animate__animated animate__fadeIn">
                                                        <div>
                                                            <div class="text-[11px] text-orange-600 font-bold mb-1 opacity-80">方案更換後的訂單總額</div>
                                                            <div class="text-lg font-bold font-mono text-orange-700 bg-white px-2 py-0.5 rounded shadow-sm border border-orange-100 inline-block">¥{{ formatNumber(selectedReplacementPickupPlan.orderTotal) }}</div>
                                                        </div>
                                                        <div class="flex flex-col items-end">
                                                            <div class="text-[10px] text-gray-500 mb-1">差額產生</div>
                                                            <el-tag size="small" :type="qualificationPriceDelta >= 0 ? 'danger' : 'success'" effect="light" class="font-mono !border-none !font-bold">
                                                                {{ qualificationPriceDelta >= 0 ? '+' : '-' }} ¥{{ formatNumber(qualificationPriceDeltaAbs) }}
                                                            </el-tag>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else class="h-full flex items-center justify-center -mt-6">
                                        <div class="text-center bg-gray-50/50 border border-gray-100 rounded-xl p-8 max-w-sm mx-auto">
                                            <div class="w-14 h-14 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-green-500 mx-auto mb-4">
                                                <el-icon class="text-2xl"><Check></Check></el-icon>
                                            </div>
                                            <h4 class="text-[13px] font-bold text-gray-800 mb-2">本方案無需人工覈驗</h4>
                                            <p class="text-[11px] text-gray-500 leading-relaxed max-w-[240px] mx-auto">系統已自動適用優惠資格。取車時無需額外上傳證明材料，可直接點擊進入下一步。</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 1: Contract & Payment -->
                    <div v-if="pickupStep === 1" class="animate__animated animate__fadeIn">
                        <div class="flex gap-6 h-full">
                            <!-- Left: Fee Breakdown (Redesigned) -->
                            <div class="w-1/2 flex flex-col">
                                <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span 
                                        class="bg-gray-100 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                                    訂單費用明細
                                </h4>
                                <div 
                                    class="bg-gray-50 border border-gray-200 rounded-xl p-5 flex-1 flex flex-col overflow-y-auto">
                                    <!-- Charges Section -->
                                    <div class="space-y-1.5 mb-3">
                                        <div 
                                            class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <el-icon class="text-gray-400">
                                                <Wallet></Wallet>
                                            </el-icon> 費用項目
                                        </div>

                                        <!-- Rental Fee Row -->
                                        <div 
                                            class="bg-white rounded-lg border border-gray-100 px-3 py-2 flex justify-between items-center hover:shadow-sm transition-shadow">
                                            <div class="flex items-center gap-2">
                                                <el-icon class="text-gray-400 text-base">
                                                    <Van></Van>
                                                </el-icon>
                                                <span class="text-sm font-medium text-gray-800">車輛租金</span>
                                                <span class="text-xs text-gray-400">5天 × 日租金</span>
                                            </div>
                                            <span class="font-mono font-semibold text-gray-800 text-sm">{{
                                                formatNumber(paymentData.feeDetails.rental) }}</span>
                                        </div>

                                        <!-- Service Items -->
                                        <div v-for="(item, index) in paymentData.feeDetails.serviceItems"
                                            :key="'service-'+index"
                                            class="bg-white rounded-lg border border-gray-100 px-3 py-2 flex justify-between items-center hover:shadow-sm transition-shadow">
                                            <div class="flex items-center gap-2">
                                                <el-icon class="text-gray-400 text-base">
                                                    <component :is="item.icon"></component>
                                                </el-icon>
                                                <span class="text-sm font-medium text-gray-800">{{ item.name }}</span>
                                                <span class="text-xs text-gray-400">增值服務</span>
                                            </div>
                                            <span class="font-mono font-semibold text-gray-800 text-sm">¥ {{
                                                formatNumber(item.amount) }}</span>
                                        </div>
                                    </div>

                                    <!-- Discounts Section -->
                                    <div class="border-t border-dashed border-gray-200 pt-3 space-y-1.5 mb-3">
                                        <div 
                                            class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <el-icon class="text-gray-400">
                                                <Discount></Discount>
                                            </el-icon> 優惠減免 ({{ paymentData.feeDetails.discountItems.length }}項)
                                        </div>

                                        <!-- Loop through discount items -->
                                        <div v-for="(discount, index) in paymentData.feeDetails.discountItems"
                                            :key="'discount-'+index"
                                            class="bg-white rounded-lg border border-gray-100 px-3 py-2 flex justify-between items-center">
                                            <div class="flex items-center gap-2">
                                                <el-icon class="text-gray-400 text-base">
                                                    <Discount v-if="discount.type === 'promo'"></Discount>
                                                    <Ticket v-else-if="discount.type === 'coupon'"></Ticket>
                                                    <Star v-else></Star>
                                                </el-icon>
                                                <span class="text-sm text-gray-700 font-medium">{{ discount.name
                                                    }}</span>
                                                <span v-if="discount.code" class="text-xs text-gray-400">{{
                                                    discount.code }}</span>
                                            </div>
                                            <span class="font-mono font-semibold text-gray-700 text-sm">-¥ {{
                                                formatNumber(discount.amount) }}</span>
                                        </div>

                                        <div class="text-center text-xs text-gray-400 py-1.5"
                                            v-if="paymentData.feeDetails.discountItems.length === 0">
                                            暫無優惠減免
                                        </div>
                                    </div>


                                    <!-- Total -->
                                    <div 
                                        class="mt-auto bg-white border border-blue-100 rounded-xl p-4">
                                        <div class="flex justify-between items-center">
                                            <div>
                                                <div class="text-xs text-gray-500 uppercase tracking-wider">訂單應付總額
                                                </div>
                                                <div class="text-2xl font-bold font-mono mt-1 text-blue-600">¥ {{
                                                    formatNumber(paymentData.orderTotal) }}</div>
                                            </div>
                                            <div 
                                                class="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                                <el-icon class="text-2xl">
                                                    <Money></Money>
                                                </el-icon>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Payment Operations (Redesigned) -->
                            <div class="w-1/2 flex flex-col">
                                <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span 
                                        class="bg-gray-100 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                                    {{ isMonthlyBilling ? '企業月結' : '支付與預授權' }}
                                </h4>
                                <div 
                                    class="bg-white border border-gray-200 rounded-xl p-4 flex-1 flex flex-col overflow-y-auto">
                                    <!-- Pre-Authorization Section -->
                                    <div v-if="!isMonthlyBilling"
                                        class="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
                                        <div class="flex justify-between items-start mb-3">
                                            <div class="flex items-center gap-2">
                                                <div 
                                                    class="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                                                    <el-icon class="text-blue-500 text-lg">
                                                        <CreditCard></CreditCard>
                                                    </el-icon>
                                                </div>
                                                <div>
                                                    <div class="text-sm font-bold text-gray-800">預授權押金</div>
                                                    <div class="text-xs text-gray-400">本期按規則配置凍結</div>
                                                </div>
                                            </div>
                                            <el-tag type="info" size="small" effect="plain">{{
                                                preAuthStatusText }}
                                                ¥{{
                                                formatNumber(paymentData.preAuthAmount) }}</el-tag>
                                        </div>

                                        <div class="mb-3">
                                            <div class="text-xs text-gray-500 mb-2 font-medium">處理方式</div>
                                            <div class="grid grid-cols-2 gap-2">
                                                <div class="p-3 rounded-lg border-2 bg-white shadow-sm text-center cursor-pointer transition-all"
                                                    :class="paymentData.preAuthMode === 'guarantee' ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-blue-200'"
                                                    @click="selectPreAuthMode('guarantee')">
                                                    <div class="text-sm font-medium"
                                                        :class="paymentData.preAuthMode === 'guarantee' ? 'text-blue-600' : 'text-gray-700'">
                                                        履約擔保</div>
                                                    <div class="text-xs text-gray-400 mt-0.5">僅凍結，發車後釋放</div>
                                                </div>
                                                <div class="p-3 rounded-lg border-2 bg-white shadow-sm text-center cursor-pointer transition-all"
                                                    :class="paymentData.preAuthMode === 'rent_offset' ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-blue-200'"
                                                    @click="selectPreAuthMode('rent_offset')">
                                                    <div class="text-sm font-medium"
                                                        :class="paymentData.preAuthMode === 'rent_offset' ? 'text-blue-600' : 'text-gray-700'">
                                                        轉租金</div>
                                                    <div class="text-xs text-gray-400 mt-0.5">扣款抵扣本單租金</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="text-xs text-gray-500 bg-white/70 p-2.5 rounded-lg border border-gray-100"
                                            v-if="paymentData.preAuthMode === 'guarantee'">
                                            <el-icon class="text-gray-400 mr-1">
                                                <InfoFilled></InfoFilled>
                                            </el-icon>
                                            預授權用於履約擔保，取車時不抵扣租金；尾款結清並確認發車後釋放。
                                        </div>
                                        <div class="text-xs text-gray-500 bg-white/70 p-2.5 rounded-lg border border-gray-100"
                                            v-else>
                                            <el-icon class="text-gray-400 mr-1">
                                                <InfoFilled></InfoFilled>
                                            </el-icon>
                                            預授權扣款轉爲租金實收，本步驟按扣款金額抵扣應收尾款。
                                        </div>
                                    </div>

                                    <div v-else
                                        class="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
                                        <div class="flex justify-between items-start mb-3">
                                            <div class="flex items-center gap-2">
                                                <div 
                                                    class="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                                                    <el-icon class="text-blue-500 text-lg">
                                                        <OfficeBuilding></OfficeBuilding>
                                                    </el-icon>
                                                </div>
                                                <div>
                                                    <div class="text-sm font-bold text-gray-800">企業月結</div>
                                                    <div class="text-xs text-gray-400">{{ paymentData.monthlyCompany }}</div>
                                                </div>
                                            </div>
                                            <el-tag type="info" effect="plain" size="small">
                                                月結訂單
                                            </el-tag>
                                        </div>
                                        <div class="text-xs text-gray-600 bg-white/70 p-2.5 rounded-lg border border-gray-100">
                                            本單不發起支付和預授權，取車不向客戶收尾款，最終應收在還車結算後進入企業月結賬單。
                                        </div>
                                    </div>

                                    <!-- Balance Due -->
                                    <div class="rounded-xl p-4 mb-4 transition-all"
                                        :class="balanceDue > 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-200'">
                                        <div class="flex justify-between items-center">
                                            <div>
                                                <div class="text-xs uppercase tracking-wider"
                                                    :class="balanceDue > 0 ? 'text-blue-600' : 'text-gray-500'">
                                                    {{ isMonthlyBilling ? '月結記賬金額' : '應收尾款' }}
                                                </div>
                                                <div class="text-2xl font-bold font-mono mt-1"
                                                    :class="balanceDue > 0 ? 'text-blue-600' : 'text-gray-700'">
                                                    ¥ {{ formatNumber(isMonthlyBilling ? paymentData.monthlyBillAmount : balanceDue) }}
                                                </div>
                                            </div>
                                            <div class="w-10 h-10 rounded-full flex items-center justify-center"
                                                :class="balanceDue > 0 ? 'bg-white text-blue-500' : 'bg-white text-gray-400'">
                                                <el-icon class="text-lg"
                                                    :class="balanceDue > 0 ? 'text-blue-500' : 'text-gray-400'">
                                                    <component :is="balanceDue > 0 ? 'Warning' : 'CircleCheck'">
                                                    </component>
                                                </el-icon>
                                            </div>
                                        </div>
                                        <div class="text-xs mt-2"
                                            :class="balanceDue > 0 ? 'text-blue-600' : 'text-gray-500'">
                                            {{ isMonthlyBilling ? '本次不向客戶收取尾款，最終費用在還車結算後進入企業賬單' : (balanceDue > 0 ? '需結清尾款後才能進入下一步' : '尾款已結清，可進入下一步') }}
                                        </div>
                                    </div>

                                    <!-- Received Payments List -->
                                    <div class="mb-4" v-if="paymentData.receivedPayments.length > 0">
                                        <div class="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                                            <el-icon>
                                                <List></List>
                                            </el-icon> {{ isMonthlyBilling ? '預計月結' : '已收款記錄' }}
                                        </div>
                                        <div class="space-y-2 max-h-24 overflow-y-auto">
                                            <div v-for="(p, idx) in paymentData.receivedPayments" :key="idx"
                                                class="bg-gray-50 rounded-lg border border-gray-100 px-3 py-2.5 flex justify-between items-center text-sm">
                                                <div class="flex items-center gap-2">
                                                    <el-icon 
                                                        :class="p.type === 'pre_auth' ? 'text-blue-500' : 'text-gray-400'">
                                                        <component :is="p.type === 'pre_auth' ? 'Lock' : (p.type === 'monthly_bill' ? 'OfficeBuilding' : 'CircleCheck')">
                                                        </component>
                                                    </el-icon>
                                                    <span class="font-medium text-gray-800">¥ {{
                                                        formatNumber(p.amount) }}</span>
                                                    <el-tag size="small"
                                                        type="info"
                                                        effect="plain">{{ p.channel }}</el-tag>
                                                </div>
                                                <span class="text-xs text-gray-400 font-mono">{{ p.refNo || '-'
                                                    }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Add Payment Button (Opens Dialog) -->
                                    <div v-if="!isMonthlyBilling" class="pt-3 border-t border-gray-100">
                                        <el-button type="primary" size="large" class="w-full" @click="openPaymentDialog"
                                            :disabled="balanceDue <= 0">
                                            <el-icon class="mr-2">
                                                <Plus></Plus>
                                            </el-icon>
                                            補收尾款
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Inspection -->
                    <!-- Step 2: Contract & Inspection (Optimized Layout) -->
                    <div v-if="pickupStep === 2" class="animate__animated animate__fadeIn">
                        <div class="flex flex-col">
                            <!-- Section: Contract Signing (visually at bottom via order) -->
                            <div class="mb-5 order-2">
                                <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span 
                                        class="bg-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                                    租賃合約簽署
                                </h4>
                                <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <div class="flex gap-6 items-stretch">
                                        <!-- Signature Area -->
                                        <div class="flex-1 flex flex-col">
                                            <!-- Signature Display -->
                                            <div class="flex-1 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border-2 border-dashed flex items-center justify-center text-sm relative min-h-[100px] transition-all"
                                                :class="pickupData.signed ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-gray-300 text-gray-400'">

                                                <!-- Not Signed State -->
                                                <div v-if="!pickupData.signed && signatureStatus === 'idle'"
                                                    class="text-center">
                                                    <el-icon class="text-3xl text-gray-300 mb-2">
                                                        <EditPen></EditPen>
                                                    </el-icon>
                                                    <div class="text-gray-400">等待客戶簽名</div>
                                                </div>

                                                <!-- Pushed to APP State -->
                                                <div v-else-if="!pickupData.signed && signatureStatus === 'pushed'"
                                                    class="text-center">
                                                    <el-icon class="text-3xl text-blue-400 mb-2 animate-pulse">
                                                        <Iphone></Iphone>
                                                    </el-icon>
                                                    <div class="text-blue-500 font-medium">已推送至客戶APP</div>
                                                    <div class="text-xs text-gray-400 mt-1">等待客戶完成簽名...</div>
                                                </div>

                                                <!-- Fetching Signature State -->
                                                <div v-else-if="!pickupData.signed && signatureStatus === 'fetching'"
                                                    class="text-center">
                                                    <el-icon class="text-3xl text-[color:var(--app-color-primary)] mb-2 animate-spin">
                                                        <Loading></Loading>
                                                    </el-icon>
                                                    <div class="text-[color:var(--app-color-primary)]">正在獲取簽名...</div>
                                                </div>

                                                <!-- Signed State -->
                                                <div v-else class="text-center">
                                                    <span 
                                                        class="text-[color:var(--app-color-primary)] font-script text-4xl rotate-[-5deg] block">{{ pickupData.driverName }}</span>
                                                    <div 
                                                        class="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                                                        <el-icon>
                                                            <CircleCheckFilled></CircleCheckFilled>
                                                        </el-icon>
                                                        {{ signatureSource === 'app' ? 'APP遠程簽名' : '現場簽名' }} · {{
                                                        signatureTime }}
                                                    </div>
                                                </div>

                                                <!-- Signature Source Badge -->
                                                <div v-if="pickupData.signed" class="absolute top-2 right-2">
                                                    <el-tag :type="signatureSource === 'app' ? 'primary' : 'success'"
                                                        size="small" effect="dark">
                                                        {{ signatureSource === 'app' ? 'APP簽名' : '現場簽名' }}
                                                    </el-tag>
                                                </div>
                                            </div>

                                            <!-- Signature Actions -->
                                            <div class="flex gap-2 mt-3" v-if="!pickupData.signed">
                                                <!-- Push to APP Button -->
                                                <el-button type="primary" class="flex-1" @click="pushSignatureToApp"
                                                    :loading="signatureStatus === 'pushing'"
                                                    :disabled="signatureStatus === 'pushed' || signatureStatus === 'fetching'">
                                                    <el-icon class="mr-1">
                                                        <Promotion></Promotion>
                                                    </el-icon>
                                                    {{ signatureStatus === 'pushing' ? '推送中...' : '推送至APP簽名' }}
                                                </el-button>

                                                <!-- Refresh Button -->
                                                <el-button type="success" @click="fetchAppSignature"
                                                    :loading="signatureStatus === 'fetching'"
                                                    :disabled="signatureStatus !== 'pushed'">
                                                    <el-icon class="mr-1">
                                                        <Refresh></Refresh>
                                                    </el-icon>
                                                    刷新獲取
                                                </el-button>

                                                <!-- On-site Sign Button -->
                                                <el-button type="info" plain @click="signOnSite"
                                                    :disabled="signatureStatus === 'fetching'">
                                                    <el-icon class="mr-1">
                                                        <Edit></Edit>
                                                    </el-icon>
                                                    現場簽名
                                                </el-button>
                                            </div>

                                            <!-- Reset Button (when signed) -->
                                            <div class="mt-3 text-center" v-else>
                                                <el-button type="danger" link size="small" @click="resetSignature">
                                                    <el-icon class="mr-1">
                                                        <RefreshLeft></RefreshLeft>
                                                    </el-icon>
                                                    重新簽名
                                                </el-button>
                                            </div>
                                        </div>

                                        <!-- Contract Options -->
                                        <div class="w-72 flex flex-col gap-3">
                                            <!-- Terms Confirmation Status -->
                                            <div class="flex items-start gap-2 p-2 rounded-lg transition-colors"
                                                :class="pickupData.signed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'">
                                                <el-icon class="mt-0.5 text-lg">
                                                    <CircleCheckFilled v-if="pickupData.signed"></CircleCheckFilled>
                                                    <InfoFilled v-else></InfoFilled>
                                                </el-icon>
                                                <div class="flex-1">
                                                    <div class="text-sm font-medium leading-tight">
                                                        {{ pickupData.signed ? '客戶已同意' : '等待客戶確認' }}
                                                        <span 
                                                            class="underline cursor-pointer hover:text-[color:var(--app-color-primary)]">《租車服務條款》</span>
                                                    </div>
                                                    <div v-if="pickupData.signed" class="text-xs text-green-500 mt-1">
                                                        {{ signatureTime }} 確認
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- APP Push Status -->
                                            <div v-if="signatureStatus === 'pushed'"
                                                class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div 
                                                    class="text-xs text-blue-700 font-medium mb-1 flex items-center gap-1">
                                                    <el-icon class="animate-pulse">
                                                        <Bell></Bell>
                                                    </el-icon>
                                                    已推送簽名請求
                                                </div>
                                                <div class="text-xs text-blue-600">
                                                    客戶APP將收到簽名通知，簽名完成後點擊"刷新獲取"按鈕。
                                                </div>
                                            </div>

                                            <!-- Upload Offline Contract -->
                                            <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div class="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                    <el-icon>
                                                        <Upload></Upload>
                                                    </el-icon> 上傳線下紙質合約 (可選)
                                                </div>
                                                <el-upload class="w-full" action="#" :auto-upload="false"
                                                    accept=".jpg,.jpeg,.png,.pdf" :limit="3" :show-file-list="false">
                                                    <el-button size="small" type="primary" plain class="w-full">
                                                        <el-icon class="mr-1">
                                                            <UploadFilled></UploadFilled>
                                                        </el-icon> 選擇文件
                                                    </el-button>
                                                </el-upload>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section: Vehicle Inspection (visually at top via order) -->
                            <div class="order-1 mb-5">
                                <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span 
                                        class="bg-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                                    車輛查驗
                                </h4>
                                <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <!-- Basic Info Row -->
                                    <div class="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 p-4">
                                    <div class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <InfoFilled></InfoFilled>
                                            </el-icon>
                                            基礎交接信息
                                        </div>
                                        <div class="grid grid-cols-3 gap-5">
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1.5 font-medium">車輛所在據點</div>
                                                <div 
                                                    class="h-10 flex items-center px-3 rounded border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
                                                    {{ pickupVehicleStationText }}
                                                </div>
                                            </div>
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1.5 font-medium">交付位置</div>
                                                <el-input v-model="pickupData.deliveryLocation" placeholder="門市交付區 A1"
                                                    size="large"></el-input>
                                            </div>
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1.5 font-medium">實際取車時間</div>
                                                <el-date-picker v-model="pickupData.pickupTime" type="datetime"
                                                    placeholder="選擇時間" class="w-full" size="large"></el-date-picker>
                                            </div>
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1.5 font-medium flex items-center gap-2">
                                                    <span>當前里程 (km)</span>
                                                    <el-tag v-if="isSelfServiceOrder && hasPickupTelematics"
                                                        size="small" type="info" effect="plain">默認車機值</el-tag>
                                                </div>
                                                <el-input-number v-model="pickupData.mileage" :controls="false"
                                                    class="w-full" placeholder="輸入里程" size="large"></el-input-number>
                                            </div>
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1.5 font-medium flex items-center gap-2">
                                                    <span>燃油油量 ({{ pickupData.fuel }}/8格)</span>
                                                    <el-tag v-if="isSelfServiceOrder && hasPickupTelematics"
                                                        size="small" type="info" effect="plain">默認車機值</el-tag>
                                                </div>
                                                <div 
                                                    class="flex items-center gap-1 bg-white rounded rounded-[4px] border border-gray-200 px-2 h-10 w-full box-border">
                                                    <div class="flex-1 flex gap-1 h-full items-center justify-center">
                                                        <div v-for="i in 8" :key="'fuel'+i"
                                                            class="flex-1 h-6 rounded-sm cursor-pointer transition-all border"
                                                            :class="i <= pickupData.fuel ? 'bg-gradient-to-t from-green-500 to-green-400 border-green-600 shadow-sm' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'"
                                                            @click="pickupData.fuel = i">
                                                        </div>
                                                    </div>
                                                    <el-icon 
                                                        class="text-gray-400 ml-2 cursor-pointer hover:text-red-500"
                                                        @click="pickupData.fuel = 0" title="清空">
                                                        <Close></Close>
                                                    </el-icon>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1.5 font-medium">交車備註</div>
                                                <el-input v-model="pickupData.remarks" placeholder="如有異常請備註..."
                                                    size="large"></el-input>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Photo Evidence Section -->
                                    <div class="p-4">
                                        <div class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                                            <el-icon class="text-[color:var(--app-color-primary)]">
                                                <CameraFilled></CameraFilled>
                                            </el-icon>
                                            驗車影像記錄
                                        </div>

                                        <!-- Row 1: Exterior and Interior Photos -->
                                        <div class="flex gap-4 mb-5">
                                            <!-- Exterior Photos (Flex 2) -->
                                            <div class="flex-[2] min-w-0">
                                                <div 
                                                    class="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2">
                                                    <span 
                                                        class="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">外</span>
                                                    外觀照片 (6張)
                                                </div>
                                                <div class="grid grid-cols-6 gap-2">
                                                    <div v-for="(label, i) in ['前方', '後方', '左側', '右側', '左前角', '右前角']"
                                                        :key="'ext'+i"
                                                        class="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[color:var(--app-color-primary-light-5)] hover:text-[color:var(--app-color-primary)] hover:bg-[color:var(--app-color-primary-light-9)] transition-all group">
                                                        <el-icon 
                                                            class="text-xl mb-1 group-hover:scale-110 transition-transform">
                                                            <Plus></Plus>
                                                        </el-icon>
                                                        <span class="text-[10px] font-medium">{{ label }}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Interior Photos (Flex 1) -->
                                            <div class="flex-1 min-w-0">
                                                <div 
                                                    class="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2">
                                                    <span 
                                                        class="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">內</span>
                                                    內飾照片 (3張)
                                                </div>
                                                <div class="grid grid-cols-3 gap-2">
                                                    <div v-for="(label, i) in ['儀表', '座椅', '後排']" :key="'int'+i"
                                                        class="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500 hover:bg-green-50 transition-all group">
                                                        <el-icon 
                                                            class="text-xl mb-1 group-hover:scale-110 transition-transform">
                                                            <Plus></Plus>
                                                        </el-icon>
                                                        <span class="text-[10px] font-medium">{{ label }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Row 2: Damage/Exception Section (Full Width) -->
                                        <div class="border-t border-gray-100 pt-4">
                                            <div class="flex items-center justify-between mb-3">
                                                <div class="text-xs font-bold text-gray-500 flex items-center gap-2">
                                                    <span 
                                                        class="w-5 h-5 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs">損</span>
                                                    異常/損傷記錄 ({{ damagePhotos.length }})
                                                </div>
                                                <el-button type="warning" size="small"
                                                    @click="showDamageTypeDialog = true">
                                                    <el-icon class="mr-1">
                                                        <CirclePlus></CirclePlus>
                                                    </el-icon>添加異常
                                                </el-button>
                                            </div>

                                            <!-- No Damage State -->
                                            <div v-if="damagePhotos.length === 0"
                                                class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 flex items-center gap-4">
                                                <el-icon class="text-3xl text-green-500">
                                                    <CircleCheck></CircleCheck>
                                                </el-icon>
                                                <div>
                                                    <div class="font-medium text-green-700">車況良好</div>
                                                    <div class="text-xs text-green-500">交接檢查未發現異常或損傷</div>
                                                </div>
                                            </div>

                                            <!-- Has Damage State - Grid Layout -->
                                            <div v-else class="grid grid-cols-2 gap-4">
                                                <div v-for="damage in damagePhotos" :key="damage.id"
                                                    class="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                                    <div class="flex justify-between items-start mb-3">
                                                        <div class="flex items-center gap-2">
                                                            <el-tag 
                                                                :type="damage.category === 'exterior' ? 'warning' : 'info'"
                                                                size="small">
                                                                {{ damage.category === 'exterior' ? '外觀損傷' :
                                                                damage.category
                                                                === 'interior' ? '內飾異常' : '其他異常' }}
                                                            </el-tag>
                                                            <span class="text-sm text-orange-700 font-medium">{{
                                                                damage.type
                                                                }}</span>
                                                        </div>
                                                        <el-icon class="text-gray-400 cursor-pointer hover:text-red-500"
                                                            @click="removeDamagePhoto(damage.id)">
                                                            <Close></Close>
                                                        </el-icon>
                                                    </div>
                                                    <!-- Photo Upload Row -->
                                                    <div class="flex gap-2 mb-3">
                                                        <div v-for="n in 3" :key="'photo'+n"
                                                            class="w-16 h-16 bg-white rounded-lg border-2 border-dashed border-orange-200 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors">
                                                            <el-icon class="text-orange-300 text-xl">
                                                                <Plus></Plus>
                                                            </el-icon>
                                                        </div>
                                                    </div>
                                                    <!-- Description Input -->
                                                    <el-input v-model="damage.description" type="textarea" :rows="2"
                                                        placeholder="描述損傷情況..." size="small"></el-input>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> <!-- Closes flex container -->
                    <!-- Step 3: Success -->
                    <div v-if="pickupStep === 3"
                        class="animate__animated animate__fadeIn h-full flex flex-col items-center justify-center text-center">
                        <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <el-icon class="text-5xl text-green-500">
                                <CircleCheckFilled></CircleCheckFilled>
                            </el-icon>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-800 mb-2">發車成功</h2>
                        <p class="text-gray-500 mb-8">車輛已成功交付，訂單狀態已更新爲“用車中”。</p>

                        <div class="bg-gray-50 rounded-xl p-6 w-80 border border-gray-100 mb-8">
                            <div class="space-y-4">
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">發車時間</span>
                                    <span class="font-mono font-bold text-gray-800">{{ new Date().toLocaleString()
                                        }}</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">車輛信息</span>
                                    <span class="font-bold text-gray-800">Toyota Camry (ABC-1234)</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">車輛所在據點</span>
                                    <span class="font-bold text-gray-800">{{ pickupVehicleStationText }}</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">交付位置</span>
                                    <span class="font-bold text-gray-800">{{ pickupData.deliveryLocation || '-' }}</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">經辦人員</span>
                                    <span 
                                        class="font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">Admin</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <el-button size="large" @click="pickupModalVisible = false">返回訂單詳情</el-button>
                            <el-button type="primary" size="large" @click="pickupModalVisible = false">
                                <el-icon class="mr-2">
                                    <Printer></Printer>
                                </el-icon>
                                打印交車單
                            </el-button>
                        </div>
                    </div>
                </div> <!-- Closes Content -->
            </div> <!-- Closes Root -->

            <template #footer>
                <div class="flex justify-between items-center">
                    <div class="flex gap-2">
                        <el-button @click="requestClosePickupModal" :disabled="pickupStep === 3">暫停辦理</el-button>
                        <el-button v-if="orderStatus === 'inspecting' && pickupStep < 3" type="danger" plain
                            @click="openRejectOrderModal">拒絕履約</el-button>
                    </div>
                    <div>
                        <el-button v-if="pickupStep > 0 && pickupStep < 3" @click="pickupStep--">上一步</el-button>
                        <el-button type="primary" @click="nextPickupStep" :loading="processing">
                            {{ pickupStep === 3 ? '關閉' : (pickupStep === 2 ? '確認發車' : '下一步') }}
                        </el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="returnModalVisible" title="車輛還車結算" width="1000px" destroy-on-close top="5vh" class="rounded-xl overflow-hidden custom-modal order-detail-overlay" :before-close="handleReturnDialogClose">
            <div class="h-[85vh] flex flex-col">
                <!-- Wizard Header -->
                <div class="px-10 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div class="flex items-center gap-3 relative z-10"
                        :class="{'opacity-100': returnStep >= 0, 'opacity-50': returnStep < 0}">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4"
                            :class="returnStep >= 0 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent'">
                            1</div>
                        <div class="flex flex-col"><span 
                                class="text-xs font-bold uppercase tracking-wider text-gray-500">Step 01</span><span 
                                class="text-sm font-bold text-gray-800">驗車錄入</span></div>
                    </div>
                    <div class="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden">
                        <div class="h-full bg-[color:var(--app-color-primary)] transition-all duration-500"
                            :style="{width: returnStep >= 1 ? '100%' : '0%'}"></div>
                    </div>
                    <div class="flex items-center gap-3 relative z-10"
                        :class="{'opacity-100': returnStep >= 1, 'opacity-50': returnStep < 1}">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4"
                            :class="returnStep >= 1 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent'">
                            2</div>
                        <div class="flex flex-col"><span 
                                class="text-xs font-bold uppercase tracking-wider text-gray-500">Step 02</span><span 
                                class="text-sm font-bold text-gray-800">費用結算</span></div>
                    </div>
                    <div class="flex-1 h-0.5 bg-gray-100 mx-6 rounded-full overflow-hidden">
                        <div class="h-full bg-[color:var(--app-color-primary)] transition-all duration-500"
                            :style="{width: returnStep >= 2 ? '100%' : '0%'}"></div>
                    </div>
                    <div class="flex items-center gap-3 relative z-10"
                        :class="{'opacity-100': returnStep >= 2, 'opacity-50': returnStep < 2}">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4"
                            :class="returnStep >= 2 ? 'bg-[color:var(--app-color-primary)] text-white ring-[color:var(--app-color-primary-light-9)]' : 'bg-gray-100 text-gray-400 ring-transparent'">
                            3</div>
                        <div class="flex flex-col"><span 
                                class="text-xs font-bold uppercase tracking-wider text-gray-500">Step 03</span><span 
                                class="text-sm font-bold text-gray-800">還車完成</span></div>
                    </div>
                </div>

                <div v-if="returnStep < 2"
                    class="px-6 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-600">
                    <div class="flex items-center gap-2 min-w-0">
                        <el-icon class="text-base shrink-0">
                            <InfoFilled></InfoFilled>
                        </el-icon>
                        <span class="font-bold shrink-0">{{ returnStep === 0 ? '還車辦理中' : '費用結算中' }}</span>
                        <span class="truncate">
                            {{ returnStep === 0 ? '錄入驗車、歸還據點和客戶簽字後進入費用結算。' : (isMonthlyBilling ? '確認企業月結金額後完成還車。' : '完成補繳或退款確認後完成還車。') }}
                        </span>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-6">
                    <!-- Step 1: Inspection (Optimized Layout) -->
                    <div v-if="returnStep === 0" class="animate-fade-in-up space-y-5">
                        <!-- Top Row: Core Data (2 columns) -->
                        <div class="grid grid-cols-2 gap-5">
                            <!-- Left Column: Time & Location -->
                            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                    <span class="w-7 h-7 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center">
                                        <el-icon class="text-[color:var(--app-color-primary)]">
                                            <Timer></Timer>
                                        </el-icon>
                                    </span>
                                    還車時間與地點
                                </h3>
                                <div class="space-y-4">
                                    <div>
                                        <div class="text-xs font-medium text-gray-500 mb-1.5">實際還車時間</div>
                                        <el-date-picker v-model="returnData.returnTime" type="datetime"
                                            placeholder="選擇時間" class="w-full" size="default"></el-date-picker>
                                    </div>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <div class="text-xs font-medium text-gray-500 mb-1.5">還車門市</div>
                                            <div 
                                                class="min-h-[32px] flex items-center justify-between gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">
                                                <span class="font-medium text-gray-700">{{ currentReturnStoreName }}</span>
                                                <div class="flex items-center gap-2">
                                                    <el-button v-if="canChangeReturnStore && !isSelfServiceOrder" type="primary" link size="small"
                                                        @click="openReturnStoreChangeDialog">轉單</el-button>
                                                    <el-button v-if="canChangeReturnStation && isSelfServiceOrder" type="primary" link size="small"
                                                        @click="openReturnStationChangeDialog">改據點</el-button>
                                                </div>
                                            </div>
                                            <div class="text-[11px] text-gray-400 mt-1">還車門市由訂單當前還車門市帶出，不能在還車窗口直接修改。</div>
                                        </div>
                                        <div>
                                            <div class="text-xs font-medium text-gray-500 mb-1.5">歸還據點</div>
                                            <el-select v-model="returnData.parking.station" class="w-full" size="default">
                                                <el-option v-for="station in returnStations" :key="station.id"
                                                    :label="station.name" :value="station.id"></el-option>
                                            </el-select>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <div class="text-xs font-medium text-gray-500 mb-1.5">停車樓層</div>
                                            <el-input v-model="returnData.parking.floor" placeholder="B3"
                                                size="default"></el-input>
                                        </div>
                                        <div>
                                            <div class="text-xs font-medium text-gray-500 mb-1.5">車位號</div>
                                            <el-input v-model="returnData.parking.spot" placeholder="302"
                                                size="default"></el-input>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="text-xs font-medium text-gray-500 mb-1.5">停車位照片</div>
                                        <el-upload class="w-full" action="#" :auto-upload="false" :limit="1"
                                            :show-file-list="false">
                                            <el-button class="w-full" size="default" icon="Camera">拍攝/上傳車位照</el-button>
                                        </el-upload>
                                    </div>
                                </div>

                            </div>

                            <!-- Right Column: Mileage & Fuel -->
                            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                    <span class="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                                        <el-icon class="text-green-500">
                                            <Odometer></Odometer>
                                        </el-icon>
                                    </span>
                                    里程與油量
                                </h3>
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex items-center justify-between mb-1.5">
                                            <div class="flex items-center gap-2">
                                                <span class="text-xs font-medium text-gray-500">還車里程</span>
                                                <el-tag v-if="isSelfServiceOrder && hasReturnTelematics"
                                                    size="small" type="info" effect="plain">默認車機值</el-tag>
                                            </div>
                                            <span class="text-xs text-gray-400">限額: 13,500 km</span>
                                        </div>
                                        <el-input-number v-model="returnData.mileage" :min="0" :step="100"
                                            class="w-full" size="default" :controls="false">
                                            <template #suffix><span class="text-gray-400 text-xs">km</span></template>
                                        </el-input-number>
                                    </div>
                                    <div>
                                        <div class="flex items-center justify-between mb-1.5">
                                            <div class="flex items-center gap-2">
                                                <span class="text-xs font-medium text-gray-500">還車油量</span>
                                                <el-tag v-if="isSelfServiceOrder && hasReturnTelematics"
                                                    size="small" type="info" effect="plain">默認車機值</el-tag>
                                            </div>
                                            <span class="text-xs font-mono"
                                                :class="returnData.fuel >= 6 ? 'text-green-500' : returnData.fuel >= 3 ? 'text-orange-500' : 'text-red-500'">{{
                                                returnData.fuel }}/8 格</span>
                                        </div>
                                        <div 
                                            class="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 p-2">
                                            <div class="flex-1 flex gap-1">
                                                <div v-for="i in 8" :key="'ret_fuel'+i"
                                                    class="flex-1 h-7 rounded cursor-pointer transition-all border"
                                                    :class="i <= returnData.fuel ? 'bg-gradient-to-t from-green-500 to-green-400 border-green-600 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-100'"
                                                    @click="returnData.fuel = i">
                                                </div>
                                            </div>
                                            <el-icon 
                                                class="text-gray-400 ml-2 cursor-pointer hover:text-red-500 text-lg"
                                                @click="returnData.fuel = 0" title="清空">
                                                <Close></Close>
                                            </el-icon>
                                        </div>
                                        <div class="text-xs text-gray-400 mt-1 flex justify-between px-1">
                                            <span>E</span><span>F</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="text-xs font-medium text-gray-500 mb-1.5">還車備註</div>
                                        <el-input v-model="returnData.remarks" type="textarea" :rows="2"
                                            placeholder="如有異常請備註..." size="default"></el-input>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Photos & Damage Card -->
                        <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <span class="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <el-icon class="text-blue-500">
                                        <CameraFilled></CameraFilled>
                                    </el-icon>
                                </span>
                                驗車影像記錄
                            </h3>

                            <div class="flex gap-4 mb-5">
                                <div class="flex-[2] min-w-0">
                                    <div class="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><span 
                                            class="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">外</span>外觀照片
                                        (6張)</div>
                                    <div class="grid grid-cols-6 gap-2">
                                        <div v-for="(label, i) in ['前方', '後方', '左側', '右側', '左前角', '右前角']"
                                            :key="'retext'+i"
                                            class="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[color:var(--app-color-primary-light-5)] hover:text-[color:var(--app-color-primary)] hover:bg-[color:var(--app-color-primary-light-9)] transition-all group">
                                            <el-icon class="text-xl mb-1 group-hover:scale-110 transition-transform">
                                                <Plus></Plus>
                                            </el-icon><span class="text-[10px] font-medium">{{label}}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><span 
                                            class="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">內</span>內飾照片
                                        (3張)</div>
                                    <div class="grid grid-cols-3 gap-2">
                                        <div v-for="(label, i) in ['儀表', '座椅', '後排']" :key="'retint'+i"
                                            class="aspect-square bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500 hover:bg-green-50 transition-all group">
                                            <el-icon class="text-xl mb-1 group-hover:scale-110 transition-transform">
                                                <Plus></Plus>
                                            </el-icon><span class="text-[10px] font-medium">{{label}}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Damage Section -->
                            <div class="border-t border-gray-100 pt-4">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="text-xs font-bold text-gray-500 flex items-center gap-2"><span 
                                            class="w-5 h-5 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs">損</span>異常/損傷記錄
                                        ({{ returnDamagePhotos.length }})</div>
                                    <el-button type="warning" size="small" @click="openDamageDialog('return')"><el-icon 
                                            class="mr-1">
                                            <CirclePlus></CirclePlus>
                                        </el-icon>添加異常</el-button>
                                </div>

                                <div v-if="returnDamagePhotos.length === 0"
                                    class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 flex items-center gap-4">
                                    <el-icon class="text-3xl text-green-500">
                                        <CircleCheck></CircleCheck>
                                    </el-icon>
                                    <div>
                                        <div class="font-medium text-green-700">車況良好</div>
                                        <div class="text-xs text-green-500">交接檢查未發現異常或損傷</div>
                                    </div>
                                </div>
                                <div v-else class="grid grid-cols-2 gap-4">
                                    <div v-for="damage in returnDamagePhotos" :key="damage.id"
                                        class="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                        <div class="flex justify-between items-start mb-3">
                                            <div class="flex items-center gap-2">
                                                <el-tag :type="damage.category === 'exterior' ? 'warning' : 'info'"
                                                    size="small">{{ damage.category === 'exterior' ? '外觀損傷' : '其他異常'
                                                    }}</el-tag>
                                                <span class="text-sm text-orange-700 font-medium">{{ damage.type
                                                    }}</span>
                                            </div>
                                            <el-icon class="text-gray-400 cursor-pointer hover:text-red-500"
                                                @click="removeDamagePhoto(damage.id, 'return')">
                                                <Close></Close>
                                            </el-icon>
                                        </div>
                                        <div class="flex gap-2 mb-3">
                                            <div v-for="n in 3" :key="'rp'+n"
                                                class="w-16 h-16 bg-white rounded-lg border-2 border-dashed border-orange-200 flex items-center justify-center text-orange-300">
                                                <Plus></Plus>
                                            </div>
                                        </div>
                                        <el-input v-model="damage.description" type="textarea" :rows="2"
                                            placeholder="描述損傷情況..." size="small"></el-input>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Signature Card -->
                        <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <span class="w-7 h-7 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center">
                                    <el-icon class="text-[color:var(--app-color-primary)]">
                                        <EditPen></EditPen>
                                    </el-icon>
                                </span>
                                客戶簽字確認
                            </h3>

                            <div v-if="returnSignatureStatus === 'initial'"
                                class="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                                <div>
                                    <div class="font-bold text-gray-800">發送簽名請求</div>
                                    <div class="text-xs text-gray-500">將推送簽名通知至客戶APP</div>
                                </div>
                                <el-button type="primary" plain @click="requestReturnSignature">立即推送 <el-icon 
                                        class="ml-1">
                                        <Position></Position>
                                    </el-icon></el-button>
                            </div>

                            <div v-else-if="returnSignatureStatus === 'pushed'"
                                class="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                                <div>
                                    <div class="text-sm text-blue-700 font-bold mb-1 flex items-center gap-1"><el-icon 
                                            class="animate-pulse">
                                            <Bell></Bell>
                                        </el-icon> 已推送簽名請求</div>
                                    <div class="text-xs text-blue-600">客戶APP正在簽署中...</div>
                                </div>
                                <el-button type="primary" size="small" :loading="processing"
                                    @click="confirmReturnSignature" icon="Refresh">刷新獲取</el-button>
                            </div>

                            <div v-else
                                class="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                                <div>
                                    <div class="text-sm text-green-700 font-bold mb-1 flex items-center gap-1"><el-icon>
                                            <CircleCheckFilled></CircleCheckFilled>
                                        </el-icon> 已完成簽署</div>
                                    <div class="text-xs text-green-600">簽署時間: {{ returnSignatureTime }}</div>
                                </div>
                                <div class="text-3xl font-cursive text-gray-800 rotate-[-5deg] opacaity-80 px-4">Wang
                                    Xiao
                                    Ming</div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Settlement -->
                    <!-- Step 2: Settlement -->
                    <!-- Step 2: Settlement -->
                    <div v-if="returnStep === 1" class="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                        <!-- Fee List -->
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div class="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h4 class="font-bold text-gray-800">費用明細</h4>
                                    <p class="text-xs text-gray-500 mt-0.5">
                                        {{ isMonthlyBilling ? '企業月結訂單按最終應收進入企業賬單' : '還車階段只處理租期結束後的差額費用' }}
                                    </p>
                                </div>
                                <el-button type="primary" plain size="small" icon="Plus"
                                    @click="openAddFeeDialog">添加費用</el-button>
                            </div>
                            <el-table :data="returnFees.items" style="width: 100%"
                                :header-cell-style="{background:'#f9fafb'}">
                                <el-table-column prop="name" label="費用項目" min-width="140">
                                    <template #default="scope">
                                        <div class="font-medium text-gray-900">{{ scope.row.name }}</div>
                                        <div class="text-xs text-gray-400">{{ scope.row.desc }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="amount" label="應收金額" align="right" width="120">
                                    <template #default="scope">
                                        <span class="font-mono"
                                            :class="scope.row.amount >= 0 ? 'text-gray-800' : 'text-green-600'">
                                            {{ scope.row.amount < 0 ? '-' : '' }}{{ formatNumber(scope.row.amount) }}
                                        </span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="已付/已免" align="right" width="120">
                                    <template #default="scope">
                                        <span class="font-mono text-gray-500">{{ formatNumber(scope.row.paid || 0)
                                            }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="待結金額" align="right" width="120">
                                    <template #default="scope">
                                        <span class="font-mono font-bold"
                                            :class="(scope.row.amount - (scope.row.paid || 0)) > 0 ? 'text-orange-500' : ((scope.row.amount - (scope.row.paid || 0)) < 0 ? 'text-green-600' : 'text-gray-400')">
                                            {{ (scope.row.amount - (scope.row.paid || 0)) < 0 ? '-' : '' }}{{ formatNumber(scope.row.amount - (scope.row.paid || 0)) }}
                                        </span>
                                    </template>
                                </el-table-column>
                                <el-table-column width="140" align="center" label="操作">
                                    <template #default="scope">
                                        <div class="flex items-center justify-center gap-2">
                                            <el-button v-if="scope.row.desc === '人工添加'" type="danger" link size="small"
                                                @click="removeExtraFee(scope.$index)">刪除</el-button>

                                            <el-tooltip content="申請費用減免" placement="top" :show-after="500">
                                                <el-button v-if="(scope.row.amount - (scope.row.paid || 0)) > 0" link
                                                    type="primary" size="small" icon="Discount"
                                                    @click="openWaiveDialog(scope.row)">
                                                    減免
                                                </el-button>
                                            </el-tooltip>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>

                            <!-- Fees Summary Bar -->
                            <div 
                                class="bg-[color:var(--app-color-primary-light-9)] px-4 py-3 flex justify-between items-center border-t border-[color:var(--app-color-primary-light-8)]">
                                <span class="text-xs text-[color:var(--app-color-primary)] font-medium">{{ isMonthlyBilling ? '企業本單應收' : '還車差額合計' }}</span>
                                <span class="font-bold font-mono text-[color:var(--app-color-primary-hover)] text-lg">
                                    {{ !isMonthlyBilling && returnFees.total < 0 ? '-¥' : '¥' }}
                                    {{ formatNumber(isMonthlyBilling ? monthlyReturnBillAmount : returnFees.total) }}
                                </span>
                            </div>
                        </div>

                        <!-- Settlement Records (Payments & Waivers) -->
                        <div v-if="returnSettlementRecords.length > 0"
                            class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div class="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <h4 class="font-bold text-gray-800 flex items-center gap-2">
                                    <el-icon class="text-[color:var(--app-color-primary)]">
                                        <Wallet></Wallet>
                                    </el-icon>
                                    結算記錄
                                </h4>
                                <span class="text-xs text-gray-500">{{ isMonthlyBilling ? '包含月結掛賬和減免記錄' : '包含支付、退款及減免記錄' }}</span>
                            </div>
                            <div class="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                <div v-for="(record, i) in returnSettlementRecords" :key="i"
                                    class="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors group">
                                    <!-- Left: Info -->
                                    <div class="flex items-center gap-3">
                                        <!-- Icon -->
                                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-lg border"
                                            :class="{
                                                'bg-green-50 text-green-600 border-green-100': ['payment', 'settlement'].includes(record.type),
                                                'bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] border-[color:var(--app-color-primary-light-8)]': record.type === 'monthly_bill',
                                                'bg-red-50 text-red-600 border-red-100': record.type === 'refund',
                                                'bg-blue-50 text-blue-600 border-blue-100': record.type === 'waiver'
                                            }">
                                            <el-icon>
                                                <component 
                                                    :is="record.type === 'monthly_bill' ? 'OfficeBuilding' : (record.type === 'waiver' ? 'Discount' : (record.type === 'refund' ? 'RefreshLeft' : 'Check'))" ></component>
                                            </el-icon>
                                        </div>

                                        <div>
                                            <div class="flex items-center gap-2">
                                                <span class="font-bold text-gray-800 text-sm">
                                                    {{ record.type === 'waiver' ? '費用減免' : record.channel }}
                                                </span>
                                                <el-tag v-if="record.type === 'waiver'" size="small" type="primary"
                                                    effect="light">已批准</el-tag>
                                                <el-tag v-if="record.type === 'monthly_bill'" size="small" color="var(--app-color-primary)"
                                                    effect="dark">已掛賬</el-tag>
                                            </div>
                                            <div class="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                                                <span>{{ record.time }}</span>
                                                <span v-if="record.refNo" class="font-mono bg-gray-100 px-1 rounded">#{{
                                                    record.refNo.slice(-6) }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Right: Amount & Reason -->
                                    <div class="text-right">
                                        <div class="font-bold font-mono text-base" :class="{
                                                'text-green-600': ['payment', 'settlement'].includes(record.type),
                                                'text-[color:var(--app-color-primary)]': record.type === 'monthly_bill',
                                                'text-red-500': record.type === 'refund',
                                                'text-blue-600': record.type === 'waiver'
                                            }">
                                            {{ record.type === 'refund' ? '-' : (record.type === 'waiver' ? '-' : '+')
                                            }}
                                            {{ formatNumber(Math.abs(record.amount)) }}
                                        </div>
                                        <div v-if="record.remark"
                                            class="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate"
                                            :title="record.remark">
                                            {{ record.remark }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Settlement Footer Action Bar -->
                        <div class="rounded-xl p-6 shadow-lg border transition-all relative overflow-hidden"
                            :class="isMonthlyBilling ? 'bg-gradient-to-br from-[color:var(--app-color-primary-light-9)] to-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-7)]' : (returnBalanceDue !== 0 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200')">

                            <!-- Background Decor -->
                            <el-icon class="absolute -right-4 -bottom-4 text-9xl opacity-10"
                                :class="isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : (returnBalanceDue !== 0 ? 'text-orange-500' : 'text-green-500')">
                                <Money></Money>
                            </el-icon>

                            <div class="flex justify-between items-center relative z-10">
                                <div>
                                    <div class="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"
                                        :class="isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : (returnBalanceDue !== 0 ? 'text-orange-600' : 'text-green-600')">
                                        <el-icon>
                                            <Wallet></Wallet>
                                        </el-icon>
                                        {{ isMonthlyBilling ? '企業掛賬金額' : '還車待結金額' }}
                                    </div>
                                    <div class="text-4xl font-bold font-mono heading-font tracking-tight"
                                        :class="isMonthlyBilling ? 'text-[color:var(--app-color-primary-hover)]' : (returnBalanceDue !== 0 ? 'text-red-600' : 'text-green-600')">
                                        <span v-if="isMonthlyBilling">¥ {{ formatNumber(monthlyReturnBillAmount) }}</span>
                                        <span v-else-if="returnBalanceDue > 0">¥ {{ formatNumber(Math.abs(returnBalanceDue))
                                            }}</span>
                                        <span v-else-if="returnBalanceDue < 0">退 ¥ {{
                                            formatNumber(Math.abs(returnBalanceDue)) }}</span>
                                        <span v-else>已結清</span>
                                    </div>
                                    <div class="text-xs mt-2 flex gap-4 font-medium opacity-80"
                                        :class="isMonthlyBilling ? 'text-[color:var(--app-color-primary-hover)]' : (returnBalanceDue !== 0 ? 'text-orange-800' : 'text-green-800')">
                                        <span>{{ isMonthlyBilling ? '企業應收總額' : '還車差額' }}: {{ !isMonthlyBilling && returnFees.total < 0 ? '-' : '' }}{{ formatNumber(isMonthlyBilling ? monthlyReturnBillAmount : returnFees.total) }}</span>
                                        <span class="w-px h-3 bg-current opacity-30"></span>
                                        <span v-if="isMonthlyBilling">賬單對象: {{ paymentData.monthlyCompany }}</span>
                                        <span v-else>已處理: {{ returnHandledAmount < 0 ? '-' : '' }}{{ formatNumber(returnHandledAmount) }}</span>
                                    </div>
                                </div>
                                <div class="flex gap-3">
                                    <template v-if="isMonthlyBilling">
                                        <div 
                                            class="flex items-center gap-2 text-[color:var(--app-color-primary-hover)] font-bold px-6 bg-[color:var(--app-color-primary-light-8)] rounded-lg py-2">
                                            <el-icon class="text-xl">
                                                <OfficeBuilding></OfficeBuilding>
                                            </el-icon>
                                            <span>確認月結後完成還車</span>
                                        </div>
                                    </template>
                                    <template v-else-if="returnBalanceDue === 0">
                                        <div 
                                            class="flex items-center gap-2 text-green-700 font-bold px-6 bg-green-100/50 rounded-lg py-2">
                                            <el-icon class="text-xl">
                                                <CircleCheckFilled></CircleCheckFilled>
                                            </el-icon>
                                            <span>賬單已平，請確認還車</span>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <el-button type="primary" size="large" icon="Wallet"
                                            class="shadow-xl transition-transform hover:-translate-y-0.5"
                                            :disabled="returnBalanceDue <= 0"
                                            @click="openReturnPaymentDialog('online')">
                                            立即收款
                                        </el-button>
                                        <el-button type="danger" size="large" icon="RefreshLeft"
                                            class="shadow-xl transition-transform hover:-translate-y-0.5"
                                            :disabled="returnBalanceDue >= 0"
                                            @click="openReturnRefundDialog">
                                            立即退款
                                        </el-button>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Waiver Dialog (New) -->
                    <el-dialog v-model="waiveDialogVisible" title="費用減免申請" width="450px" destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
                        <div class="space-y-4 p-2">
                            <div class="bg-blue-50 p-3 rounded-lg flex gap-3 border border-blue-100">
                                <el-icon class="text-blue-500 text-lg mt-0.5">
                                    <InfoFilled></InfoFilled>
                                </el-icon>
                                <div class="text-xs text-blue-700">
                                    <div class="font-bold mb-1">正在爲 [{{ waiveData.itemName }}] 申請減免</div>
                                    <div>減免金額將記錄爲“費用豁免”，並計入財務報表。</div>
                                </div>
                            </div>

                            <div>
                                <div class="text-sm text-gray-600 mb-1.5 is-required">減免金額</div>
                                <el-input-number v-model="waiveData.amount" :min="0" :max="waiveData.maxAmount"
                                    class="w-full" size="large" :precision="0"></el-input-number>
                                <div class="text-xs text-gray-400 mt-1 text-right">最多可減免: ¥{{ waiveData.maxAmount }}
                                </div>
                            </div>

                            <div>
                                <div class="text-sm text-gray-600 mb-1.5 is-required">減免原因 (必填)</div>
                                <el-select v-model="waiveData.reason" placeholder="選擇原因" class="w-full mb-2">
                                    <el-option label="客戶滿意度補償" value="客戶滿意度補償"></el-option>
                                    <el-option label="系統/操作失誤" value="系統/操作失誤"></el-option>
                                    <el-option label="協議優惠" value="協議優惠"></el-option>
                                    <el-option label="其他" value="其他"></el-option>
                                </el-select>
                                <el-input type="textarea" v-model="waiveData.remark" placeholder="詳細說明..."
                                    :rows="2"></el-input>
                            </div>
                        </div>
                        <template #footer>
                            <span class="dialog-footer">
                                <el-button @click="waiveDialogVisible = false">取消</el-button>
                                <el-button type="primary" @click="confirmWaive"
                                    :disabled="!waiveData.amount || !waiveData.reason">
                                    確認減免
                                </el-button>
                            </span>
                        </template>
                    </el-dialog>

                    <!-- Step 3: Success -->
                    <div v-if="returnStep === 2"
                        class="animate__animated animate__fadeIn h-full flex flex-col items-center justify-center text-center">
                        <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <el-icon class="text-5xl text-green-500">
                                <CircleCheckFilled></CircleCheckFilled>
                            </el-icon>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-800 mb-2">還車成功</h2>
                        <p class="text-gray-500 mb-8">車輛已成功返還，訂單狀態已更新爲“已完成”。</p>

                        <div class="bg-gray-50 rounded-xl p-6 w-80 border border-gray-100 mb-8">
                            <div class="space-y-4">
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">還車時間</span>
                                    <span class="font-mono font-bold text-gray-800">{{ new Date().toLocaleString()
                                        }}</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">車輛信息</span>
                                    <span class="font-bold text-gray-800">Toyota Camry (ABC-1234)</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">訂單當前還車門市</span>
                                    <span class="font-bold text-gray-800">{{ currentReturnStoreName }}</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">歸還據點</span>
                                    <span class="font-bold text-gray-800">{{ getReturnStationLabel(returnData.parking.station) }}</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">經辦人員</span>
                                    <span 
                                        class="font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">Admin</span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-500">結算狀態</span>
                                    <el-tag type="success" effect="plain" size="small">已結清</el-tag>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <el-button size="large" @click="returnModalVisible = false">返回訂單詳情</el-button>
                            <el-button type="primary" size="large" @click="returnModalVisible = false">
                                <el-icon class="mr-2">
                                    <Printer></Printer>
                                </el-icon>
                                打印還車單
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center">
                    <el-button @click="requestCloseReturnModal" :disabled="returnStep === 2">暫停辦理</el-button>
                    <div>
                        <el-button v-if="returnStep > 0 && returnStep < 2" @click="returnStep--">上一步</el-button>
                        <el-button type="primary" @click="nextReturnStep" :loading="processing">
                            {{ returnStep === 2 ? '關閉' : (returnStep === 1 ? (isMonthlyBilling ? '確認月結並還車' : '確認還車') : '下一步') }}
                        </el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="waiveDialogVisible" title="費用減免申請" width="450px" destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
                        <div class="space-y-4 p-2">
                            <div class="bg-blue-50 p-3 rounded-lg flex gap-3 border border-blue-100">
                                <el-icon class="text-blue-500 text-lg mt-0.5">
                                    <InfoFilled></InfoFilled>
                                </el-icon>
                                <div class="text-xs text-blue-700">
                                    <div class="font-bold mb-1">正在爲 [{{ waiveData.itemName }}] 申請減免</div>
                                    <div>減免金額將記錄爲“費用豁免”，並計入財務報表。</div>
                                </div>
                            </div>

                            <div>
                                <div class="text-sm text-gray-600 mb-1.5 is-required">減免金額</div>
                                <el-input-number v-model="waiveData.amount" :min="0" :max="waiveData.maxAmount"
                                    class="w-full" size="large" :precision="0"></el-input-number>
                                <div class="text-xs text-gray-400 mt-1 text-right">最多可減免: ¥{{ waiveData.maxAmount }}
                                </div>
                            </div>

                            <div>
                                <div class="text-sm text-gray-600 mb-1.5 is-required">減免原因 (必填)</div>
                                <el-select v-model="waiveData.reason" placeholder="選擇原因" class="w-full mb-2">
                                    <el-option label="客戶滿意度補償" value="客戶滿意度補償"></el-option>
                                    <el-option label="系統/操作失誤" value="系統/操作失誤"></el-option>
                                    <el-option label="協議優惠" value="協議優惠"></el-option>
                                    <el-option label="其他" value="其他"></el-option>
                                </el-select>
                                <el-input type="textarea" v-model="waiveData.remark" placeholder="詳細說明..."
                                    :rows="2"></el-input>
                            </div>
                        </div>
                        <template #footer>
                            <span class="dialog-footer">
                                <el-button @click="waiveDialogVisible = false">取消</el-button>
                                <el-button type="primary" @click="confirmWaive"
                                    :disabled="!waiveData.amount || !waiveData.reason">
                                    確認減免
                                </el-button>
                            </span>
                        </template>
                    </el-dialog>
<el-dialog v-model="returnRefundDialogVisible" title="確認原路退款" width="480px" append-to-body destroy-on-close class="rounded-xl order-detail-overlay" :close-on-click-modal="false">
            <div class="space-y-4">
                <div class="rounded-xl border border-red-100 bg-red-50 p-4 flex gap-3">
                    <div class="w-9 h-9 rounded-full bg-white text-red-500 flex items-center justify-center shrink-0">
                        <el-icon class="text-xl">
                            <RefreshLeft></RefreshLeft>
                        </el-icon>
                    </div>
                    <div>
                        <div class="font-bold text-red-700">本次將執行原路退款</div>
                        <div class="text-xs text-red-600 mt-1">退款成功後會寫入結算記錄，並抵消當前應退金額。</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div class="text-xs text-gray-400 mb-1">退款金額</div>
                        <div class="text-2xl font-bold text-red-600 font-mono">¥ {{ formatNumber(returnRefundAmount) }}</div>
                    </div>
                    <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div class="text-xs text-gray-400 mb-1">退款方式</div>
                        <div class="font-bold text-gray-800">原路退回</div>
                    </div>
                </div>

                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">確認原支付渠道</div>
                    <el-radio-group v-model="selectedReturnRefundChannel" class="w-full">
                        <div class="space-y-2 w-full">
                            <div v-for="channel in returnOriginalPaymentChannels" :key="channel.id"
                                class="flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors"
                                :class="selectedReturnRefundChannel === channel.id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'"
                                @click="selectedReturnRefundChannel = channel.id">
                                <div class="flex items-center gap-3">
                                    <el-radio :label="channel.id" size="large"></el-radio>
                                    <div>
                                        <div class="font-bold text-gray-800">{{ channel.channel }}</div>
                                        <div class="text-xs text-gray-400 font-mono">{{ channel.refNo || '無交易號' }} · {{
                                            channel.time || '-' }}</div>
                                    </div>
                                </div>
                                <div class="font-mono font-bold text-gray-700">¥ {{ formatNumber(channel.amount) }}</div>
                            </div>
                        </div>
                    </el-radio-group>
                    <div v-if="returnOriginalPaymentChannels.length === 0"
                        class="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                        暫無可用於原路退款的支付渠道
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="returnRefundDialogVisible = false" class="flex-1">取消</el-button>
                    <el-button type="danger" class="flex-1" @click="confirmReturnRefund"
                        :disabled="!selectedReturnRefundChannel || returnRefundAmount <= 0">
                        確認退款
                    </el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="showAddFeeDialog" title="添加額外費用" width="450px" append-to-body destroy-on-close class="rounded-xl order-detail-overlay">
            <div class="space-y-4">
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">費用類型</div>
                    <el-select v-model="returnFeeForm.type" class="w-full" placeholder="選擇費用類型">
                        <el-option v-for="type in manualFeeTypes" :key="type.value" :label="type.label"
                            :value="type.value"></el-option>
                    </el-select>
                </div>
                <div v-if="returnFeeForm.type === 'other'">
                    <div class="text-sm font-medium text-gray-700 mb-2">自定義名稱</div>
                    <el-input v-model="returnFeeForm.customName" placeholder="輸入費用名稱"></el-input>
                </div>
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">費用金額</div>
                    <el-input-number v-model="returnFeeForm.amount" :min="0" :precision="0"
                        class="w-full"></el-input-number>
                </div>
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">費用說明</div>
                    <el-input v-model="returnFeeForm.description" type="textarea" :rows="2"
                        placeholder="詳細說明..."></el-input>
                </div>
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">上傳憑證 (可選)</div>
                    <el-upload action="#" :auto-upload="false" :limit="3" list-type="picture-card"
                        :on-exceed="handleExceed">
                        <el-icon>
                            <Plus></Plus>
                        </el-icon>
                    </el-upload>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="showAddFeeDialog = false" class="flex-1">取消</el-button>
                    <el-button type="primary" @click="confirmAddFees" class="flex-1">
                        確認添加
                    </el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="paymentDialogVisible" :title="paymentDialogTitle" width="500px" destroy-on-close top="15vh" class="rounded-xl overflow-hidden order-detail-overlay" :close-on-click-modal="false">
            <div class="p-1">
                <!-- Payment Type Switch -->
                <div :class="newPayment.context === 'booking' ? 'grid grid-cols-1 bg-gray-100 rounded-lg p-1 mb-3' : 'grid grid-cols-2 bg-gray-100 rounded-lg p-1 mb-5'">
                    <div class="text-center py-2.5 text-sm font-medium rounded-md cursor-pointer transition-all"
                        :class="paymentDialogType === 'online' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                        @click="paymentDialogType = 'online'; newPayment.gateway = 'jiekou'">
                        <el-icon class="mr-1">
                            <Monitor></Monitor>
                        </el-icon> {{ newPayment.context === 'booking' ? '在線預授權' : '在線支付' }}
                    </div>
                    <div v-if="newPayment.context !== 'booking'" class="text-center py-2.5 text-sm font-medium rounded-md cursor-pointer transition-all"
                        :class="paymentDialogType === 'offline' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                        @click="paymentDialogType = 'offline'; newPayment.gateway = 'cash'">
                        <el-icon class="mr-1">
                            <Wallet></Wallet>
                        </el-icon> 線下收款
                    </div>
                </div>
                <div v-if="newPayment.context === 'booking'" class="mb-5 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 text-xs px-3 py-2">
                    本期下單預授權押金僅支持線上預授權，不支持現金押金、線下押金或僅登記線下憑證。
                </div>

                <!-- Online Payment Options -->
                <div v-if="paymentDialogType === 'online'" class="space-y-4">
                    <div class="text-sm font-medium text-gray-700 mb-2">選擇支付渠道</div>
                    <div class="grid grid-cols-2 gap-3">
                        <!-- 街口支付 -->
                        <div class="p-4 rounded-xl border-2 cursor-pointer transition-all relative"
                            :class="newPayment.gateway === 'jiekou' ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                            @click="newPayment.gateway = 'jiekou'">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <span class="text-orange-500 text-lg font-bold">街</span>
                                </div>
                                <div>
                                    <div class="font-medium text-gray-800">街口支付</div>
                                    <div class="text-xs text-gray-400">線上掃碼</div>
                                </div>
                            </div>
                            <div v-if="newPayment.gateway === 'jiekou'" class="absolute top-2 right-2">
                                <el-icon class="text-orange-500">
                                    <CircleCheck></CircleCheck>
                                </el-icon>
                            </div>
                        </div>

                        <!-- 信用卡支付 -->
                        <div class="p-4 rounded-xl border-2 cursor-pointer transition-all relative"
                            :class="newPayment.gateway === 'credit_card' ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)] shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                            @click="newPayment.gateway = 'credit_card'">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-[color:var(--app-color-primary-light-8)] rounded-lg flex items-center justify-center">
                                    <el-icon class="text-[color:var(--app-color-primary)] text-lg">
                                        <CreditCard></CreditCard>
                                    </el-icon>
                                </div>
                                <div>
                                    <div class="font-medium text-gray-800">信用卡</div>
                                    <div class="text-xs text-gray-400">用戶綁定卡</div>
                                </div>
                            </div>
                            <div v-if="newPayment.gateway === 'credit_card'" class="absolute top-2 right-2">
                                <el-icon class="text-[color:var(--app-color-primary)]">
                                    <CircleCheck></CircleCheck>
                                </el-icon>
                            </div>
                        </div>
                    </div>

                    <!-- Credit Card Selection -->
                    <div v-if="newPayment.gateway === 'credit_card'"
                        class="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div class="text-sm font-medium text-gray-700 mb-3">選擇信用卡</div>
                        <div class="space-y-2">
                            <div v-for="card in userCreditCards" :key="card.id"
                                class="p-3 bg-white rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center"
                                :class="selectedCreditCard === card.id ? 'border-[color:var(--app-color-primary)] shadow-sm' : 'border-gray-100 hover:border-gray-300'"
                                @click="selectedCreditCard = card.id">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded flex items-center justify-center"
                                        :class="card.brand === 'Visa' ? 'bg-blue-100' : 'bg-orange-100'">
                                        <span class="text-xs font-bold"
                                            :class="card.brand === 'Visa' ? 'text-blue-600' : 'text-orange-600'">
                                            {{ card.brand.substring(0, 2) }}
                                        </span>
                                    </div>
                                    <div>
                                        <div class="font-mono text-gray-800">**** **** **** {{ card.last4 }}</div>
                                        <div class="text-xs text-gray-400">有效期: {{ card.expiry }}</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <el-tag v-if="card.isDefault" size="small" type="success"
                                        effect="plain">默認卡</el-tag>
                                    <el-icon v-if="selectedCreditCard === card.id" class="text-[color:var(--app-color-primary)]">
                                        <CircleCheck></CircleCheck>
                                    </el-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Offline Payment Options -->
                <div v-else class="space-y-4">
                    <div class="text-sm font-medium text-gray-700 mb-2">選擇收款方式</div>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="p-4 rounded-xl border-2 cursor-pointer transition-all text-center"
                            :class="newPayment.gateway === 'cash' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                            @click="newPayment.gateway = 'cash'">
                            <el-icon class="text-2xl mb-2"
                                :class="newPayment.gateway === 'cash' ? 'text-green-500' : 'text-gray-400'">
                                <Money></Money>
                            </el-icon>
                            <div class="text-sm font-medium"
                                :class="newPayment.gateway === 'cash' ? 'text-green-700' : 'text-gray-600'">現金</div>
                        </div>
                        <div class="p-4 rounded-xl border-2 cursor-pointer transition-all text-center"
                            :class="newPayment.gateway === 'pos' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                            @click="newPayment.gateway = 'pos'">
                            <el-icon class="text-2xl mb-2"
                                :class="newPayment.gateway === 'pos' ? 'text-blue-500' : 'text-gray-400'">
                                <CreditCard></CreditCard>
                            </el-icon>
                            <div class="text-sm font-medium"
                                :class="newPayment.gateway === 'pos' ? 'text-blue-700' : 'text-gray-600'">POS刷卡
                            </div>
                        </div>
                        <div class="p-4 rounded-xl border-2 cursor-pointer transition-all text-center"
                            :class="newPayment.gateway === 'transfer' ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)] shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                            @click="newPayment.gateway = 'transfer'">
                            <el-icon class="text-2xl mb-2"
                                :class="newPayment.gateway === 'transfer' ? 'text-[color:var(--app-color-primary)]' : 'text-gray-400'">
                                <Promotion></Promotion>
                            </el-icon>
                            <div class="text-sm font-medium"
                                :class="newPayment.gateway === 'transfer' ? 'text-[color:var(--app-color-primary-hover)]' : 'text-gray-600'">轉賬
                            </div>
                        </div>
                    </div>

                    <!-- Ref No for offline -->
                    <div class="mt-4">
                        <div class="text-sm font-medium text-gray-700 mb-2">憑證單號 (可選)</div>
                        <el-input v-model="newPayment.refNo" placeholder="輸入收款憑證號..." size="large"></el-input>
                    </div>
                </div>

                <!-- Amount Input -->
                <div class="mt-6 p-4 bg-gradient-to-r from-[color:var(--app-color-primary-light-9)] to-[color:var(--app-color-primary-light-9)] rounded-xl border border-[color:var(--app-color-primary-light-8)]">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-sm font-medium text-gray-700">{{ paymentDialogAmountLabel }}</span>
                        <span class="text-xs text-gray-400">{{ paymentDialogAmountHint }}: ¥{{ formatNumber(paymentDialogDueAmount) }}</span>
                    </div>
                    <el-input-number v-model="newPayment.amount" :min="1" :max="paymentDialogDueAmount || 1" :controls="false"
                        class="w-full" size="large" :precision="0">
                        <template #prefix>
                            <span class="text-gray-400 font-mono">¥</span>
                        </template>
                    </el-input-number>
                </div>
            </div>

            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="paymentDialogVisible = false" class="flex-1" size="large">取消</el-button>
                    <el-button type="primary" @click="confirmPayment" :loading="newPayment.processing" class="flex-1"
                        size="large">
                        {{ paymentDialogSubmitText }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="redirectionModalVisible" title="訂單改派 & 車輛升級" width="850px" destroy-on-close top="5vh" class="rounded-xl overflow-hidden custom-modal order-detail-overlay">

            <div class="flex items-stretch gap-6 h-[580px] p-6">
                <!-- Left Side: Selection -->
                <div class="flex-1 flex flex-col h-full overflow-hidden">
                    <!-- Current Info -->
                    <div 
                        class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 flex justify-between items-center shrink-0">
                        <div class="flex items-center gap-3">
                            <div 
                                class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 border border-gray-100">
                                <el-icon>
                                    <Van></Van>
                                </el-icon>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500">當前指派</div>
                                <div class="font-bold text-gray-800 text-sm">Toyota Corolla Altis <span 
                                        class="font-normal text-gray-400">ABC-1234</span></div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-gray-500">日租金</div>
                            <div class="font-bold text-gray-800">1,920</div>
                        </div>
                    </div>

                    <!-- Custom Tabs (Grid) -->
                    <div class="grid grid-cols-2 bg-gray-100 rounded-lg p-1 mb-4 shrink-0">
                        <div class="text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-all"
                            :class="activeTab === 'manual' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                            @click="activeTab = 'manual'">
                            手動選擇
                        </div>
                        <div class="text-center py-2 text-sm font-medium rounded-md cursor-pointer transition-all"
                            :class="activeTab === 'auto' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                            @click="activeTab = 'auto'">
                            系統推薦 (智能)
                        </div>
                    </div>

                    <!-- Scrollable Content Area -->
                    <div class="flex-1 overflow-y-auto custom-scroll pr-2">
                        <!-- Manual Selection Tab -->
                        <div v-show="activeTab === 'manual'" class="space-y-5 pb-2">
                            <!-- Group Select -->
                            <div>
                                <div class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <span 
                                        class="bg-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                                    選擇車組
                                </div>
                                <div class="grid grid-cols-3 gap-3">
                                    <div v-for="group in vehicleGroups" :key="group.key"
                                        class="vehicle-select-card p-3 rounded-lg text-center border border-gray-200"
                                        :class="{ 'selected': selectedGroup === group.key }"
                                        @click="handleGroupSelect(group.key)">
                                        <div class="text-sm font-medium text-gray-700">{{ group.name }}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Vehicle Select -->
                            <div>
                                <div class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <span 
                                        class="bg-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary)] w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                                    選擇具體車輛
                                </div>
                                <el-select v-model="selectedVehicleId" placeholder="請選擇車輛" style="width: 100%"
                                    size="large" @change="calculatePrice" :disabled="!selectedGroup">
                                    <template #prefix>
                                        <el-icon>
                                            <Van></Van>
                                        </el-icon>
                                    </template>
                                    <el-option v-for="v in currentVehicleList" :key="v.id" :label="`${v.name} ${v.plate}`"
                                        :value="v.id">
                                        <div class="flex items-center justify-between gap-3 w-full">
                                            <div class="min-w-0">
                                                <div class="text-sm font-medium text-gray-800 truncate">{{ v.name }} · {{ v.plate }}</div>
                                                <div class="text-xs text-gray-400 truncate">{{ v.dealer }} / {{ v.store }} - {{ v.station }} / {{ v.available }}</div>
                                            </div>
                                            <div class="text-right shrink-0">
                                                <div class="text-xs text-gray-500">{{ v.status }}</div>
                                                <div class="font-mono text-xs text-gray-500">¥{{ formatNumber(v.price) }}</div>
                                            </div>
                                        </div>
                                    </el-option>
                                </el-select>
                            </div>
                        </div>

                        <!-- Auto Recommendation Tab -->
                        <div v-show="activeTab === 'auto'" class="space-y-3 pb-2">
                            <div v-for="rec in recommendations" :key="rec.id"
                                class="vehicle-select-card rounded-lg p-3 flex justify-between items-center border border-gray-200"
                                :class="{'selected': selectedVehicleId === rec.id}" @click="selectRecommendation(rec)">
                                <div class="flex items-center gap-3">
                                    <div 
                                        class="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100">
                                        <el-icon class="text-lg">
                                            <Van></Van>
                                        </el-icon>
                                    </div>
                                    <div class="min-w-0">
                                        <div class="font-bold text-sm text-gray-800">{{rec.name}} </div>
                                        <div class="flex gap-2 mt-1">
                                            <el-tag size="small" :type="rec.tagType" effect="plain"
                                                round>{{rec.tag}}</el-tag>
                                            <span class="text-xs text-gray-400 font-mono pt-0.5">{{rec.plate}}</span>
                                        </div>
                                        <div class="text-xs text-gray-400 mt-1 truncate">{{ rec.store }} - {{ rec.station }} / {{ rec.available }}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-gray-800"> {{ formatNumber(rec.price) }}</div>
                                    <div class="text-xs font-medium"
                                        :class="rec.price > 1920 ? 'text-red-500' : 'text-green-500'">
                                        {{ rec.price > 1920 ? '補 ' + formatNumber(rec.price - 1920) : '退 ' +
                                        formatNumber(1920
                                        - rec.price) }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Universal Promo Select (Only show when adjusting price AND group changed) -->
                        <div v-if="shouldShowPromoSelection"
                            class="mt-4 pt-4 border-t border-gray-200 animate__animated animate__fadeIn">
                            <div class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <span 
                                    class="bg-orange-100 text-orange-600 w-5 h-5 rounded-full flex items-center justify-center text-xs">
                                    <el-icon>
                                        <Ticket></Ticket>
                                    </el-icon>
                                </span>
                                優惠方案選擇
                            </div>
                            <el-select v-model="selectedPromoId" placeholder="選擇優惠" style="width: 100%" size="large"
                                @change="calculatePrice">
                                <template #prefix>
                                    <el-icon>
                                        <Ticket></Ticket>
                                    </el-icon>
                                </template>
                                <el-option v-for="p in promotions" :key="p.id" :label="p.name" :value="p.id">
                                    <span style="float: left">{{ p.name }}</span>
                                    <span style="float: right; color: #f56c6c; font-size: 13px"
                                        v-if="p.type !== 'none'">
                                        {{ p.type === 'rate' ? Math.round((1-p.discount)*100)/10 + '折' :
                                        '-'+p.discount }}
                                    </span>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>

                <!-- Right Side: Summary & Actions -->
                <div class="w-80 bg-slate-50 p-5 rounded-xl border border-gray-200 h-full flex flex-col shrink-0">
                    <h4 class="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3 flex items-center gap-2">
                        <el-icon class="text-[color:var(--app-color-primary)]">
                            <Money></Money>
                        </el-icon> 費用試算
                    </h4>

                    <div class="space-y-4 flex-1 overflow-y-auto">
                        <div class="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <div class="flex justify-between items-center text-sm mb-2">
                                <span class="text-gray-500">{{ isMidRental ? '原車日租金' : '原訂單金額' }}</span>
                                <span class="font-mono text-gray-400 line-through">
                                    {{ isMidRental ? '384' : '1,920' }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-gray-500">{{ isMidRental ? '新車日租金' : '新方案金額' }}</span>
                                <span class="font-mono font-bold text-xl text-[color:var(--app-color-primary)]" v-if="newPrice !== null">
                                    {{ isMidRental ? formatNumber(newPrice/5) : formatNumber(newPrice) }}
                                </span>
                                <span class="text-gray-300 font-mono" v-else>----</span>
                            </div>
                        </div>

                        <div class="flex justify-between items-center px-2">
                            <span class="text-gray-800 font-medium text-sm">
                                預計差價 {{ isMidRental ? `(剩餘 ${remainingDays} 天)` : '' }}
                            </span>
                            <div class="flex items-center gap-1">
                                <span v-if="newPrice !== null && priceDiff !== 0" class="text-xs px-1.5 py-0.5 rounded"
                                    :class="priceDiff > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'">
                                    {{ isMonthlyBilling ? (priceDiff > 0 ? '月結調增' : '月結調減') : (priceDiff > 0 ? '需補款' : '需退款') }}
                                </span>
                                <span class="font-bold text-lg"
                                    :class="priceDiff > 0 ? 'text-red-500' : (priceDiff < 0 ? 'text-green-500' : 'text-gray-300')">
                                    {{ newPrice !== null ? (priceDiff > 0 ? '+' : '') + formatNumber(priceDiff) :
                                    '--'
                                    }}
                                </span>
                            </div>
                        </div>

                        <!-- Price Handling Rules (Only show when group changed) -->
                        <div v-if="newPrice !== null && isGroupChanged"
                            class="bg-[color:var(--app-color-primary-light-9)] p-3 rounded-lg border border-[color:var(--app-color-primary-light-8)]">
                            <div class="mb-2 font-bold text-xs text-[color:var(--app-color-primary-active)] flex items-center gap-1">
                                <el-icon>
                                    <Operation></Operation>
                                </el-icon> 差價處理規則
                            </div>
                            <el-radio-group v-model="priceHandling" class="flex flex-col gap-2 w-full">
                                <el-radio label="diff" size="small" class="!mr-0 w-full !h-auto py-1">
                                    <span class="text-xs text-gray-700">多退少補 (標準)</span>
                                </el-radio>
                                <el-radio label="free" size="small" class="!mr-0 w-full !h-auto py-1"
                                    :disabled="priceDiff <= 0">
                                    <span class="text-xs text-gray-700">免費升等 (不補差價)</span>
                                </el-radio>
                            </el-radio-group>
                            <!-- Info hint for promo handling -->
                            <div class="mt-2 text-xs p-2 rounded-md"
                                :class="priceHandling === 'free' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'">
                                <el-icon class="mr-1">
                                    <InfoFilled></InfoFilled>
                                </el-icon>
                                    {{ priceHandling === 'free' ? '免費升等：保留原優惠方案，按原價計費' : (isMonthlyBilling ? '企業月結：差價進入最終企業賬單' : '多退少補：需重新選擇優惠方案') }}
                            </div>
                        </div>

                        <!-- Same Group Hint (No price change) -->
                        <div v-if="newPrice !== null && !isGroupChanged"
                            class="bg-green-50 p-3 rounded-lg border border-green-100">
                            <div class="flex items-center gap-2 text-green-700 text-xs">
                                <el-icon>
                                    <CircleCheck></CircleCheck>
                                </el-icon>
                                <span class="font-medium">同車組換車，保留原優惠方案，價格不變</span>
                            </div>
                        </div>

                    </div>

                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <el-select v-model="redirectionReason" placeholder="選擇改派原因" class="w-full mb-3" size="large">
                            <el-option v-for="reason in redirectionReasons" :key="reason.value"
                                :label="reason.label" :value="reason.value"></el-option>
                        </el-select>
                        <el-input v-model="redirectionNote"
                            :placeholder="priceHandling === 'free' || redirectionReason === 'other' ? '請填寫原因說明（必填）' : '填寫改派備註（可選）'"
                            type="textarea" :rows="2" resize="none" class="mb-3 text-sm"></el-input>
                        <div class="flex gap-3">
                            <el-button @click="redirectionModalVisible = false" class="flex-1">取消</el-button>
                            <el-button type="primary" @click="confirmRedirection" :disabled="!selectedVehicleId"
                                class="flex-1">
                                確認改派
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

        </el-dialog>
<el-dialog v-model="showDamageTypeDialog" title="添加異常/損傷記錄" width="500" align-center class="rounded-2xl order-detail-overlay" append-to-body destroy-on-close>
            <div class="space-y-5 px-1">
                <div>
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span class="w-1 h-4 bg-orange-500 rounded-full"></span>
                        選擇異常類型
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div v-for="cat in damageCategories" :key="cat.value"
                            class="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 group"
                            :class="newDamage.category === cat.value ? 'border-orange-500 bg-orange-50/50 text-orange-600 shadow-sm' : 'border-gray-100 bg-white text-gray-500 hover:border-orange-200 hover:bg-orange-50/30'"
                            @click="newDamage.category = cat.value">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                :class="newDamage.category === cat.value ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'">
                                <el-icon class="text-xl">
                                    <component :is="cat.icon"></component>
                                </el-icon>
                            </div>
                            <span class="text-sm font-medium">{{ cat.label }}</span>
                            <!-- Selected Checkmark -->
                            <div v-if="newDamage.category === cat.value" class="absolute top-2 right-2 text-orange-500">
                                <el-icon>
                                    <CircleCheckFilled></CircleCheckFilled>
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span class="w-1 h-4 bg-orange-500 rounded-full"></span>
                        損傷具體位置/名稱
                    </div>
                    <el-input v-model="newDamage.type" placeholder="例如：左前門刮痕、右後尾燈破損..." size="large">
                        <template #prefix>
                            <el-icon class="text-gray-400">
                                <EditPen></EditPen>
                            </el-icon>
                        </template>
                    </el-input>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer flex gap-3 pt-2">
                    <el-button @click="showDamageTypeDialog = false" size="large" class="flex-1">取消</el-button>
                    <el-button type="warning" @click="confirmAddDamage" size="large"
                        class="flex-1 shadow-lg shadow-orange-500/20">
                        確認添加
                    </el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="feeModalVisible" title="費用管理" width="1180px" destroy-on-close top="2vh" class="rounded-xl overflow-hidden custom-modal order-detail-overlay">

            <div class="p-5">
                <!-- Header with Add Button -->
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-3">
                        <div>
                            <div class="font-bold text-gray-900">訂單費用臺賬</div>
                            <div class="text-xs text-gray-500">統一查看費用項、資金記錄、追繳、減免與審計日誌</div>
                        </div>
                    </div>
                    <el-button type="primary" icon="Plus" @click="openNewFeeDialog">添加費用</el-button>
                </div>

                <!-- Account Context -->
                <div class="mb-4 rounded-lg border px-4 py-3 text-sm"
                    :class="isMonthlyBilling ? 'bg-[color:var(--app-color-primary-light-9)] border-[color:var(--app-color-primary-light-8)] text-[color:var(--app-color-primary-hover)]' : 'bg-gray-50 border-gray-100 text-gray-600'">
                    {{ isMonthlyBilling ? '企業月結訂單：費用統一進入企業賬單，不展示客戶通知支付、收款、退款和催收提醒。' : '客戶自付訂單：待收費用可收款，已收費用可退款，完成後追繳先通知客戶。' }}
                </div>

                <!-- Summary Cards -->
                <div class="grid grid-cols-4 gap-3 mb-4">
                    <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <div class="text-xs text-gray-500">費用合計</div>
                        <div class="mt-1 font-mono text-lg font-bold text-gray-900">¥{{ formatNumber(feeSummary.total)
                            }}</div>
                    </div>
                    <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <div class="text-xs text-gray-500">{{ isMonthlyBilling ? '企業掛賬' : '已收金額' }}</div>
                        <div class="mt-1 font-mono text-lg font-bold"
                            :class="isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : 'text-green-600'">
                            ¥{{ formatNumber(isMonthlyBilling ? feeSummary.monthly : feeSummary.paid) }}
                        </div>
                    </div>
                    <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <div class="text-xs text-gray-500">{{ isMonthlyBilling ? '客戶應收' : '待收金額' }}</div>
                        <div class="mt-1 font-mono text-lg font-bold"
                            :class="isMonthlyBilling || feeSummary.pending === 0 ? 'text-gray-500' : 'text-orange-600'">
                            ¥{{ formatNumber(isMonthlyBilling ? 0 : feeSummary.pending) }}
                        </div>
                    </div>
                    <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <div class="text-xs text-gray-500">已減免</div>
                        <div class="mt-1 font-mono text-lg font-bold text-gray-700">¥{{ formatNumber(feeSummary.waived)
                            }}</div>
                    </div>
                </div>

                <!-- Status Filter Tabs -->
                <div class="flex flex-wrap gap-2 mb-4 pb-3 border-b border-gray-100">
                    <!-- Phase Filter (Primary) -->
                    <div class="flex gap-2 mr-4 pr-4 border-r border-gray-200">
                        <el-button v-for="filter in feePhaseFilters" :key="filter.value"
                            :type="feePhaseFilter === filter.value ? 'primary' : ''"
                            :plain="feePhaseFilter !== filter.value" size="small" @click="feePhaseFilter = filter.value"
                            :class="filter.value === 'post' && feePhaseFilter !== 'post' ? 'text-orange-500 border-orange-200 hover:border-orange-300' : ''">
                            <span v-if="filter.value === 'post'" class="flex items-center gap-1">
                                <el-icon v-if="pendingPostCharges.length > 0" class="text-orange-500">
                                    <WarningFilled></WarningFilled>
                                </el-icon>
                                {{ filter.label }}
                                <el-badge v-if="pendingPostCharges.length > 0" :value="pendingPostCharges.length"
                                    type="warning" class="ml-1" ></el-badge>
                            </span>
                            <span v-else>{{ filter.label }}</span>
                        </el-button>
                    </div>
                    <!-- Status Filter -->
                    <el-button v-for="filter in feeStatusFilters" :key="filter.value"
                        :type="feeStatusFilter === filter.value ? 'primary' : ''"
                        :plain="feeStatusFilter !== filter.value" size="small" @click="feeStatusFilter = filter.value">
                        {{ filter.label }} ({{ getFilteredFeeCount(filter.value) }})
                    </el-button>
                </div>

                <!-- Fee List -->
                <div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div 
                        class="grid grid-cols-[minmax(320px,1fr)_110px_110px_110px_150px_170px_28px] gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                        <div>費用項</div>
                        <div class="text-right">應收金額</div>
                        <div class="text-right">已處理</div>
                        <div class="text-right">待處理</div>
                        <div>狀態</div>
                        <div class="text-right">操作</div>
                        <div></div>
                    </div>
                    <div class="max-h-[540px] overflow-y-auto custom-scroll">
                        <div v-for="fee in filteredFeeItems" :key="fee.id" class="border-t border-gray-100 transition-colors"
                            :class="{ 
                                'bg-orange-50/40': fee.isOverdue,
                                'bg-white': !fee.isOverdue
                            }">
                        <!-- Fee Row -->
                        <div 
                            class="px-4 py-3 grid grid-cols-[minmax(320px,1fr)_110px_110px_110px_150px_170px_28px] gap-3 items-center cursor-pointer hover:bg-gray-50"
                            @click="toggleFeeExpand(fee.id)">
                            <div class="min-w-0">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="px-1.5 py-0.5 rounded border text-xs"
                                        :class="fee.phase === 'post' ? 'border-orange-200 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-500 bg-gray-50'">
                                        {{ fee.phase === 'post' ? '追繳' : '租期' }}
                                    </span>
                                    <span class="px-1.5 py-0.5 rounded border border-gray-200 bg-white text-xs text-gray-500">
                                        {{ fee.source === 'system' ? '系統' : '人工' }}
                                    </span>
                                    <span class="font-medium text-gray-900 truncate">{{ fee.name }}</span>
                                </div>
                                <div class="mt-1 text-xs text-gray-500 truncate" :title="fee.description">
                                    {{ fee.description }}
                                </div>
                                <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                    <span>{{ fee.createdAt }}</span>
                                    <span>交易 {{ getTransactionsForFee(fee.id).length }} 筆</span>
                                    <!-- Notify Status for post-phase fees -->
                                    <span v-if="!isMonthlyBilling && fee.phase === 'post' && fee.notifyStatus === 'notified'"
                                        class="flex items-center gap-1 text-green-600">
                                        <el-icon>
                                            <Check></Check>
                                        </el-icon>已通知 {{ fee.notifiedAt }}
                                    </span>
                                    <span v-else-if="!isMonthlyBilling && fee.phase === 'post' && fee.notifyStatus === 'pending'"
                                        class="flex items-center gap-1 text-orange-600">
                                        <el-icon>
                                            <WarningFilled></WarningFilled>
                                        </el-icon>待通知
                                    </span>
                                    <span v-if="isMonthlyBilling && fee.displayStatus === 'monthly_billing'"
                                        class="flex items-center gap-1 text-[color:var(--app-color-primary)]">
                                        <el-icon>
                                            <OfficeBuilding></OfficeBuilding>
                                        </el-icon>企業賬單
                                    </span>
                                    <span v-if="!isMonthlyBilling && fee.reminder && fee.reminder.date"
                                        class="flex items-center gap-1"
                                        :class="fee.isOverdue ? 'text-red-500' : 'text-blue-500'">
                                        <el-icon>
                                            <Bell></Bell>
                                        </el-icon>{{ fee.reminder.date }}
                                    </span>
                                </div>
                            </div>
                            <!-- Amount -->
                            <div class="text-right">
                                <div class="font-mono font-bold text-gray-900">¥{{ formatNumber(fee.amount) }}</div>
                            </div>
                            <div class="text-right">
                                <div v-if="isMonthlyBilling && fee.displayStatus === 'monthly_billing'"
                                    class="text-xs font-medium text-[color:var(--app-color-primary)]">已掛賬</div>
                                <div v-else-if="fee.status === 'waived'" class="text-xs font-medium text-gray-500">已減免</div>
                                <div v-else class="font-mono text-sm text-gray-700">¥{{ formatNumber(fee.paidAmount || 0)
                                    }}</div>
                            </div>
                            <div class="text-right">
                                <div v-if="isMonthlyBilling" class="font-mono text-sm text-gray-500">¥0</div>
                                <div v-else class="font-mono text-sm"
                                    :class="Math.max(0, fee.amount - (fee.paidAmount || 0)) > 0 ? 'text-orange-600' : 'text-gray-500'">
                                    ¥{{ formatNumber(Math.max(0, fee.amount - (fee.paidAmount || 0))) }}
                                </div>
                            </div>
                            <!-- Status Tag -->
                            <div>
                                <el-tag :type="getFeeStatusType(fee.displayStatus)" size="small" effect="plain">
                                    {{ getFeeStatusText(fee.displayStatus) }}
                                </el-tag>
                            </div>
                            <!-- Action Buttons -->
                            <div class="flex items-center justify-end gap-2" @click.stop>
                                <el-tag v-if="isMonthlyBilling && fee.displayStatus === 'monthly_billing'" type="primary"
                                    size="small" effect="plain">月結掛賬</el-tag>
                                <template v-else>
                                    <!-- Notify Customer (for post-phase fees with pending notify) -->
                                    <el-button v-if="!isMonthlyBilling && fee.phase === 'post' && fee.notifyStatus === 'pending'"
                                        type="warning" size="small" @click="notifyCustomerForCharge(fee)">
                                        <el-icon class="mr-1">
                                            <Bell></Bell>
                                        </el-icon>通知客戶
                                    </el-button>
                                    <!-- Primary: Collect Payment -->
                                    <el-button v-if="!isMonthlyBilling && (fee.status === 'pending' || fee.status === 'partial')"
                                        type="primary" size="small" @click="openCollectPayment(fee)">
                                        收款
                                    </el-button>

                                    <!-- More Actions dropdown -->
                                    <el-dropdown v-if="!isMonthlyBilling" trigger="click" @command="handleFeeCommand">
                                        <el-button size="small" plain class="px-2">
                                            <el-icon>
                                                <More></More>
                                            </el-icon>
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <!-- Refund -->
                                                <el-dropdown-item v-if="!isMonthlyBilling && fee.paidAmount > 0"
                                                    :command="{ type: 'refund', fee: fee }">
                                                    <el-icon>
                                                        <RefreshLeft></RefreshLeft>
                                                    </el-icon>退款
                                                </el-dropdown-item>
                                                <!-- Edit -->
                                                <el-dropdown-item 
                                                    v-if="!isMonthlyBilling && fee.source === 'manual' && fee.status === 'pending'"
                                                    :command="{ type: 'edit', fee: fee }">
                                                    <el-icon>
                                                        <Edit></Edit>
                                                    </el-icon>編輯
                                                </el-dropdown-item>
                                                <!-- Delete -->
                                                <el-dropdown-item 
                                                    v-if="!isMonthlyBilling && fee.source === 'manual' && fee.status === 'pending'"
                                                    :command="{ type: 'delete', fee: fee }" divided>
                                                    <span class="text-red-500 flex items-center gap-1">
                                                        <el-icon>
                                                            <Delete></Delete>
                                                        </el-icon>刪除
                                                    </span>
                                                </el-dropdown-item>
                                                <!-- Reminder -->
                                                <el-dropdown-item 
                                                    v-if="!isMonthlyBilling && fee.status !== 'paid' && fee.status !== 'refunded' && fee.status !== 'waived' && fee.status !== 'released' && fee.status !== 'cancelled' && fee.status !== 'monthly_billing'"
                                                    :command="{ type: 'reminder', fee: fee }" divided>
                                                    <el-icon>
                                                        <Bell></Bell>
                                                    </el-icon>{{ fee.reminder ? '修改提醒' : '設置提醒' }}
                                                </el-dropdown-item>
                                                <!-- Mark Reminded -->
                                                <el-dropdown-item v-if="!isMonthlyBilling && fee.reminder && !fee.reminder.notified"
                                                    :command="{ type: 'markReminded', fee: fee }">
                                                    <el-icon>
                                                        <Check></Check>
                                                    </el-icon>標記已提醒
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                </template>
                            </div>

                            <!-- Expand Icon -->
                            <el-icon class="text-gray-400 transition-transform"
                                :class="{ 'rotate-180': expandedFees.includes(fee.id) }">
                                <ArrowDown></ArrowDown>
                            </el-icon>
                        </div>

                        <!-- Expanded Content: Transactions & Actions -->
                        <div v-show="expandedFees.includes(fee.id)" class="border-t border-gray-100 bg-gray-50 px-4 py-3">
                            <!-- Transactions -->
                            <div v-if="getTransactionsForFee(fee.id).length > 0" class="mb-4">
                                <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">交易記錄</div>
                                <div class="space-y-2">
                                    <div v-for="txn in getTransactionsForFee(fee.id)" :key="txn.id"
                                        class="bg-white rounded-lg border border-gray-100 px-3 py-2 flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <!-- Channel Icon -->
                                            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                                                :class="txn.type === 'monthly_bill' ? 'bg-[color:var(--app-color-primary-light-8)]' : (txn.channelType === 'online' ? 'bg-green-100' : 'bg-amber-100')">
                                                <el-icon 
                                                    :class="txn.type === 'monthly_bill' ? 'text-[color:var(--app-color-primary)]' : (txn.channelType === 'online' ? 'text-green-600' : 'text-amber-600')">
                                                    <component 
                                                        :is="txn.type === 'monthly_bill' ? 'OfficeBuilding' : (txn.channelType === 'online' ? 'Iphone' : 'Wallet')">
                                                    </component>
                                                </el-icon>
                                            </div>
                                            <div>
                                                <div class="flex items-center gap-2">
                                                    <span class="text-sm font-medium text-gray-700">{{
                                                        getChannelName(txn.channel) }}</span>
                                                    <el-tag v-if="txn.type === 'refund'" type="danger"
                                                        size="small">退款</el-tag>
                                                    <el-tag v-if="txn.type === 'monthly_bill'" type="primary"
                                                        size="small">已掛賬</el-tag>
                                                </div>
                                                <div class="text-xs text-gray-400">{{ txn.refNo || '-' }} | {{
                                                    txn.createdAt }}</div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <span class="font-mono font-semibold"
                                                :class="txn.type === 'refund' ? 'text-red-500' : (txn.type === 'pre_auth' ? 'text-blue-500' : (txn.type === 'monthly_bill' ? 'text-[color:var(--app-color-primary)]' : 'text-green-600'))">
                                                {{ txn.type === 'refund' ? '-' : (txn.type === 'pre_auth' ? '' : '+') }}¥{{ formatNumber(txn.amount) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-xs text-gray-400 text-center py-2 mb-3">暫無交易記錄</div>

                            <!-- Action Buttons -->

                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="filteredFeeItems.length === 0" class="text-center py-8 text-gray-400">
                        <el-icon class="text-4xl mb-2">
                            <Wallet></Wallet>
                        </el-icon>
                        <div>暫無費用記錄</div>
                    </div>
                    </div>
                </div>

                <!-- Summary Footer -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <!-- Summary Row -->
                    <div class="flex justify-between items-center mb-3">
                        <div class="text-xs text-gray-500">
                            當前篩選 {{ filteredFeeItems.length }} 項 / 全部 {{ feeItems.length }} 項；點擊費用行查看關聯交易記錄。
                        </div>
                        <div class="flex gap-2">
                            <el-button size="small" plain icon="List" @click="showAuditLog = !showAuditLog">
                                {{ showAuditLog ? '隱藏日誌' : '操作日誌' }}
                            </el-button>
                            <el-button @click="feeModalVisible = false">關閉</el-button>
                        </div>
                    </div>

                    <!-- Audit Log (Collapsible) -->
                    <div v-show="showAuditLog" class="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto custom-scroll">
                        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">操作日誌</div>
                        <div class="space-y-1">
                            <div v-for="log in feeAuditLogs" :key="log.id"
                                class="flex items-center gap-3 text-xs py-1 border-b border-gray-100 last:border-0">
                                <span class="text-gray-400 w-28">{{ log.time }}</span>
                                <el-tag :type="getLogActionType(log.action)" size="small" effect="plain"
                                    class="w-14 text-center">
                                    {{ log.action }}
                                </el-tag>
                                <span class="flex-1 text-gray-600">{{ log.detail }}</span>
                                <span class="text-gray-400">{{ log.operator }}</span>
                            </div>
                        </div>
                        <div v-if="feeAuditLogs.length === 0" class="text-xs text-gray-400 text-center py-2">暫無操作日誌
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
<el-dialog v-model="addFeeDialogVisible" :title="editingFee ? '編輯費用' : '添加費用'" width="450px" append-to-body destroy-on-close class="rounded-xl order-detail-overlay">
            <div class="space-y-4">
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">費用類型</div>
                    <el-select v-model="newFeeData.type" class="w-full" placeholder="選擇費用類型">
                        <el-option v-for="type in manualFeeTypes" :key="type.value" :label="type.label"
                            :value="type.value"></el-option>
                    </el-select>
                </div>
                <div v-if="newFeeData.type === 'other'">
                    <div class="text-sm font-medium text-gray-700 mb-2">自定義名稱</div>
                    <el-input v-model="newFeeData.customName" placeholder="輸入費用名稱"></el-input>
                </div>
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">費用金額</div>
                    <el-input-number v-model="newFeeData.amount" :min="0" :precision="0"
                        class="w-full"></el-input-number>
                </div>
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">費用說明</div>
                    <el-input v-model="newFeeData.description" type="textarea" :rows="2"
                        placeholder="詳細說明..."></el-input>
                </div>
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">上傳憑證 (可選)</div>
                    <el-upload action="#" :auto-upload="false" :limit="3" list-type="picture-card"
                        :on-exceed="handleExceed">
                        <el-icon>
                            <Plus></Plus>
                        </el-icon>
                    </el-upload>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="addFeeDialogVisible = false" class="flex-1">取消</el-button>
                    <el-button type="primary" @click="confirmAddFee" class="flex-1">
                        {{ editingFee ? '保存修改' : '確認添加' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="collectPaymentDialogVisible" title="收款" width="500px" append-to-body destroy-on-close class="rounded-xl order-detail-overlay">
            <div class="space-y-4">
                <!-- Fee Info -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">費用項目</span>
                        <span class="font-bold text-gray-800">{{ collectingFee?.name }}</span>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-gray-600">待收金額</span>
                        <span class="font-mono font-bold text-[color:var(--app-color-primary)] text-lg">
                            ¥{{ formatNumber((collectingFee?.amount || 0) - (collectingFee?.paidAmount || 0)) }}
                        </span>
                    </div>
                </div>

                <!-- Payment Channel -->
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">收款渠道</div>
                    <el-radio-group v-model="paymentChannelType" class="w-full">
                        <el-radio-button value="online" class="flex-1">線上支付</el-radio-button>
                        <el-radio-button value="offline" class="flex-1">線下收款</el-radio-button>
                    </el-radio-group>
                </div>

                <!-- Online Channels -->
                <div v-if="paymentChannelType === 'online'" class="grid grid-cols-3 gap-3">
                    <div v-for="ch in onlineChannels" :key="ch.value"
                        class="border-2 rounded-lg p-3 text-center cursor-pointer transition-all"
                        :class="selectedPaymentChannel === ch.value ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]'"
                        @click="selectedPaymentChannel = ch.value">
                        <el-icon class="text-2xl mb-1" :class="ch.color">
                            <component :is="ch.icon"></component>
                        </el-icon>
                        <div class="text-sm font-medium">{{ ch.label }}</div>
                    </div>
                </div>

                <!-- Offline Channels -->
                <div v-if="paymentChannelType === 'offline'" class="space-y-3">
                    <el-select v-model="selectedPaymentChannel" class="w-full" placeholder="選擇收款方式">
                        <el-option v-for="ch in offlineChannels" :key="ch.value" :label="ch.label"
                            :value="ch.value"></el-option>
                    </el-select>
                    <div>
                        <div class="text-sm font-medium text-gray-700 mb-2">交易流水號</div>
                        <el-input v-model="offlineRefNo" placeholder="POS機或銀行轉賬流水號"></el-input>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-700 mb-2">上傳收據憑證 (可選)</div>
                        <el-upload action="#" :auto-upload="false" :limit="1" :show-file-list="false">
                            <el-button icon="Upload">選擇文件</el-button>
                        </el-upload>
                    </div>
                </div>

                <!-- Amount -->
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">收款金額</div>
                    <el-input-number v-model="collectAmount" :min="1"
                        :max="(collectingFee?.amount || 0) - (collectingFee?.paidAmount || 0)"
                        class="w-full"></el-input-number>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="collectPaymentDialogVisible = false" class="flex-1">取消</el-button>
                    <el-button type="success" @click="confirmCollectPayment" class="flex-1">確認收款</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="refundDialogVisible" title="退款" width="500px" append-to-body destroy-on-close class="rounded-xl order-detail-overlay">
            <div class="space-y-4">
                <!-- Source Transaction -->
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">選擇原交易</div>
                    <el-select v-model="selectedRefundTxn" class="w-full" placeholder="選擇需要退款的交易">
                        <el-option v-for="txn in refundableTxns" :key="txn.id"
                            :label="`${getChannelName(txn.channel)} ¥${txn.amount} (${txn.createdAt})`"
                            :value="txn.id"></el-option>
                    </el-select>
                </div>

                <!-- Refund Amount -->
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">退款金額</div>
                    <el-input-number v-model="refundAmount" :min="1" :max="getSelectedTxnAmount()"
                        class="w-full"></el-input-number>
                    <div class="text-xs text-gray-400 mt-1">
                        最大可退: ¥{{ formatNumber(getSelectedTxnAmount()) }}
                    </div>
                </div>

                <!-- Refund Method (based on original payment) -->
                <div v-if="selectedRefundTxn">
                    <div class="text-sm font-medium text-gray-700 mb-2">退款方式</div>
                    <div class="bg-gray-50 rounded-lg p-3">
                        <template v-if="getSelectedTxnChannelType() === 'online'">
                            <div class="flex items-center gap-2 text-green-600">
                                <el-icon>
                                    <Iphone></Iphone>
                                </el-icon>
                                <span class="font-medium">原路退回 ({{ getChannelName(getSelectedTxnChannel()) }})</span>
                            </div>
                            <div class="text-xs text-gray-400 mt-1">將退款至客戶原支付賬戶</div>
                        </template>
                        <template v-else>
                            <el-radio-group v-model="offlineRefundMethod">
                                <el-radio value="cash">現金退款</el-radio>
                                <el-radio value="transfer">銀行轉賬</el-radio>
                            </el-radio-group>
                            <div v-if="offlineRefundMethod === 'transfer'" class="mt-3">
                                <el-input v-model="refundTransferInfo" placeholder="銀行賬號信息"></el-input>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Refund Reason -->
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">退款原因</div>
                    <el-input v-model="refundReason" type="textarea" :rows="2" placeholder="請填寫退款原因..."></el-input>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="refundDialogVisible = false" class="flex-1">取消</el-button>
                    <el-button type="danger" @click="confirmRefund" class="flex-1">確認退款</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="reminderDialogVisible" title="設置收款提醒" width="400px" append-to-body destroy-on-close class="rounded-xl order-detail-overlay">
            <div class="space-y-4">
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">提醒日期</div>
                    <el-date-picker v-model="reminderDate" type="date" class="w-full" placeholder="選擇提醒日期"
                        format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
                </div>
                <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-600">
                    <el-icon class="mr-1">
                        <InfoFilled></InfoFilled>
                    </el-icon>
                    超過提醒日期後，該費用會以紅色高亮顯示
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="reminderDialogVisible = false" class="flex-1">取消</el-button>
                    <el-button type="primary" @click="confirmReminder" class="flex-1">確認設置</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="transactionsDialogVisible" title="交易記錄明細" width="900px" center destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
            <div class="space-y-4">
                <!-- Summary Header -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                        <div class="text-xs text-gray-500 mb-1">{{ isMonthlyBilling ? '月結掛賬 (Monthly Bill)' : '總收入 (Total Revenue)' }}</div>
                        <div class="text-xl font-bold font-mono" :class="isMonthlyBilling ? 'text-[color:var(--app-color-primary)]' : 'text-green-600'">¥{{ formatNumber(isMonthlyBilling ? txnSummary.totalMonthlyBill : txnSummary.totalIncome)
                            }}</div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                        <div class="text-xs text-gray-500 mb-1">總退款 (Total Refund)</div>
                        <div class="text-xl font-bold text-red-500 font-mono">¥{{ formatNumber(txnSummary.totalRefund)
                            }}</div>
                    </div>
                    <div class="bg-[color:var(--app-color-primary-light-9)] rounded-lg p-4 text-center border border-[color:var(--app-color-primary-light-8)]">
                        <div class="text-xs text-[color:var(--app-color-primary)] mb-1">{{ isMonthlyBilling ? '賬單淨額 (Bill Total)' : '淨實收 (Net Actual)' }}</div>
                        <div class="text-xl font-bold text-[color:var(--app-color-primary)] font-mono">¥{{ formatNumber(isMonthlyBilling ? txnSummary.netMonthlyBill : txnSummary.netIncome)
                            }}</div>
                    </div>
                </div>

                <!-- Transaction Table -->
                <el-table :data="enhancedTransactions" stripe border style="width: 100%" height="450">
                    <el-table-column prop="createdAt" label="交易時間" width="160" sortable fixed></el-table-column>
                    <el-table-column label="交易類型" width="120">
                        <template #default="{ row }">
                            <el-tag :type="getTxnTypeLabel(row.type, row.txnType).type" size="small" effect="dark">
                                {{ getTxnTypeLabel(row.type, row.txnType).text }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="金額" width="140" align="right">
                        <template #default="{ row }">
                            <span class="font-mono font-bold"
                                :class="row.type === 'payment' ? 'text-green-600' : (row.type === 'monthly_bill' ? 'text-[color:var(--app-color-primary)]' : (row.type === 'pre_auth' ? 'text-blue-500' : (row.type === 'waiver' ? 'text-gray-400 line-through decoration-gray-400' : 'text-red-500')))">
                                {{ row.type === 'refund' || row.type === 'waiver' ? '-' : (row.type === 'pre_auth' ? '' : '+') }} ¥{{ formatNumber(row.amount) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="支付方式" width="180">
                        <template #default="{ row }">
                            <div class="flex flex-col">
                                <div class="flex items-center gap-1">
                                    <div v-if="row.type === 'waiver'" class="flex items-center gap-1 text-gray-500">
                                        <el-icon>
                                            <Discount></Discount>
                                        </el-icon>
                                        <span class="font-medium">費用減免</span>
                                    </div>
                                    <div v-else-if="row.type === 'monthly_bill'" class="flex items-center gap-1 text-[color:var(--app-color-primary)]">
                                        <el-icon>
                                            <OfficeBuilding></OfficeBuilding>
                                        </el-icon>
                                        <span class="font-medium">企業月結掛賬</span>
                                    </div>
                                    <template v-else>
                                        <el-icon 
                                            :class="row.channelType === 'online' ? 'text-blue-500' : 'text-orange-500'">
                                            <component :is="row.channelType === 'online' ? 'Iphone' : 'Wallet'">
                                            </component>
                                        </el-icon>
                                        <span class="font-medium text-gray-800">{{ getChannelName(row.channel) }}</span>
                                    </template>
                                </div>
                                <div v-if="row.channel === 'credit_card' && row.cardInfo"
                                    class="text-xs text-gray-400 pl-5 font-mono">
                                    {{ row.cardInfo.brand }} **** {{ row.cardInfo.last4 }}
                                </div>
                                <div v-else-if="row.type === 'monthly_bill'" class="text-xs text-[color:var(--app-color-primary)] pl-5">
                                    企業賬單
                                </div>
                                <div v-else-if="row.type !== 'waiver'" class="text-xs text-gray-400 pl-5">
                                    {{ row.channelType === 'online' ? '線上支付' : '線下支付' }}
                                </div>
                                <div v-else class="text-xs text-gray-400 pl-5">
                                    {{ row.remark || '系統操作' }}
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="refNo" label="流水號" width="180" show-overflow-tooltip></el-table-column>
                    <el-table-column label="關聯費用" width="150" show-overflow-tooltip>
                        <template #default="{ row }">
                            <el-tooltip v-if="row.fullFeeNames && row.fullFeeNames !== row.feeName"
                                :content="row.fullFeeNames" placement="top">
                                <span class="text-gray-600 border-b border-dashed border-gray-300 cursor-help">{{
                                    row.feeName }}</span>
                            </el-tooltip>
                            <span v-else class="text-gray-600">{{ row.feeName }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
                </el-table>
            </div>
            <template #footer>
                <div class="flex justify-between items-center">
                    <div class="text-xs text-gray-400">共 {{ enhancedTransactions.length }} 條交易記錄</div>
                    <div class="flex gap-3">
                        <el-button @click="transactionsDialogVisible = false">關閉</el-button>
                        <el-button type="primary" @click="exportTransactions">
                            <el-icon class="mr-1">
                                <Download></Download>
                            </el-icon> 導出 Excel
                        </el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="extendModalVisible" :title="extendDialogTitle" width="680px" center destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
            <div class="space-y-5">
                <!-- Time Selection -->
                <div class="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <div class="text-xs text-gray-400 mb-1">當前還車時間</div>
                            <div class="font-bold text-gray-800 font-mono text-lg">{{ formatDate(planData.returnTime) }}
                            </div>
                        </div>
                        <el-icon class="text-gray-300">
                            <Right></Right>
                        </el-icon>
                        <div class="text-right">
                            <div class="text-xs text-gray-400 mb-1">新還車時間</div>
                            <el-date-picker v-model="extendData.newReturnTime" type="datetime" placeholder="選擇新時間"
                                format="YYYY/MM/DD HH:mm"
                                :disabled-date="(time) => time.getTime() < planData.returnTime.getTime()"
                                @change="checkExtendConflict" class="!w-48">
                            </el-date-picker>
                        </div>
                    </div>
                </div>

                <div v-if="orderStatus === 'overdue'"
                    class="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700 flex gap-2">
                    <el-icon class="mt-0.5">
                        <WarningFilled></WarningFilled>
                    </el-icon>
                    {{ isMonthlyBilling ? '當前訂單已逾期，補辦續租需通過風控校驗，費用進入企業月結賬單。' : '當前訂單已逾期，補辦續租必須完成立即收款並通過風控校驗。' }}
                </div>

                <!-- Conflict Warning -->
                <div v-if="extendData.conflict"
                    class="bg-red-50 border border-red-200 rounded-lg p-4 animate__animated animate__pulse">
                    <div class="flex items-start gap-3">
                        <el-icon class="text-red-500 text-xl mt-0.5">
                            <WarningFilled></WarningFilled>
                        </el-icon>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800 text-sm mb-1">無法延長至所選時間</h4>
                            <p class="text-xs text-red-600 mb-3">該車輛在 {{ extendData.conflict.nextOrder.pickupTime }}
                                有後續預訂 (單號: {{ extendData.conflict.nextOrder.orderId }})</p>

                            <div class="bg-white rounded border border-red-100 p-3 mb-3">
                                <div class="text-xs text-gray-500 flex justify-between mb-1">
                                    <span>最遲可延長時間 (含2h緩衝)</span>
                                    <span class="font-bold text-gray-800">{{ extendData.conflict.maxExtendTime }}</span>
                                </div>
                                <el-button size="small" link type="primary" @click="useMaxExtendTime">使用此時間</el-button>
                            </div>

                            <div class="flex gap-2">
                                <el-button type="danger" size="small" plain
                                    @click="resolveConflict">快捷改派後續訂單</el-button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fee Estimation -->
                <div v-if="!extendData.conflict && extendData.newReturnTime"
                    class="bg-[color:var(--app-color-primary-light-9)] border border-[color:var(--app-color-primary-light-8)] rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="text-xs text-[color:var(--app-color-primary)] mb-1">續租費用試算</div>
                            <div class="text-sm text-gray-700">按當前訂單費率 {{ formatNumber(planData.hourlyRate) }} 元/小時計算</div>
                        </div>
                        <div class="text-right">
                            <div class="text-xl font-bold text-[color:var(--app-color-primary)] font-mono">¥{{ formatNumber(estimatedExtendFee) }}
                            </div>
                            <div class="text-xs text-[color:var(--app-color-primary-light-5)]">約 {{ extendDurationText }}</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div class="bg-white/70 border border-[color:var(--app-color-primary-light-8)] rounded-lg p-2">
                            <div class="text-gray-400">計費時長</div>
                            <div class="font-bold text-gray-800 mt-1">{{ extendDurationText }}</div>
                        </div>
                        <div class="bg-white/70 border border-[color:var(--app-color-primary-light-8)] rounded-lg p-2">
                            <div class="text-gray-400">費用類型</div>
                            <div class="font-bold text-gray-800 mt-1">續租租金</div>
                        </div>
                        <div class="bg-white/70 border border-[color:var(--app-color-primary-light-8)] rounded-lg p-2">
                            <div class="text-gray-400">費用階段</div>
                            <div class="font-bold text-gray-800 mt-1">租期費用</div>
                        </div>
                    </div>
                </div>

                <!-- Settlement Mode -->
                <div v-if="!extendData.conflict && extendData.newReturnTime" class="border border-gray-100 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-3">
                        <div class="text-sm font-bold text-gray-800">結算方式</div>
                        <el-tag v-if="isMonthlyBilling" type="primary" size="small" effect="plain">
                            企業月結
                        </el-tag>
                        <el-tag v-else-if="extendRequiresImmediatePay" type="warning" size="small" effect="plain">
                            必須立即收款
                        </el-tag>
                    </div>
                    <div v-if="isMonthlyBilling"
                        class="bg-[color:var(--app-color-primary-light-9)] border border-[color:var(--app-color-primary-light-8)] rounded-lg p-3 text-sm text-[color:var(--app-color-primary-hover)]">
                        續租費用隨還車最終應收進入企業月結賬單，本次不向客戶收款。
                    </div>
                    <el-radio-group v-else v-model="extendData.settlementMode" class="w-full">
                        <el-radio-button label="immediate">立即收款</el-radio-button>
                        <el-radio-button label="return_settlement" :disabled="extendRequiresImmediatePay">還車時結算</el-radio-button>
                    </el-radio-group>
                    <div v-if="!isMonthlyBilling && extendRequiresImmediatePay" class="text-xs text-orange-600 mt-2">
                        觸發原因：{{ extendImmediateReason }}
                    </div>
                    <div v-else-if="!isMonthlyBilling" class="text-xs text-gray-500 mt-2">
                        還車時結算會生成待收續租費用項，最終在還車賬單中統一處理。
                    </div>

                    <div v-if="!isMonthlyBilling && extendData.settlementMode === 'immediate'"
                        class="mt-3 bg-green-50 border border-green-100 rounded-lg p-3 flex justify-between items-center">
                        <div>
                            <div class="text-sm font-bold text-green-700">本次應收 ¥{{ formatNumber(estimatedExtendFee) }}</div>
                            <div class="text-xs text-green-600 mt-1">
                                {{ extendData.paymentPaid ? '已完成續租收款，可確認延長。' : '確認延長前需先完成續租收款。' }}
                            </div>
                        </div>
                        <el-button type="success" size="small" :disabled="extendData.paymentPaid || estimatedExtendFee <= 0"
                            @click="confirmExtendPayment">
                            {{ extendData.paymentPaid ? '已收款' : '確認收款' }}
                        </el-button>
                    </div>
                </div>

                <!-- Remarks -->
                <div>
                    <div class="text-sm font-medium text-gray-700 mb-2">備註說明</div>
                    <el-input v-model="extendData.remarks" type="textarea" :rows="2" placeholder="請輸入延長用車的備註信息..."
                        resize="none"></el-input>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="extendModalVisible = false" class="flex-1">取消</el-button>
                    <el-button type="primary" @click="confirmExtend" class="flex-1"
                        :disabled="!canConfirmExtend">確認延長</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="photoGalleryVisible" title="車況照片詳情" width="800px" center destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
            <el-tabs v-model="photoGalleryTab" class="w-full">
                <el-tab-pane label="外部照片 (6)" name="exterior">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                        <div v-for="i in 6" :key="i"
                            class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 relative group overflow-hidden cursor-pointer">
                            <el-icon class="text-3xl">
                                <Picture></Picture>
                            </el-icon>
                            <span 
                                class="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">外觀-{{i}}</span>
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="內部照片 (3)" name="interior">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                        <div v-for="i in 3" :key="i"
                            class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 relative group overflow-hidden cursor-pointer">
                            <el-icon class="text-3xl">
                                <Picture></Picture>
                            </el-icon>
                            <span 
                                class="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">內飾-{{i}}</span>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="異常標註 (2)" name="damage">
                    <div class="grid grid-cols-2 gap-4 p-2">
                        <div class="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3">
                            <div 
                                class="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400">
                                <el-icon class="text-2xl">
                                    <Warning></Warning>
                                </el-icon>
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-red-600 text-sm mb-1">左前保險槓刮擦</div>
                                <div class="text-xs text-gray-500 mb-2">長約 5cm 劃痕，底漆露出</div>
                                <el-tag size="small" type="danger">外觀</el-tag>
                            </div>
                        </div>
                        <div class="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3">
                            <div 
                                class="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400">
                                <el-icon class="text-2xl">
                                    <Warning></Warning>
                                </el-icon>
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-red-600 text-sm mb-1">右後視鏡破損</div>
                                <div class="text-xs text-gray-500 mb-2">外殼裂紋，鏡片完好</div>
                                <el-tag size="small" type="danger">外觀</el-tag>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-dialog>
<el-dialog v-model="signatureDialogVisible" title="客戶電子簽名" width="500px" center destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
            <div 
                class="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-dashed border-gray-300">
                <div class="w-full h-40 bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                    <!-- Placeholder for signature image -->
                    <el-icon class="text-6xl">
                        <EditPen></EditPen>
                    </el-icon>
                </div>
                <p class="text-sm text-gray-500">簽署時間: {{ currentSignatureTime }}</p>
                <p class="text-xs text-gray-400 mt-1">簽署人: {{ currentSignatureName }}</p>
            </div>
        </el-dialog>
<el-dialog v-model="cancelOrderDialogVisible" title="取消訂單" width="550px" center destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
            <div class="space-y-6">
                <div class="bg-orange-50 rounded-lg p-4 border border-orange-100 flex gap-3">
                    <el-icon class="text-orange-500 text-xl mt-0.5">
                        <WarningFilled></WarningFilled>
                    </el-icon>
                    <div>
                        <div class="font-bold text-gray-800 text-sm mb-1">訂單取消後將無法恢復</div>
                        <div class="text-xs text-gray-500">當前狀態: <span class="font-bold text-gray-700">{{
                                orderStatusText }}</span></div>
                        <div class="text-xs text-gray-500">當前距取車時間: <span class="font-bold text-gray-700">{{
                                cancelOrderData.timeDiffText }}</span></div>
                    </div>
                </div>

                <!-- Cancellation Type -->
                <div v-if="!isMonthlyBilling" class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div class="flex justify-between items-center mb-3">
                        <div class="text-sm text-gray-500">取消類型</div>
                        <div class="flex items-center gap-2">
                            <el-tag :type="cancelOrderData.type === 'free' ? 'success' : 'danger'" effect="dark">
                                {{ cancelOrderData.type === 'free' ? '免責取消' : '有責取消' }}
                            </el-tag>
                            <!-- Special Exemption Toggle -->
                            <el-checkbox v-if="cancelOrderData.originalType !== 'free'"
                                v-model="cancelOrderData.isExempt" @change="updateCancelFee" label="申請特殊減免" border
                                size="small" class="!mr-0 !ml-2" ></el-checkbox>
                        </div>
                    </div>

                    <!-- Fee Breakdown -->
                    <div class="space-y-2 border-t border-gray-200 border-dashed pt-3">
                        <div class="flex justify-between text-xs">
                            <span class="text-gray-500">{{ isMonthlyBilling ? '預計月結金額' : '已支付金額' }}</span>
                            <span class="font-mono">{{ formatNumber(cancelOrderData.paidAmount) }}</span>
                        </div>
                        <div class="flex justify-between text-xs">
                            <span class="text-gray-500">扣除取消費/手續費</span>
                            <span class="text-red-500 font-mono">-{{ formatNumber(cancelOrderData.cancelFee) }}</span>
                        </div>
                        <div v-if="!isMonthlyBilling" class="flex justify-between text-xs">
                            <span class="text-gray-500">預授權處理</span>
                            <span class="font-mono text-blue-600">{{ cancelOrderData.preAuthAction }}</span>
                        </div>
                        <div v-else class="flex justify-between text-xs">
                            <span class="text-gray-500">月結處理</span>
                            <span class="font-mono text-[color:var(--app-color-primary)]">{{ cancelOrderData.cancelFee > 0 ? '取消費進入企業賬單' : '不生成企業掛賬' }}</span>
                        </div>
                        <div class="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
                            <span class="text-gray-800">{{ isMonthlyBilling ? '企業掛賬金額' : '應退款金額' }}</span>
                            <span class="text-green-600 font-mono">¥{{ formatNumber(cancelOrderData.refundAmount)
                                }}</span>
                        </div>
                    </div>
                </div>
                <div v-else class="bg-[color:var(--app-color-primary-light-9)] p-4 rounded-lg border border-[color:var(--app-color-primary-light-8)]">
                    <div class="flex justify-between items-center mb-3">
                        <div class="text-sm text-[color:var(--app-color-primary-hover)] font-bold">企業月結取消處理</div>
                        <el-tag type="primary" color="var(--app-color-primary)" effect="dark" size="small">企業月結</el-tag>
                    </div>
                    <div class="space-y-2 border-t border-[color:var(--app-color-primary-light-8)] border-dashed pt-3">
                        <div class="flex justify-between text-xs">
                            <span class="text-[color:var(--app-color-primary)]">預計月結金額</span>
                            <span class="font-mono text-[color:var(--app-color-primary-hover)]">¥{{ formatNumber(cancelOrderData.paidAmount) }}</span>
                        </div>
                        <div class="flex justify-between text-xs">
                            <span class="text-[color:var(--app-color-primary)]">取消費</span>
                            <span class="font-mono text-[color:var(--app-color-primary-hover)]">¥{{ formatNumber(cancelOrderData.cancelFee) }}</span>
                        </div>
                        <div class="flex justify-between text-xs">
                            <span class="text-[color:var(--app-color-primary)]">客戶支付/預授權</span>
                            <span class="font-mono text-[color:var(--app-color-primary-hover)]">不處理</span>
                        </div>
                        <div class="flex justify-between text-sm font-bold pt-2 border-t border-[color:var(--app-color-primary-light-8)]">
                            <span class="text-[color:var(--app-color-primary-hover)]">企業掛賬金額</span>
                            <span class="text-[color:var(--app-color-primary-hover)] font-mono">¥{{ formatNumber(cancelOrderData.refundAmount) }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="cancelOrderData.isExempt" class="bg-blue-50 p-3 rounded text-xs text-blue-600 mb-2">
                    <el-icon class="mr-1 relative top-0.5">
                        <InfoFilled></InfoFilled>
                    </el-icon>
                    已啓用特殊減免，取消違約金已免除。請務必填寫減免原因。
                </div>

                <!-- Reason -->
                <div>
                    <div class="text-sm text-gray-600 mb-2">取消/減免原因</div>
                    <el-select v-model="cancelOrderData.reason" placeholder="請選擇原因" class="w-full mb-3">
                        <el-option label="行程變更" value="行程變更"></el-option>
                        <el-option label="價格問題" value="價格問題"></el-option>
                        <el-option label="預訂錯誤" value="預訂錯誤"></el-option>
                        <el-option v-if="cancelOrderData.isExempt" label="系統故障 (減免)" value="系統故障"></el-option>
                        <el-option v-if="cancelOrderData.isExempt" label="客戶投訴補償 (減免)" value="客戶投訴補償"></el-option>
                        <el-option label="其他" value="其他"></el-option>
                    </el-select>
                    <el-input type="textarea" v-model="cancelOrderData.remark" placeholder="備註詳情..."
                        :rows="3"></el-input>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="cancelOrderDialogVisible = false" class="flex-1">暫不取消</el-button>
                    <el-button type="danger" @click="confirmCancelOrder" class="flex-1">確認取消訂單</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="noShowDialogVisible" title="標記爽約" width="560px" center destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
            <div class="space-y-5">
                <div class="bg-red-50 rounded-lg p-4 border border-red-100 flex gap-3">
                    <el-icon class="text-red-500 text-xl mt-0.5">
                        <WarningFilled></WarningFilled>
                    </el-icon>
                    <div>
                        <div class="font-bold text-red-700 text-sm mb-1">確認客戶逾期未取並標記爽約</div>
                        <div class="text-xs text-red-600">確認後將釋放車輛資源，訂單進入“爽約”終態。</div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-500">預計取車時間</span>
                        <span class="font-mono text-gray-700">{{ noShowData.pickupTime }}</span>
                    </div>
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-500">保留時長</span>
                        <span class="font-mono text-gray-700">{{ noShowData.holdHours }} 小時</span>
                    </div>
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-500">爽約費</span>
                        <span class="text-red-500 font-mono">¥{{ formatNumber(noShowData.feeAmount) }}</span>
                    </div>
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-500">費用規則</span>
                        <span class="text-gray-700">固定金額</span>
                    </div>
                    <div v-if="!isMonthlyBilling" class="flex justify-between text-xs">
                        <span class="text-gray-500">預授權可扣</span>
                        <span class="font-mono text-blue-600">¥{{ formatNumber(noShowData.preAuthAmount) }}</span>
                    </div>
                    <div class="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
                        <span class="text-gray-800">{{ isMonthlyBilling ? '企業掛賬金額' : '待補繳金額' }}</span>
                        <span class="text-orange-600 font-mono">¥{{ formatNumber(noShowData.paymentDue) }}</span>
                    </div>
                </div>

                <div>
                    <div class="text-sm text-gray-600 mb-2">聯繫結果</div>
                    <el-select v-model="noShowData.reason" placeholder="請選擇聯繫結果" class="w-full mb-3">
                        <el-option label="客戶確認不取車" value="客戶確認不取車"></el-option>
                        <el-option label="多次聯繫無回應" value="多次聯繫無回應"></el-option>
                        <el-option label="客戶超時未到店" value="客戶超時未到店"></el-option>
                        <el-option label="其他" value="其他"></el-option>
                    </el-select>
                    <el-input type="textarea" v-model="noShowData.remark" placeholder="記錄聯繫時間、溝通結果或門店說明..."
                        :rows="3"></el-input>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="noShowDialogVisible = false" class="flex-1">暫不標記</el-button>
                    <el-button type="danger" @click="confirmNoShow" class="flex-1">確認標記爽約</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="rejectOrderDialogVisible" title="拒絕履約" width="560px" center destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
            <div class="space-y-5">
                <div class="bg-red-50 rounded-lg p-4 border border-red-100 flex gap-3">
                    <el-icon class="text-red-500 text-xl mt-0.5">
                        <WarningFilled></WarningFilled>
                    </el-icon>
                    <div>
                        <div class="font-bold text-red-700 text-sm mb-1">取車資質不通過，拒絕交車</div>
                        <div class="text-xs text-red-600">確認後將釋放車輛資源，訂單進入“已拒絕”終態。</div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                    <div class="flex items-center justify-between text-xs gap-3">
                        <span class="text-gray-500">拒絕履約費用</span>
                        <el-input-number v-model="rejectOrderData.feeAmount" :min="0" :step="50"
                            controls-position="right" size="small" class="!w-36"
                            @change="updateRejectFee"></el-input-number>
                    </div>
                    <div v-if="!isMonthlyBilling" class="flex justify-between text-xs">
                        <span class="text-gray-500">預授權處理</span>
                        <span class="font-mono text-blue-600">{{ rejectOrderData.preAuthAction }}</span>
                    </div>
                    <div class="flex justify-between text-xs" v-if="!isMonthlyBilling && rejectOrderData.paymentDue > 0">
                        <span class="text-gray-500">待補繳</span>
                        <span class="font-mono text-red-500">¥{{ formatNumber(rejectOrderData.paymentDue) }}</span>
                    </div>
                    <div class="flex justify-between text-xs" v-if="isMonthlyBilling && rejectOrderData.feeAmount > 0">
                        <span class="text-gray-500">企業掛賬</span>
                        <span class="font-mono text-[color:var(--app-color-primary)]">¥{{ formatNumber(rejectOrderData.feeAmount) }}</span>
                    </div>
                    <div class="text-xs text-gray-500 pt-2 border-t border-gray-100">
                        {{ isMonthlyBilling ? '企業月結訂單產生的拒絕履約費用統一進入企業賬單。' : '客戶責任可扣取費用；門店責任或風控無責場景釋放預授權。' }}
                    </div>
                </div>

                <div>
                    <div class="text-sm text-gray-600 mb-2">拒絕原因</div>
                    <el-select v-model="rejectOrderData.reason" placeholder="請選擇拒絕原因" class="w-full mb-3">
                        <el-option label="黑名單命中" value="黑名單命中"></el-option>
                        <el-option label="駕照過期" value="駕照過期"></el-option>
                        <el-option label="證件異常" value="證件異常"></el-option>
                        <el-option label="預授權失敗" value="預授權失敗"></el-option>
                        <el-option label="風控拒絕" value="風控拒絕"></el-option>
                        <el-option label="其他" value="其他"></el-option>
                    </el-select>
                    <el-input type="textarea" v-model="rejectOrderData.remark" placeholder="填寫拒絕說明、證件或風控結果..."
                        :rows="3"></el-input>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="rejectOrderDialogVisible = false" class="flex-1">返回取車</el-button>
                    <el-button type="danger" @click="confirmRejectOrder" class="flex-1">確認拒絕履約</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="closeOrderDialogVisible" title="關閉訂單" width="550px" center destroy-on-close append-to-body class="rounded-xl order-detail-overlay">
            <div class="space-y-6">
                <div class="bg-red-50 rounded-lg p-4 border border-red-100 flex gap-3 animate__animated animate__pulse">
                    <div class="text-red-500 text-3xl font-bold">!</div>
                    <div>
                        <div class="font-bold text-red-600 text-base mb-1">高風險操作警告</div>
                        <div class="text-xs text-red-500" v-if="!isMonthlyBilling">關閉訂單將<span 
                                class="font-bold underline">全額退還</span>所有已收款項，且操作不可逆！
                        </div>
                        <div class="text-xs text-red-500" v-else>企業月結訂單關閉後不生成企業掛賬，操作不可逆。
                        </div>
                    </div>
                </div>

                <!-- Refund Summary -->
                <div v-if="!isMonthlyBilling" class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div class="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">已收款項明細 (將全額退款)</div>
                    <div class="space-y-2 max-h-40 overflow-y-auto px-1 custom-scroll">
                        <template v-for="item in closeOrderData.refundItems" :key="item.id">
                            <div class="flex justify-between text-xs">
                                <span class="text-gray-500">{{ item.name }}</span>
                                <span class="font-mono text-gray-700">{{ formatNumber(item.amount) }}</span>
                            </div>
                        </template>
                        <div v-if="closeOrderData.refundItems.length === 0"
                            class="text-center text-gray-400 py-2 text-xs">
                            無可退款項</div>
                    </div>
                    <div class="flex justify-between text-base font-bold pt-3 mt-2 border-t border-gray-200">
                        <span class="text-gray-800">合計應退款</span>
                        <span class="text-red-500 font-mono">¥{{ formatNumber(closeOrderData.totalRefund) }}</span>
                    </div>
                    <div class="flex justify-between text-xs pt-2 mt-2 border-t border-gray-100">
                        <span class="text-gray-500">預授權處理</span>
                        <span class="font-mono text-blue-600">{{ closeOrderData.preAuthAction }}</span>
                    </div>
                </div>
                <div v-else class="bg-[color:var(--app-color-primary-light-9)] p-4 rounded-lg border border-[color:var(--app-color-primary-light-8)] text-sm text-[color:var(--app-color-primary-hover)]">
                    企業月結訂單關閉後釋放車輛資源，不向客戶退款，也不生成企業掛賬。
                </div>

                <!-- Reason -->
                <div>
                    <div class="text-sm text-gray-600 mb-2">關閉原因</div>
                    <el-select v-model="closeOrderData.reason" placeholder="請選擇原因" class="w-full mb-3">
                        <el-option label="車輛嚴重故障" value="車輛嚴重故障"></el-option>
                        <el-option label="客戶重大投訴" value="客戶重大投訴"></el-option>
                        <el-option label="不可抗力" value="不可抗力"></el-option>
                        <el-option label="其他" value="其他"></el-option>
                    </el-select>
                    <el-input type="textarea" v-model="closeOrderData.remark" placeholder="備註詳情..."
                        :rows="3"></el-input>
                </div>

                <div class="flex items-center gap-2">
                    <el-checkbox v-model="closeOrderData.confirmed" :label="isMonthlyBilling ? '我確認已與企業或客戶溝通並同意關閉訂單' : '我確認已與客戶溝通並同意全額退款'"
                        class="!mr-0 font-bold text-gray-700"></el-checkbox>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button @click="closeOrderDialogVisible = false" class="flex-1">取消</el-button>
                    <el-button type="danger" @click="confirmCloseOrder" class="flex-1"
                        :disabled="!closeOrderData.confirmed">確認關閉訂單</el-button>
                </div>
            </template>
        </el-dialog>
<el-dialog v-model="snapshotVersionDialogVisible" title="快照版本詳情" width="760px" destroy-on-close append-to-body class="order-detail-overlay">
            <div v-if="selectedSnapshotVersion" class="space-y-4">
                <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <div class="text-xs text-gray-400 mb-1">版本號</div>
                            <div class="font-mono font-bold text-gray-900">{{ selectedSnapshotVersion.version }}</div>
                            <div class="text-sm text-gray-700 mt-2">{{ selectedSnapshotVersion.summary }}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <el-tag :type="selectedSnapshotVersion.snapshotLevel === 'event' ? 'warning' : 'info'" effect="plain">
                                {{ selectedSnapshotVersion.snapshotLevel === 'event' ? '事件級快照' : '訂單基線快照' }}
                            </el-tag>
                            <el-tag type="info" effect="plain">{{ selectedSnapshotVersion.sourcePage }}</el-tag>
                        </div>
                    </div>
                </div>

                <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="版本名稱">{{ selectedSnapshotVersion.title }}</el-descriptions-item>
                    <el-descriptions-item label="快照時間">{{ selectedSnapshotVersion.snapshotTime }}</el-descriptions-item>
                    <el-descriptions-item label="生效範圍">{{ selectedSnapshotVersion.scope }}</el-descriptions-item>
                    <el-descriptions-item v-if="selectedSnapshotVersion.snapshotLevel === 'event'" label="事件類型">{{ selectedSnapshotVersion.eventType }}</el-descriptions-item>
                </el-descriptions>

                <div v-if="selectedSnapshotVersion.detailType === 'price'">
                    <div class="font-bold text-gray-800 mb-2">門市標準價</div>
                    <el-table :data="selectedSnapshotVersion.priceRows" border size="small">
                        <el-table-column prop="group" label="車組名稱" min-width="140" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="models" label="車型明細" min-width="180" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="dailyPrice" label="標準日租金 (元/天)" width="150" align="center" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="mileageRule" label="里程規則" min-width="220" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="lastUpdated" label="上次更新" width="120" align="center"></el-table-column>
                    </el-table>
                </div>

                <div v-else-if="selectedSnapshotVersion.detailType === 'marketing'" class="space-y-4">
                    <div class="font-bold text-gray-800">方案基礎信息</div>
                    <el-table :data="selectedSnapshotVersion.basicInfo" border size="small">
                        <el-table-column prop="label" label="配置項" width="170" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="value" label="內容" min-width="300" show-overflow-tooltip></el-table-column>
                    </el-table>
                    <div>
                        <div class="font-bold text-gray-800 mb-2">規則詳情</div>
                        <el-table :data="selectedSnapshotVersion.ruleRows" border size="small">
                            <el-table-column prop="name" label="規則名稱" width="150" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="salesWindow" label="下單時間" min-width="150" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="useWindow" label="用車時間" min-width="170" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="advanceBooking" label="提前預訂" width="110" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="carGroup" label="適用車組" min-width="140" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="membership" label="會員方案" min-width="140" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="rentalTerm" label="租期限制" width="110" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="locationScope" label="適用地區/門店" min-width="180" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="action" label="優惠動作" min-width="220" show-overflow-tooltip></el-table-column>
                        </el-table>
                    </div>
                </div>

                <div v-else-if="selectedSnapshotVersion.detailType === 'rules'" class="space-y-3">
                    <el-table :data="getRuleSectionRows(selectedSnapshotVersion)" border size="small">
                        <el-table-column prop="section" label="分組" width="150" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="label" label="規則項" width="180" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="value" label="設定值" min-width="280" show-overflow-tooltip></el-table-column>
                    </el-table>
                </div>

                <div v-else-if="selectedSnapshotVersion.detailType === 'event'" class="space-y-4">
                    <el-table :data="getEventSummaryRows(selectedSnapshotVersion)" border size="small">
                        <el-table-column prop="label" label="項目" width="150"></el-table-column>
                        <el-table-column prop="value" label="內容" min-width="340" show-overflow-tooltip></el-table-column>
                    </el-table>
                    <div v-if="selectedSnapshotVersion.versionRows?.length">
                        <div class="font-bold text-gray-800 mb-2">命中版本</div>
                        <el-table :data="selectedSnapshotVersion.versionRows" border size="small">
                            <el-table-column prop="label" label="版本項" min-width="150" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="version" label="版本號" min-width="170" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="remark" label="說明" min-width="260" show-overflow-tooltip></el-table-column>
                        </el-table>
                    </div>
                    <div>
                        <div class="font-bold text-gray-800 mb-2">商業條件變化</div>
                        <el-table :data="selectedSnapshotVersion.beforeAfterRows" border size="small">
                            <el-table-column prop="label" label="變更項" min-width="130" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="before" label="變更前" min-width="220" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="after" label="變更後" min-width="220" show-overflow-tooltip></el-table-column>
                        </el-table>
                    </div>
                    <div>
                        <div class="font-bold text-gray-800 mb-2">差額結果</div>
                        <el-table :data="selectedSnapshotVersion.amountRows" border size="small">
                            <el-table-column prop="label" label="項目" min-width="150" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="amount" label="金額/結果" min-width="150" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="remark" label="說明" min-width="260" show-overflow-tooltip></el-table-column>
                        </el-table>
                    </div>
                </div>

                <div v-else>
                    <div class="font-bold text-gray-800 mb-2">增值服務</div>
                    <el-table :data="selectedSnapshotVersion.serviceRows" border size="small">
                        <el-table-column prop="name" label="服務/規則項" min-width="160" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="billing" label="計費方式" width="140" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="price" label="單價/規則值" min-width="180" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="remark" label="快照說明" min-width="220" show-overflow-tooltip></el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <el-button @click="snapshotVersionDialogVisible = false">關閉</el-button>
            </template>
        </el-dialog>
</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
// 依赖：vue3 + element-plus + @element-plus/icons-vue（使用方自行安装）
import 'element-plus/dist/index.css';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { Clock, Iphone, ArrowDown, User, Van, Calendar, Right, Connection, CircleCheck, DataLine, Warning, Picture, Document, CreditCard, ArrowRight, Tickets, CaretRight, List, Back, Plus, WarningFilled, CircleCheckFilled, Check, UserFilled, Phone, Postcard, DocumentChecked, Present, Discount, Wallet, Ticket, Star, Money, InfoFilled, OfficeBuilding, EditPen, Loading, Promotion, Refresh, Edit, RefreshLeft, Bell, Upload, UploadFilled, Close, CameraFilled, CirclePlus, Printer, Timer, Odometer, Position, Monitor, Operation, More, Delete, Download, ArrowLeft, Lock } from '@element-plus/icons-vue';
// 如需主题跟随，宿主需在 <html> 上维护 data-theme='light' | 'dark'。



        
// Formatting
                const formatNumber = (num) => {
                    return Math.abs(num).toLocaleString();
                };

                const getFuelColor = (fuel) => {
                    const val = parseInt(fuel);
                    if (val > 50) return '#10b981';
                    if (val > 20) return '#f59e0b';
                    return '#ef4444';
                };

                const initialUrlParams = new URLSearchParams(window.location.search);
                const activeOrderId = initialUrlParams.get('id') || 'ZT24050500001';
                const mockOrderDetails = {
                    ZT2405060002: {
                        orderId: 'ZT2405060002',
                        createTime: '2024-05-05 14:30',
                        source: '門市櫃檯',
                        serviceMode: 'store_staffed',
                        status: 'reserved',
                        clientType: 'corporate',
                        billingMode: 'customer_pay',
                        paymentStatus: 'deposit_paid',
                        customer: { name: '王小明', phone: '0912-345-678', level: '金牌會員', memberNo: 'A123456789', dept: '銷售部' },
                        corporate: { name: 'Google Taiwan', shortName: 'Google', billingType: '員工自付' },
                        vehicle: { plate: 'RIMO-888', group: 'SUV組', model: 'Toyota RAV4', mileage: '12,450 km', seats: '5座', transmission: '自排', energy: '汽油', dispatchStatus: '已硬鎖定', currentStation: '新北總店 B1 交車區' },
                        schedule: { start: '2024/05/07 09:30', end: '2024/05/10 18:00' },
                        location: { pickup: '新北總店 - 新北市中正區中正路10號', return: '新北總店 - 新北市中正區中正路10號' },
                        locationStatus: { pickupStore: 'normal', pickupStation: 'normal', returnStore: 'normal', returnStation: 'normal' },
                        amount: 1920,
                        promotionText: 'Google 企業資格行銷方案',
                        eventSnapshots: [
                            {
                                key: 'event_period_adjust',
                                snapshotLevel: 'event',
                                title: '預約後改租期',
                                version: 'EVT-PERIOD-20240506-001',
                                eventType: '改租期',
                                summary: '客戶延後取車 2 小時並延長還車至 2024/05/10 18:00，新增租金 ¥360',
                                meta: '改租期只重算變更部分，不回改原訂單基線金額',
                                sourcePage: '訂單詳情 / 編輯訂單',
                                snapshotTime: '2024-05-06 08:42',
                                scope: '預約編輯事件',
                                savedBy: '客服主管',
                                detailType: 'event',
                                triggerText: '客戶來電調整取還車時間，訂單重新試算租期差額',
                                settlementTarget: '取車尾款補收',
                                versionRows: [
                                    { label: '標準價版本', version: 'PRICE-STORE-20260418-001', remark: '變更後的 SUV 車組仍沿用當前門市標準價版本' },
                                    { label: '行銷方案版本', version: 'MKT-STORE-CORP-20260418-002', remark: '企業資格方案繼續生效，不重新選擇方案' },
                                    { label: '租賃規則版本', version: 'RULE-STORE-20260418-002', remark: '按改租期事件時生效的租賃規則試算差額' }
                                ],
                                beforeAfterRows: [
                                    { label: '取車時間', before: '2024/05/07 07:30', after: '2024/05/07 09:30' },
                                    { label: '還車時間', before: '2024/05/10 16:00', after: '2024/05/10 18:00' },
                                    { label: '租期結果', before: '3 天 8.5 小時', after: '3 天 8.5 小時 + 晚間時段補價' }
                                ],
                                amountRows: [
                                    { label: '原訂單金額', amount: '¥1,560', remark: '下單基線快照金額' },
                                    { label: '改租期差額', amount: '¥360', remark: '僅本次變更部分新增金額' },
                                    { label: '當前訂單總額', amount: '¥1,920', remark: '更新後的訂單應收' }
                                ],
                                eventNote: '改租期事件級快照需要同時保留變更前後取還車時間和差額結果，供取車尾款、客服解釋和後續結算追溯。'
                            }
                        ]
                    },
                    ZT2405060010: {
                        orderId: 'ZT2405060010',
                        createTime: '2024-05-05 16:10',
                        source: 'APP 自助下單',
                        serviceMode: 'self_service',
                        status: 'reserved',
                        clientType: 'personal',
                        billingMode: 'customer_pay',
                        paymentStatus: 'deposit_paid',
                        customer: { name: '林佳琪', phone: '0968-222-555', level: '金牌會員', memberNo: 'B240506010', dept: '' },
                        corporate: null,
                        vehicle: { plate: 'RIMO-206', group: '經濟車組', model: 'Toyota Yaris', mileage: '12,468 km', seats: '5座', transmission: '自排', energy: '汽油', dispatchStatus: '已硬鎖定', currentStation: '新北總店 P3 自助據點' },
                        telematics: {
                            pickup: { mileage: 12468, fuel: 7, syncAt: '2024-05-07 10:52' },
                            return: { mileage: 12468, fuel: 7, syncAt: '2024-05-07 10:52' }
                        },
                        schedule: { start: '2024/05/07 11:00', end: '2024/05/09 11:00' },
                        location: {
                            pickup: '新北總店 - 新北市中正區中正路10號',
                            pickupStationName: '新北總店 P3 自助據點',
                            return: '新北總店 - 新北市中正區中正路10號',
                            returnStationName: '新北總店 P3 自助據點',
                            returnStationId: 'banqiao_p3'
                        },
                        locationStatus: { pickupStore: 'normal', pickupStation: 'normal', returnStore: 'closed', returnStation: 'closed' },
                        amount: 3200,
                        promotionText: '夜間自助租車方案',
                        eventSnapshots: []
                    },
                    ZT2405040016: {
                        orderId: 'ZT2405040016',
                        createTime: '2024-05-04 09:10',
                        source: 'APP 自助下單',
                        serviceMode: 'self_service',
                        status: 'renting',
                        clientType: 'personal',
                        billingMode: 'customer_pay',
                        paymentStatus: 'paid',
                        customer: { name: '陳柏翰', phone: '0910-668-225', level: '白金會員', memberNo: 'B240504016', dept: '' },
                        corporate: null,
                        vehicle: { plate: 'RIMO-515', group: 'SUV組', model: 'Toyota RAV4', mileage: '18,420 km', seats: '5座', transmission: '自排', energy: '汽油', dispatchStatus: '已硬鎖定', currentStation: '新北總店 P3 自助據點' },
                        telematics: {
                            pickup: { mileage: 18420, fuel: 7, syncAt: '2024-05-04 09:58' },
                            return: { mileage: 18960, fuel: 5, syncAt: '2024-05-06 19:48' }
                        },
                        schedule: { start: '2024/05/04 10:00', end: '2024/05/06 20:00' },
                        location: {
                            pickup: '新北總店 - 新北市中正區中正路10號',
                            pickupStationName: '新北總店 P3 自助據點',
                            return: '臺北車站店 - 臺北市中正區忠孝西路1號',
                            returnStationName: '臺北車站店 B2 自助還車點',
                            returnStationId: 'taipei_b2'
                        },
                        locationStatus: { pickupStore: 'normal', pickupStation: 'normal', returnStore: 'normal', returnStation: 'normal' },
                        amount: 2480,
                        promotionText: '週末夜間自助方案',
                        eventSnapshots: [
                            {
                                key: 'event_return_station_change',
                                snapshotLevel: 'event',
                                title: '改還車據點差額',
                                version: 'EVT-RETURN-STATION-20240505-001',
                                eventType: '改還車據點',
                                summary: '還車據點由新北總店 P3 自助據點改爲臺北車站店 B2 自助還車點，異地還車費調增 ¥300',
                                meta: '跨門市改據點時先更新還車門市，再按門市口徑重算異地費差額',
                                sourcePage: '訂單詳情 / 改還車據點',
                                snapshotTime: '2024-05-05 21:05',
                                scope: '還車站點變更事件',
                                savedBy: '客服專員',
                                detailType: 'event',
                                triggerText: '客戶申請改到臺北車站店自助還車，客服協助調整還車據點',
                                settlementTarget: '還車結算補收',
                                versionRows: [
                                    { label: '租賃規則版本', version: 'RULE-STORE-20260418-002', remark: '異地還車費按事件發生時生效的門市規則計算' },
                                    { label: '服務價格版本', version: 'SVC-20260418-001', remark: '異地還車服務費版本' }
                                ],
                                beforeAfterRows: [
                                    { label: '還車門市/據點', before: '新北總店 / 新北總店 P3 自助據點', after: '臺北車站店 / 臺北車站店 B2 自助還車點' },
                                    { label: '費用口徑', before: '同門市自助還車，不產生差額', after: '跨門市自助還車，按門市差額重算' },
                                    { label: '後續衝突', before: '無臺北站佔用', after: '已完成後續訂單衝突釋放' }
                                ],
                                amountRows: [
                                    { label: '原異地還車費', amount: '¥0', remark: '原約定還車據點與取車門市一致' },
                                    { label: '新異地還車費', amount: '¥300', remark: '取車門市到新還車門市的差額費用' },
                                    { label: '待收差額', amount: '¥300', remark: '併入還車結算處理' }
                                ],
                                eventNote: '同門市內僅調整自助據點時不生成計費快照；只有跨門市導致異地費或調度費差額變化時，才生成事件級快照。'
                            }
                        ]
                    },
                    ZT2405060003: {
                        orderId: 'ZT2405060003',
                        createTime: '2024-05-06 08:50',
                        source: '門市櫃檯',
                        serviceMode: 'store_staffed',
                        status: 'inspecting',
                        clientType: 'corporate',
                        billingMode: 'customer_pay',
                        paymentStatus: 'partial_paid',
                        customer: { name: '李小花', phone: '0922-333-444', level: '普通會員', memberNo: 'A987654321', dept: '研發部' },
                        corporate: { name: 'TSMC 臺積電', shortName: 'TSMC', billingType: '員工自付' },
                        vehicle: { plate: 'RIMO-123', group: '豪華車組', model: 'BMW 3 Series', mileage: '8,260 km', seats: '5座', transmission: '自排', energy: '汽油', dispatchStatus: '已硬鎖定', currentStation: '臺北車站店 A 區停車場' },
                        schedule: { start: '2024/05/06 09:00', end: '2024/05/08 09:00' },
                        location: { pickup: '臺北車站店 - 臺北市中正區忠孝西路1號', return: '臺北車站店 - 臺北市中正區忠孝西路1號' },
                        locationStatus: { pickupStore: 'normal', pickupStation: 'normal', returnStore: 'normal', returnStation: 'normal' },
                        amount: 4500,
                        promotionText: 'TSMC 企業資格行銷方案',
                        eventSnapshots: [
                            {
                                key: 'event_group_change',
                                snapshotLevel: 'event',
                                title: '改車組重計價',
                                version: 'EVT-GROUP-20240506-001',
                                eventType: '改車組',
                                summary: '原豪華車組車輛臨時不可交付，改爲商務車組免費升等，差額 ¥0',
                                meta: '同車組換車不生成計費快照；僅改車組、升降級才生成事件級快照',
                                sourcePage: '訂單詳情 / 改派',
                                snapshotTime: '2024-05-06 08:56',
                                scope: '取車前改派事件',
                                savedBy: '臺北車站店店長',
                                detailType: 'event',
                                triggerText: '原車輛臨時送保養，門店改派爲商務車組並執行免費升等',
                                settlementTarget: '不調整客戶應收',
                                versionRows: [
                                    { label: '標準價版本', version: 'PRICE-STORE-20260418-001', remark: '按改車組事件時的目標車組標準價進行差額試算' },
                                    { label: '行銷方案版本', version: 'MKT-STORE-CORP-20260418-002', remark: '企業資格方案繼續沿用' },
                                    { label: '租賃規則版本', version: 'RULE-STORE-20260418-002', remark: '改車組差額處理口徑' }
                                ],
                                beforeAfterRows: [
                                    { label: '原預約車組', before: '豪華車組 / BMW 3 Series', after: '商務車組 / Lexus ES' },
                                    { label: '差價處理', before: '未發生', after: '免費升等，不向客戶收差額' },
                                    { label: '履約車輛', before: 'RIMO-123', after: 'RIMO-625' }
                                ],
                                amountRows: [
                                    { label: '原車組金額', amount: '¥4,500', remark: '按豪華車組基線快照生成' },
                                    { label: '改車組差額', amount: '¥0', remark: '門店執行免費升等' },
                                    { label: '企業結算結果', amount: '¥4,500', remark: '不變更客戶應收與企業掛賬' }
                                ],
                                eventNote: '改車組屬於商業條件變化，必須生成事件級快照；即使最終差額爲 0，也要記錄原車組、目標車組、版本號和差價處理方式。'
                            }
                        ]
                    },
                    ZT2405040003: {
                        orderId: 'ZT2405040003',
                        createTime: '2024-05-04 14:20',
                        source: 'APP 下單',
                        serviceMode: 'store_staffed',
                        status: 'renting',
                        clientType: 'personal',
                        billingMode: 'customer_pay',
                        paymentStatus: 'paid',
                        customer: { name: '李阿美', phone: '0922-123-456', level: '普通會員', memberNo: 'P240504003', dept: '' },
                        corporate: null,
                        vehicle: { plate: 'RIMO-101', group: '經濟型', model: 'Toyota Corolla', mileage: '13,280 km', seats: '5座', transmission: '自排', energy: '汽油', dispatchStatus: '已硬鎖定', currentStation: '臺北車站店 A 區停車場' },
                        schedule: { start: '2024/05/04 15:00', end: '2024/05/07 10:00' },
                        location: { pickup: '臺北車站店 - 臺北市中正區忠孝西路1號', return: '新北總店 - 新北市中正區中正路10號' },
                        locationStatus: { pickupStore: 'normal', pickupStation: 'normal', returnStore: 'normal', returnStation: 'normal' },
                        amount: 850,
                        promotionText: '學生專案行銷方案',
                        eventSnapshots: [
                            {
                                key: 'event_promo_adjust',
                                snapshotLevel: 'event',
                                title: '取車更換行銷方案',
                                version: 'EVT-PROMO-20240504-001',
                                eventType: '行銷方案調整',
                                summary: '學生專案未通過到店覈驗，改爲會員行銷方案，取車尾款補收 ¥120',
                                meta: '僅調整方案差額，不改寫訂單基線方案快照',
                                sourcePage: '訂單詳情 / 取車',
                                snapshotTime: '2024-05-04 15:18',
                                scope: '取車資格覈驗事件',
                                savedBy: '臺北車站店店員',
                                detailType: 'event',
                                triggerText: '客戶未提供學生證明文件，門店改用會員方案繼續發車',
                                settlementTarget: '取車尾款補收',
                                versionRows: [
                                    { label: '行銷方案原版本', version: 'MKT-STORE-STUDENT-20260418-001', remark: '下單基線方案版本' },
                                    { label: '行銷方案新版本', version: 'MKT-STORE-MEMBER-20260418-001', remark: '取車時改用會員方案' },
                                    { label: '租賃規則版本', version: 'RULE-STORE-20260418-002', remark: '按取車事件時的規則重算尾款' }
                                ],
                                beforeAfterRows: [
                                    { label: '行銷方案', before: '學生專案行銷方案 (9折)', after: '會員行銷方案 (95折)' },
                                    { label: '到店覈驗', before: '需上傳學生證或在學證明', after: '改爲普通會員資格，無額外證明' },
                                    { label: '優惠結果', before: '預計優惠 ¥270', after: '預計優惠 ¥150' }
                                ],
                                amountRows: [
                                    { label: '原方案優惠', amount: '¥270', remark: '基線快照保留原方案版本與優惠結果' },
                                    { label: '新方案優惠', amount: '¥150', remark: '按取車時實際生效方案重算' },
                                    { label: '補收差額', amount: '¥120', remark: '併入取車尾款收取' }
                                ],
                                eventNote: '該事件只覆蓋本次方案變更影響的差額。訂單創建時保存的行銷方案基線快照仍保留，用於還原客戶原始預約承諾。'
                            }
                        ]
                    },
                    ZT2405020008: {
                        orderId: 'ZT2405020008',
                        createTime: '2024-05-02 10:00',
                        source: 'APP 下單',
                        serviceMode: 'store_staffed',
                        status: 'renewing',
                        clientType: 'personal',
                        billingMode: 'customer_pay',
                        paymentStatus: 'paid',
                        customer: { name: '趙強', phone: '0933-111-222', level: '白金會員', memberNo: 'P240502008', dept: '' },
                        corporate: null,
                        vehicle: { plate: 'RIMO-777', group: '商務車組', model: 'Honda Odyssey', mileage: '22,410 km', seats: '7座', transmission: '自排', energy: '汽油', dispatchStatus: '已人工改派', currentStation: '新北總店 B1 交車區' },
                        schedule: { start: '2024/05/02 11:00', end: '2024/05/09 11:00' },
                        location: { pickup: '新北總店 - 新北市中正區中正路10號', return: '新北總店 - 新北市中正區中正路10號' },
                        locationStatus: { pickupStore: 'normal', pickupStation: 'normal', returnStore: 'normal', returnStation: 'normal' },
                        amount: 5600,
                        promotionText: '會員行銷方案',
                        eventSnapshots: [
                            {
                                key: 'event_extend_pricing',
                                snapshotLevel: 'event',
                                title: '續租重計價',
                                version: 'EVT-EXTEND-20240505-001',
                                eventType: '續租',
                                summary: '還車時間由 2024/05/07 11:00 延至 2024/05/09 11:00，新增租金 ¥1,600',
                                meta: '僅對新增租期按續租事件命中的價格與規則計價',
                                sourcePage: '訂單詳情 / 延長用車',
                                snapshotTime: '2024-05-05 19:26',
                                scope: '續租事件',
                                savedBy: '新北總店店員',
                                detailType: 'event',
                                triggerText: '客戶確認續租 2 天，系統重算新增租期差額',
                                settlementTarget: '還車結算補收',
                                versionRows: [
                                    { label: '標準價版本', version: 'PRICE-STORE-20260418-001', remark: '新增租期仍按商務車組標準價版本試算' },
                                    { label: '行銷方案版本', version: 'MKT-STORE-MEMBER-20260418-001', remark: '續租部分繼續沿用會員方案版本' },
                                    { label: '租賃規則版本', version: 'RULE-STORE-20260418-002', remark: '按續租事件時的規則試算新增租期' }
                                ],
                                beforeAfterRows: [
                                    { label: '還車時間', before: '2024/05/07 11:00', after: '2024/05/09 11:00' },
                                    { label: '計費天數', before: '5 天', after: '7 天' },
                                    { label: '事件價格口徑', before: '沿用訂單基線部分', after: '新增 2 天按續租事件價格計算' }
                                ],
                                amountRows: [
                                    { label: '原訂單金額', amount: '¥4,000', remark: '下單基線快照部分不回改' },
                                    { label: '新增租期金額', amount: '¥1,600', remark: '按續租事件快照寫入' },
                                    { label: '當前訂單總額', amount: '¥5,600', remark: '作爲後續還車結算基礎' }
                                ],
                                eventNote: '續租事件快照只覆蓋新增租期部分，原訂單基線金額、原規則版本和原優惠方案不被覆蓋。'
                            }
                        ]
                    },
                    ZT2405010022: {
                        orderId: 'ZT2405010022',
                        createTime: '2024-05-01 10:30',
                        source: 'APP 下單',
                        serviceMode: 'store_staffed',
                        status: 'payment_due',
                        clientType: 'personal',
                        billingMode: 'customer_pay',
                        paymentStatus: 'payment_due',
                        customer: { name: '鄭錢', phone: '0966-123-123', level: '普通會員', memberNo: 'P240501022', dept: '' },
                        corporate: null,
                        vehicle: { plate: 'RIMO-300', group: '豪華車組', model: 'Benz C300', mileage: '16,090 km', seats: '5座', transmission: '自排', energy: '汽油', dispatchStatus: '已硬鎖定', currentStation: '新北總店 B1 交車區' },
                        schedule: { start: '2024/05/01 14:00', end: '2024/05/04 14:00' },
                        location: { pickup: '新北總店 - 新北市中正區中正路10號', return: '新北總店 - 新北市中正區中正路10號' },
                        locationStatus: { pickupStore: 'normal', pickupStation: 'normal', returnStore: 'normal', returnStation: 'normal' },
                        amount: 4800,
                        promotionText: '會員行銷方案',
                        eventSnapshots: [
                            {
                                key: 'event_overtime_settlement',
                                snapshotLevel: 'event',
                                title: '逾時重計費',
                                version: 'EVT-RETURN-20240504-001',
                                eventType: '逾時結算',
                                summary: '實際還車晚於約定 3 小時 20 分，按超時階梯重計費，待補繳 ¥600',
                                meta: '事件快照記錄本次逾時命中結果和差額，不改寫訂單基線規則快照',
                                sourcePage: '訂單詳情 / 還車結算',
                                snapshotTime: '2024-05-04 17:26',
                                scope: '還車結算事件',
                                savedBy: '新北總店店員',
                                detailType: 'event',
                                triggerText: '實際還車時間 2024/05/04 17:20，超過約定還車時間 3 小時 20 分',
                                settlementTarget: '還車補繳',
                                versionRows: [
                                    { label: '標準價版本', version: 'PRICE-STORE-20260418-001', remark: '超時小時費率按當前車組標準價版本計算' },
                                    { label: '租賃規則版本', version: 'RULE-STORE-20260418-002', remark: '命中不足 1 小時按 1 小時、5 小時轉日租閾值' }
                                ],
                                beforeAfterRows: [
                                    { label: '約定還車時間', before: '2024/05/04 14:00', after: '2024/05/04 17:20' },
                                    { label: '逾時時長', before: '0 小時', after: '3 小時 20 分' },
                                    { label: '計費口徑', before: '僅按原訂單租期計費', after: '超出部分按小時費率重算' }
                                ],
                                amountRows: [
                                    { label: '原訂單金額', amount: '¥4,200', remark: '基線快照部分保持不變' },
                                    { label: '逾時費用', amount: '¥600', remark: '本次事件新增差額' },
                                    { label: '待補繳金額', amount: '¥600', remark: '進入還車結算待收' }
                                ],
                                eventNote: '逾時規則定義仍可在訂單基線規則快照中查看；事件級快照只記錄本次實際逾時時長、階梯命中結果和應收差額。'
                            }
                        ]
                    }
                };
                const urlClientType = initialUrlParams.get('clientType');
                const fallbackClientType = urlClientType === 'corporate' ? 'corporate' : 'personal';
                const selectedOrderSeed = mockOrderDetails[activeOrderId] || {
                    orderId: activeOrderId,
                    createTime: '2024-05-01 09:30',
                    source: 'iOS App 1.0.11',
                    serviceMode: initialUrlParams.get('serviceMode') || initialUrlParams.get('mode') || 'store_staffed',
                    status: initialUrlParams.get('status') || 'reserved',
                    clientType: fallbackClientType,
                    billingMode: initialUrlParams.get('billing') === 'monthly' ? 'monthly' : 'customer_pay',
                    paymentStatus: initialUrlParams.get('paymentStatus') || (
                        initialUrlParams.get('billing') === 'monthly'
                            ? 'monthly_billing'
                            : ((initialUrlParams.get('status') === 'pending_payment' || initialUrlParams.get('action') === 'pay') ? 'unpaid' : 'deposit_paid')
                    ),
                    customer: {
                        name: initialUrlParams.get('customerName') || '王小明',
                        phone: initialUrlParams.get('customerPhone') || '0912-345-678',
                        level: initialUrlParams.get('customerLevel') || '金牌會員',
                        memberNo: 'A123456789',
                        dept: initialUrlParams.get('department') || ''
                    },
                    corporate: fallbackClientType === 'corporate' ? {
                        name: initialUrlParams.get('corporateName') || '企業客戶',
                        shortName: initialUrlParams.get('corporateShortName') || '企業',
                        billingType: initialUrlParams.get('billing') === 'monthly' ? '企業月結' : '員工自付'
                    } : null,
                    vehicle: {
                        plate: initialUrlParams.get('vehiclePlate') || 'ABC-1234',
                        group: initialUrlParams.get('vehicleGroup') || '豪華轎車組',
                        model: initialUrlParams.get('vehicleModel') || 'Toyota Corolla',
                        mileage: '12,450 km',
                        seats: '5座',
                        transmission: '自排',
                        energy: '汽油',
                        dispatchStatus: initialUrlParams.get('dispatchStatusText') || '已派車',
                        currentStation: initialUrlParams.get('vehicleStation') ||
                            (initialUrlParams.get('vehiclePlate') === '未分配' || initialUrlParams.get('dispatchStatusText') === '待派車' ? '' : '新北總店 B1 交車區')
                    },
                    schedule: {
                        start: initialUrlParams.get('scheduleStart') || '2024/05/05 11:11',
                        end: initialUrlParams.get('scheduleEnd') || '2024/05/05 15:11'
                    },
                    location: {
                        pickup: initialUrlParams.get('pickupLocation') || '新北站 - 新北市中正區中正路10號',
                        pickupStationName: initialUrlParams.get('pickupStationName') || '',
                        return: initialUrlParams.get('returnLocation') || '新北站 - 新北市中正區中正路10號',
                        returnStationName: initialUrlParams.get('returnStationName') || '',
                        returnStationId: initialUrlParams.get('returnStationId') || ''
                    },
                    locationStatus: {
                        pickupStore: initialUrlParams.get('pickupStoreStatus') || 'normal',
                        pickupStation: initialUrlParams.get('pickupStationStatus') || 'normal',
                        returnStore: initialUrlParams.get('returnStoreStatus') || 'normal',
                        returnStation: initialUrlParams.get('returnStationStatus') || 'normal'
                    },
                    amount: Number(initialUrlParams.get('amount')) || 1920,
                    promotionText: fallbackClientType === 'corporate' ? '企業資格行銷方案' : '學生專案行銷方案',
                    eventSnapshots: []
                };
                const orderView = reactive(selectedOrderSeed);
                document.title = `訂單詳情 - ${orderView.orderId} - RIMO Admin`;
                const billingMode = ref(orderView.billingMode === 'monthly' ? 'monthly' : 'customer_pay');
                const isMonthlyBilling = computed(() => billingMode.value === 'monthly');
                const serviceMode = computed(() => orderView.serviceMode === 'self_service' ? 'self_service' : 'store_staffed');
                const isSelfServiceOrder = computed(() => serviceMode.value === 'self_service');
                const orderTypeText = computed(() => orderView.clientType === 'corporate' ? '企業訂單' : '個人訂單');
                const dispatchStatusText = computed(() => orderView.vehicle?.dispatchStatus || '待派車');
                const pickupVehicleStationText = computed(() => orderView.vehicle?.currentStation || '派車後顯示車輛所在據點');
                const parseMetricNumber = (value) => {
                    const num = Number(value);
                    return Number.isFinite(num) ? num : null;
                };
                const getTelematicsMetricValue = (phase, key, fallback) => {
                    const num = parseMetricNumber(orderView.telematics?.[phase]?.[key]);
                    return num ?? fallback;
                };
                const pickupTelematicsSnapshot = computed(() => isSelfServiceOrder.value ? (orderView.telematics?.pickup || null) : null);
                const returnTelematicsSnapshot = computed(() => isSelfServiceOrder.value ? (orderView.telematics?.return || null) : null);
                const hasPickupTelematics = computed(() => parseMetricNumber(pickupTelematicsSnapshot.value?.mileage) !== null && parseMetricNumber(pickupTelematicsSnapshot.value?.fuel) !== null);
                const hasReturnTelematics = computed(() => parseMetricNumber(returnTelematicsSnapshot.value?.mileage) !== null && parseMetricNumber(returnTelematicsSnapshot.value?.fuel) !== null);
                const splitStoreAddress = (locationText) => {
                    const parts = (locationText || '').split(' - ');
                    return {
                        storeName: parts[0] || '-',
                        address: parts.slice(1).join(' - ')
                    };
                };
                const getStationShortName = (stationName, storeName) => {
                    if (!stationName || stationName === '派車後顯示車輛所在據點') return '';
                    return stationName.replace(storeName, '').replace(/^[-\s]+/, '').trim() || stationName;
                };
                const formatStoreStationAddress = (locationText, stationName) => {
                    const { storeName, address } = splitStoreAddress(locationText);
                    const shortStationName = getStationShortName(stationName, storeName);
                    return [storeName, shortStationName, address].filter(Boolean).join(' - ');
                };
                const locationStatusMetaMap = {
                    normal: { label: '正常', type: 'success' },
                    paused: { label: '已暫停', type: 'warning' },
                    closed: { label: '已關閉', type: 'danger' }
                };
                const getLocationStatusMeta = (status) => locationStatusMetaMap[status] || locationStatusMetaMap.normal;
                const buildLocationNotice = (storeStatus, stationStatus) => {
                    if ([storeStatus, stationStatus].includes('closed')) return '站點已關閉，請聯繫客服處理';
                    if ([storeStatus, stationStatus].includes('paused')) return '站點已暫停，請聯繫客服處理';
                    return '';
                };
                const pickupPlanStationText = computed(() => isSelfServiceOrder.value
                    ? (orderView.location.pickupStationName || '')
                    : (orderView.vehicle?.currentStation || '')
                );
                const pickupStoreStatusMeta = computed(() => getLocationStatusMeta(orderView.locationStatus?.pickupStore));
                const pickupStationStatusMeta = computed(() => getLocationStatusMeta(orderView.locationStatus?.pickupStation));
                const returnStoreStatusMeta = computed(() => getLocationStatusMeta(orderView.locationStatus?.returnStore));
                const returnStationStatusMeta = computed(() => getLocationStatusMeta(orderView.locationStatus?.returnStation));
                const showPickupStationStatus = computed(() => isSelfServiceOrder.value || orderView.locationStatus?.pickupStation !== 'normal');
                const showReturnStationStatus = computed(() => isSelfServiceOrder.value || orderView.locationStatus?.returnStation !== 'normal');
                const pickupLocationNotice = computed(() => buildLocationNotice(orderView.locationStatus?.pickupStore, orderView.locationStatus?.pickupStation));
                const returnLocationNotice = computed(() => buildLocationNotice(orderView.locationStatus?.returnStore, orderView.locationStatus?.returnStation));
                const pickupLocationDisplay = computed(() => formatStoreStationAddress(orderView.location.pickup, pickupPlanStationText.value));
                const getSnapshotDailyPrice = () => {
                    const groupName = orderView.vehicle?.group || '';
                    if (groupName.includes('豪華')) return 1200;
                    if (groupName.includes('商務')) return 800;
                    if (groupName.includes('SUV')) return 450;
                    if (groupName.includes('經濟')) return 280;
                    return Math.max(280, Math.round((orderView.amount || 0) / 2));
                };
                const buildMarketingSnapshotConfig = (promotionText, isCorporateOrder) => {
                    const normalizedText = promotionText || '';
                    if (!normalizedText) {
                        return {
                            version: '未使用行銷方案',
                            meta: '未命中行銷方案版本',
                            scope: '未使用行銷方案',
                            basicInfo: [
                                { label: '方案名稱', value: '未使用行銷方案' },
                                { label: '展示名稱', value: '-' },
                                { label: '方案等級 (排序權重)', value: '-' },
                                { label: '狀態', value: '-' },
                                { label: '方案有效期', value: '-' },
                                { label: '適用場景', value: '-' },
                                { label: '客戶羣體', value: '-' },
                                { label: '適用國籍', value: '-' },
                                { label: '適用卡種', value: '-' },
                                { label: '到店覈驗', value: '-' },
                                { label: '資格名稱', value: '-' },
                                { label: '證明文件說明', value: '-' },
                                { label: '適用車組', value: '-' },
                                { label: '方案說明', value: '-' }
                            ],
                            ruleRows: []
                        };
                    }

                    if (isCorporateOrder || normalizedText.includes('企業')) {
                        return {
                            version: 'MKT-STORE-CORP-20260418-002',
                            meta: '按企業資格命中方案版本',
                            scope: '企業資格預訂',
                            basicInfo: [
                                { label: '方案名稱', value: normalizedText },
                                { label: '展示名稱', value: '企業禮遇' },
                                { label: '方案等級 (排序權重)', value: '10' },
                                { label: '狀態', value: '啓用' },
                                { label: '方案有效期', value: '2026-04-01 ~ 2026-12-31' },
                                { label: '適用場景', value: '標準門市' },
                                { label: '客戶羣體', value: '企業資格客戶' },
                                { label: '適用國籍', value: '全部國籍' },
                                { label: '適用卡種', value: 'Visa / Mastercard / JCB / 銀聯' },
                                { label: '到店覈驗', value: '無需到店覈驗' },
                                { label: '資格名稱', value: '-' },
                                { label: '證明文件說明', value: '無額外上傳要求' },
                                { label: '適用車組', value: '全部門市車組' },
                                { label: '方案說明', value: '企業資格客戶可使用的門市租車優惠方案。' }
                            ],
                            ruleRows: [
                                {
                                    name: '企業資格價',
                                    salesWindow: '不限',
                                    useWindow: '2026-04-01 ~ 2026-12-31',
                                    advanceBooking: '0 天',
                                    carGroup: '全部門市車組',
                                    membership: '企業方案會員',
                                    rentalTerm: '1 天起',
                                    locationScope: '全部地區 / 全部門市',
                                    action: '統一價模式：平日 85 折，假日 88 折'
                                },
                                {
                                    name: '互斥規則',
                                    salesWindow: '不限',
                                    useWindow: '不限',
                                    advanceBooking: '不限',
                                    carGroup: '全部門市車組',
                                    membership: '企業方案會員',
                                    rentalTerm: '不限',
                                    locationScope: '全部地區 / 全部門市',
                                    action: '命中多個行銷方案時，不與其他行銷方案疊加'
                                }
                            ]
                        };
                    }

                    if (normalizedText.includes('學生')) {
                        return {
                            version: 'MKT-STORE-STUDENT-20260420-001',
                            meta: '按個人會員資格命中方案版本',
                            scope: '個人會員預訂',
                            basicInfo: [
                                { label: '方案名稱', value: normalizedText },
                                { label: '展示名稱', value: '學生租車優惠' },
                                { label: '方案等級 (排序權重)', value: '7' },
                                { label: '狀態', value: '啓用' },
                                { label: '方案有效期', value: '2026-05-01 ~ 2026-12-31' },
                                { label: '適用場景', value: '標準門市' },
                                { label: '客戶羣體', value: '個人會員' },
                                { label: '適用國籍', value: '全部國籍' },
                                { label: '適用卡種', value: 'Visa / Mastercard / JCB / 銀聯' },
                                { label: '到店覈驗', value: '需到店覈驗' },
                                { label: '資格名稱', value: '學生身份' },
                                { label: '證明文件說明', value: '學生證、在學證明等可證明學生身份的文件' },
                                { label: '適用車組', value: '全部門市車組' },
                                { label: '方案說明', value: '學生身份到店覈驗後享受門市租車優惠。' }
                            ],
                            ruleRows: [
                                {
                                    name: '資格覈驗後 85 折',
                                    salesWindow: '不限',
                                    useWindow: '2026-05-01 ~ 2026-12-31',
                                    advanceBooking: '0 天',
                                    carGroup: '全部門市車組',
                                    membership: '普通會員 / 銀卡 / 金卡',
                                    rentalTerm: '1 天起',
                                    locationScope: '全部地區 / 全部門市',
                                    action: '平假分開模式：平日 85 折，假日 9 折'
                                },
                                {
                                    name: '自助限制',
                                    salesWindow: '不限',
                                    useWindow: '不限',
                                    advanceBooking: '不限',
                                    carGroup: '全部門市車組',
                                    membership: '普通會員 / 銀卡 / 金卡',
                                    rentalTerm: '不限',
                                    locationScope: '全部地區 / 全部門市',
                                    action: '24h 自助租車不開放選擇該方案'
                                },
                                {
                                    name: '覈驗不通過',
                                    salesWindow: '不限',
                                    useWindow: '不限',
                                    advanceBooking: '不限',
                                    carGroup: '全部門市車組',
                                    membership: '普通會員 / 銀卡 / 金卡',
                                    rentalTerm: '不限',
                                    locationScope: '全部地區 / 全部門市',
                                    action: '門店更換行銷方案並重算取車尾款'
                                }
                            ]
                        };
                    }

                    if (normalizedText.includes('平日')) {
                        return {
                            version: 'MKT-STORE-WEEKDAY-20260412-001',
                            meta: '按個人會員資格命中方案版本',
                            scope: '個人會員預訂',
                            basicInfo: [
                                { label: '方案名稱', value: normalizedText },
                                { label: '展示名稱', value: '平日輕旅' },
                                { label: '方案等級 (排序權重)', value: '6' },
                                { label: '狀態', value: '啓用' },
                                { label: '方案有效期', value: '2026-04-12 ~ 2026-12-31' },
                                { label: '適用場景', value: '標準門市、自助' },
                                { label: '客戶羣體', value: '個人會員、企業資格客戶' },
                                { label: '適用國籍', value: '全部國籍' },
                                { label: '適用卡種', value: 'Visa / Mastercard / JCB / 銀聯' },
                                { label: '到店覈驗', value: '無需到店覈驗' },
                                { label: '資格名稱', value: '-' },
                                { label: '證明文件說明', value: '無額外上傳要求' },
                                { label: '適用車組', value: '全部門市車組' },
                                { label: '方案說明', value: '針對平日短中租期的統一優惠方案。' }
                            ],
                            ruleRows: [
                                {
                                    name: '平日減免',
                                    salesWindow: '不限',
                                    useWindow: '工作日',
                                    advanceBooking: '0 天',
                                    carGroup: '全部門市車組',
                                    membership: '普通會員 / 銀卡 / 金卡',
                                    rentalTerm: '1 天起',
                                    locationScope: '全部地區 / 全部門市',
                                    action: '統一價模式：訂單租金立減 ¥200'
                                },
                                {
                                    name: '互斥規則',
                                    salesWindow: '不限',
                                    useWindow: '不限',
                                    advanceBooking: '不限',
                                    carGroup: '全部門市車組',
                                    membership: '普通會員 / 銀卡 / 金卡',
                                    rentalTerm: '不限',
                                    locationScope: '全部地區 / 全部門市',
                                    action: '不與其他行銷方案疊加，按優先級取最優'
                                }
                            ]
                        };
                    }

                    return {
                        version: 'MKT-STORE-MEMBER-20260418-001',
                        meta: '按個人會員資格命中方案版本',
                        scope: '個人會員預訂',
                        basicInfo: [
                            { label: '方案名稱', value: normalizedText },
                            { label: '展示名稱', value: '會員禮遇' },
                            { label: '方案等級 (排序權重)', value: '8' },
                            { label: '狀態', value: '啓用' },
                            { label: '方案有效期', value: '2026-04-01 ~ 2026-12-31' },
                            { label: '適用場景', value: '標準門市' },
                            { label: '客戶羣體', value: '個人會員' },
                            { label: '適用國籍', value: '全部國籍' },
                            { label: '適用卡種', value: 'Visa / Mastercard / JCB / 銀聯' },
                            { label: '到店覈驗', value: '無需到店覈驗' },
                            { label: '資格名稱', value: '-' },
                            { label: '證明文件說明', value: '無額外上傳要求' },
                            { label: '適用車組', value: '全部門市車組' },
                            { label: '方案說明', value: '面向既有會員的門市租車優惠方案。' }
                        ],
                        ruleRows: [
                            {
                                name: '會員價',
                                salesWindow: '不限',
                                useWindow: '2026-04-01 ~ 2026-12-31',
                                advanceBooking: '0 天',
                                carGroup: '全部門市車組',
                                membership: '普通會員 / 銀卡 / 金卡',
                                rentalTerm: '1 天起',
                                locationScope: '全部地區 / 全部門市',
                                action: '統一價模式：租金 95 折'
                            },
                            {
                                name: '互斥規則',
                                salesWindow: '不限',
                                useWindow: '不限',
                                advanceBooking: '不限',
                                carGroup: '全部門市車組',
                                membership: '普通會員 / 銀卡 / 金卡',
                                rentalTerm: '不限',
                                locationScope: '全部地區 / 全部門市',
                                action: '不與其他行銷方案疊加，命中後按當前方案執行'
                            }
                        ]
                    };
                };
                const buildStoreRuleSections = () => [
                    {
                        title: '交易與授權',
                        items: [
                            { label: '待支付資源保留', value: '開啓' },
                            { label: '保留時長', value: '30 分鐘' },
                            { label: '超時處理', value: '取消訂單並釋放庫存' },
                            { label: '派車限制', value: '待支付不參與派車' },
                            { label: '線上交易', value: '啓用（LINE Pay / 街口支付 / 綠界金流）' },
                            { label: '線下交易', value: '啓用（現金 / 刷卡 POS / 轉賬）' },
                            { label: '授權額度模式', value: '租金比例' },
                            { label: '固定額度', value: '-' },
                            { label: '租金比例', value: '30%' },
                            { label: '取車資金處理口徑', value: '履約擔保 / 預授權轉租金' },
                            { label: '企業月結口徑', value: '不發起客戶支付或預授權，最終費用進入企業賬單' }
                        ]
                    },
                    {
                        title: '異地還車',
                        items: [
                            { label: '異地還車費', value: '¥200/次' }
                        ]
                    },
                    {
                        title: '調度與派車',
                        items: [
                            { label: '車輛排程看板鎖定時間', value: '2 小時前鎖定' },
                            { label: '訂單間隔時間', value: '60 分鐘' },
                            { label: '基準日均里程', value: '150 km/天' },
                            { label: '訂單處理口徑', value: '先算訂單權重，再按車輛評分低者優先派遣' },
                            { label: '里程權重', value: '0%' },
                            { label: '營收權重', value: '100%' },
                            { label: '車齡權重', value: '0%' }
                        ]
                    },
                    {
                        title: '時租與日租',
                        items: [
                            { label: '起租規則', value: '起租 24 小時' },
                            { label: '最小計費單位', value: '不足 1 小時按 1 小時' },
                            { label: '時租轉日租時間', value: '第 5 小時起算 1 天' },
                            { label: '不滿日租時的時租價格', value: '按日租百分比' },
                            { label: '每小時按日租', value: '10%' },
                            { label: '時租單價', value: '-' },
                            { label: '固定金額', value: '-' }
                        ]
                    },
                    {
                        title: '取還車規則',
                        items: [
                            { label: '允許提前取車', value: '是' },
                            { label: '免費寬限時間', value: '30 分鐘' },
                            { label: '啓用履約操作鎖', value: '是' },
                            { label: '鎖有效期', value: '30 分鐘' },
                            { label: '允許提前還車', value: '是' },
                            { label: '退款計算規則', value: '僅退還整天租金' },
                            { label: '未取車保留車輛時長', value: '2 小時' },
                            { label: '自動釋放資源', value: '是' },
                            { label: '處理後狀態', value: '爽約' },
                            { label: '爽約違約金', value: '收取' },
                            { label: '爽約違約金計算方式', value: '固定金額' },
                            { label: '爽約違約金固定金額', value: '¥200' },
                            { label: '爽約違約金預授權比例', value: '-' }
                        ]
                    },
                    {
                        title: '取消與超時規則',
                        items: [
                            { label: '下單後限時取消', value: '開啓' },
                            { label: '下單後免責時限', value: '30 分鐘' },
                            { label: '取車前提前取消', value: '開啓' },
                            { label: '取車前免責時限', value: '24 小時' },
                            { label: '免責取消退款方式', value: '全額退款' },
                            { label: '免責取消手續費', value: '-' },
                            { label: '有責取消違約金計算方式', value: '預授權比例' },
                            { label: '有責取消固定金額', value: '-' },
                            { label: '有責取消預授權比例', value: '30%' },
                            { label: '是否階梯扣費', value: '是' },
                            { label: '階梯規則 1', value: '取車前 ≤24 小時扣 20%' },
                            { label: '階梯規則 2', value: '取車前 ≤12 小時扣 50%' },
                            { label: '階梯規則 3', value: '取車前 ≤2 小時扣 100%' },
                            { label: '超時免費寬限', value: '30 分鐘' },
                            { label: '超時罰款', value: '開啓' },
                            { label: '超時罰款類型', value: '固定金額' },
                            { label: '超時罰款數額', value: '¥100' },
                            { label: '超時費封頂', value: '開啓' },
                            { label: '超時費封頂金額', value: '¥500' }
                        ]
                    },
                    {
                        title: '續租規則',
                        items: [
                            { label: '允許延長用車', value: '是' },
                            { label: '允許逾期補辦續租', value: '是' },
                            { label: '後續訂單衝突', value: '先改派後續訂單，否則拒絕續租' },
                            { label: '可選結算方式', value: '立即收款 / 還車時結算' },
                            { label: '超過時長必須收款', value: '24 小時' },
                            { label: '超過金額必須收款', value: '¥1000' },
                            { label: '風險客戶必須收款', value: '是' },
                            { label: '企業月結口徑', value: '不展示立即收款和還車時結算選項，費用統一進入企業賬單' }
                        ]
                    }
                ];
                const billingSnapshotItems = computed(() => {
                    const dailyPrice = getSnapshotDailyPrice();
                    const isCorporateOrder = orderView.clientType === 'corporate';
                    const marketingSnapshot = buildMarketingSnapshotConfig(orderView.promotionText, isCorporateOrder);
                    return [
                        {
                            key: 'price',
                            snapshotLevel: 'baseline',
                            title: '車組標準價',
                            version: 'PRICE-STORE-20260418-001',
                            summary: `${orderView.vehicle?.group || '門市車組'}，標準價 ¥${formatNumber(dailyPrice)}/天`,
                            meta: '含下單時的標準價和里程規則版本',
                            sourcePage: '動態調價 / 基礎產品定價',
                            snapshotTime: orderView.createTime,
                            scope: orderView.vehicle?.group || '門市車組',
                            savedBy: '總部運營',
                            detailType: 'price',
                            priceRows: [
                                {
                                    group: orderView.vehicle?.group || '門市車組',
                                    models: orderView.vehicle?.model || '按訂單車組綁定車型',
                                    dailyPrice: `¥${formatNumber(dailyPrice)}`,
                                    mileageRule: '200km/天，超程 ¥2.0/km，不封頂',
                                    lastUpdated: '2026-04-18'
                                },
                                { group: '經濟型轎車', models: 'Toyota Corolla, Honda Civic 等', dailyPrice: '¥280', mileageRule: '200km/天，超程 ¥2.0/km，不封頂', lastUpdated: '2026-04-18' },
                                { group: 'SUV組', models: 'Toyota RAV4, Honda CR-V 等', dailyPrice: '¥450', mileageRule: '200km/天，超程 ¥2.0/km，不封頂', lastUpdated: '2026-04-18' },
                                { group: '商務車組', models: 'Buick GL8, Honda Odyssey 等', dailyPrice: '¥800', mileageRule: '250km/天，超程 ¥3.0/km，不封頂', lastUpdated: '2026-04-18' }
                            ]
                        },
                        {
                            key: 'marketing',
                            snapshotLevel: 'baseline',
                            title: '行銷優惠方案',
                            version: marketingSnapshot.version,
                            summary: orderView.promotionText || '未使用行銷方案',
                            meta: marketingSnapshot.meta,
                            sourcePage: '行銷方案管理',
                            snapshotTime: orderView.createTime,
                            scope: marketingSnapshot.scope,
                            savedBy: '行銷運營',
                            detailType: 'marketing',
                            basicInfo: marketingSnapshot.basicInfo,
                            ruleRows: marketingSnapshot.ruleRows
                        },
                        {
                            key: 'rules',
                            snapshotLevel: 'baseline',
                            title: '門市租車規則',
                            version: 'RULE-STORE-20260418-002',
                            summary: '起租 24 小時，不足 1 小時按 1 小時，超過第 5 小時起算 1 天',
                            meta: '含預授權、待支付資源保留、取消、爽約、續租和還車結算規則',
                            sourcePage: '租賃業務規則',
                            snapshotTime: orderView.createTime,
                            scope: '門市租車全局規則',
                            savedBy: '運營管理員',
                            detailType: 'rules',
                            ruleSections: buildStoreRuleSections()
                        },
                        {
                            key: 'service',
                            snapshotLevel: 'baseline',
                            title: '增值服務',
                            version: 'SVC-20260418-001',
                            summary: '增值服務價格按訂單創建時快照執行',
                            meta: '後續價格或規則變更不影響本單',
                            sourcePage: '增值服務管理',
                            snapshotTime: orderView.createTime,
                            scope: '本訂單已選服務',
                            savedBy: '產品運營',
                            detailType: 'service',
                            serviceRows: [
                                { name: '基礎保險', billing: '按天', price: '¥80/天', remark: '按訂單租期天數計費' },
                                { name: '兒童座椅', billing: '按天/數量', price: '¥30/天/個', remark: '按訂單選擇數量計費' },
                                { name: '異地還車服務', billing: '按次', price: '按門店規則計算', remark: '按訂單約定門店和規則快照計算' },
                                { name: '第二駕駛人', billing: '按次', price: '¥150/次', remark: '按訂單辦理時選擇的駕駛人數量計費' },
                                { name: '服務價格版本', billing: '版本', price: 'SVC-20260418-001', remark: '後續服務價格調整不影響本單' }
                            ]
                        }
                    ];
                });
                const billingEventSnapshotItems = computed(() => Array.isArray(orderView.eventSnapshots) ? orderView.eventSnapshots : []);
                const getRuleSectionRows = (snapshot) => (snapshot?.ruleSections || []).flatMap(section =>
                    (section.items || []).map(item => ({
                        section: section.title,
                        label: item.label,
                        value: item.value
                    }))
                );
                const getEventSummaryRows = (snapshot) => {
                    const rows = [
                        { label: '觸發原因', value: snapshot?.triggerText || '-' },
                        { label: '結算去向', value: snapshot?.settlementTarget || '-' }
                    ];
                    if (snapshot?.savedBy) rows.push({ label: '操作人', value: snapshot.savedBy });
                    return rows;
                };
                const snapshotVersionDialogVisible = ref(false);
                const selectedSnapshotVersion = ref(null);
                const openSnapshotVersion = (item) => {
                    selectedSnapshotVersion.value = item;
                    snapshotVersionDialogVisible.value = true;
                };
                const postChargeView = reactive({
                    status: initialUrlParams.get('postChargeStatus') || '',
                    amount: Number(initialUrlParams.get('postChargeAmount')) || 0,
                    count: Number(initialUrlParams.get('postChargeCount')) || 0
                });
                const paymentStatusMapForDetail = {
                    unpaid: { text: '未支付', type: 'warning' },
                    deposit_paid: { text: '已收預授權', type: 'primary' },
                    monthly_billing: { text: '企業月結', type: 'primary' },
                    partial_paid: { text: '部分支付', type: 'warning' },
                    paid: { text: '已結清', type: 'success' },
                    payment_due: { text: '待補繳', type: 'danger' },
                    refund_pending: { text: '待退款', type: 'warning' },
                    refunded: { text: '已退款', type: 'info' }
                };
                const postChargeStatusMapForDetail = {
                    pending_notify: { text: '追繳待通知', type: 'warning' },
                    notified: { text: '追繳已通知', type: 'warning' },
                    payment_due: { text: '追繳待支付', type: 'danger' },
                    monthly_billing: { text: '月結已掛賬', type: 'primary' },
                    paid: { text: '追繳已結清', type: 'success' }
                };
                const paymentStatusBadge = computed(() => paymentStatusMapForDetail[orderView.paymentStatus] || null);
                const postChargeBadge = computed(() => postChargeView.status ? (postChargeStatusMapForDetail[postChargeView.status] || { text: postChargeView.status, type: 'warning' }) : null);

                // Order Status Logic
                // Operation Records Mock Data
                const operationRecords = ref([
                    {
                        title: '訂單完成',
                        content: '訂單已結清，流程結束',
                        timestamp: '2024-05-05 10:15:00',
                        operator: '系統自動',
                        type: 'success',
                        color: '#67C23A',
                        hollow: false
                    },
                    {
                        title: '確認還車',
                        content: '車輛已歸還至 臺北車站店，油量 90%，車況正常',
                        timestamp: '2024-05-05 10:00:00',
                        operator: '門店管理員 (李四)',
                        type: 'primary',
                        color: 'var(--app-color-primary)'
                    },
                    {
                        title: '費用結算',
                        content: '支付剩餘尾款 ¥960 (含超時費 ¥0)',
                        timestamp: '2024-05-05 09:55:00',
                        operator: '財務專員 (王五)',
                        memo: '客戶刷卡支付',
                        color: '#E6A23C'
                    },
                    {
                        title: '延長用車',
                        content: '客戶申請延長用車 1 天，原定還車時間 2024-05-04 10:00 -> 2024-05-05 10:00',
                        timestamp: '2024-05-04 09:00:00',
                        operator: '客服專員 (小美)',
                        memo: '電話申請，已補收差價',
                        color: '#E6A23C'
                    },
                    {
                        title: '確認取車',
                        content: '車輛已從 新北總店 駛出，里程 12050km',
                        timestamp: '2024-05-01 10:30:00',
                        operator: '門店管理員 (張三)',
                        type: 'primary',
                        color: 'var(--app-color-primary)'
                    },
                    {
                        title: '車輛調度',
                        content: '分配車輛 Tesla Model 3 (京A·88888)',
                        timestamp: '2024-05-01 09:45:00',
                        operator: '調度中心',
                        hollow: true
                    },
                    {
                        title: '訂單支付',
                        content: '客戶完成預授權押金 ¥666',
                        timestamp: '2024-05-01 09:35:00',
                        operator: '系統',
                        type: 'success'
                    },
                    {
                        title: '創建訂單',
                        content: '客戶提交訂單，狀態：待支付',
                        timestamp: '2024-05-01 09:30:00',
                        operator: '客戶 (App)',
                        hollow: true
                    }
                ]);
                const orderStatus = ref(orderView.status || 'reserved'); // Default for demo
                const orderStatusText = computed(() => {
                    const map = {
                        pending_payment: '待支付',
                        reserved: '已預訂',
                        pickup_overdue: '逾期未取',
                        inspecting: '驗車中',
                        renting: '用車中',
                        renewing: '續租中',
                        overdue: '逾期未還',
                        accident_processing: '出險處理中',
                        settlement_pending: '待結算',
                        payment_due: '待補繳',
                        refund_pending: '待退款',
                        completed: '已完成',
                        cancelled: '已取消',
                        no_show: '爽約',
                        rejected: '已拒絕',
                        closed: '已關閉'
                    };
                    return map[orderStatus.value];
                });
                const orderStatusType = computed(() => {
                    const map = {
                        pending_payment: 'warning',
                        reserved: 'primary',
                        pickup_overdue: 'warning',
                        inspecting: 'warning',
                        renting: 'success',
                        renewing: 'success',
                        overdue: 'danger',
                        accident_processing: 'danger',
                        settlement_pending: 'warning',
                        payment_due: 'danger',
                        refund_pending: 'warning',
                        completed: 'success',
                        cancelled: 'info',
                        no_show: 'info',
                        rejected: 'danger',
                        closed: 'danger'
                    };
                    return map[orderStatus.value];
                });
                const returnSettlementStatuses = ['settlement_pending', 'payment_due', 'refund_pending'];
                const terminalStatuses = ['completed', 'cancelled', 'no_show', 'rejected', 'closed'];
                const canEditOrder = computed(() => !terminalStatuses.includes(orderStatus.value));
                const canPickup = computed(() => ['reserved', 'pickup_overdue', 'inspecting'].includes(orderStatus.value));
                const canReturn = computed(() => ['renting', 'renewing', 'overdue', 'accident_processing', ...returnSettlementStatuses].includes(orderStatus.value));
                const canExtend = computed(() => ['renting', 'renewing', 'overdue'].includes(orderStatus.value));
                const canRedirect = computed(() => ['reserved', 'pickup_overdue', 'inspecting', 'renting', 'renewing', 'overdue', 'accident_processing'].includes(orderStatus.value));
                const canChangeReturnStore = computed(() => ['reserved', 'pickup_overdue', 'inspecting', 'renting', 'renewing', 'overdue', 'accident_processing'].includes(orderStatus.value));
                const canChangeReturnStation = computed(() => canChangeReturnStore.value);
                const canAccident = computed(() => ['renting', 'renewing', 'overdue', 'accident_processing', ...returnSettlementStatuses, 'completed'].includes(orderStatus.value));
                const canCancel = computed(() => ['pending_payment', 'reserved', 'pickup_overdue'].includes(orderStatus.value));
                const canClose = computed(() => ['pending_payment', 'reserved', 'pickup_overdue', 'inspecting', 'renting', 'renewing', 'overdue', 'accident_processing'].includes(orderStatus.value));
                const pickupActionText = computed(() => orderStatus.value === 'inspecting' ? '繼續取車' : '取車');
                const returnActionText = computed(() => {
                    if (orderStatus.value === 'payment_due') return '收款';
                    if (orderStatus.value === 'refund_pending') return '退款';
                    if (isMonthlyBilling.value && orderStatus.value === 'settlement_pending') return '確認月結';
                    return returnSettlementStatuses.includes(orderStatus.value) ? '繼續結算' : '還車';
                });
                const extendActionText = computed(() => orderStatus.value === 'overdue' ? '補辦續租' : '延長用車');

                const formatDate = (date) => {
                    if (!date) return '-';
                    return new Date(date).toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                };

                // Extend Rental Logic
                const extendModalVisible = ref(false);
                const extendData = reactive({
                    newReturnTime: null,
                    conflict: null,
                    remarks: '',
                    settlementMode: 'return_settlement',
                    paymentPaid: false
                });

                const openExtendModal = () => {
                    extendModalVisible.value = true;
                    extendData.newReturnTime = null;
                    extendData.conflict = null;
                    extendData.remarks = '';
                    extendData.settlementMode = isMonthlyBilling.value ? 'monthly' : (orderStatus.value === 'overdue' ? 'immediate' : 'return_settlement');
                    extendData.paymentPaid = false;
                };

                const extendDialogTitle = computed(() => orderStatus.value === 'overdue' ? '補辦續租' : '延長用車');

                const estimatedExtendFee = computed(() => {
                    if (!extendData.newReturnTime) return 0;
                    const diffHours = (new Date(extendData.newReturnTime) - planData.returnTime) / 3600000;
                    if (diffHours <= 0) return 0;
                    return Math.ceil(diffHours) * planData.hourlyRate; // Simple calc
                });

                const extendBillableHours = computed(() => {
                    if (!extendData.newReturnTime) return 0;
                    const diffHours = (new Date(extendData.newReturnTime) - planData.returnTime) / 3600000;
                    return diffHours > 0 ? Math.ceil(diffHours) : 0;
                });

                const extendDurationText = computed(() => {
                    if (!extendData.newReturnTime) return '';
                    const diffHours = (new Date(extendData.newReturnTime) - planData.returnTime) / 3600000;
                    const days = Math.floor(diffHours / 24);
                    const hours = Math.ceil(diffHours % 24);
                    return days > 0 ? `${days}天${hours}小時` : `${hours}小時`;
                });

                const extendRequiresImmediatePay = computed(() => {
                    if (isMonthlyBilling.value) return false;
                    return orderStatus.value === 'overdue' || extendBillableHours.value > 24 || estimatedExtendFee.value > 1000;
                });

                const extendImmediateReason = computed(() => {
                    const reasons = [];
                    if (orderStatus.value === 'overdue') reasons.push('逾期補辦續租');
                    if (extendBillableHours.value > 24) reasons.push('延長時長超過24小時');
                    if (estimatedExtendFee.value > 1000) reasons.push('續租金額超過1000元');
                    return reasons.join('、') || '風控要求';
                });

                const canConfirmExtend = computed(() => {
                    if (!extendData.newReturnTime || extendData.conflict || estimatedExtendFee.value <= 0) return false;
                    if (isMonthlyBilling.value) return true;
                    if (extendRequiresImmediatePay.value && extendData.settlementMode !== 'immediate') return false;
                    if (extendData.settlementMode === 'immediate' && !extendData.paymentPaid) return false;
                    return true;
                });

                const checkExtendConflict = () => {
                    if (!extendData.newReturnTime) return;
                    // Mock Conflict if date > 2026-02-05
                    const conflictDate = new Date('2026-02-05T14:00:00');
                    if (new Date(extendData.newReturnTime) > conflictDate) {
                        extendData.conflict = {
                            nextOrder: { orderId: 'ORD-20260205-001', pickupTime: '2026/02/05 14:00' },
                            maxExtendTime: '2026/02/05 12:00' // 2h buffer
                        };
                    } else {
                        extendData.conflict = null;
                    }
                    extendData.paymentPaid = false;
                    if (isMonthlyBilling.value) {
                        extendData.settlementMode = 'monthly';
                    } else if (extendRequiresImmediatePay.value) {
                        extendData.settlementMode = 'immediate';
                    }
                };

                const useMaxExtendTime = () => {
                    extendData.newReturnTime = new Date('2026-02-05T12:00:00');
                    extendData.conflict = null;
                    extendData.paymentPaid = false;
                    if (isMonthlyBilling.value) {
                        extendData.settlementMode = 'monthly';
                    } else if (extendRequiresImmediatePay.value) {
                        extendData.settlementMode = 'immediate';
                    }
                };

                const resolveConflict = () => {
                    const loading = ElLoading.service({ text: '正在改派後續訂單...' });
                    setTimeout(() => {
                        loading.close();
                        ElMessage.success('後續訂單(ORD-20260205-001)已成功改派至車輛 [Honda CRV]');
                        extendData.conflict = null; // Clear conflict
                    }, 1500);
                };

                const confirmExtendPayment = () => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單不需要續租收款');
                        return;
                    }
                    if (!extendData.newReturnTime || estimatedExtendFee.value <= 0) {
                        ElMessage.warning('請先選擇有效的新還車時間');
                        return;
                    }
                    extendData.paymentPaid = true;
                    ElMessage.success('續租費用收款成功');
                };

                const confirmExtend = () => {
                    if (!canConfirmExtend.value) {
                        ElMessage.warning('請先完成延長時間、庫存和收款校驗');
                        return;
                    }
                    const loading = ElLoading.service({ text: '正在處理延長請求...' });
                    const oldReturnTime = new Date(planData.returnTime);
                    const newReturnTime = new Date(extendData.newReturnTime);
                    const feeAmount = estimatedExtendFee.value;
                    const feeId = 'FEE-EXT-' + Date.now();
                    const isImmediate = extendData.settlementMode === 'immediate';
                    const isMonthlyExtend = isMonthlyBilling.value;
                    setTimeout(() => {
                        loading.close();
                        planData.returnTime = newReturnTime; // Update plan
                        orderStatus.value = 'renewing';

                        feeItems.value.unshift({
                            id: feeId,
                            type: 'extension_rent',
                            source: 'system',
                            name: '續租租金',
                            description: `${formatDate(oldReturnTime)} 至 ${formatDate(newReturnTime)}，${extendDurationText.value}`,
                            amount: feeAmount,
                            paidAmount: isImmediate ? feeAmount : 0,
                            status: isMonthlyExtend ? 'monthly_billing' : (isImmediate ? 'paid' : 'pending'),
                            phase: 'rental',
                            createdAt: new Date().toLocaleString(),
                            createdBy: 'system',
                            attachments: [],
                            reminder: isImmediate || isMonthlyExtend ? null : { date: new Date().toISOString().split('T')[0], notified: false },
                            editable: false
                        });

                        if (isImmediate) {
                            transactions.value.unshift({
                                id: 'TXN-EXT-' + Date.now(),
                                feeIds: [feeId],
                                type: 'payment',
                                txnType: 'extension_payment',
                                amount: feeAmount,
                                channel: 'cash',
                                channelType: 'offline',
                                refNo: 'EXT-' + Date.now(),
                                status: 'confirmed',
                                receiptImage: null,
                                operator: 'Admin',
                                createdAt: new Date().toLocaleString(),
                                remark: '續租租金立即收款'
                            });
                        }

                        // Add to Operation Records
                        operationRecords.value.unshift({
                            title: '延長用車',
                            content: `${formatDate(oldReturnTime)} -> ${formatDate(newReturnTime)}，續租費用 ¥${formatNumber(feeAmount)}`,
                            timestamp: new Date().toLocaleString().replace(/\//g, '-'),
                            sortTime: Date.now(),
                            operator: '門店管理員 (當前)',
                            memo: `${isMonthlyExtend ? '企業月結' : (isImmediate ? '立即收款' : '還車時結算')}；${extendData.remarks || '客戶申請延長'}`,
                            color: '#E6A23C'
                        });

                        ElMessage.success({
                            message: isMonthlyExtend ? '延長用車成功，續租費用將進入企業月結賬單。' : (isImmediate ? '延長用車成功，續租費用已收款。' : '延長用車成功，續租費用將在還車時結算。'),
                            type: 'success',
                            duration: 3000
                        });
                        extendModalVisible.value = false;
                    }, 1000);
                };

                // Pickup Logic
                const pickupModalVisible = ref(false);
                const pickupStep = ref(0);
                const processing = ref(false);
                const pickupPreviousStatus = ref('reserved');
                const pickupInterrupted = ref(false);
                const pickupLock = reactive({
                    operator: 'Admin',
                    startedAt: '',
                    expiresAt: ''
                });
                const pickupData = reactive({
                    driverName: orderView.customer.name,
                    driverId: orderView.customer.memberNo,
                    driverPhone: orderView.customer.phone,
                    licenseExp: '2028-12-31',
                    isPersonMatched: false,
                    marketingPlanId: orderView.clientType === 'corporate' ? 'corp' : 'student',
                    promoQualificationStatus: 'pending',
                    promoQualificationReason: '',
                    replacementPromoId: '',
                    marketingChangeApplied: false,
                    qualificationFiles: [
                        { index: 1, uploaded: true },
                        { index: 2, uploaded: false },
                        { index: 3, uploaded: false }
                    ],
                    signed: false,
                    agreed: false,
                    depositPaid: false, // Legacy
                    paymentMethod: 'offline',
                    paymentConfirmed: false,
                    mileage: getTelematicsMetricValue('pickup', 'mileage', 12450),
                    fuel: getTelematicsMetricValue('pickup', 'fuel', 8),
                    deliveryLocation: '門市交付區 A1',
                    pickupTime: new Date(),
                    remarks: '',
                    checklist: []
                });

                const formatPickupLockTime = (date) => {
                    return date.toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                };

                const startPickupLock = () => {
                    const now = new Date();
                    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
                    pickupLock.startedAt = formatPickupLockTime(now);
                    pickupLock.expiresAt = formatPickupLockTime(expiresAt);
                    pickupInterrupted.value = false;
                };

                // Return Vehicle Logic
                const returnModalVisible = ref(false);
                const returnStep = ref(0);
                const returnPreviousStatus = ref('renting');
                const returnInspectionSubmitted = ref(false);
                const returnData = reactive({
                    returnTime: new Date(new Date().setDate(new Date().getDate() + 5) + 7200000), // +5 days + 2 hours (Overtime)
                    mileage: getTelematicsMetricValue('return', 'mileage', 13600), // +100km over limit
                    fuel: getTelematicsMetricValue('return', 'fuel', 6), // 6/8
                    returnStore: 'store_current',
                    remarks: '',
                    parking: {
                        station: 'banqiao_b1',
                        floor: '',
                        spot: '',
                        photo: null
                    },
                    extraFees: [
                        { name: '深度清潔費', amount: 300, type: 'charge', desc: '車內有異味 (人工添加)' },
                        { name: '外觀修復費', amount: 1500, type: 'charge', desc: '右前門刮痕 (人工添加)' }
                    ],
                    newFeeName: '',
                    newFeeAmount: ''
                });

                const returnStores = [
                    { id: 'store_current', name: '新北總店', address: '新北市中正區中正路10號', diffFee: 0, dealerId: 'dealer_north', dealerName: '北區合作車行' },
                    { id: 'store_taipei', name: '臺北車站店', address: '臺北市中正區忠孝西路1號', diffFee: 300, dealerId: 'dealer_north', dealerName: '北區合作車行' },
                    { id: 'store_airport', name: '桃園機場店', address: '桃園機場航站南路9號', diffFee: 500, dealerId: 'dealer_airport', dealerName: '機場合作車行' }
                ];

                const returnStationMap = {
                    store_current: [
                        { id: 'banqiao_b1', name: '新北總店 B1 交車區', address: '新北總店地下 B1，A 區' },
                        { id: 'banqiao_p3', name: '新北總店 P3 停放區', address: '新北總店後方 P3 停車場' }
                    ],
                    store_taipei: [
                        { id: 'taipei_main_b2', name: '臺北車站店 B2 停放區', address: '臺北車站店地下 B2，C 區' },
                        { id: 'taipei_main_outdoor', name: '臺北車站店戶外整備區', address: '臺北車站店後場整備區' }
                    ],
                    store_airport: [
                        { id: 'airport_p1', name: '桃園機場店 P1 自助區', address: '桃園機場店 P1 車位區' },
                        { id: 'airport_service', name: '桃園機場店服務交車區', address: '桃園機場店櫃檯旁交車區' }
                    ]
                };

                const returnStoreDiffFeeMatrix = {
                    store_current__store_taipei: 300,
                    store_taipei__store_current: 300,
                    store_current__store_airport: 500,
                    store_airport__store_current: 500,
                    store_taipei__store_airport: 450,
                    store_airport__store_taipei: 450
                };

                const getReturnStoreById = (storeId) => returnStores.find(item => item.id === storeId);
                const getReturnStoreIdFromLocation = (locationText) => {
                    const { storeName } = splitStoreAddress(locationText);
                    const matchedStore = returnStores.find(store => store.name === storeName || storeName.includes(store.name) || store.name.includes(storeName));
                    return matchedStore ? matchedStore.id : 'store_current';
                };
                returnData.returnStore = getReturnStoreIdFromLocation(orderView.location.return);
                returnData.parking.station = returnStationMap[returnData.returnStore]?.[0]?.id || '';
                const originalReturnStoreId = ref(returnData.returnStore);
                const pickupStoreName = computed(() => splitStoreAddress(orderView.location.pickup).storeName);
                const currentReturnStoreName = computed(() => getReturnStoreLabel(returnData.returnStore));
                const getReturnStoreDiffFee = (storeId) => {
                    const store = getReturnStoreById(storeId);
                    if (!store || store.name === pickupStoreName.value) return 0;
                    const pickupStoreId = getReturnStoreIdFromLocation(orderView.location.pickup);
                    const routeFee = returnStoreDiffFeeMatrix[`${pickupStoreId}__${storeId}`];
                    if (routeFee !== undefined) return routeFee;
                    return store.diffFee !== undefined ? store.diffFee : planData.diffLocationFee;
                };
                const returnStoreCurrentFee = computed(() => getReturnStoreDiffFee(returnData.returnStore));
                const returnStoreDeltaFee = computed(() => returnStoreCurrentFee.value - getReturnStoreDiffFee(originalReturnStoreId.value));

                const returnStations = computed(() => returnStationMap[returnData.returnStore] || []);
                const plannedReturnStationId = ref(orderView.location.returnStationId || returnStationMap[returnData.returnStore]?.[0]?.id || '');

                const handleReturnStoreChange = () => {
                    const firstStation = returnStations.value[0];
                    returnData.parking.station = firstStation ? firstStation.id : '';
                    if (!plannedReturnStationId.value || !returnStations.value.some(item => item.id === plannedReturnStationId.value)) {
                        plannedReturnStationId.value = firstStation ? firstStation.id : '';
                    }
                };

                const getReturnStoreLabel = (storeId) => {
                    const store = returnStores.find(item => item.id === storeId);
                    return store ? store.name : '-';
                };

                const getReturnStationLabel = (stationId, storeId = returnData.returnStore) => {
                    const station = (returnStationMap[storeId] || []).find(item => item.id === stationId);
                    return station ? station.name : '-';
                };
                const currentReturnStationName = computed(() => getReturnStationLabel(plannedReturnStationId.value, returnData.returnStore));

                const hasReturnStationSnapshot = computed(() => {
                    return returnInspectionSubmitted.value || returnSettlementStatuses.includes(orderStatus.value) || orderStatus.value === 'completed';
                });

                const returnLocationDisplay = computed(() => {
                    const stationName = hasReturnStationSnapshot.value
                        ? getReturnStationLabel(returnData.parking.station, returnData.returnStore)
                        : (isSelfServiceOrder.value ? currentReturnStationName.value : '');
                    return formatStoreStationAddress(orderView.location.return, stationName);
                });

                const returnStoreChangeDialogVisible = ref(false);
                const returnStoreChangeReasons = [
                    { value: 'customer_request', label: '客戶要求改還車門市' },
                    { value: 'store_negotiation', label: '門店協商改還車門市' },
                    { value: 'vehicle_reflow', label: '車輛迴流安排' },
                    { value: 'store_unavailable', label: '原還車門市無法接收' },
                    { value: 'accident_exception', label: '事故/異常處理需要' },
                    { value: 'other', label: '其他' }
                ];
                const returnStoreChangeData = reactive({
                    newStoreId: '',
                    reason: 'customer_request',
                    remark: ''
                });
                const currentReturnDealerId = computed(() => getReturnStoreById(returnData.returnStore)?.dealerId || 'dealer_north');
                const returnStoreTransferOptions = computed(() => returnStores.filter(store =>
                    store.id !== returnData.returnStore && store.dealerId === currentReturnDealerId.value
                ));
                const returnStoreNewFee = computed(() => returnStoreChangeData.newStoreId ? getReturnStoreDiffFee(returnStoreChangeData.newStoreId) : returnStoreCurrentFee.value);
                const returnStoreChangeFeeDelta = computed(() => returnStoreNewFee.value - returnStoreCurrentFee.value);
                const returnStoreChangeFeeAbs = computed(() => Math.abs(returnStoreChangeFeeDelta.value));
                const returnStoreConflict = reactive({
                    checked: false,
                    hasConflict: false,
                    resolved: false,
                    orderId: 'ZT2405100021',
                    pickupTime: '2024/05/10 20:00',
                    customerName: '許雅婷',
                    status: '已硬鎖定',
                    originalStoreName: '',
                    targetStoreName: '',
                    currentVehicle: '',
                    targetVehicle: 'Honda CR-V / RIMO-315'
                });

                const checkReturnStoreScheduleConflict = () => {
                    const targetStore = getReturnStoreById(returnStoreChangeData.newStoreId);
                    returnStoreConflict.checked = !!targetStore;
                    returnStoreConflict.resolved = false;
                    returnStoreConflict.originalStoreName = currentReturnStoreName.value;
                    returnStoreConflict.targetStoreName = targetStore ? targetStore.name : '';
                    returnStoreConflict.currentVehicle = `${orderView.vehicle.model} / ${orderView.vehicle.plate}`;
                    returnStoreConflict.hasConflict = !!targetStore
                        && targetStore.id !== returnData.returnStore
                        && returnData.returnStore === 'store_current'
                        && orderView.vehicle.plate !== '未分配';
                };

                const openReturnStoreChangeDialog = () => {
                    if (!canChangeReturnStore.value) {
                        ElMessage.warning('當前訂單狀態不可改還車門市');
                        return;
                    }
                    returnStoreChangeData.newStoreId = returnStoreTransferOptions.value[0]?.id || '';
                    returnStoreChangeData.reason = 'customer_request';
                    returnStoreChangeData.remark = '';
                    checkReturnStoreScheduleConflict();
                    returnStoreChangeDialogVisible.value = true;
                };

                const quickRedirectReturnStoreConflict = () => {
                    if (!returnStoreConflict.hasConflict || returnStoreConflict.resolved) return;
                    const loading = ElLoading.service({ text: '正在改派後續訂單...' });
                    setTimeout(() => {
                        loading.close();
                        returnStoreConflict.resolved = true;
                        operationRecords.value.unshift({
                            title: '後續訂單快捷改派',
                            content: `${returnStoreConflict.orderId} 由 ${returnStoreConflict.currentVehicle} 改派至 ${returnStoreConflict.targetVehicle}，釋放原還車門市後續佔用`,
                            timestamp: new Date().toLocaleString(),
                            sortTime: Date.now(),
                            operator: '門店管理員 (當前)',
                            memo: '改還車門市前處理原還車門市後續預約衝突',
                            color: '#E6A23C'
                        });
                        ElMessage.success(`後續訂單 ${returnStoreConflict.orderId} 已快捷改派`);
                    }, 900);
                };

                const confirmReturnStoreChange = () => {
                    const targetStore = getReturnStoreById(returnStoreChangeData.newStoreId);
                    if (!targetStore) {
                        ElMessage.warning('請選擇新還車門市');
                        return;
                    }
                    if (targetStore.dealerId !== currentReturnDealerId.value) {
                        ElMessage.warning('本期不支持跨車行轉單');
                        return;
                    }
                    if (returnStoreChangeData.reason === 'other' && !returnStoreChangeData.remark.trim()) {
                        ElMessage.warning('選擇其他原因時必須填寫備註');
                        return;
                    }
                    if (returnStoreConflict.hasConflict && !returnStoreConflict.resolved) {
                        ElMessage.warning('請先處理原還車門市後續預約衝突');
                        return;
                    }
                    const oldStoreName = currentReturnStoreName.value;
                    const reasonText = returnStoreChangeReasons.find(item => item.value === returnStoreChangeData.reason)?.label || '-';
                    const delta = returnStoreChangeFeeDelta.value;
                    orderView.location.return = `${targetStore.name} - ${targetStore.address}`;
                    returnData.returnStore = targetStore.id;
                    handleReturnStoreChange();
                    orderView.locationStatus.returnStore = 'normal';
                    operationRecords.value.unshift({
                        title: '改還車門市',
                        content: `${oldStoreName} -> ${targetStore.name}，調度費差額 ${delta >= 0 ? '+' : '-'}¥${formatNumber(Math.abs(delta))}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '門店管理員 (當前)',
                        memo: returnStoreChangeData.remark || reasonText,
                        color: '#409EFF'
                    });
                    returnStoreChangeDialogVisible.value = false;
                    ElMessage.success('還車門市已更新，新門市可辦理還車');
                };

                const returnStationChangeDialogVisible = ref(false);
                const returnStationChangeData = reactive({
                    path: [],
                    reason: 'customer_request',
                    remark: ''
                });
                const returnStationTransferOptions = computed(() => returnStores
                    .filter(store => store.dealerId === currentReturnDealerId.value)
                    .map(store => ({
                        value: store.id,
                        label: store.name,
                        children: (returnStationMap[store.id] || []).map(station => ({
                            value: station.id,
                            label: station.name
                        }))
                    })));
                const returnStationConflict = reactive({
                    checked: false,
                    hasConflict: false,
                    resolved: false,
                    orderId: 'ZT2405100021',
                    pickupTime: '2024/05/10 20:00',
                    customerName: '許雅婷',
                    status: '已硬鎖定',
                    originalStoreName: '',
                    targetStoreName: '',
                    targetStationName: '',
                    currentVehicle: '',
                    targetVehicle: 'Honda CR-V / RIMO-315'
                });
                const checkReturnStationScheduleConflict = () => {
                    const [targetStoreId] = returnStationChangeData.path || [];
                    const targetStore = getReturnStoreById(targetStoreId);
                    const targetStationName = targetStore && returnStationChangeData.path?.[1]
                        ? getReturnStationLabel(returnStationChangeData.path[1], targetStoreId)
                        : '';
                    returnStationConflict.checked = !!targetStore;
                    returnStationConflict.resolved = false;
                    returnStationConflict.originalStoreName = currentReturnStoreName.value;
                    returnStationConflict.targetStoreName = targetStore ? targetStore.name : '';
                    returnStationConflict.targetStationName = targetStationName;
                    returnStationConflict.currentVehicle = `${orderView.vehicle.model} / ${orderView.vehicle.plate}`;
                    returnStationConflict.hasConflict = !!targetStore
                        && targetStore.id !== returnData.returnStore
                        && returnData.returnStore === 'store_current'
                        && orderView.vehicle.plate !== '未分配';
                };
                const openReturnStationChangeDialog = () => {
                    if (!canChangeReturnStation.value) {
                        ElMessage.warning('當前訂單狀態不可改還車據點');
                        return;
                    }
                    returnStationChangeData.path = plannedReturnStationId.value
                        ? [returnData.returnStore, plannedReturnStationId.value]
                        : (returnStationTransferOptions.value[0]?.children?.[0]
                            ? [returnStationTransferOptions.value[0].value, returnStationTransferOptions.value[0].children[0].value]
                            : []);
                    returnStationChangeData.reason = 'customer_request';
                    returnStationChangeData.remark = '';
                    checkReturnStationScheduleConflict();
                    returnStationChangeDialogVisible.value = true;
                };
                const quickRedirectReturnStationConflict = () => {
                    if (!returnStationConflict.hasConflict || returnStationConflict.resolved) return;
                    const loading = ElLoading.service({ text: '正在改派後續訂單...' });
                    setTimeout(() => {
                        loading.close();
                        returnStationConflict.resolved = true;
                        operationRecords.value.unshift({
                            title: '後續訂單快捷改派',
                            content: `${returnStationConflict.orderId} 由 ${returnStationConflict.currentVehicle} 改派至 ${returnStationConflict.targetVehicle}，釋放原還車門市後續佔用`,
                            timestamp: new Date().toLocaleString(),
                            sortTime: Date.now(),
                            operator: '門店管理員 (當前)',
                            memo: '改還車據點前處理原還車門市後續預約衝突',
                            color: '#E6A23C'
                        });
                        ElMessage.success(`後續訂單 ${returnStationConflict.orderId} 已快捷改派`);
                    }, 900);
                };
                const confirmReturnStationChange = () => {
                    const [targetStoreId, targetStationId] = returnStationChangeData.path || [];
                    const targetStore = getReturnStoreById(targetStoreId);
                    if (!targetStore || !targetStationId) {
                        ElMessage.warning('請選擇新還車據點');
                        return;
                    }
                    if (targetStore.dealerId !== currentReturnDealerId.value) {
                        ElMessage.warning('本期不支持跨車行轉單');
                        return;
                    }
                    if (returnStationChangeData.reason === 'other' && !returnStationChangeData.remark.trim()) {
                        ElMessage.warning('選擇其他原因時必須填寫備註');
                        return;
                    }
                    if (returnStationConflict.hasConflict && !returnStationConflict.resolved) {
                        ElMessage.warning('請先處理原還車門市後續預約衝突');
                        return;
                    }
                    const oldStoreName = currentReturnStoreName.value;
                    const oldStationName = currentReturnStationName.value || '-';
                    const newStationName = getReturnStationLabel(targetStationId, targetStoreId);
                    const reasonText = returnStoreChangeReasons.find(item => item.value === returnStationChangeData.reason)?.label?.replace('門市', '據點') || '-';
                    const oldFee = getReturnStoreDiffFee(returnData.returnStore);
                    const newFee = getReturnStoreDiffFee(targetStoreId);
                    const delta = newFee - oldFee;
                    orderView.location.return = `${targetStore.name} - ${targetStore.address}`;
                    orderView.location.returnStationName = newStationName;
                    orderView.location.returnStationId = targetStationId;
                    returnData.returnStore = targetStoreId;
                    plannedReturnStationId.value = targetStationId;
                    orderView.locationStatus.returnStore = 'normal';
                    orderView.locationStatus.returnStation = 'normal';
                    operationRecords.value.unshift({
                        title: '改還車據點',
                        content: `${oldStoreName} / ${oldStationName} -> ${targetStore.name} / ${newStationName}，調度費差額 ${delta >= 0 ? '+' : '-'}¥${formatNumber(Math.abs(delta))}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '門店管理員 (當前)',
                        memo: returnStationChangeData.remark || reasonText,
                        color: '#409EFF'
                    });
                    returnStationChangeDialogVisible.value = false;
                    ElMessage.success('還車據點已更新，請聯繫客服繼續處理');
                };

                const returnDamagePhotos = ref([]);
                const returnSignatureStatus = ref('initial'); // 'initial', 'pushed', 'signed'
                const returnSignatureTime = ref('');
                const damageDialogContext = ref('pickup'); // 'pickup' | 'return'

                const openDamageDialog = (context = 'pickup') => {
                    if (typeof context !== 'string') context = 'pickup';
                    damageDialogContext.value = context;
                    showDamageTypeDialog.value = true;
                    newDamage.category = 'exterior';
                    newDamage.type = '';
                };

                const requestReturnSignature = () => {
                    returnSignatureStatus.value = 'pushed';
                };
                const confirmReturnSignature = () => {
                    returnSignatureStatus.value = 'signed';
                    returnSignatureTime.value = new Date().toLocaleString();
                };

                // Mock Standard Fee Config
                const feeConfig = {
                    baseRent: { name: '訂單租金 (5天)', amount: orderView.amount, type: 'charge', desc: '原訂單租金' },
                    overtime: { name: '超時費', amount: 0, type: 'charge', desc: '未觸發' },
                    earlyRefund: { name: '提前還車退費', amount: 0, type: 'refund', desc: '未觸發' },
                    mileage: { name: '超里程費', amount: 0, type: 'charge', desc: '未觸發' },
                    fuel: { name: '油費補差', amount: 0, type: 'charge', desc: '未觸發' },
                    diffLocation: { name: '異地還車費', amount: 0, type: 'charge', desc: '未觸發' }
                };

                // Mock Plan Data (Should match Order Info)
                const planData = {
                    returnTime: new Date(new Date().setDate(new Date().getDate() + 5)), // Same as default
                    mileageLimit: 13500, // 1000km limit
                    dailyRate: Math.round(orderView.amount / 5),
                    hourlyRate: 50,
                    fuelPrice: 8.5,
                    mileagePrice: 5.0,
                    diffLocationFee: 300
                };

                // Computed Return Fees
                const returnPaymentRecords = ref([]);
                const returnRefundDialogVisible = ref(false);
                const selectedReturnRefundChannel = ref('');
                const returnFees = computed(() => {
                    let fees = [];
                    let total = isMonthlyBilling.value ? paymentData.orderTotal : 0;

                    fees.push({
                        ...feeConfig.baseRent,
                        amount: paymentData.orderTotal,
                        desc: isMonthlyBilling.value ? '企業月結基礎租金，隨還車最終應收掛賬' : '取車階段已結清，不參與還車差額',
                        settledAtPickup: !isMonthlyBilling.value
                    });

                    // 1. Time Adjustment
                    const diffHours = (new Date(returnData.returnTime) - planData.returnTime) / 3600000;
                    if (diffHours > 0.5) { // Late beyond 30-minute grace period
                        const billableHours = Math.ceil(diffHours);
                        const amount = Math.min(billableHours * planData.hourlyRate, 500) + 100;
                        fees.push({ ...feeConfig.overtime, amount: amount, desc: `超時 ${billableHours} 小時，含超時罰款` });
                        total += amount;
                    } else if (diffHours < -24) { // Early
                        const daysEarly = Math.floor(Math.abs(diffHours) / 24);
                        if (daysEarly > 0) {
                            const amount = -(daysEarly * planData.dailyRate);
                            fees.push({ ...feeConfig.earlyRefund, amount: amount, desc: `提前 ${daysEarly} 天` });
                            total += amount;
                        }
                    } else {
                        fees.push(feeConfig.overtime); // Show 0 entry
                        fees.push(feeConfig.earlyRefund); // Show 0 entry
                    }

                    // 2. Mileage Fee
                    if (returnData.mileage > planData.mileageLimit) {
                        const amount = (returnData.mileage - planData.mileageLimit) * planData.mileagePrice;
                        fees.push({ ...feeConfig.mileage, amount: amount, desc: `${returnData.mileage - planData.mileageLimit} km` });
                        total += amount;
                    } else {
                        fees.push(feeConfig.mileage);
                    }

                    // 3. Fuel Fee
                    if (returnData.fuel < 8) {
                        const amount = Math.round((8 - returnData.fuel) * 60 * 0.125 * planData.fuelPrice);
                        fees.push({ ...feeConfig.fuel, amount: amount, desc: `缺油 ${8 - returnData.fuel} 格` });
                        total += amount;
                    } else {
                        fees.push(feeConfig.fuel);
                    }

                    // 4. Return Store change fee, calculated by store only. Parking stations never trigger it.
                    const store = getReturnStoreById(returnData.returnStore);
                    const diffFeeDelta = returnStoreDeltaFee.value;
                    if (store && diffFeeDelta !== 0) {
                        fees.push({
                            ...feeConfig.diffLocation,
                            amount: diffFeeDelta,
                            type: diffFeeDelta > 0 ? 'charge' : 'refund',
                            desc: `${pickupStoreName.value} -> ${store.name}`
                        });
                        total += diffFeeDelta;
                    } else {
                        fees.push(feeConfig.diffLocation);
                    }

                    // 5. Pending rental-period fees maintained in the fee center
                    feeItems.value
                        .filter(f => f.phase === 'rental')
                        .filter(f => !['rental', 'deposit'].includes(f.type))
                        .filter(f => ['pending', 'partial', 'monthly_billing'].includes(f.status))
                        .filter(f => (f.amount - (f.paidAmount || 0)) !== 0)
                        .forEach(f => {
                            const pendingAmount = f.amount - (f.paidAmount || 0);
                            fees.push({ name: f.name, amount: pendingAmount, type: pendingAmount >= 0 ? 'charge' : 'refund', desc: f.description || '租期費用' });
                            total += pendingAmount;
                        });

                    // 6. Manual fees recorded directly in the return flow
                    returnData.extraFees.forEach(f => {
                        fees.push({ name: f.name, amount: f.amount, type: 'charge', desc: '人工添加' });
                        total += f.amount;
                    });

                    // Filter out Base Rent from Total if it's already "Paid" (Simulated)
                    // We treat Base Rent as "Prepaid" in this flow

                    // Allocation Logic (Waterfall)
                    // 1. Specific Waivers
                    // 2. Base Rent (Assumed Paid)
                    // 3. General Payments (Distributed)

                    let generalPaymentPool = returnPaymentRecords.value
                        .filter(p => p.type === 'payment' || p.type === 'settlement') // 'settlement' is legacy type name
                        .reduce((sum, p) => sum + p.amount, 0);

                    // Waivers Map
                    const waivers = returnPaymentRecords.value
                        .filter(p => p.type === 'waiver');

                    fees = fees.map(item => {
                        let paid = 0;
                        let itemOutstanding = item.amount;

                        // 1. Apply Specific Waivers
                        const itemWaivers = waivers.filter(w => w.targetItemName === item.name)
                            .reduce((sum, w) => sum + Math.abs(w.amount), 0);

                        paid += itemWaivers;
                        itemOutstanding -= itemWaivers;

                        // 2. Base rent is settled at pickup for customer-pay orders and excluded from return balance.
                        if (item.settledAtPickup) {
                            paid = item.amount;
                            itemOutstanding = 0;
                        }

                        // 3. Apply General Pool to remaining
                        if (itemOutstanding > 0 && generalPaymentPool > 0) {
                            const allocate = Math.min(itemOutstanding, generalPaymentPool);
                            paid += allocate;
                            generalPaymentPool -= allocate;
                        }

                        return { ...item, paid: paid };
                    });

                    return { items: fees, total: total };
                });

                // Waiver Logic
                const waiveDialogVisible = ref(false);
                const waiveData = reactive({
                    itemName: '',
                    amount: 0,
                    maxAmount: 0,
                    reason: '',
                    remark: '',
                    feeItem: null
                });

                const openWaiveDialog = (feeItem) => {
                    const outstanding = feeItem.amount - (feeItem.paid || 0);
                    waiveData.itemName = feeItem.name;
                    waiveData.amount = outstanding; // Default to full waiver
                    waiveData.maxAmount = outstanding;
                    waiveData.reason = '';
                    waiveData.remark = '';
                    waiveData.feeItem = feeItem;
                    waiveDialogVisible.value = true;
                };

                const confirmWaive = () => {
                    returnPaymentRecords.value.push({
                        type: 'waiver',
                        channel: '人工減免',
                        amount: -waiveData.amount, // Negative for reducing balance
                        time: new Date().toLocaleString(),
                        refNo: 'WAIVE-' + Date.now().toString().slice(-6),
                        remark: `${waiveData.reason} - ${waiveData.remark}`,
                        targetItemName: waiveData.itemName // Link to item
                    });

                    waiveDialogVisible.value = false;
                    ElMessage.success('費用減免已批准');
                };

                // Settlement Records (Computed for Display)
                const returnSettlementRecords = computed(() => {
                    return [...returnPaymentRecords.value].reverse(); // Newest first
                });




                // Return Fee Logic (Revised)
                const showAddFeeDialog = ref(false);
                const returnFeeForm = reactive({
                    type: '',
                    customName: '',
                    amount: 0,
                    description: ''
                });

                const openAddFeeDialog = () => {
                    returnFeeForm.type = '';
                    returnFeeForm.customName = '';
                    returnFeeForm.amount = 0;
                    returnFeeForm.description = '';
                    showAddFeeDialog.value = true;
                };

                const confirmAddFees = () => {
                    const feeTypeObj = manualFeeTypes.find(t => t.value === returnFeeForm.type);
                    const feeName = returnFeeForm.type === 'other'
                        ? returnFeeForm.customName
                        : (feeTypeObj ? feeTypeObj.label : '');

                    if (!feeName || !returnFeeForm.amount) {
                        ElMessage.warning('請完善費用信息');
                        return;
                    }

                    returnData.extraFees.push({
                        name: feeName,
                        amount: returnFeeForm.amount,
                        type: 'charge',
                        desc: returnFeeForm.description || '人工添加'
                    });
                    ElMessage.success('費用添加成功');
                    showAddFeeDialog.value = false;
                };

                const removeExtraFee = (index) => {
                    returnData.extraFees.splice(index, 1);
                };

                // Return Payment Logic
                // returnPaymentRecords hoisted above

                const returnBalanceDue = computed(() => {
                    if (!returnFees.value) return 0;
                    if (isMonthlyBilling.value) return 0;

                    const totalPaid = returnPaymentRecords.value
                        .filter(p => p.type === 'payment' || p.type === 'settlement')
                        .reduce((sum, p) => sum + p.amount, 0);

                    const totalWaived = returnPaymentRecords.value
                        .filter(p => p.type === 'waiver')
                        .reduce((sum, p) => sum + Math.abs(p.amount), 0);

                    const totalRefunded = returnPaymentRecords.value
                        .filter(p => p.type === 'refund')
                        .reduce((sum, p) => sum + Math.abs(p.amount), 0);

                    return returnFees.value.total - totalPaid - totalWaived + totalRefunded;
                });

                const returnHandledAmount = computed(() => {
                    return returnPaymentRecords.value.reduce((sum, record) => {
                        if (record.type === 'payment' || record.type === 'settlement') return sum + record.amount;
                        if (record.type === 'waiver') return sum + Math.abs(record.amount);
                        if (record.type === 'refund') return sum - Math.abs(record.amount);
                        return sum;
                    }, 0);
                });

                const monthlyReturnBillAmount = computed(() => {
                    if (!isMonthlyBilling.value || !returnFees.value) return 0;
                    const totalWaived = returnPaymentRecords.value
                        .filter(p => p.type === 'waiver')
                        .reduce((sum, p) => sum + Math.abs(p.amount), 0);
                    return Math.max(0, returnFees.value.total - totalWaived);
                });

                const returnRefundAmount = computed(() => Math.max(0, -returnBalanceDue.value));

                const returnOriginalPaymentChannels = computed(() => {
                    const returnPayments = returnPaymentRecords.value
                        .filter(p => (p.type === 'payment' || p.type === 'settlement') && p.amount > 0)
                        .map((p, index) => ({
                            id: `return-${index}`,
                            channel: p.channel,
                            amount: p.amount,
                            refNo: p.refNo,
                            time: p.time
                        }));

                    const orderPayments = paymentData.receivedPayments
                        .filter(p => p.amount > 0 && (p.type === 'payment' || (p.type === 'pre_auth' && p.status === 'captured')))
                        .map((p, index) => ({
                            id: `order-${index}`,
                            channel: p.channel,
                            amount: p.amount,
                            refNo: p.refNo,
                            time: p.time
                        }));

                    return returnPayments.length > 0 ? returnPayments : orderPayments;
                });

                const resetReturnPaymentRecords = () => {
                    returnPaymentRecords.value = [];
                };

                const prepareReturnDemoScenario = () => {
                    resetReturnPaymentRecords();
                    if (orderStatus.value === 'refund_pending') {
                        returnData.returnTime = new Date(planData.returnTime.getTime() - 48 * 3600000);
                        returnData.mileage = 13000;
                        returnData.fuel = 8;
                        returnData.returnStore = getReturnStoreIdFromLocation(orderView.location.return);
                        handleReturnStoreChange();
                        returnData.extraFees = [];
                    } else if (orderStatus.value === 'payment_due') {
                        returnData.returnTime = new Date(planData.returnTime.getTime() + 2 * 3600000);
                        returnData.mileage = 13600;
                        returnData.fuel = 6;
                        returnData.returnStore = getReturnStoreIdFromLocation(orderView.location.return);
                        handleReturnStoreChange();
                        returnData.extraFees = [
                            { name: '深度清潔費', amount: 300, type: 'charge', desc: '車內有異味 (人工添加)' },
                            { name: '外觀修復費', amount: 1500, type: 'charge', desc: '右前門刮痕 (人工添加)' }
                        ];
                    }
                };

                const openReturnPaymentDialog = (type = 'online') => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單不需要客戶補繳');
                        return;
                    }
                    paymentDialogType.value = type;
                    newPayment.gateway = type === 'online' ? 'jiekou' : 'cash';
                    newPayment.amount = Math.abs(returnBalanceDue.value);
                    newPayment.refNo = '';
                    newPayment.processing = false;
                    newPayment.context = 'return';
                    paymentDialogVisible.value = true;
                };

                const openReturnRefundDialog = () => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單不處理門店退款');
                        return;
                    }
                    if (returnRefundAmount.value <= 0) {
                        ElMessage.warning('當前沒有可退款金額');
                        return;
                    }

                    selectedReturnRefundChannel.value = returnOriginalPaymentChannels.value[0]?.id || '';
                    returnRefundDialogVisible.value = true;
                };

                const confirmReturnRefund = () => {
                    if (!selectedReturnRefundChannel.value || returnRefundAmount.value <= 0) {
                        ElMessage.warning('請確認原支付渠道');
                        return;
                    }

                    const channel = returnOriginalPaymentChannels.value.find(item => item.id === selectedReturnRefundChannel.value);
                    if (!channel) {
                        ElMessage.warning('未找到原支付渠道');
                        return;
                    }

                    returnPaymentRecords.value.push({
                        type: 'refund',
                        channel: channel.channel,
                        amount: -returnRefundAmount.value,
                        refNo: 'RF' + Date.now().toString().slice(-8),
                        time: new Date().toLocaleTimeString(),
                        remark: `原路退回 · 原交易 ${channel.refNo || '-'}`
                    });
                    returnRefundDialogVisible.value = false;
                    ElMessage.success('原路退款已確認');
                };

                const applyReturnSettlementStatus = () => {
                    if (isMonthlyBilling.value) {
                        orderStatus.value = 'settlement_pending';
                    } else if (returnBalanceDue.value > 0) {
                        orderStatus.value = 'payment_due';
                    } else if (returnBalanceDue.value < 0) {
                        orderStatus.value = 'refund_pending';
                    } else {
                        orderStatus.value = 'settlement_pending';
                    }
                };

                const ensureMonthlyReturnBillRecord = () => {
                    if (!isMonthlyBilling.value) return;
                    if (returnPaymentRecords.value.some(record => record.type === 'monthly_bill')) return;
                    returnPaymentRecords.value.push({
                        type: 'monthly_bill',
                        channel: '企業月結掛賬',
                        amount: monthlyReturnBillAmount.value,
                        refNo: 'BILL-RET-' + Date.now().toString().slice(-8),
                        time: new Date().toLocaleString(),
                        remark: `${paymentData.monthlyCompany} · 還車最終應收`
                    });
                };

                const openReturnModal = () => {
                    if (!canReturn.value) {
                        ElMessage.warning('當前訂單狀態不可辦理還車');
                        return;
                    }
                    returnPreviousStatus.value = orderStatus.value;
                    returnInspectionSubmitted.value = returnSettlementStatuses.includes(orderStatus.value);
                    if (returnInspectionSubmitted.value) {
                        prepareReturnDemoScenario();
                    }
                    returnStep.value = returnInspectionSubmitted.value ? 1 : 0;
                    returnModalVisible.value = true;
                };

                const requestCloseReturnModal = () => {
                    if (returnStep.value === 2) {
                        returnModalVisible.value = false;
                        return;
                    }
                    if (returnStep.value === 0 && !returnInspectionSubmitted.value) {
                        orderStatus.value = returnPreviousStatus.value;
                        returnModalVisible.value = false;
                        ElMessage.info('還車草稿已保留，訂單仍保持用車狀態');
                        return;
                    }
                    applyReturnSettlementStatus();
                    returnModalVisible.value = false;
                    ElMessage.info('結算已暫存，訂單狀態已更新');
                };

                const handleReturnDialogClose = (done) => {
                    if (returnStep.value === 2) {
                        done();
                        return;
                    }
                    ElMessageBox.confirm(
                        returnStep.value === 0 && !returnInspectionSubmitted.value
                            ? '關閉窗口後，訂單仍保持當前用車狀態，還車草稿會保留。'
                            : (isMonthlyBilling.value ? '關閉窗口後，訂單會進入待結算，後續繼續確認企業月結。' : '關閉窗口後，系統會按當前待結金額更新爲待補繳、待退款或待結算。'),
                        '暫停還車辦理',
                        {
                            confirmButtonText: '保存並關閉',
                            cancelButtonText: '繼續辦理',
                            type: 'warning'
                        }
                    ).then(() => {
                        requestCloseReturnModal();
                        done();
                    }).catch(() => {});
                };

                const nextReturnStep = () => {
                    if (returnStep.value === 1) {
                        // Payment/Refund Verification - block if not settled
                        if (returnBalanceDue.value !== 0) {
                            ElMessage.warning('請先完成費用結算');
                            return;
                        }
                        ensureMonthlyReturnBillRecord();
                        // Proceed to success step
                        orderStatus.value = 'completed';
                        returnStep.value++;
                        ElMessage.success(isMonthlyBilling.value ? '還車成功，費用已進入企業月結賬單！' : '還車成功！');
                    } else if (returnStep.value === 2) {
                        // Close modal from success step
                        returnModalVisible.value = false;
                    } else {
                        // Step 0 -> 1
                        if (returnData.mileage < pickupData.mileage) {
                            ElMessage.warning('還車里程不能小於取車里程');
                            return;
                        }
                        if (!returnData.parking.station) {
                            ElMessage.warning('請選擇車輛最終停放的歸還據點');
                            return;
                        }
                        if (returnSignatureStatus.value !== 'signed') {
                            ElMessage.warning('請先完成客戶還車簽字確認');
                            return;
                        }
                        orderStatus.value = 'settlement_pending';
                        returnInspectionSubmitted.value = true;
                        returnStep.value++;
                    }
                };

                // Redirection History
                const showRedirectionHistory = ref(false);
                const redirectionHistory = ref([
                    {
                        id: 1,
                        time: '2026-01-28 10:30',
                        fromVehicle: 'Toyota Vios (DEF-5678)',
                        toVehicle: 'Toyota Corolla Altis (ABC-1234)',
                        priceChange: 300,
                        priceHandling: 'diff',
                        settlementText: '取車補收',
                        reason: '客戶要求升級車型',
                        operator: 'Admin'
                    },
                    {
                        id: 2,
                        time: '2026-01-28 09:15',
                        fromVehicle: '系統自動分配',
                        toVehicle: 'Toyota Vios (DEF-5678)',
                        priceChange: 0,
                        priceHandling: 'diff',
                        settlementText: '不調整費用',
                        reason: '初始車輛分配',
                        operator: '系統'
                    }
                ]);

                // Invoice Records Mock Data
                const invoiceRecords = ref([
                    {
                        id: 1,
                        invoiceNo: 'INV-20260128-0001',
                        type: 'normal', // 'normal' | 'special'
                        issueTime: '2026-01-28 14:30:00',
                        amount: 1920,
                        status: 'issued',
                        items: [
                            { name: '車輛租金', amount: 1920 }
                        ],
                        showDetails: false
                    },
                    {
                        id: 2,
                        invoiceNo: 'INV-20260128-0002',
                        type: 'special', // 增值稅專票
                        issueTime: '2026-01-28 15:00:00',
                        amount: 300,
                        status: 'issued',
                        items: [
                            { name: '安心保障險', amount: 150 },
                            { name: '安全座椅 x2', amount: 100 },
                            { name: '座椅靠墊', amount: 30 },
                            { name: 'GPS導航儀', amount: 20 }
                        ],
                        showDetails: false
                    },
                    {
                        id: 3,
                        invoiceNo: 'INV-20260130-0003',
                        type: 'normal',
                        issueTime: '2026-01-30 10:00:00',
                        amount: 200,
                        status: 'pending',
                        items: [
                            { name: '超時還車費', amount: 150 },
                            { name: '燃油補差', amount: 50 }
                        ],
                        showDetails: false
                    }
                ]);

                // Signature Feature

                const signatureStatus = ref('idle'); // 'idle' | 'pushing' | 'pushed' | 'fetching'
                const signatureSource = ref(''); // 'app' | 'onsite'
                const signatureTime = ref('');

                // Push signature request to APP
                const pushSignatureToApp = () => {
                    signatureStatus.value = 'pushing';
                    setTimeout(() => {
                        signatureStatus.value = 'pushed';
                        ElMessage.success('簽名請求已推送至客戶APP');
                    }, 1000);
                };

                // Fetch signature from APP (refresh)
                const fetchAppSignature = () => {
                    signatureStatus.value = 'fetching';
                    // Simulate API call - in real scenario, this would check if customer has signed
                    setTimeout(() => {
                        // Simulate successful signature retrieval
                        pickupData.signed = true;
                        signatureSource.value = 'app';
                        signatureTime.value = new Date().toLocaleTimeString();
                        signatureStatus.value = 'idle';
                        ElMessage.success('已成功獲取客戶APP簽名');
                    }, 1500);
                };

                // Sign on-site (locally)
                const signOnSite = () => {
                    pickupData.signed = true;
                    signatureSource.value = 'onsite';
                    signatureTime.value = new Date().toLocaleTimeString();
                    signatureStatus.value = 'idle';
                    ElMessage.success('現場簽名完成');
                };

                // Reset signature
                const resetSignature = () => {
                    pickupData.signed = false;
                    signatureSource.value = '';
                    signatureTime.value = '';
                    signatureStatus.value = 'idle';
                };

                // Damage Photos Feature
                const damagePhotos = ref([]);
                const showDamageTypeDialog = ref(false);
                const damageCategories = [
                    { value: 'exterior', label: '外觀損傷', icon: 'Van' },
                    { value: 'interior', label: '內飾異常', icon: 'Sofa' },
                    { value: 'mechanical', label: '機械故障', icon: 'Setting' },
                    { value: 'other', label: '其他異常', icon: 'Warning' }
                ];
                const newDamage = reactive({
                    category: 'exterior',
                    type: '',
                    description: ''
                });

                // openDamageDialog moved to top level with context

                const confirmAddDamage = () => {
                    if (!newDamage.type) {
                        ElMessage.warning('請輸入損傷位置或名稱');
                        return;
                    }
                    const newItem = {
                        id: Date.now(),
                        category: newDamage.category,
                        type: newDamage.type,
                        description: '',
                        photos: [],
                        time: new Date().toLocaleTimeString()
                    };

                    if (damageDialogContext.value === 'pickup') {
                        damagePhotos.value.push(newItem);
                    } else {
                        returnDamagePhotos.value.push(newItem);
                    }

                    showDamageTypeDialog.value = false;
                    ElMessage.warning('已添加: ' + newDamage.type);
                };

                const addDamagePhoto = () => {
                    openDamageDialog('pickup');
                };

                const removeDamagePhoto = (id, context) => {
                    // Check logic? Or just pass context?
                    // UI needs to pass context: @click="removeDamagePhoto(id, 'return')"
                    if (!context) context = 'pickup'; // Default

                    if (context === 'pickup') {
                        damagePhotos.value = damagePhotos.value.filter(p => p.id !== id);
                    } else {
                        returnDamagePhotos.value = returnDamagePhotos.value.filter(p => p.id !== id);
                    }
                    ElMessage.info('已移除損傷記錄');
                };

                const bookingPreAuthPercent = 30;
                const bookingPreAuthAmount = isMonthlyBilling.value ? 0 : Math.ceil(orderView.amount * bookingPreAuthPercent / 100);
                const hasBookingPreAuth = !isMonthlyBilling.value && orderView.paymentStatus !== 'unpaid' && orderView.status !== 'pending_payment';
                const hasPickupRentPayment = !isMonthlyBilling.value && ['renting', 'renewing', 'overdue', 'accident_processing', 'settlement_pending', 'payment_due', 'refund_pending', 'completed'].includes(orderStatus.value);
                const initialCustomerPaymentRecords = [];
                if (hasBookingPreAuth) {
                    initialCustomerPaymentRecords.push({ channel: '信用卡預授權押金', amount: bookingPreAuthAmount, refNo: 'AUTH-8829301', time: orderView.createTime + ':00', type: 'pre_auth', status: 'frozen' });
                }
                if (hasPickupRentPayment) {
                    initialCustomerPaymentRecords.push({ channel: '取車租金尾款', amount: orderView.amount, refNo: 'PAY-PICKUP-' + orderView.orderId.slice(-4), time: orderView.schedule.start, type: 'payment', status: 'confirmed' });
                }

                // Payment Data (Multi-Channel)
                const paymentData = reactive({
                    preAuthMode: 'guarantee', // 'guarantee' | 'rent_offset'
                    preAuthStatus: isMonthlyBilling.value ? 'not_required' : (hasBookingPreAuth ? 'frozen' : 'pending'), // 'pending' | 'processing' | 'frozen' | 'captured' | 'released' | 'cancelled' | 'not_required'
                    preAuthAmount: bookingPreAuthAmount, // 本期按租賃業務規則的租金比例模式 30% 模擬預授權押金
                    orderTotal: orderView.amount,
                    monthlyBillAmount: orderView.amount,
                    monthlyCompany: orderView.corporate?.name || '企業客戶',
                    feeDetails: {
                        rental: orderView.amount,           // 車輛租金
                        // 增值服務明細
                        serviceItems: [
                            { name: '安心保障險', amount: 150, icon: 'Shield' },
                            { name: '安全座椅 x2', amount: 100, icon: 'User' },
                            { name: '座椅靠墊', amount: 30, icon: 'Goods' },
                            { name: 'GPS導航儀', amount: 20, icon: 'Location' }
                        ],
                        // 優惠減免明細
                        discountItems: orderView.clientType === 'corporate' ? [
                            { name: '企業資格行銷方案', type: 'promo', amount: 200, code: 'CORP2026' }
                        ] : [
                            { name: '會員行銷優惠方案', type: 'promo', amount: 200, code: 'MEMBER2026' },
                            { name: '折扣碼減免', type: 'coupon', amount: 50, code: 'WINTER50' },
                            { name: '積分點數抵扣', type: 'points', amount: 30, points: 300 }
                        ]
                    },
                    receivedPayments: isMonthlyBilling.value ? [
                        { channel: '企業月結預計金額', amount: orderView.amount, refNo: 'BILL-EST-' + orderView.orderId.slice(-4), time: orderView.createTime + ':00', type: 'monthly_bill', status: 'estimated' }
                    ] : initialCustomerPaymentRecords // { channel, amount, refNo, time }
                });

                const paymentDialogVisible = ref(false);
                const paymentDialogType = ref('online'); // 'online' | 'offline'
                const newPayment = reactive({
                    amount: 0,
                    refNo: '',
                    processing: false,
                    gateway: 'jiekou',
                    context: 'pickup'
                });

                // Computed: Balance Due
                const balanceDue = computed(() => {
                    if (isMonthlyBilling.value) return 0;
                    let due = paymentData.orderTotal;
                    // Deduct received payments (exclude pre-auth records)
                    paymentData.receivedPayments.forEach(p => {
                        if (p.type !== 'pre_auth' && p.type !== 'monthly_bill') {
                            due -= p.amount;
                        }
                    });
                    if (paymentData.preAuthMode === 'rent_offset' && paymentData.preAuthStatus === 'captured') {
                        due -= Math.min(paymentData.preAuthAmount, paymentData.orderTotal);
                    }
                    return Math.max(0, due);
                });

                const pickupMarketingPlans = [
                    {
                        id: 'student',
                        name: '學生專案行銷方案',
                        version: 'MKT-STORE-STUDENT-20260420-001',
                        qualification: '學生身份',
                        scope: '需取車現場覈驗證明文件',
                        requiredDocText: '學生證、在學證明等可證明學生身份的文件',
                        manualVerification: true,
                        orderTotal: orderView.amount,
                        discountAmount: 280,
                        code: 'STUDENT85'
                    },
                    {
                        id: 'corp',
                        name: '企業資格行銷方案',
                        version: 'MKT-STORE-CORP-20260418-001',
                        qualification: '企業員工資格',
                        scope: '系統按企業關係判斷',
                        manualVerification: false,
                        orderTotal: orderView.amount,
                        discountAmount: 200,
                        code: 'CORP2026'
                    },
                    {
                        id: 'member',
                        name: '會員行銷方案',
                        version: 'MKT-STORE-MEMBER-20260418-001',
                        qualification: '個人會員資格',
                        scope: '系統按會員方案判斷',
                        manualVerification: false,
                        orderTotal: orderView.amount + 160,
                        discountAmount: 120,
                        code: 'MEMBER2026'
                    },
                    {
                        id: 'weekday',
                        name: '平日行銷方案',
                        version: 'MKT-STORE-WEEKDAY-20260412-003',
                        qualification: '平日用車條件',
                        scope: '系統按用車時間判斷',
                        manualVerification: false,
                        orderTotal: orderView.amount + 80,
                        discountAmount: 200,
                        code: 'WEEKDAY200'
                    },
                    {
                        id: 'none',
                        name: '不使用優惠/默認方案',
                        version: 'PRICE-STORE-BASE-20260401-001',
                        qualification: '無額外資格要求',
                        scope: '按標準價計費',
                        manualVerification: false,
                        orderTotal: orderView.amount + 280,
                        discountAmount: 0,
                        code: ''
                    }
                ];

                const findPickupMarketingPlan = (id) => {
                    return pickupMarketingPlans.find(plan => plan.id === id) || pickupMarketingPlans[0];
                };

                const currentPickupMarketingPlan = computed(() => findPickupMarketingPlan(pickupData.marketingPlanId));
                const requiresPickupQualification = computed(() => !!currentPickupMarketingPlan.value.manualVerification);
                const uploadedQualificationCount = computed(() => pickupData.qualificationFiles.filter(doc => doc.uploaded).length);
                const qualificationDocsComplete = computed(() => {
                    return !requiresPickupQualification.value || uploadedQualificationCount.value > 0;
                });
                const availablePickupReplacementPlans = computed(() => {
                    return pickupMarketingPlans.filter(plan => {
                        if (plan.id === pickupData.marketingPlanId) return false;
                        if (plan.manualVerification) return false;
                        if (orderView.clientType === 'corporate') return ['corp', 'none'].includes(plan.id);
                        return plan.id !== 'corp';
                    });
                });
                const selectedReplacementPickupPlan = computed(() => {
                    return pickupData.replacementPromoId ? findPickupMarketingPlan(pickupData.replacementPromoId) : null;
                });
                const qualificationPriceDelta = computed(() => {
                    return selectedReplacementPickupPlan.value ? selectedReplacementPickupPlan.value.orderTotal - orderView.amount : 0;
                });
                const qualificationPriceDeltaAbs = computed(() => Math.abs(qualificationPriceDelta.value));
                const canProceedPickupQualification = computed(() => {
                    if (!requiresPickupQualification.value) return true;
                    if (pickupData.promoQualificationStatus === 'passed') return qualificationDocsComplete.value;
                    if (pickupData.promoQualificationStatus === 'failed') return !!selectedReplacementPickupPlan.value;
                    return false;
                });

                const syncPickupMarketingAmount = (plan) => {
                    paymentData.orderTotal = plan.orderTotal;
                    paymentData.monthlyBillAmount = plan.orderTotal;
                    orderView.promotionText = plan.name;
                    const nonPromoItems = paymentData.feeDetails.discountItems.filter(item => item.type !== 'promo');
                    paymentData.feeDetails.discountItems = plan.discountAmount > 0
                        ? [{ name: plan.name, type: 'promo', amount: plan.discountAmount, code: plan.code }, ...nonPromoItems]
                        : nonPromoItems;
                };

                const handleQualificationStatusChange = (status) => {
                    if (status === 'passed') {
                        pickupData.replacementPromoId = '';
                        pickupData.promoQualificationReason = '';
                        pickupData.marketingChangeApplied = false;
                        syncPickupMarketingAmount(currentPickupMarketingPlan.value);
                        ElMessage.success('行銷方案資格覈驗通過');
                    }
                    if (status === 'failed') {
                        ElMessage.warning('請更換行銷方案或改爲不使用優惠後繼續');
                    }
                };

                const markQualificationFileUploaded = (doc) => {
                    doc.uploaded = true;
                    ElMessage.success(`證明文件 ${doc.index} 已添加`);
                };

                const applyPickupMarketingPlanChange = () => {
                    const plan = selectedReplacementPickupPlan.value;
                    if (!plan) return;
                    pickupData.marketingChangeApplied = true;
                    syncPickupMarketingAmount(plan);
                    operationRecords.value.unshift({
                        title: '取車時更換行銷方案',
                        content: `${currentPickupMarketingPlan.value.name} -> ${plan.name}，原因：${pickupData.promoQualificationReason || '優惠資格覈驗不通過'}，訂單總額重算爲 ¥${formatNumber(plan.orderTotal)}`,
                        timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
                        operator: pickupLock.operator || 'Admin',
                        type: 'warning',
                        color: '#f59e0b',
                        hollow: false
                    });
                    ElMessage.success('已按新行銷方案重算取車尾款');
                };

                const actualPaidAmount = computed(() => {
                    return paymentData.receivedPayments
                        .filter(p => {
                            if (p.type === 'monthly_bill') return false;
                            if (p.type === 'pre_auth') return p.status === 'captured';
                            return true;
                        })
                        .reduce((sum, p) => sum + p.amount, 0);
                });

                const paymentDialogDueAmount = computed(() => {
                    if (newPayment.context === 'booking') return paymentData.preAuthAmount;
                    return newPayment.context === 'return' ? Math.abs(returnBalanceDue.value) : balanceDue.value;
                });

                const paymentDialogTitle = computed(() => {
                    if (newPayment.context === 'booking') return '確認預授權押金';
                    if (newPayment.context === 'return') return '還車結算收款';
                    return '添加收款';
                });

                const paymentDialogAmountLabel = computed(() => {
                    if (newPayment.context === 'booking') return '本次預授權金額';
                    return '收款金額';
                });

                const paymentDialogAmountHint = computed(() => {
                    if (newPayment.context === 'booking') return '預授權押金';
                    return newPayment.context === 'return' ? '待結金額' : '應收尾款';
                });

                const paymentDialogSubmitText = computed(() => {
                    if (newPayment.context === 'booking') return '發起預授權';
                    return paymentDialogType.value === 'online' ? '發起支付' : '確認收款';
                });

                // Computed: Pre-Auth Status Display
                const preAuthStatusType = computed(() => {
                    const map = { pending: 'info', processing: 'warning', frozen: 'success', captured: 'success', released: 'info', cancelled: 'danger', not_required: 'info' };
                    return map[paymentData.preAuthStatus] || 'info';
                });
                const preAuthStatusText = computed(() => {
                    const map = { pending: '待發起', processing: '處理中', frozen: '已凍結', captured: '已扣款', released: '已釋放', cancelled: '已取消', not_required: '無需預授權' };
                    return map[paymentData.preAuthStatus] || '未知';
                });

                // Computed: Can proceed to next step
                const canProceedPayment = computed(() => {
                    if (isMonthlyBilling.value) return true;
                    const preAuthOK = paymentData.preAuthMode === 'rent_offset'
                        ? paymentData.preAuthStatus === 'captured'
                        : ['frozen', 'released'].includes(paymentData.preAuthStatus);
                    const balanceOK = balanceDue.value <= 0;
                    return preAuthOK && balanceOK;
                });

                const syncPreAuthRecord = (status, channel) => {
                    let record = paymentData.receivedPayments.find(p => p.type === 'pre_auth');
                    if (!record) {
                        record = {
                            channel,
                            amount: paymentData.preAuthAmount,
                            refNo: 'AUTH-' + Date.now().toString().slice(-6),
                            time: new Date().toLocaleTimeString(),
                            type: 'pre_auth',
                            status
                        };
                        paymentData.receivedPayments.unshift(record);
                        return;
                    }
                    record.status = status;
                    record.channel = channel;
                    record.time = new Date().toLocaleTimeString();
                };

                const selectPreAuthMode = (mode) => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單無需處理預授權');
                        return;
                    }
                    paymentData.preAuthMode = mode;
                    if (mode === 'rent_offset') {
                        paymentData.preAuthStatus = 'captured';
                        syncPreAuthRecord('captured', '預授權扣款轉租金');
                        ElMessage.success('已選擇預授權轉租金，押金扣款將抵扣租金');
                    } else {
                        if (paymentData.preAuthStatus !== 'released') {
                            paymentData.preAuthStatus = 'frozen';
                            syncPreAuthRecord('frozen', '信用卡預授權押金');
                        }
                        ElMessage.success('已選擇履約擔保，確認發車後釋放預授權');
                    }
                };

                const releaseGuaranteePreAuth = () => {
                    if (paymentData.preAuthMode !== 'guarantee' || paymentData.preAuthStatus !== 'frozen') return false;
                    paymentData.preAuthStatus = 'released';
                    syncPreAuthRecord('released', '履約擔保預授權釋放');
                    return true;
                };

                // Methods: Pre-Auth
                const handlePreAuth = () => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單無需發起預授權');
                        return;
                    }
                    paymentData.preAuthStatus = 'processing';
                    setTimeout(() => {
                        if (paymentData.preAuthMode === 'rent_offset') {
                            paymentData.preAuthStatus = 'captured';
                            syncPreAuthRecord('captured', '預授權扣款轉租金');
                            ElMessage.success('預授權已扣款並轉爲租金');
                        } else {
                            paymentData.preAuthStatus = 'frozen';
                            syncPreAuthRecord('frozen', '信用卡預授權押金');
                            ElMessage.success('預授權已凍結');
                        }
                    }, 1500);
                };

                // User Credit Cards (Mock Data)
                const userCreditCards = ref([
                    { id: 'card1', last4: '4567', brand: 'Visa', expiry: '12/26', isDefault: true },
                    { id: 'card2', last4: '8901', brand: 'MasterCard', expiry: '08/25', isDefault: false }
                ]);
                const selectedCreditCard = ref('card1');

                // Methods: Payment Dialog
                const openPaymentDialog = () => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單不需要客戶現場支付');
                        return;
                    }
                    paymentDialogType.value = 'online';
                    newPayment.gateway = 'jiekou';
                    newPayment.amount = balanceDue.value;
                    newPayment.refNo = '';
                    newPayment.processing = false;
                    newPayment.context = 'pickup';
                    selectedCreditCard.value = userCreditCards.value.find(c => c.isDefault)?.id || '';
                    paymentDialogVisible.value = true;
                };

                const openBookingPaymentDialog = () => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單創建後直接進入已預訂，不需要客戶支付或預授權');
                        return;
                    }
                    if (orderStatus.value !== 'pending_payment') {
                        ElMessage.info('當前訂單已完成下單預授權');
                        return;
                    }
                    paymentDialogType.value = 'online';
                    newPayment.gateway = 'credit_card';
                    newPayment.amount = paymentData.preAuthAmount;
                    newPayment.refNo = '';
                    newPayment.processing = false;
                    newPayment.context = 'booking';
                    selectedCreditCard.value = userCreditCards.value.find(c => c.isDefault)?.id || '';
                    paymentDialogVisible.value = true;
                };

                const showPaymentDialog = (type) => {
                    paymentDialogType.value = type;
                    newPayment.gateway = type === 'online' ? 'jiekou' : 'cash';
                    newPayment.amount = balanceDue.value;
                    newPayment.refNo = '';
                    newPayment.processing = false;
                    newPayment.context = 'pickup';
                    paymentDialogVisible.value = true;
                };

                const confirmPayment = () => {
                    if (!newPayment.amount || newPayment.amount <= 0) {
                        ElMessage.warning('請輸入有效金額');
                        return;
                    }
                    if (newPayment.context === 'booking' && paymentDialogType.value !== 'online') {
                        ElMessage.warning('下單預授權押金僅支持線上預授權');
                        paymentDialogType.value = 'online';
                        newPayment.gateway = 'credit_card';
                        return;
                    }
                    if (paymentDialogType.value === 'online' && newPayment.gateway === 'credit_card' && !selectedCreditCard.value) {
                        ElMessage.warning('請選擇信用卡');
                        return;
                    }
                    newPayment.processing = true;
                    setTimeout(() => {
                        const channelMap = {
                            jiekou: '街口支付', lanxin: '藍心支付',
                            credit_card: '信用卡支付',
                            cash: '現金', pos: 'POS刷卡', transfer: '公司轉賬'
                        };
                        let channelName = channelMap[newPayment.gateway] || newPayment.gateway;
                        if (newPayment.gateway === 'credit_card') {
                            const card = userCreditCards.value.find(c => c.id === selectedCreditCard.value);
                            if (card) channelName = `${card.brand} ****${card.last4}`;
                        }

                        const finalAmount = parseFloat(newPayment.amount);
                        const refNo = newPayment.refNo || (newPayment.context === 'booking' ? 'AUTH' : 'TXN') + Date.now();

                        if (newPayment.context === 'booking') {
                            paymentData.preAuthAmount = finalAmount;
                            paymentData.preAuthStatus = 'frozen';
                            const preAuthRecord = paymentData.receivedPayments.find(p => p.type === 'pre_auth');
                            const record = {
                                channel: `${channelName}預授權押金`,
                                amount: finalAmount,
                                refNo,
                                time: new Date().toLocaleTimeString(),
                                type: 'pre_auth',
                                status: 'frozen'
                            };
                            if (preAuthRecord) {
                                Object.assign(preAuthRecord, record);
                            } else {
                                paymentData.receivedPayments.unshift(record);
                            }
                            transactions.value.unshift({
                                id: 'TXN-AUTH-' + Date.now(),
                                feeIds: [],
                                type: 'pre_auth',
                                txnType: 'pre_auth_freeze',
                                amount: finalAmount,
                                channel: newPayment.gateway,
                                channelType: paymentDialogType.value,
                                refNo,
                                status: 'confirmed',
                                receiptImage: null,
                                operator: 'system',
                                createdAt: new Date().toLocaleString(),
                                remark: '待支付訂單補收預授權押金'
                            });
                            orderStatus.value = 'reserved';
                            orderView.status = 'reserved';
                            orderView.paymentStatus = 'deposit_paid';
                            operationRecords.value.unshift({
                                title: '預授權押金確認',
                                content: `下單階段預授權押金 ¥${formatNumber(finalAmount)} 已確認，訂單進入已預訂`,
                                timestamp: new Date().toLocaleString(),
                                sortTime: Date.now(),
                                operator: '門店管理員 (當前)',
                                color: '#409EFF'
                            });
                            ElMessage.success('預授權押金已確認，訂單已進入已預訂');
                        } else {
                            const record = {
                                channel: channelName,
                                amount: finalAmount,
                                refNo,
                                time: new Date().toLocaleTimeString(),
                                type: newPayment.context === 'return' ? 'settlement' : 'payment'
                            };

                            if (newPayment.context === 'return') {
                                returnPaymentRecords.value.push(record);
                                ElMessage.success('結算成功');
                            } else {
                                paymentData.receivedPayments.push(record);
                                if (paymentData.preAuthMode === 'guarantee') {
                                    ElMessage.success('尾款收款成功，確認發車後釋放履約擔保預授權');
                                } else {
                                    ElMessage.success('收款成功，預授權扣款已抵扣租金');
                                }
                            }
                        }

                        newPayment.processing = false;
                        paymentDialogVisible.value = false;
                    }, 1000);
                };

                const openPickupModal = () => {
                    if (!canPickup.value) {
                        ElMessage.warning('當前訂單狀態不可辦理取車');
                        return;
                    }
                    if (orderStatus.value !== 'inspecting') {
                        pickupPreviousStatus.value = orderStatus.value;
                        orderStatus.value = 'inspecting';
                        pickupStep.value = 0;
                        startPickupLock();
                    } else if (!pickupLock.expiresAt) {
                        startPickupLock();
                    } else {
                        pickupInterrupted.value = false;
                    }
                    pickupModalVisible.value = true;
                };

                const markPickupInterrupted = () => {
                    if (pickupStep.value < 3 && orderStatus.value === 'inspecting') {
                        pickupInterrupted.value = true;
                        ElMessage.info('取車草稿已保留，訂單保持驗車中，可繼續辦理取車');
                    }
                };

                const requestClosePickupModal = () => {
                    if (pickupStep.value === 3) {
                        pickupModalVisible.value = false;
                        return;
                    }
                    markPickupInterrupted();
                    pickupModalVisible.value = false;
                };

                const handlePickupDialogClose = (done) => {
                    if (pickupStep.value === 3) {
                        done();
                        return;
                    }
                    ElMessageBox.confirm(
                        '關閉窗口後，訂單將保持“驗車中”，取車草稿和操作鎖會繼續保留。可在訂單列表或詳情頁點擊“繼續取車”恢復辦理。',
                        '暫停取車辦理',
                        {
                            confirmButtonText: '保存並關閉',
                            cancelButtonText: '繼續辦理',
                            type: 'warning'
                        }
                    ).then(() => {
                        markPickupInterrupted();
                        done();
                    }).catch(() => {});
                };

                const releasePickupLock = () => {
                    if (orderStatus.value !== 'inspecting') return;
                    orderStatus.value = pickupPreviousStatus.value || 'reserved';
                    pickupStep.value = 0;
                    pickupInterrupted.value = false;
                    pickupLock.startedAt = '';
                    pickupLock.expiresAt = '';
                    ElMessage.success('操作鎖已釋放，取車草稿已作廢，系統會按當前時間重新判定訂單狀態');
                };

                const nextPickupStep = () => {
                    if (pickupStep.value === 0) {
                        if (!pickupData.isPersonMatched) {
                            ElMessage.warning('請勾選"確認人證合一"以繼續');
                            return;
                        }
                        if (!canProceedPickupQualification.value) {
                            if (pickupData.promoQualificationStatus === 'pending') {
                                ElMessage.warning('請先完成行銷方案資格覈驗');
                            } else if (pickupData.promoQualificationStatus === 'passed' && !qualificationDocsComplete.value) {
                                ElMessage.warning('請至少上傳 1 個證明文件');
                            } else {
                                ElMessage.warning('請更換行銷方案或改爲不使用優惠');
                            }
                            return;
                        }
                        pickupStep.value++;
                    } else if (pickupStep.value === 1) {
                        // 取車階段同時阻斷預授權押金與應收尾款。
                        if (!canProceedPayment.value) {
                            if (paymentData.preAuthStatus === 'pending' || paymentData.preAuthStatus === 'processing') {
                                ElMessage.warning('請先完成預授權操作');
                            } else if (balanceDue.value > 0) {
                                ElMessage.warning('請結清應收尾款 ' + formatNumber(balanceDue.value));
                            } else {
                                ElMessage.warning(paymentData.preAuthMode === 'rent_offset' ? '請先完成預授權扣款轉租金' : '請先完成預授權押金凍結');
                            }
                            return;
                        }
                        pickupStep.value++;
                    } else if (pickupStep.value === 2) {
                        // Validation for Step 2
                        if (!pickupData.signed) {
                            ElMessage.warning('請顧客簽署租賃合約');
                            return;
                        }
                        if (!pickupData.deliveryLocation) {
                            ElMessage.warning('請填寫交付位置');
                            return;
                        }
                        if (!pickupData.mileage || pickupData.mileage <= 0) {
                            ElMessage.warning('請填寫當前里程');
                            return;
                        }
                        // Confirm dispatch
                        processing.value = true;
                        setTimeout(() => {
                            const guaranteeReleased = releaseGuaranteePreAuth();
                            processing.value = false;
                            orderStatus.value = 'renting';
                            pickupInterrupted.value = false;
                            pickupLock.startedAt = '';
                            pickupLock.expiresAt = '';
                            pickupStep.value++;
                            ElMessage.success(guaranteeReleased ? '發車成功，履約擔保預授權已釋放' : '發車成功');
                        }, 1000);
                    } else {
                        pickupModalVisible.value = false;
                    }
                };

                // Photo Gallery Logic
                const photoGalleryVisible = ref(false);
                const photoGalleryTab = ref('exterior');
                const photoGalleryContext = ref('pickup');

                const openPhotoGallery = (context) => {
                    photoGalleryContext.value = context;
                    photoGalleryVisible.value = true;
                    photoGalleryTab.value = 'exterior';
                };

                // Signature View
                const signatureDialogVisible = ref(false);
                const currentSignatureTime = ref('');
                const currentSignatureName = ref('');

                const viewSignature = (row) => {
                    if (!row.signed) return;
                    currentSignatureTime.value = row.signTime;
                    currentSignatureName.value = orderView.customer.name;
                    signatureDialogVisible.value = true;
                };

                const pickupReturnData = computed(() => {
                    // Pickup Row
                    const pickupRow = {
                        type: '取車',
                        context: 'pickup',
                        time: '2024/05/01 09:30',
                        station: orderView.location.pickup?.split(' - ')[0] || '取車門市',
                        stationSub: `車輛所在據點: ${pickupVehicleStationText.value} · 交付位置: ${pickupData.deliveryLocation}`,
                        mileage: '12,450 km',
                        fuel: '80%',
                        photos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 6+3+2 = 11 photos
                        signed: true,
                        signTime: '09:35',
                        operator: '張三',
                        isPending: false
                    };

                    // Return Row
                    const isReturned = orderStatus.value === 'completed';
                    const returnRow = {
                        type: '還車',
                        context: 'return',
                        time: isReturned ? '2024/05/05 14:30' : '2024/05/05 11:11 (預計)',
                        station: isReturned ? getReturnStoreLabel(returnData.returnStore) : orderView.location.return,
                        stationSub: isReturned ? `歸還據點: ${getReturnStationLabel(returnData.parking.station)}` : '預計還車門市',
                        mileage: isReturned ? '13,120 km' : '-',
                        fuel: isReturned ? '60%' : '-',
                        photos: isReturned ? [1, 2, 3, 4] : [],
                        signed: isReturned,
                        signTime: isReturned ? '14:35' : '',
                        operator: isReturned ? '李四' : '-',
                        isPending: !isReturned
                    };

                    return [pickupRow, returnRow];
                });

                const tableRowClassName = ({ row }) => {
                    return row.isPending ? 'bg-gray-50' : '';
                };

                // Computed: Main Page Fee Breakdown (Dynamic)
                const feeData = computed(() => {
                    const items = [];
                    // 1. Rental
                    items.push({ name: '車輛租金 (5天)', amount: paymentData.feeDetails.rental, isDiscount: false });

                    // 2. Services
                    paymentData.feeDetails.serviceItems.forEach(s => {
                        items.push({ name: s.name, amount: s.amount, isDiscount: false });
                    });

                    // 3. Discounts
                    paymentData.feeDetails.discountItems.forEach(d => {
                        items.push({
                            name: d.name,
                            amount: -d.amount, // Display as negative
                            isDiscount: true,
                            code: d.code,
                            points: d.points
                        });
                    });

                    return items;
                });

                const getSummaries = (param) => {
                    const { columns, data } = param;
                    const sums = [];
                    columns.forEach((column, index) => {
                        if (index === 0) {
                            sums[index] = '總計';
                            return;
                        }
                        // Simple manual sum for demo
                        sums[index] = '1,920';
                    });
                    return sums;
                };

                // Redirection Logic
                const redirectionModalVisible = ref(false);
                const activeTab = ref('manual');
                const selectedGroup = ref('');
                const selectedVehicleId = ref('');
                const selectedPromoId = ref('none');
                const newPrice = ref(null);
                const redirectionReason = ref('');
                const redirectionNote = ref('');
                const priceHandling = ref('diff');

                // Redirection pricing context
                const isMidRental = ref(false);
                const remainingDays = ref(2);

                // Original vehicle group (current order is 'sedan')
                const originalGroup = 'sedan';
                const currentBasePrice = 1920;

                // Computed: Check if group changed
                const isGroupChanged = computed(() => {
                    return selectedGroup.value && selectedGroup.value !== originalGroup;
                });

                // Computed: Should show promo selection
                // Only when: priceHandling = 'diff' (多退少補) AND group is changed
                const shouldShowPromoSelection = computed(() => {
                    if (!selectedVehicleId.value) return false;
                    if (!isGroupChanged.value) return false; // Same group = keep original promo
                    return priceHandling.value === 'diff'; // Only show if adjust price mode
                });

                const vehicleGroups = [
                    { name: '轎車組', key: 'sedan' },
                    { name: 'SUV組', key: 'suv' },
                    { name: 'MPV組', key: 'mpv' },
                ];

                const redirectionReasons = [
                    { value: 'vehicle_fault', label: '原車故障' },
                    { value: 'vehicle_not_ready', label: '原車未整備完成' },
                    { value: 'vehicle_unavailable', label: '原車事故/不可交付' },
                    { value: 'customer_upgrade', label: '客戶要求升級' },
                    { value: 'customer_downgrade', label: '客戶同意降級' },
                    { value: 'store_free_upgrade', label: '門店免費升等' },
                    { value: 'dispatch_adjustment', label: '車輛調度調整' },
                    { value: 'extend_conflict_followup', label: '續租衝突改派後續訂單' },
                    { value: 'return_store_conflict_followup', label: '轉單衝突改派後續訂單' },
                    { value: 'other', label: '其他' }
                ];

                const vehicles = {
                    sedan: [
                        { id: 's1', name: 'Toyota Vios', plate: 'ABC-5678', price: 1500, dealer: '北區合作車行', store: '新北總店', station: '停車場A', available: '當前時段可用', status: '空閒' },
                        { id: 's2', name: 'Nissan Sentra', plate: 'DEF-6621', price: 2000, dealer: '北區合作車行', store: '新北總店', station: '停車場B', available: '當前時段可用', status: '空閒' },
                    ],
                    suv: [
                        { id: 'suv1', name: 'Honda CR-V', plate: 'GHI-3456', price: 2500, dealer: '北區合作車行', store: '新北總店', station: '停車場A', available: '當前時段可用', status: '空閒' },
                        { id: 'suv2', name: 'Toyota RAV4', plate: 'RMO-8821', price: 2600, dealer: '北區合作車行', store: '新北總店', station: '停車場C', available: '可用，需備車', status: '空閒' },
                    ],
                    mpv: [
                        { id: 'mpv1', name: 'Honda Odyssey', plate: 'MPV-7788', price: 3500, dealer: '北區合作車行', store: '臺北車站店', station: '地下B2', available: '同車行跨門市協調', status: '空閒' },
                    ]
                };

                const promotions = [
                    { id: 'none', name: '不使用優惠/默認', discount: 0, type: 'none' },
                    { id: 'corp', name: '企業資格行銷方案 (9折)', discount: 0.1, type: 'rate' },
                    { id: 'weekday', name: '平日行銷方案 (-200)', discount: 200, type: 'amount' },
                    { id: 'member', name: '會員行銷方案 (85折)', discount: 0.15, type: 'rate' }
                ];

                const recommendations = [
                    { id: 'suv1', name: 'Honda CR-V', plate: 'GHI-3456', price: 2500, tag: '推薦升級', tagType: 'success', type: 'suv', dealer: '北區合作車行', store: '新北總店', station: '停車場A', available: '當前時段可用', status: '空閒' },
                    { id: 's1', name: 'Toyota Vios', plate: 'ABC-5678', price: 1500, tag: '省錢方案', tagType: 'warning', type: 'sedan', dealer: '北區合作車行', store: '新北總店', station: '停車場A', available: '當前時段可用', status: '空閒' }
                ];

                const currentVehicleList = computed(() => {
                    return selectedGroup.value ? vehicles[selectedGroup.value] : [];
                });

                const priceDiff = computed(() => {
                    if (newPrice.value === null) return 0;

                    if (isMidRental.value) {
                        // Simplified Logic: (New Daily - Old Daily) * Remaining Days
                        // Assuming 5 days total rental for base calculations
                        const oldDaily = currentBasePrice / 5;
                        const newDaily = newPrice.value / 5;
                        return (newDaily - oldDaily) * remainingDays.value;
                    }

                    return newPrice.value - currentBasePrice;
                });

                const handleGroupSelect = (key) => {
                    selectedGroup.value = key;
                    selectedVehicleId.value = '';
                    newPrice.value = null;
                };

                const calculatePrice = () => {
                    let vehicle = null;
                    // Search in all lists or recommendations
                    if (activeTab.value === 'manual' && selectedGroup.value) {
                        vehicle = vehicles[selectedGroup.value].find(v => v.id === selectedVehicleId.value);
                    } else {
                        // Search everywhere if needed, or from recs
                        vehicle = recommendations.find(v => v.id === selectedVehicleId.value);
                        if (!vehicle) {
                            // Fallback search
                            Object.values(vehicles).flat().forEach(v => {
                                if (v.id === selectedVehicleId.value) vehicle = v;
                            });
                        }
                    }

                    if (!vehicle) return;

                    let price = vehicle.price;
                    const promo = promotions.find(p => p.id === selectedPromoId.value);

                    if (promo) {
                        if (promo.type === 'rate') {
                            price = Math.round(price * (1 - promo.discount));
                        } else if (promo.type === 'amount') {
                            price = Math.max(0, price - promo.discount);
                        }
                    }

                    newPrice.value = price;
                }

                const selectRecommendation = (rec) => {
                    selectedVehicleId.value = rec.id;
                    // Auto select best promo
                    let bestPrice = Infinity;
                    let bestPromo = 'none';

                    promotions.forEach(p => {
                        let final = rec.price;
                        if (p.type === 'rate') final = final * (1 - p.discount);
                        else if (p.type === 'amount') final = Math.max(0, final - p.discount);

                        if (final < bestPrice) {
                            bestPrice = final;
                            bestPromo = p.id;
                        }
                    });

                    selectedPromoId.value = bestPromo;
                    calculatePrice();
                };

                const openRedirectionModal = () => {
                    if (!canRedirect.value) {
                        ElMessage.warning('當前訂單狀態不可改派');
                        return;
                    }
                    isMidRental.value = ['renting', 'renewing', 'overdue'].includes(orderStatus.value);
                    remainingDays.value = isMidRental.value ? 2 : 0;
                    redirectionModalVisible.value = true;
                    // Reset
                    selectedGroup.value = 'sedan';
                    selectedVehicleId.value = '';
                    selectedPromoId.value = 'none';
                    redirectionReason.value = '';
                    redirectionNote.value = '';
                    priceHandling.value = 'diff';
                    newPrice.value = null;
                    activeTab.value = 'manual';
                };

                const confirmRedirection = () => {
                    if (!selectedVehicleId.value) {
                        ElMessage.warning('請選擇改派車輛');
                        return;
                    }
                    if (!redirectionReason.value) {
                        ElMessage.warning('請選擇改派原因');
                        return;
                    }
                    // Find the selected vehicle name
                    let vehicleName = '';
                    if (activeTab.value === 'manual' && selectedGroup.value) {
                        const vehicle = vehicles[selectedGroup.value].find(v => v.id === selectedVehicleId.value);
                        if (vehicle) vehicleName = `${vehicle.name} (${vehicle.plate})`;
                    } else {
                        const rec = recommendations.find(v => v.id === selectedVehicleId.value);
                        if (rec) vehicleName = `${rec.name} (${rec.plate})`;
                    }

                    const rawDiff = Math.round(priceDiff.value || 0);
                    if (priceHandling.value === 'free' && rawDiff > 0 && !redirectionNote.value.trim()) {
                        ElMessage.warning('免費升等必須填寫原因說明');
                        return;
                    }
                    if (redirectionReason.value === 'other' && !redirectionNote.value.trim()) {
                        ElMessage.warning('選擇其他原因時必須填寫備註');
                        return;
                    }
                    const actualDiff = priceHandling.value === 'free' && rawDiff > 0 ? 0 : rawDiff;
                    const feePhase = isMidRental.value ? 'rental' : 'pickup';
                    const settlementText = isMonthlyBilling.value ? '企業月結' : (isMidRental.value ? '還車結算' : '取車補收');
                    const selectedReason = redirectionReasons.find(reason => reason.value === redirectionReason.value);
                    const reasonText = selectedReason ? selectedReason.label : '車輛改派';
                    const feeName = isMonthlyBilling.value
                        ? (actualDiff > 0 ? '企業月結調增' : '企業月結調減')
                        : (actualDiff > 0 ? '改派差價' : '改派退費');

                    redirectionHistory.value.unshift({
                        id: Date.now(),
                        time: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        fromVehicle: 'Toyota Corolla Altis (ABC-1234)',
                        toVehicle: vehicleName || '新車輛',
                        priceChange: actualDiff,
                        priceHandling: priceHandling.value,
                        settlementText,
                        reason: `${reasonText}${redirectionNote.value ? '：' + redirectionNote.value : ''}`,
                        operator: 'Admin'
                    });

                    if (actualDiff !== 0) {
                        feeItems.value.unshift({
                            id: 'FEE-REDIRECT-' + Date.now(),
                            type: isMonthlyBilling.value ? 'redirection_monthly_adjustment' : (actualDiff > 0 ? 'redirection_fee' : 'redirection_refund'),
                            source: 'manual',
                            name: feeName,
                            description: `${vehicleName || '新車輛'}，${settlementText}處理`,
                            amount: actualDiff,
                            paidAmount: 0,
                            status: isMonthlyBilling.value ? 'monthly_billing' : 'pending',
                            phase: feePhase === 'pickup' ? 'rental' : feePhase,
                            createdAt: new Date().toLocaleString(),
                            createdBy: 'Admin',
                            attachments: [],
                            reminder: !isMonthlyBilling.value && actualDiff > 0 ? { date: new Date().toISOString().split('T')[0], notified: false } : null,
                            editable: false
                        });
                    }

                    if (!isMidRental.value && actualDiff !== 0) {
                        paymentData.orderTotal += actualDiff;
                    }

                    operationRecords.value.unshift({
                        title: priceHandling.value === 'free' && rawDiff > 0 ? '免費升等' : '訂單改派',
                        content: `改派至 ${vehicleName || '新車輛'}，差價 ¥${formatNumber(actualDiff)}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '門店管理員 (當前)',
                        memo: `${reasonText}${redirectionNote.value ? '：' + redirectionNote.value : ''}`,
                        color: '#E6A23C'
                    });

                    ElMessage.success(isMonthlyBilling.value ? '訂單改派成功，差價將進入企業月結賬單！' : '訂單改派成功！');
                    redirectionModalVisible.value = false;
                    showRedirectionHistory.value = true; // Auto expand to show new record
                };

                // =============================================
                // FEE MANAGEMENT FEATURE
                // =============================================
                const feeModalVisible = ref(false);
                const feeStatusFilter = ref('all');
                const feePhaseFilter = ref('all'); // 'all' | 'rental' | 'post'
                const expandedFees = ref([]);

                // Fee Status Filters
                const feeStatusFilters = [
                    { value: 'all', label: '全部' },
                    { value: 'pending', label: '待收款' },
                    { value: 'partial', label: '部分收款' },
                    { value: 'monthly_billing', label: '企業月結' },
                    { value: 'paid', label: '已結清' },
                    { value: 'refunded', label: '已退款' },
                    { value: 'waived', label: '已減免' },
                    { value: 'released', label: '已釋放' },
                    { value: 'cancelled', label: '已取消' }
                ];

                // Fee Phase Filters (租期 vs 追繳)
                const feePhaseFilters = [
                    { value: 'all', label: '全部費用' },
                    { value: 'rental', label: '租期費用', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { value: 'post', label: '追繳費用', color: 'text-orange-600', bg: 'bg-orange-50' }
                ];

                // Fee Items Mock Data
                // phase: 'rental' = 租期內費用（還車時結算）
                // phase: 'post' = 訂單完成後追繳費用（獨立通知支付）
                const feeItems = ref([
                    // 1. Rental balance settled at pickup
                    {
                        id: 'FEE-001',
                        type: 'rental',
                        source: 'system',
                        name: '車輛租金',
                        description: '取車階段補收租金尾款 (2026-01-28 ~ 2026-02-02)',
                        amount: 1920,
                        paidAmount: 1920,
                        status: 'paid',
                        phase: 'rental',
                        createdAt: '2026-01-28 09:35',
                        createdBy: 'system',
                        attachments: [],
                        reminder: null,
                        editable: false
                    },
                    // 1.1 Extension rent, pending until return settlement
                    {
                        id: 'FEE-EXT-001',
                        type: 'extension_rent',
                        source: 'system',
                        name: '續租租金',
                        description: '延長用車 4 小時，還車時結算',
                        amount: 480,
                        paidAmount: 0,
                        status: 'pending',
                        phase: 'rental',
                        createdAt: '2026-01-29 11:30',
                        createdBy: 'system',
                        attachments: [],
                        reminder: { date: '2026-02-02', notified: false },
                        editable: false
                    },
                    // 2. Overtime Fee (Pending & Overdue)
                    {
                        id: 'FEE-002',
                        type: 'overtime',
                        source: 'system',
                        name: '超時費',
                        description: '超時2小時，含超時罰款 (系統自動計算)',
                        amount: 200,
                        paidAmount: 0,
                        status: 'pending',
                        phase: 'rental',
                        createdAt: '2026-01-30 14:00',
                        createdBy: 'system',
                        attachments: [],
                        reminder: { date: '2026-01-29', notified: false }, // Past date for overdue test
                        editable: false
                    },
                    // 3. Cleaning Fee (Manual & Pending)
                    {
                        id: 'FEE-003',
                        type: 'cleaning',
                        source: 'manual',
                        name: '車輛清潔費',
                        description: '還車時車內有大量泥沙',
                        amount: 300,
                        paidAmount: 0,
                        status: 'pending',
                        phase: 'rental',
                        createdAt: '2026-01-30 15:00',
                        createdBy: 'Admin',
                        attachments: [],
                        reminder: null,
                        editable: true
                    },
                    // 4. Damage Fee (Partially Paid)
                    {
                        id: 'FEE-004',
                        type: 'damage',
                        source: 'manual',
                        name: '劃痕修復',
                        description: '左前保險槓刮擦',
                        amount: 1500,
                        paidAmount: 500,
                        status: 'partial',
                        phase: 'rental',
                        createdAt: '2026-01-30 15:30',
                        createdBy: 'Admin',
                        attachments: [],
                        reminder: { date: '2026-02-05', notified: true },
                        editable: true
                    },
                    // 5. Pre-authorization deposit guarantee
                    {
                        id: 'FEE-005',
                        type: 'deposit',
                        source: 'system',
                        name: '預授權押金擔保',
                        description: '下單階段凍結，履約擔保模式取車確認發車後釋放',
                        amount: 666,
                        paidAmount: 0,
                        status: 'released',
                        phase: 'rental',
                        createdAt: '2026-01-28 10:00',
                        createdBy: 'system',
                        attachments: [],
                        reminder: null,
                        editable: false
                    },
                    // 6. Toll Fee (Multiple Small Payments)
                    {
                        id: 'FEE-006',
                        type: 'toll',
                        source: 'manual',
                        name: 'ETC通行費',
                        description: '高速通行費補繳',
                        amount: 125,
                        paidAmount: 125,
                        status: 'paid',
                        phase: 'rental',
                        createdAt: '2026-01-30 16:00',
                        createdBy: 'Admin',
                        attachments: [],
                        reminder: null,
                        editable: true
                    },
                    // 7. Cancelled Fee
                    {
                        id: 'FEE-007',
                        type: 'other',
                        source: 'manual',
                        name: '誤操作費用',
                        description: '測試取消狀態',
                        amount: 50,
                        paidAmount: 0,
                        status: 'cancelled',
                        phase: 'rental',
                        createdAt: '2026-01-30 16:05',
                        createdBy: 'Admin',
                        attachments: [],
                        reminder: null,
                        editable: true
                    },
                    // 8. Waived Fee
                    {
                        id: 'FEE-008',
                        type: 'other',
                        source: 'manual',
                        name: '服務費減免',
                        description: '客戶滿意度調整',
                        amount: 200,
                        paidAmount: 200,
                        status: 'waived',
                        phase: 'rental',
                        createdAt: '2026-01-30 16:30',
                        createdBy: 'Admin',
                        attachments: [],
                        reminder: null,
                        editable: false
                    },
                    // =============================================
                    // POST-COMPLETION SUPPLEMENTARY CHARGES (追繳費用)
                    // phase: 'post' - 訂單完成後產生，需獨立通知客戶支付
                    // =============================================
                    // 9. Violation Fee (Post-completion - Pending notification)
                    {
                        id: 'FEE-009',
                        type: 'violation',
                        source: 'manual',
                        name: '違章罰款',
                        description: '2026-01-29 超速20% (臺北市信義路)',
                        amount: 1800,
                        paidAmount: 0,
                        status: 'pending',
                        phase: 'post',
                        notifyStatus: 'pending', // pending/notified
                        createdAt: '2026-02-05 10:00',
                        createdBy: 'Admin',
                        attachments: ['violation_photo_001.jpg'],
                        reminder: { date: '2026-02-10', notified: false },
                        editable: true
                    },
                    // 10. Late-reported Toll Fee (Post-completion - Notified)
                    {
                        id: 'FEE-010',
                        type: 'toll',
                        source: 'manual',
                        name: 'ETC通行費(延遲)',
                        description: '2026-01-30 國道3號通行費 (賬單延遲到賬)',
                        amount: 85,
                        paidAmount: 0,
                        status: 'pending',
                        phase: 'post',
                        notifyStatus: 'notified', // Already notified customer
                        notifiedAt: '2026-02-03 14:00',
                        createdAt: '2026-02-03 10:00',
                        createdBy: 'Admin',
                        attachments: [],
                        reminder: null,
                        editable: true
                    },
                    // 11. Post-completion Damage (Paid)
                    {
                        id: 'FEE-011',
                        type: 'damage',
                        source: 'manual',
                        name: '底盤刮擦修復',
                        description: '還車檢查時未發現，後續保養髮現底盤有刮擦痕跡',
                        amount: 2500,
                        paidAmount: 2500,
                        status: 'paid',
                        phase: 'post',
                        notifyStatus: 'notified',
                        notifiedAt: '2026-02-01 09:00',
                        paidAt: '2026-02-02 16:00',
                        createdAt: '2026-02-01 08:30',
                        createdBy: 'Admin',
                        attachments: ['damage_undercarriage_001.jpg', 'damage_undercarriage_002.jpg'],
                        reminder: null,
                        editable: false
                    }
                ]);

                // Transaction Records Mock Data
                const transactions = ref([
                    // FEE-001: Pickup balance payment
                    {
                        id: 'TXN-001',
                        feeIds: ['FEE-001'],
                        type: 'payment',
                        txnType: 'sales', // General Sale
                        amount: 1920,
                        channel: 'jkopay',
                        channelType: 'online',
                        refNo: 'JK-20260128-001',
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'system',
                        createdAt: '2026-01-28 09:40',
                        remark: '取車時補收租金尾款'
                    },
                    // FEE-004: Partial Cash Payment
                    {
                        id: 'TXN-002',
                        feeIds: ['FEE-004'],
                        type: 'payment',
                        txnType: 'sales',
                        amount: 500,
                        channel: 'cash',
                        channelType: 'offline',
                        refNo: '-',
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'Admin',
                        createdAt: '2026-01-30 15:40',
                        remark: '客戶先付部分現金'
                    },
                    // FEE-005: Deposit guarantee frozen
                    {
                        id: 'TXN-003_PA',
                        feeIds: ['FEE-005'],
                        type: 'pre_auth',
                        txnType: 'pre_auth_freeze',
                        amount: 666,
                        channel: 'credit_card',
                        channelType: 'online',
                        cardInfo: { brand: 'VISA', last4: '4242' }, // Card Info
                        refNo: 'AUTH-8888-9999',
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'system',
                        createdAt: '2026-01-28 10:00',
                        remark: '下單預授權押金凍結'
                    },
                    // FEE-005: Deposit guarantee released after pickup
                    {
                        id: 'TXN-003',
                        feeIds: ['FEE-005'],
                        type: 'pre_auth',
                        txnType: 'pre_auth_release',
                        amount: 666,
                        channel: 'credit_card',
                        channelType: 'online',
                        cardInfo: { brand: 'VISA', last4: '4242' },
                        refNo: 'REL-8888-9999',
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'system',
                        createdAt: '2026-01-28 11:20',
                        remark: '取車確認發車後釋放履約擔保預授權'
                    },
                    // FEE-006: Multiple Payments (Split 1)
                    {
                        id: 'TXN-005',
                        feeIds: ['FEE-006'],
                        type: 'payment',
                        amount: 100,
                        channel: 'linepay',
                        channelType: 'online',
                        refNo: 'LP-123456',
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'Admin',
                        createdAt: '2026-01-30 16:10',
                        remark: ''
                    },
                    // FEE-006: Multiple Payments (Split 2)
                    {
                        id: 'TXN-006',
                        feeIds: ['FEE-006'],
                        type: 'payment',
                        amount: 25,
                        channel: 'cash',
                        channelType: 'offline',
                        refNo: '-',
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'Admin',
                        createdAt: '2026-01-30 16:15',
                        remark: '零頭現金支付'
                    },
                    // [NEW] Merged Payment (Paying for Overtime + Cleaning together)
                    {
                        id: 'TXN-007',
                        feeIds: ['FEE-002', 'FEE-003'], // Merged Payment
                        type: 'payment',
                        amount: 500, // 200 + 300
                        channel: 'credit_card',
                        channelType: 'online',
                        refNo: 'CC-MERGED-001',
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'Admin',
                        createdAt: '2026-01-31 10:00',
                        remark: '還車一併結算(超時+清潔)'
                    },
                    // [NEW] Waiver Transaction
                    {
                        id: 'TXN-008',
                        feeIds: ['FEE-008'],
                        type: 'waiver',
                        amount: 200,
                        channel: 'system',
                        channelType: 'internal',
                        refNo: 'WAIVE-001',
                        status: 'confirmed', // or 'success'
                        receiptImage: null,
                        operator: 'Admin',
                        createdAt: '2026-01-30 16:30',
                        remark: '客戶滿意度調整 - 全額減免'
                    }
                ]);

                const createMonthlyBillTransaction = (feeId, amount, remark) => {
                    if (!isMonthlyBilling.value || !amount || amount <= 0) return;
                    const now = Date.now();
                    transactions.value.unshift({
                        id: 'TXN-MONTHLY-' + now,
                        feeIds: feeId ? [feeId] : [],
                        type: 'monthly_bill',
                        txnType: 'monthly_bill',
                        amount,
                        channel: 'monthly_bill',
                        channelType: 'internal',
                        refNo: 'BILL-' + now.toString().slice(-8),
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'system',
                        createdAt: new Date().toLocaleString(),
                        remark
                    });
                };

                const seedPostChargeFromUrl = () => {
                    if (!postChargeView.status || postChargeView.amount <= 0) return;
                    feeItems.value = feeItems.value.filter(fee => fee.phase !== 'post');
                    const nowText = new Date().toLocaleString();
                    const statusConfig = {
                        pending_notify: { status: 'pending', paidAmount: 0, notifyStatus: 'pending' },
                        notified: { status: 'pending', paidAmount: 0, notifyStatus: 'notified' },
                        payment_due: { status: 'pending', paidAmount: 0, notifyStatus: 'notified' },
                        monthly_billing: { status: 'monthly_billing', paidAmount: 0, notifyStatus: undefined },
                        paid: { status: 'paid', paidAmount: postChargeView.amount, notifyStatus: 'notified' }
                    }[postChargeView.status] || { status: 'pending', paidAmount: 0, notifyStatus: 'pending' };

                    feeItems.value.unshift({
                        id: 'FEE-URL-POST',
                        type: 'post_charge',
                        source: 'manual',
                        name: postChargeView.count > 1 ? `完成後追繳 ${postChargeView.count} 項` : '完成後追繳',
                        description: isMonthlyBilling.value ? '列表帶入：企業月結追繳已掛賬' : '列表帶入：完成後追繳費用',
                        amount: postChargeView.amount,
                        paidAmount: statusConfig.paidAmount,
                        status: statusConfig.status,
                        phase: 'post',
                        notifyStatus: statusConfig.notifyStatus,
                        notifiedAt: ['notified', 'payment_due', 'paid'].includes(postChargeView.status) ? nowText : undefined,
                        paidAt: postChargeView.status === 'paid' ? nowText : undefined,
                        createdAt: nowText,
                        createdBy: 'Admin',
                        attachments: [],
                        reminder: isMonthlyBilling.value || statusConfig.status === 'paid' ? null : { date: new Date().toISOString().split('T')[0], notified: postChargeView.status !== 'pending_notify' },
                        editable: true
                    });

                    if (postChargeView.status === 'monthly_billing') {
                        createMonthlyBillTransaction('FEE-URL-POST', postChargeView.amount, '列表帶入：完成後追繳月結掛賬');
                    } else if (postChargeView.status === 'paid') {
                        transactions.value.unshift({
                            id: 'TXN-URL-POST',
                            feeIds: ['FEE-URL-POST'],
                            type: 'payment',
                            txnType: 'sales',
                            amount: postChargeView.amount,
                            channel: 'jkopay',
                            channelType: 'online',
                            refNo: 'POST-PAID-' + Date.now().toString().slice(-6),
                            status: 'confirmed',
                            receiptImage: null,
                            operator: 'system',
                            createdAt: nowText,
                            remark: '列表帶入：追繳費用已結清'
                        });
                    }
                };
                seedPostChargeFromUrl();

                // Helper for TXN Type Label
                const getTxnTypeLabel = (type, txnType) => {
                    if (type === 'refund') return { text: '退款', type: 'danger' };
                    if (type === 'waiver') return { text: '費項減免', type: 'info' };
                    if (type === 'monthly_bill') return { text: '企業月結', type: 'primary' };
                    if (txnType === 'pre_auth_freeze') return { text: '預授權凍結', type: 'warning' };
                    if (txnType === 'pre_auth_capture') return { text: '預授權扣款', type: 'success' };
                    if (txnType === 'pre_auth_release') return { text: '預授權釋放', type: 'info' };
                    return { text: '交易支付', type: 'success' };
                };

                // Manual Fee Types for Add Dialog
                const manualFeeTypes = [
                    { value: 'cleaning', label: '車輛清潔費' },
                    { value: 'damage', label: '損傷賠償' },
                    { value: 'fuel', label: '燃油補差' },
                    { value: 'toll', label: '過路費補繳' },
                    { value: 'parking', label: '停車費' },
                    { value: 'violation', label: '違章代繳' },
                    { value: 'other', label: '其他費用' }
                ];

                // Payment Channels
                const onlineChannels = [
                    { value: 'jkopay', label: '街口支付', icon: 'Iphone', color: 'text-green-500' },
                    { value: 'linepay', label: 'LINE Pay', icon: 'ChatLineSquare', color: 'text-green-600' },
                    { value: 'credit_card', label: '信用卡', icon: 'CreditCard', color: 'text-blue-500' }
                ];
                const offlineChannels = [
                    { value: 'cash', label: '現金' },
                    { value: 'pos', label: 'POS刷卡' },
                    { value: 'transfer', label: '銀行轉賬' }
                ];

                // Channel Name Mapping
                const getChannelName = (channel) => {
                    const map = {
                        'jkopay': '街口支付',
                        'linepay': 'LINE Pay',
                        'credit_card': '信用卡',
                        'cash': '現金',
                        'pos': 'POS刷卡',
                        'transfer': '銀行轉賬',
                        'monthly_bill': '企業月結掛賬'
                    };
                    return map[channel] || channel;
                };

                const activeFinanceFees = computed(() => feeItems.value.filter(fee =>
                    !['cancelled', 'released', 'refunded', 'waived'].includes(fee.status)
                ));

                const rightPanelFeeItems = computed(() => {
                    const statusPriority = {
                        pending: 1,
                        partial: 2,
                        monthly_billing: 3,
                        paid: 4,
                        waived: 5,
                        refunded: 6,
                        released: 7
                    };
                    return feeItems.value
                        .filter(fee => !['cancelled', 'released'].includes(fee.status))
                        .slice()
                        .sort((a, b) => {
                            const priorityDiff = (statusPriority[a.status] || 9) - (statusPriority[b.status] || 9);
                            if (priorityDiff !== 0) return priorityDiff;
                            return new Date(String(b.createdAt).replace(/\//g, '-')).getTime() - new Date(String(a.createdAt).replace(/\//g, '-')).getTime();
                        })
                        .slice(0, 6);
                });

                const financeOverview = computed(() => {
                    const totalReceivable = activeFinanceFees.value.reduce((sum, fee) => sum + fee.amount, 0);
                    const customerPaid = activeFinanceFees.value.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
                    const postChargeAmount = feeItems.value
                        .filter(fee => fee.phase === 'post' && !['paid', 'cancelled', 'refunded', 'waived'].includes(fee.status))
                        .reduce((sum, fee) => sum + Math.max(0, fee.amount - (fee.paidAmount || 0)), 0);
                    const monthlyTxAmount = transactions.value
                        .filter(txn => txn.type === 'monthly_bill' && txn.status === 'confirmed')
                        .reduce((sum, txn) => sum + txn.amount, 0);
                    const monthlyBillAmount = isMonthlyBilling.value ? totalReceivable : monthlyTxAmount;
                    const pendingAmount = Math.max(0, totalReceivable - customerPaid);
                    return {
                        totalReceivable,
                        customerPaid,
                        pendingAmount,
                        postChargeAmount,
                        monthlyBillAmount,
                        handledAmount: isMonthlyBilling.value ? monthlyBillAmount : customerPaid,
                        feeCount: activeFinanceFees.value.length
                    };
                });

                const getTransactionFeeName = (txn) => {
                    const feeIds = Array.isArray(txn.feeIds) ? txn.feeIds : (txn.feeId ? [txn.feeId] : []);
                    const names = feeIds
                        .map(id => feeItems.value.find(fee => fee.id === id)?.name)
                        .filter(Boolean);
                    if (names.length > 1) return `${names[0]} 等${names.length}項`;
                    return names[0] || txn.remark || '未關聯費用';
                };

                const recentFinancialTransactions = computed(() => transactions.value
                    .map(txn => ({
                        ...txn,
                        feeName: getTransactionFeeName(txn)
                    }))
                    .sort((a, b) => new Date(String(b.createdAt).replace(/\//g, '-')).getTime() - new Date(String(a.createdAt).replace(/\//g, '-')).getTime())
                    .slice(0, 5)
                );

                const invoiceSummary = computed(() => {
                    const issuedAmount = invoiceRecords.value
                        .filter(invoice => invoice.status === 'issued')
                        .reduce((sum, invoice) => sum + invoice.amount, 0);
                    const pendingAmount = invoiceRecords.value
                        .filter(invoice => invoice.status !== 'issued')
                        .reduce((sum, invoice) => sum + invoice.amount, 0);
                    const uninvoicedAmount = Math.max(0, financeOverview.value.totalReceivable - issuedAmount - pendingAmount);
                    return {
                        issuedAmount,
                        pendingAmount,
                        uninvoicedAmount
                    };
                });

                // Fee Status Helpers
                const getFeeStatusType = (status) => {
                    const map = {
                        pending: 'warning',
                        partial: 'primary',
                        monthly_billing: 'primary',
                        paid: 'success',
                        refunded: 'info',
                        released: 'info',
                        cancelled: 'danger',
                        waived: 'info'
                    };
                    return map[status] || 'info';
                };

                const getFeeStatusText = (status) => {
                    const map = {
                        pending: '待收款',
                        partial: '部分收款',
                        monthly_billing: '企業月結',
                        paid: '已結清',
                        refunded: '已退款',
                        released: '已釋放',
                        cancelled: '已取消',
                        waived: '已減免'
                    };
                    return map[status] || status;
                };

                const getFeeDisplayStatus = (fee) => {
                    if (isMonthlyBilling.value && !['cancelled', 'refunded', 'released', 'waived'].includes(fee.status)) {
                        return 'monthly_billing';
                    }
                    return fee.status;
                };

                // Computed: Filtered Fee Items with isOverdue
                const filteredFeeItems = computed(() => {
                    const today = new Date().toISOString().split('T')[0];
                    return feeItems.value
                        .map(fee => ({
                            ...fee,
                            displayStatus: getFeeDisplayStatus(fee),
                            isOverdue: !isMonthlyBilling.value && fee.reminder && fee.reminder.date && fee.reminder.date < today && fee.status === 'pending'
                        }))
                        .filter(fee => {
                            // Phase filter
                            if (feePhaseFilter.value !== 'all' && fee.phase !== feePhaseFilter.value) return false;
                            // Status filter
                            if (feeStatusFilter.value === 'all') return true;
                            return fee.displayStatus === feeStatusFilter.value;
                        });
                });

                // Computed: Fee Summary
                const feeSummary = computed(() => {
                    let total = 0, paid = 0, pending = 0, waived = 0, monthly = 0;
                    feeItems.value.forEach(fee => {
                        if (['cancelled', 'refunded', 'released'].includes(fee.status)) {
                            return;
                        }
                        if (fee.status === 'waived') {
                            waived += fee.amount;
                            return;
                        }
                        total += fee.amount;
                        if (fee.status === 'monthly_billing') {
                            monthly += fee.amount;
                            return;
                        }
                        paid += fee.paidAmount || 0;
                        pending += Math.max(0, fee.amount - (fee.paidAmount || 0));
                    });
                    return {
                        total,
                        paid,
                        pending: isMonthlyBilling.value ? 0 : pending,
                        waived,
                        monthly: isMonthlyBilling.value ? total : monthly
                    };
                });

                // Computed: Post-phase pending charges (追繳待處理)
                const pendingPostCharges = computed(() => {
                    return feeItems.value.filter(f => f.phase === 'post' && (f.status === 'pending' || f.status === 'partial'));
                });

                // Get filter count

                const getFilteredFeeCount = (filterValue) => {
                    if (filterValue === 'all') return feeItems.value.length;
                    return feeItems.value.filter(f => getFeeDisplayStatus(f) === filterValue).length;
                };

                // Toggle fee expand
                const toggleFeeExpand = (feeId) => {
                    const idx = expandedFees.value.indexOf(feeId);
                    if (idx >= 0) {
                        expandedFees.value.splice(idx, 1);
                    } else {
                        expandedFees.value.push(feeId);
                    }
                };

                // Get transactions for a fee
                const getTransactionsForFee = (feeId) => {
                    return transactions.value.filter(t => t.feeId === feeId || (Array.isArray(t.feeIds) && t.feeIds.includes(feeId)));
                };

                // Add Fee Dialog
                const addFeeDialogVisible = ref(false);
                const editingFee = ref(null);
                const newFeeData = reactive({
                    type: '',
                    customName: '',
                    amount: 0,
                    description: ''
                });

                const openNewFeeDialog = () => {
                    editingFee.value = null;
                    newFeeData.type = '';
                    newFeeData.customName = '';
                    newFeeData.amount = 0;
                    newFeeData.description = '';
                    addFeeDialogVisible.value = true;
                };

                const openEditFeeDialog = (fee) => {
                    editingFee.value = fee;
                    newFeeData.type = fee.type;
                    newFeeData.customName = fee.name;
                    newFeeData.amount = fee.amount;
                    newFeeData.description = fee.description;
                    addFeeDialogVisible.value = true;
                };

                const confirmAddFee = () => {
                    const feeName = newFeeData.type === 'other'
                        ? newFeeData.customName
                        : manualFeeTypes.find(t => t.value === newFeeData.type)?.label || '費用';

                    if (editingFee.value) {
                        // Edit existing fee
                        const fee = feeItems.value.find(f => f.id === editingFee.value.id);
                        if (fee) {
                            fee.name = feeName;
                            fee.amount = newFeeData.amount;
                            fee.description = newFeeData.description;
                            fee.type = newFeeData.type;
                        }
                        ElMessage.success('費用已更新');
                        addAuditLog('編輯', `編輯費用 [${feeName}] ¥${newFeeData.amount}`);
                    } else {
                        // Add new fee
                        const feeId = 'FEE-' + Date.now();
                        const feePhase = orderStatus.value === 'completed' ? 'post' : 'rental';
                        feeItems.value.push({
                            id: feeId,
                            type: newFeeData.type,
                            source: 'manual',
                            name: feeName,
                            description: newFeeData.description,
                            amount: newFeeData.amount,
                            paidAmount: 0,
                            status: isMonthlyBilling.value ? 'monthly_billing' : 'pending',
                            phase: feePhase,
                            notifyStatus: !isMonthlyBilling.value && feePhase === 'post' ? 'pending' : undefined,
                            createdAt: new Date().toLocaleString(),
                            createdBy: 'Admin',
                            attachments: [],
                            reminder: null,
                            editable: true
                        });
                        if (isMonthlyBilling.value && feePhase === 'post') {
                            createMonthlyBillTransaction(feeId, newFeeData.amount, `完成後追加費用：${feeName}`);
                        }
                        ElMessage.success('費用已添加');
                        addAuditLog('新增', `人工添加費用 [${feeName}] ¥${newFeeData.amount}`);
                    }
                    addFeeDialogVisible.value = false;
                };

                // Notify customer for post-phase supplementary charge (追繳通知)
                const notifyCustomerForCharge = (fee) => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單的追繳費用直接進入企業賬單，無需發送客戶支付通知');
                        return;
                    }
                    const targetName = '客戶';
                    const targetChannel = 'APP推送、短信';
                    ElMessageBox.confirm(
                        `確定向${targetName}發送追繳通知嗎？\n\n費用項目：${fee.name}\n金額：¥${formatNumber(fee.amount)}\n\n系統將通過${targetChannel}完成通知。`,
                        '發送追繳通知',
                        {
                            confirmButtonText: '確定發送',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }
                    ).then(() => {
                        // Simulate sending notification
                        const loading = ElLoading.service({ text: '正在發送通知...' });
                        setTimeout(() => {
                            loading.close();
                            // Update fee item
                            const feeItem = feeItems.value.find(f => f.id === fee.id);
                            if (feeItem) {
                                feeItem.notifyStatus = 'notified';
                                feeItem.notifiedAt = new Date().toLocaleString();
                            }
                            ElMessage.success(`追繳通知已發送至${targetName}`);
                            addAuditLog('追繳通知', `向${targetName}發送追繳通知 [${fee.name}] ¥${fee.amount}`);
                        }, 1000);
                    }).catch(() => { });
                };

                const confirmDeleteFee = (fee) => {
                    ElMessageBox.confirm('確定刪除此費用項嗎？', '刪除確認', {
                        confirmButtonText: '確定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        const idx = feeItems.value.findIndex(f => f.id === fee.id);
                        if (idx >= 0) {
                            feeItems.value.splice(idx, 1);
                            addAuditLog('刪除', `刪除費用 [${fee.name}] ¥${fee.amount}`);
                            ElMessage.success('費用已刪除');
                        }
                    }).catch(() => { });
                };

                const handleExceed = () => {
                    ElMessage.warning('最多上傳3張憑證');
                };

                // Collect Payment Dialog
                const collectPaymentDialogVisible = ref(false);
                const collectingFee = ref(null);
                const paymentChannelType = ref('online');
                const selectedPaymentChannel = ref('jkopay');
                const offlineRefNo = ref('');
                const collectAmount = ref(0);

                const openCollectPayment = (fee) => {
                    if (isMonthlyBilling.value) {
                        ElMessage.info('企業月結訂單不需要客戶收款');
                        return;
                    }
                    collectingFee.value = fee;
                    paymentChannelType.value = 'online';
                    selectedPaymentChannel.value = 'jkopay';
                    offlineRefNo.value = '';
                    collectAmount.value = fee.amount - fee.paidAmount;
                    collectPaymentDialogVisible.value = true;
                };

                const confirmCollectPayment = () => {
                    const fee = feeItems.value.find(f => f.id === collectingFee.value.id);
                    if (!fee) return;

                    // Add transaction
                    transactions.value.push({
                        id: 'TXN-' + Date.now(),
                        feeId: fee.id,
                        type: 'payment',
                        amount: collectAmount.value,
                        channel: selectedPaymentChannel.value,
                        channelType: paymentChannelType.value,
                        refNo: paymentChannelType.value === 'offline' ? offlineRefNo.value : `${selectedPaymentChannel.value.toUpperCase()}-${Date.now()}`,
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'Admin',
                        createdAt: new Date().toLocaleString(),
                        remark: ''
                    });

                    // Update fee
                    fee.paidAmount += collectAmount.value;
                    if (fee.paidAmount >= fee.amount) {
                        fee.status = 'paid';
                    } else {
                        fee.status = 'partial';
                    }

                    ElMessage.success('收款成功');
                    addAuditLog('收款', `收款 [${fee.name}] ¥${collectAmount.value} via ${getChannelName(selectedPaymentChannel.value)}`);
                    collectPaymentDialogVisible.value = false;
                };

                // Refund Dialog
                const refundDialogVisible = ref(false);
                const refundingFee = ref(null);
                const selectedRefundTxn = ref('');
                const refundAmount = ref(0);
                const offlineRefundMethod = ref('cash');
                const refundTransferInfo = ref('');
                const refundReason = ref('');

                const refundableTxns = computed(() => {
                    if (!refundingFee.value) return [];
                    return transactions.value.filter(t => {
                        const feeIds = Array.isArray(t.feeIds) ? t.feeIds : (t.feeId ? [t.feeId] : []);
                        return feeIds.includes(refundingFee.value.id) &&
                            t.type === 'payment' &&
                            t.status === 'confirmed';
                    });
                });

                const openRefundDialog = (fee) => {
                    refundingFee.value = fee;
                    selectedRefundTxn.value = '';
                    refundAmount.value = 0;
                    offlineRefundMethod.value = 'cash';
                    refundTransferInfo.value = '';
                    refundReason.value = '';
                    refundDialogVisible.value = true;
                };

                const getSelectedTxnAmount = () => {
                    const txn = transactions.value.find(t => t.id === selectedRefundTxn.value);
                    return txn ? txn.amount : 0;
                };

                const getSelectedTxnChannelType = () => {
                    const txn = transactions.value.find(t => t.id === selectedRefundTxn.value);
                    return txn ? txn.channelType : 'online';
                };

                const getSelectedTxnChannel = () => {
                    const txn = transactions.value.find(t => t.id === selectedRefundTxn.value);
                    return txn ? txn.channel : '';
                };

                const confirmRefund = () => {
                    if (!selectedRefundTxn.value || refundAmount.value <= 0) {
                        ElMessage.warning('請選擇交易並填寫退款金額');
                        return;
                    }

                    const originalTxn = transactions.value.find(t => t.id === selectedRefundTxn.value);
                    if (!originalTxn) return;

                    // Add refund transaction
                    transactions.value.push({
                        id: 'TXN-' + Date.now(),
                        feeId: refundingFee.value.id,
                        feeIds: [refundingFee.value.id],
                        type: 'refund',
                        amount: refundAmount.value,
                        channel: originalTxn.channelType === 'online' ? originalTxn.channel : offlineRefundMethod.value,
                        channelType: originalTxn.channelType,
                        refNo: `REF-${Date.now()}`,
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'Admin',
                        createdAt: new Date().toLocaleString(),
                        remark: refundReason.value
                    });

                    // Update fee
                    const fee = feeItems.value.find(f => f.id === refundingFee.value.id);
                    if (fee) {
                        fee.paidAmount = Math.max(0, fee.paidAmount - refundAmount.value);
                        if (fee.paidAmount === 0) {
                            fee.status = 'refunded';
                        } else {
                            fee.status = 'partial';
                        }
                        addAuditLog('退款', `退款 [${fee.name}] ¥${refundAmount.value}`);
                    }

                    ElMessage.success('退款成功');
                    refundDialogVisible.value = false;
                };

                // Reminder Dialog
                const reminderDialogVisible = ref(false);
                const reminderFee = ref(null);
                const reminderDate = ref('');

                const openReminderDialog = (fee) => {
                    reminderFee.value = fee;
                    reminderDate.value = fee.reminder?.date || '';
                    reminderDialogVisible.value = true;
                };

                const confirmReminder = () => {
                    const fee = feeItems.value.find(f => f.id === reminderFee.value.id);
                    if (fee && reminderDate.value) {
                        fee.reminder = {
                            date: reminderDate.value,
                            notified: false
                        };
                        addAuditLog('提醒', `設置收款提醒 [${fee.name}] 日期:${reminderDate.value}`);
                        ElMessage.success('提醒已設置');
                    }
                    reminderDialogVisible.value = false;
                };

                // --- Cancel Order Logic ---
                const cancelOrderDialogVisible = ref(false);
                const cancelOrderData = ref({
                    type: 'free', // free, liable
                    originalType: 'free',
                    isExempt: false,
                    timeDiffText: '',
                    paidAmount: 0,
                    cancelFee: 0,
                    refundAmount: 0,
                    preAuthAction: '',
                    reason: '',
                    remark: ''
                });

                const isConfirmedIncomeTransaction = (t) => (
                    t.type === 'payment' ||
                    t.type === 'settlement' ||
                    (t.type === 'pre_auth' && t.txnType === 'pre_auth_capture')
                ) && t.status === 'confirmed';

                const getConfirmedPaymentTotal = () => transactions.value
                    .filter(isConfirmedIncomeTransaction)
                    .reduce((sum, t) => sum + t.amount, 0);

                const releaseDispatchResource = () => {
                    pickupInterrupted.value = false;
                    pickupLock.startedAt = '';
                    pickupLock.expiresAt = '';
                };

                const recordPreAuthRelease = (feeId, amount, remark) => {
                    if (isMonthlyBilling.value || amount <= 0) return;
                    transactions.value.unshift({
                        id: 'TXN-REL-' + Date.now(),
                        feeIds: feeId ? [feeId] : [],
                        type: 'pre_auth',
                        txnType: 'pre_auth_release',
                        amount,
                        channel: 'credit_card',
                        channelType: 'online',
                        refNo: 'REL-' + Date.now(),
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'system',
                        createdAt: new Date().toLocaleString(),
                        remark
                    });
                    paymentData.preAuthStatus = 'released';
                    syncPreAuthRecord('released', '預授權釋放');
                };

                const recordOrderRefund = (amount, remark) => {
                    if (isMonthlyBilling.value || amount <= 0) return;
                    transactions.value.unshift({
                        id: 'TXN-REF-' + Date.now(),
                        feeIds: [],
                        type: 'refund',
                        txnType: 'order_refund',
                        amount,
                        channel: 'original',
                        channelType: 'online',
                        refNo: 'REF-' + Date.now(),
                        status: 'confirmed',
                        receiptImage: null,
                        operator: 'system',
                        createdAt: new Date().toLocaleString(),
                        remark
                    });
                };

                const openCancelOrderModal = () => {
                    if (!canCancel.value) {
                        ElMessage.warning('當前訂單狀態不可取消');
                        return;
                    }
                    const mockHoursBefore = orderStatus.value === 'pending_payment' ? 48 : (orderStatus.value === 'pickup_overdue' ? -2 : 5);

                    cancelOrderData.value.timeDiffText = mockHoursBefore >= 0 ? mockHoursBefore + ' 小時' : '已逾期 ' + Math.abs(mockHoursBefore) + ' 小時';
                    cancelOrderData.value.paidAmount = isMonthlyBilling.value ? paymentData.orderTotal : getConfirmedPaymentTotal();

                    const cancelBaseAmount = isMonthlyBilling.value ? paymentData.orderTotal : paymentData.preAuthAmount;

                    if (orderStatus.value === 'pending_payment' || mockHoursBefore >= 24) {
                        cancelOrderData.value.type = 'free';
                        cancelOrderData.value.originalType = 'free';
                        cancelOrderData.value.cancelFee = 0;
                    } else if (mockHoursBefore >= 12) {
                        cancelOrderData.value.type = 'liable';
                        cancelOrderData.value.originalType = 'liable';
                        cancelOrderData.value.cancelFee = cancelBaseAmount * 0.2;
                    } else if (mockHoursBefore >= 2) {
                        cancelOrderData.value.type = 'liable';
                        cancelOrderData.value.originalType = 'liable';
                        cancelOrderData.value.cancelFee = cancelBaseAmount * 0.5;
                    } else {
                        cancelOrderData.value.type = 'liable';
                        cancelOrderData.value.originalType = 'liable';
                        cancelOrderData.value.cancelFee = cancelBaseAmount; // 100%
                    }

                    cancelOrderData.value.cancelFee = Math.round(cancelOrderData.value.cancelFee);
                    cancelOrderData.value.preAuthAction = isMonthlyBilling.value ? '不處理預授權' : (cancelOrderData.value.cancelFee > 0 ? '扣取取消費後釋放剩餘額度' : '釋放預授權');
                    cancelOrderData.value.isExempt = false;
                    cancelOrderData.value.refundAmount = isMonthlyBilling.value ? cancelOrderData.value.cancelFee : Math.max(0, cancelOrderData.value.paidAmount - cancelOrderData.value.cancelFee);
                    cancelOrderData.value.reason = '';

                    cancelOrderDialogVisible.value = true;
                };

                const updateCancelFee = () => {
                    if (cancelOrderData.value.isExempt) {
                        cancelOrderData.value.type = 'free';
                        cancelOrderData.value.cancelFee = 0;
                    } else {
                        cancelOrderData.value.type = cancelOrderData.value.originalType;
                        const mockHoursBefore = 5;
                        const cancelBaseAmount = isMonthlyBilling.value ? paymentData.orderTotal : paymentData.preAuthAmount;
                        if (mockHoursBefore < 2) cancelOrderData.value.cancelFee = cancelBaseAmount;
                        else if (mockHoursBefore < 12) cancelOrderData.value.cancelFee = cancelBaseAmount * 0.5;
                        else if (mockHoursBefore < 24) cancelOrderData.value.cancelFee = cancelBaseAmount * 0.2;
                    }
                    cancelOrderData.value.cancelFee = Math.round(cancelOrderData.value.cancelFee);
                    cancelOrderData.value.refundAmount = isMonthlyBilling.value ? cancelOrderData.value.cancelFee : Math.max(0, cancelOrderData.value.paidAmount - cancelOrderData.value.cancelFee);
                    cancelOrderData.value.preAuthAction = isMonthlyBilling.value ? '不處理預授權' : (cancelOrderData.value.cancelFee > 0 ? '扣取取消費後釋放剩餘額度' : '釋放預授權');
                };

                const confirmCancelOrder = () => {
                    if (!cancelOrderData.value.reason) {
                        ElMessage.warning('請選擇取消原因');
                        return;
                    }
                    let feeId = null;
                    const preAuthAvailable = !isMonthlyBilling.value && paymentData.preAuthStatus === 'frozen'
                        ? paymentData.preAuthAmount
                        : 0;
                    const paidAvailable = !isMonthlyBilling.value ? getConfirmedPaymentTotal() : 0;
                    const capturedAmount = isMonthlyBilling.value
                        ? 0
                        : Math.min(cancelOrderData.value.cancelFee, preAuthAvailable > 0 ? preAuthAvailable : paidAvailable);
                    const preAuthCaptureAmount = preAuthAvailable > 0 ? capturedAmount : 0;
                    if (cancelOrderData.value.cancelFee > 0) {
                        feeId = 'FEE-CANCEL-' + Date.now();
                        feeItems.value.unshift({
                            id: feeId,
                            type: 'cancellation_fee',
                            source: 'system',
                            name: '取消費',
                            description: cancelOrderData.value.reason,
                            amount: cancelOrderData.value.cancelFee,
                            paidAmount: capturedAmount,
                            status: isMonthlyBilling.value ? 'monthly_billing' : (capturedAmount >= cancelOrderData.value.cancelFee ? 'paid' : 'partial'),
                            phase: 'rental',
                            createdAt: new Date().toLocaleString(),
                            createdBy: 'system',
                            attachments: [],
                            reminder: !isMonthlyBilling.value && capturedAmount < cancelOrderData.value.cancelFee ? { date: new Date().toISOString().split('T')[0], notified: false } : null,
                            editable: false
                        });
                        if (!isMonthlyBilling.value && preAuthCaptureAmount > 0) {
                            transactions.value.unshift({
                                id: 'TXN-CANCEL-' + Date.now(),
                                feeIds: [feeId],
                                type: 'pre_auth',
                                txnType: 'pre_auth_capture',
                                amount: preAuthCaptureAmount,
                                channel: 'credit_card',
                                channelType: 'online',
                                refNo: 'CAP-CANCEL-' + Date.now(),
                                status: 'confirmed',
                                receiptImage: null,
                                operator: 'system',
                                createdAt: new Date().toLocaleString(),
                                remark: '取消費預授權扣款'
                            });
                        } else {
                            createMonthlyBillTransaction(feeId, cancelOrderData.value.cancelFee, `取消費：${cancelOrderData.value.reason}`);
                        }
                    }
                    recordPreAuthRelease(feeId, Math.max(0, preAuthAvailable - preAuthCaptureAmount), '取消訂單釋放剩餘預授權');
                    recordOrderRefund(cancelOrderData.value.refundAmount, `取消訂單退款：${cancelOrderData.value.reason}`);
                    releaseDispatchResource();
                    operationRecords.value.unshift({
                        title: '取消訂單',
                        content: `取消原因：${cancelOrderData.value.reason}，取消費 ¥${formatNumber(cancelOrderData.value.cancelFee)}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '門店管理員 (當前)',
                        memo: cancelOrderData.value.remark || '標準取消',
                        color: '#909399'
                    });
                    ElMessage.success(isMonthlyBilling.value ? (cancelOrderData.value.cancelFee > 0 ? '訂單已取消，取消費用已進入企業月結賬單' : '訂單已取消，未生成企業掛賬') : '訂單已取消，退款流程已啓動');
                    orderStatus.value = 'cancelled';
                    cancelOrderDialogVisible.value = false;
                };

                const noShowDialogVisible = ref(false);
                const noShowData = reactive({
                    pickupTime: '2026/01/28 10:00',
                    holdHours: 2,
                    feeAmount: 0,
                    preAuthAmount: 0,
                    paymentDue: 0,
                    reason: '',
                    remark: ''
                });

                const openNoShowModal = () => {
                    if (orderStatus.value !== 'pickup_overdue') {
                        ElMessage.warning('僅逾期未取訂單可標記爽約');
                        return;
                    }
                    noShowData.pickupTime = '2026/01/28 10:00';
                    noShowData.holdHours = 2;
                    noShowData.feeAmount = 200;
                    noShowData.preAuthAmount = isMonthlyBilling.value ? 0 : (paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0);
                    noShowData.paymentDue = isMonthlyBilling.value ? noShowData.feeAmount : Math.max(0, noShowData.feeAmount - noShowData.preAuthAmount);
                    noShowData.reason = '';
                    noShowData.remark = '';
                    noShowDialogVisible.value = true;
                };

                const confirmNoShow = () => {
                    if (!noShowData.reason) {
                        ElMessage.warning('請選擇聯繫結果');
                        return;
                    }
                    const feeId = 'FEE-NOSHOW-' + Date.now();
                    const paidAmount = isMonthlyBilling.value ? 0 : Math.min(noShowData.feeAmount, noShowData.preAuthAmount);
                    feeItems.value.unshift({
                        id: feeId,
                        type: 'no_show_fee',
                        source: 'system',
                        name: '爽約費',
                        description: noShowData.reason,
                        amount: noShowData.feeAmount,
                        paidAmount,
                        status: isMonthlyBilling.value ? 'monthly_billing' : (noShowData.paymentDue > 0 ? 'partial' : 'paid'),
                        phase: 'rental',
                        createdAt: new Date().toLocaleString(),
                        createdBy: 'system',
                        attachments: [],
                        reminder: !isMonthlyBilling.value && noShowData.paymentDue > 0 ? { date: new Date().toISOString().split('T')[0], notified: false } : null,
                        editable: false
                    });
                    if (paidAmount > 0) {
                        transactions.value.unshift({
                            id: 'TXN-NOSHOW-' + Date.now(),
                            feeIds: [feeId],
                            type: 'pre_auth',
                            txnType: 'pre_auth_capture',
                            amount: paidAmount,
                            channel: 'credit_card',
                            channelType: 'online',
                            refNo: 'CAP-NOSHOW-' + Date.now(),
                            status: 'confirmed',
                            receiptImage: null,
                            operator: 'system',
                            createdAt: new Date().toLocaleString(),
                            remark: '爽約費預授權扣款'
                        });
                    } else if (isMonthlyBilling.value && noShowData.feeAmount > 0) {
                        createMonthlyBillTransaction(feeId, noShowData.feeAmount, `爽約費：${noShowData.reason}`);
                    }
                    recordPreAuthRelease(feeId, Math.max(0, noShowData.preAuthAmount - paidAmount), '爽約處理釋放剩餘預授權');
                    releaseDispatchResource();
                    operationRecords.value.unshift({
                        title: '標記爽約',
                        content: isMonthlyBilling.value ? `爽約費 ¥${formatNumber(noShowData.feeAmount)}，企業月結掛賬` : `爽約費 ¥${formatNumber(noShowData.feeAmount)}，待補繳 ¥${formatNumber(noShowData.paymentDue)}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '門店管理員 (當前)',
                        memo: noShowData.remark || noShowData.reason,
                        color: '#909399'
                    });
                    orderStatus.value = 'no_show';
                    noShowDialogVisible.value = false;
                    ElMessage.success(isMonthlyBilling.value ? '已標記爽約，爽約費用已進入企業月結賬單' : '已標記爽約，車輛資源已釋放');
                };

                const rejectOrderDialogVisible = ref(false);
                const rejectOrderData = reactive({
                    feeAmount: 0,
                    preAuthAmount: 0,
                    paymentDue: 0,
                    preAuthAction: '',
                    reason: '',
                    remark: ''
                });

                const updateRejectFee = () => {
                    rejectOrderData.preAuthAmount = isMonthlyBilling.value ? 0 : (paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0);
                    rejectOrderData.paymentDue = isMonthlyBilling.value ? rejectOrderData.feeAmount : Math.max(0, rejectOrderData.feeAmount - rejectOrderData.preAuthAmount);
                    if (isMonthlyBilling.value) {
                        rejectOrderData.preAuthAction = '不處理預授權';
                    } else if (rejectOrderData.feeAmount > 0 && rejectOrderData.preAuthAmount > 0) {
                        rejectOrderData.preAuthAction = rejectOrderData.paymentDue > 0 ? '扣取全部預授權後補繳差額' : '扣取拒絕履約費用後釋放剩餘額度';
                    } else {
                        rejectOrderData.preAuthAction = rejectOrderData.preAuthAmount > 0 ? '釋放預授權' : '無凍結預授權';
                    }
                };

                const openRejectOrderModal = () => {
                    rejectOrderData.feeAmount = 0;
                    rejectOrderData.preAuthAmount = isMonthlyBilling.value ? 0 : (paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0);
                    rejectOrderData.paymentDue = 0;
                    rejectOrderData.preAuthAction = isMonthlyBilling.value ? '不處理預授權' : (rejectOrderData.preAuthAmount > 0 ? '釋放預授權' : '無凍結預授權');
                    rejectOrderData.reason = '';
                    rejectOrderData.remark = '';
                    rejectOrderDialogVisible.value = true;
                };

                const confirmRejectOrder = () => {
                    if (!rejectOrderData.reason) {
                        ElMessage.warning('請選擇拒絕原因');
                        return;
                    }
                    if (rejectOrderData.feeAmount > 0) {
                        const feeId = 'FEE-REJECT-' + Date.now();
                        const paidAmount = isMonthlyBilling.value ? 0 : Math.min(rejectOrderData.feeAmount, rejectOrderData.preAuthAmount);
                        feeItems.value.unshift({
                            id: feeId,
                            type: 'rejection_fee',
                            source: 'manual',
                            name: '拒絕履約費用',
                            description: rejectOrderData.reason,
                            amount: rejectOrderData.feeAmount,
                            paidAmount,
                            status: isMonthlyBilling.value ? 'monthly_billing' : (rejectOrderData.paymentDue > 0 ? (paidAmount > 0 ? 'partial' : 'pending') : 'paid'),
                            phase: 'rental',
                            createdAt: new Date().toLocaleString(),
                            createdBy: '門店管理員',
                            attachments: [],
                            reminder: !isMonthlyBilling.value && rejectOrderData.paymentDue > 0 ? { date: new Date().toISOString().split('T')[0], notified: false } : null,
                            editable: false
                        });
                        if (paidAmount > 0) {
                            transactions.value.unshift({
                                id: 'TXN-REJECT-' + Date.now(),
                                feeIds: [feeId],
                                type: 'pre_auth',
                                txnType: 'pre_auth_capture',
                                amount: paidAmount,
                                channel: 'credit_card',
                                channelType: 'online',
                                refNo: 'CAP-REJECT-' + Date.now(),
                                status: 'confirmed',
                                receiptImage: null,
                                operator: 'system',
                                createdAt: new Date().toLocaleString(),
                                remark: '拒絕履約費用預授權扣款'
                            });
                        } else if (isMonthlyBilling.value && rejectOrderData.feeAmount > 0) {
                            createMonthlyBillTransaction(feeId, rejectOrderData.feeAmount, `拒絕履約費用：${rejectOrderData.reason}`);
                        }
                    }
                    recordPreAuthRelease(null, Math.max(0, rejectOrderData.preAuthAmount - Math.min(rejectOrderData.feeAmount, rejectOrderData.preAuthAmount)), '拒絕履約釋放剩餘預授權');
                    releaseDispatchResource();
                    pickupModalVisible.value = false;
                    operationRecords.value.unshift({
                        title: '拒絕履約',
                        content: `拒絕原因：${rejectOrderData.reason}，拒絕履約費用 ¥${formatNumber(rejectOrderData.feeAmount)}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '門店管理員 (當前)',
                        memo: rejectOrderData.remark || '取車資質不通過',
                        color: '#F56C6C'
                    });
                    orderStatus.value = 'rejected';
                    rejectOrderDialogVisible.value = false;
                    ElMessage.success(isMonthlyBilling.value ? '已拒絕履約，相關費用已進入企業月結賬單' : '已拒絕履約，車輛資源已釋放');
                };

                // --- Close Order Logic ---
                const closeOrderDialogVisible = ref(false);
                const closeOrderData = ref({
                    refundItems: [],
                    totalRefund: 0,
                    preAuthAction: '',
                    reason: '',
                    remark: '',
                    confirmed: false
                });

                const openCloseOrderModal = () => {
                    if (!canClose.value) {
                        ElMessage.warning('當前訂單狀態不可關閉');
                        return;
                    }
                    const payments = isMonthlyBilling.value ? [] : transactions.value.filter(isConfirmedIncomeTransaction);
                    closeOrderData.value.refundItems = payments.map(t => ({
                        id: t.id,
                        name: t.item || t.feeName || t.remark || '預付費用',
                        amount: t.amount
                    }));
                    closeOrderData.value.totalRefund = payments.reduce((sum, t) => sum + t.amount, 0);
                    closeOrderData.value.preAuthAction = isMonthlyBilling.value ? '不處理預授權' : (paymentData.preAuthStatus === 'frozen' ? '釋放預授權' : '無凍結預授權');
                    closeOrderData.value.reason = '';
                    closeOrderData.value.remark = '';
                    closeOrderData.value.confirmed = false;
                    closeOrderDialogVisible.value = true;
                };

                const confirmCloseOrder = () => {
                    if (!closeOrderData.value.reason) {
                        ElMessage.warning('請選擇關閉原因');
                        return;
                    }
                    recordOrderRefund(closeOrderData.value.totalRefund, `關閉訂單全額退款：${closeOrderData.value.reason}`);
                    recordPreAuthRelease(null, !isMonthlyBilling.value && paymentData.preAuthStatus === 'frozen' ? paymentData.preAuthAmount : 0, '關閉訂單釋放預授權');
                    releaseDispatchResource();
                    cancelOrderDialogVisible.value = false;
                    closeOrderDialogVisible.value = false;
                    operationRecords.value.unshift({
                        title: '關閉訂單',
                        content: isMonthlyBilling.value ? `關閉原因：${closeOrderData.value.reason}，不生成企業掛賬` : `關閉原因：${closeOrderData.value.reason}，全額退款 ¥${formatNumber(closeOrderData.value.totalRefund)}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '店長 (當前)',
                        memo: closeOrderData.value.remark || '客戶無責異常關閉',
                        color: '#C0392B'
                    });
                    ElMessage.success(isMonthlyBilling.value ? '訂單已關閉，未生成企業掛賬' : '訂單已關閉，全額退款流程已啓動');
                    orderStatus.value = 'closed';
                };

                const markReminded = (fee) => {
                    if (fee.reminder) {
                        fee.reminder.notified = true;
                        addAuditLog('提醒', `已標記 [${fee.name}] 爲已提醒`);
                        ElMessage.success('已標記爲已提醒');
                    }
                };

                const handleFeeCommand = (payload) => {
                    const { type, fee } = payload;
                    switch (type) {
                        case 'refund': openRefundDialog(fee); break;
                        case 'edit': openEditFeeDialog(fee); break;
                        case 'delete': confirmDeleteFee(fee); break;
                        case 'reminder': openReminderDialog(fee); break;
                        case 'markReminded': markReminded(fee); break;
                    }
                };

                // Audit Log Feature
                const showAuditLog = ref(false);
                const feeAuditLogs = ref([
                    {
                        id: 'LOG-001',
                        time: '2026-01-28 10:00',
                        action: '新增',
                        detail: '系統自動添加費用 [車輛租金] ¥1,920',
                        operator: 'system'
                    },
                    {
                        id: 'LOG-002',
                        time: '2026-01-28 09:40',
                        action: '收款',
                        detail: '取車補收租金尾款 [車輛租金] ¥1,920 via 街口支付',
                        operator: 'system'
                    },
                    {
                        id: 'LOG-003',
                        time: '2026-01-30 14:00',
                        action: '新增',
                        detail: '系統自動添加費用 [超時費] ¥100',
                        operator: 'system'
                    },
                    {
                        id: 'LOG-004',
                        time: '2026-01-30 15:00',
                        action: '新增',
                        detail: '人工添加費用 [車輛清潔費] ¥200',
                        operator: 'Admin'
                    }
                ]);

                const getLogActionType = (action) => {
                    const map = {
                        '新增': 'primary',
                        '編輯': 'warning',
                        '刪除': 'danger',
                        '收款': 'success',
                        '退款': 'danger',
                        '提醒': 'info'
                    };
                    return map[action] || 'info';
                };

                const addAuditLog = (action, detail) => {
                    feeAuditLogs.value.unshift({
                        id: 'LOG-' + Date.now(),
                        time: new Date().toLocaleString(),
                        action: action,
                        detail: detail,
                        operator: 'Admin'
                    });
                };

                const recentFeeAuditLogs = computed(() => feeAuditLogs.value.slice(0, 4));

                const openFeeAuditLog = () => {
                    feeModalVisible.value = true;
                    showAuditLog.value = true;
                };

                // =============================================
                // END FEE MANAGEMENT FEATURE
                // =============================================

                const accidentDialogVisible = ref(false);
                const isAddingAccident = ref(false);
                const newAccidentForm = reactive({
                    description: '',
                    accidentTime: new Date(),
                    location: '',
                    responsibility: '',
                    estimatedAmount: 0,
                    handlingStatus: 'pending_assessment',
                    insuranceNo: '',
                    remark: '',
                    photos: []
                });

                const getAccidentResponsibilityText = (value) => {
                    const map = {
                        customer: '客戶責任',
                        store: '門店責任',
                        third_party: '第三方責任',
                        pending: '責任待定'
                    };
                    return map[value] || '責任待定';
                };

                const getAccidentStatusText = (value) => {
                    const map = {
                        pending_assessment: '待定損',
                        insurance_processing: '保險處理中',
                        customer_confirming: '客戶確認中',
                        closed: '已結案',
                        pending: '待定損'
                    };
                    return map[value] || '待定損';
                };

                const accidentContextHint = computed(() => {
                    if (['renting', 'renewing', 'overdue'].includes(orderStatus.value)) {
                        return {
                            title: '履約中登記事故後，訂單進入出險處理中',
                            status: '進入出險處理中',
                            fee: isMonthlyBilling.value ? '費用進入企業月結' : '費用納入還車結算',
                            desc: '車輛仍可繼續辦理還車，事故費用、責任歸屬和處理狀態會進入履約事件和費用中心。'
                        };
                    }
                    if (orderStatus.value === 'accident_processing') {
                        return {
                            title: '出險處理中可追加事故進度和費用',
                            status: '保持出險處理中',
                            fee: isMonthlyBilling.value ? '費用進入企業月結' : '費用納入還車結算',
                            desc: '追加記錄用於更新責任、定損、保險和客戶確認結果；車輛歸還後進入還車結算。'
                        };
                    }
                    if (returnSettlementStatuses.includes(orderStatus.value)) {
                        return {
                            title: '結算中登記事故，訂單保持當前結算狀態',
                            status: orderStatusText.value,
                            fee: isMonthlyBilling.value ? '費用進入企業月結' : '費用納入當前結算',
                            desc: '事故費用參與還車賬單；費用未確認時，訂單可停留在待結算繼續處理。'
                        };
                    }
                    if (orderStatus.value === 'completed') {
                        return {
                            title: '已完成訂單補錄事故，主狀態保持已完成',
                            status: '主狀態不變',
                            fee: isMonthlyBilling.value ? '直接月結掛賬' : '生成完成後追繳',
                            desc: '補錄費用不回退訂單狀態，客戶自付走追繳通知和收款，企業月結直接生成企業掛賬記錄。'
                        };
                    }
                    return {
                        title: '事故登記用於記錄租期內或完成後的事故線索',
                        status: orderStatusText.value,
                        fee: isMonthlyBilling.value ? '企業月結' : '客戶自付',
                        desc: '保存後會寫入事故記錄、履約事件和費用審計。'
                    };
                });

                const openAccidentModal = () => {
                    if (!canAccident.value) {
                        ElMessage.warning('當前訂單狀態不可登記事故');
                        return;
                    }
                    isAddingAccident.value = accidentRecords.value.length === 0; // If empty, go straight to add
                    newAccidentForm.accidentTime = new Date();
                    newAccidentForm.location = '';
                    newAccidentForm.responsibility = '';
                    newAccidentForm.estimatedAmount = 0;
                    newAccidentForm.handlingStatus = 'pending_assessment';
                    newAccidentForm.insuranceNo = '';
                    newAccidentForm.remark = '';
                    accidentDialogVisible.value = true;
                };

                const openAccidentRecords = () => {
                    isAddingAccident.value = false;
                    accidentDialogVisible.value = true;
                };

                const saveAccident = () => {
                    if (!newAccidentForm.description) {
                        ElMessage.warning('請填寫事故描述');
                        return;
                    }
                    if (!newAccidentForm.responsibility) {
                        ElMessage.warning('請選擇責任歸屬');
                        return;
                    }
                    const accidentAmount = Math.round(newAccidentForm.estimatedAmount || 0);
                    const accidentTime = newAccidentForm.accidentTime
                        ? new Date(newAccidentForm.accidentTime).toLocaleString()
                        : new Date().toLocaleString();
                    const newRecord = {
                        id: Date.now(),
                        time: accidentTime,
                        sortTime: Date.now(),
                        operator: 'Admin', // Mock current user
                        description: newAccidentForm.description,
                        location: newAccidentForm.location,
                        responsibility: newAccidentForm.responsibility,
                        amount: accidentAmount,
                        status: newAccidentForm.handlingStatus,
                        insuranceNo: newAccidentForm.insuranceNo,
                        remark: newAccidentForm.remark,
                        photos: [1, 2] // Mock photos
                    };
                    accidentRecords.value.unshift(newRecord);

                    if (accidentAmount > 0 && newAccidentForm.responsibility !== 'store') {
                        const feeId = 'FEE-ACC-' + Date.now();
                        const feePhase = orderStatus.value === 'completed' ? 'post' : 'rental';
                        feeItems.value.unshift({
                            id: feeId,
                            type: 'accident_damage',
                            source: 'manual',
                            name: '事故車損費用',
                            description: newAccidentForm.description,
                            amount: accidentAmount,
                            paidAmount: 0,
                            status: isMonthlyBilling.value ? 'monthly_billing' : 'pending',
                            phase: feePhase,
                            relatedAccidentId: newRecord.id,
                            notifyStatus: !isMonthlyBilling.value && feePhase === 'post' ? 'pending' : undefined,
                            createdAt: new Date().toLocaleString(),
                            createdBy: 'Admin',
                            attachments: [],
                            reminder: isMonthlyBilling.value ? null : { date: new Date().toISOString().split('T')[0], notified: false },
                            editable: true
                        });
                        if (isMonthlyBilling.value && feePhase === 'post') {
                            createMonthlyBillTransaction(feeId, accidentAmount, `完成後事故費用：${newAccidentForm.description}`);
                        }
                        if (feePhase === 'post') {
                            postChargeView.amount += accidentAmount;
                            postChargeView.count += 1;
                            postChargeView.status = isMonthlyBilling.value ? 'monthly_billing' : 'pending_notify';
                        }
                        addAuditLog('新增', `新增事故車損費用 [事故車損費用] ¥${accidentAmount}`);
                    }

                    if (['renting', 'renewing', 'overdue'].includes(orderStatus.value)) {
                        orderStatus.value = 'accident_processing';
                    }

                    operationRecords.value.unshift({
                        title: '事故登記',
                        content: `${getAccidentResponsibilityText(newAccidentForm.responsibility)}，預估費用 ¥${formatNumber(accidentAmount)}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '門店管理員 (當前)',
                        memo: newAccidentForm.remark || newAccidentForm.description,
                        color: '#F56C6C'
                    });

                    ElMessage.success('事故記錄已登記');
                    newAccidentForm.description = '';
                    newAccidentForm.location = '';
                    newAccidentForm.responsibility = '';
                    newAccidentForm.estimatedAmount = 0;
                    newAccidentForm.handlingStatus = 'pending_assessment';
                    newAccidentForm.insuranceNo = '';
                    newAccidentForm.remark = '';
                    isAddingAccident.value = false;
                    showAccidentRecords.value = true;
                };

                const closeAccidentRecord = (record) => {
                    record.status = 'closed';
                    record.closedAt = new Date().toLocaleString();
                    addAuditLog('結案', `事故記錄結案 [${record.description}]`);
                    operationRecords.value.unshift({
                        title: '事故結案',
                        content: `${record.description}，${getAccidentResponsibilityText(record.responsibility)}，預估費用 ¥${formatNumber(record.amount || 0)}`,
                        timestamp: new Date().toLocaleString(),
                        sortTime: Date.now(),
                        operator: '門店管理員 (當前)',
                        memo: record.insuranceNo ? `保險報案號：${record.insuranceNo}` : '事故處理完成',
                        color: '#67C23A'
                    });
                    ElMessage.success('事故已標記結案');
                };

                const deleteAccident = (index) => {
                    ElMessageBox.confirm(
                        '確定要刪除這條事故記錄嗎？',
                        '警告',
                        {
                            confirmButtonText: '刪除',
                            cancelButtonText: '取消',
                            type: 'warning',
                        }
                    )
                        .then(() => {
                            accidentRecords.value.splice(index, 1);
                            ElMessage.success('記錄已刪除');
                            if (accidentRecords.value.length === 0) {
                                isAddingAccident.value = true;
                            }
                        })
                        .catch(() => { });
                };

                // Order Remarks Logic
                const orderRemarks = ref('用戶攜帶一隻寵物貓，需準備車內清潔套件。請提前開啓空調。');
                const remarksDialogVisible = ref(false);
                const remarksForm = reactive({
                    content: ''
                });

                // Accident Records Logic
                const showAccidentRecords = ref(false);
                const accidentRecords = ref([
                    {
                        id: 1,
                        time: '2024/05/03 14:20',
                        operator: 'Admin',
                        description: '右前保險槓刮擦',
                        amount: 1200,
                        responsibility: 'customer',
                        status: 'pending_assessment',
                        location: '臺北市信義路停車場',
                        insuranceNo: 'INS-20240503-001',
                        photos: [1, 2]
                    }
                ]);

                const fulfillmentEventTab = ref('all');

                const parseEventTimestamp = (value) => {
                    if (!value) return 0;
                    const parsed = new Date(String(value).replace(/\//g, '-')).getTime();
                    return Number.isNaN(parsed) ? 0 : parsed;
                };

                const formatSignedAmount = (amount) => {
                    const value = Math.round(amount || 0);
                    if (value > 0) return `+¥${formatNumber(value)}`;
                    if (value < 0) return `-¥${formatNumber(value)}`;
                    return '同價';
                };

                const getRedirectionSettlementText = (record) => {
                    if (record.priceHandling === 'free') return '免費升等，不補差價';
                    if (isMonthlyBilling.value && record.priceChange > 0) return '企業月結調增';
                    if (isMonthlyBilling.value && record.priceChange < 0) return '企業月結調減';
                    if (record.settlementText) return record.settlementText;
                    if (record.priceChange > 0) return '多退少補';
                    if (record.priceChange < 0) return '退差價';
                    return '不調整費用';
                };

                const suppressOperationInEvents = (record) => {
                    const title = record.title || '';
                    return ['事故登記', '訂單改派', '免費升等'].some(keyword => title.includes(keyword));
                };

                const getOperationEventCategory = (record) => {
                    const title = record.title || '';
                    if (['取消', '爽約', '拒絕', '關閉'].some(keyword => title.includes(keyword))) return 'exception';
                    if (['改派', '車輛分配'].some(keyword => title.includes(keyword))) return 'redirection';
                    if (['費用', '支付', '收款', '退款', '預授權', '結算'].some(keyword => title.includes(keyword))) return 'finance';
                    return 'operation';
                };

                const getOperationEventTone = (record) => {
                    const title = record.title || '';
                    if (record.type === 'danger' || ['#F56C6C', '#C0392B'].includes(record.color) || ['拒絕', '關閉', '爽約'].some(keyword => title.includes(keyword))) {
                        return 'danger';
                    }
                    if (['改派', '車輛分配'].some(keyword => title.includes(keyword))) return 'warning';
                    if (record.type === 'success' || record.color === '#67C23A') return 'success';
                    if (record.type === 'warning' || record.color === '#E6A23C') return 'warning';
                    return 'primary';
                };

                const fulfillmentEvents = computed(() => {
                    const accidentEvents = accidentRecords.value.map(record => {
                        const closed = record.status === 'closed';
                        return {
                            key: `accident-${record.id}`,
                            kind: 'accident',
                            category: 'accident',
                            label: '事故',
                            title: closed ? '事故已結案' : '事故處理中',
                            summary: record.description || '事故記錄',
                            time: record.time,
                            sortTime: record.sortTime || parseEventTimestamp(record.time),
                            operator: record.operator || 'Admin',
                            memo: record.remark || '',
                            tone: closed ? 'neutral' : 'danger',
                            record
                        };
                    });

                    const redirectionEvents = redirectionHistory.value.map(record => ({
                        key: `redirection-${record.id}`,
                        kind: 'redirection',
                        category: 'redirection',
                        label: '改派',
                        title: record.fromVehicle === '系統自動分配' ? '車輛分配' : '訂單改派',
                        summary: record.reason || '車輛改派',
                        time: record.time,
                        sortTime: record.sortTime || parseEventTimestamp(record.time),
                        operator: record.operator || 'Admin',
                        memo: getRedirectionSettlementText(record),
                        tone: 'warning',
                        record
                    }));

                    const operationEvents = operationRecords.value
                        .filter(record => !suppressOperationInEvents(record))
                        .map((record, index) => ({
                            key: `operation-${index}-${record.timestamp}`,
                            kind: 'operation',
                            category: getOperationEventCategory(record),
                            label: '操作',
                            title: record.title,
                            summary: record.content || '訂單操作記錄',
                            time: record.timestamp,
                            sortTime: record.sortTime || parseEventTimestamp(record.timestamp),
                            operator: record.operator || '-',
                            memo: record.memo || '',
                            tone: getOperationEventTone(record),
                            record
                        }));

                    return [...accidentEvents, ...redirectionEvents, ...operationEvents]
                        .sort((a, b) => b.sortTime - a.sortTime);
                });

                const filteredFulfillmentEvents = computed(() => {
                    if (fulfillmentEventTab.value === 'accident') {
                        return fulfillmentEvents.value.filter(event => event.category === 'accident');
                    }
                    if (fulfillmentEventTab.value === 'redirection') {
                        return fulfillmentEvents.value.filter(event => event.category === 'redirection');
                    }
                    if (fulfillmentEventTab.value === 'exception') {
                        return fulfillmentEvents.value.filter(event => event.category === 'accident' || event.category === 'exception' || event.tone === 'danger');
                    }
                    return fulfillmentEvents.value;
                });

                const eventCounts = computed(() => {
                    const events = fulfillmentEvents.value;
                    return {
                        all: events.length,
                        exception: events.filter(event => event.category === 'accident' || event.category === 'exception' || event.tone === 'danger').length,
                        redirection: events.filter(event => event.category === 'redirection').length,
                        accident: accidentRecords.value.length,
                        openAccident: accidentRecords.value.filter(record => record.status !== 'closed').length,
                        audit: operationRecords.value.length
                    };
                });

                const getFulfillmentEventCardClass = (event) => {
                    const map = {
                        danger: 'border-red-100 bg-red-50/40',
                        warning: 'border-orange-100 bg-orange-50/40',
                        success: 'border-emerald-100 bg-emerald-50/40',
                        primary: 'border-blue-100 bg-blue-50/40',
                        neutral: 'border-gray-100 bg-white'
                    };
                    return map[event.tone] || map.neutral;
                };

                const getFulfillmentEventDotClass = (event) => {
                    const map = {
                        danger: 'bg-red-500',
                        warning: 'bg-orange-500',
                        success: 'bg-emerald-500',
                        primary: 'bg-blue-500',
                        neutral: 'bg-gray-300'
                    };
                    return map[event.tone] || map.neutral;
                };

                const getFulfillmentEventTagType = (event) => {
                    const map = {
                        danger: 'danger',
                        warning: 'warning',
                        success: 'success',
                        primary: 'primary',
                        neutral: 'info'
                    };
                    return map[event.tone] || 'info';
                };

                const openRemarksModal = () => {
                    remarksForm.content = orderRemarks.value;
                    remarksDialogVisible.value = true;
                };

                const saveRemarks = () => {
                    orderRemarks.value = remarksForm.content;
                    remarksDialogVisible.value = false;
                    ElMessage.success('訂單備註已更新');
                };

                // Global Transaction History View
                const transactionsDialogVisible = ref(false);

                const openTransactionsDialog = () => {
                    transactionsDialogVisible.value = true;
                };

                const enhancedTransactions = computed(() => {
                    return transactions.value.map(txn => {
                        let feeNames = [];
                        if (txn.feeIds && txn.feeIds.length > 0) {
                            feeNames = txn.feeIds.map(fid => {
                                const fee = feeItems.value.find(f => f.id === fid);
                                return fee ? fee.name : fid;
                            });
                        } else if (txn.feeId) { // Fallback for backward compatibility
                            const fee = feeItems.value.find(f => f.id === txn.feeId);
                            feeNames = [fee ? fee.name : '未知費用'];
                        }

                        // Join names properly
                        const feeNameStr = feeNames.length > 1
                            ? `${feeNames[0]} 等${feeNames.length}項`
                            : feeNames[0] || '未知費用';

                        return {
                            ...txn,
                            feeName: feeNameStr,
                            fullFeeNames: feeNames.join(', ') // For tooltip
                        };
                    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                });

                const txnSummary = computed(() => {
                    let totalIncome = 0;
                    let totalRefund = 0;
                    let totalMonthlyBill = 0;
                    transactions.value.forEach(txn => {
                        if (txn.type === 'payment' && txn.status === 'confirmed') {
                            totalIncome += txn.amount;
                        } else if (txn.type === 'refund' && txn.status === 'confirmed') {
                            totalRefund += txn.amount;
                        } else if (txn.type === 'monthly_bill' && txn.status === 'confirmed') {
                            totalMonthlyBill += txn.amount;
                        }
                    });
                    return {
                        totalIncome,
                        totalRefund,
                        totalMonthlyBill,
                        netIncome: totalIncome - totalRefund,
                        netMonthlyBill: totalMonthlyBill
                    };
                });

                const exportTransactions = () => {
                    const loading = ElLoading.service({
                        lock: true,
                        text: '正在生成 Excel 報表...',
                        background: 'rgba(0, 0, 0, 0.7)',
                    });

                    setTimeout(() => {
                        loading.close();
                        ElMessage.success({
                            message: '交易記錄已導出: Transaction_History_20260131.xlsx',
                            type: 'success',
                            duration: 3000
                        });
                    }, 1500);
                };

                const urlParams = initialUrlParams;
                const urlAction = urlParams.get('action');
                const urlStatus = urlParams.get('status');
                const urlStatusWhitelist = [
                    'pending_payment', 'reserved', 'pickup_overdue', 'inspecting', 'renting',
                    'renewing', 'overdue', 'accident_processing', 'settlement_pending', 'payment_due', 'refund_pending',
                    'completed', 'cancelled', 'no_show', 'rejected', 'closed'
                ];
                if (urlStatusWhitelist.includes(urlStatus)) {
                    orderStatus.value = urlStatus;
                }
                setTimeout(() => {
                    if (urlAction === 'pickup') {
                        if (!urlStatus) orderStatus.value = 'reserved';
                        openPickupModal();
                    } else if (urlAction === 'return') {
                        if (!urlStatus) orderStatus.value = 'renting';
                        openReturnModal();
                    } else if (urlAction === 'extend') {
                        if (!urlStatus) orderStatus.value = 'renting';
                        openExtendModal();
                    } else if (urlAction === 'cancel') {
                        openCancelOrderModal();
                    } else if (urlAction === 'no_show') {
                        if (!urlStatus) orderStatus.value = 'pickup_overdue';
                        openNoShowModal();
                    } else if (urlAction === 'close') {
                        openCloseOrderModal();
                    } else if (urlAction === 'accident') {
                        if (!urlStatus) orderStatus.value = 'accident_processing';
                        openAccidentModal();
                    } else if (urlAction === 'pay') {
                        orderStatus.value = 'pending_payment';
                        openBookingPaymentDialog();
                    } else if (['fees', 'collect', 'refund', 'notify'].includes(urlAction)) {
                        feeModalVisible.value = true;
                        if (['collect', 'notify'].includes(urlAction) || postChargeView.status) {
                            feePhaseFilter.value = 'post';
                        }
                        if (urlAction === 'notify') {
                            feeStatusFilter.value = 'pending';
                        } else if (urlAction === 'collect') {
                            feeStatusFilter.value = isMonthlyBilling.value ? 'monthly_billing' : 'pending';
                        } else if (urlAction === 'fees' && isMonthlyBilling.value) {
                            feeStatusFilter.value = 'monthly_billing';
                        }
                    }
                }, 0);



                

</script>

<style>

      :root {
        --app-color-primary: #00689E;
        --app-color-primary-hover: #005B8A;
        --app-color-primary-active: #004F78;
        --app-color-primary-shadow: rgb(0 104 158 / 18%);
        --app-color-primary-light-3: #4D95BB;
        --app-color-primary-light-5: #80B4CF;
        --app-color-primary-light-7: #B3D2E2;
        --app-color-primary-light-8: #CCE1EC;
        --app-color-primary-light-9: #E6F0F5;
        --app-color-sidebar: rgb(246 247 249 / 94%);
        --app-color-sidebar-border: rgb(60 60 67 / 12%);
        --app-color-sidebar-text: #3a3a3c;
        --app-color-sidebar-muted: #8e8e93;
        --app-color-sidebar-hover: rgb(60 60 67 / 7%);
      }
    

      /* 未設置 data-theme 時保持淺色默認值。 */
      html[data-theme='light'] {
        --app-color-sidebar: rgb(255 255 255 / 72%);
        --app-color-sidebar-border: rgb(5 5 5 / 10%);
        --app-color-sidebar-text: rgb(0 0 0 / 88%);
        --app-color-sidebar-muted: rgb(0 0 0 / 45%);
        --app-color-sidebar-hover: rgb(0 0 0 / 4%);
        --app-color-text-primary: rgb(0 0 0 / 88%);
        --app-color-text-secondary: rgb(0 0 0 / 65%);
        --app-color-text-muted: rgb(0 0 0 / 45%);
        --app-color-border: rgb(5 5 5 / 12%);
        --app-color-border-light: rgb(5 5 5 / 8%);
        --app-color-border-subtle: rgb(5 5 5 / 6%);
        --app-color-surface: rgb(255 255 255 / 68%);
        --app-color-surface-subtle: rgb(255 255 255 / 54%);
        --app-color-surface-muted: rgb(255 255 255 / 62%);
        --app-color-avatar-surface: #8c8c8c;
        --app-color-host-page: #f5f7fa;
        color-scheme: light;
      }

      html[data-theme='dark'] {
        --app-color-sidebar: #141414;
        --app-color-sidebar-border: #303030;
        --app-color-sidebar-text: rgb(255 255 255 / 88%);
        --app-color-sidebar-muted: rgb(255 255 255 / 45%);
        --app-color-sidebar-hover: rgb(255 255 255 / 8%);
        --app-color-text-primary: rgb(255 255 255 / 88%);
        --app-color-text-secondary: rgb(255 255 255 / 65%);
        --app-color-text-muted: rgb(255 255 255 / 45%);
        --app-color-border: #434343;
        --app-color-border-light: #303030;
        --app-color-border-subtle: #262626;
        --app-color-surface: #141414;
        --app-color-surface-subtle: #1f1f1f;
        --app-color-surface-muted: #1f1f1f;
        --app-color-avatar-surface: #595959;
        --app-color-host-page: #000;
        color-scheme: dark;
      }

      /* 頂欄在深色主題下仍保留輕量半透明材質，不與內容區混成一塊純黑麪板。 */
      html[data-theme='light'] .prototype-topbar,
      html[data-theme='dark'] .prototype-topbar {
        border-color: color-mix(in srgb, var(--app-color-border-light) 80%, transparent);
        background: color-mix(in srgb, var(--app-color-surface) 78%, transparent);
        box-shadow: 0 8px 24px rgb(0 0 0 / 14%);
        backdrop-filter: blur(22px) saturate(145%);
        -webkit-backdrop-filter: blur(22px) saturate(145%);
      }

      html[data-theme='dark'] .prototype-topbar {
        box-shadow:
          inset 0 1px 0 rgb(255 255 255 / 8%),
          0 10px 30px rgb(0 0 0 / 34%);
      }

      @media (prefers-reduced-transparency: reduce) {
        html[data-theme='light'] .prototype-topbar,
        html[data-theme='dark'] .prototype-topbar {
          background: var(--app-color-surface);
          box-shadow: none;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
      }
    

.order-detail .custom-scroll::-webkit-scrollbar {
            width: 6px;
        }

        .order-detail .custom-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }

        .order-detail .el-card {
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }

        .order-detail .el-card__header {
            padding: 12px 20px;
            border-bottom: 1px solid #f3f4f6;
            min-height: 48px;
            display: flex;
            align-items: center;
        }

        .order-detail .el-card__body {
            padding: 0;
        }

        .order-detail .el-descriptions__label {
            font-weight: 500;
            color: #64748b;
        }

        .order-detail .el-descriptions__content {
            color: #1f2937;
            font-weight: 600;
        }

        /* Modal Customization */
        .order-detail .vehicle-select-card {
            transition: all 0.2s;
            border: 1px solid #e5e7eb;
        }

        .order-detail .vehicle-select-card:hover {
            border-color: var(--app-color-primary);
            background-color: var(--app-color-primary-light-9);
            cursor: pointer;
        }

        .order-detail .vehicle-select-card.selected {
            border-color: var(--app-color-primary) !important;
            background-color: var(--app-color-primary-light-9);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
            transform: scale(1.02);
        }

        .order-detail .stat-card {
            background: linear-gradient(to bottom right, #ffffff, #f9fafb);
        }

        /* Fix Dialog Padding for Full Control */
        .custom-modal .el-dialog__body {
            padding: 0 !important;
        }
    
      /* 窄屏內容降級：分頁收起跳頁輸入；寬表格由 el-table 在面板內自行橫向滾動。 */
      @media (max-width: 1080px) {
        .el-pagination .el-pagination__jump {
          display: none;
        }
      }
    
</style>
