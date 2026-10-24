<!-- 自动导出：HTML 原型 → Vue 3 SFC（rimo-rental/operation/workbench.html）。
布局与平台内渲染一比一；模板/逻辑搬运自页面源码，请勿在导出文件上直接二次手工编辑后再导回。
宿主要求：vue3 + element-plus + @element-plus/icons-vue；需 app.use(ElementPlus) 并全局注册图标组件。
注意：<style> 含 :root / html[data-theme] 级别的主题变量（--app-* 命名空间），会作用于宿主页面。 -->
<template>
  <div class="prototype-vue-root workbench-vue-root">
<section class="legacy-page legacy-workbench workbench" data-page-content data-page-root="workbench" data-page-key="workbench">
  <div data-business-content data-layout-type="legacy">

            <!-- Dashboard Content (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">

                <!-- 模塊 1：歡迎與動態數據頭 -->
                <div 
                    class="bg-white rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center card-shadow">
                    <div class="flex items-center gap-5 mb-6 lg:mb-0">
                        <el-avatar :size="72" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                            class="border-2 border-blue-50"></el-avatar>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800 tracking-tight">{{ greeting }}{{ userName }}
                            </h2>
                            <p class="text-sm text-gray-500 mt-2 flex items-center">
                                今日有 <span 
                                    class="bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] font-bold px-2 py-0.5 rounded ml-1 mr-1">5</span>
                                臺車輛需要交付，請關注待辦事項。
                                <a href="#" class="text-[color:var(--app-color-primary)] ml-3 hover:underline flex items-center text-xs">查看詳情
                                    <el-icon class="ml-0.5">
                                        <ArrowRight></ArrowRight>
                                    </el-icon></a>
                            </p>
                        </div>
                    </div>
                    <!-- 核心指標區 -->
                    <div class="flex gap-10">
                        <div class="text-center group cursor-pointer">
                            <div 
                                class="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">
                                今日待辦事項
                                <span 
                                    class="text-[10px] text-green-500 bg-green-50 px-1 rounded flex items-center"><el-icon>
                                        <Bottom></Bottom>
                                    </el-icon>2項</span>
                            </div>
                            <div class="text-3xl font-bold text-red-500"><span 
                                    class="text-sm font-normal mr-1 text-gray-400"></span>{{ todoDialogCounts.all }}
                            </div>
                        </div>
                        <div class="w-px bg-gray-100 hidden md:block"></div>
                        <div class="text-center group cursor-pointer">
                            <div 
                                class="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">
                                今日出租率
                                <span 
                                    class="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><el-icon>
                                        <Top></Top>
                                    </el-icon>3.5%</span>
                            </div>
                            <div class="text-3xl font-bold"
                                :class="metrics.rentalRate >= 80 ? 'text-green-600' : 'text-orange-500'">{{
                                metrics.rentalRate }}<span class="text-lg font-normal ml-0.5 text-gray-400">%</span>
                            </div>
                        </div>
                        <div class="w-px bg-gray-100 hidden md:block"></div>
                        <div class="text-center group cursor-pointer">
                            <div 
                                class="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">
                                在租/總車輛
                                <span 
                                    class="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><el-icon>
                                        <Top></Top>
                                    </el-icon>12臺</span>
                            </div>
                            <div class="text-3xl font-bold text-[color:var(--app-color-primary)]">{{ metrics.inRentCount }}<span 
                                    class="text-lg font-normal text-gray-400">/{{ metrics.totalFleet }}</span></div>
                        </div>
                        <div class="w-px bg-gray-100 hidden md:block"></div>
                        <div class="text-center group cursor-pointer">
                            <div 
                                class="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">
                                本月營收
                                <span 
                                    class="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><el-icon>
                                        <Top></Top>
                                    </el-icon>11.2%</span>
                            </div>
                            <div class="text-3xl font-bold text-gray-800"><span 
                                    class="text-lg font-normal mr-1 text-gray-400">&yen;</span>{{ formattedRevenue }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 模塊 1.5：深度業務 - 核心資產異常監控橫幅 -->
                <div 
                    class="bg-gradient-to-r from-red-50 via-orange-50 to-gray-50 rounded-xl p-0 flex items-center border border-red-100/50 card-shadow overflow-hidden">
                    <div class="bg-red-500 text-white px-4 py-3 text-sm font-bold flex items-center shrink-0">
                        <el-icon class="mr-1.5">
                            <Warning></Warning>
                        </el-icon>資產異常預警
                    </div>
                    <div class="flex-1 flex px-4 gap-8 overflow-x-auto whitespace-nowrap custom-scroll">
                        <div class="flex items-center gap-2 cursor-pointer group">
                            <div class="w-2 h-2 rounded-full bg-red-500 group-hover:animate-ping"></div>
                            <span class="text-sm text-gray-600 group-hover:text-red-600 transition-colors">事故定損：<strong 
                                    class="text-red-600">{{ assetHealth.accident }}臺</strong></span>
                        </div>
                        <div class="w-px bg-gray-200/50 h-4 my-auto"></div>
                        <div class="flex items-center gap-2 cursor-pointer group">
                            <div class="w-2 h-2 rounded-full bg-orange-500 group-hover:animate-ping"></div>
                            <span 
                                class="text-sm text-gray-600 group-hover:text-orange-600 transition-colors">維修中：<strong 
                                    class="text-orange-600">{{ assetHealth.maintenance }}臺</strong></span>
                        </div>
                        <div class="w-px bg-gray-200/50 h-4 my-auto"></div>
                        <div class="flex items-center gap-2 cursor-pointer group">
                            <div class="w-2 h-2 rounded-full bg-gray-400 group-hover:animate-ping"></div>
                            <span 
                                class="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">GPS掉線：<strong 
                                    class="text-gray-800">{{ assetHealth.offline }}臺</strong></span>
                        </div>
                        <div class="w-px bg-gray-200/50 h-4 my-auto"></div>
                        <div class="flex items-center gap-2 cursor-pointer group">
                            <div class="w-2 h-2 rounded-full bg-yellow-500 group-hover:animate-ping"></div>
                            <span 
                                class="text-sm text-gray-600 group-hover:text-yellow-600 transition-colors">閒置>5天：<strong 
                                    class="text-yellow-600">{{ assetHealth.idle }}臺</strong></span>
                        </div>
                    </div>
                    <div class="px-4 shrink-0">
                        <el-button link type="danger" size="small">立即處置 <el-icon class="ml-1">
                                <ArrowRight></ArrowRight>
                            </el-icon></el-button>
                    </div>
                </div>

                <!-- 模塊 2、3、4: 柵格主體 -->
                <div class="flex flex-col xl:flex-row gap-6">

                    <!-- 左側欄 -->
                    <div class="xl:w-[22%] space-y-6 flex flex-col min-w-0">
                        <!-- 常用功能 -->
                        <div class="bg-white rounded-2xl p-5 card-shadow">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-gray-800 flex items-center">
                                    <span class="w-1 h-4 bg-[color:var(--app-color-primary)] rounded-full mr-2"></span>
                                    常用功能
                                </h3>
                                <el-button link type="primary" size="small">編輯</el-button>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div @click="window.location.href='new_order.html'"
                                    class="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group">
                                    <div 
                                        class="w-10 h-10 rounded-xl icon-blue flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <el-icon class="text-xl">
                                            <Ticket></Ticket>
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-700 font-medium">新建訂單</span>
                                </div>
                                <div @click="window.location.href='dispatch.html'"
                                    class="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group">
                                    <div 
                                        class="w-10 h-10 rounded-xl icon-green flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <el-icon class="text-xl">
                                            <Van></Van>
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-700 font-medium">車輛排程</span>
                                </div>
                                <div @click="window.location.href='members.html'"
                                    class="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group">
                                    <div 
                                        class="w-10 h-10 rounded-xl icon-purple flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <el-icon class="text-xl">
                                            <User></User>
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-700 font-medium">客戶建檔</span>
                                </div>
                                <div @click="window.location.href='dashboard.html'"
                                    class="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group">
                                    <div 
                                        class="w-10 h-10 rounded-xl icon-orange flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <el-icon class="text-xl">
                                            <Odometer></Odometer>
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-700 font-medium">運營大屏</span>
                                </div>
                            </div>
                        </div>

                        <!-- 最新公告 -->
                        <div class="latest-announcement-card card-shadow flex-1">
                            <div class="flex items-center justify-between mb-5">
                                <h3 class="font-bold text-gray-800 flex items-center">
                                    <span class="w-1 h-4 bg-orange-400 rounded-full mr-2"></span>
                                    最新公告
                                </h3>
                                <a href="#" class="text-xs text-gray-400 hover:text-[color:var(--app-color-primary)]"
                                    @click.prevent="openAnnouncementCenter">更多 ></a>
                            </div>
                            <div>
                                <div v-for="(item, idx) in featuredAnnouncements" :key="item.id"
                                    class="latest-announcement-item group" :class="{ 'is-primary': idx === 0 }"
                                    @click="openAnnouncementDetail(item)">
                                    <div class="latest-announcement-dot"></div>
                                    <div class="flex-1">
                                        <div class="latest-announcement-title group-hover:text-[color:var(--app-color-primary)] line-clamp-1">
                                            {{ item.title }}
                                        </div>
                                        <div class="latest-announcement-summary line-clamp-2">{{ getAnnouncementPreview(item, 48) }}</div>
                                        <div class="latest-announcement-meta">
                                            <span v-if="idx === 0" class="latest-announcement-badge">置頂</span>
                                            <span>{{ item.date }} | {{ item.publisher }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 中間欄 核心工作流 -->
                    <div class="xl:w-[53%] space-y-6 flex flex-col min-w-0">
                        <!-- 待辦事項 -->
                        <div class="bg-white rounded-2xl card-shadow overflow-hidden flex flex-col">
                            <div class="px-6 pt-5 pb-1 flex items-center justify-between">
                                <h3 class="font-bold text-gray-800 text-lg flex items-center">
                                    <el-icon class="mr-2 text-[color:var(--app-color-primary)]">
                                        <List></List>
                                    </el-icon>
                                    待辦事項
                                    <span 
                                        class="ml-2 font-normal text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{{
                                        todoDialogCounts.all }}</span>
                                </h3>
                                <a href="#" class="text-xs text-gray-400 hover:text-[color:var(--app-color-primary)] flex items-center"
                                    @click.prevent="todoDialogVisible = true; todoDialogTab = 'all'">全部
                                    <el-icon class="ml-1">
                                        <ArrowRight></ArrowRight>
                                    </el-icon></a>
                            </div>
                            <div class="px-4 workbench-tabs">
                                <el-tabs v-model="todoTab">
                                    <el-tab-pane :label="`待處理 (${todoDialogCounts.pending})`"
                                        name="pending"></el-tab-pane>
                                    <el-tab-pane :label="`車況/車機異常 (${todoDialogCounts.exception})`"
                                        name="exception"></el-tab-pane>
                                    <el-tab-pane :label="`調度/整備 (${todoDialogCounts.dispatch})`"
                                        name="dispatch"></el-tab-pane>
                                    <el-tab-pane :label="`超期提醒 (${todoDialogCounts.overdue})`"
                                        name="overdue"></el-tab-pane>
                                </el-tabs>
                            </div>

                            <div class="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll"
                                v-show="todoTab === 'pending'">
                                <!-- 待辦卡片 1 -->
                                <div 
                                    class="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="primary"
                                            effect="plain">新進</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-[color:var(--app-color-primary-light-8)] flex items-center justify-center text-[color:var(--app-color-primary)]">
                                            <el-icon class="text-xl">
                                                <UserFilled></UserFilled>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">企業資質審覈 - 和運科技</div>
                                            <div class="text-xs text-gray-500 mt-0.5">申請人: 李經理 | 10分鐘前</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        新註冊企業客戶請求開通企業月結白名單。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" size="small" class="flex-1">立即審覈</el-button>
                                        <el-button plain size="small" class="flex-1">查看資料</el-button>
                                    </div>
                                </div>

                                <!-- 待辦卡片 2 -->
                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">緊急</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <WarningFilled></WarningFilled>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">客戶退款審覈</div>
                                            <div class="text-xs text-gray-500 mt-0.5">訂單: R-202611-0021 | 2小時前</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        因門店缺車導致取消訂單，申請全額退款及補償 100元。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-popconfirm title="確認全額退款及補償 100元？" confirm-button-text="確定"
                                            cancel-button-text="取消" width="220" @confirm="$message.success('已確認退款')">
                                            <template #reference>
                                                <el-button type="danger" plain size="small"
                                                    class="flex-1">確認退款</el-button>
                                            </template>
                                        </el-popconfirm>
                                        <el-button plain size="small" class="flex-1">駁回</el-button>
                                    </div>
                                </div>

                                <!-- 待辦卡片 3 -->
                                <div 
                                    class="border border-green-100 bg-gradient-to-br from-green-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <el-icon class="text-xl">
                                                <Van></Van>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">派車方案待審覈</div>
                                            <div class="text-xs text-gray-500 mt-0.5">門店: 臺北信義門店 | 3小時前</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs truncate">
                                        臺北信義門店週末 GL8 訂單集中，需要確認本店車輛派車優先級。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-popconfirm title="確認採用此派車方案？" confirm-button-text="確認派車"
                                            cancel-button-text="取消" width="220" @confirm="$message.success('派車方案已確認')">
                                            <template #reference>
                                                <el-button type="success" plain size="small"
                                                    class="flex-1">確認派車</el-button>
                                            </template>
                                        </el-popconfirm>
                                        <el-button plain size="small" class="flex-1">查看單據</el-button>
                                    </div>
                                </div>

                                <!-- 待辦卡片 4 -->
                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">緊急</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Document></Document>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">緊急工單待處理</div>
                                            <div class="text-xs text-gray-500 mt-0.5">工單提醒 | 2024/05/05 11:11</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        [客服主管-張明] 剛剛提交了一筆 [緊急] 工單要求減免超時費，限時2小時內處理！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">立即處理</el-button>
                                        <el-button plain size="small" class="flex-1">查看工單</el-button>
                                    </div>
                                </div>
                            </div>

                            <!-- 車況/車機異常 Tab 數據 -->
                            <div class="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll"
                                v-show="todoTab === 'exception'">
                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">緊急</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <WarningFilled></WarningFilled>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">車輛事故上報</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車牌: 浙A·88888 | 2小時前</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        客戶反饋沿途發生追尾事故，車輛無法受控，需安排救援拖車服務。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">安排救援</el-button>
                                        <el-button plain size="small" class="flex-1">聯繫保險</el-button>
                                    </div>
                                </div>
                                <div 
                                    class="border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">車況異常</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                            <el-icon class="text-xl">
                                                <PictureRounded></PictureRounded>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">車況異常反饋待審覈</div>
                                            <div class="text-xs text-gray-500 mt-0.5">訂單: ZT24050500003 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500003, [車況異常反饋] 客戶在取車環節上傳了車輛剮蹭照片，請人工審覈定損單！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">審覈定損</el-button>
                                        <el-button plain size="small" class="flex-1">查看照片</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-yellow-100 bg-gradient-to-br from-yellow-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">管控中</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                            <el-icon class="text-xl">
                                                <Lightning></Lightning>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">車輛電壓低自動管控</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 車輛電壓較低，已自動管控3天(單號GC889)，管控內有5筆訂單待處理！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">查看管控</el-button>
                                        <el-button plain size="small" class="flex-1">處理訂單</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">掉線</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Connection></Connection>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">車機掉線自動管控</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 車輛車機掉線，已自動管控1天(單號GC890)，管控內有5筆訂單待處理！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" plain size="small" class="flex-1">查看管控</el-button>
                                        <el-button plain size="small" class="flex-1">聯繫維保</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="success"
                                            effect="plain">已恢復</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <el-icon class="text-xl">
                                                <CircleCheck></CircleCheck>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">車機恢復在線</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 車機恢復在線，已自動解除管控(單號GC889)！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="success" plain size="small" class="flex-1">解除複覈</el-button>
                                        <el-button plain size="small" class="flex-1">查看記錄</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">需尋車</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Location></Location>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">定位長時間無上報</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 車輛已超過1小時無最新定位上報，請指派尋車！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">指派尋車</el-button>
                                        <el-button plain size="small" class="flex-1">查看軌跡</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">疑似故障</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <WarningFilled></WarningFilled>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">車機異常斷電</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 車機發生異常斷電，疑似蓄電池故障，請指派維保！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" plain size="small" class="flex-1">指派維保</el-button>
                                        <el-button plain size="small" class="flex-1">查看電池</el-button>
                                    </div>
                                </div>
                            </div>

                            <!-- 調度/整備 Tab 數據 -->
                            <div class="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll"
                                v-show="todoTab === 'dispatch'" style="display: none;">
                                <div 
                                    class="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <el-icon class="text-xl">
                                                <Van></Van>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">人工調度確認</div>
                                            <div class="text-xs text-gray-500 mt-0.5">門店: 虹橋高鐵站店 | 1小時前</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        虹橋高鐵站店週末預訂高峯，需要確認本店可交付車輛和人工派車方案。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-popconfirm title="確認採用此人工調度方案？" confirm-button-text="確認方案"
                                            cancel-button-text="取消" width="220" @confirm="$message.success('已確認調度方案')">
                                            <template #reference>
                                                <el-button type="primary" size="small" class="flex-1">確認方案</el-button>
                                            </template>
                                        </el-popconfirm>
                                        <el-button plain size="small" class="flex-1">查看庫存</el-button>
                                    </div>
                                </div>
                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">緊急</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Brush></Brush>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">交車整備告警</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車牌: 滬A·12345 | 距離交車: 2小時</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        待交付車輛尚未錄入洗車整備記錄，即將超期，請催促整備專員完成作業。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" plain size="small" class="flex-1">下發催辦</el-button>
                                        <el-button plain size="small" class="flex-1">轉交他人</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <el-icon class="text-xl">
                                                <Setting></Setting>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">保養里程達標</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 車輛已達到預設保養里程 (50,000km)，請安排進廠維保！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" size="small" class="flex-1">安排進廠</el-button>
                                        <el-button plain size="small" class="flex-1">查看檔案</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-[color:var(--app-color-primary-light-8)] bg-gradient-to-br from-[color:var(--app-color-primary-light-9)] to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-[color:var(--app-color-primary-light-8)] flex items-center justify-center text-[color:var(--app-color-primary)]">
                                            <el-icon class="text-xl">
                                                <Calendar></Calendar>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">年度保養到期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 車輛已達到預設年度保養時間，請安排進廠維保！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" plain size="small" class="flex-1">安排保養</el-button>
                                        <el-button plain size="small" class="flex-1">查看計劃</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-[color:var(--app-color-primary-light-8)] bg-gradient-to-br from-[color:var(--app-color-primary-light-9)] to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-[color:var(--app-color-primary-light-8)] flex items-center justify-center text-[color:var(--app-color-primary)]">
                                            <el-icon class="text-xl">
                                                <Stamp></Stamp>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">年檢臨期預警</div>
                                            <div class="text-xs text-gray-500 mt-0.5">剩餘: 7天 | 共3臺車</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        檢測到有一批公牌營運車輛年檢即將到期，請儘快發派代理公司辦理全部年檢手續。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" plain size="small" class="flex-1">查看車輛批次</el-button>
                                        <el-button plain size="small" class="flex-1">指派代辦</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-green-100 bg-gradient-to-br from-green-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <el-icon class="text-xl">
                                                <Brush></Brush>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">深度清潔任務</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 累計租借達5次，已觸發深度清潔任務指標，請安排！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="success" plain size="small" class="flex-1">安排清潔</el-button>
                                        <el-button plain size="small" class="flex-1">查看記錄</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <el-icon class="text-xl">
                                                <Brush></Brush>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">日常清潔觸發</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 結束跨城長單，已觸發日常小清潔指標，請安排！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="success" plain size="small" class="flex-1">安排清潔</el-button>
                                        <el-button plain size="small" class="flex-1">查看訂單</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-orange-100 bg-gradient-to-br from-orange-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">停車超時</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <el-icon class="text-xl">
                                                <Location></Location>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">停車超時提醒</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車輛: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 停靠在臺北內湖VIP庫已達6小時未動，請確認是否移庫！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">確認移庫</el-button>
                                        <el-button plain size="small" class="flex-1">查看位置</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">預警</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Warning></Warning>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">網點車位預警</div>
                                            <div class="text-xs text-gray-500 mt-0.5">網點: 重慶江北T3 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        [預警] 重慶江北T3網點，已停入12輛車，剩餘0車位，即將引發還車阻塞！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" plain size="small" class="flex-1">安排移庫</el-button>
                                        <el-button plain size="small" class="flex-1">查看網點</el-button>
                                    </div>
                                </div>
                            </div>

                            <!-- 超期提醒 Tab 數據 -->
                            <div class="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll"
                                v-show="todoTab === 'overdue'" style="display: none;">
                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">嚴重逾期</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Timer></Timer>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">訂單嚴重逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">訂單: ZT24050500001 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500001, [嚴重逾期] 車輛已超過預計還車時間 2小時，多次聯繫客戶未果，請調度介入！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">指派調度</el-button>
                                        <el-button plain size="small" class="flex-1">查看訂單</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="info"
                                            effect="plain">輕微逾期</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <el-icon class="text-xl">
                                                <Timer></Timer>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">訂單輕微逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">訂單: ZT24050500001 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500001, [輕微逾期] 車輛已超過預計還車時間 15分鐘，請注意跟進客戶狀態。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" plain size="small" class="flex-1">提醒客戶</el-button>
                                        <el-button plain size="small" class="flex-1">查看訂單</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-orange-100 bg-gradient-to-br from-orange-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">中度逾期</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <el-icon class="text-xl">
                                                <Timer></Timer>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">訂單中度逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">訂單: ZT24050500001 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500001, [中度逾期] 車輛已超過預計還車時間 1小時，已自動發送扣費提醒短信。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">跟進客戶</el-button>
                                        <el-button plain size="small" class="flex-1">查看短信</el-button>
                                    </div>
                                </div>

                                <div 
                                    class="border border-green-100 bg-gradient-to-br from-green-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="success"
                                            effect="plain">即將逾期</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <el-icon class="text-xl">
                                                <Timer></Timer>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">訂單即將逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">訂單: ZT24050500002 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500002, [即將逾期] 車輛距離預計還車時間僅剩 30分鐘，系統已預觸發還車節點。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="success" plain size="small" class="flex-1">提前提醒</el-button>
                                        <el-button plain size="small" class="flex-1">查看訂單</el-button>
                                    </div>
                                </div>
                                <div 
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">超期2天</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Timer></Timer>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">車輛超期未還</div>
                                            <div class="text-xs text-gray-500 mt-0.5">車牌: 蘇A·66666 | 訂單: R-0033</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        應還時間 6月3日 18:00，已超期聯繫不上客戶，需立案啓動風控尋車。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">啓動尋車</el-button>
                                        <el-button plain size="small" class="flex-1">催收記錄</el-button>
                                    </div>
                                </div>
                                <div 
                                    class="border border-orange-100 bg-gradient-to-br from-orange-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">逾期5天</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div 
                                            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <el-icon class="text-xl">
                                                <DocumentDelete></DocumentDelete>
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">企業賬單逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">客戶: 特斯拉 | 賬期: 5月</div>
                                        </div>
                                    </div>
                                    <div 
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        5月對賬結算單 152,000元 逾期未支付，系統已暫停新單配額白名單。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">發送催繳單</el-button>
                                        <el-button plain size="small" class="flex-1">線下電聯溝通</el-button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 日程安排 (車輛交還日曆) -->
                        <div class="bg-white rounded-2xl p-5 card-shadow flex-1">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-gray-800 flex items-center">
                                    <span class="w-1 h-4 bg-[color:var(--app-color-primary)] rounded-full mr-2"></span>
                                    今日排車日程 ({{ scheduleDate }} {{ weekDay }})
                                </h3>
                                <div class="flex gap-2">
                                    <el-button size="small" circle icon="ArrowLeft"></el-button>
                                    <el-button size="small" plain>今天</el-button>
                                    <el-button size="small" circle icon="ArrowRight"></el-button>
                                </div>
                            </div>
                            <!-- 簡易日程軸展示 -->
                            <div class="grid grid-cols-4 gap-2 h-[180px]">
                                <!-- 欄目：早班 -->
                                <div class="bg-gray-50 rounded-lg p-2 flex flex-col">
                                    <div class="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">08:00 -
                                        12:00</div>
                                    <div class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
                                        <div 
                                            class="bg-blue-100/50 border-l-4 border-blue-500 p-2 rounded text-xs cursor-pointer hover:bg-blue-100">
                                            <div class="font-bold text-blue-700">交車 10臺</div>
                                            <div class="text-gray-500 mt-1">2024年度商務用...</div>
                                            <div class="text-gray-400 mt-1">09:30 虹橋店</div>
                                        </div>
                                        <div 
                                            class="bg-green-100/50 border-l-4 border-green-500 p-2 rounded text-xs cursor-pointer hover:bg-green-100">
                                            <div class="font-bold text-green-700">還車 3臺</div>
                                            <div class="text-gray-500 mt-1">個人短租散單</div>
                                            <div class="text-gray-400 mt-1">11:00 市區店</div>
                                        </div>
                                    </div>
                                </div>
                                <!-- 欄目：中午 -->
                                <div class="bg-gray-50 rounded-lg p-2 flex flex-col">
                                    <div class="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">12:00 -
                                        14:00</div>
                                    <div class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
                                        <div 
                                            class="bg-orange-100/50 border-l-4 border-orange-500 p-2 rounded text-xs cursor-pointer hover:bg-orange-100">
                                            <div class="font-bold text-orange-700">維保接車 2臺</div>
                                            <div class="text-gray-500 mt-1">定期小保養</div>
                                            <div class="text-gray-400 mt-1">13:30 維修廠</div>
                                        </div>
                                    </div>
                                </div>
                                <!-- 欄目：下午 -->
                                <div class="bg-gray-50 rounded-lg p-2 flex flex-col">
                                    <div class="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">14:00 -
                                        18:00</div>
                                    <div class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
                                        <div 
                                            class="bg-[color:var(--app-color-primary-light-8)] border-l-4 border-[color:var(--app-color-primary)] p-2 rounded text-xs cursor-pointer hover:bg-[color:var(--app-color-primary-light-8)]">
                                            <div class="font-bold text-[color:var(--app-color-primary-hover)]">調派接車 5臺</div>
                                            <div class="text-gray-500 mt-1">新購微型電車入庫</div>
                                            <div class="text-gray-400 mt-1">15:00 總倉</div>
                                        </div>
                                        <div 
                                            class="bg-red-100/50 border-l-4 border-red-500 p-2 rounded text-xs cursor-pointer hover:bg-red-100">
                                            <div class="font-bold text-red-700">事故定損 1臺</div>
                                            <div class="text-gray-500 mt-1">保險公司現場覈驗</div>
                                            <div class="text-gray-400 mt-1">16:30 虹橋店</div>
                                        </div>
                                    </div>
                                </div>
                                <!-- 欄目：晚間 -->
                                <div class="bg-gray-50 rounded-lg p-2 flex flex-col">
                                    <div class="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">18:00 -
                                        24:00</div>
                                    <div class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
                                        <!-- 無數據 -->
                                        <div class="flex items-center justify-center h-full text-xs text-gray-300">
                                            暫無日程安排</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右側欄 -->
                    <div class="xl:w-[25%] space-y-6 flex flex-col min-w-0">
                        <!-- 運營 Banner 輪播 -->
                        <el-carousel height="160px" :interval="5000" arrow="hover" indicator-position="none"
                            class="rounded-2xl overflow-hidden card-shadow">
                            <el-carousel-item v-for="(banner, idx) in banners" :key="idx">
                                <div :class="'bg-gradient-to-r ' + banner.gradient"
                                    class="rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full">
                                    <div class="relative z-10">
                                        <h3 
                                            class="text-lg font-bold mb-2 break-all group-hover:-translate-y-1 transition-transform">
                                            {{ banner.title }}</h3>
                                        <p 
                                            class="text-xs text-white/80 leading-relaxed mb-4 group-hover:-translate-y-1 transition-transform delay-75 line-clamp-2">
                                            {{ banner.desc }}</p>
                                        <el-button round size="small"
                                            class="bg-white/20 border-white/30 text-white hover:bg-white hover:text-gray-800 transition-colors">{{
                                            banner.btnText }}</el-button>
                                    </div>
                                    <div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl">
                                    </div>
                                    <div class="absolute -left-4 -top-4 w-24 h-24 rounded-full bg-white/20 blur-xl">
                                    </div>
                                    <div 
                                        class="absolute right-2 top-4 text-7xl opacity-10 group-hover:scale-110 transition-transform group-hover:rotate-12 duration-500">
                                        <el-icon>
                                            <component :is="banner.icon" ></component>
                                        </el-icon>
                                    </div>
                                </div>
                            </el-carousel-item>
                        </el-carousel>

                        <!-- 業務支撐應用導航 -->
                        <div class="bg-white rounded-2xl p-5 card-shadow flex-1">
                            <div class="flex items-center justify-between mb-5">
                                <h3 class="font-bold text-gray-800 flex items-center">
                                    <span class="w-1 h-4 bg-teal-500 rounded-full mr-2"></span>
                                    業務支撐模塊
                                </h3>
                                <div class="flex gap-2">
                                    <el-button circle size="small" icon="Setting" @click="settingDialogVisible = true"
                                        title="自定義模塊佈局"></el-button>
                                    <a href="#" class="text-xs text-gray-400 hover:text-[color:var(--app-color-primary)] leading-loose">更多應用
                                        ></a>
                                </div>
                            </div>

                            <!-- 九宮格應用市場樣式 -->
                            <div class="grid grid-cols-3 gap-y-6 gap-x-2">
                                <a v-for="app in selectedApps" :key="app.id" :href="app.href"
                                    class="flex flex-col items-center cursor-pointer group"
                                    style="text-decoration: none;">
                                    <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-2 group-hover:shadow-md group-hover:-translate-y-1 transition-all"
                                        :class="app.color">
                                        <el-icon class="text-2xl">
                                            <component :is="app.icon" ></component>
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-600 font-medium">{{ app.name }}</span>
                                </a>
                                <div v-if="selectedApps.length === 0"
                                    class="col-span-3 text-xs text-gray-400 text-center py-4">
                                    暫無模塊，請點擊右上角齒輪進行配置。
                                </div>
                            </div>

                            <div class="mt-8 border-t border-dashed border-gray-200 pt-4">
                                <div class="text-xs text-gray-400 mb-3 font-medium">最近訪問</div>
                                <div class="flex gap-2 flex-wrap">
                                    <a v-for="page in recentPages" :key="page.href" :href="page.href"
                                        style="text-decoration: none;">
                                        <el-tag size="small" type="info" class="cursor-pointer hover:bg-gray-200">{{
                                            page.name }}</el-tag>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 待辦事項總覽彈窗 -->
                

                <!-- 公告中心彈窗 -->
                

                <!-- 公告詳情彈窗 -->
                

                <!-- P1-14 自定義九宮格彈窗 -->
                

            </div>
  </div>
</section>
<div data-page-overlay="overlay" data-block-id="legacy-overlays" data-block-name="歷史頁面覆蓋層" class="workbench-overlay">
<el-dialog v-model="todoDialogVisible" width="980px" class="todo-dialog workbench-overlay" append-to-body>
                    <template #header>
                        <div class="flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <div 
                                    class="w-10 h-10 rounded-xl bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary)] flex items-center justify-center">
                                    <el-icon class="text-xl">
                                        <List></List>
                                    </el-icon>
                                </div>
                                <div>
                                    <div class="text-base font-semibold text-gray-800">待辦事項總覽</div>
                                    <div class="text-xs text-gray-500">集中處理異常、調度與超期提醒</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <el-button size="small" plain @click="todoDialogTab = 'all'">重置篩選</el-button>
                                <el-button size="small" type="primary"
                                    @click="todoDialogVisible = false">標記已讀</el-button>
                            </div>
                        </div>
                    </template>
                    <div class="px-2 -mx-2">
                        <el-tabs v-model="todoDialogTab" class="workbench-tabs">
                            <el-tab-pane :label="`全部 (${todoDialogCounts.all})`" name="all"></el-tab-pane>
                            <el-tab-pane :label="`待處理 (${todoDialogCounts.pending})`" name="pending"></el-tab-pane>
                            <el-tab-pane :label="`車況/車機異常 (${todoDialogCounts.exception})`"
                                name="exception"></el-tab-pane>
                            <el-tab-pane :label="`調度/整備 (${todoDialogCounts.dispatch})`" name="dispatch"></el-tab-pane>
                            <el-tab-pane :label="`超期提醒 (${todoDialogCounts.overdue})`" name="overdue"></el-tab-pane>
                        </el-tabs>
                    </div>
                    <div class="mt-3 max-h-[520px] overflow-y-auto custom-scroll pr-1">
                        <div class="grid grid-cols-2 gap-4">
                            <div v-for="item in filteredTodoDialogItems" :key="item.id"
                                class="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                                <div class="flex items-start justify-between gap-3 mb-2">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <span class="text-sm font-semibold text-gray-800">{{ item.title }}</span>
                                            <el-tag v-if="item.badge" size="small" :type="item.badgeType"
                                                effect="plain">{{ item.badge }}</el-tag>
                                        </div>
                                        <div class="text-xs text-gray-500 mt-1">{{ item.meta }}</div>
                                    </div>
                                </div>
                                <div class="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded p-2">
                                    {{ item.desc }}
                                </div>
                                <div class="mt-3 flex gap-2">
                                    <el-button size="small" :type="item.primaryType || 'primary'" class="flex-1"
                                        @click="handleDialogAction(item.primaryAction, item)">{{ item.primaryAction
                                        }}</el-button>
                                    <el-button size="small" plain class="flex-1"
                                        @click="handleDialogAction(item.secondaryAction, item)">{{ item.secondaryAction
                                        }}</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="todoDialogVisible = false">關閉</el-button>
                            <el-button type="primary" @click="todoDialogVisible = false">完成處理</el-button>
                        </span>
                    </template>
                </el-dialog>
<el-dialog v-model="announcementDialogVisible" width="760px" class="announcement-dialog workbench-overlay" append-to-body>
                    <template #header>
                        <div class="announcement-dialog-header">
                            <div class="announcement-dialog-title">更多公告</div>
                            <div class="announcement-dialog-sub">共 {{ filteredAnnouncements.length }} 條公告</div>
                        </div>
                    </template>
                    <div class="announcement-search-wrap">
                        <el-input v-model="announcementKeyword" size="small" clearable
                            placeholder="搜索公告標題 / 內容 / 發佈人" class="w-full">
                            <template #prefix>
                                <el-icon>
                                    <Search></Search>
                                </el-icon>
                            </template>
                        </el-input>
                    </div>
                    <div class="announcement-list-wrap custom-scroll">
                        <div v-for="item in filteredAnnouncements" :key="item.id"
                            class="announcement-list-item"
                            @click="openAnnouncementDetail(item)">
                            <div class="announcement-list-title">{{ item.title }}</div>
                            <div class="announcement-list-summary line-clamp-2">{{ getAnnouncementPreview(item, 90) }}</div>
                            <div class="announcement-list-meta">{{ item.date }} | {{ item.publisher }}</div>
                        </div>
                        <div v-if="filteredAnnouncements.length === 0" class="announcement-empty">
                            暫無符合條件的公告
                        </div>
                    </div>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="announcementDialogVisible = false">關閉</el-button>
                        </span>
                    </template>
                </el-dialog>
<el-dialog v-model="announcementDetailVisible" width="760px" class="announcement-detail-dialog workbench-overlay" append-to-body>
                    <template #header>
                        <div class="announcement-dialog-header">
                            <div class="announcement-dialog-title">
                                {{ activeAnnouncement ? activeAnnouncement.title : '公告詳情' }}
                            </div>
                            <div class="announcement-dialog-sub">公告詳情</div>
                        </div>
                    </template>
                    <div v-if="activeAnnouncement" class="announcement-detail-content-box">
                        <div class="announcement-detail-meta">
                            發佈時間 {{ activeAnnouncement.date }} | 發佈人 {{ activeAnnouncement.publisher }}
                        </div>
                        <div class="announcement-detail-content">
                            {{ activeAnnouncement.content }}
                        </div>
                    </div>
                    <div v-else class="text-xs text-gray-400 py-4">暫無公告詳情</div>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="announcementDetailVisible = false">關閉</el-button>
                        </span>
                    </template>
                </el-dialog>
<el-dialog v-model="settingDialogVisible" title="自定義主頁應用模塊" width="640px" append-to-body class="workbench-overlay">
                    <div class="text-sm text-gray-500 mb-4">您可以從系統應用池中，拖拽或勾選最多 8 個功能模塊到您的個人工作臺。</div>

                    <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-xs text-gray-500">已選模塊 ({{ selectedApps.length }}/{{ maxSelectedApps }})
                            </div>
                            <el-button link size="small" type="primary" @click="resetAppSelection">恢復默認</el-button>
                        </div>
                        <div v-if="selectedApps.length" class="flex flex-wrap gap-2">
                            <div v-for="app in selectedApps" :key="app.id"
                                class="flex items-center gap-1.5 px-2 py-1.5 rounded-full border text-xs cursor-move transition"
                                :class="dragAppId === app.id ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-200 bg-white'"
                                draggable="true" @dragstart="handleDragStart(app.id)" @dragover.prevent
                                @drop="handleDrop(app.id)" @dragend="handleDragEnd">
                                <el-icon class="text-sm text-[color:var(--app-color-primary)]">
                                    <component :is="app.icon" ></component>
                                </el-icon>
                                <span class="text-gray-700">{{ app.name }}</span>
                                <el-icon class="text-sm text-gray-400 hover:text-red-500"
                                    @click.stop="removeApp(app.id)">
                                    <Close></Close>
                                </el-icon>
                            </div>
                        </div>
                        <div v-else class="text-xs text-gray-400 py-2">尚未選擇模塊。</div>
                    </div>

                    <div>
                        <div class="text-xs text-gray-500 mb-3">系統應用池</div>
                        <div class="grid grid-cols-2 gap-3">
                            <div v-for="app in allApps" :key="app.id"
                                class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition"
                                :class="selectedAppIds.includes(app.id) ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-200 hover:border-gray-300'"
                                @click="toggleAppSelection(app.id)">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="app.color">
                                        <el-icon class="text-lg">
                                            <component :is="app.icon" ></component>
                                        </el-icon>
                                    </div>
                                    <div>
                                        <div class="text-sm font-medium text-gray-700">{{ app.name }}</div>
                                        <div class="text-xs text-gray-400">{{ app.category }}</div>
                                    </div>
                                </div>
                                <el-checkbox :model-value="selectedAppIds.includes(app.id)" @click.stop
                                    @change="(val) => toggleAppSelection(app.id, val)"></el-checkbox>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="settingDialogVisible = false">取消</el-button>
                            <el-button type="primary" @click="saveAppSelection">保存配置</el-button>
                        </span>
                    </template>
                </el-dialog>
</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
// 依赖：vue3 + element-plus + @element-plus/icons-vue（使用方自行安装）
import 'element-plus/dist/index.css';
import { ElMessage } from 'element-plus';
import { ArrowRight, Bottom, Top, Warning, Ticket, Van, User, Odometer, List, UserFilled, WarningFilled, Document, PictureRounded, Lightning, Connection, CircleCheck, Location, Brush, Setting, Calendar, Stamp, Timer, DocumentDelete, Search, Close } from '@element-plus/icons-vue';
// 如需主题跟随，宿主需在 <html> 上维护 data-theme='light' | 'dark'。



        
const todoTab = ref('pending');
                const todoDialogVisible = ref(false);
                const todoDialogTab = ref('all');
                const todoDialogItems = ref([
                    {
                        id: 'pending-1',
                        group: 'pending',
                        title: '企業資質審覈 - 和運科技',
                        meta: '待處理 | 申請人: 李經理 | 10分鐘前',
                        desc: '新註冊企業客戶請求開通企業月結白名單。',
                        badge: '待處理',
                        badgeType: 'info',
                        primaryAction: '立即審覈',
                        secondaryAction: '查看資料',
                        primaryType: 'primary'
                    },
                    {
                        id: 'pending-2',
                        group: 'pending',
                        title: '客戶退款審覈',
                        meta: '待處理 | 訂單: R-202611-0021 | 2小時前',
                        desc: '因門店缺車導致取消訂單，申請全額退款及補償 100元。',
                        badge: '緊急',
                        badgeType: 'danger',
                        primaryAction: '確認退款',
                        secondaryAction: '駁回',
                        primaryType: 'danger'
                    },
                    {
                        id: 'pending-3',
                        group: 'pending',
                        title: '派車方案待審覈',
                        meta: '待處理 | 門店: 臺北信義門店 | 3小時前',
                        desc: '臺北信義門店週末 GL8 訂單集中，需要確認本店車輛派車優先級。',
                        badge: '調度',
                        badgeType: 'success',
                        primaryAction: '確認派車',
                        secondaryAction: '查看庫存',
                        primaryType: 'success'
                    },
                    {
                        id: 'pending-6',
                        group: 'pending',
                        title: '緊急工單待處理',
                        meta: '工單提醒 | 2024/05/05 11:11',
                        desc: '[客服主管-張明] 剛剛提交了一筆 [緊急] 工單要求減免超時費，限時2小時內處理！',
                        badge: '緊急',
                        badgeType: 'danger',
                        primaryAction: '立即處理',
                        secondaryAction: '查看工單',
                        primaryType: 'danger'
                    },

                    {
                        id: 'exception-2',
                        group: 'exception',
                        title: '車輛事故上報',
                        meta: '車況/車機異常 | 車牌: 浙A·88888 | 2小時前',
                        desc: '客戶反饋沿途發生追尾事故，車輛無法受控，需安排救援拖車服務。',
                        badge: '緊急',
                        badgeType: 'danger',
                        primaryAction: '安排救援',
                        secondaryAction: '聯繫保險',
                        primaryType: 'danger'
                    },
                    {
                        id: 'exception-4',
                        group: 'exception',
                        title: '車況異常反饋待審覈',
                        meta: '車況提醒 | 訂單: ZT24050500003 | 2024/05/05 11:11',
                        desc: 'ZT24050500003, [車況異常反饋] 客戶在取車環節上傳了車輛剮蹭照片，請人工審覈定損單！',
                        badge: '車況異常',
                        badgeType: 'warning',
                        primaryAction: '審覈定損',
                        secondaryAction: '查看照片',
                        primaryType: 'warning'
                    },
                    {
                        id: 'exception-5',
                        group: 'exception',
                        title: '車輛電壓低自動管控',
                        meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 車輛電壓較低，已自動管控3天(單號GC889)，管控內有5筆訂單待處理！',
                        badge: '管控中',
                        badgeType: 'warning',
                        primaryAction: '查看管控',
                        secondaryAction: '處理訂單',
                        primaryType: 'warning'
                    },
                    {
                        id: 'exception-6',
                        group: 'exception',
                        title: '車機掉線自動管控',
                        meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 車輛車機掉線，已自動管控1天(單號GC890)，管控內有5筆訂單待處理！',
                        badge: '掉線',
                        badgeType: 'danger',
                        primaryAction: '查看管控',
                        secondaryAction: '聯繫維保',
                        primaryType: 'danger'
                    },
                    {
                        id: 'exception-7',
                        group: 'exception',
                        title: '車機恢復在線',
                        meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 車機恢復在線，已自動解除管控(單號GC889)！',
                        badge: '已恢復',
                        badgeType: 'success',
                        primaryAction: '解除複覈',
                        secondaryAction: '查看記錄',
                        primaryType: 'success'
                    },
                    {
                        id: 'exception-8',
                        group: 'exception',
                        title: '定位長時間無上報',
                        meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 車輛已超過1小時無最新定位上報，請指派尋車！',
                        badge: '需尋車',
                        badgeType: 'danger',
                        primaryAction: '指派尋車',
                        secondaryAction: '查看軌跡',
                        primaryType: 'danger'
                    },
                    {
                        id: 'exception-9',
                        group: 'exception',
                        title: '車機異常斷電',
                        meta: '車況提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 車機發生異常斷電，疑似蓄電池故障，請指派維保！',
                        badge: '疑似故障',
                        badgeType: 'danger',
                        primaryAction: '指派維保',
                        secondaryAction: '查看電池',
                        primaryType: 'danger'
                    },

                    {
                        id: 'dispatch-1',
                        group: 'dispatch',
                        title: '人工調度確認',
                        meta: '調度/整備 | 門店: 虹橋高鐵站店 | 1小時前',
                        desc: '虹橋高鐵站店週末預訂高峯，需要確認本店可交付車輛和人工派車方案。',
                        badge: '調度',
                        badgeType: 'primary',
                        primaryAction: '確認方案',
                        secondaryAction: '查看庫存',
                        primaryType: 'primary'
                    },
                    {
                        id: 'dispatch-2',
                        group: 'dispatch',
                        title: '交車整備告警',
                        meta: '調度/整備 | 車牌: 滬A·12345 | 距離交車: 2小時',
                        desc: '待交付車輛尚未錄入洗車整備記錄，即將超期，請催促整備專員完成作業。',
                        badge: '緊急',
                        badgeType: 'danger',
                        primaryAction: '下發催辦',
                        secondaryAction: '轉交他人',
                        primaryType: 'danger'
                    },
                    {
                        id: 'dispatch-3',
                        group: 'dispatch',
                        title: '保養里程達標',
                        meta: '保養提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 車輛已達到預設保養里程 (50,000km)，請安排進廠維保！',
                        badge: '保養',
                        badgeType: 'primary',
                        primaryAction: '安排進廠',
                        secondaryAction: '查看檔案',
                        primaryType: 'primary'
                    },
                    {
                        id: 'dispatch-4',
                        group: 'dispatch',
                        title: '年度保養到期',
                        meta: '保養提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 車輛已達到預設年度保養時間，請安排進廠維保！',
                        badge: '保養',
                        badgeType: 'primary',
                        primaryAction: '安排保養',
                        secondaryAction: '查看計劃',
                        primaryType: 'primary'
                    },
                    {
                        id: 'dispatch-5',
                        group: 'dispatch',
                        title: '深度清潔任務',
                        meta: '清潔提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 累計租借達5次，已觸發深度清潔任務指標，請安排！',
                        badge: '清潔',
                        badgeType: 'success',
                        primaryAction: '安排清潔',
                        secondaryAction: '查看記錄',
                        primaryType: 'success'
                    },
                    {
                        id: 'dispatch-6',
                        group: 'dispatch',
                        title: '日常清潔觸發',
                        meta: '清潔提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 結束跨城長單，已觸發日常小清潔指標，請安排！',
                        badge: '清潔',
                        badgeType: 'success',
                        primaryAction: '安排清潔',
                        secondaryAction: '查看訂單',
                        primaryType: 'success'
                    },
                    {
                        id: 'dispatch-7',
                        group: 'dispatch',
                        title: '停車超時提醒',
                        meta: '停車提醒 | 車輛: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 停靠在臺北內湖VIP庫已達6小時未動，請確認是否移庫！',
                        badge: '停車',
                        badgeType: 'warning',
                        primaryAction: '確認移庫',
                        secondaryAction: '查看位置',
                        primaryType: 'warning'
                    },
                    {
                        id: 'dispatch-8',
                        group: 'dispatch',
                        title: '網點車位預警',
                        meta: '停車提醒 | 網點: 重慶江北T3 | 2024/05/05 11:11',
                        desc: '[預警] 重慶江北T3網點，已停入12輛車，剩餘0車位，即將引發還車阻塞！',
                        badge: '預警',
                        badgeType: 'danger',
                        primaryAction: '安排移庫',
                        secondaryAction: '查看網點',
                        primaryType: 'danger'
                    },
                    {
                        id: 'dispatch-9',
                        group: 'dispatch',
                        title: '年檢臨期預警',
                        meta: '調度/整備 | 剩餘: 7天 | 共3臺車',
                        desc: '檢測到有一批公牌營運車輛年檢即將到期，請儘快發派代理公司辦理全部年檢手續。',
                        badge: '年檢',
                        badgeType: 'info',
                        primaryAction: '查看車輛批次',
                        secondaryAction: '指派代辦',
                        primaryType: 'primary'
                    },

                    {
                        id: 'overdue-1',
                        group: 'overdue',
                        title: '訂單嚴重逾期',
                        meta: '訂單提醒 | 訂單: ZT24050500001 | 2024/05/05 11:11',
                        desc: 'ZT24050500001, [嚴重逾期] 車輛已超過預計還車時間 2小時，多次聯繫客戶未果，請調度介入！',
                        badge: '嚴重逾期',
                        badgeType: 'danger',
                        primaryAction: '指派調度',
                        secondaryAction: '查看訂單',
                        primaryType: 'danger'
                    },
                    {
                        id: 'overdue-2',
                        group: 'overdue',
                        title: '訂單輕微逾期',
                        meta: '訂單提醒 | 訂單: ZT24050500001 | 2024/05/05 11:11',
                        desc: 'ZT24050500001, [輕微逾期] 車輛已超過預計還車時間 15分鐘，請注意跟進客戶狀態。',
                        badge: '輕微逾期',
                        badgeType: 'info',
                        primaryAction: '提醒客戶',
                        secondaryAction: '查看訂單',
                        primaryType: 'primary'
                    },
                    {
                        id: 'overdue-3',
                        group: 'overdue',
                        title: '訂單中度逾期',
                        meta: '訂單提醒 | 訂單: ZT24050500001 | 2024/05/05 11:11',
                        desc: 'ZT24050500001, [中度逾期] 車輛已超過預計還車時間 1小時，已自動發送扣費提醒短信。',
                        badge: '中度逾期',
                        badgeType: 'warning',
                        primaryAction: '跟進客戶',
                        secondaryAction: '查看短信',
                        primaryType: 'warning'
                    },
                    {
                        id: 'overdue-4',
                        group: 'overdue',
                        title: '訂單即將逾期',
                        meta: '訂單提醒 | 訂單: ZT24050500002 | 2024/05/05 11:11',
                        desc: 'ZT24050500002, [即將逾期] 車輛距離預計還車時間僅剩 30分鐘，系統已預觸發還車節點。',
                        badge: '即將逾期',
                        badgeType: 'success',
                        primaryAction: '提前提醒',
                        secondaryAction: '查看訂單',
                        primaryType: 'success'
                    },
                    {
                        id: 'overdue-5',
                        group: 'overdue',
                        title: '車輛超期未還',
                        meta: '超期提醒 | 車牌: 蘇A·66666 | 訂單: R-0033',
                        desc: '應還時間 6月3日 18:00，已超期聯繫不上客戶，需立案啓動風控尋車。',
                        badge: '超期2天',
                        badgeType: 'danger',
                        primaryAction: '啓動尋車',
                        secondaryAction: '催收記錄',
                        primaryType: 'danger'
                    },
                    {
                        id: 'overdue-6',
                        group: 'overdue',
                        title: '企業賬單逾期',
                        meta: '超期提醒 | 客戶: 特斯拉 | 賬期: 5月',
                        desc: '5月對賬結算單 152,000元 逾期未支付，系統已暫停新單配額白名單。',
                        badge: '逾期5天',
                        badgeType: 'warning',
                        primaryAction: '發送催繳單',
                        secondaryAction: '線下電聯溝通',
                        primaryType: 'warning'
                    },
                ]);
                const todoDialogCounts = computed(() => {
                    const all = todoDialogItems.value.length;
                    const pending = todoDialogItems.value.filter(item => item.group === 'pending').length;
                    const exception = todoDialogItems.value.filter(item => item.group === 'exception').length;
                    const dispatch = todoDialogItems.value.filter(item => item.group === 'dispatch').length;
                    const overdue = todoDialogItems.value.filter(item => item.group === 'overdue').length;
                    return { all, pending, exception, dispatch, overdue };
                });
                const filteredTodoDialogItems = computed(() => {
                    if (todoDialogTab.value === 'all') return todoDialogItems.value;
                    return todoDialogItems.value.filter(item => item.group === todoDialogTab.value);
                });

                // 統一的待辦異常數據源 (從儀表板遷移並補充)
                const pendingItems = ref([
                    { id: 'E-1', type: '異常', title: '逾期未還：R-202611-0012', desc: '車輛定位顯示未進入還車區域，多次聯繫未接聽，已超期2H。', time: '10:30', tag: '車況/車機異常', customer: '李廣' },
                    { id: 'E-2', type: '異常', title: '未準時取車：R-202611-0045', desc: '預訂取車時間爲14:00，目前仍未辦理提車手續。', time: '14:45', tag: '車況/車機異常', customer: '王建' },
                    { id: 'E-3', type: '事故定損', title: '事故報備審覈：R-202611-0089', desc: '客戶在APP端上傳了輕微追尾現場圖及交警責任書，請審覈並下發維修單。', time: '15:20', tag: '車況/車機異常', customer: '趙大川' },
                    { id: 'V-1', type: '待保養', title: '臨近5萬公里大保養', desc: '滬A·DF889（別克GL8）當前里程 49,850 km，請儘快排期進廠大保養。', time: '昨天', tag: '排車/整備', customer: '-' },
                    { id: 'V-2', type: '待清潔', title: '需要日常清潔', desc: '京A·R6677（大衆帕薩特）剛結束跨城調撥，內飾傳感器報警閾值觸發，請安排洗車。', time: '09:00', tag: '排車/整備', customer: '-' },
                    { id: 'V-3', type: '低電量快充', title: '需要補能', desc: '粵B·E1234（特斯拉Model 3）電池SOC僅剩 15%，請調度至福田高鐵站快充樁。', time: '08:15', tag: '排車/整備', customer: '-' },
                    { id: 'P-1', type: '催繳', title: '租金託欠催繳單', desc: '企業客戶 [臺北科技發展有限公司] 11月份月結賬單逾期 3 天未支付。', time: '3天前', tag: '逾期催繳', customer: '財務部轉單' },
                    { id: 'P-2', type: '催費驗證', title: '超期超時費減免申請', desc: '[張明]客服主管提交了一筆緊急超時費減免審批，限時2小時內處理。', time: '16:05', tag: '逾期催繳', customer: '張明' }
                ]);

                const exceptionItems = computed(() => pendingItems.value.filter(item => item.tag === '車況/車機異常'));
                const dispatchItems = computed(() => pendingItems.value.filter(item => item.tag === '排車/整備'));
                const overdueItems = computed(() => pendingItems.value.filter(item => item.tag === '逾期催繳'));

                const getIconForType = (type) => {
                    const map = { '異常': 'WarningFilled', '事故定損': 'Van', '待保養': 'Setting', '待清潔': 'Brush', '低電量快充': 'Lightning', '催繳': 'DocumentDelete', '催費驗證': 'Timer' };
                    return map[type] || 'Tickets';
                };
                const getColorForType = (type) => {
                    const map = { '異常': 'orange', '事故定損': 'red', '待保養': 'blue', '待清潔': 'green', '低電量快充': 'yellow', '催繳': 'orange', '催費驗證': 'red' };
                    return map[type] || 'gray';
                };

                const handleAction = (item) => {
                    pendingItems.value = pendingItems.value.filter(i => i.id !== item.id);
                    ElMessage.success('已完成操作: ' + item.title);
                };
                const handleDialogAction = (action, item) => {
                    ElMessage.success(action + '：' + item.title);
                };

                // P0-1: Dynamic greeting based on time of day
                const currentHour = new Date().getHours();
                const greeting = computed(() => {
                    if (currentHour >= 5 && currentHour < 12) return 'Hi, 早上好！';
                    if (currentHour >= 12 && currentHour < 18) return 'Hi, 下午好！';
                    return 'Hi, 晚上好！';
                });
                const userName = ref('Admin');

                // P1-4: Core operational metrics
                const assetHealth = reactive({
                    accident: 1,
                    maintenance: 3,
                    offline: 2,
                    idle: 4
                });

                // P1-14: Dialog state
                const settingDialogVisible = ref(false);
                const announcementDialogVisible = ref(false);
                const announcementDetailVisible = ref(false);
                const announcementKeyword = ref('');
                const activeAnnouncement = ref(null);
                const maxSelectedApps = 8;
                const allApps = ref([
                    { id: 'risk_review', name: '風控審覈', icon: 'DocumentChecked', href: 'member_review.html', color: 'icon-indigo', category: '風控/合規', default: true },
                    { id: 'vehicle_files', name: '維保檔案', icon: 'Files', href: 'vehicles.html', color: 'icon-orange', category: '車輛管理', default: true },
                    { id: 'finance', name: '財務結算', icon: 'Money', href: 'dashboard.html', color: 'icon-green', category: '財務', default: true },
                    { id: 'marketing', name: '營銷中心', icon: 'PictureRounded', href: 'marketing.html', color: 'icon-rose', category: '營銷', default: true },
                    { id: 'reports', name: '數據報表', icon: 'DataLine', href: 'war_room.html', color: 'icon-teal', category: '分析', default: true },
                    { id: 'settings', name: '系統配置', icon: 'Setting', href: 'settings.html', color: 'icon-purple', category: '系統', default: true },
                    { id: 'new_order', name: '新建訂單', icon: 'Ticket', href: 'new_order.html', color: 'icon-blue', category: '訂單' },
                    { id: 'store_orders', name: '門市訂單', icon: 'List', href: 'store_orders.html', color: 'icon-blue', category: '訂單' },
                    { id: 'members', name: '會員管理', icon: 'User', href: 'members.html', color: 'icon-purple', category: '客戶' },
                    { id: 'dispatch', name: '車輛排程', icon: 'Van', href: 'dispatch.html', color: 'icon-green', category: '調度' }
                ]);
                const selectedAppIds = ref([]);
                const dragAppId = ref(null);
                const selectedApps = computed(() => selectedAppIds.value
                    .map(id => allApps.value.find(app => app.id === id))
                    .filter(Boolean));
                const getDefaultAppIds = () => {
                    const defaults = allApps.value.filter(app => app.default).map(app => app.id);
                    return defaults.length ? defaults : allApps.value.slice(0, 6).map(app => app.id);
                };
                selectedAppIds.value = getDefaultAppIds();
                const toggleAppSelection = (appId, checked) => {
                    const exists = selectedAppIds.value.includes(appId);
                    const shouldSelect = typeof checked === 'boolean' ? checked : !exists;
                    if (shouldSelect) {
                        if (exists) return;
                        if (selectedAppIds.value.length >= maxSelectedApps) {
                            ElMessage.warning(`最多選擇 ${maxSelectedApps} 個模塊`);
                            return;
                        }
                        selectedAppIds.value = [...selectedAppIds.value, appId];
                        return;
                    }
                    if (!exists) return;
                    selectedAppIds.value = selectedAppIds.value.filter(id => id !== appId);
                };
                const removeApp = (appId) => {
                    selectedAppIds.value = selectedAppIds.value.filter(id => id !== appId);
                };
                const handleDragStart = (appId) => {
                    dragAppId.value = appId;
                };
                const handleDragEnd = () => {
                    dragAppId.value = null;
                };
                const handleDrop = (targetId) => {
                    if (!dragAppId.value || dragAppId.value === targetId) return;
                    const next = [...selectedAppIds.value];
                    const fromIndex = next.indexOf(dragAppId.value);
                    const toIndex = next.indexOf(targetId);
                    if (fromIndex === -1 || toIndex === -1) return;
                    next.splice(fromIndex, 1);
                    next.splice(toIndex, 0, dragAppId.value);
                    selectedAppIds.value = next;
                    dragAppId.value = null;
                };
                const loadAppSelection = () => {
                    try {
                        const stored = localStorage.getItem('rimo_workbench_apps');
                        if (stored) {
                            const parsed = JSON.parse(stored);
                            const ids = Array.isArray(parsed)
                                ? parsed.filter(id => allApps.value.some(app => app.id === id))
                                : [];
                            if (ids.length) {
                                selectedAppIds.value = ids.slice(0, maxSelectedApps);
                                return;
                            }
                        }
                    } catch (e) {
                        // ignore storage errors
                    }
                    selectedAppIds.value = getDefaultAppIds();
                };
                const saveAppSelection = () => {
                    localStorage.setItem('rimo_workbench_apps', JSON.stringify(selectedAppIds.value));
                    ElMessage.success('已保存配置');
                    settingDialogVisible.value = false;
                };
                const resetAppSelection = () => {
                    selectedAppIds.value = getDefaultAppIds();
                };

                const metrics = reactive({
                    todayTodo: 26,
                    rentalRate: 78.5,
                    inRentCount: 126,
                    totalFleet: 160,
                    monthRevenue: 85468000
                });
                const formattedRevenue = computed(() => {
                    return (metrics.monthRevenue / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 });
                });

                // P1-10: Announcements
                const announcements = ref([
                    {
                        id: 'announcement-20260310',
                        title: '端午節安全檢查提醒',
                        content: `爲保障端午節期間運營安全，請各門店在 3 月 15 日前完成以下檢查：
1. 輪胎磨損、胎壓及備胎完整性
2. 剎車系統、燈光、雨刷及油液狀態
3. 車內應急工具（反光背心、三角牌、急救包）齊備

檢查完成後請在系統中提交檢查記錄，未完成將影響節假日排班與車輛交付。`,
                        date: '2026-03-10',
                        publisher: '運營部',
                        ts: new Date('2026-03-10').getTime(),
                    },
                    {
                        id: 'announcement-20260308',
                        title: '端午期間訂單調價及排班公告',
                        content: `端午期間訂單將啓用節假日階梯價，同時門店排班需在 3 月 12 日前完成調整。
計費引擎將於本週五 02:00 ~ 04:00 升級，期間系統不影響下單但可能延遲同步。`,
                        date: '2026-03-08',
                        publisher: '技術部',
                        ts: new Date('2026-03-08').getTime(),
                    },
                    {
                        id: 'announcement-20260305',
                        title: '車輛出庫標準更新',
                        content: `爲提升交付體驗，車輛出庫標準更新如下：
1. 外觀無明顯污泥、劃痕需記錄
2. 內飾無異味，腳墊與中控區域清潔
3. 油量不低於 1/4，電車 SOC 不低於 50%`,
                        date: '2026-03-05',
                        publisher: '品控中心',
                        ts: new Date('2026-03-05').getTime(),
                    },
                    {
                        id: 'announcement-20260302',
                        title: '新客戶風控策略升級',
                        content: `風控策略升級已上線：
1. 首單押金校驗：未完成押金驗證訂單將被攔截
2. 證件一致性複覈：證件信息與下單人信息不一致需人工複覈
3. 高風險時間段訂單將觸發二次覈驗`,
                        date: '2026-03-02',
                        publisher: '風控中心',
                        ts: new Date('2026-03-02').getTime(),
                    },
                    {
                        id: 'announcement-20260227',
                        title: '計費引擎升級維護通知',
                        content: `計費引擎維護期間可能出現報表生成延遲，預計在 04:30 前恢復。
如遇異常，請聯繫技術支持。`,
                        date: '2026-02-27',
                        publisher: '技術部',
                        ts: new Date('2026-02-27').getTime(),
                    },
                    {
                        id: 'announcement-20260223',
                        title: '企業月結資格申請流程調整',
                        content: `企業月結資格申請新增風控評估，審批週期延長 1-2 個工作日。
門店需提前發起申請以避免影響簽約。`,
                        date: '2026-02-23',
                        publisher: '財務部',
                        ts: new Date('2026-02-23').getTime(),
                    },
                    {
                        id: 'announcement-20260218',
                        title: '門店庫存盤點指引',
                        content: `本月末將進行庫存盤點，請各門店按指引完成車輛與物料覈對。
盤點結果需在系統中提交，若有異常需附上說明。`,
                        date: '2026-02-18',
                        publisher: '運營部',
                        ts: new Date('2026-02-18').getTime(),
                    }
                ]);
                const filteredAnnouncements = computed(() => {
                    const keyword = announcementKeyword.value.trim().toLowerCase();
                    let list = announcements.value;
                    if (keyword) {
                        list = list.filter(item => {
                            const haystack = [item.title, item.content, item.publisher]
                                .filter(Boolean)
                                .join(' ')
                                .toLowerCase();
                            return haystack.includes(keyword);
                        });
                    }
                    return [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0));
                });
                const featuredAnnouncements = computed(() => {
                    return [...announcements.value]
                        .sort((a, b) => (b.ts || 0) - (a.ts || 0))
                        .slice(0, 3);
                });
                const getAnnouncementPreview = (item, maxLength = 60) => {
                    const text = (item.content || '').replace(/\s+/g, ' ').trim();
                    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
                };
                const openAnnouncementCenter = () => {
                    announcementDialogVisible.value = true;
                };
                const openAnnouncementDetail = (item) => {
                    if (!item) return;
                    activeAnnouncement.value = item;
                    announcementDialogVisible.value = false;
                    announcementDetailVisible.value = true;
                };

                // P1-6: Dynamic schedule date
                const today = new Date();
                const scheduleDate = computed(() => {
                    return `${today.getMonth() + 1}月${today.getDate()}日`;
                });
                const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];
                const weekDay = computed(() => '周' + weekDayNames[today.getDay()]);

                // P2-7: Banner carousel data
                const banners = ref([
                    {
                        title: '✨ 端午節運營錦囊已下發',
                        desc: '從端午期間的營銷策略、風控把控到違章處理，全方位提升門店營業額，查看"賺翻天"祕籍。',
                        btnText: '立即查看',
                        icon: 'Present',
                        gradient: 'from-[color:var(--app-color-primary)] to-[#008AC5]'
                    },
                    {
                        title: '🚀 v2.8 系統升級通知',
                        desc: '新增智能調價引擎與車輛 IoT 健康監控功能，將於本週五 02:00~04:00 進行不停機升級。',
                        btnText: '瞭解詳情',
                        icon: 'Monitor',
                        gradient: 'from-[color:var(--app-color-primary)] to-[color:var(--app-color-primary)]'
                    },
                    {
                        title: '🏆 上月之星：虹橋高鐵站店',
                        desc: '出租率 96.2%，客訴率 0.3%，創下全區門店最佳運營記錄！點擊查看其經驗分享。',
                        btnText: '查看覆盤',
                        icon: 'Trophy',
                        gradient: 'from-[#ea580c] to-[#f97316]'
                    }
                ]);

                // P2-9: Recent visits from localStorage
                const recentPages = ref([]);
                const loadRecentPages = () => {
                    try {
                        const stored = localStorage.getItem('rimo_recent_pages');
                        if (stored) {
                            recentPages.value = JSON.parse(stored).slice(0, 5);
                        } else {
                            recentPages.value = [
                                { href: 'corporates.html', name: '企業客戶管理' },
                                { href: 'official_vehicle_contracts.html', name: '公務用車合約' },
                                { href: 'store_orders.html', name: '門市租賃訂單' }
                            ];
                        }
                    } catch (e) {
                        recentPages.value = [
                            { href: 'corporates.html', name: '企業客戶管理' },
                            { href: 'store_orders.html', name: '門市租賃訂單' }
                        ];
                    }
                };

                onMounted(() => {
                    loadRecentPages();
                    loadAppSelection();
                });

                

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
    

.workbench .custom-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        .workbench .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
        }

        .workbench .custom-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }

        .workbench .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        .workbench .card-shadow {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(0, 0, 0, 0.02);
        }

        /* Element Plus Tabs Reset */
        .workbench .workbench-tabs .el-tabs__item {
            font-size: 14px;
            font-weight: 600;
            color: #64748b;
            padding: 0 16px;
        }

        .workbench .workbench-tabs .el-tabs__item.is-active {
            color: var(--app-color-primary);
        }

        .workbench .workbench-tabs .el-tabs__active-bar {
            background-color: var(--app-color-primary);
            height: 3px;
            border-radius: 2px;
        }

        .workbench .workbench-tabs .el-tabs__nav-wrap::after {
            height: 1px;
            background-color: #e2e8f0;
        }

        .workbench .todo-panel {
            max-height: 420px;
            overflow-y: auto;
            padding-right: 4px;
        }

        /* App Icons Gradients */
        .workbench .icon-blue {
            background: linear-gradient(135deg, var(--app-color-primary-light-9) 0%, #bae6fd 100%);
            color: #0284c7;
        }

        .workbench .icon-green {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            color: #16a34a;
        }

        .workbench .icon-purple {
            background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
            color: var(--app-color-primary);
        }

        .workbench .icon-orange {
            background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
            color: #ea580c;
        }

        .workbench .icon-teal {
            background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
            color: #0d9488;
        }

        .workbench .icon-rose {
            background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%);
            color: #e11d48;
        }

        .workbench .icon-indigo {
            background: linear-gradient(135deg, var(--app-color-primary-light-8) 0%, var(--app-color-primary-light-7) 100%);
            color: var(--app-color-primary);
        }

        .workbench .latest-announcement-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 20px 20px 18px;
        }

        .workbench .latest-announcement-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            cursor: pointer;
        }

        .workbench .latest-announcement-item+.latest-announcement-item {
            margin-top: 22px;
        }

        .workbench .latest-announcement-dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: #d1d5db;
            margin-top: 9px;
            flex-shrink: 0;
        }

        .workbench .latest-announcement-item.is-primary .latest-announcement-dot {
            background: #f16d6d;
            box-shadow: 0 0 0 4px rgba(241, 109, 109, 0.12);
        }

        .workbench .latest-announcement-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.5;
        }

        .workbench .latest-announcement-summary {
            margin-top: 6px;
            font-size: 12px;
            color: #8c97a8;
            line-height: 1.7;
        }

        .workbench .latest-announcement-meta {
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            font-size: 12px;
            color: #97a3b4;
        }

        .workbench .latest-announcement-badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 6px;
            border-radius: 6px;
            border: 1px solid #cfe4f3;
            background: #edf6fc;
            color: var(--app-color-primary);
            font-size: 12px;
            line-height: 1;
        }

        /* Announcement Dialog */
        .announcement-dialog .el-dialog,
        .announcement-detail-dialog .el-dialog {
            border-radius: 16px;
            overflow: hidden;
        }

        .announcement-dialog .el-dialog__header,
        .announcement-detail-dialog .el-dialog__header {
            padding: 0;
        }

        .announcement-dialog .el-dialog__body,
        .announcement-detail-dialog .el-dialog__body {
            padding: 16px;
            background: #f8fafc;
        }

        .workbench .announcement-dialog-header {
            background: #ffffff;
            padding: 14px 18px;
            border-bottom: 1px solid #e5e7eb;
        }

        .workbench .announcement-dialog-title {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            line-height: 1.4;
        }

        .workbench .announcement-dialog-sub {
            margin-top: 4px;
            font-size: 12px;
            color: #6b7280;
        }

        .workbench .announcement-search-wrap {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 10px 12px;
            margin-bottom: 12px;
        }

        .workbench .announcement-list-wrap {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            max-height: 480px;
            overflow-y: auto;
            padding: 12px;
        }

        .workbench .announcement-list-item {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #ffffff;
            padding: 12px 14px;
            cursor: pointer;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .workbench .announcement-list-item+.announcement-list-item {
            margin-top: 10px;
        }

        .workbench .announcement-list-item:hover {
            border-color: #cfdce8;
            box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
        }

        .workbench .announcement-list-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.5;
        }

        .workbench .announcement-list-summary {
            margin-top: 6px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.7;
        }

        .workbench .announcement-list-meta {
            margin-top: 8px;
            font-size: 12px;
            color: #94a3b8;
        }

        .workbench .announcement-empty {
            min-height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            padding: 16px;
        }

        .workbench .announcement-detail-content-box {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
        }

        .workbench .announcement-detail-meta {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #dbe5ec;
        }

        .workbench .announcement-detail-content {
            font-size: 14px;
            color: #475569;
            line-height: 1.9;
            white-space: pre-line;
        }
    
      /* 窄屏內容降級：分頁收起跳頁輸入；寬表格由 el-table 在面板內自行橫向滾動。 */
      @media (max-width: 1080px) {
        .el-pagination .el-pagination__jump {
          display: none;
        }
      }
    
</style>
