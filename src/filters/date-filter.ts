import Vue from "vue";
import dayjs from "dayjs";

Vue.filter("date", (date: string) => {
  const d = dayjs(date);
  return d.format("YYYY/MM/DD");
});
