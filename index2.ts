import dayjs from "dayjs";
import { commitAnswer, getQuestionByDay, getUnCompletDates, login } from "./api/api";
import { log } from "./utils/utils";

Bun.env.TZ = "Asia/Shanghai";

const startDay = dayjs().startOf("month").format("YYYY-MM-DD");
const endDay = dayjs().format("YYYY-MM-DD");

await login();

const days = (await getUnCompletDates(startDay, endDay)) ?? [];

if (days.length) {
  log(`需要补学的日期 ${days.join(",")}`);
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const answer = await getQuestionByDay(day);
    await commitAnswer(answer);
  }
  log("本月补答完成");
} else {
  log("没有需要补学的题目，执行完成");
}
