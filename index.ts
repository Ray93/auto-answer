import dayjs from "dayjs";
import { checkComplete, commitAnswer, getQuestionByDay } from "./api/api";
import { log, logError } from "./utils/logger";
import { config } from "./config/config";
import { initializeApp } from "./utils/init";
import { ConfigError } from "./errors/errors";

const today = config.date || dayjs().format("YYYY-MM-DD");

try {
  await initializeApp();

  console.log("登录成功")

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
} catch (error) {
  if (error instanceof ConfigError) {
    logError(`配置错误: ${error.message}`);
    process.exit(1);
  }
  logError(`执行失败: ${error instanceof Error ? error.message : String(error)}`, error);
  throw error;
}
