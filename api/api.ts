import { customfetch } from "../utils/http";
import { encryption } from "../utils/utils";
import { config, buildAPIUrl, APIEndpoint } from "../config/config";
import { 
  isDailyQuestionResult, 
  isQuestionStaticResult
} from "../types/guards";

async function login() {
  const { account, password } = config.credentials;
  const encry_username = encryption(account);
  const encry_password = encryption(password);

  const data = await customfetch<LoginResult>(buildAPIUrl(APIEndpoint.LOGIN), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: encry_username, password: encry_password }),
  });
  
  if (!data || !data.userInfo || !data.userInfo.token) {
    throw new Error("登录失败：无法获取认证令牌");
  }
  
  globalThis.authToken = data.userInfo.token;
}

async function getQuestionByDay(date: string) {
  const data = await customfetch<DailyQuestionResult>(
    buildAPIUrl(APIEndpoint.QUERY_DAILY_QUESTIONS, { queryDate: date }),
    { headers: { Authorization: globalThis.authToken } }
  );
  
  if (!data || !isDailyQuestionResult(data)) {
    throw new Error(`无法获取题目数据: ${date}`);
  }
  
  const { rightAnswer, questionId } = data.questionOptions[0];
  return { queryTime: date, questionId, questionAnswer: rightAnswer };
}

async function commitAnswer(answerParam: AnswerParam) {
  if (answerParam.questionAnswer.some((answer) => answer.includes("//"))) {
    answerParam.questionAnswer = answerParam.questionAnswer.map((answer) =>
      answer.includes("//") ? answer.split("//")[0] : answer
    );
  }

  await customfetch<unknown>(
    buildAPIUrl(APIEndpoint.COMMIT_ANSWER),
    {
      method: "POST",
      headers: { Authorization: globalThis.authToken, "Content-Type": "application/json" },
      body: JSON.stringify(answerParam),
    }
  );
}

async function checkComplete(date: string) {
  const data = await customfetch<questionStaticResult>(
    buildAPIUrl(APIEndpoint.QUESTION_STATISTIC, { startDate: date, endDate: date }),
    { headers: { Authorization: globalThis.authToken } }
  );
  
  if (!data || !isQuestionStaticResult(data) || data.questionStaticList.length === 0) {
    throw new Error(`无法获取题目统计: ${date}`);
  }
  
  return data.questionStaticList[0];
}

/** 获取未完成日期 */
async function getUnCompletDates(startDate: string, endDate: string) {
  const data = await customfetch<questionStaticResult>(
    buildAPIUrl(APIEndpoint.QUESTION_STATISTIC, { startDate, endDate }),
    { headers: { Authorization: globalThis.authToken } }
  );
  
  if (!data || !isQuestionStaticResult(data)) {
    throw new Error(`无法获取题目统计: ${startDate} - ${endDate}`);
  }
  
  return data.questionStaticList
    .filter((item) => item.correctNum === 0 && !item.holiday)
    .map((item) => item.dateStr);
}

export { login, getQuestionByDay, commitAnswer, checkComplete, getUnCompletDates };
