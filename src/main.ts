import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./filters/date-filter";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";
Vue.component("VueSlider", VueSlider);

//
import InfiniteLoading from "vue-infinite-loading";
Vue.use(InfiniteLoading);

//
import dayjs from "dayjs";
import { authService } from "./services/auth-service";
dayjs.locale("ja");

// Initialize Firebase
authService.initFirebase();

Vue.config.productionTip = false;

// 画面リサイズ無効
document.addEventListener(
  "touchstart",
  (event: any) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  {
    passive: false,
  }
);

// ダブルタップで拡大無効
document.addEventListener(
  "dblclick",
  function (e) {
    e.preventDefault();
  },
  { passive: false }
);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
