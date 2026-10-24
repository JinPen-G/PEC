import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import zhTw from 'element-plus/es/locale/lang/zh-tw.mjs';
import Comp from './order-detail-5sukyo.vue';
createApp(Comp).use(ElementPlus, { locale: zhTw }).mount('#app');
