import dayjs from "dayjs";
import { checkComplete, commitAnswer, getQuestionByDay, login } from "./api/api";
import { log } from "./utils/utils";

Bun.env.TZ = "Asia/Shanghai";

const today = Bun.env.DATE || dayjs().format("YYYY-MM-DD");

await login();

const staticInfo = await checkComplete(today);

if (staticInfo.holiday) {
  log("今天是休息日，跳过答题");
} else if (staticInfo.correctNum === 1) {
  log("当日已答题，跳过答题");
} else {
  const answer = await getQuestionByDay(today);
  await commitAnswer(answer);
  log("答题完成");
}
