import { customfetch, encryption } from "../utils/utils";

const loginInfo = { account: Bun.env.ACCOUNT as string, password: Bun.env.PASSWORD as string };

async function login() {
  const { account, password } = loginInfo;
  const encry_username = encryption(account);
  const encry_password = encryption(password);

  const data = await customfetch<LoginResult>(`https://www.questiontest.cn:5988/PCapi/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: encry_username, password: encry_password }),
  });
  globalThis.authToken = data?.userInfo?.token as string;
}

async function getQuestionByDay(date: string) {
  const data = await customfetch<DailyQuestionResult>(
    `https://www.questiontest.cn:5988/PCapi/practiceTask/queryDailyQuestions?queryDate=${date}`,
    { headers: { Authorization: globalThis.authToken } }
  );
  const { rightAnswer, questionId } = data?.questionOptions[0] as DailyQuestion;
  return { queryTime: date, questionId, questionAnswer: rightAnswer };
}

async function commitAnswer(answerParam: AnswerParam) {
  if (answerParam.questionAnswer.some((answer) => answer.includes("//"))) {
    answerParam.questionAnswer = answerParam.questionAnswer.map((answer) =>
      answer.includes("//") ? answer.split("//")[0] : answer
    );
  }

  const data = await customfetch<any>(`https://www.questiontest.cn:5988/clientapi/dailyQuestions/commitAnswer`, {
    method: "POST",
    headers: { Authorization: globalThis.authToken, "Content-Type": "application/json" },
    body: JSON.stringify(answerParam),
  });
  console.log(data);
}

async function checkComplete(date: string) {
  const data = await customfetch<questionStaticResult>(
    `https://www.questiontest.cn:5988/clientapi/dailyQuestions/questionStatic?startDate=${date}&endDate=${date}`,
    { headers: { Authorization: globalThis.authToken } }
  );
  return data.questionStaticList[0];
}

/** 获取未完成日期 */
async function getUnCompletDates(startDate: string, endDate: string) {
  const data = await customfetch<questionStaticResult>(
    `https://www.questiontest.cn:5988/clientapi/dailyQuestions/questionStatic?startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: globalThis.authToken } }
  );
  return data?.questionStaticList.filter((item) => item.correctNum === 0 && !item.holiday).map((item) => item.dateStr);
}

export { login, getQuestionByDay, commitAnswer, checkComplete, getUnCompletDates };
