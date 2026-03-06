import dayjs from "dayjs";
import { commitAnswer, getQuestionByDay, getUnCompletDates } from "./api/api";
import { log, logError } from "./utils/logger";
import { config } from "./config/config";
import { initializeApp } from "./utils/init";
import { ConfigError } from "./errors/errors";

const startDay = dayjs().startOf("month").format("YYYY-MM-DD");
const endDay = dayjs().format("YYYY-MM-DD");

try {
  await initializeApp();

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
} catch (error) {
  if (error instanceof ConfigError) {
    logError(`配置错误: ${error.message}`);
    process.exit(1);
  }
  logError(`执行失败: ${error instanceof Error ? error.message : String(error)}`, error);
  throw error;
}
