import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import type {
  AnswerDateResult,
  AnswerParam,
  CommonRes,
  DailyQuestionResult,
  LoginResult,
  QuestionStaticResult,
} from "@/lib/types";

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE_URL = "https://www.questiontest.cn:5988";
const TZ = "Asia/Shanghai";

const ENDPOINTS = {
  login: "/PCapi/user/login",
  queryDailyQuestions: "/PCapi/practiceTask/queryDailyQuestions",
  commitAnswer: "/clientapi/dailyQuestions/commitAnswer",
  questionStatistic: "/clientapi/dailyQuestions/questionStatic",
} as const;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`缺少环境变量: ${name}`);
  }
  return value;
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function requestUpstream<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`上游请求失败: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as CommonRes<T>;
  if (payload.code !== 200) {
    throw new Error(payload.msg || "上游接口返回错误");
  }

  return payload.data;
}

function encryptCredential(raw: string): string {
  const keyBase64 = getEnv("KEY");
  const iv = getEnv("IV");
  const keyUtf8 = Buffer.from(keyBase64, "base64").toString("utf-8");

  const plain = CryptoJS.enc.Utf8.parse(raw);
  const key = CryptoJS.enc.Utf8.parse(keyUtf8);
  const vector = CryptoJS.enc.Utf8.parse(iv);
  const encrypted = CryptoJS.AES.encrypt(plain, key, {
    iv: vector,
    mode: CryptoJS.mode.CBC,
  });

  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

function normalizeAnswer(answer: string[]): string[] {
  return answer.map((item) => (item.includes("//") ? item.split("//")[0] : item));
}

function normalizeMonth(month: string): string {
  const parsed = dayjs.tz(`${month}-01`, TZ);
  if (!parsed.isValid()) {
    throw new Error("月份格式错误，需为 YYYY-MM");
  }
  return parsed.format("YYYY-MM");
}

export async function loginAndGetToken(account: string, password: string): Promise<string> {
  const data = await requestUpstream<LoginResult>(ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      account: encryptCredential(account),
      password: encryptCredential(password),
    }),
  });

  const token = data.userInfo?.token;
  if (!token) {
    throw new Error("登录失败，未获取到 token");
  }

  return token;
}

export async function getMonthStats(token: string, month: string): Promise<{
  month: string;
  startDate: string;
  endDate: string;
  questionStaticList: QuestionStaticResult["questionStaticList"];
}> {
  const safeMonth = normalizeMonth(month);
  const monthStart = dayjs.tz(`${safeMonth}-01`, TZ).startOf("month");
  const monthEnd = monthStart.endOf("month").startOf("day");
  const today = dayjs().tz(TZ).startOf("day");
  const effectiveEnd = monthEnd.isAfter(today) ? today : monthEnd;

  if (monthStart.isAfter(today)) {
    return {
      month: safeMonth,
      startDate: monthStart.format("YYYY-MM-DD"),
      endDate: effectiveEnd.format("YYYY-MM-DD"),
      questionStaticList: [],
    };
  }

  const startDate = monthStart.format("YYYY-MM-DD");
  const endDate = effectiveEnd.format("YYYY-MM-DD");

  const data = await requestUpstream<QuestionStaticResult>(
    `${ENDPOINTS.questionStatistic}?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: { Authorization: token },
      method: "GET",
    },
  );

  const filtered = data.questionStaticList.filter((item) => {
    return item.dateStr >= startDate && item.dateStr <= endDate;
  });

  return {
    month: safeMonth,
    startDate,
    endDate,
    questionStaticList: filtered,
  };
}

async function getQuestionByDate(token: string, date: string): Promise<{
  questionId: number;
  rightAnswer: string[];
}> {
  const data = await requestUpstream<DailyQuestionResult>(
    `${ENDPOINTS.queryDailyQuestions}?queryDate=${date}`,
    {
      headers: { Authorization: token },
    },
  );

  const firstQuestion = data.questionOptions?.[0];
  if (!firstQuestion) {
    throw new Error(`无法获取 ${date} 的题目`);
  }

  return {
    questionId: firstQuestion.questionId,
    rightAnswer: firstQuestion.rightAnswer,
  };
}

async function commitAnswer(token: string, payload: AnswerParam): Promise<void> {
  await requestUpstream<unknown>(ENDPOINTS.commitAnswer, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function submitAnswerForDate(token: string, date: string): Promise<void> {
  const question = await getQuestionByDate(token, date);
  await commitAnswer(token, {
    questionId: question.questionId,
    queryTime: date,
    questionAnswer: normalizeAnswer(question.rightAnswer),
  });
}

export async function answerDateWithCheck(token: string, date: string): Promise<AnswerDateResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !dayjs(date).isValid()) {
    throw new Error("日期格式错误，需为 YYYY-MM-DD");
  }

  const data = await requestUpstream<QuestionStaticResult>(
    `${ENDPOINTS.questionStatistic}?startDate=${date}&endDate=${date}`,
    {
      headers: { Authorization: token },
    },
  );

  const record = data.questionStaticList[0];
  if (!record) {
    throw new Error(`未查询到 ${date} 的统计数据`);
  }

  if (record.holiday) {
    return { date, status: "holiday" };
  }

  if (record.correctNum > 0) {
    return { date, status: "already_answered" };
  }

  await submitAnswerForDate(token, date);
  return { date, status: "answered" };
}

export async function answerMonth(token: string, month: string): Promise<{
  month: string;
  attemptedDates: string[];
  successDates: string[];
  failedDates: { date: string; reason: string }[];
}> {
  const stats = await getMonthStats(token, month);
  const pendingDates = stats.questionStaticList
    .filter((item) => item.correctNum === 0 && !item.holiday)
    .map((item) => item.dateStr);

  const successDates: string[] = [];
  const failedDates: { date: string; reason: string }[] = [];

  for (const date of pendingDates) {
    try {
      await submitAnswerForDate(token, date);
      successDates.push(date);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "未知错误";
      failedDates.push({ date, reason });
    }
  }

  return {
    month: stats.month,
    attemptedDates: pendingDates,
    successDates,
    failedDates,
  };
}
