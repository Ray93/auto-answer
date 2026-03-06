/**
 * 配置管理模块
 * 集中管理环境变量和 API 配置
 */

/**
 * 环境变量验证错误
 */
class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * 验证必需的环境变量
 * @param key 环境变量名称
 * @returns 环境变量值
 * @throws ConfigError 如果环境变量未设置
 */
function validateEnv(key: string): string {
  const value = Bun.env[key];
  if (!value) {
    throw new ConfigError(`缺少必需的环境变量: ${key}`);
  }
  return value;
}

/**
 * 获取可选的环境变量
 * @param key 环境变量名称
 * @param defaultValue 默认值
 * @returns 环境变量值或默认值
 */
function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return Bun.env[key] ?? defaultValue;
}

/**
 * API 配置接口
 */
interface APIConfig {
  /** API 基础 URL */
  baseUrl: string;
  /** 请求超时时间（毫秒） */
  timeout: number;
  /** 重试次数 */
  retryAttempts: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
}

/**
 * 认证凭据接口
 */
interface Credentials {
  /** 账号 */
  account: string;
  /** 密码 */
  password: string;
  /** AES 密钥（Base64 编码） */
  key: string;
  /** AES 初始向量 */
  iv: string;
}

/**
 * 通知配置接口
 */
interface NotificationConfig {
  /** Telegram Bot Token */
  botToken?: string;
  /** Telegram Chat ID */
  chatId?: string;
}

/**
 * 应用配置接口
 */
interface AppConfig {
  /** 时区 */
  timezone: string;
  /** 指定日期（可选） */
  date?: string;
  /** API 配置 */
  api: APIConfig;
  /** 认证凭据 */
  credentials: Credentials;
  /** 通知配置 */
  notification: NotificationConfig;
}

/**
 * 应用配置对象
 */
export const config: AppConfig = {
  timezone: 'Asia/Shanghai',
  date: getOptionalEnv('DATE'),
  
  api: {
    baseUrl: 'https://www.questiontest.cn:5988',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  credentials: {
    account: validateEnv('ACCOUNT'),
    password: validateEnv('PASSWORD'),
    key: validateEnv('KEY'),
    iv: validateEnv('IV'),
  },
  
  notification: {
    botToken: getOptionalEnv('TELEGRAM_BOT_TOKEN'),
    chatId: getOptionalEnv('TELEGRAM_CHAT_ID'),
  },
};

/**
 * API 端点枚举
 */
export enum APIEndpoint {
  /** 登录 */
  LOGIN = '/PCapi/user/login',
  /** 查询每日题目 */
  QUERY_DAILY_QUESTIONS = '/PCapi/practiceTask/queryDailyQuestions',
  /** 提交答案 */
  COMMIT_ANSWER = '/clientapi/dailyQuestions/commitAnswer',
  /** 题目统计 */
  QUESTION_STATISTIC = '/clientapi/dailyQuestions/questionStatic',
}

/**
 * 构建完整的 API URL
 * @param endpoint API 端点
 * @param params 查询参数（可选）
 * @returns 完整的 URL
 */
export function buildAPIUrl(endpoint: APIEndpoint, params?: Record<string, string>): string {
  const url = `${config.api.baseUrl}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    return `${url}?${queryString}`;
  }
  return url;
}